from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class SampleStatus(str, enum.Enum):
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"
    USED = "used"


class SampleSourceType(str, enum.Enum):
    USER_FEEDBACK = "user_feedback"
    SYNTHETIC = "synthetic"
    EXTERNAL_DATASET = "external_dataset"


class TrainingSampleQueue(Base):
    """Queue of training samples collected from feedback for model improvement."""
    __tablename__ = "training_sample_queue"

    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String(20), nullable=False)  # 'detector', 'humanizer', 'plagiarism'
    
    # Sample data
    input_text = Column(Text, nullable=False)
    correct_label = Column(String(50), nullable=False)
    source_type = Column(SQLEnum(SampleSourceType), nullable=False)
    source_id = Column(Integer, nullable=True)  # Links to feedback or other source
    
    # Quality indicators
    confidence_score = Column(Float, nullable=True)  # How confident we are in the label (0-1)
    duplicate_count = Column(Integer, default=0)  # How many times this exact text appeared
    
    # Scenario categorization (for 20+ learning scenarios)
    scenario_tags = Column(String(255), nullable=True)  # Comma-separated tags like 'code_snippet,short_text'
    
    # Processing status
    status = Column(SQLEnum(SampleStatus), default=SampleStatus.PENDING)
    validated_by = Column(String(50), nullable=True)  # 'auto' or admin user id
    rejection_reason = Column(Text, nullable=True)
    
    # Training inclusion
    used_in_training_run_id = Column(Integer, ForeignKey("training_runs.id"), nullable=True)
    used_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    training_run = relationship("TrainingRun", backref="samples_used")
