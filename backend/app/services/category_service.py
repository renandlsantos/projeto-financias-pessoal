from typing import Optional, List
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select, and_, or_, func
from fastapi import HTTPException, status

from ..models.category import Category, TransactionTypeEnum
from ..models.user import User
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryRead, CategoryWithSubcategories
from ..core.database import get_session


class CategoryService:
    """
    Serviço responsável por gerenciar categorias de transações.
    Implementa hierarquia de categorias (pai/subcategorias) e categorias do sistema.
    """
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_category(self, user_id: UUID, category_data: CategoryCreate) -> CategoryRead:
        """
        Cria nova categoria para o usuário.
        Valida hierarquia e duplicatas.
        """
        # Verificar se já existe categoria com mesmo nome e tipo para o usuário
        existing_category = await self._check_duplicate_category(
            user_id, category_data.name, category_data.type, category_data.parent_id
        )
        
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Já existe uma categoria '{category_data.name}' deste tipo"
            )
        
        # Validar categoria pai se fornecida
        if category_data.parent_id:
            parent_category = await self._get_user_category(user_id, category_data.parent_id)
            
            # Validar que pai e filho são do mesmo tipo
            if parent_category.type != category_data.type:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria pai deve ser do mesmo tipo da subcategoria"
                )
            
            # Validar que pai não é subcategoria (máximo 2 níveis)
            if parent_category.parent_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Não é possível criar subcategoria de uma subcategoria (máximo 2 níveis)"
                )
        
        # Criar categoria
        category = Category(
            user_id=user_id,
            name=category_data.name,
            type=category_data.type,
            icon=category_data.icon,
            color=category_data.color,
            parent_id=category_data.parent_id,
            sort_order=category_data.sort_order,
            is_system=False
        )
        
        self.session.add(category)
        await self.session.commit()
        await self.session.refresh(category)
        
        return await self._category_to_read(category)

    async def get_user_categories(
        self, 
        user_id: UUID, 
        type_filter: Optional[TransactionTypeEnum] = None,
        parent_id: Optional[UUID] = None,
        include_system: bool = True,
        include_subcategories: bool = False
    ) -> List[CategoryRead]:
        """
        Busca categorias do usuário com filtros opcionais.
        """
        query = select(Category).where(
            and_(
                or_(
                    Category.user_id == user_id,
                    and_(Category.is_system == True, include_system == True)
                ),
                Category.is_active == True
            )
        )
        
        if type_filter:
            query = query.where(Category.type == type_filter)
            
        if parent_id:
            query = query.where(Category.parent_id == parent_id)
        elif parent_id is None and not include_subcategories:
            # Mostrar apenas categorias principais (sem pai)
            query = query.where(Category.parent_id.is_(None))
        
        query = query.order_by(Category.sort_order, Category.name)
        
        result = await self.session.execute(query)
        categories = result.scalars().all()
        
        category_reads = []
        for category in categories:
            category_read = await self._category_to_read(category)
            category_reads.append(category_read)
        
        return category_reads

    async def get_categories_with_subcategories(
        self, 
        user_id: UUID, 
        type_filter: Optional[TransactionTypeEnum] = None,
        include_system: bool = True
    ) -> List[CategoryWithSubcategories]:
        """
        Busca categorias principais com suas subcategorias.
        """
        # Buscar categorias principais
        main_categories = await self.get_user_categories(
            user_id, type_filter, parent_id=None, include_system=include_system
        )
        
        result = []
        for main_category in main_categories:
            # Buscar subcategorias
            subcategories = await self.get_user_categories(
                user_id, type_filter, parent_id=main_category.id, include_system=include_system
            )
            
            category_with_subs = CategoryWithSubcategories(
                **main_category.dict(),
                subcategories=subcategories
            )
            result.append(category_with_subs)
        
        return result

    async def get_category_by_id(self, user_id: UUID, category_id: UUID) -> CategoryRead:
        """
        Busca categoria específica verificando permissões.
        """
        category = await self._get_user_category(user_id, category_id)
        return await self._category_to_read(category)

    async def update_category(
        self, 
        user_id: UUID, 
        category_id: UUID, 
        category_update: CategoryUpdate
    ) -> CategoryRead:
        """
        Atualiza categoria existente.
        Apenas categorias do usuário podem ser atualizadas.
        """
        category = await self.session.get(Category, category_id)
        
        if not category or category.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada ou não pertence ao usuário"
            )
        
        if category.is_system:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Categorias do sistema não podem ser modificadas"
            )
        
        # Verificar duplicata se alterando nome
        if category_update.name and category_update.name != category.name:
            existing_category = await self._check_duplicate_category(
                user_id, category_update.name, category.type, category.parent_id, exclude_id=category_id
            )
            
            if existing_category:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Já existe uma categoria '{category_update.name}' deste tipo"
                )
        
        # Atualizar campos
        update_data = category_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        
        category.updated_at = datetime.utcnow()
        
        await self.session.commit()
        await self.session.refresh(category)
        
        return await self._category_to_read(category)

    async def delete_category(self, user_id: UUID, category_id: UUID) -> bool:
        """
        Remove categoria do usuário (soft delete).
        Verifica se categoria não está sendo usada.
        """
        category = await self.session.get(Category, category_id)
        
        if not category or category.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada ou não pertence ao usuário"
            )
        
        if category.is_system:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Categorias do sistema não podem ser removidas"
            )
        
        # Verificar se possui subcategorias ativas
        subcategories_count = await self._count_active_subcategories(category_id)
        if subcategories_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Não é possível remover categoria que possui subcategorias ativas"
            )
        
        # Verificar se está sendo usada em transações ou orçamentos
        is_being_used = await self._check_category_usage(category_id)
        if is_being_used:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Não é possível remover categoria que está sendo usada em transações ou orçamentos"
            )
        
        # Soft delete
        category.is_active = False
        category.updated_at = datetime.utcnow()
        
        await self.session.commit()
        return True

    async def get_system_categories(self, type_filter: Optional[TransactionTypeEnum] = None) -> List[CategoryRead]:
        """
        Retorna categorias padrão do sistema.
        """
        query = select(Category).where(
            and_(
                Category.is_system == True,
                Category.is_active == True
            )
        )
        
        if type_filter:
            query = query.where(Category.type == type_filter)
        
        query = query.order_by(Category.sort_order, Category.name)
        
        result = await self.session.execute(query)
        categories = result.scalars().all()
        
        category_reads = []
        for category in categories:
            category_read = await self._category_to_read(category)
            category_reads.append(category_read)
        
        return category_reads

    # Métodos privados auxiliares
    
    async def _get_user_category(self, user_id: UUID, category_id: UUID) -> Category:
        """Busca categoria verificando permissões do usuário."""
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

    async def _check_duplicate_category(
        self, 
        user_id: UUID, 
        name: str, 
        type_enum: TransactionTypeEnum, 
        parent_id: Optional[UUID] = None,
        exclude_id: Optional[UUID] = None
    ) -> Optional[Category]:
        """Verifica se já existe categoria com mesmo nome e contexto."""
        query = select(Category).where(
            and_(
                Category.user_id == user_id,
                Category.name == name,
                Category.type == type_enum,
                Category.parent_id == parent_id,
                Category.is_active == True
            )
        )
        
        if exclude_id:
            query = query.where(Category.id != exclude_id)
        
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def _count_active_subcategories(self, category_id: UUID) -> int:
        """Conta subcategorias ativas de uma categoria."""
        query = select(func.count(Category.id)).where(
            and_(
                Category.parent_id == category_id,
                Category.is_active == True
            )
        )
        
        result = await self.session.execute(query)
        return result.scalar() or 0

    async def _check_category_usage(self, category_id: UUID) -> bool:
        """Verifica se categoria está sendo usada em transações ou orçamentos."""
        # Importação local para evitar circular import
        from ..models.transaction import Transaction
        from ..models.budget import Budget
        
        # Verificar transações
        transaction_query = select(func.count(Transaction.id)).where(
            Transaction.category_id == category_id
        )
        transaction_result = await self.session.execute(transaction_query)
        transaction_count = transaction_result.scalar() or 0
        
        if transaction_count > 0:
            return True
        
        # Verificar orçamentos
        budget_query = select(func.count(Budget.id)).where(
            Budget.category_id == category_id
        )
        budget_result = await self.session.execute(budget_query)
        budget_count = budget_result.scalar() or 0
        
        return budget_count > 0

    async def _category_to_read(self, category: Category) -> CategoryRead:
        """Converte Category para CategoryRead com campos calculados."""
        # Contar subcategorias
        subcategories_count = await self._count_active_subcategories(category.id)
        
        # Buscar nome da categoria pai se existir
        parent_name = None
        if category.parent_id:
            parent_query = select(Category.name).where(Category.id == category.parent_id)
            parent_result = await self.session.execute(parent_query)
            parent_name = parent_result.scalar_one_or_none()
        
        return CategoryRead(
            id=category.id,
            user_id=category.user_id,
            name=category.name,
            type=category.type,
            icon=category.icon,
            color=category.color,
            parent_id=category.parent_id,
            sort_order=category.sort_order,
            is_system=category.is_system,
            is_active=category.is_active,
            created_at=category.created_at,
            updated_at=category.updated_at,
            subcategories_count=subcategories_count,
            parent_name=parent_name
        )


# Função helper para obter instância do serviço
async def get_category_service() -> CategoryService:
    """Dependency injection para CategoryService."""
    async with get_session() as session:
        return CategoryService(session)
