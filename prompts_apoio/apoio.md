1. cd docs
mkdir 01-getting-started 02-configuration 03-development 04-architecture 05-features 06-deployment

2. 

**PROMPT COPILOT:**
```
@workspace create documentation structure for FinanceFlow financial management system following this pattern:

docs/
├── 01-getting-started/
│   ├── README.md
│   └── project-overview.md
├── 02-configuration/
│   ├── README.md
│   ├── environment.md
│   └── database.md
├── 03-development/
│   ├── README.md
│   ├── backend-setup.md
│   └── frontend-setup.md
├── 04-architecture/
│   ├── README.md
│   ├── system-design.md
│   └── database-schema.md
├── 05-features/
│   ├── README.md
│   ├── authentication.md
│   ├── transactions.md
│   └── reports.md
└── 06-deployment/
    ├── README.md
    └── production.md

Generate all files with appropriate content based on the FinanceFlow PRD requirements.
```

3. criar um branch de start do desenvolvimento e suba essa branch pra mim no repositorio

4. preciso que você crie o arquivo .github/copilot-instructions.md com o contexto para nosso projeto seguido de base o que temos dentro do nosso #file:prd.md 
---
# FinanceFlow Development Instructions

## Project Context
Personal finance management system with Python FastAPI backend and React TypeScript frontend.

## Backend Standards
- FastAPI with async/await
- SQLAlchemy 2.0 with PostgreSQL
- Pydantic for validation
- JWT authentication
- Comprehensive error handling
- pytest for testing
- Type hints always

## Frontend Standards  
- React 18 with TypeScript strict
- Material-UI components
- React Hook Form + Zod validation
- Axios with interceptors
- Redux Toolkit for state
- Jest + RTL testing

## Code Patterns
- RESTful API design
- Repository pattern for data access
- Service layer for business logic
- Dependency injection
- Error boundary components
- Responsive design mobile-first

## Security Requirements
- Input validation all endpoints
- SQL injection prevention
- XSS protection
- Rate limiting
- Secure password hashing (bcrypt)
- JWT token best practices

## Database Naming
- snake_case for tables/columns
- UUID primary keys
- created_at/updated_at timestamps
- Proper foreign key constraints
- Database indexes for performance

---

5. crie pra mim pasta chamada backend e com ela crie o arquivo requirements.txt com todas as libs que precisamos para desenvolver e depois crie um venv local e instale essas libs 

---

6. @workspace dentro o back end

# Criar arquivos base
touch app/__init__.py
touch app/main.py
mkdir app/api app/core app/models app/schemas app/services

---

7. analisar a nossa pasta docs e com isso monte pra gente a estrutura base do FastAPi para nosso projeto seguindo um padrao de estrutra para o FinanceFlow baseado no nosso #file:prd.md 


app/
├── __init__.py
├── main.py (FastAPI app with CORS, middleware, routers)
├── core/
│   ├── __init__.py
│   ├── config.py (settings with Pydantic BaseSettings)
│   ├── database.py (SQLAlchemy async setup)
│   ├── security.py (JWT, password hashing)
│   └── deps.py (dependencies for DI)
├── api/
│   ├── __init__.py
│   └── v1/
│       ├── __init__.py
│       ├── auth.py
│       ├── users.py
│       ├── accounts.py
│       └── transactions.py
├── models/
│   ├── __init__.py
│   ├── user.py
│   ├── account.py
│   └── transaction.py
├── schemas/
│   ├── __init__.py
│   ├── user.py
│   ├── account.py
│   └── transaction.py
└── services/
    ├── __init__.py
    ├── auth_service.py
    └── transaction_service.py

Gere todos os arquivos com os padrões FastAPI adequados, suporte assíncrono e lógica de domínio do FinanceFlow.