import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  LinearProgress,
  Box,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { Goal, GoalStatus, STATUS_COLORS, STATUS_LABELS } from '../../types/goals';
import { GoalService } from '../../services/goalService';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onContribute?: (goal: Goal) => void;
  onClick?: (goal: Goal) => void;
  onStatusChange?: (goalId: string, newStatus: GoalStatus) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onContribute,
  onClick,
  onStatusChange
}) => {
  const handleStatusAction = async (newStatus: GoalStatus) => {
    if (onStatusChange) {
      onStatusChange(goal.id, newStatus);
    }
  };

  const getStatusColor = (status: GoalStatus) => {
    return STATUS_COLORS[status] || '#9E9E9E';
  };

  const getProgressColor = () => {
    if (goal.progress_percentage >= 80) return 'success';
    if (goal.progress_percentage >= 50) return 'primary';
    if (goal.progress_percentage >= 30) return 'warning';
    return 'error';
  };

  const getPaceIndicator = () => {
    const monthsElapsed = Math.ceil((new Date().getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30));
    const expectedProgress = (monthsElapsed / 12) * 100; // Assuming 1-year goals on average
    
    if (goal.progress_percentage > expectedProgress + 10) {
      return { label: 'Adiantado', color: 'success' as const, icon: '📈' };
    } else if (goal.progress_percentage < expectedProgress - 10) {
      return { label: 'Atrasado', color: 'error' as const, icon: '📉' };
    } else {
      return { label: 'No Prazo', color: 'primary' as const, icon: '📊' };
    }
  };

  const pace = getPaceIndicator();

  const renderActionButtons = () => {
    const buttons = [];

    switch (goal.status) {
      case GoalStatus.DRAFT:
        buttons.push(
          <Tooltip title="Iniciar meta" key="start">
            <IconButton
              size="small"
              onClick={() => handleStatusAction(GoalStatus.IN_PROGRESS)}
              color="primary"
            >
              <PlayIcon />
            </IconButton>
          </Tooltip>
        );
        break;

      case GoalStatus.IN_PROGRESS:
        buttons.push(
          <Tooltip title="Pausar meta" key="pause">
            <IconButton
              size="small"
              onClick={() => handleStatusAction(GoalStatus.PAUSED)}
              color="warning"
            >
              <PauseIcon />
            </IconButton>
          </Tooltip>
        );
        
        if (goal.progress_percentage >= 100 || goal.current_amount >= goal.target_amount) {
          buttons.push(
            <Tooltip title="Marcar como concluída" key="complete">
              <IconButton
                size="small"
                onClick={() => handleStatusAction(GoalStatus.COMPLETED)}
                color="success"
              >
                <CompleteIcon />
              </IconButton>
            </Tooltip>
          );
        }
        break;

      case GoalStatus.PAUSED:
        buttons.push(
          <Tooltip title="Retomar meta" key="resume">
            <IconButton
              size="small"
              onClick={() => handleStatusAction(GoalStatus.IN_PROGRESS)}
              color="primary"
            >
              <PlayIcon />
            </IconButton>
          </Tooltip>
        );
        break;

      case GoalStatus.OVERDUE:
        buttons.push(
          <Tooltip title="Reativar meta" key="reactivate">
            <IconButton
              size="small"
              onClick={() => handleStatusAction(GoalStatus.IN_PROGRESS)}
              color="primary"
            >
              <PlayIcon />
            </IconButton>
          </Tooltip>
        );
        break;
    }

    // Common actions for non-terminal states
    if (![GoalStatus.COMPLETED, GoalStatus.CANCELLED].includes(goal.status)) {
      buttons.push(
        <Tooltip title="Cancelar meta" key="cancel">
          <IconButton
            size="small"
            onClick={() => handleStatusAction(GoalStatus.CANCELLED)}
            color="error"
          >
            <CancelIcon />
          </IconButton>
        </Tooltip>
      );
    }

    return buttons;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: onClick ? 'translateY(-2px)' : 'none',
          boxShadow: onClick ? 4 : 1,
        },
        border: `2px solid ${goal.color || getStatusColor(goal.status)}`,
      }}
      onClick={() => onClick?.(goal)}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: goal.color || getStatusColor(goal.status),
              width: 40,
              height: 40,
              mr: 1
            }}
          >
            {goal.icon || '🎯'}
          </Avatar>
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{ fontWeight: 'bold' }}
            >
              {goal.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Chip
                label={STATUS_LABELS[goal.status]}
                size="small"
                sx={{
                  bgcolor: getStatusColor(goal.status),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              
              {goal.status === GoalStatus.IN_PROGRESS && (
                <Chip
                  label={`${pace.icon} ${pace.label}`}
                  size="small"
                  color={pace.color}
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Progresso
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {goal.progress_percentage.toFixed(1)}%
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={Math.min(goal.progress_percentage, 100)}
            color={getProgressColor()}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(0,0,0,0.1)',
            }}
          />
        </Box>

        {/* Financial Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Economizado
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {GoalService.formatCurrency(goal.current_amount)}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="textSecondary">
              Meta
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {GoalService.formatCurrency(goal.target_amount)}
            </Typography>
          </Box>
        </Box>

        {/* Timeline Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Dias restantes
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              color={goal.days_remaining <= 30 ? 'error' : 'textPrimary'}
            >
              {goal.days_remaining} dias
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="textSecondary">
              Sugestão mensal
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="success.main">
              {GoalService.formatCurrency(goal.monthly_contribution_needed)}
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        {goal.description && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              mt: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {goal.description}
          </Typography>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {renderActionButtons()}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {onContribute && ![GoalStatus.COMPLETED, GoalStatus.CANCELLED].includes(goal.status) && (
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onContribute(goal);
              }}
              sx={{ minWidth: 'auto' }}
            >
              Contribuir
            </Button>
          )}

          {onEdit && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(goal);
              }}
            >
              <EditIcon />
            </IconButton>
          )}

          {onDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(goal.id);
              }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default GoalCard;