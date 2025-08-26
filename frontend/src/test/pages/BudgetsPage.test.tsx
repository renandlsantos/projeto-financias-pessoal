import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import BudgetsPage from '../../src/pages/BudgetsPage';

// Mock dos serviços
vi.mock('../../src/services/budgetService', () => ({
  BudgetService: {
    getBudgets: vi.fn(),
    createBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
    getBudgetSummary: vi.fn()
  }
}));

vi.mock('../../src/services/categoryService', () => ({
  CategoryService: {
    getCategories: vi.fn()
  }
}));

const theme = createTheme();

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: { id: 'user-123' }, token: 'mock-token' }) => state,
      budgets: (state = { budgets: [], loading: false, error: null }) => state,
      categories: (state = { categories: [], loading: false, error: null }) => state,
      ...initialState
    }
  });
};

const renderWithProviders = (
  component: React.ReactElement,
  { initialState = {} } = {}
) => {
  const store = createMockStore(initialState);
  
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('BudgetsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title and main elements', async () => {
    renderWithProviders(<BudgetsPage />);

    expect(screen.getByText('Orçamentos')).toBeInTheDocument();
    expect(screen.getByText('Adicionar Orçamento')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Carregando orçamentos...')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    const initialState = {
      budgets: { budgets: [], loading: true, error: null }
    };

    renderWithProviders(<BudgetsPage />, { initialState });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    const initialState = {
      budgets: { 
        budgets: [], 
        loading: false, 
        error: 'Erro ao carregar orçamentos' 
      }
    };

    renderWithProviders(<BudgetsPage />, { initialState });

    expect(screen.getByText('Erro ao carregar orçamentos')).toBeInTheDocument();
  });

  it('displays empty state when no budgets exist', () => {
    const initialState = {
      budgets: { budgets: [], loading: false, error: null }
    };

    renderWithProviders(<BudgetsPage />, { initialState });

    expect(screen.getByText('Nenhum orçamento encontrado')).toBeInTheDocument();
    expect(screen.getByText('Crie seu primeiro orçamento para começar!')).toBeInTheDocument();
  });

  it('displays budget cards when budgets exist', () => {
    const mockBudgets = [
      {
        budget_id: '1',
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
        budget_id: '2',
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

    const initialState = {
      budgets: { budgets: mockBudgets, loading: false, error: null }
    };

    renderWithProviders(<BudgetsPage />, { initialState });

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });

  it('opens create budget dialog when add button is clicked', async () => {
    renderWithProviders(<BudgetsPage />);

    const addButton = screen.getByText('Adicionar Orçamento');
    addButton.click();

    await waitFor(() => {
      expect(screen.getByText('Criar Novo Orçamento')).toBeInTheDocument();
    });
  });

  it('handles budget filter by status', async () => {
    const mockBudgets = [
      {
        budget_id: '1',
        status: 'ON_TRACK',
        category_name: 'Alimentação',
        amount: 1000,
        spent_amount: 600,
        remaining_amount: 400,
        percentage_used: 60,
        days_remaining: 15,
        period_start: '2024-01-01',
        period_end: '2024-01-31'
      },
      {
        budget_id: '2',
        status: 'EXCEEDED',
        category_name: 'Transporte',
        amount: 500,
        spent_amount: 600,
        remaining_amount: -100,
        percentage_used: 120,
        days_remaining: 5,
        period_start: '2024-01-01',
        period_end: '2024-01-31'
      }
    ];

    const initialState = {
      budgets: { budgets: mockBudgets, loading: false, error: null }
    };

    renderWithProviders(<BudgetsPage />, { initialState });

    // Filtrar por status "Excedido"
    const filterButton = screen.getByText('Todos');
    filterButton.click();

    await waitFor(() => {
      const exceededFilter = screen.getByText('Excedidos');
      exceededFilter.click();
    });

    // Apenas orçamentos excedidos devem aparecer
    expect(screen.getByText('Transporte')).toBeInTheDocument();
    expect(screen.queryByText('Alimentação')).not.toBeInTheDocument();
  });

  it('handles budget sorting options', async () => {
    renderWithProviders(<BudgetsPage />);

    const sortButton = screen.getByLabelText('ordenar orçamentos');
    sortButton.click();

    await waitFor(() => {
      expect(screen.getByText('Por nome')).toBeInTheDocument();
      expect(screen.getByText('Por valor')).toBeInTheDocument();
      expect(screen.getByText('Por percentual usado')).toBeInTheDocument();
      expect(screen.getByText('Por data de criação')).toBeInTheDocument();
    });
  });

  it('shows budget statistics summary', () => {
    const mockBudgets = [
      {
        budget_id: '1',
        amount: 1000,
        spent_amount: 600,
        remaining_amount: 400,
        status: 'ON_TRACK',
        category_name: 'Alimentação',
        percentage_used: 60,
        days_remaining: 15,
        period_start: '2024-01-01',
        period_end: '2024-01-31'
      },
      {
        budget_id: '2',
        amount: 500,
        spent_amount: 600,
        remaining_amount: -100,
        status: 'EXCEEDED',
        category_name: 'Transporte',
        percentage_used: 120,
        days_remaining: 5,
        period_start: '2024-01-01',
        period_end: '2024-01-31'
      }
    ];

    const initialState = {
      budgets: { budgets: mockBudgets, loading: false, error: null }
    };

    renderWithProviders(<BudgetsPage />, { initialState });

    // Verifica se as estatísticas são exibidas
    expect(screen.getByText('2')).toBeInTheDocument(); // Total de orçamentos
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument(); // Valor total orçado
    expect(screen.getByText('R$ 1.200,00')).toBeInTheDocument(); // Total gasto
    expect(screen.getByText('1')).toBeInTheDocument(); // Orçamentos excedidos
  });

  it('handles refresh action', async () => {
    const { BudgetService } = await import('../../src/services/budgetService');
    
    renderWithProviders(<BudgetsPage />);

    const refreshButton = screen.getByLabelText('atualizar orçamentos');
    refreshButton.click();

    await waitFor(() => {
      expect(BudgetService.getBudgets).toHaveBeenCalled();
    });
  });

  it('handles search functionality', async () => {
    const mockBudgets = [
      {
        budget_id: '1',
        category_name: 'Alimentação',
        amount: 1000,
        spent_amount: 600,
        remaining_amount: 400,
        percentage_used: 60,
        status: 'ON_TRACK',
        days_remaining: 15,
        period_start: '2024-01-01',
        period_end: '2024-01-31'
      },
      {
        budget_id: '2',
        category_name: 'Transporte',
        amount: 500,
        spent_amount: 450,
        remaining_amount: 50,
        percentage_used: 90,
        status: 'WARNING',
        days_remaining: 5,
        period_start: '2024-01-01',
        period_end: '2024-01-31'
      }
    ];

    const initialState = {
      budgets: { budgets: mockBudgets, loading: false, error: null }
    };

    renderWithProviders(<BudgetsPage />, { initialState });

    const searchInput = screen.getByPlaceholderText('Pesquisar orçamentos...');
    
    // Pesquisar por "Alimentação"
    fireEvent.change(searchInput, { target: { value: 'Alimentação' } });

    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.queryByText('Transporte')).not.toBeInTheDocument();
    });
  });

  it('navigates to budget details page', async () => {
    const mockBudgets = [
      {
        budget_id: '123',
        category_name: 'Alimentação',
        amount: 1000,
        spent_amount: 600,
        remaining_amount: 400,
        percentage_used: 60,
        status: 'ON_TRACK',
        days_remaining: 15,
        period_start: '2024-01-01',
        period_end: '2024-01-31'
      }
    ];

    const initialState = {
      budgets: { budgets: mockBudgets, loading: false, error: null }
    };

    renderWithProviders(<BudgetsPage />, { initialState });

    const budgetCard = screen.getByText('Alimentação').closest('.MuiCard-root');
    expect(budgetCard).toBeInTheDocument();

    if (budgetCard) {
      budgetCard.click();
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/budgets/123');
      });
    }
  });
});
