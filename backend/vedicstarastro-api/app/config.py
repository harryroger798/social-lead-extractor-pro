from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./vedicstarastro.db"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    
    MAILGUN_API_KEY: str = ""
    MAILGUN_DOMAIN: str = "vedicstarastro.com"
    
    class Config:
        env_file = ".env"
        extra = "allow"

@lru_cache()
def get_settings():
    return Settings()
