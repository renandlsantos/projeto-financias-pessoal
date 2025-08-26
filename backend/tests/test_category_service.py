import pytest
from unittest.mock import Mock, AsyncMock
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.services.category_service import CategoryService
from app.models.category import Category, TransactionTypeEnum
from app.schemas.category import CategoryCreate, CategoryUpdate


class TestCategoryService:
    """
    Testes unitários para CategoryService.
    Testa lógica de negócio, validações e tratamento de erros.
    """
    
    @pytest.fixture
    def mock_session(self):
        """Mock da sessão do banco de dados."""
        session = Mock(spec=AsyncSession)
        session.execute = AsyncMock()
        session.commit = AsyncMock()
        session.refresh = AsyncMock()
        session.add = Mock()
        session.get = AsyncMock()
        session.delete = AsyncMock()
        return session
    
    @pytest.fixture
    def category_service(self, mock_session):
        """Instância do CategoryService com sessão mockada."""
        return CategoryService(mock_session)
    
    @pytest.fixture
    def sample_user_id(self):
        """ID de usuário para testes."""
        return uuid4()
    
    @pytest.fixture
    def sample_category_data(self):
        """Dados de categoria para testes."""
        return CategoryCreate(
            name="Alimentação",
            type=TransactionTypeEnum.EXPENSE,
            icon="🍔",
            color="#FF5722",
            sort_order=1
        )
    
    @pytest.fixture
    def sample_category(self, sample_user_id):
        """Categoria mock para testes."""
        return Category(
            id=uuid4(),
            user_id=sample_user_id,
            name="Alimentação",
            type=TransactionTypeEnum.EXPENSE,
            icon="🍔",
            color="#FF5722",
            sort_order=1,
            is_system=False,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

    async def test_create_category_success(self, category_service, mock_session, sample_user_id, sample_category_data):
        """Testa criação bem-sucedida de categoria."""
        # Arrange
        mock_session.execute.return_value.scalar_one_or_none.return_value = None  # Sem duplicata
        expected_category = Category(
            id=uuid4(),
            user_id=sample_user_id,
            **sample_category_data.dict(),
            is_system=False,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Mock para _category_to_read
        category_service._count_active_subcategories = AsyncMock(return_value=0)
        
        # Act
        result = await category_service.create_category(sample_user_id, sample_category_data)
        
        # Assert
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()

    async def test_create_category_duplicate_name(self, category_service, mock_session, sample_user_id, sample_category_data, sample_category):
        """Testa falha ao criar categoria com nome duplicado."""
        # Arrange
        mock_session.execute.return_value.scalar_one_or_none.return_value = sample_category  # Duplicata encontrada
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await category_service.create_category(sample_user_id, sample_category_data)
        
        assert exc_info.value.status_code == 409
        assert "Já existe uma categoria" in str(exc_info.value.detail)

    async def test_create_subcategory_with_valid_parent(self, category_service, mock_session, sample_user_id, sample_category):
        """Testa criação de subcategoria com categoria pai válida."""
        # Arrange
        parent_category = Category(
            id=uuid4(),
            user_id=sample_user_id,
            name="Categoria Pai",
            type=TransactionTypeEnum.EXPENSE,
            parent_id=None,  # É categoria principal
            is_system=False,
            is_active=True
        )
        
        subcategory_data = CategoryCreate(
            name="Subcategoria",
            type=TransactionTypeEnum.EXPENSE,
            parent_id=parent_category.id
        )
        
        # Mock para verificações
        mock_session.execute.side_effect = [
            Mock(scalar_one_or_none=Mock(return_value=None)),  # Sem duplicata
            Mock(scalar_one_or_none=Mock(return_value=parent_category))  # Parent encontrado
        ]
        category_service._get_user_category = AsyncMock(return_value=parent_category)
        category_service._count_active_subcategories = AsyncMock(return_value=0)
        
        # Act
        await category_service.create_category(sample_user_id, subcategory_data)
        
        # Assert
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()

    async def test_create_subcategory_invalid_parent_type(self, category_service, mock_session, sample_user_id):
        """Testa falha ao criar subcategoria com tipo diferente do pai."""
        # Arrange
        parent_category = Category(
            id=uuid4(),
            user_id=sample_user_id,
            name="Categoria Receita",
            type=TransactionTypeEnum.INCOME,  # Tipo diferente
            is_system=False,
            is_active=True
        )
        
        subcategory_data = CategoryCreate(
            name="Subcategoria Despesa",
            type=TransactionTypeEnum.EXPENSE,  # Tipo diferente do pai
            parent_id=parent_category.id
        )
        
        category_service._check_duplicate_category = AsyncMock(return_value=None)
        category_service._get_user_category = AsyncMock(return_value=parent_category)
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await category_service.create_category(sample_user_id, subcategory_data)
        
        assert exc_info.value.status_code == 400
        assert "mesmo tipo" in str(exc_info.value.detail)

    async def test_create_subcategory_of_subcategory_fails(self, category_service, mock_session, sample_user_id):
        """Testa falha ao criar subcategoria de uma subcategoria (máximo 2 níveis)."""
        # Arrange
        grandparent_id = uuid4()
        parent_category = Category(
            id=uuid4(),
            user_id=sample_user_id,
            name="Subcategoria Existente",
            type=TransactionTypeEnum.EXPENSE,
            parent_id=grandparent_id,  # Já é subcategoria
            is_system=False,
            is_active=True
        )
        
        subcategory_data = CategoryCreate(
            name="Sub-subcategoria",
            type=TransactionTypeEnum.EXPENSE,
            parent_id=parent_category.id
        )
        
        category_service._check_duplicate_category = AsyncMock(return_value=None)
        category_service._get_user_category = AsyncMock(return_value=parent_category)
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await category_service.create_category(sample_user_id, subcategory_data)
        
        assert exc_info.value.status_code == 400
        assert "máximo 2 níveis" in str(exc_info.value.detail)

    async def test_update_category_success(self, category_service, mock_session, sample_user_id, sample_category):
        """Testa atualização bem-sucedida de categoria."""
        # Arrange
        update_data = CategoryUpdate(name="Novo Nome", color="#00BCD4")
        mock_session.get.return_value = sample_category
        category_service._check_duplicate_category = AsyncMock(return_value=None)
        category_service._category_to_read = AsyncMock()
        
        # Act
        await category_service.update_category(sample_user_id, sample_category.id, update_data)
        
        # Assert
        assert sample_category.name == "Novo Nome"
        assert sample_category.color == "#00BCD4"
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()

    async def test_update_system_category_fails(self, category_service, mock_session, sample_user_id):
        """Testa falha ao tentar atualizar categoria do sistema."""
        # Arrange
        system_category = Category(
            id=uuid4(),
            user_id=None,
            name="Categoria Sistema",
            type=TransactionTypeEnum.EXPENSE,
            is_system=True,  # Categoria do sistema
            is_active=True
        )
        
        update_data = CategoryUpdate(name="Tentativa de Alteração")
        mock_session.get.return_value = system_category
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await category_service.update_category(sample_user_id, system_category.id, update_data)
        
        assert exc_info.value.status_code == 403
        assert "sistema não podem ser modificadas" in str(exc_info.value.detail)

    async def test_delete_category_success(self, category_service, mock_session, sample_user_id, sample_category):
        """Testa exclusão bem-sucedida de categoria (soft delete)."""
        # Arrange
        mock_session.get.return_value = sample_category
        category_service._count_active_subcategories = AsyncMock(return_value=0)
        category_service._check_category_usage = AsyncMock(return_value=False)
        
        # Act
        result = await category_service.delete_category(sample_user_id, sample_category.id)
        
        # Assert
        assert result is True
        assert sample_category.is_active is False
        mock_session.commit.assert_called_once()

    async def test_delete_category_with_subcategories_fails(self, category_service, mock_session, sample_user_id, sample_category):
        """Testa falha ao excluir categoria com subcategorias ativas."""
        # Arrange
        mock_session.get.return_value = sample_category
        category_service._count_active_subcategories = AsyncMock(return_value=2)  # Tem subcategorias
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await category_service.delete_category(sample_user_id, sample_category.id)
        
        assert exc_info.value.status_code == 409
        assert "subcategorias ativas" in str(exc_info.value.detail)

    async def test_delete_category_in_use_fails(self, category_service, mock_session, sample_user_id, sample_category):
        """Testa falha ao excluir categoria sendo usada em transações/orçamentos."""
        # Arrange
        mock_session.get.return_value = sample_category
        category_service._count_active_subcategories = AsyncMock(return_value=0)
        category_service._check_category_usage = AsyncMock(return_value=True)  # Em uso
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await category_service.delete_category(sample_user_id, sample_category.id)
        
        assert exc_info.value.status_code == 409
        assert "sendo usada" in str(exc_info.value.detail)

    async def test_get_user_categories_with_filters(self, category_service, mock_session, sample_user_id):
        """Testa busca de categorias com filtros aplicados."""
        # Arrange
        categories = [
            Category(id=uuid4(), name="Cat1", type=TransactionTypeEnum.EXPENSE),
            Category(id=uuid4(), name="Cat2", type=TransactionTypeEnum.INCOME)
        ]
        mock_session.execute.return_value.scalars.return_value.all.return_value = categories
        category_service._category_to_read = AsyncMock(side_effect=lambda c: Mock(name=c.name))
        
        # Act
        result = await category_service.get_user_categories(
            user_id=sample_user_id,
            type_filter=TransactionTypeEnum.EXPENSE,
            include_system=True
        )
        
        # Assert
        mock_session.execute.assert_called_once()
        assert len(result) == 2

    async def test_check_category_usage_with_transactions(self, category_service, mock_session):
        """Testa verificação de uso da categoria em transações."""
        # Arrange
        category_id = uuid4()
        mock_session.execute.side_effect = [
            Mock(scalar=Mock(return_value=5)),  # 5 transações
            Mock(scalar=Mock(return_value=0))   # 0 orçamentos
        ]
        
        # Act
        result = await category_service._check_category_usage(category_id)
        
        # Assert
        assert result is True  # Categoria em uso

    async def test_check_category_usage_with_budgets(self, category_service, mock_session):
        """Testa verificação de uso da categoria em orçamentos."""
        # Arrange
        category_id = uuid4()
        mock_session.execute.side_effect = [
            Mock(scalar=Mock(return_value=0)),  # 0 transações
            Mock(scalar=Mock(return_value=2))   # 2 orçamentos
        ]
        
        # Act
        result = await category_service._check_category_usage(category_id)
        
        # Assert
        assert result is True  # Categoria em uso
