from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User, SubscriptionTier
from app.models.scan import Scan, ScanType, ScanStatus
from app.services.credit_service import calculate_credits_needed, deduct_credits
from app.services.ml_service import ml_service
from app.routers.api_keys import get_user_by_api_key
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/batch", tags=["Batch Processing"])


class BatchTextItem(BaseModel):
    text: str
    id: Optional[str] = None  # Optional client-provided ID for tracking


class BatchRequest(BaseModel):
    items: List[BatchTextItem]


class BatchResultItem(BaseModel):
    id: Optional[str]
    success: bool
    result: Optional[dict] = None
    error: Optional[str] = None
    credits_used: int = 0


class BatchResponse(BaseModel):
    total_items: int
    successful: int
    failed: int
    total_credits_used: int
    results: List[BatchResultItem]


def check_batch_access(user: User):
    """Check if user has batch processing access (Pro or Enterprise tier)."""
    allowed_tiers = [SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE]
    if user.subscription_tier not in allowed_tiers:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Batch processing requires Pro or Enterprise subscription. Please upgrade your plan."
        )


def get_batch_limit(user: User) -> int:
    """Get maximum batch size based on subscription tier."""
    if user.subscription_tier == SubscriptionTier.ENTERPRISE:
        return 100
    elif user.subscription_tier == SubscriptionTier.PRO:
        return 50
    return 0


async def get_current_user_or_api_key(
    authorization: Optional[str] = Header(None),
    current_user: Optional[User] = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> User:
    """Get user from either JWT token or API key."""
    # Check for API key in Authorization header
    if authorization and authorization.startswith("Bearer ts_"):
        api_key = authorization.replace("Bearer ", "")
        return await get_user_by_api_key(api_key, db)
    
    # Fall back to JWT authentication
    if current_user:
        return current_user
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required"
    )


@router.post("/detect", response_model=BatchResponse)
async def batch_detect_ai(
    batch_data: BatchRequest,
    authorization: Optional[str] = Header(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Batch AI detection. Requires Pro or Enterprise subscription."""
    # Get user (supports both JWT and API key)
    user = current_user
    if authorization and authorization.startswith("Bearer ts_"):
        api_key = authorization.replace("Bearer ", "")
        user = await get_user_by_api_key(api_key, db)
    
    check_batch_access(user)
    
    batch_limit = get_batch_limit(user)
    if len(batch_data.items) > batch_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch size exceeds limit of {batch_limit} items for your plan"
        )
    
    # Calculate total credits needed
    total_credits = sum(
        calculate_credits_needed(item.text, "ai_detection")
        for item in batch_data.items
    )
    
    if not user.has_enough_credits(total_credits):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Need {total_credits}, have {user.credits_balance}"
        )
    
    results = []
    successful = 0
    failed = 0
    total_credits_used = 0
    
    for item in batch_data.items:
        try:
            credits_needed = calculate_credits_needed(item.text, "ai_detection")
            
            # Create scan record
            scan = Scan(
                user_id=user.id,
                scan_type=ScanType.AI_DETECTION,
                input_text=item.text,
                input_length=len(item.text),
                credits_used=credits_needed,
                status=ScanStatus.PROCESSING
            )
            db.add(scan)
            db.commit()
            
            # Process
            result = ml_service.detect_ai(item.text)
            scan.ai_probability = result["ai_probability"]
            scan.confidence_level = result["confidence_level"]
            scan.results = result
            scan.status = ScanStatus.COMPLETED
            scan.completed_at = datetime.utcnow()
            
            # Deduct credits
            deduct_credits(db, user, credits_needed, f"Batch AI Detection #{scan.id}", str(scan.id))
            
            db.commit()
            
            results.append(BatchResultItem(
                id=item.id,
                success=True,
                result=result,
                credits_used=credits_needed
            ))
            successful += 1
            total_credits_used += credits_needed
            
        except Exception as e:
            logger.error(f"Batch detect error for item {item.id}: {str(e)}")
            results.append(BatchResultItem(
                id=item.id,
                success=False,
                error=str(e)
            ))
            failed += 1
    
    return BatchResponse(
        total_items=len(batch_data.items),
        successful=successful,
        failed=failed,
        total_credits_used=total_credits_used,
        results=results
    )


@router.post("/humanize", response_model=BatchResponse)
async def batch_humanize(
    batch_data: BatchRequest,
    authorization: Optional[str] = Header(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Batch text humanization. Requires Pro or Enterprise subscription."""
    user = current_user
    if authorization and authorization.startswith("Bearer ts_"):
        api_key = authorization.replace("Bearer ", "")
        user = await get_user_by_api_key(api_key, db)
    
    check_batch_access(user)
    
    batch_limit = get_batch_limit(user)
    if len(batch_data.items) > batch_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch size exceeds limit of {batch_limit} items for your plan"
        )
    
    total_credits = sum(
        calculate_credits_needed(item.text, "humanize")
        for item in batch_data.items
    )
    
    if not user.has_enough_credits(total_credits):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Need {total_credits}, have {user.credits_balance}"
        )
    
    results = []
    successful = 0
    failed = 0
    total_credits_used = 0
    
    for item in batch_data.items:
        try:
            credits_needed = calculate_credits_needed(item.text, "humanize")
            
            scan = Scan(
                user_id=user.id,
                scan_type=ScanType.HUMANIZE,
                input_text=item.text,
                input_length=len(item.text),
                credits_used=credits_needed,
                status=ScanStatus.PROCESSING
            )
            db.add(scan)
            db.commit()
            
            result = ml_service.humanize(item.text)
            scan.output_text = result["humanized_text"]
            scan.results = result
            scan.status = ScanStatus.COMPLETED
            scan.completed_at = datetime.utcnow()
            
            deduct_credits(db, user, credits_needed, f"Batch Humanize #{scan.id}", str(scan.id))
            
            db.commit()
            
            results.append(BatchResultItem(
                id=item.id,
                success=True,
                result=result,
                credits_used=credits_needed
            ))
            successful += 1
            total_credits_used += credits_needed
            
        except Exception as e:
            logger.error(f"Batch humanize error for item {item.id}: {str(e)}")
            results.append(BatchResultItem(
                id=item.id,
                success=False,
                error=str(e)
            ))
            failed += 1
    
    return BatchResponse(
        total_items=len(batch_data.items),
        successful=successful,
        failed=failed,
        total_credits_used=total_credits_used,
        results=results
    )


@router.post("/plagiarism", response_model=BatchResponse)
async def batch_plagiarism(
    batch_data: BatchRequest,
    authorization: Optional[str] = Header(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Batch plagiarism check. Requires Pro or Enterprise subscription."""
    user = current_user
    if authorization and authorization.startswith("Bearer ts_"):
        api_key = authorization.replace("Bearer ", "")
        user = await get_user_by_api_key(api_key, db)
    
    check_batch_access(user)
    
    batch_limit = get_batch_limit(user)
    if len(batch_data.items) > batch_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch size exceeds limit of {batch_limit} items for your plan"
        )
    
    total_credits = sum(
        calculate_credits_needed(item.text, "plagiarism")
        for item in batch_data.items
    )
    
    if not user.has_enough_credits(total_credits):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Need {total_credits}, have {user.credits_balance}"
        )
    
    results = []
    successful = 0
    failed = 0
    total_credits_used = 0
    
    for item in batch_data.items:
        try:
            credits_needed = calculate_credits_needed(item.text, "plagiarism")
            
            scan = Scan(
                user_id=user.id,
                scan_type=ScanType.PLAGIARISM,
                input_text=item.text,
                input_length=len(item.text),
                credits_used=credits_needed,
                status=ScanStatus.PROCESSING
            )
            db.add(scan)
            db.commit()
            
            result = ml_service.check_plagiarism(item.text)
            scan.plagiarism_score = result["plagiarism_score"]
            scan.sources_found = result["sources_found"]
            scan.results = result
            scan.status = ScanStatus.COMPLETED
            scan.completed_at = datetime.utcnow()
            
            deduct_credits(db, user, credits_needed, f"Batch Plagiarism #{scan.id}", str(scan.id))
            
            db.commit()
            
            results.append(BatchResultItem(
                id=item.id,
                success=True,
                result=result,
                credits_used=credits_needed
            ))
            successful += 1
            total_credits_used += credits_needed
            
        except Exception as e:
            logger.error(f"Batch plagiarism error for item {item.id}: {str(e)}")
            results.append(BatchResultItem(
                id=item.id,
                success=False,
                error=str(e)
            ))
            failed += 1
    
    return BatchResponse(
        total_items=len(batch_data.items),
        successful=successful,
        failed=failed,
        total_credits_used=total_credits_used,
        results=results
    )
