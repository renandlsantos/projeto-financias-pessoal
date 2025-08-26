import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  FormHelperText,
  IconButton,
  Tooltip
} from '@mui/material';
import { Close as CloseIcon, Palette as PaletteIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CategoryCreate,
  CategoryUpdate,
  CategoryRead,
  TransactionType,
  CategoryFormData
} from '../../types/budgets';

// Color palette for categories
const COLOR_PALETTE = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#9e9e9e', '#607d8b'
];

// Validation schema
const categorySchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  type: z.nativeEnum(TransactionType),
  icon: z.string().max(50, 'Ícone deve ter no máximo 50 caracteres').optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato #RRGGBB')
    .optional()
    .or(z.literal('')),
  parent_id: z.string().uuid().optional().or(z.literal('')),
  sort_order: z.string()
    .transform((val) => parseInt(val))
    .refine((val) => val >= 0 && val <= 999, 'Ordem deve estar entre 0 e 999')
});

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryCreate | CategoryUpdate) => Promise<void>;
  category?: CategoryRead;
  parentCategories?: CategoryRead[];
  isLoading?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  open,
  onClose,
  onSubmit,
  category,
  parentCategories = [],
  isLoading = false
}) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showColorPalette, setShowColorPalette] = useState(false);

  const isEdit = !!category;
  const title = isEdit ? 'Editar Categoria' : 'Nova Categoria';

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: TransactionType.EXPENSE,
      icon: '',
      color: '',
      parent_id: '',
      sort_order: '0'
    }
  });

  const watchedType = watch('type');

  // Filter parent categories by type
  const availableParents = parentCategories.filter(
    (parent) => parent.type === watchedType && parent.id !== category?.id
  );

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name,
          type: category.type,
          icon: category.icon || '',
          color: category.color || '',
          parent_id: category.parent_id || '',
          sort_order: category.sort_order.toString()
        });
        setSelectedColor(category.color || '');
      } else {
        reset({
          name: '',
          type: TransactionType.EXPENSE,
          icon: '',
          color: '',
          parent_id: '',
          sort_order: '0'
        });
        setSelectedColor('');
      }
    }
  }, [open, category, reset]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      const formattedData = {
        name: data.name,
        type: data.type,
        icon: data.icon || undefined,
        color: data.color || undefined,
        parent_id: data.parent_id || undefined,
        sort_order: parseInt(data.sort_order)
      };

      await onSubmit(formattedData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue('color', color);
    setShowColorPalette(false);
  };

  const handleClose = () => {
    setShowColorPalette(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit(handleFormSubmit)
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {title}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Category Name */}
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nome da Categoria"
                  placeholder="Ex: Alimentação, Salário, etc."
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  autoFocus
                />
              )}
            />
          </Grid>

          {/* Transaction Type */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Tipo de Transação</InputLabel>
                  <Select {...field} label="Tipo de Transação">
                    <MenuItem value={TransactionType.EXPENSE}>Despesa</MenuItem>
                    <MenuItem value={TransactionType.INCOME}>Receita</MenuItem>
                    <MenuItem value={TransactionType.TRANSFER}>Transferência</MenuItem>
                  </Select>
                  {errors.type && (
                    <FormHelperText>{errors.type.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Sort Order */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="sort_order"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Ordem de Exibição"
                  placeholder="0"
                  inputProps={{ min: 0, max: 999 }}
                  error={!!errors.sort_order}
                  helperText={errors.sort_order?.message}
                />
              )}
            />
          </Grid>

          {/* Parent Category */}
          {availableParents.length > 0 && (
            <Grid item xs={12}>
              <Controller
                name="parent_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Categoria Pai (Opcional)</InputLabel>
                    <Select {...field} label="Categoria Pai (Opcional)">
                      <MenuItem value="">
                        <em>Nenhuma (Categoria Principal)</em>
                      </MenuItem>
                      {availableParents.map((parent) => (
                        <MenuItem key={parent.id} value={parent.id}>
                          {parent.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          )}

          {/* Icon */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Ícone (Emoji)"
                  placeholder="🍔 💰 🏠"
                  inputProps={{ maxLength: 50 }}
                  error={!!errors.icon}
                  helperText={errors.icon?.message || 'Opcional: emoji ou símbolo'}
                />
              )}
            />
          </Grid>

          {/* Color */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" gap={1}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cor"
                    placeholder="#FF5722"
                    error={!!errors.color}
                    helperText={errors.color?.message}
                    InputProps={{
                      startAdornment: selectedColor && (
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: selectedColor,
                            borderRadius: '50%',
                            mr: 1,
                            border: '1px solid #ddd'
                          }}
                        />
                      )
                    }}
                  />
                )}
              />
              <Tooltip title="Paleta de cores">
                <IconButton
                  onClick={() => setShowColorPalette(!showColorPalette)}
                  sx={{ alignSelf: 'center' }}
                >
                  <PaletteIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Color Palette */}
            {showColorPalette && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 1,
                  mt: 1,
                  p: 1,
                  border: '1px solid #ddd',
                  borderRadius: 1
                }}
              >
                {COLOR_PALETTE.map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: color,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: selectedColor === color ? '2px solid #000' : '1px solid #ddd',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryForm;
