from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    # Campos primários
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Informações pessoais
    full_name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Status da conta
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    
    # Autenticação
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(32), nullable=True)
    
    # Tentativas de login
    failed_login_attempts = Column(String, default="0", nullable=False)
    last_failed_login = Column(DateTime(timezone=True), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Recuperação de senha
    password_reset_token = Column(String(255), nullable=True)
    password_reset_at = Column(DateTime(timezone=True), nullable=True)
    
    # Verificação de email
    email_verification_token = Column(String(255), nullable=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Preferências
    language = Column(String(5), default="pt-BR", nullable=False)
    timezone = Column(String(50), default="America/Sao_Paulo", nullable=False)
    currency = Column(String(3), default="BRL", nullable=False)
    
    # Metadados
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relacionamentos
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    # accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    # transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
