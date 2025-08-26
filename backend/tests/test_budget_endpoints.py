import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from fastapi import FastAPI
from datetime import date, timedelta
from decimal import Decimal
import os

from app.main import app
from app.core.database import get_session
from app.core.config import get_settings
from app.models.base import Base
from app.models.user import User
from app.models.category import Category, TransactionTypeEnum
from app.models.budget import Budget


# Test database URL
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost/financeflow_test")


class TestBudgetEndpoints:
    """
    Testes de integração para endpoints de orçamentos.
    Testa fluxo completo com banco de dados real.
    """
    
    @pytest.fixture(scope="session")
    def event_loop(self):
        """Cria um loop de eventos para toda a sessão de teste."""
        loop = asyncio.get_event_loop_policy().new_event_loop()
        yield loop
        loop.close()
    
    @pytest.fixture(scope="session")
    async def engine(self):
        """Engine do banco de dados para testes."""
        engine = create_async_engine(TEST_DATABASE_URL, echo=False)
        yield engine
        await engine.dispose()
    
    @pytest.fixture(scope="session")
    async def setup_database(self, engine):
        """Configura e limpa o banco de dados de teste."""
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        yield
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    
    @pytest.fixture
    async def session(self, engine, setup_database):
        """Sessão de banco de dados para cada teste."""
        SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with SessionLocal() as session:
            yield session
    
    @pytest.fixture
    async def client(self, session):
        """Cliente HTTP para testes."""
        app.dependency_overrides[get_session] = lambda: session
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac
        app.dependency_overrides.clear()
    
    @pytest.fixture
    async def test_user(self, session):
        """Usuário de teste."""
        user = User(
            email="test@example.com",
            hashed_password="hashed_password",
            full_name="Test User",
            is_active=True
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user
    
    @pytest.fixture
    async def test_category(self, session, test_user):
        """Categoria de teste."""
        category = Category(
            user_id=test_user.id,
            name="Alimentação",
            type=TransactionTypeEnum.EXPENSE,
            icon="🍔",
            color="#FF5722",
            is_system=False,
            is_active=True
        )
        session.add(category)
        await session.commit()
        await session.refresh(category)
        return category
    
    @pytest.fixture
    async def auth_headers(self, test_user):
        """Headers de autenticação para testes."""
        # Simular token JWT válido - em ambiente real seria gerado pelo AuthService
        token = "fake_jwt_token_for_testing"
        return {"Authorization": f"Bearer {token}"}
    
    @pytest.fixture
    def budget_data(self, test_category):
        """Dados de orçamento para testes."""
        return {
            "category_id": str(test_category.id),
            "amount": 1000.00,
            "start_date": date.today().isoformat(),
            "end_date": (date.today() + timedelta(days=30)).isoformat(),
            "alert_threshold": 80.0,
            "notes": "Orçamento de teste"
        }

    async def test_create_budget_success(self, client, auth_headers, budget_data):
        """Testa criação bem-sucedida de orçamento via API."""
        # Act
        response = await client.post(
            "/api/v1/budgets/",
            json=budget_data,
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == budget_data["amount"]
        assert data["category_id"] == budget_data["category_id"]
        assert "id" in data

    async def test_create_budget_invalid_category(self, client, auth_headers):
        """Testa falha ao criar orçamento com categoria inválida."""
        # Arrange
        invalid_budget_data = {
            "category_id": "550e8400-e29b-41d4-a716-446655440000",  # UUID inexistente
            "amount": 1000.00,
            "start_date": date.today().isoformat(),
            "end_date": (date.today() + timedelta(days=30)).isoformat()
        }
        
        # Act
        response = await client.post(
            "/api/v1/budgets/",
            json=invalid_budget_data,
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 404
        assert "categoria não encontrada" in response.json()["detail"].lower()

    async def test_create_budget_validation_error(self, client, auth_headers):
        """Testa validação de dados na criação de orçamento."""
        # Arrange
        invalid_data = {
            "category_id": "invalid-uuid",
            "amount": -100,  # Valor negativo
            "start_date": "invalid-date",
            "end_date": date.today().isoformat()
        }
        
        # Act
        response = await client.post(
            "/api/v1/budgets/",
            json=invalid_data,
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 422

    async def test_list_user_budgets(self, client, auth_headers, session, test_user, test_category):
        """Testa listagem de orçamentos do usuário."""
        # Arrange - Criar alguns orçamentos
        budgets = [
            Budget(
                user_id=test_user.id,
                category_id=test_category.id,
                amount=Decimal('1000.00'),
                start_date=date.today(),
                end_date=date.today() + timedelta(days=30)
            ),
            Budget(
                user_id=test_user.id,
                category_id=test_category.id,
                amount=Decimal('500.00'),
                start_date=date.today() + timedelta(days=31),
                end_date=date.today() + timedelta(days=60)
            )
        ]
        for budget in budgets:
            session.add(budget)
        await session.commit()
        
        # Act
        response = await client.get("/api/v1/budgets/", headers=auth_headers)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    async def test_list_budgets_with_filters(self, client, auth_headers, session, test_user, test_category):
        """Testa listagem com filtros aplicados."""
        # Arrange
        active_budget = Budget(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal('1000.00'),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30)
        )
        expired_budget = Budget(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal('500.00'),
            start_date=date.today() - timedelta(days=60),
            end_date=date.today() - timedelta(days=30)  # Expirado
        )
        session.add_all([active_budget, expired_budget])
        await session.commit()
        
        # Act - Filtrar apenas ativos
        response = await client.get(
            "/api/v1/budgets/",
            params={"is_active": True},
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1  # Apenas o ativo

    async def test_get_budget_by_id(self, client, auth_headers, session, test_user, test_category):
        """Testa busca de orçamento por ID."""
        # Arrange
        budget = Budget(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal('1000.00'),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30)
        )
        session.add(budget)
        await session.commit()
        await session.refresh(budget)
        
        # Act
        response = await client.get(f"/api/v1/budgets/{budget.id}", headers=auth_headers)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(budget.id)

    async def test_get_budget_not_found(self, client, auth_headers):
        """Testa busca de orçamento inexistente."""
        # Act
        response = await client.get(
            "/api/v1/budgets/550e8400-e29b-41d4-a716-446655440000",
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 404

    async def test_update_budget(self, client, auth_headers, session, test_user, test_category):
        """Testa atualização de orçamento."""
        # Arrange
        budget = Budget(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal('1000.00'),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30)
        )
        session.add(budget)
        await session.commit()
        await session.refresh(budget)
        
        update_data = {
            "amount": 1500.00,
            "notes": "Orçamento atualizado"
        }
        
        # Act
        response = await client.put(
            f"/api/v1/budgets/{budget.id}",
            json=update_data,
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == update_data["amount"]
        assert data["notes"] == update_data["notes"]

    async def test_delete_budget(self, client, auth_headers, session, test_user, test_category):
        """Testa exclusão de orçamento."""
        # Arrange
        budget = Budget(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal('1000.00'),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30)
        )
        session.add(budget)
        await session.commit()
        await session.refresh(budget)
        
        # Act
        response = await client.delete(f"/api/v1/budgets/{budget.id}", headers=auth_headers)
        
        # Assert
        assert response.status_code == 204

    async def test_get_budget_summary(self, client, auth_headers, session, test_user, test_category):
        """Testa obtenção de resumo de orçamento."""
        # Arrange
        budget = Budget(
            user_id=test_user.id,
            category_id=test_category.id,
            amount=Decimal('1000.00'),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            alert_threshold=80.0
        )
        session.add(budget)
        await session.commit()
        await session.refresh(budget)
        
        # Act
        response = await client.get(
            f"/api/v1/budgets/{budget.id}/summary",
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["budget_id"] == str(budget.id)
        assert data["amount"] == float(budget.amount)
        assert "spent_amount" in data
        assert "percentage_used" in data
        assert "status" in data

    async def test_get_active_budgets_summary(self, client, auth_headers, session, test_user, test_category):
        """Testa obtenção de resumo de orçamentos ativos."""
        # Arrange
        active_budgets = [
            Budget(
                user_id=test_user.id,
                category_id=test_category.id,
                amount=Decimal('1000.00'),
                start_date=date.today(),
                end_date=date.today() + timedelta(days=30)
            ),
            Budget(
                user_id=test_user.id,
                category_id=test_category.id,
                amount=Decimal('500.00'),
                start_date=date.today() - timedelta(days=5),
                end_date=date.today() + timedelta(days=25)
            )
        ]
        for budget in active_budgets:
            session.add(budget)
        await session.commit()
        
        # Act
        response = await client.get("/api/v1/budgets/active/summary", headers=auth_headers)
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        for summary in data:
            assert "budget_id" in summary
            assert "status" in summary
            assert "percentage_used" in summary

    async def test_pagination(self, client, auth_headers, session, test_user, test_category):
        """Testa paginação na listagem de orçamentos."""
        # Arrange - Criar 5 orçamentos
        budgets = []
        for i in range(5):
            budget = Budget(
                user_id=test_user.id,
                category_id=test_category.id,
                amount=Decimal('1000.00'),
                start_date=date.today() + timedelta(days=i*40),
                end_date=date.today() + timedelta(days=i*40 + 30)
            )
            budgets.append(budget)
            session.add(budget)
        await session.commit()
        
        # Act - Buscar com limite
        response = await client.get(
            "/api/v1/budgets/",
            params={"limit": 3, "offset": 0},
            headers=auth_headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    async def test_unauthorized_access(self, client, budget_data):
        """Testa acesso não autorizado aos endpoints."""
        # Act - Tentar criar orçamento sem token
        response = await client.post("/api/v1/budgets/", json=budget_data)
        
        # Assert
        assert response.status_code == 401
