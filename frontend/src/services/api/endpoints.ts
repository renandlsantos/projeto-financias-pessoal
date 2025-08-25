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
