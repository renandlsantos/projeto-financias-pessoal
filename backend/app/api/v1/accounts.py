from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.account import AccountCreate, AccountOut
from app.core.deps import get_current_user, get_db
from app.services.account_service import AccountService

router = APIRouter()
account_service = AccountService()

@router.post("/", response_model=AccountOut)
async def create_account(account_in: AccountCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await account_service.create_account(account_in, user, db)

@router.get("/", response_model=list[AccountOut])
async def list_accounts(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await account_service.list_accounts(user, db)
