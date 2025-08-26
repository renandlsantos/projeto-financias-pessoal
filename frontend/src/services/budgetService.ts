import axios, { AxiosResponse } from 'axios';
import {
  BudgetCreate,
  BudgetUpdate,
  BudgetRead,
  BudgetSummary,
  BudgetFilters
} from '../types/budgets';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE_URL}/api/v1`;

// Use the same API client configuration from CategoryService
const apiClient = axios.create({
  baseURL: API_V1,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class BudgetService {
  /**
   * Cria um novo orçamento
   */
  static async createBudget(budgetData: BudgetCreate): Promise<BudgetRead> {
    const response: AxiosResponse<BudgetRead> = await apiClient.post('/budgets', budgetData);
    return response.data;
  }

  /**
   * Lista orçamentos do usuário com filtros
   */
  static async getBudgets(filters?: BudgetFilters): Promise<BudgetRead[]> {
    const params = new URLSearchParams();
    
    if (filters?.category_id) params.append('category_id', filters.category_id);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response: AxiosResponse<BudgetRead[]> = await apiClient.get(`/budgets?${params.toString()}`);
    return response.data;
  }

  /**
   * Busca orçamento por ID
   */
  static async getBudgetById(budgetId: string): Promise<BudgetRead> {
    const response: AxiosResponse<BudgetRead> = await apiClient.get(`/budgets/${budgetId}`);
    return response.data;
  }

  /**
   * Atualiza orçamento existente
   */
  static async updateBudget(budgetId: string, updateData: BudgetUpdate): Promise<BudgetRead> {
    const response: AxiosResponse<BudgetRead> = await apiClient.put(`/budgets/${budgetId}`, updateData);
    return response.data;
  }

  /**
   * Remove orçamento
   */
  static async deleteBudget(budgetId: string): Promise<void> {
    await apiClient.delete(`/budgets/${budgetId}`);
  }

  /**
   * Obtém resumo de um orçamento específico
   */
  static async getBudgetSummary(budgetId: string): Promise<BudgetSummary> {
    const response: AxiosResponse<BudgetSummary> = await apiClient.get(`/budgets/${budgetId}/summary`);
    return response.data;
  }

  /**
   * Obtém resumo de todos os orçamentos ativos
   */
  static async getActiveBudgetsSummary(): Promise<BudgetSummary[]> {
    const response: AxiosResponse<BudgetSummary[]> = await apiClient.get('/budgets/active/summary');
    return response.data;
  }

  /**
   * Lista apenas orçamentos ativos
   */
  static async getActiveBudgets(): Promise<BudgetRead[]> {
    return this.getBudgets({ is_active: true });
  }

  /**
   * Lista orçamentos expirados/inativos
   */
  static async getInactiveBudgets(): Promise<BudgetRead[]> {
    return this.getBudgets({ is_active: false });
  }

  /**
   * Lista orçamentos de uma categoria específica
   */
  static async getBudgetsByCategory(categoryId: string, isActive?: boolean): Promise<BudgetRead[]> {
    return this.getBudgets({
      category_id: categoryId,
      is_active: isActive
    });
  }

  /**
   * Busca orçamentos com paginação
   */
  static async getBudgetsPaginated(
    page: number = 1,
    pageSize: number = 10,
    filters?: Omit<BudgetFilters, 'limit' | 'offset'>
  ): Promise<BudgetRead[]> {
    const offset = (page - 1) * pageSize;
    return this.getBudgets({
      ...filters,
      limit: pageSize,
      offset
    });
  }

  /**
   * Verifica se orçamento está próximo do limite (helper function)
   */
  static isBudgetNearLimit(summary: BudgetSummary, threshold: number = 80): boolean {
    return summary.percentage_used >= threshold;
  }

  /**
   * Verifica se orçamento foi excedido (helper function)
   */
  static isBudgetExceeded(summary: BudgetSummary): boolean {
    return summary.status === 'exceeded';
  }

  /**
   * Calcula dias restantes para o orçamento (helper function)
   */
  static getDaysRemaining(endDate: string): number {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Formata valor monetário (helper function)
   */
  static formatCurrency(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}
