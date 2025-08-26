import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Fab,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { BudgetSummary, BudgetRead } from '../../types/budgets';
import { BudgetService } from '../../services/budgetService';
import BudgetCard from '../../components/ui/BudgetCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`budget-tabpanel-${index}`}
    aria-labelledby={`budget-tab-${index}`}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const BudgetsDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeBudgets, setActiveBudgets] = useState<BudgetSummary[]>([]);
  const [allBudgets, setAllBudgets] = useState<BudgetRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  // Load data on component mount
  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [activeSummaries, allBudgetsData] = await Promise.all([
        BudgetService.getActiveBudgetsSummary(),
        BudgetService.getBudgets()
      ]);

      setActiveBudgets(activeSummaries);
      setAllBudgets(allBudgetsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao carregar orçamentos');
      console.error('Error loading budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateBudget = () => {
    // Navigate to budget creation form
    console.log('Navigate to create budget form');
  };

  const handleEditBudget = (budgetId: string) => {
    console.log('Edit budget:', budgetId);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await BudgetService.deleteBudget(budgetId);
        await loadBudgetData(); // Reload data
      } catch (err: any) {
        console.error('Error deleting budget:', err);
        setError(err.response?.data?.detail || 'Erro ao excluir orçamento');
      }
    }
  };

  const handleViewBudgetDetails = (budgetId: string) => {
    console.log('View budget details:', budgetId);
  };

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const total = activeBudgets.length;
    const onTrack = activeBudgets.filter(b => b.status === 'on_track').length;
    const warning = activeBudgets.filter(b => b.status === 'warning').length;
    const exceeded = activeBudgets.filter(b => b.status === 'exceeded').length;
    
    const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent_amount, 0);
    const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return { total, onTrack, warning, exceeded, totalBudgeted, totalSpent, overallPercentage };
  }, [activeBudgets]);

  // Filter budgets for different tabs
  const activeBudgetsList = allBudgets.filter(budget => {
    const today = new Date();
    const startDate = new Date(budget.start_date);
    const endDate = new Date(budget.end_date);
    return startDate <= today && endDate >= today;
  });

  const inactiveBudgetsList = allBudgets.filter(budget => {
    const today = new Date();
    const endDate = new Date(budget.end_date);
    return endDate < today;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Orçamentos
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBudget}
            size="large"
          >
            Novo Orçamento
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {summaryStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Orçamentos Ativos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {summaryStats.onTrack}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No Controle
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WarningIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {summaryStats.warning + summaryStats.exceeded}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Precisam Atenção
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {BudgetService.formatCurrency(summaryStats.totalSpent)}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  de {BudgetService.formatCurrency(summaryStats.totalBudgeted)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: summaryStats.overallPercentage > 100 ? 'error.main' : 
                          summaryStats.overallPercentage > 80 ? 'warning.main' : 'success.main',
                    fontWeight: 600
                  }}
                >
                  {summaryStats.overallPercentage.toFixed(1)}% Usado
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Resumo Ativos" />
          <Tab label="Orçamentos Ativos" />
          <Tab label="Histórico" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        {/* Active Budgets Summary */}
        {activeBudgets.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary" mb={2}>
              Nenhum orçamento ativo encontrado
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateBudget}
            >
              Criar Primeiro Orçamento
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {activeBudgets.map((budget) => (
              <Grid item xs={12} md={6} key={budget.budget_id}>
                <BudgetCard
                  budget={budget}
                  onEdit={handleEditBudget}
                  onDelete={handleDeleteBudget}
                  onViewDetails={handleViewBudgetDetails}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {/* Active Budgets List */}
        {activeBudgetsList.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              Nenhum orçamento ativo
            </Typography>
          </Box>
        ) : (
          <Box>
            {activeBudgetsList.map((budget) => (
              <Box key={budget.id} mb={2}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{budget.category?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {BudgetService.formatCurrency(budget.amount)} • {' '}
                      {new Date(budget.start_date).toLocaleDateString('pt-BR')} - {' '}
                      {new Date(budget.end_date).toLocaleDateString('pt-BR')}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {/* Inactive/Historical Budgets */}
        {inactiveBudgetsList.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              Nenhum orçamento no histórico
            </Typography>
          </Box>
        ) : (
          <Box>
            {inactiveBudgetsList.map((budget) => (
              <Box key={budget.id} mb={2}>
                <Card sx={{ opacity: 0.7 }}>
                  <CardContent>
                    <Typography variant="h6">{budget.category?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {BudgetService.formatCurrency(budget.amount)} • {' '}
                      {new Date(budget.start_date).toLocaleDateString('pt-BR')} - {' '}
                      {new Date(budget.end_date).toLocaleDateString('pt-BR')} • Expirado
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </TabPanel>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={handleCreateBudget}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default BudgetsDashboard;
