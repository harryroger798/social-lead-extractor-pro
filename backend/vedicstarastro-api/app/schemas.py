from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Any

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    location: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class BirthChartCreate(BaseModel):
    name: str
    birth_date: datetime
    birth_time: str
    birth_place: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class BirthChartResponse(BaseModel):
    id: int
    name: str
    birth_date: datetime
    birth_time: str
    birth_place: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    chart_data_json: Optional[dict] = None
    share_token: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConsultationCreate(BaseModel):
    consultation_type: str
    astrologer_name: Optional[str] = None
    scheduled_date: datetime
    duration_minutes: int = 30
    amount: float
    notes: Optional[str] = None

class ConsultationResponse(BaseModel):
    id: int
    user_id: int
    consultation_type: str
    astrologer_name: Optional[str] = None
    scheduled_date: datetime
    duration_minutes: int
    amount: float
    currency: str
    razorpay_order_id: Optional[str] = None
    payment_status: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaymentOrderCreate(BaseModel):
    consultation_id: int

class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

class NakshatraResponse(BaseModel):
    id: int
    name: str
    sanskrit_name: Optional[str] = None
    ruling_planet: str
    lord: str
    deity: Optional[str] = None
    symbol: Optional[str] = None
    characteristics: Optional[str] = None
    compatibility: Optional[dict] = None
    remedies: Optional[str] = None
    lucky_numbers: Optional[str] = None
    lucky_colors: Optional[str] = None
    lucky_day: Optional[str] = None
    
    class Config:
        from_attributes = True

class ChartCalculationRequest(BaseModel):
    name: str
    birth_date: str
    birth_time: str
    birth_place: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
