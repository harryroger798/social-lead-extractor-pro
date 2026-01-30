from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import secrets
from app.core.database import Base


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    key = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)  # Optional name for the key
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Usage tracking
    last_used_at = Column(DateTime, nullable=True)
    total_requests = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration
    
    # Relationships
    user = relationship("User", back_populates="api_keys")

    @staticmethod
    def generate_key() -> str:
        """Generate a secure API key."""
        return f"ts_{secrets.token_hex(32)}"
    
    def is_valid(self) -> bool:
        """Check if the API key is valid."""
        if not self.is_active:
            return False
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return False
        return True
