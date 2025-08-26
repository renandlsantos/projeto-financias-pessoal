# 📊 PRD - Sistema de Controle Financeiro Pessoal
## 💰 FinanceFlow v3.0

---

<div align="center">

[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)](https://github.com/renandlsantos/projeto-financias-pessoal)
[![Version](https://img.shields.io/badge/Version-3.0.0-blue?style=for-the-badge)](https://github.com/renandlsantos/projeto-financias-pessoal)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://github.com/renandlsantos/projeto-financias-pessoal)

**Sistema completo de gestão de finanças pessoais com arquitetura moderna e interface intuitiva**

</div>

---

## 📋 Índice

1. [🎯 Visão Executiva](#1-visão-executiva)
2. [📊 Análise de Mercado](#2-análise-de-mercado)
3. [👥 Personas Detalhadas](#3-personas-detalhadas)
4. [⚙️ Arquitetura & Implementação](#4-arquitetura--implementação)
5. [🔧 Stack Tecnológico Atual](#5-stack-tecnológico-atual)
6. [🚀 Requisitos Funcionais](#6-requisitos-funcionais)
7. [📈 Fluxogramas e Diagramas](#7-fluxogramas-e-diagramas)
8. [🛠️ Roadmap de Desenvolvimento](#8-roadmap-de-desenvolvimento)
9. [💰 Modelo de Negócio](#9-modelo-de-negócio)
10. [⚠️ Riscos e Mitigações](#10-riscos-e-mitigações)

---


### 1. VISÃO EXECUTIVA

#### 1.1 Problema
Pessoas físicas enfrentam dificuldades significativas no controle de suas finanças pessoais:
- 78% dos brasileiros não conseguem poupar regularmente
- 65% não sabem exatamente onde gastam seu dinheiro
- 82% não possuem controle efetivo de orçamento
- 45% se endividam por falta de planejamento financeiro

#### 1.2 Solução
FinanceFlow é uma plataforma web completa de gestão financeira pessoal que oferece:
- Visibilidade total das finanças em tempo real
- Categorização automática inteligente de gastos
- Sistema de metas e orçamentos com alertas proativos
- Relatórios e insights acionáveis
- Interface intuitiva e responsiva

#### 1.3 Objetivos de Negócio
- Atingir 10.000 usuários ativos
- Atingir 50.000 usuários e implementar modelo freemium
- Atingir 200.000 usuários e break-even

---


### 2. ANÁLISE DE MERCADO

#### 2.1 Tamanho do Mercado
- **TAM**: R$ 2.5 bilhões (mercado de gestão financeira pessoal no Brasil)
- **SAM**: R$ 500 milhões (aplicações web/mobile)
- **SOM**: R$ 50 milhões (5 anos)

#### 2.2 Competidores
| Competidor | Pontos Fortes | Pontos Fracos | Diferencial FinanceFlow |
|------------|---------------|---------------|-------------------------|
| Mobills | Grande base de usuários | Interface complexa | UX simplificada |
| Organizze | Funcionalidades robustas | Caro | Freemium generoso |
| GuiaBolso | Integração bancária | Privacidade | Controle manual seguro |

#### 2.3 Posicionamento
"A ferramenta mais intuitiva e completa para quem quer tomar controle real de suas finanças, sem complicação."

---

### 3. PERSONAS DETALHADAS

#### 3.1 Persona Primária - Marina Costa
**Demografia**
- Idade: 32 anos
- Profissão: Analista de Marketing
- Renda: R$ 6.500/mês
- Local: São Paulo, SP
- Estado civil: Solteira

**Comportamento Financeiro**
- Gasta 30% em moradia, 20% em alimentação, 15% em transporte
- Usa 3 cartões de crédito diferentes
- Tem dificuldade em economizar para objetivos
- Faz compras por impulso online

**Dores**
- "Não sei onde meu dinheiro vai parar"
- "Sempre estouro o cartão de crédito"
- "Quero viajar mas nunca sobra dinheiro"
- "Planilhas são muito trabalhosas"

**Necessidades**
- Visualização clara e imediata dos gastos
- Alertas antes de estourar limites
- Planejamento de metas tangíveis
- Simplicidade de uso

#### 3.2 Persona Secundária - Ricardo Almeida
**Demografia**
- Idade: 45 anos
- Profissão: Pequeno empresário (MEI)
- Renda: R$ 8.000-15.000/mês (variável)
- Local: Belo Horizonte, MG
- Estado civil: Casado, 2 filhos

**Comportamento Financeiro**
- Mistura finanças pessoais e empresariais
- Renda variável dificulta planejamento
- Precisa separar gastos para impostos
- Quer construir patrimônio para família

**Necessidades**
- Múltiplas contas/projetos
- Relatórios para contabilidade
- Projeção de fluxo de caixa
- Planejamento familiar

---

### 4. REQUISITOS FUNCIONAIS DETALHADOS

#### 4.1 Módulo de Autenticação e Usuários

##### RF-AUTH-001: Cadastro de Usuário
- **Descrição**: Permitir registro com email e senha
- **Campos obrigatórios**: Nome, email, senha (min 8 caracteres)
- **Validações**: Email único, senha forte
- **Extras**: Captcha, termos de uso

##### RF-AUTH-002: Login Seguro
- **Métodos**: Email/senha, Google OAuth, Apple ID
- **Segurança**: 2FA opcional via SMS/app
- **Sessão**: JWT com refresh token (15min/7dias)

##### RF-AUTH-003: Recuperação de Senha
- **Fluxo**: Email com link temporário (1h validade)
- **Segurança**: Limite 3 tentativas/dia
- **Validação**: Perguntas de segurança opcionais

##### RF-AUTH-004: Perfil do Usuário
- **Dados**: Nome, foto, telefone, endereço
- **Preferências**: Moeda, idioma, fuso horário
- **Privacidade**: Configurações de compartilhamento

#### 4.2 Módulo de Contas Bancárias

##### RF-CONTA-001: Gerenciamento de Contas
- **Tipos**: Corrente, Poupança, Investimento, Cartão de Crédito, Dinheiro
- **Campos**: Nome, banco, agência, conta, saldo inicial
- **Recursos**: Cores e ícones personalizáveis

##### RF-CONTA-002: Reconciliação
- **Manual**: Ajuste de saldo atual
- **Histórico**: Log de todas reconciliações
- **Alertas**: Divergências significativas

##### RF-CONTA-003: Múltiplas Moedas
- **Suporte**: BRL, USD, EUR
- **Conversão**: Taxa automática (API BC)
- **Histórico**: Taxas utilizadas

#### 4.3 Módulo de Transações

##### RF-TRANS-001: Registro de Transações
- **Tipos**: Receita, Despesa, Transferência
- **Campos**: Valor, data, descrição, categoria, conta
- **Anexos**: Fotos de recibos, PDFs

##### RF-TRANS-002: Categorização
- **Automática**: IA baseada em padrões
- **Manual**: Seleção/criação de categorias
- **Hierárquica**: Categoria > Subcategoria

##### RF-TRANS-003: Transações Recorrentes
- **Padrões**: Diária, Semanal, Mensal, Anual
- **Gestão**: Pausar, editar, excluir série
- **Previsão**: Projeção futura automática

##### RF-TRANS-004: Parcelamentos
- **Cartão**: Divisão automática
- **Juros**: Cálculo de custo total
- **Visualização**: Timeline de parcelas

##### RF-TRANS-005: Tags e Notas
- **Tags**: Múltiplas por transação
- **Notas**: Campo texto livre
- **Busca**: Por tags e conteúdo

#### 4.4 Módulo de Orçamentos

##### RF-ORC-001: Criação de Orçamentos
- **Período**: Mensal, Trimestral, Anual
- **Tipo**: Por categoria ou total
- **Base**: Histórico ou manual

##### RF-ORC-002: Acompanhamento
- **Visual**: Barras de progresso
- **Cores**: Verde/Amarelo/Vermelho
- **Projeção**: Estimativa fim do período

##### RF-ORC-003: Alertas Inteligentes
- **Níveis**: 50%, 80%, 100% do orçamento
- **Canais**: In-app, email, push
- **Personalização**: Por categoria

#### 4.5 Módulo de Metas

##### RF-META-001: Definição de Metas
- **Tipos**: Economia, Redução de gastos, Quitação
- **Prazo**: Data alvo configurável
- **Valor**: Objetivo monetário

##### RF-META-002: Contribuições
- **Manual**: Aportes específicos
- **Automática**: % da receita
- **Tracking**: Progresso visual

##### RF-META-003: Gamificação
- **Badges**: Conquistas desbloqueáveis
- **Streaks**: Dias consecutivos economizando
- **Ranking**: Comparativo anônimo opcional

#### 4.6 Módulo de Relatórios

##### RF-REL-001: Dashboard Principal
- **Widgets**: Saldo, gastos do mês, gráficos
- **Personalização**: Arrastar e soltar
- **Período**: Seletor de datas

##### RF-REL-002: Relatórios Detalhados
- **Tipos**: Fluxo de caixa, DRE pessoal, Evolução
- **Filtros**: Período, conta, categoria
- **Comparativos**: Mês a mês, ano a ano

##### RF-REL-003: Exportação
- **Formatos**: PDF, Excel, CSV
- **Conteúdo**: Dados e gráficos
- **Agendamento**: Envio automático mensal

##### RF-REL-004: Insights Automáticos
- **Análises**: Padrões de gasto
- **Sugestões**: Economia potencial
- **Alertas**: Anomalias detectadas

---

### 5. REQUISITOS NÃO FUNCIONAIS

#### 5.1 Performance
- **Tempo de resposta**: <200ms (p95)
- **Carregamento inicial**: <3s
- **Disponibilidade**: 99.9% uptime
- **Concorrência**: 10.000 usuários simultâneos

#### 5.2 Segurança
- **Criptografia**: TLS 1.3, AES-256
- **Autenticação**: OAuth 2.0, JWT
- **Autorização**: RBAC
- **Compliance**: LGPD, PCI DSS Level 1

#### 5.3 Usabilidade
- **Responsivo**: Mobile-first design
- **Acessibilidade**: WCAG 2.1 Level AA
- **Idiomas**: PT-BR, EN, ES
- **Suporte**: Chat in-app, tutoriais

#### 5.4 Escalabilidade
- **Arquitetura**: Microserviços
- **Database**: Sharding ready
- **Cache**: Redis distributed
- **CDN**: Global distribution

---

## 4. ⚙️ Arquitetura & Implementação

### 4.1 📊 Status Atual do Projeto

**🟢 Implementado (100%)**
- ✅ Sistema de autenticação JWT completo com refresh tokens
- ✅ API RESTful com FastAPI e documentação automática
- ✅ Modelos de dados com SQLAlchemy 2.0 e PostgreSQL
- ✅ Frontend React com TypeScript e Material-UI
- ✅ Containerização com Docker e Docker Compose
- ✅ Estrutura de testes unitários
- ✅ Configuração de desenvolvimento completa

**🟡 Em Desenvolvimento (60%)**
- 🔄 Interface de usuário responsiva
- 🔄 Dashboard principal com gráficos
- 🔄 Sistema de categorização de transações
- 🔄 Validações avançadas com Zod

**🔴 Planejado (0%)**
- 📋 Relatórios financeiros avançados
- 📋 Sistema de orçamentos e metas
- 📋 Notificações em tempo real
- 📋 Exportação de dados

---

## 5. 🔧 Stack Tecnológico Atual

### 5.1 Backend (FastAPI + Python)

```mermaid
graph TD
    A[FastAPI App] --> B[Authentication Layer]
    A --> C[API Endpoints]
    B --> D[JWT Tokens]
    B --> E[Password Hashing]
    C --> F[User Management]
    C --> G[Account Management]
    C --> H[Transaction Management]
    
    F --> I[(PostgreSQL)]
    G --> I
    H --> I
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style I fill:#e8f5e8
```

**Estrutura Atual:**
```
backend/
├── app/
│   ├── api/v1/           # Endpoints REST API
│   │   ├── auth.py       # Autenticação e tokens
│   │   ├── users.py      # Gestão de usuários
│   │   ├── accounts.py   # Contas bancárias
│   │   └── transactions.py # Transações
│   ├── core/             # Configurações centrais
│   │   ├── config.py     # Configurações ambiente
│   │   ├── database.py   # Conexão PostgreSQL
│   │   ├── deps.py       # Dependências FastAPI
│   │   └── security.py   # JWT e senha
│   ├── models/           # SQLAlchemy Models
│   │   ├── user.py       # Modelo usuário
│   │   ├── account.py    # Modelo conta
│   │   ├── transaction.py # Modelo transação
│   │   └── refresh_token.py # Tokens refresh
│   ├── schemas/          # Pydantic Schemas
│   │   ├── user.py       # Validação usuário
│   │   ├── account.py    # Validação conta
│   │   └── transaction.py # Validação transação
│   └── services/         # Lógica de negócio
│       ├── auth_service.py    # Serviços auth
│       ├── account_service.py # Serviços conta
│       └── transaction_service.py # Serviços transação
└── tests/                # Testes unitários
    └── test_auth.py      # Testes autenticação
```

### 5.2 Frontend (React + TypeScript)

```mermaid
graph TD
    A[React App] --> B[Authentication]
    A --> C[Dashboard]
    A --> D[Components]
    
    B --> E[Login Page]
    B --> F[Registration]
    B --> G[JWT Management]
    
    C --> H[Main Dashboard]
    C --> I[Account Summary]
    C --> J[Recent Transactions]
    
    D --> K[Layout Components]
    D --> L[UI Components]
    D --> M[Form Components]
    
    G --> N[Redux Store]
    I --> N
    J --> N
    
    style A fill:#e3f2fd
    style B fill:#fff8e1
    style C fill:#f1f8e9
    style N fill:#fce4ec
```

**Estrutura Atual:**
```
frontend/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── layout/       # Layout principal
│   │   │   └── MainLayout.tsx
│   │   └── ui/           # Componentes UI
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   ├── pages/            # Páginas da aplicação
│   │   ├── auth/         # Páginas autenticação
│   │   │   └── LoginPage.tsx
│   │   └── dashboard/    # Páginas dashboard
│   │       └── DashboardPage.tsx
│   ├── hooks/            # Hooks customizados
│   │   ├── useAuth.ts    # Hook autenticação
│   │   └── redux.ts      # Hooks Redux
│   ├── services/         # Serviços e APIs
│   │   └── api/          # Cliente API
│   │       ├── client.ts    # Axios config
│   │       └── endpoints.ts # Endpoints
│   ├── store/            # Estado global
│   │   ├── store.ts      # Store Redux
│   │   └── slices/       # Redux slices
│   │       └── authSlice.ts
│   ├── types/            # Definições TypeScript
│   │   ├── auth.ts       # Tipos auth
│   │   ├── api.ts        # Tipos API
│   │   └── entities.ts   # Entidades
│   ├── utils/            # Utilitários
│   │   ├── constants.ts  # Constantes
│   │   └── formatters.ts # Formatadores
│   └── styles/           # Estilos globais
│       ├── globals.css   # CSS global
│       └── theme.ts      # Tema Material-UI
```

### 5.3 Tecnologias Implementadas

| Categoria | Tecnologia | Versão | Status |
|-----------|------------|--------|--------|
| **Backend** | FastAPI | Latest | ✅ Implementado |
| | SQLAlchemy | 2.0 | ✅ Implementado |
| | PostgreSQL | 15 | ✅ Implementado |
| | Alembic | Latest | ✅ Implementado |
| | pytest | Latest | ✅ Implementado |
| **Frontend** | React | 18 | ✅ Implementado |
| | TypeScript | 5 | ✅ Implementado |
| | Material-UI | v5 | ✅ Implementado |
| | Redux Toolkit | Latest | ✅ Implementado |
| | Axios | Latest | ✅ Implementado |
| | Vite | Latest | ✅ Implementado |
| **DevOps** | Docker | Latest | ✅ Implementado |
| | Docker Compose | Latest | ✅ Implementado |
| | GitHub Actions | - | 🔄 Em desenvolvimento |

---

#### 6.2 Arquitetura de Sistema

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                      │
└─────────────┬───────────────────────┬───────────────┘
              │                       │
    ┌─────────▼─────────┐   ┌────────▼────────┐
    │   Web Frontend    │   │   Mobile API    │
    │   (React SPA)     │   │   (REST/GraphQL)│
    └─────────┬─────────┘   └────────┬────────┘
              │                       │
    ┌─────────▼───────────────────────▼─────────┐
    │            API Gateway (Kong)              │
    └─────────┬───────────────────────┬─────────┘
              │                       │
    ┌─────────▼─────────────────────▼─────────┐
    │         Microservices Layer              │
    ├───────────────────────────────────────────┤
    │ • Auth Service    • Transaction Service  │
    │ • Account Service • Budget Service       │
    │ • Report Service  • Notification Service │
    └─────────┬───────────────────────┬─────────┘
              │                       │
    ┌─────────▼─────────┐   ┌────────▼────────┐
    │   PostgreSQL      │   │     Redis       │
    │   (Primary DB)    │   │    (Cache)      │
    └───────────────────┘   └─────────────────┘
```

#### 6.3 Modelo de Dados Principal

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    mfa_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Contas
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'investment', 'cash')),
    bank VARCHAR(100),
    agency VARCHAR(10),
    account_number VARCHAR(20),
    initial_balance DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'BRL',
    color VARCHAR(7),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense')) NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Transações
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    type VARCHAR(20) CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_id UUID,
    installment_number INTEGER,
    total_installments INTEGER,
    tags TEXT[],
    notes TEXT,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Orçamentos
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    amount DECIMAL(12,2) NOT NULL,
    period VARCHAR(20) CHECK (period IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    alert_threshold INTEGER DEFAULT 80,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Metas
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    target_date DATE NOT NULL,
    category VARCHAR(50),
    icon VARCHAR(50),
    color VARCHAR(7),
    is_achieved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para Performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_budgets_user_active ON budgets(user_id, is_active);
CREATE INDEX idx_goals_user_active ON goals(user_id, is_achieved);
```

---


## 7. 📈 Fluxogramas e Diagramas

### 7.1 🔐 Fluxo de Autenticação

```mermaid
flowchart TD
    A[👤 Usuário] --> B{Possui Conta?}
    B -->|Não| C[📝 Página de Registro]
    B -->|Sim| D[🔓 Página de Login]
    
    C --> E[✏️ Preencher Dados]
    E --> F{Validação OK?}
    F -->|Não| G[❌ Exibir Erros]
    G --> E
    F -->|Sim| H[✅ Criar Usuário]
    H --> I[📧 Enviar Email Verificação]
    
    D --> J[🔑 Inserir Credenciais]
    J --> K{Login Válido?}
    K -->|Não| L[❌ Credenciais Inválidas]
    L --> J
    K -->|Sim| M[🎫 Gerar JWT + Refresh Token]
    M --> N[💾 Salvar no Redux Store]
    N --> O[🏠 Redirecionar Dashboard]
    
    I --> P[✉️ Verificar Email]
    P --> Q[✅ Conta Ativada]
    Q --> O
    
    style A fill:#e3f2fd
    style O fill:#e8f5e8
    style G fill:#ffebee
    style L fill:#ffebee
```

### 7.2 💰 Fluxo de Gestão Financeira

```mermaid
flowchart TD
    A[🏠 Dashboard] --> B{Ação Desejada?}
    
    B -->|Adicionar Conta| C[🏦 Nova Conta]
    B -->|Nova Transação| D[💸 Nova Transação]
    B -->|Ver Relatórios| E[📊 Relatórios]
    B -->|Configurar Meta| F[🎯 Nova Meta]
    
    C --> C1[📝 Formulário Conta]
    C1 --> C2{Validação?}
    C2 -->|❌| C3[Mostrar Erros]
    C3 --> C1
    C2 -->|✅| C4[💾 Salvar Conta]
    C4 --> G[🔄 Atualizar Dashboard]
    
    D --> D1[📝 Formulário Transação]
    D1 --> D2[🏷️ Selecionar Categoria]
    D2 --> D3[🏦 Selecionar Conta]
    D3 --> D4{Validação?}
    D4 -->|❌| D5[Mostrar Erros]
    D5 --> D1
    D4 -->|✅| D6[💾 Salvar Transação]
    D6 --> D7[📊 Atualizar Saldo]
    D7 --> G
    
    E --> E1[📈 Gráficos]
    E1 --> E2[📋 Tabelas]
    E2 --> E3[📤 Exportar Dados]
    
    F --> F1[📝 Definir Meta]
    F1 --> F2[💰 Valor Alvo]
    F2 --> F3[📅 Prazo]
    F3 --> F4{Validação?}
    F4 -->|❌| F5[Mostrar Erros]
    F5 --> F1
    F4 -->|✅| F6[💾 Salvar Meta]
    F6 --> G
    
    style A fill:#e3f2fd
    style G fill:#e8f5e8
    style C3 fill:#ffebee
    style D5 fill:#ffebee
    style F5 fill:#ffebee
```

### 7.3 🏗️ Arquitetura do Sistema

```mermaid
graph TB
    subgraph "🖥️ Frontend (React + TypeScript)"
        A[👤 Login/Register Pages]
        B[🏠 Dashboard]
        C[💰 Transaction Pages]
        D[🏦 Account Pages]
        E[📊 Reports Pages]
        F[⚙️ Settings Pages]
    end
    
    subgraph "🌐 API Layer"
        G[🔐 Authentication Middleware]
        H[🛡️ CORS Middleware]
        I[📝 Request Validation]
        J[🔍 Error Handling]
    end
    
    subgraph "🚀 FastAPI Backend"
        K[👥 User Service]
        L[🏦 Account Service]
        M[💸 Transaction Service]
        N[🔐 Auth Service]
        O[📊 Report Service]
    end
    
    subgraph "💾 Data Layer"
        P[(🐘 PostgreSQL)]
        Q[📋 Alembic Migrations]
        R[🔍 Database Indexes]
    end
    
    subgraph "🔧 Infrastructure"
        S[🐳 Docker Containers]
        T[🔄 Docker Compose]
        U[⚙️ Environment Config]
    end
    
    A --> G
    B --> G
    C --> G
    D --> G
    E --> G
    F --> G
    
    G --> H
    H --> I
    I --> J
    J --> K
    J --> L
    J --> M
    J --> N
    J --> O
    
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P
    
    P --> Q
    P --> R
    
    K --> S
    L --> S
    M --> S
    N --> S
    O --> S
    
    S --> T
    T --> U
    
    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#e3f2fd
    style D fill:#e3f2fd
    style E fill:#e3f2fd
    style F fill:#e3f2fd
    style P fill:#e8f5e8
    style S fill:#fff3e0
```

### 7.4 🗄️ Modelo de Dados Atualizado

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string phone
        boolean is_active
        boolean is_verified
        boolean mfa_enabled
        timestamp created_at
        timestamp updated_at
    }
    
    ACCOUNTS {
        uuid id PK
        uuid user_id FK
        string name
        enum type
        string bank
        string agency
        string account_number
        decimal initial_balance
        decimal current_balance
        string currency
        string color
        string icon
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    CATEGORIES {
        uuid id PK
        uuid user_id FK
        string name
        enum type
        uuid parent_id FK
        string icon
        string color
        boolean is_system
        timestamp created_at
    }
    
    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid account_id FK
        uuid category_id FK
        enum type
        decimal amount
        text description
        date transaction_date
        boolean is_recurring
        uuid recurrence_id
        integer installment_number
        integer total_installments
        array tags
        text notes
        json attachments
        timestamp created_at
        timestamp updated_at
    }
    
    BUDGETS {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        decimal amount
        enum period
        date start_date
        date end_date
        integer alert_threshold
        boolean is_active
        timestamp created_at
    }
    
    GOALS {
        uuid id PK
        uuid user_id FK
        string name
        text description
        decimal target_amount
        decimal current_amount
        date target_date
        string category
        string icon
        string color
        boolean is_achieved
        timestamp created_at
        timestamp updated_at
    }
    
    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        string token
        timestamp expires_at
        timestamp created_at
        boolean is_revoked
    }
    
    USERS ||--o{ ACCOUNTS : "possui"
    USERS ||--o{ CATEGORIES : "cria"
    USERS ||--o{ TRANSACTIONS : "registra"
    USERS ||--o{ BUDGETS : "define"
    USERS ||--o{ GOALS : "estabelece"
    USERS ||--o{ REFRESH_TOKENS : "autentica"
    
    ACCOUNTS ||--o{ TRANSACTIONS : "contém"
    CATEGORIES ||--o{ TRANSACTIONS : "categoriza"
    CATEGORIES ||--o{ BUDGETS : "controla"
    CATEGORIES ||--o{ CATEGORIES : "hierarquia"
```

### 7.5 🔄 Fluxo de Dados da API

```mermaid
sequenceDiagram
    participant F as 🖥️ Frontend
    participant A as 🔐 Auth Middleware
    participant S as 🚀 Service Layer
    participant D as 💾 Database
    
    F->>+A: 📤 Request + JWT Token
    A->>A: 🔍 Validate Token
    
    alt Token Válido
        A->>+S: ✅ Authorized Request
        S->>S: 🧹 Validate Input Data
        S->>+D: 🗄️ Database Operation
        D-->>-S: 📊 Query Result
        S-->>-A: 📋 Processed Data
        A-->>-F: ✅ Success Response
    else Token Inválido
        A-->>F: ❌ 401 Unauthorized
    else Erro Validação
        S-->>A: ❌ 400 Bad Request
        A-->>F: 📝 Validation Errors
    else Erro Servidor
        S-->>A: ❌ 500 Server Error
        A-->>F: 🚨 Error Message
    end
```

### 7.6 🎨 Jornada do Usuário

```mermaid
journey
    title 📱 Jornada do Usuário no FinanceFlow
    
    section 🔐 Autenticação
        Acessar site: 3: Usuário
        Fazer cadastro: 4: Usuário
        Verificar email: 3: Usuário
        Fazer login: 5: Usuário
    
    section 🏗️ Configuração Inicial
        Adicionar primeira conta: 5: Usuário
        Configurar categorias: 4: Usuário
        Definir meta inicial: 4: Usuário
    
    section 💰 Uso Diário
        Registrar transação: 5: Usuário
        Ver saldo atualizado: 5: Usuário
        Categorizar gastos: 4: Usuário
        Acompanhar meta: 4: Usuário
    
    section 📊 Análise
        Ver dashboard: 5: Usuário
        Gerar relatório: 4: Usuário
        Analisar gastos: 5: Usuário
        Ajustar orçamento: 4: Usuário
```

---

## 8. 🛠️ Roadmap de Desenvolvimento

### 8.1 ✅ MVP - Concluído (100%)

**🎯 Objetivo**: Sistema funcional básico para autenticação e gestão básica

**📦 Entregáveis Implementados**:

- ✅ Sistema de autenticação JWT completo
- ✅ API RESTful com FastAPI e documentação automática  
- ✅ Modelos de dados com PostgreSQL e migrações
- ✅ Frontend React com TypeScript
- ✅ Containerização com Docker
- ✅ Estrutura de testes unitários

**📊 Métricas Atingidas**:

- ✅ 100% dos testes core passando
- ✅ 0 bugs críticos de segurança
- ✅ Deploy funcional em ambiente local
- ✅ Documentação técnica completa

---

### 8.2 🔄 Fase Atual - Interface & UX (60%)

**🎯 Objetivo**: Interface completa e experiência de usuário otimizada

**📦 Em Desenvolvimento**:

- 🔄 Dashboard principal com métricas financeiras
- 🔄 Sistema completo de transações
- 🔄 Gestão de contas bancárias
- 🔄 Categorização inteligente
- 🔄 Design responsivo mobile-first

**📊 Métricas Esperadas**:

- 🎯 Interface 100% responsiva
- 🎯 Tempo de carregamento < 2s
- 🎯 Score de acessibilidade > 90%

---

### 8.3 📈 Fase 2 - Analytics & Reports (0%)

**🎯 Objetivo**: Relatórios avançados e insights financeiros

**📦 Planejado**:

- 📋 Dashboard com gráficos interativos
- 📋 Relatórios mensais e anuais
- 📋 Análise de padrões de gastos
- 📋 Exportação em múltiplos formatos
- 📋 Alertas e notificações inteligentes

**📊 Métricas Alvo**:

- 🎯 100 usuários beta testadores
- 🎯 NPS Score > 7
- 🎯  80% dos usuários gerando relatórios

---

### 8.4 🚀 Fase 3 - Advanced Features (0%)

**🎯 Objetivo**: Funcionalidades avançadas e diferenciação

**📦 Planejado**:

- 📋 Sistema de orçamentos inteligentes
- 📋 Metas financeiras com gamificação
- 📋 Integração bancária (Open Banking)
- 📋 IA para categorização automática
- 📋 App mobile nativo (React Native)

**📊 Métricas Alvo**:

- 🎯 1.000 usuários ativos
- 🎯 Taxa de retenção > 60%
- 🎯 Implementação de monetização

---

### 8.5 📊 Timeline Visual

```mermaid
gantt
    title 🗓️ Cronograma FinanceFlow
    dateFormat YYYY-MM-DD
    
    section 🏗️ MVP
        Autenticação         :done, mvp1, 2024-01-01, 2024-02-15
        API Base            :done, mvp2, 2024-02-01, 2024-03-01
        Frontend Base       :done, mvp3, 2024-02-15, 2024-03-15
        Docker & Deploy     :done, mvp4, 2024-03-01, 2024-03-20
    
    section 🎨 Interface
        Dashboard           :active, ui1, 2024-03-15, 2024-04-30
        Transações          :active, ui2, 2024-04-01, 2024-05-15
        Responsividade      :ui3, 2024-05-01, 2024-05-30
        Testes UX           :ui4, 2024-05-15, 2024-06-15
    
    section 📊 Analytics
        Gráficos            :anal1, 2024-06-01, 2024-07-15
        Relatórios          :anal2, 2024-07-01, 2024-08-15
        Exportação          :anal3, 2024-08-01, 2024-09-01
        Notificações        :anal4, 2024-08-15, 2024-09-30
    
    section 🚀 Advanced
        Orçamentos          :adv1, 2024-09-15, 2024-11-01
        Metas               :adv2, 2024-10-15, 2024-12-01
        Mobile App          :adv3, 2024-11-01, 2025-01-15
        IA Features         :adv4, 2024-12-01, 2025-02-01
```

---

---


### 8. MODELO DE NEGÓCIO

#### 8.1 Monetização

**Freemium Model**
- **Free**: 2 contas, 100 transações/mês, relatórios básicos
- **Premium**: R$ 19,90/mês - Ilimitado, insights, exportação
- **Family**: R$ 34,90/mês - 5 usuários, compartilhamento

**Receitas Adicionais**:
- Consultoria financeira (parceiros)
- Cashback em compras
- Dados agregados (anonimizados)


#### 8.2 Métricas-Chave (KPIs)

**Aquisição**
- CAC: R$ 25
- Canais: SEO (40%), Social (30%), Referral (30%)

**Ativação**
- Onboarding completion: 70%
- Time to value: <5 minutos

**Retenção**
- Churn mensal: <5%
- DAU/MAU: 40%

**Receita**
- ARPU: R$ 8
- LTV: R$ 160
- LTV/CAC: 6.4x

---

### 9. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Vazamento de dados | Baixa | Muito Alto | Criptografia, auditorias, pentest |
| Baixa adoção | Média | Alto | Marketing, referral program |
| Competição | Alta | Médio | Diferenciação UX, preço |
| Problemas técnicos | Média | Alto | Testes, monitoring, rollback |
| Regulação | Baixa | Alto | Compliance LGPD, advogados |

---


### 10. CRITÉRIOS DE SUCESSO

#### 10.1 Técnicos
- ✓ 99.9% uptime
- ✓ <200ms latência
- ✓ 0 vulnerabilidades críticas
- ✓ 80% cobertura de testes

#### 10.2 Produto
- ✓ NPS > 50
- ✓ 4.5+ estrelas nas lojas
- ✓ <2% churn mensal
- ✓ 70% feature adoption

#### 10.3 Negócio
- ✓ 200k usuários (12 meses)
- ✓ R$ 1.6M ARR
- ✓ Break-even mês 12
- ✓ 20% margem operacional

---

## 📋 Resumo Executivo Visual

### 🎯 Status Atual do Projeto

```mermaid
pie title Estado de Implementação das Features
    "Implementado (Backend)" : 85
    "Implementado (Frontend)" : 60  
    "Em Desenvolvimento" : 25
    "Planejado" : 15
```

### 🏆 Principais Conquistas

| Módulo | Status | Funcionalidades |
|--------|---------|-----------------|
| 🔐 **Autenticação** | ✅ 100% | JWT, Refresh Tokens, Middleware |
| 🏦 **Contas** | ✅ 90% | CRUD, Validações, Tipos |
| 💸 **Transações** | ✅ 85% | CRUD, Categorias, Validações |
| 👥 **Usuários** | ✅ 95% | Perfil, Configurações, Segurança |
| 🎨 **Interface** | 🔄 60% | Layout, Componentes, Responsivo |
| 📊 **Dashboard** | 🔄 40% | Métricas básicas, Gráficos |

### 🛠️ Arquitetura Implementada

```mermaid
mindmap
  root((FinanceFlow))
    Backend
      FastAPI
        JWT Auth
        REST APIs
        Validation
      Database
        PostgreSQL
        Alembic
        Models
      Services
        Auth Service
        User Service  
        Account Service
        Transaction Service
    Frontend
      React 18
        TypeScript
        Material-UI
        Responsive
      State Management
        Redux Toolkit
        Hooks
        Local State
      API Integration
        Axios
        Error Handling
        Interceptors
    DevOps
      Docker
        Containerização
        Multi-stage builds
      Development
        Hot reload
        Environment vars
        Docker Compose
```

### 🎨 Design System

**Paleta de Cores:**
- 🔵 Primária: `#1976d2` (Azul confiança)
- 🟢 Sucesso: `#4caf50` (Verde crescimento)  
- 🟡 Alerta: `#ff9800` (Laranja atenção)
- 🔴 Erro: `#f44336` (Vermelho urgência)
- ⚪ Neutro: `#f5f5f5` (Cinza clean)

**Tipografia:**
- Fonte: Roboto (Material-UI)
- Tamanhos: 12px, 14px, 16px, 20px, 24px, 32px

**Componentes:**
- Cards com elevação suave
- Botões com estados hover/active
- Formulários com validação em tempo real
- Tabelas responsivas com paginação

---

## 🚀 Próximos Passos

### Prioridade Alta (2 semanas)

1. **🎨 Finalizar Dashboard**
   - Gráficos de receitas vs despesas
   - Cards de métricas principais
   - Lista de transações recentes

2. **💰 Sistema de Transações**
   - Formulário de nova transação
   - Listagem com filtros
   - Edição e exclusão

3. **📱 Responsividade**
   - Layout mobile-first
   - Menu hambúrguer
   - Touch gestures

### Prioridade Média (4 semanas)

1. **📊 Relatórios Básicos**
2. **🏦 Gestão Avançada de Contas**
3. **🔔 Sistema de Notificações**

### Prioridade Baixa (8+ semanas)

1. **🎯 Metas Financeiras**
2. **📈 Analytics Avançado**
3. **📱 App Mobile**

---

**Desenvolvido com ❤️ usando FastAPI + React**

*Última atualização: Dezembro 2024 - v3.0*