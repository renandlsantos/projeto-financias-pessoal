# 💰 FinanceFlow Development Instructions

## 🎯 Project Context
**FinanceFlow v3.0** é um sistema completo de gestão de finanças pessoais com arquitetura de microserviços, desenvolvido para atingir 200.000 usuários com modelo freemium. O projeto possui documentação completa em `/docs/`, agentes especializados em `/agents/` e plano de desenvolvimento em `/plans/`.

### Principais Diferenciais
- Visibilidade financeira em tempo real
- Categorização automática inteligente
- Sistema de metas, orçamentos e alertas
- Relatórios detalhados e exportação
- Interface responsiva e intuitiva

## 🏗️ Arquitetura do Sistema
- **Padrão**: Microserviços com API Gateway
- **Backend**: FastAPI + PostgreSQL + Redis + RabbitMQ
- **Frontend**: React SPA com TypeScript strict
- **Infraestrutura**: Docker + Kubernetes + AWS
- **Monitoramento**: Observabilidade completa

### Microserviços Planejados
- Auth Service, Transaction Service, Account Service
- Budget Service, Report Service, Notification Service
- API Gateway (Kong), Cache (Redis), Queue (Celery)

## 🚀 Backend Standards (Python/FastAPI)
- **Framework**: FastAPI com async/await obrigatório
- **ORM**: SQLAlchemy 2.0 com AsyncSession
- **Database**: PostgreSQL 15 com UUID primary keys
- **Migration**: Alembic para versionamento
- **Validation**: Pydantic v2 para schemas
- **Auth**: JWT com refresh tokens + bcrypt
- **Testing**: pytest com httpx para APIs
- **Quality**: ruff para linting/formatting
- **Type hints**: Obrigatório em todas as funções

### Estrutura de Pastas Backend
```
backend/app/
├── api/v1/          # Endpoints REST (finos)
├── core/            # Config, database, deps, security
├── models/          # SQLAlchemy models
├── schemas/         # Pydantic schemas
├── services/        # Lógica de negócio (grossos)
└── tests/           # Testes unitários e integração
```

## 🎨 Frontend Standards (React/TypeScript)
- **Framework**: React 18 com TypeScript 5 strict
- **UI Library**: Material-UI (MUI) v5
- **Forms**: React Hook Form + Zod validation
- **State**: Redux Toolkit + React Query
- **HTTP**: Axios com interceptors
- **Build**: Vite como bundler
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router v6

### Estrutura de Pastas Frontend
```
frontend/src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── hooks/          # Custom hooks
├── services/       # Integração com APIs
├── store/          # Redux store
├── types/          # TypeScript definitions
└── utils/          # Funções utilitárias
```

## 📋 Code Patterns & Standards
- **API Design**: RESTful com padronização OpenAPI
- **Backend**: Repository + Service pattern
- **Dependency Injection**: FastAPI Depends
- **Error Handling**: Exception handlers globais
- **Frontend**: Composition pattern, Error boundaries
- **Responsive**: Mobile-first design
- **Performance**: Lazy loading, code splitting

### Naming Conventions
- **Database**: snake_case (users, created_at)
- **Python**: snake_case functions, PascalCase classes
- **TypeScript**: camelCase variables, PascalCase components
- **URLs**: kebab-case (/user-profile)
- **Files**: kebab-case (user-service.ts)

## 🔐 Security Requirements
- **Input Validation**: Todos endpoints com Pydantic
- **SQL Injection**: Apenas ORM, zero SQL raw
- **XSS Prevention**: Sanitização automática
- **CORS**: Configuração restritiva
- **Rate Limiting**: Por IP e usuário
- **Password**: bcrypt com salt rounds 12
- **JWT**: Access (15min) + Refresh tokens (7 dias)
- **MFA**: TOTP para contas sensíveis

## 💾 Database Standards
- **Engine**: PostgreSQL 15
- **Primary Keys**: UUID v4 obrigatório
- **Timestamps**: created_at/updated_at em todas tabelas
- **Foreign Keys**: Com constraints e ON DELETE
- **Indexes**: Performance queries frequentes
- **Migrations**: Alembic com rollback testado

### Tabelas Principais Implementadas
- **users**: Autenticação, perfil, MFA
- **accounts**: Contas bancárias, cartões, investimentos  
- **transactions**: Receitas, despesas, transferências
- **refresh_tokens**: Gestão de sessões

### Próximas Tabelas (Roadmap)
- **categories**: Categorização automática
- **budgets**: Orçamentos mensais por categoria
- **goals**: Metas financeiras com progresso
- **attachments**: Anexos de comprovantes

## 📊 Current Implementation Status

### ✅ Implementado
- Sistema de autenticação JWT completo
- CRUD de usuários com validação
- Gestão de contas financeiras
- Transações básicas (receitas/despesas)
- Middleware de CORS e logging
- Migrations básicas com Alembic

### 🚧 Em Desenvolvimento
- Dashboard com métricas financeiras
- Categorização de transações
- Relatórios e gráficos
- Frontend completo com Material-UI

### 📋 Próximos Sprints (Ver /plans/plan.md)
1. **Sprint 01**: Orçamentos mensais + Metas financeiras
2. **Sprint 02**: Login social + Refatoração dashboard
3. **Sprint 03**: Categorização automática + Relatórios avançados

## 🧪 Testing Strategy
- **Backend**: pytest com >80% coverage
- **Frontend**: Vitest + RTL para componentes
- **Integration**: httpx para testes de API
- **E2E**: Playwright para fluxos críticos
- **Performance**: Load testing com Locust

## 📚 Documentation & Team
- **Docs**: Estrutura completa em `/docs/README.md`
- **Agents**: Prompts especializados em `/agents/`
- **PRD**: Documento completo em `/prd.md`
- **Team**: 7 agentes especializados (Product Owner, Tech Lead, Backend Dev, Frontend Dev, DBA, Infra & QA, UX Designer)

## 🎯 Business Goals
- **Fase 1**: 10.000 usuários ativos (MVP)
- **Fase 2**: 50.000 usuários (modelo freemium)
- **Fase 3**: 200.000 usuários (break-even)

## ❌ Critical Restrictions
- **NO** outros frameworks web (apenas FastAPI)
- **NO** outros bancos de dados (apenas PostgreSQL)
- **NO** lógica de negócio em endpoints (usar services)
- **NO** SQL raw queries (apenas ORM)
- **NO** models SQLAlchemy diretos em responses (usar schemas)
- **NO** bibliotecas não aprovadas pelo Tech Lead
