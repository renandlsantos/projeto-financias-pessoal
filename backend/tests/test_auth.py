import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.core.config import get_settings

settings = get_settings()

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    class_=AsyncSession
)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
async def db_session():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestingSessionLocal() as session:
        yield session
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture(scope="function")
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

class TestAuth:
    async def test_register_user(self, client: AsyncClient):
        """Testa registro de usuário."""
        user_data = {
            "email": "test@example.com",
            "password": "TestPass123!",
            "confirm_password": "TestPass123!",
            "full_name": "Test User"
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["full_name"] == user_data["full_name"]
        assert "password" not in data
    
    async def test_register_duplicate_email(self, client: AsyncClient):
        """Testa registro com email duplicado."""
        user_data = {
            "email": "test@example.com",
            "password": "TestPass123!",
            "confirm_password": "TestPass123!",
            "full_name": "Test User"
        }
        
        # Primeiro registro
        await client.post("/api/v1/auth/register", json=user_data)
        
        # Segundo registro com mesmo email
        response = await client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 400
        assert "já cadastrado" in response.json()["detail"]
    
    async def test_login_user(self, client: AsyncClient):
        """Testa login de usuário."""
        # Registra usuário
        user_data = {
            "email": "test@example.com",
            "password": "TestPass123!",
            "confirm_password": "TestPass123!",
            "full_name": "Test User"
        }
        await client.post("/api/v1/auth/register", json=user_data)
        
        # Faz login
        login_data = {
            "email": "test@example.com",
            "password": "TestPass123!"
        }
        
        response = await client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Testa login com credenciais inválidas."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "WrongPass123!"
        }
        
        response = await client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 401
        assert "inválidas" in response.json()["detail"]

class TestUsers:
    async def test_get_me_unauthorized(self, client: AsyncClient):
        """Testa acesso não autorizado ao perfil."""
        response = await client.get("/api/v1/users/me")
        assert response.status_code == 401
    
    async def test_get_me_authorized(self, client: AsyncClient):
        """Testa acesso autorizado ao perfil."""
        # Registra e faz login
        user_data = {
            "email": "test@example.com",
            "password": "TestPass123!",
            "confirm_password": "TestPass123!",
            "full_name": "Test User"
        }
        await client.post("/api/v1/auth/register", json=user_data)
        
        login_response = await client.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "TestPass123!"
        })
        token = login_response.json()["access_token"]
        
        # Acessa perfil
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"

if __name__ == "__main__":
    pytest.main([__file__])
