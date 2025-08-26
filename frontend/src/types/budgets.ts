// Enums
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

export enum BudgetStatus {
  ON_TRACK = 'on_track',
  WARNING = 'warning',
  EXCEEDED = 'exceeded'
}

// Base interfaces
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Category interfaces
export interface CategoryBase {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  parent_id?: string;
  sort_order: number;
}

export interface CategoryCreate extends CategoryBase {}

export interface CategoryUpdate {
  name?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CategoryRead extends BaseEntity, CategoryBase {
  user_id?: string;
  is_system: boolean;
  is_active: boolean;
  subcategories_count: number;
  parent_name?: string;
}

export interface CategoryWithSubcategories extends CategoryRead {
  subcategories: CategoryRead[];
}

// Budget interfaces
export interface BudgetBase {
  category_id: string;
  amount: number;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  alert_threshold?: number;
  notes?: string;
}

export interface BudgetCreate extends BudgetBase {}

export interface BudgetUpdate {
  category_id?: string;
  amount?: number;
  start_date?: string;
  end_date?: string;
  alert_threshold?: number;
  notes?: string;
}

export interface BudgetRead extends BaseEntity, BudgetBase {
  user_id: string;
  category?: CategoryRead;
}

export interface BudgetSummary {
  budget_id: string;
  amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  status: BudgetStatus;
  days_remaining: number;
  category_name: string;
  period_start: string;
  period_end: string;
}

// Form interfaces for UI components
export interface BudgetFormData {
  category_id: string;
  amount: string; // String for form input, converted to number
  start_date: string;
  end_date: string;
  alert_threshold: string;
  notes: string;
}

export interface CategoryFormData {
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  parent_id: string;
  sort_order: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
  errors?: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

// Filter interfaces
export interface CategoryFilters {
  type?: TransactionType;
  parent_id?: string;
  include_system?: boolean;
  include_subcategories?: boolean;
}

export interface BudgetFilters {
  category_id?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}
