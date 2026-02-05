import { test, expect } from "@playwright/test";

test.describe("Extended Production Smoke Tests", () => {
  test("no runtime JavaScript errors on key pages", async ({ page }) => {
    const jsErrors: string[] = [];

    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    const criticalPages = ["/", "/pricing", "/sign-in"];

    for (const route of criticalPages) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
    }

    // Filter out known acceptable errors (if any)
    const criticalErrors = jsErrors.filter(
      (e) => !e.includes("ResizeObserver"), // Known benign error
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("core dependencies load correctly", async ({ page }) => {
    const failedResources: string[] = [];

    page.on("response", (response) => {
      if (response.status() >= 400) {
        const url = response.url();
        if (
          url.includes("_next/") ||
          url.includes(".js") ||
          url.includes(".css")
        ) {
          failedResources.push(`${response.status()}: ${url}`);
        }
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(failedResources).toHaveLength(0);
  });
});
