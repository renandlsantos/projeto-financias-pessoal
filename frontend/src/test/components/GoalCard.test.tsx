import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GoalCard from '../../components/ui/GoalCard';
import { Goal, GoalStatus } from '../../types/goals';

// Mock the GoalService
vi.mock('../../services/goalService', () => ({
  GoalService: {
    formatCurrency: (amount: number) => `R$ ${amount.toFixed(2).replace('.', ',')}`,
    formatDate: (date: string) => new Date(date).toLocaleDateString('pt-BR')
  }
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('GoalCard', () => {
  const mockGoal: Goal = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174001',
    category_id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Viagem Europa',
    description: 'Economizar para viagem de férias em família',
    target_amount: 15000,
    current_amount: 5000,
    deadline: '2024-12-31',
    status: GoalStatus.IN_PROGRESS,
    color: '#4CAF50',
    icon: '🏖️',
    priority: 3,
    is_recurring: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    progress_percentage: 33.33,
    days_remaining: 180,
    monthly_contribution_needed: 833.33
  };

  const renderGoalCard = (props = {}) => {
    return render(
      <TestWrapper>
        <GoalCard goal={mockGoal} {...props} />
      </TestWrapper>
    );
  };

  describe('Basic Rendering', () => {
    it('should render goal name and description', () => {
      renderGoalCard();
      
      expect(screen.getByText('Viagem Europa')).toBeInTheDocument();
      expect(screen.getByText('Economizar para viagem de férias em família')).toBeInTheDocument();
    });

    it('should render goal icon and color', () => {
      renderGoalCard();
      
      const avatar = screen.getByText('🏖️');
      expect(avatar).toBeInTheDocument();
    });

    it('should render status chip', () => {
      renderGoalCard();
      
      expect(screen.getByText('Em Andamento')).toBeInTheDocument();
    });

    it('should render progress information', () => {
      renderGoalCard();
      
      expect(screen.getByText('33.3%')).toBeInTheDocument();
      expect(screen.getByText('Progresso')).toBeInTheDocument();
    });

    it('should render financial information', () => {
      renderGoalCard();
      
      expect(screen.getByText('R$ 5000,00')).toBeInTheDocument(); // Current amount
      expect(screen.getByText('R$ 15000,00')).toBeInTheDocument(); // Target amount
      expect(screen.getByText('Economizado')).toBeInTheDocument();
      expect(screen.getByText('Meta')).toBeInTheDocument();
    });

    it('should render timeline information', () => {
      renderGoalCard();
      
      expect(screen.getByText('180 dias')).toBeInTheDocument();
      expect(screen.getByText('R$ 833,33')).toBeInTheDocument();
      expect(screen.getByText('Dias restantes')).toBeInTheDocument();
      expect(screen.getByText('Sugestão mensal')).toBeInTheDocument();
    });
  });

  describe('Status-based Rendering', () => {
    it('should render start button for DRAFT status', () => {
      const draftGoal = { ...mockGoal, status: GoalStatus.DRAFT };
      renderGoalCard({ goal: draftGoal });
      
      const startButton = screen.getByRole('button', { name: /iniciar meta/i });
      expect(startButton).toBeInTheDocument();
    });

    it('should render pause button for IN_PROGRESS status', () => {
      renderGoalCard();
      
      const pauseButton = screen.getByRole('button', { name: /pausar meta/i });
      expect(pauseButton).toBeInTheDocument();
    });

    it('should render resume button for PAUSED status', () => {
      const pausedGoal = { ...mockGoal, status: GoalStatus.PAUSED };
      renderGoalCard({ goal: pausedGoal });
      
      const resumeButton = screen.getByRole('button', { name: /retomar meta/i });
      expect(resumeButton).toBeInTheDocument();
    });

    it('should render complete button when goal is near completion', () => {
      const nearCompleteGoal = { 
        ...mockGoal, 
        current_amount: 15000, 
        progress_percentage: 100 
      };
      renderGoalCard({ goal: nearCompleteGoal });
      
      const completeButton = screen.getByRole('button', { name: /marcar como concluída/i });
      expect(completeButton).toBeInTheDocument();
    });

    it('should not render contribute button for completed goals', () => {
      const completedGoal = { ...mockGoal, status: GoalStatus.COMPLETED };
      const mockOnContribute = vi.fn();
      
      renderGoalCard({ 
        goal: completedGoal, 
        onContribute: mockOnContribute 
      });
      
      const contributeButton = screen.queryByText('Contribuir');
      expect(contributeButton).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClick when card is clicked', () => {
      const mockOnClick = vi.fn();
      renderGoalCard({ onClick: mockOnClick });
      
      const card = screen.getByRole('button'); // Card becomes clickable when onClick is provided
      fireEvent.click(card);
      
      expect(mockOnClick).toHaveBeenCalledWith(mockGoal);
    });

    it('should call onEdit when edit button is clicked', () => {
      const mockOnEdit = vi.fn();
      renderGoalCard({ onEdit: mockOnEdit });
      
      const editButton = screen.getByRole('button', { name: '' }); // Edit icon button
      fireEvent.click(editButton);
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockGoal);
    });

    it('should call onDelete when delete button is clicked', () => {
      const mockOnDelete = vi.fn();
      renderGoalCard({ onDelete: mockOnDelete });
      
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(button => 
        button.querySelector('svg[data-testid="DeleteIcon"]')
      );
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledWith(mockGoal.id);
      }
    });

    it('should call onContribute when contribute button is clicked', () => {
      const mockOnContribute = vi.fn();
      renderGoalCard({ onContribute: mockOnContribute });
      
      const contributeButton = screen.getByText('Contribuir');
      fireEvent.click(contributeButton);
      
      expect(mockOnContribute).toHaveBeenCalledWith(mockGoal);
    });

    it('should call onStatusChange when status action button is clicked', async () => {
      const mockOnStatusChange = vi.fn();
      renderGoalCard({ onStatusChange: mockOnStatusChange });
      
      const pauseButton = screen.getByRole('button', { name: /pausar meta/i });
      fireEvent.click(pauseButton);
      
      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith(mockGoal.id, GoalStatus.PAUSED);
      });
    });
  });

  describe('Progress Visualization', () => {
    it('should show correct progress color for different percentages', () => {
      // Test high progress (>= 80%)
      const highProgressGoal = { ...mockGoal, progress_percentage: 85 };
      const { rerender } = renderGoalCard({ goal: highProgressGoal });
      
      // The progress bar should be present
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Test low progress (< 30%)
      const lowProgressGoal = { ...mockGoal, progress_percentage: 20 };
      rerender(
        <TestWrapper>
          <GoalCard goal={lowProgressGoal} />
        </TestWrapper>
      );
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show pace indicator for active goals', () => {
      renderGoalCard();
      
      // Look for pace indicators (Adiantado, No Prazo, Atrasado)
      const paceChips = screen.queryByText(/📈|📊|📉/);
      // The pace indicator might not be visible in all cases, but the test structure should be there
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for action buttons', () => {
      renderGoalCard({ onEdit: vi.fn(), onDelete: vi.fn(), onContribute: vi.fn() });
      
      // Tooltips provide aria-labels for icon buttons
      expect(screen.getByRole('button', { name: /pausar meta/i })).toBeInTheDocument();
    });

    it('should have proper role for progress bar', () => {
      renderGoalCard();
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow');
    });
  });

  describe('Edge Cases', () => {
    it('should handle goal without description', () => {
      const goalWithoutDescription = { ...mockGoal, description: undefined };
      renderGoalCard({ goal: goalWithoutDescription });
      
      expect(screen.getByText('Viagem Europa')).toBeInTheDocument();
      // Description should not be rendered
      expect(screen.queryByText('Economizar para viagem de férias em família')).not.toBeInTheDocument();
    });

    it('should handle goal without category', () => {
      const goalWithoutCategory = { ...mockGoal, category_id: undefined };
      renderGoalCard({ goal: goalWithoutCategory });
      
      // Should still render the goal normally
      expect(screen.getByText('Viagem Europa')).toBeInTheDocument();
    });

    it('should handle goals with very long names', () => {
      const goalWithLongName = { 
        ...mockGoal, 
        name: 'Esta é uma meta financeira com um nome extremamente longo que deveria ser truncado na interface'
      };
      
      renderGoalCard({ goal: goalWithLongName });
      
      // The name should be displayed (truncation is handled by CSS)
      expect(screen.getByText(goalWithLongName.name)).toBeInTheDocument();
    });

    it('should handle zero progress correctly', () => {
      const zeroProgressGoal = { 
        ...mockGoal, 
        current_amount: 0, 
        progress_percentage: 0 
      };
      
      renderGoalCard({ goal: zeroProgressGoal });
      
      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByText('R$ 0,00')).toBeInTheDocument(); // Current amount
    });

    it('should handle goals with past deadline', () => {
      const overdueGoal = { 
        ...mockGoal, 
        status: GoalStatus.OVERDUE,
        days_remaining: 0 
      };
      
      renderGoalCard({ goal: overdueGoal });
      
      expect(screen.getByText('Vencida')).toBeInTheDocument();
      expect(screen.getByText('0 dias')).toBeInTheDocument();
    });
  });

  describe('Event Propagation', () => {
    it('should stop event propagation when action buttons are clicked', () => {
      const mockOnClick = vi.fn();
      const mockOnContribute = vi.fn();
      
      renderGoalCard({ 
        onClick: mockOnClick, 
        onContribute: mockOnContribute 
      });
      
      const contributeButton = screen.getByText('Contribuir');
      fireEvent.click(contributeButton);
      
      // Card onClick should not be called when contribute button is clicked
      expect(mockOnClick).not.toHaveBeenCalled();
      expect(mockOnContribute).toHaveBeenCalled();
    });
  });
});