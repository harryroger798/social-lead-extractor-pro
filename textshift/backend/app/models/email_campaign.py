from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum as SQLEnum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class EmailType(str, enum.Enum):
    # Notification emails (for users with email_notifications enabled)
    SCAN_COMPLETE = "scan_complete"
    LOW_CREDITS = "low_credits"
    WEEKLY_SUMMARY = "weekly_summary"
    SUBSCRIPTION_EXPIRING = "subscription_expiring"
    PASSWORD_CHANGED = "password_changed"
    
    # Marketing emails (for users with marketing_emails enabled)
    NEW_FEATURE = "new_feature"
    PROMOTIONAL = "promotional"
    TIPS_TRICKS = "tips_tricks"
    PRODUCT_UPDATE = "product_update"


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    SENDING = "sending"
    SENT = "sent"
    CANCELLED = "cancelled"


class TargetAudience(str, enum.Enum):
    ALL_USERS = "all_users"
    FREE_TIER = "free_tier"
    STARTER_TIER = "starter_tier"
    PRO_TIER = "pro_tier"
    ENTERPRISE_TIER = "enterprise_tier"
    ACTIVE_USERS = "active_users"  # Users who logged in within 30 days
    INACTIVE_USERS = "inactive_users"  # Users who haven't logged in for 30+ days


class EmailCampaign(Base):
    __tablename__ = "email_campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    preview_text = Column(String(500), nullable=True)
    
    # Email type determines if it's notification or marketing
    email_type = Column(SQLEnum(EmailType), nullable=False)
    
    # Content
    headline = Column(String(255), nullable=False)
    body_content = Column(Text, nullable=False)  # HTML content for the main body
    cta_text = Column(String(100), nullable=True)  # Call to action button text
    cta_url = Column(String(500), nullable=True)  # Call to action button URL
    
    # Targeting
    target_audience = Column(SQLEnum(TargetAudience), default=TargetAudience.ALL_USERS)
    
    # Scheduling
    status = Column(SQLEnum(CampaignStatus), default=CampaignStatus.DRAFT)
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    
    # Stats
    total_recipients = Column(Integer, default=0)
    emails_sent = Column(Integer, default=0)
    emails_opened = Column(Integer, default=0)
    emails_clicked = Column(Integer, default=0)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    sends = relationship("EmailSend", back_populates="campaign")


class EmailSend(Base):
    """Track individual email sends for a campaign"""
    __tablename__ = "email_sends"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("email_campaigns.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Status
    sent_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)
    
    # Tracking
    tracking_id = Column(String(64), unique=True, index=True)  # For open/click tracking
    
    # Relationships
    campaign = relationship("EmailCampaign", back_populates="sends")
    user = relationship("User")
