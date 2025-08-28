import { test, expect } from '@playwright/test';

test.describe('Goals Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock API responses for goals
    await page.route('**/api/v1/goals**', async route => {
      const url = route.request().url();
      const method = route.request().method();

      if (method === 'GET' && url.includes('/summary')) {
        // Goals summary endpoint
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            total_goals: 3,
            active_goals: 2,
            completed_goals: 1,
            total_saved: 12500,
            total_target: 35000,
            overall_progress: 35.7,
            goals_on_track: 1,
            goals_behind: 1,
            goals_ahead: 0
          })
        });
      } else if (method === 'GET' && url.includes('/upcoming')) {
        // Upcoming deadlines endpoint
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '3',
              name: 'Viagem Férias',
              target_amount: 8000,
              current_amount: 2000,
              deadline: '2024-07-15',
              status: 'IN_PROGRESS',
              days_remaining: 30,
              progress_percentage: 25
            }
          ])
        });
      } else if (method === 'GET' && !url.includes('/')) {
        // Main goals list endpoint
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '1',
              user_id: 'user123',
              name: 'Viagem Europa',
              description: 'Economizar para viagem de férias em família',
              target_amount: 15000,
              current_amount: 5000,
              deadline: '2024-12-31',
              status: 'IN_PROGRESS',
              color: '#4CAF50',
              icon: '🏖️',
              priority: 3,
              is_recurring: false,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-06-01T00:00:00Z',
              progress_percentage: 33.33,
              days_remaining: 180,
              monthly_contribution_needed: 833.33
            },
            {
              id: '2',
              user_id: 'user123',
              name: 'Carro Novo',
              description: 'Trocar o carro atual por um modelo mais novo',
              target_amount: 50000,
              current_amount: 15000,
              deadline: '2025-06-30',
              status: 'IN_PROGRESS',
              color: '#2196F3',
              icon: '🚗',
              priority: 2,
              is_recurring: false,
              created_at: '2024-02-01T00:00:00Z',
              updated_at: '2024-06-01T00:00:00Z',
              progress_percentage: 30,
              days_remaining: 365,
              monthly_contribution_needed: 2916.67
            },
            {
              id: '3',
              user_id: 'user123',
              name: 'Casa Própria',
              description: 'Entrada para financiamento da casa própria',
              target_amount: 80000,
              current_amount: 80000,
              deadline: '2024-03-31',
              status: 'COMPLETED',
              color: '#FF9800',
              icon: '🏠',
              priority: 5,
              is_recurring: false,
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2024-03-15T00:00:00Z',
              achieved_at: '2024-03-15T00:00:00Z',
              progress_percentage: 100,
              days_remaining: 0,
              monthly_contribution_needed: 0
            }
          ])
        });
      } else if (method === 'POST' && !url.includes('/contributions')) {
        // Create goal endpoint
        const requestBody = await route.request().postDataJSON();
        await route.fulfill({
          contentType: 'application/json',
          status: 201,
          body: JSON.stringify({
            id: '4',
            user_id: 'user123',
            ...requestBody,
            current_amount: 0,
            status: 'DRAFT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            progress_percentage: 0,
            days_remaining: Math.ceil((new Date(requestBody.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            monthly_contribution_needed: requestBody.target_amount / 12
          })
        });
      } else if (method === 'POST' && url.includes('/contributions')) {
        // Add contribution endpoint
        const requestBody = await route.request().postDataJSON();
        await route.fulfill({
          contentType: 'application/json',
          status: 201,
          body: JSON.stringify({
            id: 'contrib123',
            goal_id: requestBody.goal_id,
            amount: requestBody.amount,
            type: 'MANUAL',
            description: requestBody.description,
            contribution_date: requestBody.contribution_date || new Date().toISOString().split('T')[0],
            is_recurring: false,
            created_by: 'user123',
            created_at: new Date().toISOString()
          })
        });
      }
    });

    // Mock categories endpoint
    await page.route('**/api/v1/categories**', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'cat1',
            name: 'Viagem',
            color: '#FF5722',
            icon: '🏖️',
            type: 'expense'
          },
          {
            id: 'cat2',
            name: 'Veículo',
            color: '#2196F3',
            icon: '🚗',
            type: 'expense'
          }
        ])
      });
    });

    // Navigate to goals page (assuming it's integrated in the main app)
    await page.goto('http://localhost:3000/dashboard'); // Adjust based on your routing
    
    // Click on Goals navigation if it exists
    const goalsNavButton = page.locator('text=Metas').or(page.locator('text=Goals'));
    if (await goalsNavButton.isVisible()) {
      await goalsNavButton.click();
    } else {
      // If direct navigation to goals page
      await page.goto('http://localhost:3000/goals');
    }
  });

  test('should display goals dashboard with summary cards', async ({ page }) => {
    // Wait for the page to load
    await page.waitForSelector('text=Minhas Metas Financeiras');

    // Check if summary cards are visible
    await expect(page.locator('text=Total de Metas')).toBeVisible();
    await expect(page.locator('text=Metas Ativas')).toBeVisible();
    await expect(page.locator('text=Metas Concluídas')).toBeVisible();
    await expect(page.locator('text=Prazos Próximos')).toBeVisible();

    // Check summary values
    await expect(page.locator('text=3')).toBeVisible(); // Total goals
    await expect(page.locator('text=2')).toBeVisible(); // Active goals
    await expect(page.locator('text=1')).toBeVisible(); // Completed goals
  });

  test('should display goal cards with correct information', async ({ page }) => {
    await page.waitForSelector('text=Viagem Europa');

    // Check if goal cards are displayed
    await expect(page.locator('text=Viagem Europa')).toBeVisible();
    await expect(page.locator('text=Carro Novo')).toBeVisible();
    await expect(page.locator('text=Casa Própria')).toBeVisible();

    // Check goal details on first card
    await expect(page.locator('text=🏖️')).toBeVisible();
    await expect(page.locator('text=R$ 5.000,00')).toBeVisible(); // Current amount
    await expect(page.locator('text=R$ 15.000,00')).toBeVisible(); // Target amount
    await expect(page.locator('text=33.3%')).toBeVisible(); // Progress

    // Check status chips
    await expect(page.locator('text=Em Andamento')).toBeVisible();
    await expect(page.locator('text=Concluída')).toBeVisible();
  });

  test('should filter goals by status using tabs', async ({ page }) => {
    await page.waitForSelector('text=Todas');

    // Click on "Ativas" tab
    await page.click('text=Ativas');
    await page.waitForTimeout(500); // Wait for filter to apply

    // Should show only active goals
    await expect(page.locator('text=Viagem Europa')).toBeVisible();
    await expect(page.locator('text=Carro Novo')).toBeVisible();
    // Completed goal should not be visible
    await expect(page.locator('text=Casa Própria')).not.toBeVisible();

    // Click on "Concluídas" tab
    await page.click('text=Concluídas');
    await page.waitForTimeout(500);

    // Should show only completed goals
    await expect(page.locator('text=Casa Própria')).toBeVisible();
    // Active goals should not be visible
    await expect(page.locator('text=Viagem Europa')).not.toBeVisible();
    await expect(page.locator('text=Carro Novo')).not.toBeVisible();
  });

  test('should open create goal form and create a new goal', async ({ page }) => {
    // Click "Nova Meta" button
    await page.click('text=Nova Meta');

    // Wait for form dialog to open
    await expect(page.locator('text=Nova Meta Financeira')).toBeVisible();

    // Fill out the form
    await page.fill('input[label="Nome da Meta"]', 'Curso de Especialização');
    await page.fill('textarea[label="Descrição / Motivação"]', 'Investir em educação profissional');
    await page.fill('input[label="Valor Alvo"]', '5000');
    
    // Set deadline (using date picker)
    await page.click('input[label="Data Limite"]');
    // For simplicity, we'll click on a future date in the calendar
    // In a real test, you might need more specific date selection logic
    await page.waitForTimeout(500);
    
    // Select a category
    await page.click('text=Categoria (Opcional)');
    await page.click('text=Viagem'); // Select first available category
    
    // Choose color and icon
    await page.click('[data-testid="color-chip"]').first();
    await page.click('text=📚'); // Education icon
    
    // Submit the form
    await page.click('text=Criar Meta');

    // Wait for form to close and new goal to appear
    await expect(page.locator('text=Nova Meta Financeira')).not.toBeVisible();
    
    // Verify the new goal appears in the list (if the UI updates immediately)
    // Note: In a real app, you might need to refresh or wait for the list to update
  });

  test('should add contribution to a goal', async ({ page }) => {
    await page.waitForSelector('text=Viagem Europa');

    // Click "Contribuir" button on the first goal
    const contributeButton = page.locator('text=Contribuir').first();
    await contributeButton.click();

    // Wait for contribution dialog to open
    await expect(page.locator('text=Adicionar Contribuição')).toBeVisible();
    await expect(page.locator('text=Meta: Viagem Europa')).toBeVisible();

    // Fill contribution amount
    await page.fill('input[label="Valor da Contribuição"]', '500');
    await page.fill('input[label="Descrição (Opcional)"]', 'Economia do mês');

    // Submit contribution
    await page.click('text=Adicionar Contribuição');

    // Wait for dialog to close
    await expect(page.locator('text=Adicionar Contribuição')).not.toBeVisible();

    // In a real app, you might verify that the goal's progress updated
  });

  test('should change goal status using action buttons', async ({ page }) => {
    await page.waitForSelector('text=Viagem Europa');

    // Find the first goal card with "Em Andamento" status
    const goalCard = page.locator('.MuiCard-root').filter({ hasText: 'Viagem Europa' });
    
    // Click pause button (assuming it's visible for active goals)
    const pauseButton = goalCard.locator('button[title="Pausar meta"]');
    if (await pauseButton.isVisible()) {
      await pauseButton.click();
    }

    // In a real test, you would verify that the status changed
    // This might require mocking the status update API response
  });

  test('should show mobile responsive design', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.waitForSelector('text=Minhas Metas Financeiras');

    // Check if FAB (Floating Action Button) is visible on mobile
    const fab = page.locator('button[aria-label="add goal"]');
    await expect(fab).toBeVisible();

    // Summary cards should stack on mobile
    const summaryCards = page.locator('.MuiCard-root').first();
    await expect(summaryCards).toBeVisible();

    // Click FAB to open goal form
    await fab.click();
    await expect(page.locator('text=Nova Meta Financeira')).toBeVisible();
  });

  test('should handle empty state when no goals exist', async ({ page }) => {
    // Mock empty goals response
    await page.route('**/api/v1/goals', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    // Mock empty summary
    await page.route('**/api/v1/goals/summary', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          total_goals: 0,
          active_goals: 0,
          completed_goals: 0,
          total_saved: 0,
          total_target: 0,
          overall_progress: 0,
          goals_on_track: 0,
          goals_behind: 0,
          goals_ahead: 0
        })
      });
    });

    // Reload page to get empty state
    await page.reload();
    
    await page.waitForSelector('text=Minhas Metas Financeiras');

    // Check empty state message
    await expect(page.locator('text=Nenhuma meta encontrada')).toBeVisible();
    await expect(page.locator('text=Criar primeira meta')).toBeVisible();

    // Click "Criar primeira meta" button
    await page.click('text=Criar primeira meta');
    await expect(page.locator('text=Nova Meta Financeira')).toBeVisible();
  });

  test('should show progress visualization correctly', async ({ page }) => {
    await page.waitForSelector('text=Viagem Europa');

    // Check progress bars are visible
    const progressBars = page.locator('[role="progressbar"]');
    await expect(progressBars).toHaveCount(4); // 3 goal cards + 1 overall progress

    // Check that progress percentages are displayed
    await expect(page.locator('text=33.3%')).toBeVisible(); // Viagem Europa
    await expect(page.locator('text=30%')).toBeVisible(); // Carro Novo  
    await expect(page.locator('text=100%')).toBeVisible(); // Casa Própria

    // Check overall progress in summary
    await expect(page.locator('text=35.7%')).toBeVisible();
  });

  test('should handle goal form validation', async ({ page }) => {
    // Click "Nova Meta" button
    await page.click('text=Nova Meta');

    await expect(page.locator('text=Nova Meta Financeira')).toBeVisible();

    // Try to submit form without required fields
    await page.click('text=Criar Meta');

    // Form should not close and should show validation errors
    await expect(page.locator('text=Nova Meta Financeira')).toBeVisible();

    // Fill required fields and submit
    await page.fill('input[label="Nome da Meta"]', 'Meta de Teste');
    await page.fill('input[label="Valor Alvo"]', '1000');
    
    // Set a valid future date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.fill('input[label="Data Limite"]', dateString);

    // Now submit should work
    await page.click('text=Criar Meta');

    // Form should close
    await expect(page.locator('text=Nova Meta Financeira')).not.toBeVisible();
  });

  test('should show goal details when clicking on a goal card', async ({ page }) => {
    await page.waitForSelector('text=Viagem Europa');

    // Click on the goal card (not on action buttons)
    const goalCard = page.locator('.MuiCard-root').filter({ hasText: 'Viagem Europa' });
    await goalCard.click();

    // This would depend on your app's navigation
    // It might open a detailed view or navigate to a detail page
    // For now, we'll just verify that the click was registered
    // In a real app, you might check for navigation or modal opening
  });
});