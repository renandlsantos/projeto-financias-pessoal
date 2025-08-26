# 🧪 Guia Completo de Testes - FinanceFlow

## 📋 Visão Geral

O FinanceFlow possui uma estratégia de testes abrangente com 4 camadas:
- **Testes Unitários** (Backend: pytest, Frontend: Vitest)
- **Testes de Integração** (API + Banco de dados)
- **Testes E2E** (Playwright - fluxos completos)
- **Testes de Performance** (Locust - carga e stress)

## 🎯 Objetivos dos Testes

### Cobertura Mínima Exigida
- **Serviços Backend**: 90% de cobertura
- **Demais módulos**: 80% de cobertura
- **Componentes críticos**: 100% de cobertura

### Qualidade e Confiabilidade
- ✅ Validação de regras de negócio
- ✅ Tratamento de erros e edge cases
- ✅ Segurança e autenticação
- ✅ Performance e otimização
- ✅ Compatibilidade entre browsers

## 🏗️ Estrutura de Testes

### Backend (/backend/tests/)
```
tests/
├── conftest.py              # Fixtures e configuração pytest
├── test_auth.py            # Testes de autenticação existentes
├── test_category_service.py # Testes da CategoryService
├── test_budget_service.py   # Testes da BudgetService
├── test_budget_endpoints.py # Testes de integração API
├── integration/            # Testes de integração
│   ├── test_api_flow.py    # Fluxos completos de API
│   └── test_database.py    # Testes com banco real
└── performance/            # Testes de performance
    └── locustfile.py       # Scripts de carga
```

### Frontend (/frontend/src/test/)
```
src/test/
├── setup.ts                        # Configuração global
├── components/                     # Testes de componentes
│   ├── BudgetCard.test.tsx         # Componente BudgetCard
│   └── CategoryCard.test.tsx       # Componente CategoryCard
├── pages/                          # Testes de páginas
│   └── BudgetsPage.test.tsx        # Página de orçamentos
├── services/                       # Testes de serviços
│   └── budgetService.test.ts       # Service de orçamentos
└── utils/                          # Testes de utilitários
```

### E2E (/frontend/tests/e2e/)
```
tests/e2e/
├── budgets.spec.ts         # Fluxos de orçamentos
├── categories.spec.ts      # Fluxos de categorias
├── auth.spec.ts           # Fluxos de autenticação
└── navigation.spec.ts     # Navegação e UX
```

## 🔧 Configuração e Setup

### Backend - pytest
```bash
cd backend

# Instalar dependências de teste
pip install pytest pytest-cov pytest-asyncio httpx

# Configurar banco de testes
export DATABASE_URL="postgresql://user:pass@localhost/financeflow_test"

# Rodar testes
pytest tests/ -v --cov=app --cov-report=html
```

### Frontend - Vitest
```bash
cd frontend

# Instalar dependências
npm install

# Rodar testes unitários
npm run test

# Rodar com cobertura
npm run test:coverage

# Rodar em modo watch
npm run test:watch
```

### E2E - Playwright
```bash
cd frontend

# Instalar Playwright
npm install @playwright/test
npx playwright install

# Rodar testes E2E
npm run test:e2e

# Rodar com interface visual
npm run test:e2e:ui

# Rodar apenas um browser
npx playwright test --project=chromium
```

## 🧪 Tipos de Testes Implementados

### 1. Testes Unitários Backend

#### CategoryService (`test_category_service.py`)
- ✅ Criação de categorias com validação
- ✅ Prevenção de nomes duplicados
- ✅ Hierarquia de categorias (pai/filho)
- ✅ Categorias do sistema vs personalizadas
- ✅ Validação de regras de negócio
- ✅ Tratamento de erros e exceptions

#### BudgetService (`test_budget_service.py`)
- ✅ CRUD completo de orçamentos
- ✅ Cálculos financeiros (percentual, restante)
- ✅ Determinação de status (No controle, Atenção, Excedido)
- ✅ Validação de períodos e conflitos
- ✅ Geração de resumos e relatórios
- ✅ Formatação de moeda (pt-BR)

#### API Endpoints (`test_budget_endpoints.py`)
- ✅ Autenticação e autorização
- ✅ Validação de entrada (Pydantic)
- ✅ Respostas HTTP corretas
- ✅ Paginação e filtros
- ✅ Tratamento de erros 404/422/500

### 2. Testes Unitários Frontend

#### BudgetCard Component (`BudgetCard.test.tsx`)
- ✅ Renderização de informações financeiras
- ✅ Status visuais (cores, ícones, progresso)
- ✅ Interações (editar, excluir, visualizar)
- ✅ Estados variáveis (loading, error, empty)
- ✅ Responsividade e acessibilidade

#### CategoryCard Component (`CategoryCard.test.tsx`)
- ✅ Exibição de categoria e subcategorias
- ✅ Distinção sistema vs personalizada
- ✅ Expansão/colapso de hierarquia
- ✅ Estados de seleção e loading
- ✅ Validação de ações permitidas

#### BudgetService (`budgetService.test.ts`)
- ✅ Requisições HTTP (GET/POST/PUT/DELETE)
- ✅ Tratamento de erros de rede
- ✅ Transformação de dados
- ✅ Funções utilitárias (formatação, cálculos)
- ✅ Mock de dependências (axios)

### 3. Testes E2E

#### Fluxo de Orçamentos (`budgets.spec.ts`)
- ✅ Criar novo orçamento com validação completa
- ✅ Editar orçamento existente
- ✅ Excluir com confirmação
- ✅ Busca e filtros por status
- ✅ Navegação para detalhes
- ✅ Validação de formulários
- ✅ Tratamento de erros da API
- ✅ Estatísticas e resumos

#### Fluxo de Categorias (`categories.spec.ts`)
- ✅ CRUD completo de categorias
- ✅ Criação de hierarquia (subcategorias)
- ✅ Validação de nomes únicos
- ✅ Prevenção de exclusão com dependências
- ✅ Filtros sistema vs personalizada
- ✅ Estatísticas de uso

### 4. Testes de Performance
- ✅ Load testing com Locust
- ✅ Stress testing em endpoints críticos
- ✅ Monitoramento de tempo de resposta
- ✅ Análise de concurrent users

## 🚀 Comandos Úteis

### Execução Rápida
```bash
# Todos os testes backend
make test-backend

# Todos os testes frontend
make test-frontend

# Todos os testes E2E
make test-e2e

# Todos os testes do projeto
make test-all
```

### Comandos Específicos
```bash
# Backend - apenas um arquivo
pytest tests/test_budget_service.py -v

# Frontend - modo watch
npm run test -- --watch

# E2E - apenas um spec
npx playwright test budgets.spec.ts

# Cobertura detalhada
pytest --cov=app --cov-report=html --cov-report=term
```

### Debug e Desenvolvimento
```bash
# Frontend com debug
npm run test -- --reporter=verbose

# E2E com browser visível
npx playwright test --headed

# E2E em modo debug
npx playwright test --debug
```

## 📊 Relatórios e Métricas

### Cobertura de Código
- **Backend**: HTML report em `backend/htmlcov/`
- **Frontend**: HTML report em `frontend/coverage/`
- **Integração**: Codecov para CI/CD

### Relatórios E2E
- **Playwright Report**: Interface visual com screenshots/videos
- **JUnit XML**: Integração com CI/CD
- **Traces**: Debug detalhado de falhas

### Métricas de Performance
- **Response Time**: Tempo médio de resposta
- **Throughput**: Requisições por segundo
- **Error Rate**: Taxa de erro sob carga
- **Resource Usage**: CPU/Memória durante testes

## 🔍 Debugging e Solução de Problemas

### Problemas Comuns

#### Testes Backend Falhando
```bash
# Verificar banco de teste
export DATABASE_URL="postgresql://user:pass@localhost/test_db"
alembic upgrade head

# Limpar cache
pytest --cache-clear

# Rodar com mais detalhes
pytest -v -s
```

#### Testes Frontend Falhando
```bash
# Limpar node_modules
rm -rf node_modules package-lock.json
npm install

# Verificar setup
npm run test -- --reporter=verbose

# Debug específico
npm run test -- --run BudgetCard.test.tsx
```

#### Testes E2E Instáveis
```bash
# Aumentar timeouts
npx playwright test --timeout=60000

# Rodar com retry
npx playwright test --retries=3

# Debug interativo
npx playwright test --debug
```

### Boas Práticas

#### Backend
- ✅ Usar fixtures para dados de teste
- ✅ Isolar testes com transações
- ✅ Mock dependências externas
- ✅ Testar casos extremos (edge cases)
- ✅ Validar tipos de retorno

#### Frontend
- ✅ Usar React Testing Library patterns
- ✅ Testar comportamento, não implementação
- ✅ Mock serviços e APIs
- ✅ Testar estados de loading/error
- ✅ Validar acessibilidade

#### E2E
- ✅ Usar Page Object Model
- ✅ Aguardar elementos antes de interagir
- ✅ Testar fluxos reais do usuário
- ✅ Minimizar dependências entre testes
- ✅ Usar dados determinísticos

## 📈 Roadmap de Testes

### Sprint Atual ✅
- [x] Testes unitários CategoryService
- [x] Testes unitários BudgetService  
- [x] Testes de integração API
- [x] Testes E2E básicos
- [x] Configuração CI/CD

### Próximo Sprint 🚀
- [ ] Testes de performance avançados
- [ ] Testes de acessibilidade (axe-core)
- [ ] Testes visuais (screenshot comparison)
- [ ] Testes de segurança automatizados
- [ ] Integration testing com serviços externos

### Futuro 🔮
- [ ] Testes de contrato (Pact)
- [ ] Testes de mutação
- [ ] Chaos engineering
- [ ] Monitoring sintético
- [ ] A/B testing framework

## 🤝 Contribuindo

### Adicionando Novos Testes
1. Seguir estrutura existente
2. Nomear arquivos com `.test.` ou `.spec.`
3. Incluir cases positivos e negativos
4. Documentar cenários complexos
5. Validar cobertura mínima

### Code Review
- Verificar cobertura de testes
- Validar casos extremos
- Checar performance dos testes
- Confirmar determinismo
- Avaliar legibilidade

---

**Documentação atualizada**: Janeiro 2024  
**Próxima revisão**: Fevereiro 2024  
**Responsável**: Infra & QA Engineer
