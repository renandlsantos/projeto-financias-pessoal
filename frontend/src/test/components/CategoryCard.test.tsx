import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CategoryCard from '../../src/components/ui/CategoryCard';
import { Category } from '../../src/types/categories';

// Mock do CategoryService
vi.mock('../../src/services/categoryService', () => ({
  CategoryService: {
    formatCurrency: vi.fn((amount: number) => `R$ ${amount.toFixed(2).replace('.', ',')}`),
    getIconByCategory: vi.fn(() => 'restaurant'),
    getColorByCategory: vi.fn(() => '#4CAF50')
  }
}));

const theme = createTheme();

const mockCategory: Category = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Alimentação',
  parent_id: null,
  is_system: false,
  user_id: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  subcategories: []
};

const mockCategoryWithSubcategories: Category = {
  ...mockCategory,
  subcategories: [
    {
      id: 'sub-1',
      name: 'Restaurantes',
      parent_id: mockCategory.id,
      is_system: false,
      user_id: 'user-123',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      subcategories: []
    },
    {
      id: 'sub-2', 
      name: 'Supermercado',
      parent_id: mockCategory.id,
      is_system: false,
      user_id: 'user-123',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      subcategories: []
    }
  ]
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('CategoryCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders category information correctly', () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Categoria Personalizada')).toBeInTheDocument();
  });

  it('shows system category label when is_system is true', () => {
    const systemCategory: Category = {
      ...mockCategory,
      is_system: true
    };

    renderWithTheme(
      <CategoryCard
        category={systemCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Categoria do Sistema')).toBeInTheDocument();
  });

  it('displays subcategories count when present', () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategoryWithSubcategories}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('2 subcategorias')).toBeInTheDocument();
  });

  it('shows no subcategories message when empty', () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Nenhuma subcategoria')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    const editButton = screen.getByLabelText(/editar categoria/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(mockCategory.id);
    });
  });

  it('calls onDelete when delete button is clicked', async () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    const deleteButton = screen.getByLabelText(/excluir categoria/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockCategory.id);
    });
  });

  it('calls onSelect when card is clicked', async () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByText('Alimentação').closest('.MuiCard-root');
    expect(card).toBeInTheDocument();
    
    if (card) {
      fireEvent.click(card);
      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(mockCategory);
      });
    }
  });

  it('does not show delete button for system categories', () => {
    const systemCategory: Category = {
      ...mockCategory,
      is_system: true
    };

    renderWithTheme(
      <CategoryCard
        category={systemCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.queryByLabelText(/excluir categoria/i)).not.toBeInTheDocument();
  });

  it('renders without actions when showActions is false', () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        showActions={false}
      />
    );

    expect(screen.queryByLabelText(/editar categoria/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/excluir categoria/i)).not.toBeInTheDocument();
  });

  it('renders in compact variant correctly', () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        variant="compact"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
  });

  it('shows selected state when isSelected is true', () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        isSelected={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByText('Alimentação').closest('.MuiCard-root');
    expect(card).toHaveClass('selected'); // Assuming a CSS class for selected state
  });

  it('handles subcategories expansion/collapse', async () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategoryWithSubcategories}
        showSubcategories={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    // Verifica se as subcategorias são mostradas
    expect(screen.getByText('Restaurantes')).toBeInTheDocument();
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        isLoading={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles click events properly without propagation', async () => {
    const mockCardClick = vi.fn();
    
    renderWithTheme(
      <div onClick={mockCardClick}>
        <CategoryCard
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSelect={mockOnSelect}
        />
      </div>
    );

    // Clicar no botão de editar não deve propagar para o card
    const editButton = screen.getByLabelText(/editar categoria/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalled();
      expect(mockCardClick).not.toHaveBeenCalled();
    });
  });

  it('shows parent category name when category has parent', () => {
    const subcategory: Category = {
      ...mockCategory,
      name: 'Restaurantes',
      parent_id: 'parent-id'
    };

    renderWithTheme(
      <CategoryCard
        category={subcategory}
        parentCategoryName="Alimentação"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Subcategoria de Alimentação')).toBeInTheDocument();
  });

  it('displays usage statistics when provided', () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        transactionCount={25}
        totalAmount={1500.50}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('25 transações')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,50')).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    renderWithTheme(
      <CategoryCard
        category={mockCategory}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByText('Alimentação').closest('.MuiCard-root');
    expect(card).toBeInTheDocument();

    if (card) {
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(mockCategory);
      });
    }
  });
});
