import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests require the full stack to be running:
 *   docker compose up -d postgres
 *   npm run prisma:migrate:deploy
 *   npm run dev:api
 *   npm run dev:speech
 *   npm run dev:web
 *
 * Then run: npm run test:e2e -w @ainterview/web
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO, 10) : 0,
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
