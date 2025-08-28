import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import BudgetCard from '../../components/ui/BudgetCard';
import { BudgetSummary, BudgetStatus } from '../../types/budgets';

// Mock do BudgetService
vi.mock('../../services/budgetService', () => ({
  BudgetService: {
    formatCurrency: vi.fn((amount: number) => `R$ ${amount.toFixed(2).replace('.', ',')}`),
    isBudgetNearLimit: vi.fn(() => false),
    isBudgetExceeded: vi.fn(() => false),
    getDaysRemaining: vi.fn(() => 15)
  }
}));

const theme = createTheme();

const mockBudgetSummary: BudgetSummary = {
  budget_id: '123e4567-e89b-12d3-a456-426614174000',
  amount: 1000,
  spent_amount: 600,
  remaining_amount: 400,
  percentage_used: 60,
  status: BudgetStatus.ON_TRACK,
  days_remaining: 15,
  category_name: 'Alimentação',
  period_start: '2024-01-01',
  period_end: '2024-01-31'
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('BudgetCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnViewDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders budget information correctly', () => {
    renderWithTheme(
      <BudgetCard
        budget={mockBudgetSummary}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    // Verifica se as informações básicas estão presentes
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('No Controle')).toBeInTheDocument();
    expect(screen.getByText('60.0%')).toBeInTheDocument();
  });

  it('displays correct status colors for on track budget', () => {
    renderWithTheme(
      <BudgetCard
        budget={mockBudgetSummary}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    const statusChip = screen.getByText('No Controle');
    expect(statusChip).toHaveStyle({ color: theme.palette.success.main });
  });

  it('displays warning status for budget near limit', () => {
    const warningBudget: BudgetSummary = {
      ...mockBudgetSummary,
      spent_amount: 850,
      remaining_amount: 150,
      percentage_used: 85,
      status: BudgetStatus.WARNING
    };

    renderWithTheme(
      <BudgetCard
        budget={warningBudget}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Atenção')).toBeInTheDocument();
    expect(screen.getByText('85.0%')).toBeInTheDocument();
  });

  it('displays exceeded status for budget over limit', () => {
    const exceededBudget: BudgetSummary = {
      ...mockBudgetSummary,
      spent_amount: 1200,
      remaining_amount: -200,
      percentage_used: 120,
      status: BudgetStatus.EXCEEDED
    };

    renderWithTheme(
      <BudgetCard
        budget={exceededBudget}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Excedido')).toBeInTheDocument();
    expect(screen.getByText('120.0%')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    renderWithTheme(
      <BudgetCard
        budget={mockBudgetSummary}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    const editButton = screen.getByLabelText(/editar orçamento/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(mockBudgetSummary.budget_id);
    });
  });

  it('calls onDelete when delete button is clicked', async () => {
    renderWithTheme(
      <BudgetCard
        budget={mockBudgetSummary}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    const deleteButton = screen.getByLabelText(/excluir orçamento/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockBudgetSummary.budget_id);
    });
  });

  it('calls onViewDetails when card is clicked', async () => {
    renderWithTheme(
      <BudgetCard
        budget={mockBudgetSummary}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    const card = screen.getByText('Alimentação').closest('.MuiCard-root');
    expect(card).toBeInTheDocument();
    
    if (card) {
      fireEvent.click(card);
      await waitFor(() => {
        expect(mockOnViewDetails).toHaveBeenCalledWith(mockBudgetSummary.budget_id);
      });
    }
  });

  it('renders without actions when showActions is false', () => {
    renderWithTheme(
      <BudgetCard
        budget={mockBudgetSummary}
        showActions={false}
      />
    );

    expect(screen.queryByLabelText(/editar orçamento/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/excluir orçamento/i)).not.toBeInTheDocument();
  });

  it('renders in compact variant correctly', () => {
    renderWithTheme(
      <BudgetCard
        budget={mockBudgetSummary}
        variant="compact"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    // Verifica se ainda renderiza as informações principais
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('No Controle')).toBeInTheDocument();
  });

  it('shows correct financial information', () => {
    renderWithTheme(
      <BudgetCard
        budget={mockBudgetSummary}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    // Verifica valores formatados
    expect(screen.getByText('R$ 1000,00')).toBeInTheDocument(); // Orçado
    expect(screen.getByText('R$ 600,00')).toBeInTheDocument();  // Gasto
    expect(screen.getByText('R$ 400,00')).toBeInTheDocument();  // Restante
  });

  it('shows days remaining when positive', () => {
    renderWithTheme(
      <BudgetCard
        budget={mockBudgetSummary}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Dias Restantes')).toBeInTheDocument();
  });

  it('does not show days remaining when budget expired', () => {
    const expiredBudget: BudgetSummary = {
      ...mockBudgetSummary,
      days_remaining: 0
    };

    renderWithTheme(
      <BudgetCard
        budget={expiredBudget}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.queryByText('Dias Restantes')).not.toBeInTheDocument();
  });

  it('shows excess amount for exceeded budgets', () => {
    const exceededBudget: BudgetSummary = {
      ...mockBudgetSummary,
      spent_amount: 1200,
      remaining_amount: -200,
      percentage_used: 120,
      status: BudgetStatus.EXCEEDED
    };

    renderWithTheme(
      <BudgetCard
        budget={exceededBudget}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Excesso')).toBeInTheDocument();
    expect(screen.getByText('R$ 200,00')).toBeInTheDocument(); // Valor absoluto do excesso
  });

  it('handles click events properly without propagation', async () => {
    const mockCardClick = vi.fn();
    
    renderWithTheme(
      <div onClick={mockCardClick}>
        <BudgetCard
          budget={mockBudgetSummary}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      </div>
    );

    // Clicar no botão de editar não deve propagar para o card
    const editButton = screen.getByLabelText(/editar orçamento/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalled();
      expect(mockCardClick).not.toHaveBeenCalled();
    });
  });
});
