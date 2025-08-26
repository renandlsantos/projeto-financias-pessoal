from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select, and_, or_, func, extract
from fastapi import HTTPException, status

from ..models.budget import Budget
from ..models.category import Category
from ..models.transaction import Transaction
from ..models.user import User
from ..schemas.budget import BudgetCreate, BudgetUpdate, BudgetRead, BudgetSummary
from ..core.database import get_session


class BudgetService:
    """
    Serviço responsável por gerenciar orçamentos dos usuários.
    Implementa regras de negócio para criação, atualização e análise de orçamentos.
    """
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_budget(self, user_id: UUID, budget_data: BudgetCreate) -> BudgetRead:
        """
        Cria um novo orçamento para o usuário.
        Valida se a categoria existe e pertence ao usuário.
        """
        # Verificar se categoria existe e pertence ao usuário
        category = await self._get_user_category(user_id, budget_data.category_id)
        
        # Verificar se já existe orçamento ativo para esta categoria no período
        existing_budget = await self._check_existing_budget(
            user_id, budget_data.category_id, budget_data.start_date, budget_data.end_date
        )
        
        if existing_budget:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Já existe um orçamento ativo para a categoria '{category.name}' neste período"
            )
        
        # Criar orçamento
        budget = Budget(
            user_id=user_id,
            category_id=budget_data.category_id,
            amount=budget_data.amount,
            start_date=budget_data.start_date,
            end_date=budget_data.end_date,
            alert_threshold=budget_data.alert_threshold,
            notes=budget_data.notes
        )
        
        self.session.add(budget)
        await self.session.commit()
        await self.session.refresh(budget)
        
        # Carregar relacionamentos
        budget = await self._get_budget_with_relations(budget.id)
        return BudgetRead.from_orm(budget)

    async def get_user_budgets(
        self, 
        user_id: UUID, 
        category_id: Optional[UUID] = None,
        is_active: Optional[bool] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[BudgetRead]:
        """
        Busca orçamentos do usuário com filtros opcionais.
        """
        query = select(Budget).where(Budget.user_id == user_id)
        
        if category_id:
            query = query.where(Budget.category_id == category_id)
            
        if is_active is not None:
            current_date = datetime.now().date()
            if is_active:
                query = query.where(
                    and_(
                        Budget.start_date <= current_date,
                        Budget.end_date >= current_date
                    )
                )
            else:
                query = query.where(
                    and_(
                        Budget.end_date < current_date
                    )
                )
        
        query = query.options(
            joinedload(Budget.category)
        ).order_by(Budget.start_date.desc()).limit(limit).offset(offset)
        
        result = await self.session.execute(query)
        budgets = result.unique().scalars().all()
        
        return [BudgetRead.from_orm(budget) for budget in budgets]

    async def get_budget_by_id(self, user_id: UUID, budget_id: UUID) -> BudgetRead:
        """
        Busca orçamento específico do usuário.
        """
        budget = await self._get_budget_with_relations(budget_id)
        
        if not budget or budget.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Orçamento não encontrado"
            )
        
        return BudgetRead.from_orm(budget)

    async def update_budget(
        self, 
        user_id: UUID, 
        budget_id: UUID, 
        budget_update: BudgetUpdate
    ) -> BudgetRead:
        """
        Atualiza orçamento existente.
        """
        budget = await self._get_budget_with_relations(budget_id)
        
        if not budget or budget.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Orçamento não encontrado"
            )
        
        # Se mudando categoria, verificar conflitos
        if budget_update.category_id and budget_update.category_id != budget.category_id:
            await self._get_user_category(user_id, budget_update.category_id)
            
            # Verificar conflito de período com a nova categoria
            existing_budget = await self._check_existing_budget(
                user_id, 
                budget_update.category_id, 
                budget_update.start_date or budget.start_date,
                budget_update.end_date or budget.end_date,
                exclude_budget_id=budget_id
            )
            
            if existing_budget:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Já existe um orçamento ativo para esta categoria no período especificado"
                )
        
        # Atualizar campos
        update_data = budget_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(budget, field, value)
        
        budget.updated_at = datetime.utcnow()
        
        await self.session.commit()
        await self.session.refresh(budget)
        
        budget = await self._get_budget_with_relations(budget.id)
        return BudgetRead.from_orm(budget)

    async def delete_budget(self, user_id: UUID, budget_id: UUID) -> bool:
        """
        Remove orçamento do usuário.
        """
        budget = await self.session.get(Budget, budget_id)
        
        if not budget or budget.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Orçamento não encontrado"
            )
        
        await self.session.delete(budget)
        await self.session.commit()
        return True

    async def get_budget_summary(self, user_id: UUID, budget_id: UUID) -> BudgetSummary:
        """
        Calcula resumo do orçamento com gastos atuais.
        """
        budget = await self._get_budget_with_relations(budget_id)
        
        if not budget or budget.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Orçamento não encontrado"
            )
        
        # Calcular gastos no período
        spent_amount = await self._calculate_spent_amount(
            user_id, budget.category_id, budget.start_date, budget.end_date
        )
        
        # Calcular métricas
        remaining_amount = budget.amount - spent_amount
        percentage_used = (spent_amount / budget.amount * 100) if budget.amount > 0 else 0
        
        # Determinar status
        if percentage_used >= 100:
            status_budget = "exceeded"
        elif budget.alert_threshold and percentage_used >= budget.alert_threshold:
            status_budget = "warning"
        else:
            status_budget = "on_track"
        
        # Dias restantes
        current_date = datetime.now().date()
        days_remaining = max(0, (budget.end_date - current_date).days)
        
        return BudgetSummary(
            budget_id=budget.id,
            amount=budget.amount,
            spent_amount=spent_amount,
            remaining_amount=remaining_amount,
            percentage_used=round(percentage_used, 2),
            status=status_budget,
            days_remaining=days_remaining,
            category_name=budget.category.name,
            period_start=budget.start_date,
            period_end=budget.end_date
        )

    async def get_active_budgets_summary(self, user_id: UUID) -> List[BudgetSummary]:
        """
        Retorna resumo de todos os orçamentos ativos do usuário.
        """
        current_date = datetime.now().date()
        
        query = select(Budget).where(
            and_(
                Budget.user_id == user_id,
                Budget.start_date <= current_date,
                Budget.end_date >= current_date
            )
        ).options(joinedload(Budget.category))
        
        result = await self.session.execute(query)
        active_budgets = result.unique().scalars().all()
        
        summaries = []
        for budget in active_budgets:
            summary = await self.get_budget_summary(user_id, budget.id)
            summaries.append(summary)
        
        return summaries

    # Métodos privados auxiliares
    
    async def _get_user_category(self, user_id: UUID, category_id: UUID) -> Category:
        """Busca categoria verificando se pertence ao usuário ou é do sistema."""
        query = select(Category).where(
            and_(
                Category.id == category_id,
                Category.is_active == True,
                or_(
                    Category.user_id == user_id,
                    Category.is_system == True
                )
            )
        )
        
        result = await self.session.execute(query)
        category = result.scalar_one_or_none()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada"
            )
        
        return category

    async def _check_existing_budget(
        self, 
        user_id: UUID, 
        category_id: UUID, 
        start_date: datetime.date, 
        end_date: datetime.date,
        exclude_budget_id: Optional[UUID] = None
    ) -> Optional[Budget]:
        """Verifica se já existe orçamento para a categoria no período."""
        query = select(Budget).where(
            and_(
                Budget.user_id == user_id,
                Budget.category_id == category_id,
                or_(
                    and_(Budget.start_date <= start_date, Budget.end_date >= start_date),
                    and_(Budget.start_date <= end_date, Budget.end_date >= end_date),
                    and_(Budget.start_date >= start_date, Budget.end_date <= end_date)
                )
            )
        )
        
        if exclude_budget_id:
            query = query.where(Budget.id != exclude_budget_id)
        
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def _get_budget_with_relations(self, budget_id: UUID) -> Optional[Budget]:
        """Busca orçamento com relacionamentos carregados."""
        query = select(Budget).where(Budget.id == budget_id).options(
            joinedload(Budget.category)
        )
        
        result = await self.session.execute(query)
        return result.unique().scalar_one_or_none()

    async def _calculate_spent_amount(
        self, 
        user_id: UUID, 
        category_id: UUID, 
        start_date: datetime.date, 
        end_date: datetime.date
    ) -> Decimal:
        """Calcula total gasto na categoria no período."""
        query = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.category_id == category_id,
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.type == 'expense'  # Apenas despesas
            )
        )
        
        result = await self.session.execute(query)
        return result.scalar() or Decimal('0.00')


# Função helper para obter instância do serviço
async def get_budget_service() -> BudgetService:
    """Dependency injection para BudgetService."""
    async with get_session() as session:
        return BudgetService(session)
