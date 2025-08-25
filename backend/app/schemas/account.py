from pydantic import BaseModel
from typing import Optional
import uuid

class AccountBase(BaseModel):
    name: str
    type: str
    bank: Optional[str] = None
    agency: Optional[str] = None
    account_number: Optional[str] = None
    initial_balance: Optional[float] = 0
    currency: Optional[str] = "BRL"
    color: Optional[str] = None
    icon: Optional[str] = None

class AccountCreate(AccountBase):
    pass

class AccountOut(AccountBase):
    id: uuid.UUID
    current_balance: float
    is_active: bool
