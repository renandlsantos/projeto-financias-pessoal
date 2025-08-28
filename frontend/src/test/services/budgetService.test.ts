import { describe, it, expect, vi } from 'vitest';
import { BudgetService } from '../../services/budgetService';
import { Budget, CreateBudgetData, BudgetSummary, BudgetStatus } from '../../types/budgets';

// Mock do axios
vi.mock('axios');

const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

vi.mock('../../src/services/api', () => ({
  api: mockAxios
}));

describe('BudgetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBudgets', () => {
    it('should fetch budgets successfully', async () => {
      const mockBudgets: BudgetSummary[] = [
        {
          budget_id: '1',
          amount: 1000,
          spent_amount: 600,
          remaining_amount: 400,
          percentage_used: 60,
          status: BudgetStatus.ON_TRACK,
          days_remaining: 15,
          category_name: 'Alimentação',
          period_start: '2024-01-01',
          period_end: '2024-01-31'
        }
      ];

      mockAxios.get.mockResolvedValue({ data: mockBudgets });

      const result = await BudgetService.getBudgets();

      expect(mockAxios.get).toHaveBeenCalledWith('/budgets/summary');
      expect(result).toEqual(mockBudgets);
    });

    it('should handle pagination parameters', async () => {
      mockAxios.get.mockResolvedValue({ data: [] });

      await BudgetService.getBudgets(2, 10);

      expect(mockAxios.get).toHaveBeenCalledWith('/budgets/summary', {
        params: { page: 2, per_page: 10 }
      });
    });

    it('should handle error when fetching budgets', async () => {
      const errorMessage = 'Failed to fetch budgets';
      mockAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(BudgetService.getBudgets()).rejects.toThrow(errorMessage);
    });
  });

  describe('getBudgetById', () => {
    it('should fetch budget by id successfully', async () => {
      const mockBudget: Budget = {
        id: '1',
        user_id: 'user-1',
        category_id: 'cat-1',
        amount: 1000,
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockAxios.get.mockResolvedValue({ data: mockBudget });

      const result = await BudgetService.getBudgetById('1');

      expect(mockAxios.get).toHaveBeenCalledWith('/budgets/1');
      expect(result).toEqual(mockBudget);
    });

    it('should handle error when budget not found', async () => {
      mockAxios.get.mockRejectedValue(new Error('Budget not found'));

      await expect(BudgetService.getBudgetById('999')).rejects.toThrow('Budget not found');
    });
  });

  describe('createBudget', () => {
    it('should create budget successfully', async () => {
      const createData: CreateBudgetData = {
        category_id: 'cat-1',
        amount: 1000,
        period_start: '2024-01-01',
        period_end: '2024-01-31'
      };

      const mockCreatedBudget: Budget = {
        id: '1',
        user_id: 'user-1',
        ...createData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockAxios.post.mockResolvedValue({ data: mockCreatedBudget });

      const result = await BudgetService.createBudget(createData);

      expect(mockAxios.post).toHaveBeenCalledWith('/budgets', createData);
      expect(result).toEqual(mockCreatedBudget);
    });

    it('should handle validation errors', async () => {
      const createData: CreateBudgetData = {
        category_id: '',
        amount: -100,
        period_start: '2024-01-01',
        period_end: '2023-12-31' // Data final antes da inicial
      };

      mockAxios.post.mockRejectedValue({
        response: {
          status: 422,
          data: { detail: 'Validation error' }
        }
      });

      await expect(BudgetService.createBudget(createData)).rejects.toThrow();
    });
  });

  describe('updateBudget', () => {
    it('should update budget successfully', async () => {
      const updateData = {
        amount: 1500,
        period_end: '2024-02-29'
      };

      const mockUpdatedBudget: Budget = {
        id: '1',
        user_id: 'user-1',
        category_id: 'cat-1',
        amount: 1500,
        period_start: '2024-01-01',
        period_end: '2024-02-29',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      };

      mockAxios.put.mockResolvedValue({ data: mockUpdatedBudget });

      const result = await BudgetService.updateBudget('1', updateData);

      expect(mockAxios.put).toHaveBeenCalledWith('/budgets/1', updateData);
      expect(result).toEqual(mockUpdatedBudget);
    });
  });

  describe('deleteBudget', () => {
    it('should delete budget successfully', async () => {
      mockAxios.delete.mockResolvedValue({ status: 204 });

      await BudgetService.deleteBudget('1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/budgets/1');
    });

    it('should handle error when deleting non-existent budget', async () => {
      mockAxios.delete.mockRejectedValue({
        response: {
          status: 404,
          data: { detail: 'Budget not found' }
        }
      });

      await expect(BudgetService.deleteBudget('999')).rejects.toThrow();
    });
  });

  describe('getBudgetSummary', () => {
    it('should fetch budget summary successfully', async () => {
      const mockSummary: BudgetSummary = {
        budget_id: '1',
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

      mockAxios.get.mockResolvedValue({ data: mockSummary });

      const result = await BudgetService.getBudgetSummary('1');

      expect(mockAxios.get).toHaveBeenCalledWith('/budgets/1/summary');
      expect(result).toEqual(mockSummary);
    });
  });

  describe('helper methods', () => {
    describe('formatCurrency', () => {
      it('should format positive currency correctly', () => {
        expect(BudgetService.formatCurrency(1234.56)).toBe('R$ 1.234,56');
        expect(BudgetService.formatCurrency(0)).toBe('R$ 0,00');
        expect(BudgetService.formatCurrency(10)).toBe('R$ 10,00');
      });

      it('should format negative currency correctly', () => {
        expect(BudgetService.formatCurrency(-1234.56)).toBe('-R$ 1.234,56');
        expect(BudgetService.formatCurrency(-10)).toBe('-R$ 10,00');
      });
    });

    describe('calculatePercentageUsed', () => {
      it('should calculate percentage correctly', () => {
        expect(BudgetService.calculatePercentageUsed(600, 1000)).toBe(60);
        expect(BudgetService.calculatePercentageUsed(1200, 1000)).toBe(120);
        expect(BudgetService.calculatePercentageUsed(0, 1000)).toBe(0);
      });

      it('should handle zero amount', () => {
        expect(BudgetService.calculatePercentageUsed(100, 0)).toBe(0);
      });
    });

    describe('getBudgetStatus', () => {
      it('should return ON_TRACK status', () => {
        expect(BudgetService.getBudgetStatus(50, 15)).toBe(BudgetStatus.ON_TRACK);
        expect(BudgetService.getBudgetStatus(70, 20)).toBe(BudgetStatus.ON_TRACK);
      });

      it('should return WARNING status', () => {
        expect(BudgetService.getBudgetStatus(85, 10)).toBe(BudgetStatus.WARNING);
        expect(BudgetService.getBudgetStatus(95, 5)).toBe(BudgetStatus.WARNING);
      });

      it('should return EXCEEDED status', () => {
        expect(BudgetService.getBudgetStatus(105, 10)).toBe(BudgetStatus.EXCEEDED);
        expect(BudgetService.getBudgetStatus(120, 0)).toBe(BudgetStatus.EXCEEDED);
      });

      it('should return EXPIRED status', () => {
        expect(BudgetService.getBudgetStatus(50, 0)).toBe(BudgetStatus.EXPIRED);
        expect(BudgetService.getBudgetStatus(100, -5)).toBe(BudgetStatus.EXPIRED);
      });
    });

    describe('getDaysRemaining', () => {
      it('should calculate days remaining correctly', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        expect(BudgetService.getDaysRemaining(tomorrowStr)).toBe(1);
      });

      it('should return 0 for past dates', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        expect(BudgetService.getDaysRemaining(yesterdayStr)).toBe(0);
      });
    });

    describe('isBudgetNearLimit', () => {
      it('should detect budget near limit', () => {
        expect(BudgetService.isBudgetNearLimit(85)).toBe(true);
        expect(BudgetService.isBudgetNearLimit(95)).toBe(true);
      });

      it('should not detect budget far from limit', () => {
        expect(BudgetService.isBudgetNearLimit(70)).toBe(false);
        expect(BudgetService.isBudgetNearLimit(50)).toBe(false);
      });
    });

    describe('isBudgetExceeded', () => {
      it('should detect exceeded budget', () => {
        expect(BudgetService.isBudgetExceeded(105)).toBe(true);
        expect(BudgetService.isBudgetExceeded(150)).toBe(true);
      });

      it('should not detect budget within limit', () => {
        expect(BudgetService.isBudgetExceeded(95)).toBe(false);
        expect(BudgetService.isBudgetExceeded(100)).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(BudgetService.getBudgets()).rejects.toThrow('Network Error');
    });

    it('should handle API errors with response', async () => {
      mockAxios.get.mockRejectedValue({
        response: {
          status: 500,
          data: { detail: 'Internal Server Error' }
        }
      });

      await expect(BudgetService.getBudgets()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mockAxios.get.mockRejectedValue({ code: 'ECONNABORTED' });

      await expect(BudgetService.getBudgets()).rejects.toThrow();
    });
  });
});
