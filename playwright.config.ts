import { defineConfig, devices } from '@playwright/test';

const htmlOpenMode = process.env.PLAYWRIGHT_HTML_OPEN ?? 'never';

/**
 * Playwright configuration for e2e tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './scripts/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list', { printSteps: true }],
    ['html', { open: htmlOpenMode }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], headless: true },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], headless: true },
    },
  ],

  /* Run dev server before starting the tests */
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
