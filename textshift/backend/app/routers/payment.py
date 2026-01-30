from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import httpx
import base64
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.core.config import settings
from app.models.user import User, SubscriptionTier
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.credit import TransactionType
from app.services.credit_service import add_credits, get_credits_per_tier
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payment", tags=["Payment"])

# PayPal API URLs
PAYPAL_API_BASE = "https://api-m.paypal.com" if settings.PAYPAL_MODE == "live" else "https://api-m.sandbox.paypal.com"

# Pricing plans
PRICING_PLANS = {
    "starter": {
        "name": "Starter",
        "price": 7.00,
        "credits": 100000,
        "description": "100,000 credits/month + rollover"
    },
    "pro": {
        "name": "Pro",
        "price": 15.00,
        "credits": 500000,
        "description": "500,000 credits/month + rollover"
    },
    "enterprise": {
        "name": "Enterprise",
        "price": 40.00,
        "credits": -1,  # Unlimited
        "description": "Unlimited credits"
    }
}


async def get_paypal_access_token() -> str:
    """Get PayPal access token."""
    auth = base64.b64encode(
        f"{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_SECRET_KEY}".encode()
    ).decode()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API_BASE}/v1/oauth2/token",
            headers={
                "Authorization": f"Basic {auth}",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data={"grant_type": "client_credentials"}
        )
        
        if response.status_code != 200:
            logger.error(f"PayPal auth error: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to authenticate with PayPal"
            )
        
        return response.json()["access_token"]


@router.get("/plans")
async def get_pricing_plans():
    """Get available pricing plans."""
    return {
        "plans": [
            {
                "id": plan_id,
                "name": plan["name"],
                "price": plan["price"],
                "credits": plan["credits"],
                "description": plan["description"],
                "features": get_plan_features(plan_id)
            }
            for plan_id, plan in PRICING_PLANS.items()
        ]
    }


def get_plan_features(plan_id: str) -> list:
    """Get features for a plan."""
    base_features = [
        "AI Detection",
        "Text Humanization",
        "Plagiarism Checking",
        "Credits never expire"
    ]
    
    if plan_id == "starter":
        return base_features + ["Priority processing"]
    elif plan_id == "pro":
        return base_features + ["Priority processing", "API access", "Batch processing"]
    elif plan_id == "enterprise":
        return base_features + ["Priority processing", "API access", "Batch processing", "White-label option", "Dedicated support"]
    
    return base_features


@router.post("/create-order")
async def create_paypal_order(
    plan_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a PayPal order for subscription."""
    if plan_id not in PRICING_PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan ID"
        )
    
    plan = PRICING_PLANS[plan_id]
    access_token = await get_paypal_access_token()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json={
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": str(plan["price"])
                    },
                    "description": f"TextShift {plan['name']} Plan - Monthly Subscription"
                }],
                "application_context": {
                    "brand_name": "TextShift",
                    "landing_page": "NO_PREFERENCE",
                    "user_action": "PAY_NOW",
                    "return_url": f"{settings.APP_URL if hasattr(settings, 'APP_URL') else 'http://localhost:3000'}/payment/success",
                    "cancel_url": f"{settings.APP_URL if hasattr(settings, 'APP_URL') else 'http://localhost:3000'}/payment/cancel"
                }
            }
        )
        
        if response.status_code not in [200, 201]:
            logger.error(f"PayPal order creation error: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create PayPal order"
            )
        
        order_data = response.json()
        
        # Create pending subscription record
        subscription = Subscription(
            user_id=current_user.id,
            tier=plan_id,
            amount=plan["price"],
            credits_per_cycle=plan["credits"],
            status=SubscriptionStatus.PENDING
        )
        db.add(subscription)
        db.commit()
        
        return {
            "order_id": order_data["id"],
            "subscription_id": subscription.id,
            "approval_url": next(
                (link["href"] for link in order_data["links"] if link["rel"] == "approve"),
                None
            )
        }


@router.post("/capture-order")
async def capture_paypal_order(
    order_id: str,
    plan_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Capture a PayPal order after approval."""
    if plan_id not in PRICING_PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan ID"
        )
    
    plan = PRICING_PLANS[plan_id]
    access_token = await get_paypal_access_token()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code not in [200, 201]:
            logger.error(f"PayPal capture error: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to capture PayPal order"
            )
        
        capture_data = response.json()
        
        if capture_data["status"] == "COMPLETED":
            # Update user subscription
            tier_map = {
                "starter": SubscriptionTier.STARTER,
                "pro": SubscriptionTier.PRO,
                "enterprise": SubscriptionTier.ENTERPRISE
            }
            
            current_user.subscription_tier = tier_map.get(plan_id, SubscriptionTier.FREE)
            
            # Add credits
            credits_to_add = plan["credits"]
            if credits_to_add > 0:
                add_credits(
                    db, current_user, credits_to_add,
                    TransactionType.SUBSCRIPTION,
                    f"Subscription: {plan['name']} plan",
                    order_id
                )
            
            # Update subscription record
            subscription = db.query(Subscription).filter(
                Subscription.user_id == current_user.id,
                Subscription.status == SubscriptionStatus.PENDING
            ).order_by(Subscription.created_at.desc()).first()
            
            if subscription:
                subscription.paypal_subscription_id = order_id
                subscription.status = SubscriptionStatus.ACTIVE
                subscription.start_date = datetime.utcnow()
            
            db.commit()
            
            return {
                "status": "success",
                "message": f"Successfully subscribed to {plan['name']} plan",
                "credits_added": credits_to_add if credits_to_add > 0 else "unlimited",
                "new_balance": current_user.credits_balance
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment not completed. Status: {capture_data['status']}"
            )


@router.get("/subscription")
async def get_subscription_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current subscription status."""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).order_by(Subscription.created_at.desc()).first()
    
    return {
        "tier": current_user.subscription_tier.value,
        "credits_balance": current_user.credits_balance,
        "credits_per_month": get_credits_per_tier(current_user.subscription_tier.value),
        "subscription": {
            "id": subscription.id if subscription else None,
            "start_date": subscription.start_date if subscription else None,
            "status": subscription.status.value if subscription else None
        } if subscription else None
    }
