from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_active_user, verify_password, get_password_hash
from app.models.user import User, SubscriptionTier
from app.models.scan import Scan
from app.models.credit import CreditTransaction
from app.schemas.user import (
    UserResponse,
    UserSettingsUpdate,
    PasswordChange,
    CreditTopUpRequest,
    CreditTopUpResponse
)
from datetime import datetime

router = APIRouter(prefix="/api/v1/user", tags=["User Settings"])

# Credit top-up packages (only for paid users)
CREDIT_PACKAGES = {
    "10k": {"credits": 10000, "price": 4.99},
    "25k": {"credits": 25000, "price": 9.99},
    "50k": {"credits": 50000, "price": 17.99},
    "100k": {"credits": 100000, "price": 29.99},
}


@router.put("/settings", response_model=UserResponse)
async def update_user_settings(
    settings_data: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user settings (name, notification preferences)."""
    if settings_data.full_name is not None:
        current_user.full_name = settings_data.full_name
    
    if settings_data.email_notifications is not None:
        current_user.email_notifications = settings_data.email_notifications
    
    if settings_data.marketing_emails is not None:
        current_user.marketing_emails = settings_data.marketing_emails
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)


@router.put("/password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password."""
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.delete("/history")
async def clear_scan_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Clear all scan history for the current user."""
    # Delete all scans for this user
    deleted_count = db.query(Scan).filter(Scan.user_id == current_user.id).delete()
    db.commit()
    
    return {
        "message": f"Scan history cleared successfully",
        "deleted_scans": deleted_count
    }


@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Permanently delete user account and all associated data."""
    user_id = current_user.id
    
    # Delete all related data
    db.query(Scan).filter(Scan.user_id == user_id).delete()
    db.query(CreditTransaction).filter(CreditTransaction.user_id == user_id).delete()
    
    # Delete the user
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account deleted successfully"}


@router.get("/credit-packages")
async def get_credit_packages(
    current_user: User = Depends(get_current_active_user)
):
    """Get available credit top-up packages (paid users only)."""
    # Check if user is on a paid plan
    if current_user.subscription_tier == SubscriptionTier.FREE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Credit top-up is only available for paid plan users. Please upgrade your plan first."
        )
    
    return {
        "packages": [
            {
                "id": pkg_id,
                "credits": pkg["credits"],
                "price": pkg["price"],
                "label": f"{pkg['credits']:,} words",
                "price_per_1k": round(pkg["price"] / (pkg["credits"] / 1000), 2)
            }
            for pkg_id, pkg in CREDIT_PACKAGES.items()
        ],
        "current_balance": current_user.credits_balance
    }


@router.post("/topup", response_model=CreditTopUpResponse)
async def topup_credits(
    topup_data: CreditTopUpRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Purchase additional credits (paid users only)."""
    # Check if user is on a paid plan
    if current_user.subscription_tier == SubscriptionTier.FREE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Credit top-up is only available for paid plan users. Please upgrade your plan first."
        )
    
    # Validate package
    if topup_data.package not in CREDIT_PACKAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid package. Available packages: {', '.join(CREDIT_PACKAGES.keys())}"
        )
    
    package = CREDIT_PACKAGES[topup_data.package]
    credits_to_add = package["credits"]
    price = package["price"]
    
    # Add credits to user balance
    # Note: In production, this would integrate with a payment gateway
    # For now, we simulate the purchase
    if current_user.credits_balance == -1:
        # User has unlimited credits, no need to add
        return CreditTopUpResponse(
            success=True,
            credits_added=0,
            new_balance=-1,
            package=topup_data.package,
            price=price
        )
    
    current_user.credits_balance += credits_to_add
    new_balance = current_user.credits_balance
    current_user.updated_at = datetime.utcnow()
    
    # Record the transaction
    transaction = CreditTransaction(
        user_id=current_user.id,
        amount=credits_to_add,
        balance_after=new_balance,
        transaction_type="topup",
        description=f"Credit top-up: {credits_to_add:,} words (${price})"
    )
    db.add(transaction)
    db.commit()
    db.refresh(current_user)
    
    return CreditTopUpResponse(
        success=True,
        credits_added=credits_to_add,
        new_balance=current_user.credits_balance,
        package=topup_data.package,
        price=price
    )
