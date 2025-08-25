from app.models.account import Account
from app.schemas.account import AccountCreate, AccountOut
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status

class AccountService:
    async def create_account(self, account_in: AccountCreate, user, db: AsyncSession) -> AccountOut:
        account = Account(
            user_id=user.id,
            name=account_in.name,
            type=account_in.type,
            bank=account_in.bank,
            agency=account_in.agency,
            account_number=account_in.account_number,
            initial_balance=account_in.initial_balance,
            current_balance=account_in.initial_balance,
            currency=account_in.currency,
            color=account_in.color,
            icon=account_in.icon
        )
        db.add(account)
        await db.commit()
        await db.refresh(account)
        return AccountOut.from_orm(account)

    async def list_accounts(self, user, db: AsyncSession) -> list[AccountOut]:
        result = await db.execute(select(Account).where(Account.user_id == user.id))
        accounts = result.scalars().all()
        return [AccountOut.from_orm(a) for a in accounts]
