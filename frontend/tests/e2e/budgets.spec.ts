import { test, expect, Page } from '@playwright/test';

// Page Objects para melhor organização
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid=email-input]', email);
    await this.page.fill('[data-testid=password-input]', password);
    await this.page.click('[data-testid=login-button]');
  }

  async expectLoginError(message: string) {
    await expect(this.page.locator('[data-testid=error-message]')).toContainText(message);
  }
}

class BudgetsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/budgets');
  }

  async createBudget(categoryName: string, amount: string, startDate: string, endDate: string) {
    // Abrir modal de criação
    await this.page.click('[data-testid=add-budget-button]');
    await expect(this.page.locator('[data-testid=create-budget-modal]')).toBeVisible();

    // Preencher formulário
    await this.page.selectOption('[data-testid=category-select]', { label: categoryName });
    await this.page.fill('[data-testid=amount-input]', amount);
    await this.page.fill('[data-testid=start-date-input]', startDate);
    await this.page.fill('[data-testid=end-date-input]', endDate);

    // Salvar orçamento
    await this.page.click('[data-testid=save-budget-button]');
    await expect(this.page.locator('[data-testid=create-budget-modal]')).not.toBeVisible();
  }

  async editBudget(budgetName: string, newAmount: string) {
    // Localizar e clicar no botão de editar do orçamento específico
    const budgetCard = this.page.locator(`[data-testid=budget-card]:has-text("${budgetName}")`);
    await budgetCard.locator('[data-testid=edit-budget-button]').click();

    // Aguardar modal de edição aparecer
    await expect(this.page.locator('[data-testid=edit-budget-modal]')).toBeVisible();

    // Alterar valor
    await this.page.fill('[data-testid=amount-input]', newAmount);

    // Salvar alterações
    await this.page.click('[data-testid=save-budget-button]');
    await expect(this.page.locator('[data-testid=edit-budget-modal]')).not.toBeVisible();
  }

  async deleteBudget(budgetName: string) {
    const budgetCard = this.page.locator(`[data-testid=budget-card]:has-text("${budgetName}")`);
    await budgetCard.locator('[data-testid=delete-budget-button]').click();

    // Confirmar exclusão
    await expect(this.page.locator('[data-testid=confirm-delete-modal]')).toBeVisible();
    await this.page.click('[data-testid=confirm-delete-button]');
    await expect(this.page.locator('[data-testid=confirm-delete-modal]')).not.toBeVisible();
  }

  async searchBudgets(searchTerm: string) {
    await this.page.fill('[data-testid=search-budgets-input]', searchTerm);
    await this.page.keyboard.press('Enter');
  }

  async filterBudgetsByStatus(status: 'all' | 'on-track' | 'warning' | 'exceeded') {
    await this.page.click('[data-testid=filter-button]');
    await this.page.click(`[data-testid=filter-${status}]`);
  }

  async expectBudgetExists(budgetName: string) {
    await expect(this.page.locator(`[data-testid=budget-card]:has-text("${budgetName}")`)).toBeVisible();
  }

  async expectBudgetNotExists(budgetName: string) {
    await expect(this.page.locator(`[data-testid=budget-card]:has-text("${budgetName}")`)).not.toBeVisible();
  }

  async expectBudgetAmount(budgetName: string, amount: string) {
    const budgetCard = this.page.locator(`[data-testid=budget-card]:has-text("${budgetName}")`);
    await expect(budgetCard).toContainText(amount);
  }
}

// Configuração de teste
test.describe('Budget Management Flow', () => {
  let loginPage: LoginPage;
  let budgetsPage: BudgetsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    budgetsPage = new BudgetsPage(page);

    // Setup: Login com usuário de teste
    await loginPage.goto();
    await loginPage.login('teste@financeflow.com', 'senha123');
    
    // Aguardar redirecionamento para dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new budget successfully', async ({ page }) => {
    await budgetsPage.goto();

    // Criar novo orçamento
    await budgetsPage.createBudget(
      'Alimentação',
      '1000.00',
      '2024-01-01',
      '2024-01-31'
    );

    // Verificar se o orçamento foi criado
    await budgetsPage.expectBudgetExists('Alimentação');
    await budgetsPage.expectBudgetAmount('Alimentação', 'R$ 1.000,00');

    // Verificar feedback visual de sucesso
    await expect(page.locator('[data-testid=success-notification]')).toBeVisible();
    await expect(page.locator('[data-testid=success-notification]')).toContainText('Orçamento criado com sucesso');
  });

  test('should edit an existing budget', async ({ page }) => {
    // Pré-requisito: Criar um orçamento primeiro
    await budgetsPage.goto();
    await budgetsPage.createBudget('Transporte', '500.00', '2024-01-01', '2024-01-31');
    await budgetsPage.expectBudgetExists('Transporte');

    // Editar o orçamento
    await budgetsPage.editBudget('Transporte', '750.00');

    // Verificar se as alterações foram aplicadas
    await budgetsPage.expectBudgetAmount('Transporte', 'R$ 750,00');
    
    // Verificar notificação de sucesso
    await expect(page.locator('[data-testid=success-notification]')).toContainText('Orçamento atualizado com sucesso');
  });

  test('should delete a budget with confirmation', async ({ page }) => {
    // Pré-requisito: Criar um orçamento para deletar
    await budgetsPage.goto();
    await budgetsPage.createBudget('Lazer', '300.00', '2024-01-01', '2024-01-31');
    await budgetsPage.expectBudgetExists('Lazer');

    // Deletar o orçamento
    await budgetsPage.deleteBudget('Lazer');

    // Verificar se foi removido
    await budgetsPage.expectBudgetNotExists('Lazer');
    
    // Verificar notificação de sucesso
    await expect(page.locator('[data-testid=success-notification]')).toContainText('Orçamento excluído com sucesso');
  });

  test('should search for budgets', async ({ page }) => {
    // Pré-requisito: Criar múltiplos orçamentos
    await budgetsPage.goto();
    await budgetsPage.createBudget('Alimentação', '1000.00', '2024-01-01', '2024-01-31');
    await budgetsPage.createBudget('Transporte', '500.00', '2024-01-01', '2024-01-31');
    await budgetsPage.createBudget('Lazer', '300.00', '2024-01-01', '2024-01-31');

    // Pesquisar por categoria específica
    await budgetsPage.searchBudgets('Alimentação');

    // Verificar resultados da busca
    await budgetsPage.expectBudgetExists('Alimentação');
    await budgetsPage.expectBudgetNotExists('Transporte');
    await budgetsPage.expectBudgetNotExists('Lazer');

    // Limpar pesquisa
    await budgetsPage.searchBudgets('');
    
    // Verificar se todos os orçamentos voltaram a aparecer
    await budgetsPage.expectBudgetExists('Alimentação');
    await budgetsPage.expectBudgetExists('Transporte');
    await budgetsPage.expectBudgetExists('Lazer');
  });

  test('should filter budgets by status', async ({ page }) => {
    await budgetsPage.goto();

    // Assumir que existem orçamentos com diferentes status no sistema
    // (isso seria configurado em um setup de dados de teste)
    
    // Filtrar por orçamentos excedidos
    await budgetsPage.filterBudgetsByStatus('exceeded');
    
    // Verificar se apenas orçamentos excedidos aparecem
    const budgetCards = page.locator('[data-testid=budget-card]');
    await expect(budgetCards).toHaveCount(1); // Assumindo 1 orçamento excedido

    // Resetar filtro
    await budgetsPage.filterBudgetsByStatus('all');
    await expect(budgetCards.count()).toBeGreaterThan(1);
  });

  test('should display budget status correctly', async ({ page }) => {
    await budgetsPage.goto();

    // Verificar diferentes status de orçamentos
    const onTrackBudget = page.locator('[data-testid=budget-card]:has([data-testid=status-on-track])');
    const warningBudget = page.locator('[data-testid=budget-card]:has([data-testid=status-warning])');
    const exceededBudget = page.locator('[data-testid=budget-card]:has([data-testid=status-exceeded])');

    // Verificar cores e textos dos status
    if (await onTrackBudget.count() > 0) {
      await expect(onTrackBudget.first().locator('[data-testid=status-chip]')).toHaveCSS('background-color', 'rgb(76, 175, 80)'); // Verde
      await expect(onTrackBudget.first().locator('[data-testid=status-text]')).toContainText('No Controle');
    }

    if (await warningBudget.count() > 0) {
      await expect(warningBudget.first().locator('[data-testid=status-chip]')).toHaveCSS('background-color', 'rgb(255, 193, 7)'); // Amarelo
      await expect(warningBudget.first().locator('[data-testid=status-text]')).toContainText('Atenção');
    }

    if (await exceededBudget.count() > 0) {
      await expect(exceededBudget.first().locator('[data-testid=status-chip]')).toHaveCSS('background-color', 'rgb(244, 67, 54)'); // Vermelho
      await expect(exceededBudget.first().locator('[data-testid=status-text]')).toContainText('Excedido');
    }
  });

  test('should validate budget form inputs', async ({ page }) => {
    await budgetsPage.goto();
    
    // Tentar criar orçamento com dados inválidos
    await page.click('[data-testid=add-budget-button]');
    await expect(page.locator('[data-testid=create-budget-modal]')).toBeVisible();

    // Salvar sem preencher campos obrigatórios
    await page.click('[data-testid=save-budget-button]');

    // Verificar mensagens de validação
    await expect(page.locator('[data-testid=category-error]')).toContainText('Categoria é obrigatória');
    await expect(page.locator('[data-testid=amount-error]')).toContainText('Valor deve ser maior que zero');
    await expect(page.locator('[data-testid=date-error]')).toContainText('Data de início é obrigatória');

    // Tentar com valor negativo
    await page.fill('[data-testid=amount-input]', '-100');
    await page.blur('[data-testid=amount-input]');
    await expect(page.locator('[data-testid=amount-error]')).toContainText('Valor deve ser positivo');

    // Tentar com data final antes da inicial
    await page.fill('[data-testid=start-date-input]', '2024-02-01');
    await page.fill('[data-testid=end-date-input]', '2024-01-31');
    await page.blur('[data-testid=end-date-input]');
    await expect(page.locator('[data-testid=date-error]')).toContainText('Data final deve ser posterior à inicial');
  });

  test('should handle budget creation errors gracefully', async ({ page }) => {
    // Interceptar requisição para simular erro do servidor
    await page.route('**/api/budgets', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal Server Error' })
      });
    });

    await budgetsPage.goto();
    
    // Tentar criar orçamento
    await budgetsPage.createBudget('Alimentação', '1000.00', '2024-01-01', '2024-01-31');
    
    // Verificar tratamento do erro
    await expect(page.locator('[data-testid=error-notification]')).toBeVisible();
    await expect(page.locator('[data-testid=error-notification]')).toContainText('Erro ao criar orçamento. Tente novamente.');
    
    // Modal deve permanecer aberto
    await expect(page.locator('[data-testid=create-budget-modal]')).toBeVisible();
  });

  test('should navigate to budget details page', async ({ page }) => {
    await budgetsPage.goto();
    
    // Assumir que existe um orçamento na lista
    const budgetCard = page.locator('[data-testid=budget-card]').first();
    await budgetCard.click();
    
    // Verificar navegação para página de detalhes
    await expect(page).toHaveURL(/\/budgets\/[0-9a-f-]+$/);
    await expect(page.locator('[data-testid=budget-details-title]')).toBeVisible();
    await expect(page.locator('[data-testid=budget-progress-chart]')).toBeVisible();
    await expect(page.locator('[data-testid=budget-transactions-list]')).toBeVisible();
  });

  test('should show budget statistics correctly', async ({ page }) => {
    await budgetsPage.goto();
    
    // Verificar se as estatísticas são exibidas
    await expect(page.locator('[data-testid=total-budgets-stat]')).toBeVisible();
    await expect(page.locator('[data-testid=total-budgeted-stat]')).toBeVisible();
    await expect(page.locator('[data-testid=total-spent-stat]')).toBeVisible();
    await expect(page.locator('[data-testid=exceeded-budgets-stat]')).toBeVisible();
    
    // Verificar formato dos valores
    const totalBudgetedElement = page.locator('[data-testid=total-budgeted-value]');
    await expect(totalBudgetedElement).toHaveText(/^R\$ \d{1,3}(\.\d{3})*(,\d{2})?$/);
    
    const totalSpentElement = page.locator('[data-testid=total-spent-value]');
    await expect(totalSpentElement).toHaveText(/^R\$ \d{1,3}(\.\d{3})*(,\d{2})?$/);
  });
});
