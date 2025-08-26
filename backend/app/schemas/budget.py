from pydantic import BaseModel, Field, validator
from decimal import Decimal
from datetime import datetime
from typing import Optional
from uuid import UUID

class BudgetBase(BaseModel):
    year: int = Field(..., ge=2020, le=2030, description="Ano do orçamento")
    month: int = Field(..., ge=1, le=12, description="Mês do orçamento")
    limit_amount: Decimal = Field(..., gt=0, le=1000000, description="Valor limite do orçamento")
    alert_percentage_1: int = Field(80, ge=1, le=100, description="Primeiro percentual de alerta")
    alert_percentage_2: int = Field(95, ge=1, le=100, description="Segundo percentual de alerta")
    alerts_enabled: bool = Field(True, description="Se alertas estão habilitados")
    
    @validator('alert_percentage_2')
    def alert_2_greater_than_1(cls, v, values):
        if 'alert_percentage_1' in values and v <= values['alert_percentage_1']:
            raise ValueError('alert_percentage_2 deve ser maior que alert_percentage_1')
        return v

class BudgetCreate(BudgetBase):
    category_id: UUID = Field(..., description="ID da categoria")

class BudgetUpdate(BaseModel):
    limit_amount: Optional[Decimal] = Field(None, gt=0, le=1000000)
    alert_percentage_1: Optional[int] = Field(None, ge=1, le=100)
    alert_percentage_2: Optional[int] = Field(None, ge=1, le=100)
    alerts_enabled: Optional[bool] = None
    
    @validator('alert_percentage_2')
    def validate_alert_percentages(cls, v, values):
        if v is not None and 'alert_percentage_1' in values and values['alert_percentage_1'] is not None:
            if v <= values['alert_percentage_1']:
                raise ValueError('alert_percentage_2 deve ser maior que alert_percentage_1')
        return v

class BudgetRead(BudgetBase):
    id: UUID
    user_id: UUID
    category_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # Campos calculados
    spent_amount: Decimal = Field(..., description="Valor gasto no período")
    spent_percentage: float = Field(..., description="Percentual gasto")
    remaining_amount: Decimal = Field(..., description="Valor restante")
    status: str = Field(..., description="Status: safe, warning, danger, exceeded")
    
    # Dados da categoria
    category_name: str
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

class BudgetSummary(BaseModel):
    """Resumo de orçamentos para dashboard"""
    total_budgets: int
    total_limit: Decimal
    total_spent: Decimal
    average_percentage: float
    budgets_exceeded: int
    budgets_warning: int
    budgets_safe: int
    
    class Config:
        from_attributes = True
