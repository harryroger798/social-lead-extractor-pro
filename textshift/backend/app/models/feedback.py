from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class FeedbackType(str, enum.Enum):
    INCORRECT_PREDICTION = "incorrect_prediction"
    FALSE_POSITIVE = "false_positive"
    FALSE_NEGATIVE = "false_negative"
    REPORT_ISSUE = "report_issue"
    GOOD_RESULT = "good_result"
    POOR_QUALITY = "poor_quality"


class UserFeedback(Base):
    """User feedback on scan results for model improvement."""
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Feedback details
    feedback_type = Column(SQLEnum(FeedbackType), nullable=False)
    is_correct = Column(Boolean, nullable=True)
    correct_label = Column(String(50), nullable=True)
    confidence_rating = Column(Integer, nullable=True)  # 1-5
    
    # Context
    model_prediction = Column(String(50), nullable=True)
    model_confidence = Column(Float, nullable=True)
    scan_type = Column(String(20), nullable=True)  # 'ai_detection', 'humanize', 'plagiarism'
    
    # Free-form feedback
    user_comment = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Training pipeline status
    used_in_training = Column(Boolean, default=False)
    training_run_id = Column(Integer, ForeignKey("training_runs.id"), nullable=True)
    
    # Relationships
    scan = relationship("Scan", backref="feedback")
    user = relationship("User", backref="feedback")
