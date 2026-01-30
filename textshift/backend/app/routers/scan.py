from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User, SubscriptionTier
from app.models.scan import Scan, ScanType, ScanStatus
from app.schemas.scan import ScanCreate, ScanResponse, ScanListResponse
from app.services.credit_service import calculate_credits_needed, deduct_credits
from app.services.ml_service import ml_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scan", tags=["Scanning"])


def get_priority_for_tier(tier: SubscriptionTier) -> int:
    """Get processing priority based on subscription tier.
    Higher number = higher priority (processed first).
    """
    priority_map = {
        SubscriptionTier.FREE: 0,
        SubscriptionTier.STARTER: 1,
        SubscriptionTier.PRO: 2,
        SubscriptionTier.ENTERPRISE: 3
    }
    return priority_map.get(tier, 0)


def process_scan(scan_id: int, db: Session):
    """Background task to process a scan."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        return
    
    try:
        scan.status = ScanStatus.PROCESSING
        db.commit()
        
        if scan.scan_type == ScanType.AI_DETECTION:
            result = ml_service.detect_ai(scan.input_text)
            scan.ai_probability = result["ai_probability"]
            scan.confidence_level = result["confidence_level"]
            scan.results = result
            
        elif scan.scan_type == ScanType.HUMANIZE:
            result = ml_service.humanize(scan.input_text)
            scan.output_text = result["humanized_text"]
            scan.results = result
            
        elif scan.scan_type == ScanType.PLAGIARISM:
            result = ml_service.check_plagiarism(scan.input_text)
            scan.plagiarism_score = result["plagiarism_score"]
            scan.sources_found = result["sources_found"]
            scan.results = result
        
        scan.status = ScanStatus.COMPLETED
        scan.completed_at = datetime.utcnow()
        
    except Exception as e:
        logger.error(f"Error processing scan {scan_id}: {str(e)}")
        scan.status = ScanStatus.FAILED
        scan.error_message = str(e)
    
    db.commit()


@router.post("/detect", response_model=ScanResponse)
async def detect_ai(
    scan_data: ScanCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Detect if text is AI-generated."""
    if scan_data.scan_type != ScanType.AI_DETECTION:
        scan_data.scan_type = ScanType.AI_DETECTION
    
    # Calculate credits needed
    credits_needed = calculate_credits_needed(scan_data.text, "ai_detection")
    
    # Check if user has enough credits
    if not current_user.has_enough_credits(credits_needed):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Need {credits_needed}, have {current_user.credits_balance}"
        )
    
    # Get priority based on subscription tier
    priority = get_priority_for_tier(current_user.subscription_tier)
    
    # Create scan record
    scan = Scan(
        user_id=current_user.id,
        scan_type=ScanType.AI_DETECTION,
        input_text=scan_data.text,
        input_length=len(scan_data.text),
        credits_used=credits_needed,
        priority=priority,
        status=ScanStatus.PENDING
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Deduct credits
    deduct_credits(
        db, current_user, credits_needed,
        f"AI Detection scan #{scan.id}",
        str(scan.id)
    )
    
    # Process scan (synchronously for now, can be async later)
    try:
        scan.status = ScanStatus.PROCESSING
        db.commit()
        
        result = ml_service.detect_ai(scan.input_text)
        scan.ai_probability = result["ai_probability"]
        scan.confidence_level = result["confidence_level"]
        scan.results = result
        scan.status = ScanStatus.COMPLETED
        scan.completed_at = datetime.utcnow()
        
    except Exception as e:
        logger.error(f"Error processing scan {scan.id}: {str(e)}")
        scan.status = ScanStatus.FAILED
        scan.error_message = str(e)
    
    db.commit()
    db.refresh(scan)
    
    return ScanResponse.model_validate(scan)


@router.post("/humanize", response_model=ScanResponse)
async def humanize_text(
    scan_data: ScanCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Humanize AI-generated text."""
    if scan_data.scan_type != ScanType.HUMANIZE:
        scan_data.scan_type = ScanType.HUMANIZE
    
    # Calculate credits needed
    credits_needed = calculate_credits_needed(scan_data.text, "humanize")
    
    # Check if user has enough credits
    if not current_user.has_enough_credits(credits_needed):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Need {credits_needed}, have {current_user.credits_balance}"
        )
    
    # Get priority based on subscription tier
    priority = get_priority_for_tier(current_user.subscription_tier)
    
    # Create scan record
    scan = Scan(
        user_id=current_user.id,
        scan_type=ScanType.HUMANIZE,
        input_text=scan_data.text,
        input_length=len(scan_data.text),
        credits_used=credits_needed,
        priority=priority,
        status=ScanStatus.PENDING
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Deduct credits
    deduct_credits(
        db, current_user, credits_needed,
        f"Humanize scan #{scan.id}",
        str(scan.id)
    )
    
    # Process scan
    try:
        scan.status = ScanStatus.PROCESSING
        db.commit()
        
        result = ml_service.humanize(scan.input_text)
        scan.output_text = result["humanized_text"]
        scan.results = result
        scan.status = ScanStatus.COMPLETED
        scan.completed_at = datetime.utcnow()
        
    except Exception as e:
        logger.error(f"Error processing scan {scan.id}: {str(e)}")
        scan.status = ScanStatus.FAILED
        scan.error_message = str(e)
    
    db.commit()
    db.refresh(scan)
    
    return ScanResponse.model_validate(scan)


@router.post("/plagiarism", response_model=ScanResponse)
async def check_plagiarism(
    scan_data: ScanCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check text for plagiarism."""
    if scan_data.scan_type != ScanType.PLAGIARISM:
        scan_data.scan_type = ScanType.PLAGIARISM
    
    # Calculate credits needed
    credits_needed = calculate_credits_needed(scan_data.text, "plagiarism")
    
    # Check if user has enough credits
    if not current_user.has_enough_credits(credits_needed):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Need {credits_needed}, have {current_user.credits_balance}"
        )
    
    # Get priority based on subscription tier
    priority = get_priority_for_tier(current_user.subscription_tier)
    
    # Create scan record
    scan = Scan(
        user_id=current_user.id,
        scan_type=ScanType.PLAGIARISM,
        input_text=scan_data.text,
        input_length=len(scan_data.text),
        credits_used=credits_needed,
        priority=priority,
        status=ScanStatus.PENDING
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Deduct credits
    deduct_credits(
        db, current_user, credits_needed,
        f"Plagiarism scan #{scan.id}",
        str(scan.id)
    )
    
    # Process scan
    try:
        scan.status = ScanStatus.PROCESSING
        db.commit()
        
        result = ml_service.check_plagiarism(scan.input_text)
        scan.plagiarism_score = result["plagiarism_score"]
        scan.sources_found = result["sources_found"]
        scan.results = result
        scan.status = ScanStatus.COMPLETED
        scan.completed_at = datetime.utcnow()
        
    except Exception as e:
        logger.error(f"Error processing scan {scan.id}: {str(e)}")
        scan.status = ScanStatus.FAILED
        scan.error_message = str(e)
    
    db.commit()
    db.refresh(scan)
    
    return ScanResponse.model_validate(scan)


@router.get("/history", response_model=ScanListResponse)
async def get_scan_history(
    page: int = 1,
    per_page: int = 20,
    scan_type: Optional[ScanType] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's scan history."""
    query = db.query(Scan).filter(Scan.user_id == current_user.id)
    
    if scan_type:
        query = query.filter(Scan.scan_type == scan_type)
    
    total = query.count()
    scans = query.order_by(Scan.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    
    return ScanListResponse(
        scans=[ScanResponse.model_validate(s) for s in scans],
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific scan by ID."""
    scan = db.query(Scan).filter(
        Scan.id == scan_id,
        Scan.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    return ScanResponse.model_validate(scan)
