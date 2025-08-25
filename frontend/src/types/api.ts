// Tipos para respostas da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  status_code: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status_code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Tipos para requisições
export interface CreateAccountRequest {
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash';
  bank?: string;
  agency?: string;
  account_number?: string;
  initial_balance: number;
  color?: string;
  icon?: string;
}

export interface CreateTransactionRequest {
  account_id: string;
  category_id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  transaction_date: string;
  tags?: string[];
  notes?: string;
}

export interface CreateBudgetRequest {
  category_id?: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  alert_threshold: number;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  target_amount: number;
  target_date: string;
  category?: string;
  icon?: string;
  color?: string;
}
