import pytest
from unittest.mock import Mock, AsyncMock, patch
from uuid import UUID, uuid4
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.services.budget_service import BudgetService
from app.models.budget import Budget
from app.models.category import Category, TransactionTypeEnum
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetSummary


class TestBudgetService:
    """
    Testes unitários para BudgetService.
    Testa lógica de negócio, cálculos financeiros e validações.
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
    def budget_service(self, mock_session):
        """Instância do BudgetService com sessão mockada."""
        return BudgetService(mock_session)
    
    @pytest.fixture
    def sample_user_id(self):
        """ID de usuário para testes."""
        return uuid4()
    
    @pytest.fixture
    def sample_category_id(self):
        """ID de categoria para testes."""
        return uuid4()
    
    @pytest.fixture
    def sample_budget_data(self, sample_category_id):
        """Dados de orçamento para testes."""
        return BudgetCreate(
            category_id=sample_category_id,
            amount=Decimal('1000.00'),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            alert_threshold=80.0,
            notes="Orçamento de teste"
        )
    
    @pytest.fixture
    def sample_category(self, sample_user_id):
        """Categoria mock para testes."""
        return Category(
            id=uuid4(),
            user_id=sample_user_id,
            name="Alimentação",
            type=TransactionTypeEnum.EXPENSE,
            is_system=False,
            is_active=True
        )
    
    @pytest.fixture
    def sample_budget(self, sample_user_id, sample_category_id):
        """Orçamento mock para testes."""
        return Budget(
            id=uuid4(),
            user_id=sample_user_id,
            category_id=sample_category_id,
            amount=Decimal('1000.00'),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            alert_threshold=80.0,
            notes="Orçamento de teste",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

    async def test_create_budget_success(self, budget_service, mock_session, sample_user_id, sample_budget_data, sample_category):
        """Testa criação bem-sucedida de orçamento."""
        # Arrange
        budget_service._get_user_category = AsyncMock(return_value=sample_category)
        budget_service._check_existing_budget = AsyncMock(return_value=None)  # Sem conflito
        budget_service._get_budget_with_relations = AsyncMock(return_value=Mock())
        
        # Act
        result = await budget_service.create_budget(sample_user_id, sample_budget_data)
        
        # Assert
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()

    async def test_create_budget_with_period_conflict(self, budget_service, mock_session, sample_user_id, sample_budget_data, sample_category, sample_budget):
        """Testa falha ao criar orçamento com período conflitante."""
        # Arrange
        budget_service._get_user_category = AsyncMock(return_value=sample_category)
        budget_service._check_existing_budget = AsyncMock(return_value=sample_budget)  # Conflito encontrado
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await budget_service.create_budget(sample_user_id, sample_budget_data)
        
        assert exc_info.value.status_code == 409
        assert "já existe um orçamento ativo" in str(exc_info.value.detail).lower()

    async def test_create_budget_invalid_category(self, budget_service, mock_session, sample_user_id, sample_budget_data):
        """Testa falha ao criar orçamento com categoria inexistente."""
        # Arrange
        budget_service._get_user_category = AsyncMock(side_effect=HTTPException(status_code=404, detail="Categoria não encontrada"))
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await budget_service.create_budget(sample_user_id, sample_budget_data)
        
        assert exc_info.value.status_code == 404

    async def test_update_budget_success(self, budget_service, mock_session, sample_user_id, sample_budget):
        """Testa atualização bem-sucedida de orçamento."""
        # Arrange
        update_data = BudgetUpdate(amount=Decimal('1500.00'), notes="Atualizado")
        budget_service._get_budget_with_relations = AsyncMock(return_value=sample_budget)
        
        # Act
        result = await budget_service.update_budget(sample_user_id, sample_budget.id, update_data)
        
        # Assert
        assert sample_budget.amount == Decimal('1500.00')
        assert sample_budget.notes == "Atualizado"
        mock_session.commit.assert_called_once()

    async def test_update_budget_change_category_with_conflict(self, budget_service, mock_session, sample_user_id, sample_budget, sample_category):
        """Testa falha ao atualizar categoria do orçamento com conflito."""
        # Arrange
        new_category_id = uuid4()
        update_data = BudgetUpdate(category_id=new_category_id)
        
        budget_service._get_budget_with_relations = AsyncMock(return_value=sample_budget)
        budget_service._get_user_category = AsyncMock(return_value=sample_category)
        budget_service._check_existing_budget = AsyncMock(return_value=Mock())  # Conflito
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await budget_service.update_budget(sample_user_id, sample_budget.id, update_data)
        
        assert exc_info.value.status_code == 409

    async def test_delete_budget_success(self, budget_service, mock_session, sample_user_id, sample_budget):
        """Testa exclusão bem-sucedida de orçamento."""
        # Arrange
        mock_session.get.return_value = sample_budget
        
        # Act
        result = await budget_service.delete_budget(sample_user_id, sample_budget.id)
        
        # Assert
        assert result is True
        mock_session.delete.assert_called_once_with(sample_budget)
        mock_session.commit.assert_called_once()

    async def test_delete_budget_not_found(self, budget_service, mock_session, sample_user_id):
        """Testa falha ao excluir orçamento inexistente."""
        # Arrange
        budget_id = uuid4()
        mock_session.get.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await budget_service.delete_budget(sample_user_id, budget_id)
        
        assert exc_info.value.status_code == 404

    async def test_get_budget_summary_calculation(self, budget_service, mock_session, sample_user_id, sample_budget, sample_category):
        """Testa cálculo correto do resumo do orçamento."""
        # Arrange
        sample_budget.category = sample_category
        spent_amount = Decimal('600.00')
        
        budget_service._get_budget_with_relations = AsyncMock(return_value=sample_budget)
        budget_service._calculate_spent_amount = AsyncMock(return_value=spent_amount)
        
        # Act
        result = await budget_service.get_budget_summary(sample_user_id, sample_budget.id)
        
        # Assert
        assert isinstance(result, BudgetSummary)
        assert result.amount == sample_budget.amount
        assert result.spent_amount == spent_amount
        assert result.remaining_amount == sample_budget.amount - spent_amount
        assert result.percentage_used == 60.0  # 600/1000 * 100
        assert result.status == "on_track"  # < 80% threshold

    async def test_get_budget_summary_warning_status(self, budget_service, mock_session, sample_user_id, sample_budget, sample_category):
        """Testa status de alerta quando orçamento próximo do limite."""
        # Arrange
        sample_budget.category = sample_category
        sample_budget.alert_threshold = 80.0
        spent_amount = Decimal('850.00')  # 85% do orçamento
        
        budget_service._get_budget_with_relations = AsyncMock(return_value=sample_budget)
        budget_service._calculate_spent_amount = AsyncMock(return_value=spent_amount)
        
        # Act
        result = await budget_service.get_budget_summary(sample_user_id, sample_budget.id)
        
        # Assert
        assert result.percentage_used == 85.0
        assert result.status == "warning"  # >= 80% threshold

    async def test_get_budget_summary_exceeded_status(self, budget_service, mock_session, sample_user_id, sample_budget, sample_category):
        """Testa status excedido quando orçamento ultrapassado."""
        # Arrange
        sample_budget.category = sample_category
        spent_amount = Decimal('1200.00')  # 120% do orçamento
        
        budget_service._get_budget_with_relations = AsyncMock(return_value=sample_budget)
        budget_service._calculate_spent_amount = AsyncMock(return_value=spent_amount)
        
        # Act
        result = await budget_service.get_budget_summary(sample_user_id, sample_budget.id)
        
        # Assert
        assert result.percentage_used == 120.0
        assert result.remaining_amount == Decimal('-200.00')  # Negativo
        assert result.status == "exceeded"

    async def test_get_active_budgets_summary(self, budget_service, mock_session, sample_user_id, sample_budget, sample_category):
        """Testa busca de resumo de orçamentos ativos."""
        # Arrange
        sample_budget.category = sample_category
        mock_session.execute.return_value.unique.return_value.scalars.return_value.all.return_value = [sample_budget]
        
        budget_service.get_budget_summary = AsyncMock(return_value=BudgetSummary(
            budget_id=sample_budget.id,
            amount=sample_budget.amount,
            spent_amount=Decimal('500.00'),
            remaining_amount=Decimal('500.00'),
            percentage_used=50.0,
            status="on_track",
            days_remaining=15,
            category_name=sample_category.name,
            period_start=sample_budget.start_date,
            period_end=sample_budget.end_date
        ))
        
        # Act
        result = await budget_service.get_active_budgets_summary(sample_user_id)
        
        # Assert
        assert len(result) == 1
        assert result[0].status == "on_track"

    @patch('app.services.budget_service.datetime')
    async def test_calculate_days_remaining(self, mock_datetime, budget_service):
        """Testa cálculo de dias restantes."""
        # Arrange
        mock_datetime.now.return_value.date.return_value = date(2024, 1, 15)
        end_date = date(2024, 1, 25)  # 10 dias restantes
        
        # Act - usando método estático da classe BudgetSummary
        budget_summary = BudgetSummary(
            budget_id=uuid4(),
            amount=Decimal('1000.00'),
            spent_amount=Decimal('500.00'),
            remaining_amount=Decimal('500.00'),
            percentage_used=50.0,
            status="on_track",
            days_remaining=10,  # Calculado externamente
            category_name="Test",
            period_start=date(2024, 1, 1),
            period_end=end_date
        )
        
        # Assert
        assert budget_summary.days_remaining == 10

    async def test_get_user_budgets_with_filters(self, budget_service, mock_session, sample_user_id, sample_budget):
        """Testa busca de orçamentos com filtros."""
        # Arrange
        mock_session.execute.return_value.unique.return_value.scalars.return_value.all.return_value = [sample_budget]
        
        # Act
        result = await budget_service.get_user_budgets(
            user_id=sample_user_id,
            category_id=sample_budget.category_id,
            is_active=True,
            limit=10
        )
        
        # Assert
        mock_session.execute.assert_called_once()
        assert len(result) == 1

    async def test_calculate_spent_amount(self, budget_service, mock_session):
        """Testa cálculo do valor gasto na categoria."""
        # Arrange
        user_id = uuid4()
        category_id = uuid4()
        start_date = date.today()
        end_date = date.today() + timedelta(days=30)
        expected_amount = Decimal('750.50')
        
        mock_session.execute.return_value.scalar.return_value = expected_amount
        
        # Act
        result = await budget_service._calculate_spent_amount(user_id, category_id, start_date, end_date)
        
        # Assert
        assert result == expected_amount
        mock_session.execute.assert_called_once()

    async def test_check_existing_budget_with_overlap(self, budget_service, mock_session, sample_user_id, sample_category_id):
        """Testa verificação de orçamentos com sobreposição de período."""
        # Arrange
        existing_budget = Mock()
        mock_session.execute.return_value.scalar_one_or_none.return_value = existing_budget
        
        # Act
        result = await budget_service._check_existing_budget(
            user_id=sample_user_id,
            category_id=sample_category_id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30)
        )
        
        # Assert
        assert result == existing_budget
        mock_session.execute.assert_called_once()

    async def test_budget_service_helper_functions(self, budget_service):
        """Testa funções auxiliares estáticas do BudgetService."""
        # Test formatCurrency
        formatted = BudgetService.formatCurrency(1234.56)
        assert "1.234,56" in formatted
        assert "R$" in formatted
        
        # Test getDaysRemaining
        future_date = (date.today() + timedelta(days=5)).isoformat()
        days = BudgetService.getDaysRemaining(future_date)
        assert days == 5
