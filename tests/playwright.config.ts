import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'results.xml' }],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL:
      process.env.BASE_URL ||
      'http://localhost:8081/compliment-tal-fellner-reich-kadmon-kokotek/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
