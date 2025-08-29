export enum GoalStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export enum ContributionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  TRANSACTION = 'TRANSACTION',
  RECURRING = 'RECURRING'
}

export interface Goal {
  id: string;
  user_id: string;
  category_id?: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // ISO date string
  status: GoalStatus;
  color?: string;
  icon?: string;
  priority: number;
  is_recurring: boolean;
  recurrence_day?: number;
  created_at: string;
  updated_at: string;
  achieved_at?: string;
  paused_at?: string;
  progress_percentage: number;
  days_remaining: number;
  monthly_contribution_needed: number;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  transaction_id?: string;
  amount: number;
  type: ContributionType;
  description?: string;
  contribution_date: string; // ISO date string
  is_recurring: boolean;
  created_by: string;
  created_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  percentage: number;
  title: string;
  description?: string;
  reward_type?: string;
  achieved: boolean;
  achieved_at?: string;
  created_at: string;
}

export interface GoalWithDetails extends Goal {
  contributions: GoalContribution[];
  milestones: GoalMilestone[];
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

export interface GoalSummary {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  total_saved: number;
  total_target: number;
  overall_progress: number;
  goals_on_track: number;
  goals_behind: number;
  goals_ahead: number;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  target_amount: number;
  deadline: string; // ISO date string
  category_id?: string;
  color?: string;
  icon?: string;
  priority?: number;
  is_recurring?: boolean;
  recurrence_day?: number;
  status?: GoalStatus;
}

export interface UpdateGoalRequest {
  name?: string;
  description?: string;
  target_amount?: number;
  deadline?: string;
  category_id?: string;
  status?: GoalStatus;
  color?: string;
  icon?: string;
  priority?: number;
  is_recurring?: boolean;
  recurrence_day?: number;
}

export interface CreateContributionRequest {
  goal_id: string;
  amount: number;
  type?: ContributionType;
  description?: string;
  contribution_date?: string;
  is_recurring?: boolean;
  transaction_id?: string;
}

export interface CreateMilestoneRequest {
  goal_id: string;
  percentage: number;
  title: string;
  description?: string;
  reward_type?: string;
}

// UI Helper Types
export interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onContribute?: (goal: Goal) => void;
  onClick?: (goal: Goal) => void;
}

export interface GoalFormData {
  name: string;
  description: string;
  target_amount: string; // String for form input
  deadline: string;
  category_id: string;
  color: string;
  icon: string;
  priority: number;
  is_recurring: boolean;
  recurrence_day?: number;
}

export interface ContributionFormData {
  amount: string; // String for form input
  type: ContributionType;
  description: string;
  contribution_date: string;
  is_recurring: boolean;
}

// Constants
export const GOAL_COLORS = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FF9800', // Orange
  '#9C27B0', // Purple
  '#F44336', // Red
  '#00BCD4', // Cyan
  '#FFEB3B', // Yellow
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#E91E63', // Pink
  '#3F51B5', // Indigo
  '#009688'  // Teal
];

export const GOAL_ICONS = [
  '🏖️', // Viagem
  '🚗', // Veículo
  '🏠', // Casa
  '📚', // Educação
  '💍', // Casamento
  '👶', // Filhos
  '🏥', // Emergência
  '💼', // Negócio
  '🎮', // Lazer
  '📱', // Tecnologia
  '🎯', // Meta Geral
  '💰'  // Economia
];

export const STATUS_COLORS = {
  [GoalStatus.DRAFT]: '#9E9E9E',
  [GoalStatus.IN_PROGRESS]: '#2196F3',
  [GoalStatus.PAUSED]: '#FF9800',
  [GoalStatus.COMPLETED]: '#4CAF50',
  [GoalStatus.CANCELLED]: '#F44336',
  [GoalStatus.OVERDUE]: '#D32F2F'
};

export const STATUS_LABELS = {
  [GoalStatus.DRAFT]: 'Rascunho',
  [GoalStatus.IN_PROGRESS]: 'Em Andamento',
  [GoalStatus.PAUSED]: 'Pausada',
  [GoalStatus.COMPLETED]: 'Concluída',
  [GoalStatus.CANCELLED]: 'Cancelada',
  [GoalStatus.OVERDUE]: 'Vencida'
};

export const CONTRIBUTION_TYPE_LABELS = {
  [ContributionType.MANUAL]: 'Manual',
  [ContributionType.AUTOMATIC]: 'Automática',
  [ContributionType.TRANSACTION]: 'Transação',
  [ContributionType.RECURRING]: 'Recorrente'
};