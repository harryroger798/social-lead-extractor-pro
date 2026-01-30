from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User, SubscriptionTier
from app.models.api_key import APIKey

router = APIRouter(prefix="/api/keys", tags=["API Keys"])


class APIKeyCreate(BaseModel):
    name: Optional[str] = None


class APIKeyResponse(BaseModel):
    id: int
    name: Optional[str]
    key: str
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime]
    total_requests: int

    class Config:
        from_attributes = True


class APIKeyListResponse(BaseModel):
    id: int
    name: Optional[str]
    key_preview: str  # Only show first 8 chars + last 4
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime]
    total_requests: int


def check_api_access(user: User):
    """Check if user has API access (Pro or Enterprise tier)."""
    allowed_tiers = [SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE]
    if user.subscription_tier not in allowed_tiers:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API access requires Pro or Enterprise subscription. Please upgrade your plan."
        )


@router.post("/generate", response_model=APIKeyResponse)
async def generate_api_key(
    key_data: APIKeyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate a new API key. Requires Pro or Enterprise subscription."""
    check_api_access(current_user)
    
    # Limit number of API keys per user
    existing_keys = db.query(APIKey).filter(
        APIKey.user_id == current_user.id,
        APIKey.is_active == True
    ).count()
    
    max_keys = 5 if current_user.subscription_tier == SubscriptionTier.ENTERPRISE else 2
    if existing_keys >= max_keys:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {max_keys} active API keys allowed for your plan"
        )
    
    # Generate new API key
    api_key = APIKey(
        user_id=current_user.id,
        key=APIKey.generate_key(),
        name=key_data.name
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    
    return APIKeyResponse.model_validate(api_key)


@router.get("/list", response_model=List[APIKeyListResponse])
async def list_api_keys(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all API keys for the current user."""
    check_api_access(current_user)
    
    keys = db.query(APIKey).filter(
        APIKey.user_id == current_user.id
    ).order_by(APIKey.created_at.desc()).all()
    
    return [
        APIKeyListResponse(
            id=key.id,
            name=key.name,
            key_preview=f"{key.key[:8]}...{key.key[-4:]}",
            is_active=key.is_active,
            created_at=key.created_at,
            last_used_at=key.last_used_at,
            total_requests=key.total_requests
        )
        for key in keys
    ]


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Revoke an API key."""
    check_api_access(current_user)
    
    api_key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user.id
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    api_key.is_active = False
    db.commit()
    
    return {"message": "API key revoked successfully"}


# API Key authentication for external API access
async def get_user_by_api_key(
    api_key: str,
    db: Session = Depends(get_db)
) -> User:
    """Authenticate user by API key."""
    key = db.query(APIKey).filter(
        APIKey.key == api_key,
        APIKey.is_active == True
    ).first()
    
    if not key or not key.is_valid():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired API key"
        )
    
    # Update usage stats
    key.last_used_at = datetime.utcnow()
    key.total_requests += 1
    db.commit()
    
    return key.user
