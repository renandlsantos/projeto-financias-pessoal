import { client } from './api/client';
import {
  Goal,
  GoalWithDetails,
  GoalSummary,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateContributionRequest,
  GoalContribution,
  GoalStatus
} from '../types/goals';

const GOALS_ENDPOINT = '/goals';

export class GoalService {
  // Goals CRUD
  static async getGoals(params?: {
    status?: GoalStatus;
    skip?: number;
    limit?: number;
  }): Promise<Goal[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.append('status', params.status);
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `${GOALS_ENDPOINT}?${queryString}` : GOALS_ENDPOINT;
    
    const response = await client.get(url);
    return response.data;
  }

  static async getGoalById(goalId: string): Promise<GoalWithDetails> {
    const response = await client.get(`${GOALS_ENDPOINT}/${goalId}`);
    return response.data;
  }

  static async createGoal(goalData: CreateGoalRequest): Promise<Goal> {
    const response = await client.post(GOALS_ENDPOINT, goalData);
    return response.data;
  }

  static async updateGoal(goalId: string, goalData: UpdateGoalRequest): Promise<Goal> {
    const response = await client.put(`${GOALS_ENDPOINT}/${goalId}`, goalData);
    return response.data;
  }

  static async deleteGoal(goalId: string): Promise<void> {
    await client.delete(`${GOALS_ENDPOINT}/${goalId}`);
  }

  static async updateGoalStatus(goalId: string, status: GoalStatus): Promise<Goal> {
    const response = await client.put(`${GOALS_ENDPOINT}/${goalId}/status?new_status=${status}`);
    return response.data;
  }

  // Goal Summary and Analytics
  static async getGoalSummary(): Promise<GoalSummary> {
    const response = await client.get(`${GOALS_ENDPOINT}/summary`);
    return response.data;
  }

  static async getUpcomingDeadlines(days: number = 30): Promise<Goal[]> {
    const response = await client.get(`${GOALS_ENDPOINT}/upcoming?days=${days}`);
    return response.data;
  }

  // Contributions
  static async addContribution(
    goalId: string, 
    contributionData: CreateContributionRequest
  ): Promise<GoalContribution> {
    const response = await client.post(
      `${GOALS_ENDPOINT}/${goalId}/contributions`, 
      contributionData
    );
    return response.data;
  }

  // Helper methods for common operations
  static async pauseGoal(goalId: string): Promise<Goal> {
    return this.updateGoalStatus(goalId, GoalStatus.PAUSED);
  }

  static async resumeGoal(goalId: string): Promise<Goal> {
    return this.updateGoalStatus(goalId, GoalStatus.IN_PROGRESS);
  }

  static async completeGoal(goalId: string): Promise<Goal> {
    return this.updateGoalStatus(goalId, GoalStatus.COMPLETED);
  }

  static async cancelGoal(goalId: string): Promise<Goal> {
    return this.updateGoalStatus(goalId, GoalStatus.CANCELLED);
  }

  static async startGoal(goalId: string): Promise<Goal> {
    return this.updateGoalStatus(goalId, GoalStatus.IN_PROGRESS);
  }

  // Quick contribution methods
  static async quickContribution(
    goalId: string, 
    amount: number, 
    description?: string
  ): Promise<GoalContribution> {
    return this.addContribution(goalId, {
      goal_id: goalId,
      amount,
      description,
      contribution_date: new Date().toISOString().split('T')[0],
    });
  }

  static async recurringContribution(
    goalId: string,
    amount: number,
    description?: string
  ): Promise<GoalContribution> {
    return this.addContribution(goalId, {
      goal_id: goalId,
      amount,
      description,
      is_recurring: true,
      contribution_date: new Date().toISOString().split('T')[0],
    });
  }

  // Bulk operations
  static async getGoalsByStatus(status: GoalStatus): Promise<Goal[]> {
    return this.getGoals({ status });
  }

  static async getActiveGoals(): Promise<Goal[]> {
    return this.getGoalsByStatus(GoalStatus.IN_PROGRESS);
  }

  static async getCompletedGoals(): Promise<Goal[]> {
    return this.getGoalsByStatus(GoalStatus.COMPLETED);
  }

  static async getDraftGoals(): Promise<Goal[]> {
    return this.getGoalsByStatus(GoalStatus.DRAFT);
  }

  // Validation helpers
  static validateGoalData(data: CreateGoalRequest): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome da meta é obrigatório');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Nome da meta deve ter no máximo 100 caracteres');
    }

    if (!data.target_amount || data.target_amount <= 0) {
      errors.push('Valor alvo deve ser maior que zero');
    }

    if (!data.deadline) {
      errors.push('Data limite é obrigatória');
    } else {
      const deadlineDate = new Date(data.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate <= today) {
        errors.push('Data limite deve ser futura');
      }
    }

    if (data.priority !== undefined && (data.priority < 1 || data.priority > 5)) {
      errors.push('Prioridade deve estar entre 1 e 5');
    }

    if (data.is_recurring && !data.recurrence_day) {
      errors.push('Dia de recorrência é obrigatório para metas recorrentes');
    }

    if (data.recurrence_day !== undefined && (data.recurrence_day < 1 || data.recurrence_day > 31)) {
      errors.push('Dia de recorrência deve estar entre 1 e 31');
    }

    if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      errors.push('Cor deve estar no formato hexadecimal (#RRGGBB)');
    }

    return errors;
  }

  static validateContributionData(data: CreateContributionRequest): string[] {
    const errors: string[] = [];

    if (!data.amount || data.amount <= 0) {
      errors.push('Valor da contribuição deve ser maior que zero');
    }

    if (!data.goal_id) {
      errors.push('ID da meta é obrigatório');
    }

    if (data.contribution_date) {
      const contributionDate = new Date(data.contribution_date);
      const today = new Date();
      
      if (contributionDate > today) {
        errors.push('Data da contribuição não pode ser futura');
      }
    }

    return errors;
  }

  // Calculation helpers
  static calculateProgressPercentage(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  }

  static calculateDaysRemaining(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  }

  static calculateMonthlyContributionNeeded(
    currentAmount: number, 
    targetAmount: number, 
    deadline: string
  ): number {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const monthsRemaining = Math.max(
      (deadlineDate.getFullYear() - today.getFullYear()) * 12 + 
      (deadlineDate.getMonth() - today.getMonth()),
      1
    );
    
    const remainingAmount = targetAmount - currentAmount;
    return remainingAmount > 0 ? remainingAmount / monthsRemaining : 0;
  }

  // Formatting helpers
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-BR');
  }
}