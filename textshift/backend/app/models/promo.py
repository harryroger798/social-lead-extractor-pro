"""
Promo code models for promotional campaigns.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class PromoType(str, enum.Enum):
    FREE_PLAN = "free_plan"  # Free subscription for X days
    PERCENTAGE_DISCOUNT = "percentage_discount"  # % off subscription
    FIXED_CREDITS = "fixed_credits"  # Free credits added
    TRIAL_EXTENSION = "trial_extension"  # Extended trial period


class Promo(Base):
    """Promotional code/campaign model."""
    __tablename__ = "promos"

    id = Column(Integer, primary_key=True, index=True)
    
    # Promo identification
    code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Promo type and value
    promo_type = Column(SQLEnum(PromoType), default=PromoType.FREE_PLAN)
    
    # For FREE_PLAN: which tier to grant
    plan_tier = Column(String(50), nullable=True)  # starter, pro, enterprise
    
    # Duration in days (for free plan or trial extension)
    duration_days = Column(Integer, default=30)
    
    # For PERCENTAGE_DISCOUNT
    discount_percentage = Column(Float, nullable=True)
    
    # For FIXED_CREDITS
    credits_amount = Column(Integer, nullable=True)
    
    # Validity period
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)  # null = no expiry
    
    # Usage limits
    max_uses = Column(Integer, nullable=True)  # null = unlimited
    current_uses = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Landing page display configuration
    show_on_landing = Column(Boolean, default=False)
    landing_headline = Column(String(255), nullable=True)
    landing_subtext = Column(Text, nullable=True)
    landing_button_text = Column(String(100), nullable=True)
    landing_badge_text = Column(String(50), nullable=True)
    landing_position = Column(String(50), default="hero")  # hero, banner, popup
    landing_bg_color = Column(String(20), nullable=True)  # hex color
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    redemptions = relationship("PromoRedemption", back_populates="promo")
    
    def is_valid(self) -> bool:
        """Check if promo is currently valid."""
        now = datetime.utcnow()
        
        if not self.is_active:
            return False
        
        if self.start_date and now < self.start_date:
            return False
        
        if self.end_date and now > self.end_date:
            return False
        
        if self.max_uses is not None and self.current_uses >= self.max_uses:
            return False
        
        return True
    
    def days_until_expiry(self) -> int:
        """Get days until promo expires."""
        if not self.end_date:
            return -1  # No expiry
        
        delta = self.end_date - datetime.utcnow()
        return max(0, delta.days)


class PromoRedemption(Base):
    """Track promo code redemptions to prevent abuse."""
    __tablename__ = "promo_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    
    # Who redeemed
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    promo_id = Column(Integer, ForeignKey("promos.id"), nullable=False)
    
    # Anti-abuse tracking
    email_hash = Column(String(64), nullable=True)  # SHA256 of email
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    
    # What was granted
    plan_tier_granted = Column(String(50), nullable=True)
    credits_granted = Column(Integer, nullable=True)
    subscription_expires_at = Column(DateTime, nullable=True)
    
    # Timestamps
    redeemed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    promo = relationship("Promo", back_populates="redemptions")
