from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # PayPal details
    paypal_subscription_id = Column(String(255), unique=True, nullable=True)
    paypal_plan_id = Column(String(255), nullable=True)
    
    # Subscription details
    tier = Column(String(50), nullable=False)  # starter, pro, enterprise
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.PENDING)
    
    # Pricing
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    
    # Billing cycle
    billing_cycle = Column(String(20), default="monthly")  # monthly, yearly
    
    # Dates
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    next_billing_date = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Credits
    credits_per_cycle = Column(Integer, nullable=False)
    credits_granted = Column(Integer, default=0)
    
    # Auto-renewal
    auto_renew = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
