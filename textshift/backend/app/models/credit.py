from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class TransactionType(str, enum.Enum):
    PURCHASE = "purchase"
    USAGE = "usage"
    BONUS = "bonus"
    REFUND = "refund"
    SUBSCRIPTION = "subscription"
    ROLLOVER = "rollover"
    PROMO = "promo"


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Transaction details
    transaction_type = Column(SQLEnum(TransactionType), nullable=False)
    amount = Column(Integer, nullable=False)  # Positive for add, negative for deduct
    balance_after = Column(Integer, nullable=False)
    
    # Reference
    description = Column(String(500), nullable=True)
    reference_id = Column(String(255), nullable=True)  # Scan ID, PayPal transaction ID, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="credit_transactions")
