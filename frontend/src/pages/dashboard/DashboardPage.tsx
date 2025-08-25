import { Stack, Typography, Box } from '@mui/material';
import { Card } from '../../components/ui';
import { MainLayout } from '../../components/layout/MainLayout';
import { formatCurrency } from '../../utils/formatters';

export const DashboardPage = () => {
  // Mock data - será substituído por dados reais da API
  const mockData = {
    totalBalance: 15750.50,
    monthlyIncome: 5000.00,
    monthlyExpenses: 3250.75,
    savingsGoal: 80, // percentual
  };

  return (
    <MainLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Stack spacing={3}>
        {/* Resumo Financeiro */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          {/* Saldo Total */}
          <Card>
            <Typography color="textSecondary" gutterBottom>
              Saldo Total
            </Typography>
            <Typography variant="h4" component="div">
              {formatCurrency(mockData.totalBalance)}
            </Typography>
          </Card>

          {/* Receitas do Mês */}
          <Card>
            <Typography color="textSecondary" gutterBottom>
              Receitas do Mês
            </Typography>
            <Typography variant="h4" component="div" color="success.main">
              {formatCurrency(mockData.monthlyIncome)}
            </Typography>
          </Card>

          {/* Despesas do Mês */}
          <Card>
            <Typography color="textSecondary" gutterBottom>
              Despesas do Mês
            </Typography>
            <Typography variant="h4" component="div" color="error.main">
              {formatCurrency(mockData.monthlyExpenses)}
            </Typography>
          </Card>

          {/* Economia do Mês */}
          <Card>
            <Typography color="textSecondary" gutterBottom>
              Economia do Mês
            </Typography>
            <Typography variant="h4" component="div" color="primary.main">
              {formatCurrency(mockData.monthlyIncome - mockData.monthlyExpenses)}
            </Typography>
          </Card>
        </Box>

        {/* Gráficos e Metas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Gráfico de Transações Recentes */}
          <Card>
            <Typography variant="h6" gutterBottom>
              Transações Recentes
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <Typography color="textSecondary">
                Gráfico será implementado com Recharts
              </Typography>
            </Box>
          </Card>

          {/* Metas Financeiras */}
          <Card>
            <Typography variant="h6" gutterBottom>
              Metas de Economia
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <Typography color="textSecondary">
                Progresso: {mockData.savingsGoal}%
              </Typography>
            </Box>
          </Card>
        </Box>
      </Stack>
    </MainLayout>
  );
};
