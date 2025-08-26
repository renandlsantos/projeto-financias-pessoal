import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Box,
  Avatar,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as IncomeIcon,
  ShoppingCart as ExpenseIcon,
  SwapHoriz as TransferIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon
} from '@mui/icons-material';
import { CategoryRead, TransactionType } from '../../types/budgets';

interface CategoryCardProps {
  category: CategoryRead;
  onEdit?: (category: CategoryRead) => void;
  onDelete?: (category: CategoryRead) => void;
  onExpand?: (category: CategoryRead) => void;
  showActions?: boolean;
  showSubcategoriesCount?: boolean;
  variant?: 'default' | 'compact';
  isExpanded?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onExpand,
  showActions = true,
  showSubcategoriesCount = true,
  variant = 'default',
  isExpanded = false
}) => {
  const theme = useTheme();

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return <IncomeIcon />;
      case TransactionType.EXPENSE:
        return <ExpenseIcon />;
      case TransactionType.TRANSFER:
        return <TransferIcon />;
      default:
        return <FolderIcon />;
    }
  };

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return theme.palette.success.main;
      case TransactionType.EXPENSE:
        return theme.palette.error.main;
      case TransactionType.TRANSFER:
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return 'Receita';
      case TransactionType.EXPENSE:
        return 'Despesa';
      case TransactionType.TRANSFER:
        return 'Transferência';
      default:
        return 'Desconhecido';
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(category);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(category);
  };

  const handleExpand = () => {
    if (category.subcategories_count > 0) {
      onExpand?.(category);
    }
  };

  const cardContent = (
    <CardContent sx={{ p: variant === 'compact' ? 1.5 : 2 }}>
      <Box display="flex" alignItems="center" gap={2}>
        {/* Category Icon/Avatar */}
        <Avatar
          sx={{
            backgroundColor: category.color || getTypeColor(category.type),
            width: variant === 'compact' ? 32 : 40,
            height: variant === 'compact' ? 32 : 40,
            fontSize: variant === 'compact' ? '1rem' : '1.2rem'
          }}
        >
          {category.icon ? (
            <span style={{ fontSize: 'inherit' }}>{category.icon}</span>
          ) : (
            getTypeIcon(category.type)
          )}
        </Avatar>

        {/* Category Info */}
        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Typography
              variant={variant === 'compact' ? 'body2' : 'h6'}
              component="h3"
              noWrap
              sx={{ fontWeight: 500 }}
            >
              {category.name}
            </Typography>

            {category.is_system && (
              <Chip
                label="Sistema"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}

            {category.parent_name && (
              <Chip
                label={category.parent_name}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={getTypeLabel(category.type)}
              size="small"
              sx={{
                backgroundColor: `${getTypeColor(category.type)}20`,
                color: getTypeColor(category.type),
                fontWeight: 500
              }}
            />

            {showSubcategoriesCount && category.subcategories_count > 0 && (
              <Tooltip title="Clique para expandir subcategorias">
                <Chip
                  icon={isExpanded ? <FolderOpenIcon /> : <FolderIcon />}
                  label={`${category.subcategories_count} sub`}
                  size="small"
                  clickable
                  onClick={handleExpand}
                  sx={{
                    backgroundColor: theme.palette.grey[100],
                    color: theme.palette.grey[700],
                    '&:hover': {
                      backgroundColor: theme.palette.grey[200]
                    }
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Actions */}
        {showActions && !category.is_system && (
          <Box display="flex" gap={0.5}>
            {onEdit && (
              <Tooltip title="Editar categoria">
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
              <Tooltip title="Excluir categoria">
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
    </CardContent>
  );

  return (
    <Card
      elevation={1}
      sx={{
        transition: 'all 0.2s ease-in-out',
        cursor: category.subcategories_count > 0 ? 'pointer' : 'default',
        '&:hover': {
          elevation: 2,
          transform: 'translateY(-1px)'
        },
        mb: 1
      }}
      onClick={category.subcategories_count > 0 ? handleExpand : undefined}
    >
      {cardContent}
    </Card>
  );
};

export default CategoryCard;
