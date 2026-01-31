from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ModelMetrics(Base):
    """Time-series metrics for model performance monitoring."""
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    
    # Time window
    recorded_at = Column(DateTime, default=datetime.utcnow)
    window_start = Column(DateTime, nullable=False)
    window_end = Column(DateTime, nullable=False)
    
    # Request metrics
    total_requests = Column(Integer, default=0)
    successful_requests = Column(Integer, default=0)
    failed_requests = Column(Integer, default=0)
    avg_latency_ms = Column(Float, nullable=True)
    p95_latency_ms = Column(Float, nullable=True)
    p99_latency_ms = Column(Float, nullable=True)
    
    # Accuracy metrics (based on user feedback)
    feedback_received = Column(Integer, default=0)
    correct_predictions = Column(Integer, default=0)
    false_positives = Column(Integer, default=0)
    false_negatives = Column(Integer, default=0)
    accuracy_rate = Column(Float, nullable=True)
    
    # Distribution drift detection
    input_distribution_hash = Column(String(64), nullable=True)
    drift_score = Column(Float, nullable=True)  # 0-1 score indicating distribution shift
    drift_detected = Column(Boolean, default=False)
    
    # Relationships
    model_version = relationship("ModelVersion", backref="metrics")
