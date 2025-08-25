from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.security import verify_token
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.core.database import get_db

# Bearer token security scheme
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Obtém o usuário atual a partir do token de acesso."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verifica o token
    user_id = verify_token(credentials.credentials, token_type="access")
    if user_id is None:
        raise credentials_exception
    
    # Busca o usuário no banco
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Obtém usuário ativo atual."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Usuário inativo"
        )
    return current_user


async def get_current_verified_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Obtém usuário verificado atual."""
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email não verificado"
        )
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Obtém superusuário atual."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Privilégios insuficientes"
        )
    return current_user


async def validate_refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Valida refresh token e retorna o usuário."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token de atualização inválido",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verifica o token JWT
    user_id = verify_token(refresh_token, token_type="refresh")
    if user_id is None:
        raise credentials_exception
    
    # Busca o refresh token no banco
    stmt = select(RefreshToken).where(
        RefreshToken.token == refresh_token,
        RefreshToken.is_revoked == False
    )
    result = await db.execute(stmt)
    db_refresh_token = result.scalar_one_or_none()
    
    if db_refresh_token is None:
        raise credentials_exception
    
    # Busca o usuário
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user is None or not user.is_active:
        raise credentials_exception
    
    return user
