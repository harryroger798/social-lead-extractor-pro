"""
Promo management API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional, List
import hashlib
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.auth import get_current_user, get_current_admin_user
from app.models.user import User, SubscriptionTier
from app.models.promo import Promo, PromoRedemption, PromoType
from app.services.credit_service import add_credits
from app.models.credit import TransactionType

router = APIRouter(prefix="/api/promo", tags=["Promos"])


# Pydantic schemas
class PromoCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=50)
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    promo_type: PromoType = PromoType.FREE_PLAN
    plan_tier: Optional[str] = None
    duration_days: int = 30
    discount_percentage: Optional[float] = None
    credits_amount: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_uses: Optional[int] = None
    is_active: bool = True
    show_on_landing: bool = False
    landing_headline: Optional[str] = None
    landing_subtext: Optional[str] = None
    landing_button_text: Optional[str] = None
    landing_badge_text: Optional[str] = None
    landing_position: str = "hero"
    landing_bg_color: Optional[str] = None


class PromoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    promo_type: Optional[PromoType] = None
    plan_tier: Optional[str] = None
    duration_days: Optional[int] = None
    discount_percentage: Optional[float] = None
    credits_amount: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_uses: Optional[int] = None
    is_active: Optional[bool] = None
    show_on_landing: Optional[bool] = None
    landing_headline: Optional[str] = None
    landing_subtext: Optional[str] = None
    landing_button_text: Optional[str] = None
    landing_badge_text: Optional[str] = None
    landing_position: Optional[str] = None
    landing_bg_color: Optional[str] = None


class PromoResponse(BaseModel):
    id: int
    code: str
    title: str
    description: Optional[str]
    promo_type: str
    plan_tier: Optional[str]
    duration_days: int
    discount_percentage: Optional[float]
    credits_amount: Optional[int]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    max_uses: Optional[int]
    current_uses: int
    is_active: bool
    is_valid: bool
    days_until_expiry: int
    show_on_landing: bool
    landing_headline: Optional[str]
    landing_subtext: Optional[str]
    landing_button_text: Optional[str]
    landing_badge_text: Optional[str]
    landing_position: str
    landing_bg_color: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PromoRedeemRequest(BaseModel):
    code: str


class PromoRedeemResponse(BaseModel):
    success: bool
    message: str
    promo_title: Optional[str] = None
    benefit_description: Optional[str] = None
    expires_at: Optional[datetime] = None


class LandingPromoResponse(BaseModel):
    code: str
    title: str
    headline: str
    subtext: Optional[str]
    button_text: str
    badge_text: Optional[str]
    position: str
    bg_color: Optional[str]
    days_until_expiry: int
    promo_type: str
    plan_tier: Optional[str]
    duration_days: int


# Helper functions
def get_client_ip(request: Request) -> str:
    """Get client IP address from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def hash_email(email: str) -> str:
    """Hash email for anti-abuse tracking."""
    return hashlib.sha256(email.lower().encode()).hexdigest()


# Admin endpoints
@router.post("/admin/create", response_model=PromoResponse)
async def create_promo(
    promo_data: PromoCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new promo code (admin only)."""
    # Check if code already exists
    existing = db.query(Promo).filter(
        func.lower(Promo.code) == promo_data.code.lower()
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Promo code already exists"
        )
    
    promo = Promo(
        code=promo_data.code.upper(),
        title=promo_data.title,
        description=promo_data.description,
        promo_type=promo_data.promo_type,
        plan_tier=promo_data.plan_tier,
        duration_days=promo_data.duration_days,
        discount_percentage=promo_data.discount_percentage,
        credits_amount=promo_data.credits_amount,
        start_date=promo_data.start_date or datetime.utcnow(),
        end_date=promo_data.end_date,
        max_uses=promo_data.max_uses,
        is_active=promo_data.is_active,
        show_on_landing=promo_data.show_on_landing,
        landing_headline=promo_data.landing_headline,
        landing_subtext=promo_data.landing_subtext,
        landing_button_text=promo_data.landing_button_text,
        landing_badge_text=promo_data.landing_badge_text,
        landing_position=promo_data.landing_position,
        landing_bg_color=promo_data.landing_bg_color
    )
    
    db.add(promo)
    db.commit()
    db.refresh(promo)
    
    return PromoResponse(
        **{c.name: getattr(promo, c.name) for c in promo.__table__.columns},
        is_valid=promo.is_valid(),
        days_until_expiry=promo.days_until_expiry()
    )


@router.get("/admin/list", response_model=List[PromoResponse])
async def list_promos(
    include_inactive: bool = False,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """List all promo codes (admin only)."""
    query = db.query(Promo)
    if not include_inactive:
        query = query.filter(Promo.is_active == True)
    
    promos = query.order_by(Promo.created_at.desc()).all()
    
    return [
        PromoResponse(
            **{c.name: getattr(p, c.name) for c in p.__table__.columns},
            is_valid=p.is_valid(),
            days_until_expiry=p.days_until_expiry()
        )
        for p in promos
    ]


@router.get("/admin/{promo_id}", response_model=PromoResponse)
async def get_promo(
    promo_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get promo details (admin only)."""
    promo = db.query(Promo).filter(Promo.id == promo_id).first()
    if not promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo not found"
        )
    
    return PromoResponse(
        **{c.name: getattr(promo, c.name) for c in promo.__table__.columns},
        is_valid=promo.is_valid(),
        days_until_expiry=promo.days_until_expiry()
    )


@router.put("/admin/{promo_id}", response_model=PromoResponse)
async def update_promo(
    promo_id: int,
    promo_data: PromoUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a promo code (admin only)."""
    promo = db.query(Promo).filter(Promo.id == promo_id).first()
    if not promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo not found"
        )
    
    update_data = promo_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(promo, field, value)
    
    db.commit()
    db.refresh(promo)
    
    return PromoResponse(
        **{c.name: getattr(promo, c.name) for c in promo.__table__.columns},
        is_valid=promo.is_valid(),
        days_until_expiry=promo.days_until_expiry()
    )


@router.delete("/admin/{promo_id}")
async def delete_promo(
    promo_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a promo code (admin only)."""
    promo = db.query(Promo).filter(Promo.id == promo_id).first()
    if not promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo not found"
        )
    
    # Soft delete by deactivating
    promo.is_active = False
    db.commit()
    
    return {"message": "Promo deactivated successfully"}


@router.get("/admin/{promo_id}/redemptions")
async def get_promo_redemptions(
    promo_id: int,
    page: int = 1,
    per_page: int = 20,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get redemption history for a promo (admin only)."""
    promo = db.query(Promo).filter(Promo.id == promo_id).first()
    if not promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo not found"
        )
    
    query = db.query(PromoRedemption, User).join(
        User, PromoRedemption.user_id == User.id
    ).filter(PromoRedemption.promo_id == promo_id)
    
    total = query.count()
    redemptions = query.order_by(
        PromoRedemption.redeemed_at.desc()
    ).offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "promo": {
            "id": promo.id,
            "code": promo.code,
            "title": promo.title,
            "current_uses": promo.current_uses,
            "max_uses": promo.max_uses
        },
        "redemptions": [
            {
                "id": r.id,
                "user_id": r.user_id,
                "user_email": u.email,
                "user_name": u.full_name,
                "plan_tier_granted": r.plan_tier_granted,
                "credits_granted": r.credits_granted,
                "subscription_expires_at": r.subscription_expires_at,
                "redeemed_at": r.redeemed_at
            }
            for r, u in redemptions
        ],
        "total": total,
        "page": page,
        "per_page": per_page
    }


# Public endpoints
@router.get("/active", response_model=List[LandingPromoResponse])
async def get_active_landing_promos(
    db: Session = Depends(get_db)
):
    """Get active promos to display on landing page (public)."""
    now = datetime.utcnow()
    
    promos = db.query(Promo).filter(
        Promo.is_active == True,
        Promo.show_on_landing == True,
        (Promo.start_date == None) | (Promo.start_date <= now),
        (Promo.end_date == None) | (Promo.end_date > now),
        (Promo.max_uses == None) | (Promo.current_uses < Promo.max_uses)
    ).order_by(Promo.created_at.desc()).all()
    
    return [
        LandingPromoResponse(
            code=p.code,
            title=p.title,
            headline=p.landing_headline or p.title,
            subtext=p.landing_subtext,
            button_text=p.landing_button_text or "Claim Now",
            badge_text=p.landing_badge_text,
            position=p.landing_position,
            bg_color=p.landing_bg_color,
            days_until_expiry=p.days_until_expiry(),
            promo_type=p.promo_type.value,
            plan_tier=p.plan_tier,
            duration_days=p.duration_days
        )
        for p in promos
    ]


@router.get("/validate/{code}")
async def validate_promo_code(
    code: str,
    db: Session = Depends(get_db)
):
    """Validate a promo code without redeeming (public)."""
    promo = db.query(Promo).filter(
        func.upper(Promo.code) == code.upper()
    ).first()
    
    if not promo:
        return {"valid": False, "message": "Promo code not found"}
    
    if not promo.is_valid():
        if not promo.is_active:
            return {"valid": False, "message": "This promo code is no longer active"}
        if promo.end_date and datetime.utcnow() > promo.end_date:
            return {"valid": False, "message": "This promo code has expired"}
        if promo.max_uses and promo.current_uses >= promo.max_uses:
            return {"valid": False, "message": "This promo code has reached its usage limit"}
        return {"valid": False, "message": "This promo code is not valid"}
    
    # Build benefit description
    benefit = ""
    if promo.promo_type == PromoType.FREE_PLAN:
        tier_name = promo.plan_tier.capitalize() if promo.plan_tier else "Premium"
        benefit = f"Get {promo.duration_days} days of {tier_name} plan for FREE!"
    elif promo.promo_type == PromoType.FIXED_CREDITS:
        benefit = f"Get {promo.credits_amount:,} free credits!"
    elif promo.promo_type == PromoType.PERCENTAGE_DISCOUNT:
        benefit = f"Get {promo.discount_percentage}% off your subscription!"
    elif promo.promo_type == PromoType.TRIAL_EXTENSION:
        benefit = f"Extend your trial by {promo.duration_days} days!"
    
    return {
        "valid": True,
        "title": promo.title,
        "description": promo.description,
        "benefit": benefit,
        "days_until_expiry": promo.days_until_expiry()
    }


@router.post("/redeem", response_model=PromoRedeemResponse)
async def redeem_promo(
    request: Request,
    redeem_data: PromoRedeemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Redeem a promo code (authenticated users only)."""
    code = redeem_data.code.upper()
    
    # Find promo
    promo = db.query(Promo).filter(
        func.upper(Promo.code) == code
    ).first()
    
    if not promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo code not found"
        )
    
    if not promo.is_valid():
        if not promo.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This promo code is no longer active"
            )
        if promo.end_date and datetime.utcnow() > promo.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This promo code has expired"
            )
        if promo.max_uses and promo.current_uses >= promo.max_uses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This promo code has reached its usage limit"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This promo code is not valid"
        )
    
    # Anti-abuse checks
    email_hash = hash_email(current_user.email)
    client_ip = get_client_ip(request)
    
    # Check if user already redeemed this promo (by user_id)
    existing_redemption = db.query(PromoRedemption).filter(
        PromoRedemption.promo_id == promo.id,
        PromoRedemption.user_id == current_user.id
    ).first()
    
    if existing_redemption:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already redeemed this promo code"
        )
    
    # Check if email already used this promo (different account, same email)
    email_redemption = db.query(PromoRedemption).filter(
        PromoRedemption.promo_id == promo.id,
        PromoRedemption.email_hash == email_hash
    ).first()
    
    if email_redemption:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email has already been used to redeem this promo"
        )
    
    # Check for suspicious IP activity (more than 3 redemptions from same IP)
    ip_redemptions = db.query(PromoRedemption).filter(
        PromoRedemption.promo_id == promo.id,
        PromoRedemption.ip_address == client_ip
    ).count()
    
    if ip_redemptions >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many redemptions from this network. Please contact support."
        )
    
    # Apply promo benefits
    subscription_expires_at = None
    credits_granted = None
    plan_tier_granted = None
    benefit_description = ""
    
    if promo.promo_type == PromoType.FREE_PLAN:
        # Grant free subscription
        plan_tier_granted = promo.plan_tier
        
        # Define tier hierarchy for comparison
        tier_map = {
            "starter": SubscriptionTier.STARTER,
            "pro": SubscriptionTier.PRO,
            "enterprise": SubscriptionTier.ENTERPRISE
        }
        tier_hierarchy = {
            SubscriptionTier.FREE: 0,
            SubscriptionTier.STARTER: 1,
            SubscriptionTier.PRO: 2,
            SubscriptionTier.ENTERPRISE: 3
        }
        
        promo_tier = tier_map.get(plan_tier_granted, SubscriptionTier.FREE)
        current_tier = current_user.subscription_tier or SubscriptionTier.FREE
        current_tier_level = tier_hierarchy.get(current_tier, 0)
        promo_tier_level = tier_hierarchy.get(promo_tier, 0)
        
        # Check if user already has a higher tier plan
        if current_tier_level > promo_tier_level:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You already have a {current_tier.value} plan which is higher than this promo offers"
            )
        
        # Check if user already has the same tier with active subscription
        if current_tier_level == promo_tier_level and current_tier != SubscriptionTier.FREE:
            # User already has this tier - check if subscription is still active
            if current_user.subscription_expires_at and current_user.subscription_expires_at > datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"You already have an active {current_tier.value} subscription. This promo cannot be stacked with existing subscriptions."
                )
        
        # Calculate new subscription expiry
        subscription_expires_at = datetime.utcnow() + timedelta(days=promo.duration_days)
        
        # Update user subscription
        if plan_tier_granted in tier_map:
            current_user.subscription_tier = tier_map[plan_tier_granted]
            current_user.subscription_expires_at = subscription_expires_at
            
            # Set credits based on tier (only if upgrading from FREE or lower tier)
            if current_tier_level < promo_tier_level or current_tier == SubscriptionTier.FREE:
                if plan_tier_granted == "starter":
                    current_user.credits_balance = 25000
                elif plan_tier_granted in ["pro", "enterprise"]:
                    current_user.credits_balance = -1  # Unlimited
        
        tier_name = plan_tier_granted.capitalize() if plan_tier_granted else "Premium"
        benefit_description = f"{promo.duration_days} days of {tier_name} plan"
    
    elif promo.promo_type == PromoType.FIXED_CREDITS:
        # Add credits
        credits_granted = promo.credits_amount
        add_credits(
            db, current_user, credits_granted,
            TransactionType.PROMO,
            f"Promo code: {promo.code}",
            str(promo.id)
        )
        benefit_description = f"{credits_granted:,} free credits"
    
    elif promo.promo_type == PromoType.TRIAL_EXTENSION:
        # Extend trial/subscription
        if current_user.subscription_expires_at:
            subscription_expires_at = current_user.subscription_expires_at + timedelta(days=promo.duration_days)
        else:
            subscription_expires_at = datetime.utcnow() + timedelta(days=promo.duration_days)
        
        current_user.subscription_expires_at = subscription_expires_at
        benefit_description = f"{promo.duration_days} days trial extension"
    
    # Create redemption record
    redemption = PromoRedemption(
        user_id=current_user.id,
        promo_id=promo.id,
        email_hash=email_hash,
        ip_address=client_ip,
        plan_tier_granted=plan_tier_granted,
        credits_granted=credits_granted,
        subscription_expires_at=subscription_expires_at
    )
    db.add(redemption)
    
    # Increment usage count
    promo.current_uses += 1
    
    db.commit()
    
    return PromoRedeemResponse(
        success=True,
        message=f"Promo code redeemed successfully! You received: {benefit_description}",
        promo_title=promo.title,
        benefit_description=benefit_description,
        expires_at=subscription_expires_at
    )
