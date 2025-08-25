from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: uuid.UUID
    is_active: bool
    is_verified: bool
    mfa_enabled: bool

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
