from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class SubscriptionTier(str, enum.Enum):
    FREE = "Free"
    STARTER = "Starter"
    PRO = "Pro"
    ENTERPRISE = "Enterprise"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    
    # Subscription
    subscription_tier = Column(SQLEnum(SubscriptionTier), default=SubscriptionTier.FREE)
    subscription_id = Column(String(255), nullable=True)  # PayPal subscription ID
    subscription_expires_at = Column(DateTime, nullable=True)
    
    # Credits (words) - Free tier starts with 5,000 words
    credits_balance = Column(Integer, default=5000)  # Free tier: 5K words/month
    credits_used_total = Column(Integer, default=0)
    
    # Auth0 social login
    auth0_sub = Column(String(255), nullable=True, unique=True, index=True)
    auth_provider = Column(String(50), default="local")

    # Status
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    # Notification preferences
    email_notifications = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=False)
    
    # Billing period for subscriptions
    billing_period = Column(String(20), default="monthly")  # "monthly" or "yearly"
    
    # Email verification and password reset tokens
    verification_token = Column(String(255), nullable=True)
    verification_token_expires_at = Column(DateTime, nullable=True)
    password_reset_token = Column(String(255), nullable=True)
    password_reset_token_expires_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    
    # Relationships
    scans = relationship("Scan", back_populates="user")
    credit_transactions = relationship("CreditTransaction", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")
    api_keys = relationship("APIKey", back_populates="user")

    def has_enough_credits(self, amount: int) -> bool:
        # -1 means unlimited credits (Enterprise tier)
        if self.credits_balance == -1:
            return True
        return self.credits_balance >= amount

    def deduct_credits(self, amount: int) -> bool:
        if self.has_enough_credits(amount):
            # Don't deduct from unlimited credits (-1)
            if self.credits_balance != -1:
                self.credits_balance -= amount
            self.credits_used_total += amount
            return True
        return False

    def add_credits(self, amount: int):
        self.credits_balance += amount
