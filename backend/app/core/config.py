from pydantic_settings import BaseSettings
from pydantic import validator
from functools import lru_cache
from typing import Optional
import secrets

class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "FinanceFlow API"
    VERSION: str = "1.0.0"
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # Password requirements
    MIN_PASSWORD_LENGTH: int = 8
    MAX_PASSWORD_LENGTH: int = 128
    
    # Database
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://financeflow:financeflow123@postgres:5432/financeflow"
    
    # Cache
    REDIS_URL: str
    
    # Email (para recuperação de senha)
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_SERVER: Optional[str] = None
    MAIL_PORT: int = 587
    MAIL_TLS: bool = True
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    @validator("SECRET_KEY", pre=True)
    def validate_secret_key(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def sqlalchemy_database_uri(self) -> str:
        return self.DATABASE_URL or f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

@lru_cache
def get_settings() -> Settings:
    return Settings()
