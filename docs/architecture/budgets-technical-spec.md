# 🛠️ Arquitetura Técnica: Sistema de Orçamentos (Budgets)

<div align="center">

[![Feature](https://img.shields.io/badge/Feature-Orcamentos-blue?style=for-the-badge)](./)
[![Owner](https://img.shields.io/badge/Owner-Tech_Lead-orange?style=for-the-badge)](./)
[![Status](https://img.shields.io/badge/Status-Arquitetura_Definida-success?style=for-the-badge)](./)

**Especificação técnica completa para implementação do sistema de orçamentos**

</div>

---

## 🎯 Visão Arquitetural

O sistema de orçamentos seguirá o padrão estabelecido do FinanceFlow:
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + TypeScript + Material-UI
- **Patterns**: Repository + Service + Controller
- **Comunicação**: API REST com Pydantic schemas

### Princípios Técnicos
1. **Single Responsibility**: Cada classe/função tem uma responsabilidade clara
2. **DRY**: Reutilização de componentes existentes quando possível
3. **SOLID**: Especialmente Dependency Injection via FastAPI Depends
4. **Performance**: Queries otimizadas e cache quando necessário

---

## 🗄️ Modelo de Dados

### Tabela Principal: `budgets`

```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    
    -- Período do orçamento
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    
    -- Valores financeiros
    limit_amount DECIMAL(15,2) NOT NULL CHECK (limit_amount > 0),
    
    -- Configurações de alerta
    alert_percentage_1 INTEGER DEFAULT 80 CHECK (alert_percentage_1 BETWEEN 1 AND 100),
    alert_percentage_2 INTEGER DEFAULT 95 CHECK (alert_percentage_2 BETWEEN 1 AND 100),
    alerts_enabled BOOLEAN DEFAULT TRUE,
    
    -- Metadados
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar orçamentos duplicados
    UNIQUE(user_id, category_id, year, month)
);

-- Indexes para performance
CREATE INDEX idx_budgets_user_period ON budgets(user_id, year, month);
CREATE INDEX idx_budgets_user_category ON budgets(user_id, category_id);
CREATE INDEX idx_budgets_active ON budgets(user_id, is_active) WHERE is_active = TRUE;
```

### Relacionamentos

```
users (1) ──── (N) budgets
categories (1) ──── (N) budgets
budgets (1) ──── (N) transactions [via category_id]
```

---

## 🚀 Backend Architecture

### 1. Models (SQLAlchemy)

```python
# app/models/budget.py
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Budget(Base):
    __tablename__ = "budgets"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Foreign Keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    
    # Budget Period
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    
    # Financial Data
    limit_amount = Column(Numeric(15, 2), nullable=False)
    
    # Alert Settings
    alert_percentage_1 = Column(Integer, default=80, nullable=False)
    alert_percentage_2 = Column(Integer, default=95, nullable=False)
    alerts_enabled = Column(Boolean, default=True, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('user_id', 'category_id', 'year', 'month', name='uix_user_category_period'),
    )

    @property
    def period_display(self) -> str:
        """Retorna período no formato 'Janeiro/2025'"""
        months = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        return f"{months[self.month]}/{self.year}"
```

### 2. Schemas (Pydantic)

```python
# app/schemas/budget.py
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
    
    class Config:
        orm_mode = True

class BudgetSummary(BaseModel):
    """Resumo de orçamentos para dashboard"""
    total_budgets: int
    total_limit: Decimal
    total_spent: Decimal
    average_percentage: float
    budgets_exceeded: int
    budgets_warning: int
    budgets_safe: int
```

### 3. Services (Business Logic)

```python
# app/services/budget_service.py
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload
from datetime import date
from decimal import Decimal

from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetRead
from app.core.exceptions import NotFoundError, ValidationError

class BudgetService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_budget(self, user_id: UUID, budget_data: BudgetCreate) -> Budget:
        """Cria novo orçamento com validações"""
        
        # Verifica se já existe orçamento para categoria/período
        existing = await self.db.execute(
            select(Budget).where(
                and_(
                    Budget.user_id == user_id,
                    Budget.category_id == budget_data.category_id,
                    Budget.year == budget_data.year,
                    Budget.month == budget_data.month,
                    Budget.is_active == True
                )
            )
        )
        
        if existing.scalar_one_or_none():
            raise ValidationError("Orçamento já existe para esta categoria e período")
        
        budget = Budget(
            user_id=user_id,
            **budget_data.dict()
        )
        
        self.db.add(budget)
        await self.db.commit()
        await self.db.refresh(budget)
        
        return budget
    
    async def get_user_budgets(
        self, 
        user_id: UUID,
        year: Optional[int] = None,
        month: Optional[int] = None,
        category_id: Optional[UUID] = None
    ) -> List[BudgetRead]:
        """Lista orçamentos do usuário com filtros"""
        
        query = select(Budget).options(
            joinedload(Budget.category)
        ).where(
            and_(
                Budget.user_id == user_id,
                Budget.is_active == True
            )
        )
        
        if year:
            query = query.where(Budget.year == year)
        if month:
            query = query.where(Budget.month == month)
        if category_id:
            query = query.where(Budget.category_id == category_id)
        
        result = await self.db.execute(query)
        budgets = result.scalars().all()
        
        # Calcula valores gastos para cada orçamento
        budget_reads = []
        for budget in budgets:
            spent_amount = await self._calculate_spent_amount(user_id, budget)
            budget_read = self._budget_to_read(budget, spent_amount)
            budget_reads.append(budget_read)
        
        return budget_reads
    
    async def update_budget(self, user_id: UUID, budget_id: UUID, update_data: BudgetUpdate) -> Budget:
        """Atualiza orçamento existente"""
        
        budget = await self._get_user_budget_or_404(user_id, budget_id)
        
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(budget, field, value)
        
        await self.db.commit()
        await self.db.refresh(budget)
        
        return budget
    
    async def delete_budget(self, user_id: UUID, budget_id: UUID) -> None:
        """Remove orçamento (soft delete)"""
        
        budget = await self._get_user_budget_or_404(user_id, budget_id)
        budget.is_active = False
        
        await self.db.commit()
    
    async def get_budget_summary(self, user_id: UUID, year: int, month: int) -> dict:
        """Retorna resumo dos orçamentos para o dashboard"""
        
        budgets = await self.get_user_budgets(user_id, year, month)
        
        if not budgets:
            return {
                "total_budgets": 0,
                "total_limit": Decimal("0"),
                "total_spent": Decimal("0"),
                "average_percentage": 0.0,
                "budgets_exceeded": 0,
                "budgets_warning": 0,
                "budgets_safe": 0
            }
        
        total_limit = sum(b.limit_amount for b in budgets)
        total_spent = sum(b.spent_amount for b in budgets)
        
        status_counts = {"safe": 0, "warning": 0, "danger": 0, "exceeded": 0}
        for budget in budgets:
            status_counts[budget.status] += 1
        
        return {
            "total_budgets": len(budgets),
            "total_limit": total_limit,
            "total_spent": total_spent,
            "average_percentage": float((total_spent / total_limit * 100)) if total_limit > 0 else 0,
            "budgets_exceeded": status_counts["exceeded"],
            "budgets_warning": status_counts["warning"] + status_counts["danger"],
            "budgets_safe": status_counts["safe"]
        }
    
    # Métodos privados auxiliares
    async def _get_user_budget_or_404(self, user_id: UUID, budget_id: UUID) -> Budget:
        """Busca orçamento ou levanta 404"""
        
        result = await self.db.execute(
            select(Budget).where(
                and_(
                    Budget.id == budget_id,
                    Budget.user_id == user_id,
                    Budget.is_active == True
                )
            )
        )
        
        budget = result.scalar_one_or_none()
        if not budget:
            raise NotFoundError("Orçamento não encontrado")
        
        return budget
    
    async def _calculate_spent_amount(self, user_id: UUID, budget: Budget) -> Decimal:
        """Calcula valor gasto no período do orçamento"""
        
        # Data inicial e final do mês
        start_date = date(budget.year, budget.month, 1)
        if budget.month == 12:
            end_date = date(budget.year + 1, 1, 1)
        else:
            end_date = date(budget.year, budget.month + 1, 1)
        
        # Soma transações de despesa da categoria no período
        result = await self.db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.category_id == budget.category_id,
                    Transaction.transaction_type == "expense",
                    Transaction.date >= start_date,
                    Transaction.date < end_date,
                    Transaction.is_confirmed == True
                )
            )
        )
        
        return result.scalar_one() or Decimal("0")
    
    def _budget_to_read(self, budget: Budget, spent_amount: Decimal) -> BudgetRead:
        """Converte Budget model para BudgetRead schema"""
        
        spent_percentage = float(spent_amount / budget.limit_amount * 100) if budget.limit_amount > 0 else 0
        remaining_amount = max(budget.limit_amount - spent_amount, Decimal("0"))
        
        # Determina status baseado na porcentagem gasta
        if spent_percentage >= 100:
            status = "exceeded"
        elif spent_percentage >= budget.alert_percentage_2:
            status = "danger"
        elif spent_percentage >= budget.alert_percentage_1:
            status = "warning"
        else:
            status = "safe"
        
        return BudgetRead(
            **budget.__dict__,
            spent_amount=spent_amount,
            spent_percentage=spent_percentage,
            remaining_amount=remaining_amount,
            status=status,
            category_name=budget.category.name,
            category_icon=budget.category.icon
        )
```

### 4. API Endpoints (FastAPI)

```python
# app/api/v1/budgets.py
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetRead
from app.services.budget_service import BudgetService
from app.core.exceptions import NotFoundError, ValidationError

router = APIRouter()

@router.post("/", response_model=BudgetRead, status_code=201)
async def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cria novo orçamento para o usuário"""
    
    service = BudgetService(db)
    try:
        budget = await service.create_budget(current_user.id, budget_data)
        # Busca novamente com dados calculados
        budgets = await service.get_user_budgets(current_user.id)
        created_budget = next(b for b in budgets if b.id == budget.id)
        return created_budget
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[BudgetRead])
async def list_budgets(
    year: Optional[int] = Query(None, description="Filtrar por ano"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Filtrar por mês"),
    category_id: Optional[UUID] = Query(None, description="Filtrar por categoria"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lista orçamentos do usuário com filtros opcionais"""
    
    service = BudgetService(db)
    return await service.get_user_budgets(current_user.id, year, month, category_id)

@router.get("/summary")
async def get_budget_summary(
    year: int = Query(..., description="Ano para o resumo"),
    month: int = Query(..., ge=1, le=12, description="Mês para o resumo"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retorna resumo dos orçamentos para dashboard"""
    
    service = BudgetService(db)
    return await service.get_budget_summary(current_user.id, year, month)

@router.get("/{budget_id}", response_model=BudgetRead)
async def get_budget(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Busca orçamento específico por ID"""
    
    service = BudgetService(db)
    try:
        budgets = await service.get_user_budgets(current_user.id)
        budget = next((b for b in budgets if b.id == budget_id), None)
        if not budget:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")
        return budget
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")

@router.put("/{budget_id}", response_model=BudgetRead)
async def update_budget(
    budget_id: UUID,
    update_data: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Atualiza orçamento existente"""
    
    service = BudgetService(db)
    try:
        await service.update_budget(current_user.id, budget_id, update_data)
        # Retorna orçamento atualizado com cálculos
        budgets = await service.get_user_budgets(current_user.id)
        updated_budget = next(b for b in budgets if b.id == budget_id)
        return updated_budget
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")

@router.delete("/{budget_id}", status_code=204)
async def delete_budget(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove orçamento"""
    
    service = BudgetService(db)
    try:
        await service.delete_budget(current_user.id, budget_id)
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")
```

---

## 🎨 Frontend Architecture

### 1. Types (TypeScript)

```typescript
// src/types/budget.ts
export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  year: number;
  month: number;
  limitAmount: number;
  alertPercentage1: number;
  alertPercentage2: number;
  alertsEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Campos calculados
  spentAmount: number;
  spentPercentage: number;
  remainingAmount: number;
  status: 'safe' | 'warning' | 'danger' | 'exceeded';
  
  // Dados da categoria
  categoryName: string;
  categoryIcon?: string;
}

export interface BudgetCreate {
  categoryId: string;
  year: number;
  month: number;
  limitAmount: number;
  alertPercentage1?: number;
  alertPercentage2?: number;
  alertsEnabled?: boolean;
}

export interface BudgetUpdate {
  limitAmount?: number;
  alertPercentage1?: number;
  alertPercentage2?: number;
  alertsEnabled?: boolean;
}

export interface BudgetSummary {
  totalBudgets: number;
  totalLimit: number;
  totalSpent: number;
  averagePercentage: number;
  budgetsExceeded: number;
  budgetsWarning: number;
  budgetsSafe: number;
}
```

### 2. Services (API Integration)

```typescript
// src/services/budgetService.ts
import axios from 'axios';
import { Budget, BudgetCreate, BudgetUpdate, BudgetSummary } from '../types/budget';

const API_BASE = '/api/v1/budgets';

export const budgetService = {
  // Criar orçamento
  async create(data: BudgetCreate): Promise<Budget> {
    const response = await axios.post<Budget>(API_BASE, data);
    return response.data;
  },

  // Listar orçamentos
  async list(filters?: {
    year?: number;
    month?: number;
    categoryId?: string;
  }): Promise<Budget[]> {
    const response = await axios.get<Budget[]>(API_BASE, {
      params: filters
    });
    return response.data;
  },

  // Buscar orçamento por ID
  async getById(id: string): Promise<Budget> {
    const response = await axios.get<Budget>(`${API_BASE}/${id}`);
    return response.data;
  },

  // Atualizar orçamento
  async update(id: string, data: BudgetUpdate): Promise<Budget> {
    const response = await axios.put<Budget>(`${API_BASE}/${id}`, data);
    return response.data;
  },

  // Excluir orçamento
  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  },

  // Resumo para dashboard
  async getSummary(year: number, month: number): Promise<BudgetSummary> {
    const response = await axios.get<BudgetSummary>(`${API_BASE}/summary`, {
      params: { year, month }
    });
    return response.data;
  }
};
```

### 3. Store (Redux Toolkit)

```typescript
// src/store/slices/budgetSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Budget, BudgetCreate, BudgetUpdate } from '../../types/budget';
import { budgetService } from '../../services/budgetService';

interface BudgetState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  currentBudget: Budget | null;
}

const initialState: BudgetState = {
  budgets: [],
  loading: false,
  error: null,
  currentBudget: null
};

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (filters?: { year?: number; month?: number; categoryId?: string }) => {
    return await budgetService.list(filters);
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (data: BudgetCreate) => {
    return await budgetService.create(data);
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, data }: { id: string; data: BudgetUpdate }) => {
    return await budgetService.update(id, data);
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string) => {
    await budgetService.delete(id);
    return id;
  }
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBudget: (state, action: PayloadAction<Budget | null>) => {
      state.currentBudget = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao carregar orçamentos';
      })
      
      // Create budget
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.push(action.payload);
      })
      
      // Update budget
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter(b => b.id !== action.payload);
      });
  }
});

export const { clearError, setCurrentBudget } = budgetSlice.actions;
export default budgetSlice.reducer;
```

---

## 🔄 Integrações e Dependências

### 1. Categories System
- **Dependência**: Tabela `categories` deve existir
- **Relacionamento**: Budget -> Category (N:1)
- **Validação**: CategoryId deve ser válido e pertencer ao usuário

### 2. Transactions Integration
- **Cálculo**: Valores gastos baseados em transações confirmadas
- **Filtros**: Tipo="expense", Categoria matching, Período correto
- **Performance**: Query otimizada com indexes

### 3. Notifications System (Futuro)
- **Alertas**: Trigger quando atingir percentuais configurados
- **Canais**: In-app notifications, email (opcional)
- **Frequência**: Tempo real via WebSocket ou polling

---

## 🧪 Strategy de Testes

### Backend Tests (pytest)

```python
# tests/services/test_budget_service.py
@pytest.mark.asyncio
async def test_create_budget_success():
    # Testa criação de orçamento válido
    pass

@pytest.mark.asyncio  
async def test_create_duplicate_budget_fails():
    # Testa que não permite orçamento duplicado
    pass

@pytest.mark.asyncio
async def test_calculate_spent_amount():
    # Testa cálculo correto de valores gastos
    pass

# tests/api/test_budgets.py
def test_create_budget_endpoint():
    # Testa endpoint POST /budgets
    pass

def test_list_budgets_with_filters():
    # Testa endpoint GET /budgets com filtros
    pass
```

### Frontend Tests (Vitest + RTL)

```typescript
// src/components/BudgetCard.test.tsx
describe('BudgetCard', () => {
  it('should display budget information correctly', () => {
    // Testa renderização do card
  });
  
  it('should show warning color when over 80%', () => {
    // Testa cores baseadas em percentual
  });
});

// src/services/budgetService.test.ts
describe('budgetService', () => {
  it('should create budget successfully', async () => {
    // Testa chamada da API
  });
});
```

---

## 📈 Performance Considerations

### Database Optimizations
1. **Indexes**: user_id + year + month para queries rápidas
2. **Query Optimization**: joinedload para evitar N+1
3. **Aggregations**: Use SQL SUM() ao invés de Python sum()

### Caching Strategy
1. **Budget Summary**: Cache por 5 minutos (dados mudam pouco)
2. **Spent Calculations**: Cache por 1 minuto (atualiza com transações)
3. **Categories**: Cache por 1 hora (raramente mudam)

### Frontend Performance
1. **React.memo**: Componentes de budget card
2. **useMemo**: Cálculos de percentuais e status
3. **Lazy Loading**: Carregar orçamentos sob demanda
4. **Virtualization**: Para listas muito grandes (>50 orçamentos)

---

## 🔧 Migration Strategy

### 1. Database Migration

```python
# alembic/versions/xxx_add_budgets_table.py
def upgrade():
    op.create_table('budgets',
        sa.Column('id', postgresql.UUID(), nullable=False),
        sa.Column('user_id', postgresql.UUID(), nullable=False),
        sa.Column('category_id', postgresql.UUID(), nullable=False),
        # ... demais colunas
        sa.ForeignKeyConstraint(['category_id'], ['categories.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Indexes
    op.create_index('idx_budgets_user_period', 'budgets', ['user_id', 'year', 'month'])
    op.create_index('idx_budgets_user_category', 'budgets', ['user_id', 'category_id'])

def downgrade():
    op.drop_table('budgets')
```

### 2. Deployment Steps

1. **Backend Deploy**:
   - Run migration
   - Deploy new API endpoints
   - Test endpoints manually

2. **Frontend Deploy**:
   - Deploy new components
   - Feature flag for gradual rollout
   - Monitor error rates

3. **Data Migration** (se necessário):
   - Script para migrar orçamentos existentes
   - Validação de integridade

---

## 🎯 Success Metrics

### Technical Metrics
- **API Response Time**: <200ms p95 para endpoints de orçamento
- **Database Query Time**: <50ms para cálculos de spent_amount
- **Frontend Bundle Size**: +<50KB após feature

### Business Metrics  
- **Adoption Rate**: 40% usuários criam orçamento primeiro mês
- **Error Rate**: <1% para operações CRUD de orçamentos
- **User Satisfaction**: SUS score >80 para funcionalidade

---

## 🔗 Próximos Passos

1. **Fase 1**: Implementar CRUD básico (Backend + Frontend)
2. **Fase 2**: Sistema de alertas e notificações
3. **Fase 3**: Relatórios avançados de orçamentos
4. **Fase 4**: Orçamentos colaborativos (sharing)

---

<div align="center">
**Arquitetura aprovada pelo Tech Lead em 26/08/2025**
**Pronta para implementação pelo time de desenvolvimento**
</div>
