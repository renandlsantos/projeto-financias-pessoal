from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Nome da categoria")
    type: TransactionType = Field(..., description="Tipo de transação")
    icon: Optional[str] = Field(None, max_length=50, description="Ícone da categoria")
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Cor em hexadecimal")
    parent_id: Optional[UUID] = Field(None, description="ID da categoria pai")
    sort_order: int = Field(0, ge=0, le=999, description="Ordem de exibição")

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    sort_order: Optional[int] = Field(None, ge=0, le=999)
    is_active: Optional[bool] = None

class CategoryRead(CategoryBase):
    id: UUID
    user_id: Optional[UUID]
    is_system: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # Campos calculados
    subcategories_count: int = Field(0, description="Número de subcategorias")
    parent_name: Optional[str] = Field(None, description="Nome da categoria pai")
    
    class Config:
        orm_mode = True
        from_attributes = True

class CategoryWithSubcategories(CategoryRead):
    subcategories: List[CategoryRead] = []
    
    class Config:
        orm_mode = True
        from_attributes = True
