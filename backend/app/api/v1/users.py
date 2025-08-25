from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from app.schemas.user import UserOut, UserUpdate, ChangePassword, MessageResponse
from app.core.deps import get_current_active_user, get_db
from app.models.user import User
from app.core.security import verify_password, get_password_hash

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Obtém informações do usuário atual.
    
    Retorna todos os dados do perfil do usuário autenticado.
    """
    return current_user

@router.put("/me", response_model=UserOut)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Atualiza informações do usuário atual.
    
    - **full_name**: Nome completo
    - **phone**: Telefone
    - **language**: Idioma preferido
    - **timezone**: Fuso horário
    - **currency**: Moeda padrão
    - **avatar_url**: URL do avatar
    """
    # Atualiza apenas campos fornecidos
    update_data = user_update.dict(exclude_unset=True)
    
    if update_data:
        stmt = update(User).where(User.id == current_user.id).values(**update_data)
        await db.execute(stmt)
        await db.commit()
        await db.refresh(current_user)
    
    return current_user

@router.post("/me/change-password", response_model=MessageResponse)
async def change_password(
    password_change: ChangePassword,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Altera senha do usuário atual.
    
    - **current_password**: Senha atual
    - **new_password**: Nova senha
    - **confirm_password**: Confirmação da nova senha
    """
    # Verifica senha atual
    if not verify_password(password_change.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )
    
    # Verifica se nova senha é diferente da atual
    if verify_password(password_change.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nova senha deve ser diferente da senha atual"
        )
    
    # Atualiza senha
    stmt = update(User).where(User.id == current_user.id).values(
        password_hash=get_password_hash(password_change.new_password)
    )
    await db.execute(stmt)
    await db.commit()
    
    return MessageResponse(message="Senha alterada com sucesso")

@router.delete("/me", response_model=MessageResponse)
async def deactivate_account(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Desativa conta do usuário atual.
    
    A conta é marcada como inativa, mas os dados são preservados.
    """
    stmt = update(User).where(User.id == current_user.id).values(is_active=False)
    await db.execute(stmt)
    await db.commit()
    
    return MessageResponse(message="Conta desativada com sucesso")
