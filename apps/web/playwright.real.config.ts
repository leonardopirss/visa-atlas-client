import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/real-e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    env: {
      VITE_API_PROXY_TARGET:
        process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:3001',
    },
  },
});
