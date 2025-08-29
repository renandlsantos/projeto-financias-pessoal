import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Grid,
  Avatar,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { Goal, GoalFormData, GOAL_COLORS, GOAL_ICONS } from '../../types/goals';
import { Category } from '../../types/budgets';
import { GoalService } from '../../services/goalService';
import { CategoryService } from '../../services/categoryService';

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (goalData: any) => Promise<void>;
  goal?: Goal; // For editing
  title?: string;
}

const GoalForm: React.FC<GoalFormProps> = ({
  open,
  onClose,
  onSubmit,
  goal,
  title
}) => {
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    description: '',
    target_amount: '',
    deadline: '',
    category_id: '',
    color: GOAL_COLORS[0],
    icon: GOAL_ICONS[0],
    priority: 1,
    is_recurring: false,
    recurrence_day: undefined
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        description: goal.description || '',
        target_amount: goal.target_amount.toString(),
        deadline: goal.deadline,
        category_id: goal.category_id || '',
        color: goal.color || GOAL_COLORS[0],
        icon: goal.icon || GOAL_ICONS[0],
        priority: goal.priority,
        is_recurring: goal.is_recurring,
        recurrence_day: goal.recurrence_day
      });
      setSelectedDeadline(new Date(goal.deadline));
    } else {
      // Reset form for new goal
      setFormData({
        name: '',
        description: '',
        target_amount: '',
        deadline: '',
        category_id: '',
        color: GOAL_COLORS[0],
        icon: GOAL_ICONS[0],
        priority: 1,
        is_recurring: false,
        recurrence_day: undefined
      });
      setSelectedDeadline(null);
    }
  }, [goal]);

  const loadCategories = async () => {
    try {
      const categoriesData = await CategoryService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleInputChange = (field: keyof GoalFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDeadline(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        deadline: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({
      ...prev,
      icon
    }));
  };

  const calculateMonthlyContribution = () => {
    if (!formData.target_amount || !formData.deadline) return 0;
    
    const targetAmount = parseFloat(formData.target_amount);
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    
    const monthsRemaining = Math.max(
      (deadlineDate.getFullYear() - today.getFullYear()) * 12 + 
      (deadlineDate.getMonth() - today.getMonth()),
      1
    );
    
    return targetAmount / monthsRemaining;
  };

  const validateForm = () => {
    const goalData = {
      name: formData.name,
      description: formData.description || undefined,
      target_amount: parseFloat(formData.target_amount),
      deadline: formData.deadline,
      category_id: formData.category_id || undefined,
      color: formData.color,
      icon: formData.icon,
      priority: formData.priority,
      is_recurring: formData.is_recurring,
      recurrence_day: formData.is_recurring ? formData.recurrence_day : undefined
    };

    return GoalService.validateGoalData(goalData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const goalData = {
        name: formData.name,
        description: formData.description || undefined,
        target_amount: parseFloat(formData.target_amount),
        deadline: formData.deadline,
        category_id: formData.category_id || undefined,
        color: formData.color,
        icon: formData.icon,
        priority: formData.priority,
        is_recurring: formData.is_recurring,
        recurrence_day: formData.is_recurring ? formData.recurrence_day : undefined
      };

      await onSubmit(goalData);
      onClose();
    } catch (error: any) {
      setErrors([error.message || 'Erro ao salvar meta']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {title || (goal ? 'Editar Meta' : 'Nova Meta Financeira')}
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent>
            {errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.map((error, index) => (
                  <Typography key={index} variant="body2">
                    • {error}
                  </Typography>
                ))}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Informações Básicas
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Nome da Meta"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Ex: Viagem dos Sonhos, Carro Novo..."
                  required
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Prioridade</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={handleInputChange('priority')}
                    label="Prioridade"
                  >
                    <MenuItem value={1}>1 - Baixa</MenuItem>
                    <MenuItem value={2}>2 - Normal</MenuItem>
                    <MenuItem value={3}>3 - Média</MenuItem>
                    <MenuItem value={4}>4 - Alta</MenuItem>
                    <MenuItem value={5}>5 - Urgente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição / Motivação"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  multiline
                  rows={3}
                  placeholder="Por que essa meta é importante para você?"
                />
              </Grid>

              {/* Financial Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Informações Financeiras
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valor Alvo"
                  value={formData.target_amount}
                  onChange={handleInputChange('target_amount')}
                  type="number"
                  inputProps={{ min: 0.01, step: 0.01 }}
                  placeholder="0,00"
                  required
                  InputProps={{
                    startAdornment: <Typography color="textSecondary">R$</Typography>
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data Limite"
                  value={selectedDeadline}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Grid>

              {formData.target_amount && formData.deadline && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      💡 <strong>Sugestão:</strong> Para alcançar sua meta, economize{' '}
                      <strong>{GoalService.formatCurrency(calculateMonthlyContribution())}</strong>{' '}
                      por mês.
                    </Typography>
                  </Alert>
                </Grid>
              )}

              {/* Category Selection */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Categorização
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Categoria (Opcional)</InputLabel>
                  <Select
                    value={formData.category_id}
                    onChange={handleInputChange('category_id')}
                    label="Categoria (Opcional)"
                  >
                    <MenuItem value="">
                      <em>Nenhuma categoria</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              bgcolor: category.color,
                              width: 20,
                              height: 20,
                              mr: 1,
                              fontSize: '12px'
                            }}
                          >
                            {category.icon}
                          </Avatar>
                          {category.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Visual Customization */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Personalização Visual
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  Cor da Meta
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {GOAL_COLORS.map((color) => (
                    <Chip
                      key={color}
                      sx={{
                        bgcolor: color,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: formData.color === color ? '3px solid black' : 'none'
                      }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  Ícone da Meta
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {GOAL_ICONS.map((icon) => (
                    <Chip
                      key={icon}
                      label={icon}
                      onClick={() => handleIconSelect(icon)}
                      variant={formData.icon === icon ? 'filled' : 'outlined'}
                      sx={{
                        fontSize: '18px',
                        cursor: 'pointer',
                        bgcolor: formData.icon === icon ? formData.color : 'transparent'
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Recurring Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Configurações Avançadas
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_recurring}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        is_recurring: e.target.checked,
                        recurrence_day: e.target.checked ? 1 : undefined
                      }))}
                    />
                  }
                  label="Meta com contribuição automática mensal"
                />
              </Grid>

              {formData.is_recurring && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Dia do Mês"
                    type="number"
                    value={formData.recurrence_day || 1}
                    onChange={handleInputChange('recurrence_day')}
                    inputProps={{ min: 1, max: 31 }}
                    helperText="Dia do mês para contribuição automática"
                  />
                </Grid>
              )}

              {/* Preview */}
              <Grid item xs={12}>
                <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Pré-visualização:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: formData.color, mr: 2 }}>
                      {formData.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formData.name || 'Nome da Meta'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Meta: {formData.target_amount ? GoalService.formatCurrency(parseFloat(formData.target_amount)) : 'R$ 0,00'}
                        {formData.deadline && ` • Até ${GoalService.formatDate(formData.deadline)}`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={16} />}
            >
              {goal ? 'Salvar Alterações' : 'Criar Meta'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default GoalForm;