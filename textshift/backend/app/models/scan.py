from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class ScanType(str, enum.Enum):
    AI_DETECTION = "ai_detection"
    HUMANIZE = "humanize"
    PLAGIARISM = "plagiarism"


class ScanStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Scan details
    scan_type = Column(SQLEnum(ScanType), nullable=False)
    status = Column(SQLEnum(ScanStatus), default=ScanStatus.PENDING)
    
    # Input/Output
    input_text = Column(Text, nullable=False)
    input_length = Column(Integer, nullable=False)  # Character count
    output_text = Column(Text, nullable=True)  # For humanize
    
    # Results (JSON for flexibility)
    results = Column(JSON, nullable=True)
    
    # AI Detection specific
    ai_probability = Column(Float, nullable=True)
    confidence_level = Column(String(50), nullable=True)
    
    # Plagiarism specific
    plagiarism_score = Column(Float, nullable=True)
    sources_found = Column(Integer, nullable=True)
    
    # Credits
    credits_used = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="scans")
