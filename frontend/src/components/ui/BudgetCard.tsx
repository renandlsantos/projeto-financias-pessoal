import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { BudgetSummary, BudgetStatus } from '../../types/budgets';
import { BudgetService } from '../../services/budgetService';

interface BudgetCardProps {
  budget: BudgetSummary;
  onEdit?: (budgetId: string) => void;
  onDelete?: (budgetId: string) => void;
  onViewDetails?: (budgetId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
  onViewDetails,
  showActions = true,
  variant = 'default'
}) => {
  const theme = useTheme();

  const getStatusConfig = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.ON_TRACK:
        return {
          color: theme.palette.success.main,
          backgroundColor: `${theme.palette.success.main}20`,
          icon: <CheckCircleIcon />,
          label: 'No Controle',
          progressColor: 'success' as const
        };
      case BudgetStatus.WARNING:
        return {
          color: theme.palette.warning.main,
          backgroundColor: `${theme.palette.warning.main}20`,
          icon: <WarningIcon />,
          label: 'Atenção',
          progressColor: 'warning' as const
        };
      case BudgetStatus.EXCEEDED:
        return {
          color: theme.palette.error.main,
          backgroundColor: `${theme.palette.error.main}20`,
          icon: <ErrorIcon />,
          label: 'Excedido',
          progressColor: 'error' as const
        };
      default:
        return {
          color: theme.palette.grey[500],
          backgroundColor: `${theme.palette.grey[500]}20`,
          icon: <TrendingUpIcon />,
          label: 'Desconhecido',
          progressColor: 'primary' as const
        };
    }
  };

  const statusConfig = getStatusConfig(budget.status);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(budget.budget_id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(budget.budget_id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(budget.budget_id);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getProgressValue = (): number => {
    return Math.min(budget.percentage_used, 100);
  };

  return (
    <Card
      elevation={1}
      sx={{
        transition: 'all 0.2s ease-in-out',
        cursor: onViewDetails ? 'pointer' : 'default',
        '&:hover': {
          elevation: 2,
          transform: 'translateY(-1px)'
        },
        mb: 2
      }}
      onClick={onViewDetails ? handleViewDetails : undefined}
    >
      <CardContent sx={{ p: variant === 'compact' ? 1.5 : 2 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                backgroundColor: statusConfig.backgroundColor,
                color: statusConfig.color,
                width: variant === 'compact' ? 32 : 40,
                height: variant === 'compact' ? 32 : 40
              }}
            >
              {statusConfig.icon}
            </Avatar>

            <Box>
              <Typography
                variant={variant === 'compact' ? 'body1' : 'h6'}
                component="h3"
                sx={{ fontWeight: 600, mb: 0.5 }}
              >
                {budget.category_name}
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={statusConfig.label}
                  size="small"
                  sx={{
                    backgroundColor: statusConfig.backgroundColor,
                    color: statusConfig.color,
                    fontWeight: 500,
                    height: 20
                  }}
                />

                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                  <CalendarIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">
                    {formatDate(budget.period_start)} - {formatDate(budget.period_end)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Actions */}
          {showActions && (
            <Box display="flex" gap={0.5}>
              {onEdit && (
                <Tooltip title="Editar orçamento">
                  <IconButton
                    size="small"
                    onClick={handleEdit}
                    sx={{ color: theme.palette.grey[600] }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onDelete && (
                <Tooltip title="Excluir orçamento">
                  <IconButton
                    size="small"
                    onClick={handleDelete}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>

        {/* Budget Progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Progresso do Orçamento
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: statusConfig.color
              }}
            >
              {budget.percentage_used.toFixed(1)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={getProgressValue()}
            color={statusConfig.progressColor}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200]
            }}
          />
        </Box>

        {/* Financial Info */}
        <Box display="flex" justifyContent="space-between" gap={2}>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">
              Orçado
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {BudgetService.formatCurrency(budget.amount)}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">
              Gasto
            </Typography>
            <Typography
              variant="body1"
              fontWeight={600}
              color={budget.spent_amount > budget.amount ? 'error.main' : 'text.primary'}
            >
              {BudgetService.formatCurrency(budget.spent_amount)}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">
              {budget.remaining_amount >= 0 ? 'Restante' : 'Excesso'}
            </Typography>
            <Typography
              variant="body1"
              fontWeight={600}
              color={budget.remaining_amount >= 0 ? 'success.main' : 'error.main'}
            >
              {BudgetService.formatCurrency(Math.abs(budget.remaining_amount))}
            </Typography>
          </Box>

          {budget.days_remaining > 0 && (
            <Box flex={1} textAlign="right">
              <Typography variant="caption" color="text.secondary">
                Dias Restantes
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {budget.days_remaining}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BudgetCard;
