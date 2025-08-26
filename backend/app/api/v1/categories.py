from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.deps import get_current_user
from ...core.database import get_db
from ...models.user import User
from ...models.category import TransactionTypeEnum
from ...schemas.category import (
    CategoryCreate, 
    CategoryUpdate, 
    CategoryRead, 
    CategoryWithSubcategories,
    TransactionType
)
from ...services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Cria uma nova categoria para o usuário.
    
    - **name**: Nome da categoria (2-100 caracteres)
    - **type**: Tipo da transação (income, expense, transfer)
    - **icon**: Ícone da categoria (opcional)
    - **color**: Cor em hexadecimal #RRGGBB (opcional)
    - **parent_id**: ID da categoria pai para subcategorias (opcional)
    - **sort_order**: Ordem de exibição (0-999)
    """
    category_service = CategoryService(session)
    return await category_service.create_category(current_user.id, category_data)


@router.get("/", response_model=List[CategoryRead])
async def list_user_categories(
    type_filter: Optional[TransactionType] = Query(None, description="Filtrar por tipo de transação"),
    parent_id: Optional[UUID] = Query(None, description="Filtrar por categoria pai"),
    include_system: bool = Query(True, description="Incluir categorias do sistema"),
    include_subcategories: bool = Query(False, description="Incluir subcategorias na listagem"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Lista categorias do usuário com filtros opcionais.
    
    - **type_filter**: Filtrar por tipo (income, expense, transfer)
    - **parent_id**: Mostrar subcategorias de uma categoria específica
    - **include_system**: Incluir categorias padrão do sistema
    - **include_subcategories**: Mostrar subcategorias junto com principais
    """
    category_service = CategoryService(session)
    
    # Converter TransactionType para TransactionTypeEnum
    type_enum = None
    if type_filter:
        type_enum = TransactionTypeEnum(type_filter.value)
    
    return await category_service.get_user_categories(
        user_id=current_user.id,
        type_filter=type_enum,
        parent_id=parent_id,
        include_system=include_system,
        include_subcategories=include_subcategories
    )


@router.get("/with-subcategories", response_model=List[CategoryWithSubcategories])
async def list_categories_with_subcategories(
    type_filter: Optional[TransactionType] = Query(None, description="Filtrar por tipo de transação"),
    include_system: bool = Query(True, description="Incluir categorias do sistema"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Lista categorias principais com suas subcategorias aninhadas.
    
    Retorna estrutura hierárquica completa com categorias principais
    e todas as subcategorias relacionadas.
    
    - **type_filter**: Filtrar por tipo (income, expense, transfer)  
    - **include_system**: Incluir categorias padrão do sistema
    """
    category_service = CategoryService(session)
    
    # Converter TransactionType para TransactionTypeEnum
    type_enum = None
    if type_filter:
        type_enum = TransactionTypeEnum(type_filter.value)
    
    return await category_service.get_categories_with_subcategories(
        user_id=current_user.id,
        type_filter=type_enum,
        include_system=include_system
    )


@router.get("/system", response_model=List[CategoryRead])
async def list_system_categories(
    type_filter: Optional[TransactionType] = Query(None, description="Filtrar por tipo de transação"),
    session: AsyncSession = Depends(get_db)
):
    """
    Lista categorias padrão do sistema.
    
    Retorna categorias pré-definidas disponíveis para todos os usuários.
    
    - **type_filter**: Filtrar por tipo (income, expense, transfer)
    """
    category_service = CategoryService(session)
    
    # Converter TransactionType para TransactionTypeEnum
    type_enum = None
    if type_filter:
        type_enum = TransactionTypeEnum(type_filter.value)
    
    return await category_service.get_system_categories(type_filter=type_enum)


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Busca categoria específica por ID.
    
    Verifica se a categoria pertence ao usuário ou é do sistema.
    
    - **category_id**: ID da categoria
    """
    category_service = CategoryService(session)
    return await category_service.get_category_by_id(current_user.id, category_id)


@router.put("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: UUID,
    category_update: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Atualiza categoria existente do usuário.
    
    Apenas categorias criadas pelo usuário podem ser modificadas.
    Categorias do sistema são somente leitura.
    
    - **category_id**: ID da categoria
    - **category_update**: Campos a serem atualizados
    """
    category_service = CategoryService(session)
    return await category_service.update_category(current_user.id, category_id, category_update)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Remove categoria do usuário (soft delete).
    
    A categoria será desativada mas não removida fisicamente.
    Não é possível remover categorias que estão sendo usadas
    em transações, orçamentos ou possuem subcategorias.
    
    - **category_id**: ID da categoria
    """
    category_service = CategoryService(session)
    await category_service.delete_category(current_user.id, category_id)
    return None
