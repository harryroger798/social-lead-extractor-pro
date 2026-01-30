from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.credit import TransactionType


class CreditTransactionResponse(BaseModel):
    id: int
    transaction_type: TransactionType
    amount: int
    balance_after: int
    description: Optional[str]
    reference_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CreditTransactionListResponse(BaseModel):
    transactions: List[CreditTransactionResponse]
    total: int
    page: int
    per_page: int


class CreditBalanceResponse(BaseModel):
    balance: int
    used_total: int
    subscription_tier: str
    credits_per_month: int


class CreditPurchaseRequest(BaseModel):
    amount: int  # Credits to purchase
    payment_method: str = "paypal"
