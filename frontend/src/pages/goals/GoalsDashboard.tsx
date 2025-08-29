import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Fab,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import GoalCard from '../../components/ui/GoalCard';
import GoalForm from '../../components/forms/GoalForm';
import { Goal, GoalSummary, GoalStatus, CreateGoalRequest, CreateContributionRequest } from '../../types/goals';
import { GoalService } from '../../services/goalService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`goals-tabpanel-${index}`}
      aria-labelledby={`goals-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const GoalsDashboard: React.FC = () => {
  // State management
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);
  const [upcomingGoals, setUpcomingGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Contribution form
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionDescription, setContributionDescription] = useState('');

  // Load data
  const loadGoals = useCallback(async () => {
    try {
      const [goalsData, summaryData, upcomingData] = await Promise.all([
        GoalService.getGoals(),
        GoalService.getGoalSummary(),
        GoalService.getUpcomingDeadlines(30)
      ]);
      
      setGoals(goalsData);
      setSummary(summaryData);
      setUpcomingGoals(upcomingData);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Goal operations
  const handleCreateGoal = async (goalData: CreateGoalRequest) => {
    try {
      await GoalService.createGoal(goalData);
      await loadGoals();
      setGoalFormOpen(false);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar meta');
    }
  };

  const handleUpdateGoal = async (goalData: any) => {
    if (!editingGoal) return;
    
    try {
      await GoalService.updateGoal(editingGoal.id, goalData);
      await loadGoals();
      setGoalFormOpen(false);
      setEditingGoal(null);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar meta');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await GoalService.deleteGoal(goalId);
      await loadGoals();
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir meta');
    }
  };

  const handleStatusChange = async (goalId: string, newStatus: GoalStatus) => {
    try {
      await GoalService.updateGoalStatus(goalId, newStatus);
      await loadGoals();
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar status da meta');
    }
  };

  // Contribution operations
  const handleContribute = (goal: Goal) => {
    setSelectedGoal(goal);
    setContributionDialogOpen(true);
    setContributionAmount('');
    setContributionDescription('');
  };

  const handleAddContribution = async () => {
    if (!selectedGoal || !contributionAmount) return;

    try {
      const contributionData: CreateContributionRequest = {
        goal_id: selectedGoal.id,
        amount: parseFloat(contributionAmount),
        description: contributionDescription || undefined,
        contribution_date: new Date().toISOString().split('T')[0]
      };

      await GoalService.addContribution(selectedGoal.id, contributionData);
      await loadGoals();
      setContributionDialogOpen(false);
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar contribuição');
    }
  };

  // UI handlers
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalFormOpen(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCloseGoalForm = () => {
    setGoalFormOpen(false);
    setEditingGoal(null);
  };

  // Filter goals by status
  const filterGoalsByStatus = (status?: GoalStatus) => {
    if (!status) return goals;
    return goals.filter(goal => goal.status === status);
  };

  const activeGoals = filterGoalsByStatus(GoalStatus.IN_PROGRESS);
  const completedGoals = filterGoalsByStatus(GoalStatus.COMPLETED);
  const draftGoals = filterGoalsByStatus(GoalStatus.DRAFT);
  const pausedGoals = filterGoalsByStatus(GoalStatus.PAUSED);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          💰 Minhas Metas Financeiras
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setGoalFormOpen(true)}
          size="large"
        >
          Nova Meta
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {summary.total_goals}
                  </Typography>
                </Box>
                <Typography color="textSecondary">Total de Metas</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {summary.active_goals}
                  </Typography>
                </Box>
                <Typography color="textSecondary">Metas Ativas</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {summary.completed_goals}
                  </Typography>
                </Box>
                <Typography color="textSecondary">Metas Concluídas</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {upcomingGoals.length}
                  </Typography>
                </Box>
                <Typography color="textSecondary">Prazos Próximos</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Progress Overview */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Progresso Geral
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={summary.overall_progress}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {summary.overall_progress.toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    Economizado: <strong>{GoalService.formatCurrency(summary.total_saved)}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Meta Total: <strong>{GoalService.formatCurrency(summary.total_target)}</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Goals Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Todas 
                <Chip label={goals.length} size="small" sx={{ ml: 1 }} />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Ativas 
                <Chip label={activeGoals.length} size="small" color="primary" sx={{ ml: 1 }} />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Rascunhos 
                <Chip label={draftGoals.length} size="small" sx={{ ml: 1 }} />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Pausadas 
                <Chip label={pausedGoals.length} size="small" color="warning" sx={{ ml: 1 }} />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Concluídas 
                <Chip label={completedGoals.length} size="small" color="success" sx={{ ml: 1 }} />
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Goals Grid */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <GoalCard
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onContribute={handleContribute}
                onStatusChange={handleStatusChange}
              />
            </Grid>
          ))}
        </Grid>
        {goals.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Nenhuma meta encontrada
            </Typography>
            <Button variant="contained" onClick={() => setGoalFormOpen(true)}>
              Criar primeira meta
            </Button>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {activeGoals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <GoalCard
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onContribute={handleContribute}
                onStatusChange={handleStatusChange}
              />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {draftGoals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <GoalCard
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onStatusChange={handleStatusChange}
              />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          {pausedGoals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <GoalCard
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onContribute={handleContribute}
                onStatusChange={handleStatusChange}
              />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          {completedGoals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <GoalCard
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
              />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add goal"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => setGoalFormOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Goal Form Dialog */}
      <GoalForm
        open={goalFormOpen}
        onClose={handleCloseGoalForm}
        onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
        goal={editingGoal || undefined}
      />

      {/* Contribution Dialog */}
      <Dialog open={contributionDialogOpen} onClose={() => setContributionDialogOpen(false)}>
        <DialogTitle>Adicionar Contribuição</DialogTitle>
        <DialogContent>
          {selectedGoal && (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Meta: <strong>{selectedGoal.name}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Faltam: <strong>
                  {GoalService.formatCurrency(selectedGoal.target_amount - selectedGoal.current_amount)}
                </strong>
              </Typography>
              
              <TextField
                fullWidth
                label="Valor da Contribuição"
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                inputProps={{ min: 0.01, step: 0.01 }}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <Typography color="textSecondary">R$</Typography>
                }}
              />
              
              <TextField
                fullWidth
                label="Descrição (Opcional)"
                value={contributionDescription}
                onChange={(e) => setContributionDescription(e.target.value)}
                placeholder="Ex: Bônus do trabalho, economia do mês..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContributionDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddContribution}
            variant="contained"
            disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
          >
            Adicionar Contribuição
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GoalsDashboard;