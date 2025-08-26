from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.deps import get_current_user, get_session
from ...models.user import User
from ...schemas.budget import BudgetCreate, BudgetUpdate, BudgetRead, BudgetSummary
from ...services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.post("/", response_model=BudgetRead, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Cria um novo orçamento para o usuário.
    
    - **category_id**: ID da categoria para o orçamento
    - **amount**: Valor limite do orçamento  
    - **start_date**: Data de início do período
    - **end_date**: Data de fim do período
    - **alert_threshold**: % para alerta (opcional)
    - **notes**: Observações (opcional)
    """
    budget_service = BudgetService(session)
    return await budget_service.create_budget(current_user.id, budget_data)


@router.get("/", response_model=List[BudgetRead])
async def list_user_budgets(
    category_id: Optional[UUID] = Query(None, description="Filtrar por categoria"),
    is_active: Optional[bool] = Query(None, description="Filtrar por orçamentos ativos/inativos"),
    limit: int = Query(100, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Lista orçamentos do usuário com filtros opcionais.
    
    - **category_id**: Filtrar por categoria específica
    - **is_active**: true para orçamentos ativos, false para expirados
    - **limit**: Número máximo de resultados (1-100)
    - **offset**: Número de registros para pular
    """
    budget_service = BudgetService(session)
    return await budget_service.get_user_budgets(
        user_id=current_user.id,
        category_id=category_id,
        is_active=is_active,
        limit=limit,
        offset=offset
    )


@router.get("/active/summary", response_model=List[BudgetSummary])
async def get_active_budgets_summary(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Retorna resumo de todos os orçamentos ativos do usuário.
    
    Inclui informações como:
    - Valor orçado vs gasto
    - Porcentagem utilizada  
    - Status (dentro, alerta, excedido)
    - Dias restantes no período
    """
    budget_service = BudgetService(session)
    return await budget_service.get_active_budgets_summary(current_user.id)


@router.get("/{budget_id}", response_model=BudgetRead)
async def get_budget(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Busca orçamento específico do usuário.
    
    - **budget_id**: ID do orçamento
    """
    budget_service = BudgetService(session)
    return await budget_service.get_budget_by_id(current_user.id, budget_id)


@router.get("/{budget_id}/summary", response_model=BudgetSummary)
async def get_budget_summary(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Retorna resumo detalhado de um orçamento específico.
    
    Inclui análise de gastos no período, status de alerta,
    dias restantes e comparação com limite estabelecido.
    
    - **budget_id**: ID do orçamento
    """
    budget_service = BudgetService(session)
    return await budget_service.get_budget_summary(current_user.id, budget_id)


@router.put("/{budget_id}", response_model=BudgetRead)
async def update_budget(
    budget_id: UUID,
    budget_update: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Atualiza orçamento existente.
    
    Permite alterar qualquer campo do orçamento, validando
    conflitos de período e categoria.
    
    - **budget_id**: ID do orçamento
    - **budget_update**: Campos a serem atualizados
    """
    budget_service = BudgetService(session)
    return await budget_service.update_budget(current_user.id, budget_id, budget_update)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Remove orçamento do usuário.
    
    Esta ação é irreversível. O orçamento será completamente
    removido do sistema.
    
    - **budget_id**: ID do orçamento
    """
    budget_service = BudgetService(session)
    await budget_service.delete_budget(current_user.id, budget_id)
    return None
