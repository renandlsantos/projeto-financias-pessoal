// Entidades do domínio financeiro
export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash';
  bank?: string;
  agency?: string;
  account_number?: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  transaction_date: string;
  is_recurring: boolean;
  recurrence_id?: string;
  installment_number?: number;
  total_installments?: number;
  tags?: string[];
  notes?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  parent_id?: string;
  icon?: string;
  color?: string;
  is_system: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  alert_threshold: number;
  is_active: boolean;
  current_spent?: number;
  percentage_used?: number;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category?: string;
  icon?: string;
  color?: string;
  is_achieved: boolean;
  percentage_completed?: number;
  days_remaining?: number;
  created_at: string;
  updated_at: string;
}
