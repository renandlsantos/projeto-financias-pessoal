from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import (
    UserCreate, UserOut, Token, UserLogin, TokenRefresh,
    PasswordResetRequest, PasswordReset, EmailVerification, MessageResponse
)
from app.services.auth_service import AuthService
from app.core.deps import get_db, validate_refresh_token
from app.core.config import get_settings

router = APIRouter()
auth_service = AuthService()
settings = get_settings()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Registra um novo usuário.
    
    - **email**: Email único do usuário
    - **password**: Senha (min 8 chars, deve conter letra, número e especial)
    - **confirm_password**: Confirmação da senha
    - **full_name**: Nome completo (opcional)
    - **phone**: Telefone (opcional)
    """
    user = await auth_service.register_user(user_in, db)
    return user

@router.post("/login", response_model=Token)
async def login(
    user_login: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Autentica usuário e retorna tokens de acesso e atualização.
    
    - **email**: Email do usuário
    - **password**: Senha do usuário
    
    Retorna access_token (15min) e refresh_token (7 dias).
    """
    token = await auth_service.authenticate_user(user_login, db)
    return token

@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_refresh: TokenRefresh,
    db: AsyncSession = Depends(get_db)
):
    """
    Renova token de acesso usando refresh token.
    
    - **refresh_token**: Token de atualização válido
    """
    new_token = await auth_service.refresh_access_token(token_refresh.refresh_token, db)
    return new_token

@router.post("/logout", response_model=MessageResponse)
async def logout(
    token_refresh: TokenRefresh,
    db: AsyncSession = Depends(get_db)
):
    """
    Faz logout do usuário revogando o refresh token.
    
    - **refresh_token**: Token de atualização a ser revogado
    """
    await auth_service.revoke_refresh_token(token_refresh.refresh_token, db)
    return MessageResponse(message="Logout realizado com sucesso")

@router.post("/password-reset-request", response_model=MessageResponse)
async def request_password_reset(
    password_reset_request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Solicita reset de senha. Envia email com link de recuperação.
    
    - **email**: Email do usuário
    """
    result = await auth_service.request_password_reset(password_reset_request.email, db)
    return MessageResponse(message=result["message"])

@router.post("/password-reset", response_model=MessageResponse)
async def reset_password(
    password_reset: PasswordReset,
    db: AsyncSession = Depends(get_db)
):
    """
    Reseta senha usando token de recuperação.
    
    - **token**: Token de recuperação recebido por email
    - **new_password**: Nova senha
    - **confirm_password**: Confirmação da nova senha
    """
    result = await auth_service.reset_password(password_reset, db)
    return MessageResponse(message=result["message"])

@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    email_verification: EmailVerification,
    db: AsyncSession = Depends(get_db)
):
    """
    Verifica email do usuário.
    
    - **token**: Token de verificação recebido por email
    """
    result = await auth_service.verify_email(email_verification.token, db)
    return MessageResponse(message=result["message"])

@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    # Implementar quando necessário
    db: AsyncSession = Depends(get_db)
):
    """
    Reenvia email de verificação.
    """
    # TODO: Implementar reenvio de verificação
    return MessageResponse(message="Email de verificação reenviado")
