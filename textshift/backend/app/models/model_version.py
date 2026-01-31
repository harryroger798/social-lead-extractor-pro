from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class ModelStatus(str, enum.Enum):
    TESTING = "testing"
    AB_TEST = "ab_test"
    DEPLOYED = "deployed"
    ARCHIVED = "archived"
    FAILED = "failed"


class ModelType(str, enum.Enum):
    DETECTOR = "detector"
    HUMANIZER = "humanizer"
    PLAGIARISM = "plagiarism"


class ModelVersion(Base):
    """Track different versions of ML models for A/B testing and deployment."""
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String(50), unique=True, nullable=False)  # 'v1.0', 'v1.1', 'v1.2'
    model_type = Column(SQLEnum(ModelType), nullable=False)
    
    # Model files
    model_path = Column(Text, nullable=False)  # Path to model files on disk or S3
    adapter_path = Column(Text, nullable=True)  # Path to LoRA adapter (if using LoRA)
    model_size_mb = Column(Float, nullable=True)
    
    # Performance metrics
    accuracy = Column(Float, nullable=True)
    precision_score = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    test_samples = Column(Integer, nullable=True)
    
    # Training details
    base_model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=True)
    trained_on_samples = Column(Integer, nullable=True)
    training_duration_minutes = Column(Integer, nullable=True)
    training_date = Column(DateTime, default=datetime.utcnow)
    
    # Deployment status
    status = Column(SQLEnum(ModelStatus), default=ModelStatus.TESTING)
    deployed_at = Column(DateTime, nullable=True)
    archived_at = Column(DateTime, nullable=True)
    
    # A/B test results
    ab_test_start_date = Column(DateTime, nullable=True)
    ab_test_end_date = Column(DateTime, nullable=True)
    ab_test_requests = Column(Integer, default=0)
    ab_test_avg_accuracy = Column(Float, nullable=True)
    ab_test_avg_latency_ms = Column(Float, nullable=True)
    ab_test_user_satisfaction = Column(Float, nullable=True)
    
    # Metadata
    notes = Column(Text, nullable=True)
    created_by = Column(String(50), default="system")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    base_model = relationship("ModelVersion", remote_side=[id], backref="derived_versions")
