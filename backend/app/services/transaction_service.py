from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionOut
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from datetime import datetime

class TransactionService:
    async def create_transaction(self, transaction_in: TransactionCreate, user, db: AsyncSession) -> TransactionOut:
        transaction = Transaction(
            user_id=user.id,
            account_id=transaction_in.account_id,
            category_id=transaction_in.category_id,
            type=transaction_in.type,
            amount=transaction_in.amount,
            description=transaction_in.description,
            transaction_date=transaction_in.transaction_date or datetime.utcnow(),
            is_recurring=transaction_in.is_recurring,
            recurrence_id=transaction_in.recurrence_id,
            installment_number=transaction_in.installment_number,
            total_installments=transaction_in.total_installments,
            tags=transaction_in.tags,
            notes=transaction_in.notes,
            attachments=transaction_in.attachments
        )
        db.add(transaction)
        await db.commit()
        await db.refresh(transaction)
        return TransactionOut.from_orm(transaction)

    async def list_transactions(self, user, db: AsyncSession) -> list[TransactionOut]:
        result = await db.execute(select(Transaction).where(Transaction.user_id == user.id))
        transactions = result.scalars().all()
        return [TransactionOut.from_orm(t) for t in transactions]
