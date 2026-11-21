import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';

const localChromium = '/usr/bin/chromium';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /\.setup\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: fs.existsSync(localChromium)
          ? { executablePath: localChromium }
          : undefined,
      },
    },
  ],
});
