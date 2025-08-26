// Setup global para testes frontend
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Aplicar mocks globais
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock da API de navegação
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// Mock do navigator
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
});

// Configurações globais de teste
beforeEach(() => {
  // Limpar todos os mocks antes de cada teste
  vi.clearAllMocks();
  
  // Reset dos storages
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset do console para não poluir saída dos testes
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console após cada teste
  vi.restoreAllMocks();
});

// Mock do processo de autenticação para testes
export const mockAuthUser = {
  id: 'test-user-id',
  email: 'test@financeflow.com',
  name: 'Usuário de Teste',
  created_at: '2024-01-01T00:00:00Z'
};

export const mockAuthToken = 'mock-jwt-token';

// Helper para setup de testes com autenticação
export const setupAuthenticatedTest = () => {
  localStorageMock.setItem('auth-token', mockAuthToken);
  localStorageMock.setItem('auth-user', JSON.stringify(mockAuthUser));
};

// Helper para limpar autenticação
export const clearAuthTest = () => {
  localStorageMock.removeItem('auth-token');
  localStorageMock.removeItem('auth-user');
};

// Mock dados de teste para categories
export const mockCategories = [
  {
    id: 'cat-1',
    name: 'Alimentação',
    parent_id: null,
    is_system: true,
    user_id: mockAuthUser.id,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    subcategories: [
      {
        id: 'cat-1-1',
        name: 'Restaurantes',
        parent_id: 'cat-1',
        is_system: false,
        user_id: mockAuthUser.id,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        subcategories: []
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Transporte',
    parent_id: null,
    is_system: true,
    user_id: mockAuthUser.id,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    subcategories: []
  }
];

// Mock dados de teste para budgets
export const mockBudgets = [
  {
    budget_id: 'budget-1',
    amount: 1000,
    spent_amount: 600,
    remaining_amount: 400,
    percentage_used: 60,
    status: 'ON_TRACK',
    days_remaining: 15,
    category_name: 'Alimentação',
    period_start: '2024-01-01',
    period_end: '2024-01-31'
  },
  {
    budget_id: 'budget-2',
    amount: 500,
    spent_amount: 450,
    remaining_amount: 50,
    percentage_used: 90,
    status: 'WARNING',
    days_remaining: 5,
    category_name: 'Transporte',
    period_start: '2024-01-01',
    period_end: '2024-01-31'
  }
];

// Helper para criar mock store Redux
export const createMockStore = (initialState = {}) => {
  const defaultState = {
    auth: {
      user: mockAuthUser,
      token: mockAuthToken,
      isAuthenticated: true,
      loading: false,
      error: null
    },
    categories: {
      categories: mockCategories,
      loading: false,
      error: null
    },
    budgets: {
      budgets: mockBudgets,
      loading: false,
      error: null
    }
  };

  return {
    ...defaultState,
    ...initialState
  };
};

// Timeout global para testes assíncronos
vi.setConfig({ testTimeout: 10000 });