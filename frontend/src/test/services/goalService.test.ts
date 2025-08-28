import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoalService } from '../../services/goalService';
import { client } from '../../services/api/client';
import { GoalStatus, ContributionType, CreateGoalRequest, Goal } from '../../types/goals';

// Mock the API client
vi.mock('../../services/api/client', () => ({
  client: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

const mockClient = vi.mocked(client);

describe('GoalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockGoal: Goal = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174001',
    category_id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Viagem Europa',
    description: 'Economizar para viagem de férias',
    target_amount: 15000,
    current_amount: 5000,
    deadline: '2024-12-31',
    status: GoalStatus.IN_PROGRESS,
    color: '#4CAF50',
    icon: '🏖️',
    priority: 3,
    is_recurring: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    progress_percentage: 33.33,
    days_remaining: 300,
    monthly_contribution_needed: 833.33
  };

  describe('getGoals', () => {
    it('should fetch goals without parameters', async () => {
      const mockGoals = [mockGoal];
      mockClient.get.mockResolvedValue({ data: mockGoals });

      const result = await GoalService.getGoals();

      expect(mockClient.get).toHaveBeenCalledWith('/goals');
      expect(result).toEqual(mockGoals);
    });

    it('should fetch goals with parameters', async () => {
      const mockGoals = [mockGoal];
      mockClient.get.mockResolvedValue({ data: mockGoals });

      const params = {
        status: GoalStatus.IN_PROGRESS,
        skip: 0,
        limit: 10
      };

      const result = await GoalService.getGoals(params);

      expect(mockClient.get).toHaveBeenCalledWith('/goals?status=IN_PROGRESS&skip=0&limit=10');
      expect(result).toEqual(mockGoals);
    });
  });

  describe('getGoalById', () => {
    it('should fetch goal by ID', async () => {
      const mockDetailedGoal = {
        ...mockGoal,
        contributions: [],
        milestones: []
      };
      mockClient.get.mockResolvedValue({ data: mockDetailedGoal });

      const result = await GoalService.getGoalById('123');

      expect(mockClient.get).toHaveBeenCalledWith('/goals/123');
      expect(result).toEqual(mockDetailedGoal);
    });
  });

  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const goalData: CreateGoalRequest = {
        name: 'Nova Meta',
        target_amount: 10000,
        deadline: '2024-12-31',
        description: 'Descrição da meta'
      };

      mockClient.post.mockResolvedValue({ data: mockGoal });

      const result = await GoalService.createGoal(goalData);

      expect(mockClient.post).toHaveBeenCalledWith('/goals', goalData);
      expect(result).toEqual(mockGoal);
    });
  });

  describe('updateGoal', () => {
    it('should update an existing goal', async () => {
      const updateData = { name: 'Meta Atualizada' };
      const updatedGoal = { ...mockGoal, name: 'Meta Atualizada' };
      
      mockClient.put.mockResolvedValue({ data: updatedGoal });

      const result = await GoalService.updateGoal('123', updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/goals/123', updateData);
      expect(result).toEqual(updatedGoal);
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      mockClient.delete.mockResolvedValue({});

      await GoalService.deleteGoal('123');

      expect(mockClient.delete).toHaveBeenCalledWith('/goals/123');
    });
  });

  describe('updateGoalStatus', () => {
    it('should update goal status', async () => {
      const updatedGoal = { ...mockGoal, status: GoalStatus.COMPLETED };
      mockClient.put.mockResolvedValue({ data: updatedGoal });

      const result = await GoalService.updateGoalStatus('123', GoalStatus.COMPLETED);

      expect(mockClient.put).toHaveBeenCalledWith('/goals/123/status?new_status=COMPLETED');
      expect(result).toEqual(updatedGoal);
    });
  });

  describe('addContribution', () => {
    it('should add contribution to goal', async () => {
      const contributionData = {
        goal_id: '123',
        amount: 1000,
        description: 'Contribuição teste'
      };

      const mockContribution = {
        id: '456',
        goal_id: '123',
        amount: 1000,
        type: ContributionType.MANUAL,
        description: 'Contribuição teste',
        contribution_date: '2024-01-01',
        is_recurring: false,
        created_by: 'user123',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockClient.post.mockResolvedValue({ data: mockContribution });

      const result = await GoalService.addContribution('123', contributionData);

      expect(mockClient.post).toHaveBeenCalledWith('/goals/123/contributions', contributionData);
      expect(result).toEqual(mockContribution);
    });
  });

  describe('getGoalSummary', () => {
    it('should fetch goal summary', async () => {
      const mockSummary = {
        total_goals: 5,
        active_goals: 3,
        completed_goals: 2,
        total_saved: 25000,
        total_target: 50000,
        overall_progress: 50,
        goals_on_track: 2,
        goals_behind: 1,
        goals_ahead: 0
      };

      mockClient.get.mockResolvedValue({ data: mockSummary });

      const result = await GoalService.getGoalSummary();

      expect(mockClient.get).toHaveBeenCalledWith('/goals/summary');
      expect(result).toEqual(mockSummary);
    });
  });

  describe('Helper methods', () => {
    describe('pauseGoal', () => {
      it('should pause a goal', async () => {
        const pausedGoal = { ...mockGoal, status: GoalStatus.PAUSED };
        mockClient.put.mockResolvedValue({ data: pausedGoal });

        const result = await GoalService.pauseGoal('123');

        expect(mockClient.put).toHaveBeenCalledWith('/goals/123/status?new_status=PAUSED');
        expect(result.status).toBe(GoalStatus.PAUSED);
      });
    });

    describe('resumeGoal', () => {
      it('should resume a goal', async () => {
        const resumedGoal = { ...mockGoal, status: GoalStatus.IN_PROGRESS };
        mockClient.put.mockResolvedValue({ data: resumedGoal });

        const result = await GoalService.resumeGoal('123');

        expect(mockClient.put).toHaveBeenCalledWith('/goals/123/status?new_status=IN_PROGRESS');
        expect(result.status).toBe(GoalStatus.IN_PROGRESS);
      });
    });

    describe('completeGoal', () => {
      it('should complete a goal', async () => {
        const completedGoal = { ...mockGoal, status: GoalStatus.COMPLETED };
        mockClient.put.mockResolvedValue({ data: completedGoal });

        const result = await GoalService.completeGoal('123');

        expect(mockClient.put).toHaveBeenCalledWith('/goals/123/status?new_status=COMPLETED');
        expect(result.status).toBe(GoalStatus.COMPLETED);
      });
    });

    describe('quickContribution', () => {
      it('should add quick contribution', async () => {
        const mockContribution = {
          id: '456',
          goal_id: '123',
          amount: 500,
          type: ContributionType.MANUAL,
          contribution_date: new Date().toISOString().split('T')[0],
          is_recurring: false,
          created_by: 'user123',
          created_at: '2024-01-01T00:00:00Z'
        };

        mockClient.post.mockResolvedValue({ data: mockContribution });

        const result = await GoalService.quickContribution('123', 500, 'Quick contribution');

        expect(mockClient.post).toHaveBeenCalledWith('/goals/123/contributions', {
          goal_id: '123',
          amount: 500,
          description: 'Quick contribution',
          contribution_date: expect.any(String)
        });
        expect(result).toEqual(mockContribution);
      });
    });
  });

  describe('Validation helpers', () => {
    describe('validateGoalData', () => {
      it('should return no errors for valid goal data', () => {
        const validData: CreateGoalRequest = {
          name: 'Valid Goal',
          target_amount: 1000,
          deadline: '2024-12-31',
          description: 'Valid description'
        };

        const errors = GoalService.validateGoalData(validData);
        expect(errors).toHaveLength(0);
      });

      it('should return errors for invalid goal data', () => {
        const invalidData: CreateGoalRequest = {
          name: '',
          target_amount: -100,
          deadline: '2023-01-01', // Past date
          priority: 10 // Invalid priority
        };

        const errors = GoalService.validateGoalData(invalidData);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toContain('Nome da meta é obrigatório');
        expect(errors).toContain('Valor alvo deve ser maior que zero');
        expect(errors).toContain('Data limite deve ser futura');
      });

      it('should validate recurring goal requirements', () => {
        const recurringGoalWithoutDay: CreateGoalRequest = {
          name: 'Recurring Goal',
          target_amount: 1000,
          deadline: '2024-12-31',
          is_recurring: true
          // Missing recurrence_day
        };

        const errors = GoalService.validateGoalData(recurringGoalWithoutDay);
        expect(errors).toContain('Dia de recorrência é obrigatório para metas recorrentes');
      });

      it('should validate color format', () => {
        const invalidColorGoal: CreateGoalRequest = {
          name: 'Goal with invalid color',
          target_amount: 1000,
          deadline: '2024-12-31',
          color: 'invalid-color'
        };

        const errors = GoalService.validateGoalData(invalidColorGoal);
        expect(errors).toContain('Cor deve estar no formato hexadecimal (#RRGGBB)');
      });
    });

    describe('validateContributionData', () => {
      it('should return no errors for valid contribution data', () => {
        const validContribution = {
          goal_id: '123',
          amount: 100
        };

        const errors = GoalService.validateContributionData(validContribution);
        expect(errors).toHaveLength(0);
      });

      it('should return errors for invalid contribution data', () => {
        const invalidContribution = {
          goal_id: '',
          amount: -50,
          contribution_date: '2025-01-01' // Future date
        };

        const errors = GoalService.validateContributionData(invalidContribution);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toContain('Valor da contribuição deve ser maior que zero');
        expect(errors).toContain('ID da meta é obrigatório');
      });
    });
  });

  describe('Calculation helpers', () => {
    describe('calculateProgressPercentage', () => {
      it('should calculate correct progress percentage', () => {
        expect(GoalService.calculateProgressPercentage(500, 1000)).toBe(50);
        expect(GoalService.calculateProgressPercentage(1200, 1000)).toBe(100); // Max 100%
        expect(GoalService.calculateProgressPercentage(0, 1000)).toBe(0);
        expect(GoalService.calculateProgressPercentage(100, 0)).toBe(0); // Division by zero
      });
    });

    describe('calculateDaysRemaining', () => {
      it('should calculate days remaining correctly', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const daysRemaining = GoalService.calculateDaysRemaining(tomorrowStr);
        expect(daysRemaining).toBe(1);
      });

      it('should return 0 for past dates', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const daysRemaining = GoalService.calculateDaysRemaining(yesterdayStr);
        expect(daysRemaining).toBe(0);
      });
    });

    describe('calculateMonthlyContributionNeeded', () => {
      it('should calculate monthly contribution correctly', () => {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const deadline = nextYear.toISOString().split('T')[0];

        const monthlyNeeded = GoalService.calculateMonthlyContributionNeeded(
          1000, // current
          13000, // target
          deadline // 12 months from now
        );

        expect(monthlyNeeded).toBe(1000); // 12000 remaining / 12 months
      });

      it('should return 0 if goal is already achieved', () => {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const deadline = nextYear.toISOString().split('T')[0];

        const monthlyNeeded = GoalService.calculateMonthlyContributionNeeded(
          15000, // current (already above target)
          10000, // target
          deadline
        );

        expect(monthlyNeeded).toBe(0);
      });
    });
  });

  describe('Formatting helpers', () => {
    describe('formatCurrency', () => {
      it('should format currency correctly', () => {
        expect(GoalService.formatCurrency(1234.56)).toBe('R$ 1.234,56');
        expect(GoalService.formatCurrency(0)).toBe('R$ 0,00');
        expect(GoalService.formatCurrency(1000000)).toBe('R$ 1.000.000,00');
      });
    });

    describe('formatDate', () => {
      it('should format date correctly', () => {
        const formatted = GoalService.formatDate('2024-01-15');
        expect(formatted).toBe('15/01/2024');
      });
    });

    describe('formatDateTime', () => {
      it('should format datetime correctly', () => {
        const formatted = GoalService.formatDateTime('2024-01-15T10:30:00Z');
        // The exact format may vary by locale, but should include date and time
        expect(formatted).toContain('2024');
        expect(formatted).toContain('15');
        expect(formatted).toContain('01');
      });
    });
  });
});