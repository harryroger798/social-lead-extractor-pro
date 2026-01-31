from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class TrainingStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TrainingTrigger(str, enum.Enum):
    CRON = "cron"
    MANUAL = "manual"
    DRIFT_DETECTED = "drift_detected"


class TrainingRun(Base):
    """Track training runs for incremental model improvement."""
    __tablename__ = "training_runs"

    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String(20), nullable=False)  # 'detector', 'humanizer', 'plagiarism'
    base_model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=True)
    new_model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=True)
    
    # Training configuration
    training_samples = Column(Integer, nullable=True)
    validation_samples = Column(Integer, nullable=True)
    epochs = Column(Integer, nullable=True)
    learning_rate = Column(Float, nullable=True)
    batch_size = Column(Integer, nullable=True)
    
    # Data sources
    feedback_samples_used = Column(Integer, nullable=True)
    synthetic_samples_used = Column(Integer, nullable=True)
    
    # Execution details
    status = Column(SQLEnum(TrainingStatus), default=TrainingStatus.QUEUED)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    # Resource usage
    peak_memory_mb = Column(Float, nullable=True)
    avg_cpu_percent = Column(Float, nullable=True)
    swap_used_mb = Column(Float, nullable=True)
    
    # Results
    final_train_loss = Column(Float, nullable=True)
    final_val_loss = Column(Float, nullable=True)
    final_accuracy = Column(Float, nullable=True)
    improvement_over_base = Column(Float, nullable=True)  # Percentage improvement
    
    # Error handling
    error_message = Column(Text, nullable=True)
    
    # Trigger
    triggered_by = Column(SQLEnum(TrainingTrigger), default=TrainingTrigger.CRON)
    triggered_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    base_model = relationship("ModelVersion", foreign_keys=[base_model_version_id])
    new_model = relationship("ModelVersion", foreign_keys=[new_model_version_id])
    triggered_by_user = relationship("User", backref="triggered_training_runs")
