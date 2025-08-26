import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Diretório de testes
  testDir: './tests/e2e',
  
  // Executar testes em paralelo em CI
  fullyParallel: true,
  
  // Não permitir testes no CI se houver arquivos unstaged
  forbidOnly: !!process.env.CI,
  
  // Repetir testes falhando apenas no CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers para execução paralela
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['line']
  ],
  
  // Configurações globais de teste
  use: {
    // URL base da aplicação
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    
    // Trace para debugging
    trace: 'on-first-retry',
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // Video
    video: 'retain-on-failure',
    
    // Locale
    locale: 'pt-BR',
    
    // Timezone
    timezoneId: 'America/Sao_Paulo',
    
    // Viewport padrão
    viewport: { width: 1280, height: 720 },
    
    // Ignorar erros HTTPS
    ignoreHTTPSErrors: true,
    
    // Headers globais
    extraHTTPHeaders: {
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
    }
  },

  // Configuração de projetos para diferentes browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    }
  ],

  // Servidor de desenvolvimento para testes
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 5173,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test'
    }
  },

  // Timeout global
  timeout: 30000,
  expect: {
    // Timeout para expects
    timeout: 5000
  },

  // Setup global
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),

  // Configurações específicas de teste
  testIgnore: [
    '**/*.skip.spec.ts',
    '**/*.todo.spec.ts'
  ],

  // Metadata
  metadata: {
    'test-type': 'e2e',
    'app-version': process.env.npm_package_version || 'unknown'
  },

  // Output directory
  outputDir: 'test-results/',
});
