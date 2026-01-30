from sqlalchemy.orm import Session
from app.models.user import User
from app.models.credit import CreditTransaction, TransactionType
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def calculate_credits_needed(text: str, scan_type: str) -> int:
    """Calculate credits needed based on text length and scan type."""
    char_count = len(text)
    
    # Credits per 1000 characters
    if scan_type == "ai_detection":
        rate = settings.CREDIT_COST_DETECT
    elif scan_type == "humanize":
        rate = settings.CREDIT_COST_HUMANIZE
    elif scan_type == "plagiarism":
        rate = settings.CREDIT_COST_PLAGIARISM
    else:
        rate = 100  # Default
    
    # Calculate credits (minimum 100 credits per scan)
    credits = max(100, (char_count // 1000 + 1) * rate)
    return credits


def deduct_credits(db: Session, user: User, amount: int, description: str, reference_id: str = None) -> bool:
    """Deduct credits from user account and log transaction."""
    if not user.has_enough_credits(amount):
        return False
    
    # Deduct credits
    user.deduct_credits(amount)
    
    # Log transaction
    transaction = CreditTransaction(
        user_id=user.id,
        transaction_type=TransactionType.USAGE,
        amount=-amount,
        balance_after=user.credits_balance,
        description=description,
        reference_id=reference_id
    )
    db.add(transaction)
    db.commit()
    
    logger.info(f"Deducted {amount} credits from user {user.id}. New balance: {user.credits_balance}")
    return True


def add_credits(db: Session, user: User, amount: int, transaction_type: TransactionType, description: str, reference_id: str = None):
    """Add credits to user account and log transaction."""
    user.add_credits(amount)
    
    # Log transaction
    transaction = CreditTransaction(
        user_id=user.id,
        transaction_type=transaction_type,
        amount=amount,
        balance_after=user.credits_balance,
        description=description,
        reference_id=reference_id
    )
    db.add(transaction)
    db.commit()
    
    logger.info(f"Added {amount} credits to user {user.id}. New balance: {user.credits_balance}")


def get_credits_per_tier(tier: str) -> int:
    """Get monthly credits for a subscription tier."""
    tier_credits = {
        "free": settings.FREE_TIER_CREDITS,
        "starter": settings.STARTER_TIER_CREDITS,
        "pro": settings.PRO_TIER_CREDITS,
        "enterprise": -1  # Unlimited
    }
    return tier_credits.get(tier, settings.FREE_TIER_CREDITS)
