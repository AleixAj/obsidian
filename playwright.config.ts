import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests: a real browser uses the shop and the admin panel,
 * talking to the real Laravel API (not mocks).
 *
 * Run them with:  npm run e2e
 * They need the API folder next to this one (../obsidian-api), or
 * API_DIR pointing to it. Both servers are started automatically.
 */
const apiDir = process.env.API_DIR ?? "../obsidian-api";

export default defineConfig({
  testDir: "./e2e",
  // ".e2e.ts" so Vitest (unit tests) doesn't try to run these files.
  testMatch: "**/*.e2e.ts",
  // The tests share the same demo data, so they run one after another.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // On your computer it uses the Chrome you already have installed.
        // CI downloads Playwright's own Chromium (npx playwright install).
        channel: process.env.CI ? undefined : "chrome",
      },
    },
  ],

  webServer: [
    {
      command: "php artisan serve --port=8000",
      cwd: apiDir,
      url: "http://localhost:8000/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
