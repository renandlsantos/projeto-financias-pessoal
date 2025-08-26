from fastapi import APIRouter

from .budgets import router as budgets_router
from .categories import router as categories_router

api_router = APIRouter()

# Registrar routers das funcionalidades
api_router.include_router(budgets_router)
api_router.include_router(categories_router)

# Exemplo de como incluir outros routers quando implementados
# from .transactions import router as transactions_router
# from .auth import router as auth_router
# from .accounts import router as accounts_router
# api_router.include_router(transactions_router)
# api_router.include_router(auth_router)  
# api_router.include_router(accounts_router)

__all__ = ["api_router"]