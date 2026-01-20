import { defineConfig, devices } from "@playwright/test";

/**
 * Production testing configuration for live environment
 *
 * Use with: npx playwright test -c playwright.config.production.ts
 *
 * Safety guidelines:
 * - Only runs smoke tests (read-only operations)
 * - No test data creation or modification
 * - Safe to run against live production site
 * - More retries (3) for stability
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/{smoke-tests,critical-paths}.spec.ts",

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3,
  workers: 1,

  // Reporting
  reporter: [["html"], ["list"], ["github"]],

  // Production environment
  use: {
    baseURL:
      "https://nextjs-mcp-finance-5xperl24v-adam-aslans-projects.vercel.app",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // Test timeout - longer for potential latency
  timeout: 45 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  // Browser projects - chromium only for production
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // No web server for production testing
  webServer: undefined,
});
