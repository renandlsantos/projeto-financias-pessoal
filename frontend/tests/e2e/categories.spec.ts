import { test, expect, Page } from '@playwright/test';

// Page Objects para categorias
class CategoriesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/categories');
  }

  async createCategory(name: string, parentCategory?: string) {
    // Abrir modal de criação
    await this.page.click('[data-testid=add-category-button]');
    await expect(this.page.locator('[data-testid=create-category-modal]')).toBeVisible();

    // Preencher nome
    await this.page.fill('[data-testid=category-name-input]', name);

    // Selecionar categoria pai se fornecida
    if (parentCategory) {
      await this.page.selectOption('[data-testid=parent-category-select]', { label: parentCategory });
    }

    // Salvar categoria
    await this.page.click('[data-testid=save-category-button]');
    await expect(this.page.locator('[data-testid=create-category-modal]')).not.toBeVisible();
  }

  async editCategory(categoryName: string, newName: string) {
    const categoryCard = this.page.locator(`[data-testid=category-card]:has-text("${categoryName}")`);
    await categoryCard.locator('[data-testid=edit-category-button]').click();

    await expect(this.page.locator('[data-testid=edit-category-modal]')).toBeVisible();
    
    await this.page.fill('[data-testid=category-name-input]', newName);
    await this.page.click('[data-testid=save-category-button]');
    
    await expect(this.page.locator('[data-testid=edit-category-modal]')).not.toBeVisible();
  }

  async deleteCategory(categoryName: string) {
    const categoryCard = this.page.locator(`[data-testid=category-card]:has-text("${categoryName}")`);
    await categoryCard.locator('[data-testid=delete-category-button]').click();

    // Confirmar exclusão
    await expect(this.page.locator('[data-testid=confirm-delete-modal]')).toBeVisible();
    await this.page.click('[data-testid=confirm-delete-button]');
    await expect(this.page.locator('[data-testid=confirm-delete-modal]')).not.toBeVisible();
  }

  async searchCategories(searchTerm: string) {
    await this.page.fill('[data-testid=search-categories-input]', searchTerm);
    await this.page.keyboard.press('Enter');
  }

  async expandCategory(categoryName: string) {
    const categoryCard = this.page.locator(`[data-testid=category-card]:has-text("${categoryName}")`);
    await categoryCard.locator('[data-testid=expand-category-button]').click();
  }

  async expectCategoryExists(categoryName: string) {
    await expect(this.page.locator(`[data-testid=category-card]:has-text("${categoryName}")`)).toBeVisible();
  }

  async expectCategoryNotExists(categoryName: string) {
    await expect(this.page.locator(`[data-testid=category-card]:has-text("${categoryName}")`)).not.toBeVisible();
  }

  async expectSubcategoryExists(parentName: string, subcategoryName: string) {
    const parentCard = this.page.locator(`[data-testid=category-card]:has-text("${parentName}")`);
    await expect(parentCard.locator(`[data-testid=subcategory]:has-text("${subcategoryName}")`)).toBeVisible();
  }
}

test.describe('Category Management Flow', () => {
  let categoriesPage: CategoriesPage;

  test.beforeEach(async ({ page }) => {
    categoriesPage = new CategoriesPage(page);

    // Login
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'teste@financeflow.com');
    await page.fill('[data-testid=password-input]', 'senha123');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new category', async ({ page }) => {
    await categoriesPage.goto();

    await categoriesPage.createCategory('Educação');

    // Verificar se categoria foi criada
    await categoriesPage.expectCategoryExists('Educação');
    
    // Verificar notificação de sucesso
    await expect(page.locator('[data-testid=success-notification]')).toContainText('Categoria criada com sucesso');
  });

  test('should create subcategory', async ({ page }) => {
    await categoriesPage.goto();

    // Criar categoria pai primeiro
    await categoriesPage.createCategory('Alimentação');
    await categoriesPage.expectCategoryExists('Alimentação');

    // Criar subcategoria
    await categoriesPage.createCategory('Restaurantes', 'Alimentação');

    // Expandir categoria pai para ver subcategoria
    await categoriesPage.expandCategory('Alimentação');
    await categoriesPage.expectSubcategoryExists('Alimentação', 'Restaurantes');
  });

  test('should edit existing category', async ({ page }) => {
    await categoriesPage.goto();

    // Criar categoria para editar
    await categoriesPage.createCategory('Compra');
    await categoriesPage.expectCategoryExists('Compra');

    // Editar categoria
    await categoriesPage.editCategory('Compra', 'Compras');

    // Verificar alteração
    await categoriesPage.expectCategoryExists('Compras');
    await categoriesPage.expectCategoryNotExists('Compra');
    
    await expect(page.locator('[data-testid=success-notification]')).toContainText('Categoria atualizada com sucesso');
  });

  test('should delete category', async ({ page }) => {
    await categoriesPage.goto();

    // Criar categoria para deletar
    await categoriesPage.createCategory('Teste Exclusão');
    await categoriesPage.expectCategoryExists('Teste Exclusão');

    // Deletar categoria
    await categoriesPage.deleteCategory('Teste Exclusão');

    // Verificar se foi removida
    await categoriesPage.expectCategoryNotExists('Teste Exclusão');
    
    await expect(page.locator('[data-testid=success-notification]')).toContainText('Categoria excluída com sucesso');
  });

  test('should search categories', async ({ page }) => {
    await categoriesPage.goto();

    // Criar múltiplas categorias
    await categoriesPage.createCategory('Alimentação');
    await categoriesPage.createCategory('Transporte');
    await categoriesPage.createCategory('Lazer');

    // Pesquisar categoria específica
    await categoriesPage.searchCategories('Alimentação');

    // Verificar resultados
    await categoriesPage.expectCategoryExists('Alimentação');
    await categoriesPage.expectCategoryNotExists('Transporte');
    await categoriesPage.expectCategoryNotExists('Lazer');

    // Limpar pesquisa
    await categoriesPage.searchCategories('');
    
    // Verificar se todas aparecem novamente
    await categoriesPage.expectCategoryExists('Alimentação');
    await categoriesPage.expectCategoryExists('Transporte');
    await categoriesPage.expectCategoryExists('Lazer');
  });

  test('should show category hierarchy correctly', async ({ page }) => {
    await categoriesPage.goto();

    // Criar estrutura hierárquica
    await categoriesPage.createCategory('Alimentação');
    await categoriesPage.createCategory('Restaurantes', 'Alimentação');
    await categoriesPage.createCategory('Supermercado', 'Alimentação');
    await categoriesPage.createCategory('Fast Food', 'Restaurantes');

    // Expandir categorias
    await categoriesPage.expandCategory('Alimentação');
    await categoriesPage.expandCategory('Restaurantes');

    // Verificar hierarquia
    await categoriesPage.expectSubcategoryExists('Alimentação', 'Restaurantes');
    await categoriesPage.expectSubcategoryExists('Alimentação', 'Supermercado');
    await categoriesPage.expectSubcategoryExists('Restaurantes', 'Fast Food');

    // Verificar níveis de indentação visual
    const restaurantesSubcategory = page.locator('[data-testid=subcategory]:has-text("Restaurantes")');
    const fastFoodSubcategory = page.locator('[data-testid=subcategory]:has-text("Fast Food")');
    
    await expect(restaurantesSubcategory).toHaveCSS('margin-left', '20px');
    await expect(fastFoodSubcategory).toHaveCSS('margin-left', '40px');
  });

  test('should prevent deletion of category with subcategories', async ({ page }) => {
    await categoriesPage.goto();

    // Criar categoria com subcategorias
    await categoriesPage.createCategory('Alimentação');
    await categoriesPage.createCategory('Restaurantes', 'Alimentação');

    // Tentar deletar categoria pai
    const alimentacaoCard = page.locator(`[data-testid=category-card]:has-text("Alimentação")`);
    await alimentacaoCard.locator('[data-testid=delete-category-button]').click();

    // Verificar mensagem de aviso
    await expect(page.locator('[data-testid=warning-modal]')).toBeVisible();
    await expect(page.locator('[data-testid=warning-message]')).toContainText('Esta categoria possui subcategorias');
    
    // Cancelar exclusão
    await page.click('[data-testid=cancel-delete-button]');
    await expect(page.locator('[data-testid=warning-modal]')).not.toBeVisible();
    
    // Verificar que categoria ainda existe
    await categoriesPage.expectCategoryExists('Alimentação');
  });

  test('should prevent deletion of category with transactions', async ({ page }) => {
    // Simular categoria com transações via interceptação da API
    await page.route('**/api/categories/*/usage', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          transaction_count: 15, 
          can_delete: false 
        })
      });
    });

    await categoriesPage.goto();
    await categoriesPage.createCategory('Alimentação com Transações');

    // Tentar deletar
    const categoryCard = page.locator(`[data-testid=category-card]:has-text("Alimentação com Transações")`);
    await categoryCard.locator('[data-testid=delete-category-button]').click();

    // Verificar aviso sobre transações
    await expect(page.locator('[data-testid=warning-modal]')).toBeVisible();
    await expect(page.locator('[data-testid=warning-message]')).toContainText('Esta categoria possui 15 transações');
    await expect(page.locator('[data-testid=warning-message]')).toContainText('não pode ser excluída');
  });

  test('should validate category form', async ({ page }) => {
    await categoriesPage.goto();

    // Tentar criar categoria sem nome
    await page.click('[data-testid=add-category-button]');
    await page.click('[data-testid=save-category-button]');

    // Verificar validação
    await expect(page.locator('[data-testid=name-error]')).toContainText('Nome é obrigatório');
    
    // Nome muito curto
    await page.fill('[data-testid=category-name-input]', 'A');
    await page.blur('[data-testid=category-name-input]');
    await expect(page.locator('[data-testid=name-error]')).toContainText('Nome deve ter pelo menos 2 caracteres');

    // Nome muito longo
    const longName = 'A'.repeat(101);
    await page.fill('[data-testid=category-name-input]', longName);
    await page.blur('[data-testid=category-name-input]');
    await expect(page.locator('[data-testid=name-error]')).toContainText('Nome deve ter no máximo 100 caracteres');
  });

  test('should prevent duplicate category names', async ({ page }) => {
    await categoriesPage.goto();

    // Criar primeira categoria
    await categoriesPage.createCategory('Alimentação');

    // Tentar criar categoria duplicada
    await page.click('[data-testid=add-category-button]');
    await page.fill('[data-testid=category-name-input]', 'Alimentação');
    await page.click('[data-testid=save-category-button]');

    // Verificar erro de duplicação
    await expect(page.locator('[data-testid=duplicate-error]')).toContainText('Já existe uma categoria com este nome');
    
    // Modal deve permanecer aberto
    await expect(page.locator('[data-testid=create-category-modal]')).toBeVisible();
  });

  test('should filter system vs custom categories', async ({ page }) => {
    await categoriesPage.goto();

    // Filtrar apenas categorias do sistema
    await page.click('[data-testid=filter-button]');
    await page.click('[data-testid=filter-system]');

    // Verificar que apenas categorias do sistema aparecem
    const systemCategories = page.locator('[data-testid=category-card]:has([data-testid=system-badge])');
    const customCategories = page.locator('[data-testid=category-card]:not(:has([data-testid=system-badge]))');
    
    await expect(systemCategories.count()).toBeGreaterThan(0);
    await expect(customCategories.count()).toBe(0);

    // Filtrar apenas categorias personalizadas
    await page.click('[data-testid=filter-button]');
    await page.click('[data-testid=filter-custom]');

    // Verificar que apenas categorias personalizadas aparecem
    await expect(customCategories.count()).toBeGreaterThan(0);
    await expect(systemCategories.count()).toBe(0);
  });

  test('should display category usage statistics', async ({ page }) => {
    // Simular dados de uso via interceptação
    await page.route('**/api/categories/*/stats', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          transaction_count: 25,
          total_amount: 1500.50,
          avg_amount: 60.02,
          last_used: '2024-01-15'
        })
      });
    });

    await categoriesPage.goto();

    // Clicar em categoria para ver estatísticas
    const categoryCard = page.locator('[data-testid=category-card]').first();
    await categoryCard.click();

    // Verificar estatísticas exibidas
    await expect(page.locator('[data-testid=stats-modal]')).toBeVisible();
    await expect(page.locator('[data-testid=transaction-count]')).toContainText('25 transações');
    await expect(page.locator('[data-testid=total-amount]')).toContainText('R$ 1.500,50');
    await expect(page.locator('[data-testid=avg-amount]')).toContainText('R$ 60,02');
    await expect(page.locator('[data-testid=last-used]')).toContainText('15/01/2024');
  });
});
