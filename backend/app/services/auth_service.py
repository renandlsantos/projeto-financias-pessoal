from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

class AuthService:
    async def register_user(self, user_in: UserCreate, db: AsyncSession) -> UserOut:
        user = User(
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            phone=user_in.phone
        )
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado")
        return UserOut.from_orm(user)

    async def authenticate_user(self, user_in: UserCreate, db: AsyncSession) -> Token:
        result = await db.execute(select(User).where(User.email == user_in.email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(user_in.password, user.password_hash):
            return None
        access_token = create_access_token({"sub": str(user.id)})
        return Token(access_token=access_token)
