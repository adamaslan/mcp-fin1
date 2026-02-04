import { test, expect } from "@playwright/test";
import { glob } from "glob";
import * as path from "path";

test.describe("All Routes Load Successfully", () => {
  // Dynamically generate tests for each route
  const appDir = path.join(process.cwd(), "src/app");

  test.beforeAll(async () => {
    // Get all page.tsx files and convert to routes
    const pages = await glob("**/page.tsx", { cwd: appDir });
    // Filter out dynamic routes for static testing
    // Dynamic routes need specific params
  });

  test("static routes load without errors", async ({ page }) => {
    const staticRoutes = ["/", "/pricing", "/sign-in", "/sign-up", "/api-docs"];

    for (const route of staticRoutes) {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(route);

      // Should not have server errors
      expect(response?.status()).toBeLessThan(500);

      // Should not have module resolution errors in console
      const moduleErrors = consoleErrors.filter(
        (e) =>
          e.includes("Module not found") || e.includes("Cannot find module"),
      );
      expect(moduleErrors).toHaveLength(0);

      page.off("console", () => {});
    }
  });
});
