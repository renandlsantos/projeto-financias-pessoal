from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.transaction import TransactionCreate, TransactionOut
from app.core.deps import get_current_user, get_db
from app.services.transaction_service import TransactionService

router = APIRouter()
transaction_service = TransactionService()

@router.post("/", response_model=TransactionOut)
async def create_transaction(transaction_in: TransactionCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await transaction_service.create_transaction(transaction_in, user, db)

@router.get("/", response_model=list[TransactionOut])
async def list_transactions(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await transaction_service.list_transactions(user, db)
