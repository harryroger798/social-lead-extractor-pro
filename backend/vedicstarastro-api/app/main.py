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
from app.services.astrology import (
    calculate_birth_chart, generate_share_token, NAKSHATRAS,
    calculate_vimshottari_dasha, calculate_all_divisional_charts,
    detect_yogas, calculate_planetary_strength, calculate_ashtakavarga,
    calculate_muhurta, calculate_current_transits
)
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


# ============================================
# ADVANCED ASTROLOGY ENDPOINTS
# ============================================

@app.post("/api/charts/dasha")
async def calculate_dasha(request: ChartCalculationRequest):
    """Calculate Vimshottari Dasha periods for a birth chart."""
    from datetime import datetime
    birth_date = datetime.fromisoformat(request.birth_date.replace('Z', '+00:00'))
    
    # First calculate the birth chart to get Moon's longitude
    chart_data = calculate_birth_chart(
        birth_date=birth_date,
        birth_time=request.birth_time,
        birth_place=request.birth_place,
        latitude=request.latitude,
        longitude=request.longitude
    )
    
    # Get Moon's longitude from the chart
    moon_planet = next((p for p in chart_data["planets"] if p["name"] == "Moon"), None)
    if not moon_planet:
        raise HTTPException(status_code=500, detail="Could not calculate Moon position")
    
    moon_longitude = moon_planet["longitude"]
    
    # Calculate Vimshottari Dasha
    dasha_data = calculate_vimshottari_dasha(birth_date, moon_longitude)
    
    return {
        "birth_details": {
            "date": request.birth_date,
            "time": request.birth_time,
            "place": request.birth_place
        },
        "moon_sign": chart_data["moon_sign"],
        "nakshatra": chart_data["nakshatra"],
        "dasha": dasha_data
    }


@app.post("/api/charts/divisional")
async def calculate_divisional_charts(request: ChartCalculationRequest):
    """Calculate all divisional charts (Vargas) for a birth chart."""
    from datetime import datetime
    birth_date = datetime.fromisoformat(request.birth_date.replace('Z', '+00:00'))
    
    chart_data = calculate_birth_chart(
        birth_date=birth_date,
        birth_time=request.birth_time,
        birth_place=request.birth_place,
        latitude=request.latitude,
        longitude=request.longitude
    )
    
    # Get ascendant longitude
    asc_sign = chart_data["ascendant"]
    asc_degree = chart_data["ascendant_degree"]
    from app.services.astrology import SIGNS
    asc_longitude = SIGNS.index(asc_sign) * 30 + asc_degree
    
    # Calculate all divisional charts
    divisional_charts = calculate_all_divisional_charts(chart_data["planets"], asc_longitude)
    
    return {
        "birth_details": {
            "date": request.birth_date,
            "time": request.birth_time,
            "place": request.birth_place
        },
        "rashi_chart": {
            "ascendant": chart_data["ascendant"],
            "planets": chart_data["planets"],
            "houses": chart_data["houses"]
        },
        "divisional_charts": divisional_charts
    }


@app.post("/api/charts/yogas")
async def detect_chart_yogas(request: ChartCalculationRequest):
    """Detect Yogas (planetary combinations) in a birth chart."""
    from datetime import datetime
    birth_date = datetime.fromisoformat(request.birth_date.replace('Z', '+00:00'))
    
    chart_data = calculate_birth_chart(
        birth_date=birth_date,
        birth_time=request.birth_time,
        birth_place=request.birth_place,
        latitude=request.latitude,
        longitude=request.longitude
    )
    
    # Detect yogas
    yogas = detect_yogas(chart_data["planets"], chart_data["houses"], chart_data["ascendant"])
    
    return {
        "birth_details": {
            "date": request.birth_date,
            "time": request.birth_time,
            "place": request.birth_place
        },
        "ascendant": chart_data["ascendant"],
        "yogas": yogas,
        "yoga_count": len(yogas),
        "yoga_types": list(set(y["type"] for y in yogas))
    }


@app.post("/api/charts/strength")
async def calculate_chart_strength(request: ChartCalculationRequest):
    """Calculate planetary strengths (Shadbala) for a birth chart."""
    from datetime import datetime
    birth_date = datetime.fromisoformat(request.birth_date.replace('Z', '+00:00'))
    
    chart_data = calculate_birth_chart(
        birth_date=birth_date,
        birth_time=request.birth_time,
        birth_place=request.birth_place,
        latitude=request.latitude,
        longitude=request.longitude
    )
    
    # Calculate strength for each planet
    strengths = []
    for planet in chart_data["planets"]:
        strength = calculate_planetary_strength(planet, chart_data["ascendant"])
        strengths.append(strength)
    
    # Sort by strength score
    strengths.sort(key=lambda x: x["total_score"], reverse=True)
    
    return {
        "birth_details": {
            "date": request.birth_date,
            "time": request.birth_time,
            "place": request.birth_place
        },
        "ascendant": chart_data["ascendant"],
        "planetary_strengths": strengths,
        "strongest_planet": strengths[0]["planet"] if strengths else None,
        "weakest_planet": strengths[-1]["planet"] if strengths else None
    }


@app.post("/api/charts/ashtakavarga")
async def calculate_chart_ashtakavarga(request: ChartCalculationRequest):
    """Calculate Ashtakavarga points for transit predictions."""
    from datetime import datetime
    birth_date = datetime.fromisoformat(request.birth_date.replace('Z', '+00:00'))
    
    chart_data = calculate_birth_chart(
        birth_date=birth_date,
        birth_time=request.birth_time,
        birth_place=request.birth_place,
        latitude=request.latitude,
        longitude=request.longitude
    )
    
    # Calculate Ashtakavarga
    ashtakavarga = calculate_ashtakavarga(chart_data["planets"])
    
    return {
        "birth_details": {
            "date": request.birth_date,
            "time": request.birth_time,
            "place": request.birth_place
        },
        "moon_sign": chart_data["moon_sign"],
        "ashtakavarga": ashtakavarga
    }


@app.post("/api/muhurta")
async def get_muhurta(
    date: str,
    latitude: float = 28.6139,
    longitude: float = 77.2090,
    event_type: str = "general"
):
    """Calculate Muhurta (auspicious timing) for a given date."""
    from datetime import datetime
    
    try:
        check_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)")
    
    valid_events = ["general", "marriage", "business", "travel", "griha_pravesh"]
    if event_type not in valid_events:
        raise HTTPException(status_code=400, detail=f"Invalid event type. Valid types: {valid_events}")
    
    muhurta = calculate_muhurta(check_date, latitude, longitude, event_type)
    
    return muhurta


@app.post("/api/charts/transits")
async def get_transits(request: ChartCalculationRequest):
    """Calculate current planetary transits and their effects on a birth chart."""
    from datetime import datetime
    birth_date = datetime.fromisoformat(request.birth_date.replace('Z', '+00:00'))
    
    chart_data = calculate_birth_chart(
        birth_date=birth_date,
        birth_time=request.birth_time,
        birth_place=request.birth_place,
        latitude=request.latitude,
        longitude=request.longitude
    )
    
    # Calculate current transits
    transits = calculate_current_transits(chart_data)
    
    return {
        "birth_details": {
            "date": request.birth_date,
            "time": request.birth_time,
            "place": request.birth_place
        },
        "birth_chart_summary": {
            "ascendant": chart_data["ascendant"],
            "moon_sign": chart_data["moon_sign"],
            "sun_sign": chart_data["sun_sign"],
            "nakshatra": chart_data["nakshatra"]
        },
        "transits": transits
    }


@app.post("/api/charts/complete")
async def calculate_complete_chart(
    request: ChartCalculationRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate a complete birth chart with all advanced features."""
    from datetime import datetime
    birth_date = datetime.fromisoformat(request.birth_date.replace('Z', '+00:00'))
    
    # Calculate basic birth chart
    chart_data = calculate_birth_chart(
        birth_date=birth_date,
        birth_time=request.birth_time,
        birth_place=request.birth_place,
        latitude=request.latitude,
        longitude=request.longitude
    )
    
    # Get Moon's longitude for Dasha calculation
    moon_planet = next((p for p in chart_data["planets"] if p["name"] == "Moon"), None)
    moon_longitude = moon_planet["longitude"] if moon_planet else 0
    
    # Get ascendant longitude for divisional charts
    from app.services.astrology import SIGNS
    asc_longitude = SIGNS.index(chart_data["ascendant"]) * 30 + chart_data["ascendant_degree"]
    
    # Calculate all advanced features
    dasha_data = calculate_vimshottari_dasha(birth_date, moon_longitude)
    divisional_charts = calculate_all_divisional_charts(chart_data["planets"], asc_longitude)
    yogas = detect_yogas(chart_data["planets"], chart_data["houses"], chart_data["ascendant"])
    
    strengths = []
    for planet in chart_data["planets"]:
        strength = calculate_planetary_strength(planet, chart_data["ascendant"])
        strengths.append(strength)
    strengths.sort(key=lambda x: x["total_score"], reverse=True)
    
    ashtakavarga = calculate_ashtakavarga(chart_data["planets"])
    transits = calculate_current_transits(chart_data)
    
    # Generate share token
    share_token = generate_share_token()
    
    # Save to database if user is logged in
    if current_user:
        db_chart = BirthChart(
            user_id=current_user.id,
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
        "share_token": share_token,
        "birth_details": {
            "name": request.name,
            "date": request.birth_date,
            "time": request.birth_time,
            "place": request.birth_place,
            "latitude": request.latitude,
            "longitude": request.longitude
        },
        "basic_chart": chart_data,
        "vimshottari_dasha": dasha_data,
        "divisional_charts": divisional_charts,
        "yogas": {
            "detected": yogas,
            "count": len(yogas),
            "types": list(set(y["type"] for y in yogas))
        },
        "planetary_strengths": strengths,
        "ashtakavarga": ashtakavarga,
        "current_transits": transits
    }
