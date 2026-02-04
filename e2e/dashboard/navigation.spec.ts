import { test, expect } from "../fixtures/authenticated-user";

test.describe("Dashboard Navigation", () => {
  const dashboardRoutes = [
    { path: "/dashboard", name: "Main Dashboard" },
    { path: "/scanner", name: "Scanner" },
    { path: "/watchlist", name: "Watchlist" },
    { path: "/portfolio", name: "Portfolio" },
    { path: "/morning-brief", name: "Morning Brief" },
    { path: "/alerts", name: "Alerts" },
    { path: "/calendar", name: "Calendar" },
    { path: "/compare", name: "Compare" },
    { path: "/export", name: "Export" },
    { path: "/fibonacci", name: "Fibonacci" },
    { path: "/journal", name: "Journal" },
    { path: "/learn/indicators", name: "Learn Indicators" },
    { path: "/learn/signals", name: "Learn Signals" },
    { path: "/news", name: "News" },
    { path: "/options", name: "Options" },
    { path: "/settings", name: "Settings" },
    { path: "/signals", name: "Signals" },
  ];

  for (const route of dashboardRoutes) {
    test(`${route.name} (${route.path}) loads without errors`, async ({
      authenticatedPage,
    }) => {
      const errors: string[] = [];

      authenticatedPage.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      const response = await authenticatedPage.goto(route.path);

      // Should not return server error
      expect(response?.status()).toBeLessThan(500);

      // Should not have critical JS errors
      const criticalErrors = errors.filter(
        (e) =>
          e.includes("Module not found") ||
          e.includes("page mismatch") ||
          e.includes("Cannot read properties of undefined"),
      );

      expect(criticalErrors).toHaveLength(0);
    });
  }

  test("sidebar navigation links work correctly", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/dashboard");

    // Find sidebar navigation
    const navLinks = authenticatedPage.locator("nav a, aside a");
    const linkCount = await navLinks.count();

    // Test first few navigation links
    for (let i = 0; i < Math.min(5, linkCount); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute("href");

      if (href && href.startsWith("/") && !href.includes("sign")) {
        await link.click();
        await authenticatedPage.waitForLoadState("networkidle");

        // Should navigate without error
        expect(authenticatedPage.url()).toContain(href);

        // Go back to dashboard
        await authenticatedPage.goto("/dashboard");
      }
    }
  });
});
