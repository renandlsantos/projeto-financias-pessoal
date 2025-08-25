from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.user import UserCreate, UserOut, Token, UserLogin, PasswordReset, PasswordResetRequest
from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    verify_token,
    generate_password_reset_token,
    generate_email_verification_token
)
from app.core.config import get_settings

settings = get_settings()

class AuthService:
    
    async def register_user(self, user_in: UserCreate, db: AsyncSession) -> UserOut:
        """Registra um novo usuário."""
        # Verifica se email já existe
        stmt = select(User).where(User.email == user_in.email)
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )
        
        # Cria o usuário
        user = User(
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            phone=user_in.phone,
            language=user_in.language,
            timezone=user_in.timezone,
            currency=user_in.currency,
            email_verification_token=generate_email_verification_token()
        )
        
        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except IntegrityError:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Erro ao criar usuário"
            )
        
        return UserOut.from_orm(user)
    
    async def authenticate_user(self, user_login: UserLogin, db: AsyncSession) -> Token:
        """Autentica usuário e retorna tokens."""
        # Busca usuário por email
        stmt = select(User).where(User.email == user_login.email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas"
            )
        
        # Verifica se usuário está ativo
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário inativo"
            )
        
        # Verifica tentativas de login falhadas
        await self._check_failed_login_attempts(user, db)
        
        # Verifica senha
        if not verify_password(user_login.password, user.password_hash):
            await self._increment_failed_login_attempts(user, db)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas"
            )
        
        # Reset failed login attempts e atualiza último login
        await self._reset_failed_login_attempts(user, db)
        user.last_login = datetime.utcnow()
        await db.commit()
        
        # Cria tokens
        access_token = create_access_token(str(user.id))
        refresh_token_str = create_refresh_token(str(user.id))
        
        # Salva refresh token no banco
        refresh_token_db = RefreshToken(
            token=refresh_token_str,
            user_id=user.id,
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        db.add(refresh_token_db)
        await db.commit()
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token_str,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    async def refresh_access_token(self, refresh_token: str, db: AsyncSession) -> Token:
        """Renova token de acesso usando refresh token."""
        # Verifica refresh token
        user_id = verify_token(refresh_token, token_type="refresh")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de atualização inválido"
            )
        
        # Busca refresh token no banco
        stmt = select(RefreshToken).where(
            RefreshToken.token == refresh_token,
            RefreshToken.is_revoked == False
        )
        result = await db.execute(stmt)
        db_refresh_token = result.scalar_one_or_none()
        
        if not db_refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de atualização inválido"
            )
        
        # Verifica se não expirou
        from datetime import timezone
        current_utc = datetime.now(timezone.utc)
        if db_refresh_token.expires_at < current_utc:
            # Revoga token expirado
            db_refresh_token.is_revoked = True
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de atualização expirado"
            )
        
        # Busca usuário
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário inválido ou inativo"
            )
        
        # Cria novo access token
        access_token = create_access_token(str(user.id))
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,  # Mantém o mesmo refresh token
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    async def revoke_refresh_token(self, refresh_token: str, db: AsyncSession):
        """Revoga refresh token (logout)."""
        stmt = update(RefreshToken).where(
            RefreshToken.token == refresh_token
        ).values(is_revoked=True)
        
        await db.execute(stmt)
        await db.commit()
    
    async def request_password_reset(self, email: str, db: AsyncSession):
        """Solicita reset de senha."""
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            # Por segurança, não revelamos se o email existe
            return {"message": "Se o email existir, um link de recuperação será enviado"}
        
        # Gera token de reset
        reset_token = generate_password_reset_token()
        user.password_reset_token = reset_token
        user.password_reset_at = datetime.utcnow()
        
        await db.commit()
        
        # TODO: Enviar email com o token
        # await send_password_reset_email(user.email, reset_token)
        
        return {"message": "Link de recuperação enviado por email"}
    
    async def reset_password(self, password_reset: PasswordReset, db: AsyncSession):
        """Reseta senha usando token."""
        stmt = select(User).where(
            User.password_reset_token == password_reset.token
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token de recuperação inválido"
            )
        
        # Verifica se token não expirou (1 hora)
        if (datetime.utcnow() - user.password_reset_at).total_seconds() > 3600:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token de recuperação expirado"
            )
        
        # Atualiza senha
        user.password_hash = get_password_hash(password_reset.new_password)
        user.password_reset_token = None
        user.password_reset_at = None
        
        # Revoga todos os refresh tokens do usuário
        stmt = update(RefreshToken).where(
            RefreshToken.user_id == user.id
        ).values(is_revoked=True)
        await db.execute(stmt)
        
        await db.commit()
        
        return {"message": "Senha alterada com sucesso"}
    
    async def verify_email(self, token: str, db: AsyncSession):
        """Verifica email do usuário."""
        stmt = select(User).where(
            User.email_verification_token == token
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token de verificação inválido"
            )
        
        user.is_verified = True
        user.email_verified_at = datetime.utcnow()
        user.email_verification_token = None
        
        await db.commit()
        
        return {"message": "Email verificado com sucesso"}
    
    async def _check_failed_login_attempts(self, user: User, db: AsyncSession):
        """Verifica tentativas de login falhadas."""
        if user.failed_login_attempts and int(user.failed_login_attempts) >= 5:
            if user.last_failed_login:
                time_diff = datetime.utcnow() - user.last_failed_login
                if time_diff.total_seconds() < 900:  # 15 minutos
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Muitas tentativas de login. Tente novamente em 15 minutos"
                    )
    
    async def _increment_failed_login_attempts(self, user: User, db: AsyncSession):
        """Incrementa tentativas de login falhadas."""
        current_attempts = int(user.failed_login_attempts or 0)
        user.failed_login_attempts = str(current_attempts + 1)
        user.last_failed_login = datetime.utcnow()
        await db.commit()
    
    async def _reset_failed_login_attempts(self, user: User, db: AsyncSession):
        """Reseta tentativas de login falhadas."""
        user.failed_login_attempts = "0"
        user.last_failed_login = None
