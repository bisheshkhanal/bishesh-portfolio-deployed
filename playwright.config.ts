import { defineConfig, devices } from '@playwright/test';

declare const process: {
  env: {
    CI?: string;
  };
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      testMatch: /e2e\/.*\.spec\.ts/,
      testIgnore: [/@reduced-motion/],
      grep: /@desktop/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-gl=swiftshader',
            '--use-angle=swiftshader',
            '--disable-gpu-compositing',
            '--enable-webgl',
          ],
        },
      },
    },
    {
      name: 'reduced-motion',
      testMatch: /e2e\/.*\.spec\.ts/,
      testIgnore: [/@desktop/],
      grep: /@reduced-motion/,
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          reducedMotion: 'reduce',
        },
        launchOptions: {
          args: [
            '--use-gl=swiftshader',
            '--use-angle=swiftshader',
            '--disable-gpu-compositing',
            '--enable-webgl',
          ],
        },
      },
    },
  ],
  webServer: {
    command: 'npm run build && node ./node_modules/vite/bin/vite.js preview --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
