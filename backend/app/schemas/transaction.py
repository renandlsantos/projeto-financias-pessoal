from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

class TransactionBase(BaseModel):
    account_id: uuid.UUID
    category_id: Optional[uuid.UUID]
    type: str
    amount: float
    description: Optional[str]
    transaction_date: datetime
    is_recurring: Optional[bool] = False
    recurrence_id: Optional[uuid.UUID]
    installment_number: Optional[int]
    total_installments: Optional[int]
    tags: Optional[List[str]]
    notes: Optional[str]
    attachments: Optional[str]

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
