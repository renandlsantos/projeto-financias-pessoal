// Constantes da aplicação
export const APP_CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'FinanceFlow',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888',
  API_VERSION: import.meta.env.VITE_API_VERSION || 'v1',
} as const;

export const STORAGE_KEYS = {
  JWT_TOKEN: 'financeflow_token',
  REFRESH_TOKEN: 'financeflow_refresh_token',
  USER_PREFERENCES: 'financeflow_user_prefs',
  THEME: 'financeflow_theme',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  ACCOUNTS: '/accounts',
  TRANSACTIONS: '/transactions',
  BUDGETS: '/budgets',
  GOALS: '/goals',
  REPORTS: '/reports',
  PROFILE: '/profile',
} as const;

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
} as const;

export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  CREDIT_CARD: 'credit_card',
  INVESTMENT: 'investment',
  CASH: 'cash',
} as const;
