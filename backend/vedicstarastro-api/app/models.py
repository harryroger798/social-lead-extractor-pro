from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    birth_charts = relationship("BirthChart", back_populates="user")
    horoscope_readings = relationship("HoroscopeReading", back_populates="user")
    consultations = relationship("Consultation", back_populates="user")

class BirthChart(Base):
    __tablename__ = "birth_charts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False)
    birth_date = Column(DateTime, nullable=False)
    birth_time = Column(String(10), nullable=False)
    birth_place = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    chart_data_json = Column(JSON, nullable=True)
    share_token = Column(String(64), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="birth_charts")

class NakshatraData(Base):
    __tablename__ = "nakshatra_data"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    sanskrit_name = Column(String(100), nullable=True)
    ruling_planet = Column(String(50), nullable=False)
    lord = Column(String(50), nullable=False)
    deity = Column(String(100), nullable=True)
    symbol = Column(String(100), nullable=True)
    characteristics = Column(Text, nullable=True)
    compatibility = Column(JSON, nullable=True)
    remedies = Column(Text, nullable=True)
    lucky_numbers = Column(String(50), nullable=True)
    lucky_colors = Column(String(100), nullable=True)
    lucky_day = Column(String(20), nullable=True)

class HoroscopeReading(Base):
    __tablename__ = "horoscope_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reading_type = Column(String(50), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    content = Column(Text, nullable=False)
    recommendations = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="horoscope_readings")

class BlogArticle(Base):
    __tablename__ = "blog_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    keywords = Column(String(500), nullable=True)
    author = Column(String(100), nullable=False)
    featured_image = Column(String(500), nullable=True)
    published_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    views = Column(Integer, default=0)
    is_published = Column(Boolean, default=False)

class Backlink(Base):
    __tablename__ = "backlinks"
    
    id = Column(Integer, primary_key=True, index=True)
    source_url = Column(String(500), nullable=False)
    target_url = Column(String(500), nullable=False)
    anchor_text = Column(String(255), nullable=True)
    domain_authority = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PageAnalytics(Base):
    __tablename__ = "page_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    page_slug = Column(String(255), nullable=False, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    avg_position = Column(Float, nullable=True)
    ai_overview_cited = Column(Boolean, default=False)

class Consultation(Base):
    __tablename__ = "consultations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    consultation_type = Column(String(50), nullable=False)
    astrologer_name = Column(String(100), nullable=True)
    scheduled_date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=30)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    payment_status = Column(String(20), default="pending")
    status = Column(String(20), default="pending")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="consultations")
