from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
from datetime import datetime
import uuid
import re

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    language: str = Field(default="pt-BR", max_length=5)
    timezone: str = Field(default="America/Sao_Paulo", max_length=50)
    currency: str = Field(default="BRL", max_length=3)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Senha deve ter pelo menos 8 caracteres')
        if len(v) > 128:
            raise ValueError('Senha deve ter no máximo 128 caracteres')
        if not re.search(r"[A-Za-z]", v):
            raise ValueError('Senha deve conter pelo menos uma letra')
        if not re.search(r"\d", v):
            raise ValueError('Senha deve conter pelo menos um número')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Senha deve conter pelo menos um caractere especial')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Senhas não coincidem')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+?[\d\s\-\(\)]{10,20}$', v):
            raise ValueError('Formato de telefone inválido')
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    language: Optional[str] = Field(None, max_length=5)
    timezone: Optional[str] = Field(None, max_length=50)
    currency: Optional[str] = Field(None, max_length=3)
    avatar_url: Optional[str] = Field(None, max_length=500)
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+?[\d\s\-\(\)]{10,20}$', v):
            raise ValueError('Formato de telefone inválido')
        return v

class UserOut(UserBase):
    id: uuid.UUID
    is_active: bool
    is_verified: bool
    mfa_enabled: bool
    avatar_url: Optional[str]
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserInDB(UserOut):
    password_hash: str

# Schemas de autenticação
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenRefresh(BaseModel):
    refresh_token: str

class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Senha deve ter pelo menos 8 caracteres')
        if len(v) > 128:
            raise ValueError('Senha deve ter no máximo 128 caracteres')
        if not re.search(r"[A-Za-z]", v):
            raise ValueError('Senha deve conter pelo menos uma letra')
        if not re.search(r"\d", v):
            raise ValueError('Senha deve conter pelo menos um número')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Senha deve conter pelo menos um caractere especial')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Senhas não coincidem')
        return v

class PasswordResetRequest(BaseModel):
    email: EmailStr

class EmailVerification(BaseModel):
    token: str

class ChangePassword(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Senha deve ter pelo menos 8 caracteres')
        if len(v) > 128:
            raise ValueError('Senha deve ter no máximo 128 caracteres')
        if not re.search(r"[A-Za-z]", v):
            raise ValueError('Senha deve conter pelo menos uma letra')
        if not re.search(r"\d", v):
            raise ValueError('Senha deve conter pelo menos um número')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Senha deve conter pelo menos um caractere especial')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Senhas não coincidem')
        return v

# Response models
class MessageResponse(BaseModel):
    message: str
