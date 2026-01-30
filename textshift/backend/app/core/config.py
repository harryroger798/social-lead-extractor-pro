from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "TextShift"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database (SQLite for local dev, PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./textshift.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    SECRET_KEY: str = "textshift-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # PayPal
    PAYPAL_CLIENT_ID: str = "ATNvYPU61RI3s-JnjGotzLW4NZrXP6ApCXzJM2KsvuOFQK1QTKFGCAyesEWBhGnHPqKdX9gexjxYlN3l"
    PAYPAL_SECRET_KEY: str = "EAYgOzANLnaqQPqYU0_rnIoBCdkMP0l4a3GtAW5KvpyUQSH_zK7MZxoclvwbPXgLi9fo8KDIwLKx_REI"
    PAYPAL_MODE: str = "live"  # "sandbox" or "live"
    
    # iDrive e2 (S3-compatible)
    S3_ENDPOINT: str = "https://s3.us-west-1.idrivee2.com"
    S3_BUCKET: str = "crop-spray-uploads"
    S3_ACCESS_KEY: str = "EQQ53Vm4Cr9Rov1FsOPt"
    S3_SECRET_KEY: str = "far8XneFX3NH9UT6HFUjAAt9YZ3CB8RmJiCvKpe6"
    
    # ML Models paths
    MODELS_DIR: str = "/opt/textshift/models"
    DETECTOR_MODEL_PATH: str = "/opt/textshift/models/detector"
    HUMANIZER_MODEL_PATH: str = "/opt/textshift/models/humanizer"
    PLAGIARISM_MODEL_PATH: str = "/opt/textshift/models/plagiarism"
    
    # External APIs (fallback)
    SERPER_API_KEY: str = "14e76cf7d90184e9053825ba67d99621705dc122"
    ORIGINALITY_API_KEY: str = "4mrg7suxpdhfi2ty6kq85ne9cz3ljowv"
    
    # Credit costs (per 1000 characters)
    CREDIT_COST_DETECT: int = 100
    CREDIT_COST_HUMANIZE: int = 200
    CREDIT_COST_PLAGIARISM: int = 150
    
    # Pricing tiers (credits per month)
    FREE_TIER_CREDITS: int = 20000
    STARTER_TIER_CREDITS: int = 100000
    PRO_TIER_CREDITS: int = 500000
    
    # Mailgun Email Service
    MAILGUN_API_KEY: str = ""  # Set via environment variable
    MAILGUN_DOMAIN: str = "mail.textshift.org"
    MAILGUN_FROM_EMAIL: str = "noreply@mail.textshift.org"
    MAILGUN_FROM_NAME: str = "TextShift"
    
    # Frontend URL for email links
    FRONTEND_URL: str = "https://textshift.org"
    
    # Password reset token expiry (in minutes)
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30
    EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
