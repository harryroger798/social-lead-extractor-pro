from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional

from app.database import engine, get_db, Base
from app.models import User, BirthChart, Consultation, NakshatraData
from app.schemas import (
    UserCreate, UserResponse, Token, BirthChartCreate, BirthChartResponse,
    ConsultationCreate, ConsultationResponse, PaymentOrderCreate, PaymentOrderResponse,
    PaymentVerify, ContactForm, NakshatraResponse, ChartCalculationRequest
)
from app.auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user, get_current_user_required, ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.services.astrology import calculate_birth_chart, generate_share_token, NAKSHATRAS
from app.services.payment import create_order, verify_payment_signature, get_key_id
from app.services.email import send_consultation_confirmation, send_contact_form_notification

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VedicStarAstro API",
    description="Backend API for VedicStarAstro - Vedic Astrology Services",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        phone=user.phone,
        location=user.location,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user_required)):
    return current_user

@app.post("/api/charts/calculate")
async def calculate_chart(
    request: ChartCalculationRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime
    birth_date = datetime.fromisoformat(request.birth_date.replace('Z', '+00:00'))
    
    chart_data = calculate_birth_chart(
        birth_date=birth_date,
        birth_time=request.birth_time,
        birth_place=request.birth_place,
        latitude=request.latitude,
        longitude=request.longitude
    )
    
    share_token = generate_share_token()
    
    db_chart = BirthChart(
        user_id=current_user.id if current_user else None,
        name=request.name,
        birth_date=birth_date,
        birth_time=request.birth_time,
        birth_place=request.birth_place,
        latitude=request.latitude,
        longitude=request.longitude,
        chart_data_json=chart_data,
        share_token=share_token
    )
    db.add(db_chart)
    db.commit()
    db.refresh(db_chart)
    
    return {
        "id": db_chart.id,
        "share_token": share_token,
        "chart_data": chart_data
    }

@app.get("/api/charts/{share_token}")
async def get_chart_by_token(share_token: str, db: Session = Depends(get_db)):
    chart = db.query(BirthChart).filter(BirthChart.share_token == share_token).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    return {
        "id": chart.id,
        "name": chart.name,
        "birth_date": chart.birth_date,
        "birth_time": chart.birth_time,
        "birth_place": chart.birth_place,
        "chart_data": chart.chart_data_json,
        "created_at": chart.created_at
    }

@app.get("/api/charts/user/list", response_model=List[BirthChartResponse])
async def get_user_charts(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    charts = db.query(BirthChart).filter(BirthChart.user_id == current_user.id).all()
    return charts

@app.get("/api/nakshatras", response_model=List[dict])
async def get_all_nakshatras():
    return [{"id": i+1, **n} for i, n in enumerate(NAKSHATRAS)]

@app.get("/api/nakshatras/{nakshatra_id}")
async def get_nakshatra(nakshatra_id: int):
    if nakshatra_id < 1 or nakshatra_id > 27:
        raise HTTPException(status_code=404, detail="Nakshatra not found")
    nakshatra = NAKSHATRAS[nakshatra_id - 1]
    return {"id": nakshatra_id, **nakshatra}

@app.post("/api/consultations", response_model=ConsultationResponse)
async def create_consultation(
    consultation: ConsultationCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    db_consultation = Consultation(
        user_id=current_user.id,
        consultation_type=consultation.consultation_type,
        astrologer_name=consultation.astrologer_name,
        scheduled_date=consultation.scheduled_date,
        duration_minutes=consultation.duration_minutes,
        amount=consultation.amount,
        notes=consultation.notes
    )
    db.add(db_consultation)
    db.commit()
    db.refresh(db_consultation)
    return db_consultation

@app.get("/api/consultations", response_model=List[ConsultationResponse])
async def get_user_consultations(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    consultations = db.query(Consultation).filter(Consultation.user_id == current_user.id).all()
    return consultations

@app.post("/api/payments/create-order", response_model=PaymentOrderResponse)
async def create_payment_order(
    order_request: PaymentOrderCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(
        Consultation.id == order_request.consultation_id,
        Consultation.user_id == current_user.id
    ).first()
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    if consultation.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Consultation already paid")
    
    order = create_order(
        amount=consultation.amount,
        currency=consultation.currency,
        receipt=f"consultation_{consultation.id}"
    )
    
    consultation.razorpay_order_id = order["id"]
    db.commit()
    
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": get_key_id()
    }

@app.post("/api/payments/verify")
async def verify_payment(
    payment: PaymentVerify,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(
        Consultation.razorpay_order_id == payment.razorpay_order_id,
        Consultation.user_id == current_user.id
    ).first()
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    is_valid = verify_payment_signature(
        payment.razorpay_order_id,
        payment.razorpay_payment_id,
        payment.razorpay_signature
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    consultation.razorpay_payment_id = payment.razorpay_payment_id
    consultation.payment_status = "paid"
    consultation.status = "confirmed"
    db.commit()
    
    send_consultation_confirmation(
        to_email=current_user.email,
        user_name=current_user.name,
        consultation_type=consultation.consultation_type,
        scheduled_date=consultation.scheduled_date.strftime("%B %d, %Y at %I:%M %p"),
        astrologer_name=consultation.astrologer_name or "Expert Astrologer",
        amount=consultation.amount
    )
    
    return {"status": "success", "message": "Payment verified successfully"}

@app.post("/api/contact")
async def submit_contact_form(form: ContactForm):
    result = send_contact_form_notification(
        name=form.name,
        email=form.email,
        phone=form.phone or "",
        subject=form.subject,
        message=form.message
    )
    return {"status": "success", "message": "Your message has been sent. We'll get back to you soon!"}

@app.get("/api/astrologers")
async def get_astrologers():
    return [
        {
            "id": 1,
            "name": "Pandit Rajesh Sharma",
            "specialization": "Kundli Analysis, Marriage Compatibility",
            "experience": "25+ years",
            "languages": ["Hindi", "English"],
            "rating": 4.9,
            "consultations": 5000,
            "price_per_minute": 15
        },
        {
            "id": 2,
            "name": "Dr. Lakshmi Devi",
            "specialization": "Career Guidance, Remedies",
            "experience": "20+ years",
            "languages": ["Hindi", "English", "Tamil"],
            "rating": 4.8,
            "consultations": 3500,
            "price_per_minute": 20
        },
        {
            "id": 3,
            "name": "Acharya Suresh Kumar",
            "specialization": "Nakshatra Analysis, Muhurta",
            "experience": "30+ years",
            "languages": ["Hindi", "Sanskrit", "English"],
            "rating": 4.9,
            "consultations": 8000,
            "price_per_minute": 25
        }
    ]

@app.get("/api/daily-horoscope/{sign}")
async def get_daily_horoscope(sign: str):
    signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", 
             "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
    
    if sign.lower() not in signs:
        raise HTTPException(status_code=404, detail="Invalid zodiac sign")
    
    from datetime import date
    today = date.today()
    
    return {
        "sign": sign.capitalize(),
        "date": today.isoformat(),
        "horoscope": f"Today brings positive energy for {sign.capitalize()}. Focus on your goals and trust your intuition. Financial matters look favorable. Relationships may require extra attention.",
        "lucky_number": (today.day + signs.index(sign.lower())) % 9 + 1,
        "lucky_color": ["Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "White", "Gold", "Silver", "Violet", "Indigo"][signs.index(sign.lower())],
        "mood": "Optimistic",
        "compatibility": signs[(signs.index(sign.lower()) + 4) % 12].capitalize()
    }
