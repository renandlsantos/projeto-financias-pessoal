# Configuração do Frontend - FinanceFlow

## 📋 Visão Geral

O frontend do **FinanceFlow** é uma aplicação React 18 com TypeScript que implementa um sistema completo de gestão financeira pessoal. A arquitetura segue os padrões modernos de desenvolvimento com foco em performance, acessibilidade e experiência do usuário.

## 🎯 Objetivos do Frontend

- **Interface Intuitiva**: Design simples e responsivo para todas as personas
- **Performance**: Carregamento < 3s e tempo de resposta < 200ms
- **Acessibilidade**: Compliance WCAG 2.1 Level AA
- **Mobile-First**: Experiência otimizada para dispositivos móveis
- **Integração**: Comunicação eficiente com a API Backend FastAPI

## 🏗️ Stack Tecnológico

### Core Technologies
- **React 18**: Framework principal com Concurrent Features
- **TypeScript 5**: Tipagem estática e IntelliSense
- **Vite**: Build tool moderno e rápido
- **React Router v6**: Roteamento SPA

### Estado e Dados
- **Redux Toolkit**: Gerenciamento de estado global
- **RTK Query**: Cache e sincronização de dados da API
- **React Hook Form**: Gerenciamento de formulários performático
- **Zod**: Validação de schemas e tipos

### Interface e Design
- **Material-UI v5**: Componentes e tema
- **Emotion**: CSS-in-JS styling
- **React Transition Group**: Animações fluidas
- **Recharts**: Gráficos e visualizações de dados

### Utilitários
- **Axios**: Cliente HTTP com interceptors
- **Date-fns**: Manipulação de datas
- **React Query**: Cache de servidor otimizado
- **React Testing Library**: Testes de componentes

## 🚀 Setup e Instalação

### Pré-requisitos
```bash
# Node.js versão 18+ (LTS recomendado)
node --version  # v18.17.0+
npm --version   # v9.6.0+

# Yarn (opcional, mas recomendado)
npm install -g yarn
```

### 1. Criação do Projeto
```bash
# Criar projeto React com Vite + TypeScript
mkdir frontend
npm create vite@latest frontend -- --template react-ts
cd frontend

# Ou com Yarn
yarn create vite frontend --template react-ts
cd frontend
```

### 2. Instalação de Dependências

#### Core Dependencies
```bash
npm install react@18.2.0 react-dom@18.2.0
npm install @types/react@18.2.0 @types/react-dom@18.2.0
npm install react-router-dom@6.8.1
npm install typescript@5.0.2
```

#### Estado e Dados
```bash
npm install @reduxjs/toolkit@1.9.3
npm install react-redux@8.0.5
npm install @types/react-redux@7.1.25
npm install react-hook-form@7.43.8
npm install @hookform/resolvers@2.9.11
npm install zod@3.21.4
```

#### API e HTTP
```bash
npm install axios@1.3.4
npm install @tanstack/react-query@4.28.0
npm install @tanstack/react-query-devtools@4.28.0
```

#### UI e Design
```bash
npm install @mui/material@5.11.15
npm install @mui/icons-material@5.11.11
npm install @mui/x-date-pickers@6.0.3
npm install @emotion/react@11.10.6
npm install @emotion/styled@11.10.6
npm install recharts@2.5.0
```

#### Utilitários
```bash
npm install date-fns@2.29.3
npm install react-transition-group@4.4.5
npm install @types/react-transition-group@4.4.5
npm install react-hot-toast@2.4.0
```

#### Desenvolvimento
```bash
npm install -D @types/node@18.15.3
npm install -D @vitejs/plugin-react@3.1.0
npm install -D vite@4.2.0
npm install -D eslint@8.37.0
npm install -D @typescript-eslint/parser@5.57.0
npm install -D @typescript-eslint/eslint-plugin@5.57.0
npm install -D prettier@2.8.7
npm install -D vitest@0.29.3
npm install -D @testing-library/react@14.0.0
npm install -D @testing-library/jest-dom@5.16.5
npm install -D @testing-library/user-event@14.4.3
```

### 3. Configuração de Ambiente

#### `.env.local`
```env
# API Backend
VITE_API_BASE_URL=http://localhost:8888
VITE_API_VERSION=v1

# Autenticação
VITE_JWT_TOKEN_KEY=financeflow_token
VITE_REFRESH_TOKEN_KEY=financeflow_refresh_token

# Aplicação
VITE_APP_NAME=FinanceFlow
VITE_APP_VERSION=1.0.0

# Desenvolvimento
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug

# Features Flags
VITE_ENABLE_PWA=false
VITE_ENABLE_ANALYTICS=false
```

#### `.env.production`
```env
VITE_API_BASE_URL=https://api.financeflow.com
VITE_API_VERSION=v1
VITE_JWT_TOKEN_KEY=financeflow_token
VITE_REFRESH_TOKEN_KEY=financeflow_refresh_token
VITE_APP_NAME=FinanceFlow
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=error
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
```

## 🏛️ Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (Button, Input, etc)
│   ├── forms/           # Componentes de formulário
│   ├── charts/          # Componentes de gráficos
│   ├── layout/          # Layout components (Header, Sidebar)
│   └── common/          # Componentes comuns
├── pages/               # Páginas/telas da aplicação
│   ├── auth/           # Páginas de autenticação
│   ├── dashboard/      # Dashboard principal
│   ├── accounts/       # Gerenciamento de contas
│   ├── transactions/   # Transações
│   ├── budgets/        # Orçamentos
│   ├── goals/          # Metas financeiras
│   ├── reports/        # Relatórios
│   └── profile/        # Perfil do usuário
├── hooks/               # Custom hooks
│   ├── useAuth.ts      # Hook de autenticação
│   ├── useApi.ts       # Hook para API calls
│   └── useLocalStorage.ts
├── services/            # Serviços e API calls
│   ├── api/            # Configuração da API
│   ├── auth/           # Serviços de autenticação
│   └── storage/        # LocalStorage/SessionStorage
├── store/               # Redux store
│   ├── slices/         # Redux slices
│   │   ├── authSlice.ts
│   │   ├── accountSlice.ts
│   │   ├── transactionSlice.ts
│   │   └── uiSlice.ts
│   └── store.ts        # Store configuration
├── types/               # TypeScript types
│   ├── api.ts          # Tipos da API
│   ├── auth.ts         # Tipos de autenticação
│   └── entities.ts     # Entidades do domínio
├── utils/               # Utilitários
│   ├── constants.ts    # Constantes da aplicação
│   ├── formatters.ts   # Formatadores (moeda, data)
│   ├── validators.ts   # Validadores customizados
│   └── helpers.ts      # Funções auxiliares
├── styles/              # Estilos globais
│   ├── theme.ts        # Tema Material-UI
│   ├── globals.css     # CSS global
│   └── components.css  # Estilos de componentes
└── assets/              # Assets estáticos
    ├── images/
    ├── icons/
    └── fonts/
```

## 🎨 Sistema de Design e Tema

### Configuração do Tema Material-UI

```typescript
// src/styles/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',      // Azul principal
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#dc004e',      // Rosa/Vermelho para alertas
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#ffffff'
    },
    success: {
      main: '#2e7d32',      // Verde para receitas
      light: '#4caf50',
      dark: '#1b5e20'
    },
    warning: {
      main: '#ed6c02',      // Laranja para avisos
      light: '#ff9800',
      dark: '#e65100'
    },
    error: {
      main: '#d32f2f',      # Vermelho para despesas
      light: '#ef5350',
      dark: '#c62828'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',  // Sem uppercase automático
          borderRadius: 8
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }
};

export const theme = createTheme(themeOptions);
```

## 🔧 Configurações de Desenvolvimento

### Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles')
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts']
        }
      }
    }
  }
})
```

### ESLint Configuration (`.eslintrc.json`)
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## 📱 Páginas e Componentes Principais

### 1. Módulo de Autenticação
- **LoginPage**: Formulário de login com email/senha
- **RegisterPage**: Cadastro de novo usuário
- **ForgotPasswordPage**: Recuperação de senha
- **ResetPasswordPage**: Definição de nova senha

### 2. Dashboard Principal
- **DashboardPage**: Visão geral financeira
- **BalanceCard**: Saldo atual e evolução
- **RecentTransactions**: Últimas transações
- **QuickActions**: Ações rápidas (adicionar receita/despesa)
- **BudgetOverview**: Resumo de orçamentos
- **GoalsProgress**: Progresso das metas

### 3. Gerenciamento de Contas
- **AccountsPage**: Lista de contas
- **AccountForm**: Formulário criar/editar conta
- **AccountCard**: Card individual da conta
- **AccountBalance**: Componente de saldo

### 4. Transações
- **TransactionsPage**: Lista de transações
- **TransactionForm**: Formulário de transação
- **TransactionItem**: Item individual
- **TransactionFilters**: Filtros de pesquisa
- **CategorySelector**: Seletor de categorias

### 5. Orçamentos
- **BudgetsPage**: Lista de orçamentos
- **BudgetForm**: Formulário de orçamento
- **BudgetCard**: Card de orçamento individual
- **BudgetProgress**: Barra de progresso

### 6. Metas Financeiras
- **GoalsPage**: Lista de metas
- **GoalForm**: Formulário de meta
- **GoalCard**: Card de meta individual
- **GoalProgress**: Visualização do progresso

### 7. Relatórios
- **ReportsPage**: Hub de relatórios
- **IncomeExpenseChart**: Gráfico receitas x despesas
- **CategoryChart**: Gráfico por categorias
- **TrendChart**: Tendências temporais
- **ExportButtons**: Botões de exportação

## 🌐 Integração com Backend

### Configuração da API Base

```typescript
// src/services/api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION;

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('financeflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Lógica de refresh token
      const refreshToken = localStorage.getItem('financeflow_refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/${API_VERSION}/auth/refresh`, {
            refresh_token: refreshToken
          });
          const newToken = response.data.access_token;
          localStorage.setItem('financeflow_token', newToken);
          return apiClient.request(error.config);
        } catch {
          // Redirect to login
          localStorage.removeItem('financeflow_token');
          localStorage.removeItem('financeflow_refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### Endpoints da API

```typescript
// src/services/api/endpoints.ts
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/password-reset-request',
    RESET_PASSWORD: '/auth/password-reset',
  },
  
  // Usuários
  USERS: {
    ME: '/users/me',
    UPDATE_PROFILE: '/users/me',
  },
  
  // Contas
  ACCOUNTS: {
    LIST: '/accounts',
    CREATE: '/accounts',
    DETAIL: (id: string) => `/accounts/${id}`,
    UPDATE: (id: string) => `/accounts/${id}`,
    DELETE: (id: string) => `/accounts/${id}`,
  },
  
  // Transações
  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    DETAIL: (id: string) => `/transactions/${id}`,
    UPDATE: (id: string) => `/transactions/${id}`,
    DELETE: (id: string) => `/transactions/${id}`,
  },
  
  // Orçamentos
  BUDGETS: {
    LIST: '/budgets',
    CREATE: '/budgets',
    DETAIL: (id: string) => `/budgets/${id}`,
    UPDATE: (id: string) => `/budgets/${id}`,
    DELETE: (id: string) => `/budgets/${id}`,
  },
  
  // Metas
  GOALS: {
    LIST: '/goals',
    CREATE: '/goals',
    DETAIL: (id: string) => `/goals/${id}`,
    UPDATE: (id: string) => `/goals/${id}`,
    DELETE: (id: string) => `/goals/${id}`,
  },
  
  // Relatórios
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    BALANCE_EVOLUTION: '/reports/balance-evolution',
    EXPENSES_BY_CATEGORY: '/reports/expenses-by-category',
    INCOME_VS_EXPENSES: '/reports/income-vs-expenses',
  }
} as const;
```

## 🎯 Tipos TypeScript

### Tipos de Autenticação
```typescript
// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  language: string;
  timezone: string;
  currency: string;
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  avatar_url: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name?: string;
  phone?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
```

### Tipos de Entidades
```typescript
// src/types/entities.ts
export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash';
  bank?: string;
  agency?: string;
  account_number?: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  transaction_date: string;
  is_recurring: boolean;
  recurrence_id?: string;
  installment_number?: number;
  total_installments?: number;
  tags?: string[];
  notes?: string;
  attachments?: any;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  parent_id?: string;
  icon?: string;
  color?: string;
  is_system: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  alert_threshold: number;
  is_active: boolean;
  current_spent?: number;
  percentage_used?: number;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category?: string;
  icon?: string;
  color?: string;
  is_achieved: boolean;
  percentage_completed?: number;
  days_remaining?: number;
  created_at: string;
  updated_at: string;
}
```

## 🚀 Scripts de Desenvolvimento

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "analyze": "npx vite-bundle-analyzer"
  }
}
```

## 🧪 Estratégia de Testes

### Configuração Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

### Tipos de Testes
- **Unit Tests**: Componentes isolados
- **Integration Tests**: Fluxos de usuário
- **E2E Tests**: Cypress (futuro)

## 📊 Performance e Otimização

### Estratégias
- **Code Splitting**: Lazy loading de rotas
- **Bundle Analysis**: Análise de tamanho
- **Memoization**: React.memo e useMemo
- **Virtual Scrolling**: Listas grandes
- **Image Optimization**: Lazy loading de imagens

## 🎨 Design System e Acessibilidade

### Diretrizes
- **WCAG 2.1 Level AA**: Compliance obrigatório
- **Keyboard Navigation**: Navegação por teclado
- **Screen Readers**: Compatibilidade total
- **Color Contrast**: Mínimo 4.5:1
- **Focus Management**: Estados visuais claros

## 🌍 Internacionalização (i18n)

### Configuração React-i18next
```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    lng: 'pt-BR',
    fallbackLng: 'en',
    resources: {
      'pt-BR': {
        translation: require('./locales/pt-BR.json')
      },
      'en': {
        translation: require('./locales/en.json')
      }
    }
  });

export default i18n;
```

## 🚀 Deploy e Build

### Build de Produção
```bash
# Build otimizado
npm run build

# Preview do build
npm run preview

# Análise do bundle
npm run analyze
```

### Variáveis de Ambiente por Ambiente
- **Development**: `.env.local`
- **Staging**: `.env.staging`
- **Production**: `.env.production`

## 📝 Comandos Essenciais

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run type-check       # Verificação de tipos TypeScript
npm run lint            # Análise de código
npm run format          # Formatação com Prettier

# Testes
npm run test            # Executa testes unitários
npm run test:coverage   # Testes com cobertura
npm run test:ui         # Interface de testes

# Build
npm run build           # Build de produção
npm run preview         # Preview do build
```

## ✅ Checklist de Setup

### Frontend Base
- [ ] Projeto React + TypeScript criado
- [ ] Dependências instaladas
- [ ] Configuração Vite funcionando
- [ ] ESLint e Prettier configurados
- [ ] Estrutura de pastas criada

### Integração Backend
- [ ] Cliente Axios configurado
- [ ] Interceptors de autenticação
- [ ] Tipos TypeScript das entidades
- [ ] Endpoints mapeados
- [ ] Testes de conectividade

### UI e UX
- [ ] Material-UI configurado
- [ ] Tema customizado aplicado
- [ ] Componentes base criados
- [ ] Layout responsivo
- [ ] Acessibilidade básica

### Estado e Dados
- [ ] Redux Toolkit configurado
- [ ] Slices principais criados
- [ ] React Hook Form integrado
- [ ] Validação Zod funcionando

### Páginas Principais
- [ ] Página de Login
- [ ] Dashboard
- [ ] Lista de Contas
- [ ] Lista de Transações
- [ ] Formulários básicos

Agora o frontend está pronto para ser desenvolvido com uma base sólida e bem estruturada! 🚀
