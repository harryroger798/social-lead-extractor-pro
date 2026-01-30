from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.credit import CreditTransaction
from app.schemas.credit import (
    CreditTransactionResponse,
    CreditTransactionListResponse,
    CreditBalanceResponse
)
from app.services.credit_service import get_credits_per_tier

router = APIRouter(prefix="/api/credits", tags=["Credits"])


@router.get("/balance", response_model=CreditBalanceResponse)
async def get_credit_balance(
    current_user: User = Depends(get_current_active_user)
):
    """Get current credit balance."""
    return CreditBalanceResponse(
        balance=current_user.credits_balance,
        used_total=current_user.credits_used_total,
        subscription_tier=current_user.subscription_tier.value,
        credits_per_month=get_credits_per_tier(current_user.subscription_tier.value)
    )


@router.get("/transactions", response_model=CreditTransactionListResponse)
async def get_credit_transactions(
    page: int = 1,
    per_page: int = 20,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get credit transaction history."""
    query = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == current_user.id
    )
    
    total = query.count()
    transactions = query.order_by(
        CreditTransaction.created_at.desc()
    ).offset((page - 1) * per_page).limit(per_page).all()
    
    return CreditTransactionListResponse(
        transactions=[CreditTransactionResponse.model_validate(t) for t in transactions],
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/usage-stats")
async def get_usage_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get credit usage statistics."""
    from sqlalchemy import func
    from app.models.scan import Scan, ScanType
    from datetime import datetime, timedelta
    
    # Get usage by scan type
    usage_by_type = db.query(
        Scan.scan_type,
        func.count(Scan.id).label('count'),
        func.sum(Scan.credits_used).label('credits')
    ).filter(
        Scan.user_id == current_user.id
    ).group_by(Scan.scan_type).all()
    
    # Get usage in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_usage = db.query(
        func.sum(Scan.credits_used)
    ).filter(
        Scan.user_id == current_user.id,
        Scan.created_at >= thirty_days_ago
    ).scalar() or 0
    
    # Get total scans
    total_scans = db.query(func.count(Scan.id)).filter(
        Scan.user_id == current_user.id
    ).scalar() or 0
    
    return {
        "total_scans": total_scans,
        "total_credits_used": current_user.credits_used_total,
        "credits_used_last_30_days": recent_usage,
        "current_balance": current_user.credits_balance,
        "usage_by_type": [
            {
                "type": u.scan_type.value,
                "count": u.count,
                "credits": u.credits or 0
            }
            for u in usage_by_type
        ]
    }
