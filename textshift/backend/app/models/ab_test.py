from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class ABTestGroup(str, enum.Enum):
    CONTROL = "control"
    TEST = "test"


class ABTestAssignment(Base):
    """Track A/B test assignments for users to compare model versions."""
    __tablename__ = "ab_test_assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_type = Column(String(20), nullable=False)  # 'detector', 'humanizer', 'plagiarism'
    
    # Assignment
    control_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    test_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    assigned_group = Column(SQLEnum(ABTestGroup), nullable=False)
    
    # Tracking
    requests_count = Column(Integer, default=0)
    avg_latency_ms = Column(Float, nullable=True)
    feedback_count = Column(Integer, default=0)
    positive_feedback = Column(Integer, default=0)
    negative_feedback = Column(Integer, default=0)
    
    # Metadata
    assigned_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # A/B test ends after 7 days
    
    # Relationships
    user = relationship("User", backref="ab_test_assignments")
    control_version = relationship("ModelVersion", foreign_keys=[control_version_id])
    test_version = relationship("ModelVersion", foreign_keys=[test_version_id])
