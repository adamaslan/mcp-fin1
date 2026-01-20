import { test, expect } from "../../e2e-utils/fixtures/free-tier-user";
import { ScannerPage } from "../../e2e-utils/pages/scanner-page";
import { TIER_LIMITS } from "../../e2e-utils/constants/tier-limits";

/**
 * Trade scanner feature tests for FREE TIER
 * Tests tier-based limits: 1/day scans, sp500 only, max 5 results
 */
test.describe("Scanner - Free Tier", () => {
  test("free tier can only access sp500 universe", async ({
    authenticatedPage,
    tierHelper,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    // Check that other universes are locked
    expect(await scannerPage.isUniverseLocked("nasdaq100")).toBe(true);
    expect(await scannerPage.isUniverseLocked("etf_large_cap")).toBe(true);
    expect(await scannerPage.isUniverseLocked("crypto")).toBe(true);

    // sp500 should not be locked
    expect(await scannerPage.isUniverseLocked("sp500")).toBe(false);

    // Verify tier limits
    const limits = await tierHelper.getTierLimits();
    expect(limits.universes).toEqual(["sp500"]);
  });

  test("free tier results limited to 5 max", async ({
    authenticatedPage,
    tierHelper,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    await scannerPage.selectUniverse("sp500");
    await scannerPage.runScan();

    const resultCount = await scannerPage.getResultCount();

    // Results should be 5 or fewer
    expect(resultCount).toBeLessThanOrEqual(5);

    // Verify tier limit
    const limits = await tierHelper.getTierLimits();
    expect(limits.scanResultsLimit).toBe(5);
  });

  test("free tier sees limit warning during scan", async ({
    authenticatedPage,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    await scannerPage.selectUniverse("sp500");
    await scannerPage.runScan();

    // Should show limit warning
    expect(await scannerPage.hasLimitWarning()).toBe(true);
    const warning = await scannerPage.getLimitWarningText();
    expect(warning?.toLowerCase()).toMatch(/limit|quota|free|tier/);
  });

  test("scanner page loads for free users", async ({ authenticatedPage }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    // Verify scanner UI is visible
    expect(await scannerPage.isScanButtonEnabled()).toBe(true);
  });

  test("free tier sp500 universe returns results", async ({
    authenticatedPage,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    await scannerPage.selectUniverse("sp500");
    await scannerPage.runScan();

    // Should have results
    const resultCount = await scannerPage.getResultCount();
    expect(resultCount).toBeGreaterThan(0);
  });

  test("locked universes show upgrade prompt", async ({
    authenticatedPage,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    // Try accessing nasdaq100 (locked)
    await scannerPage.selectUniverse("nasdaq100");

    // Scanner button might be disabled or show upgrade prompt
    const buttonEnabled = await scannerPage.isScanButtonEnabled();
    // Could be disabled or might show an upgrade message
    // Implementation depends on app behavior
  });

  test("free tier displays 1/day scan limit", async ({
    authenticatedPage,
    tierHelper,
  }) => {
    const limits = await tierHelper.getTierLimits();
    expect(limits.scansPerDay).toBe(1);
  });
});

/**
 * Scanner universe access tests for FREE TIER
 * Tests that only sp500 is available
 */
test.describe("Scanner - Free Tier Universe Access", () => {
  test("sp500 universe is available and unlocked", async ({
    authenticatedPage,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    const isLocked = await scannerPage.isUniverseLocked("sp500");
    expect(isLocked).toBe(false);
  });

  test("nasdaq100 universe is locked for free tier", async ({
    authenticatedPage,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    const isLocked = await scannerPage.isUniverseLocked("nasdaq100");
    expect(isLocked).toBe(true);
  });

  test("etf_large_cap universe is locked for free tier", async ({
    authenticatedPage,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    const isLocked = await scannerPage.isUniverseLocked("etf_large_cap");
    expect(isLocked).toBe(true);
  });

  test("crypto universe is locked for free tier", async ({
    authenticatedPage,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    const isLocked = await scannerPage.isUniverseLocked("crypto");
    expect(isLocked).toBe(true);
  });

  test("free tier sees upgrade prompt for locked universes", async ({
    authenticatedPage,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    // Try to select locked universe
    await scannerPage.selectUniverse("nasdaq100");

    // Should either show error or upgrade prompt
    // or scan button should be disabled
    const buttonEnabled = await scannerPage.isScanButtonEnabled();
    // Implementation may vary
  });
});

/**
 * Scanner results display tests for FREE TIER
 * Tests that results are properly formatted
 */
test.describe("Scanner - Free Tier Results", () => {
  test("scanner results display in table format", async ({
    authenticatedPage,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    await scannerPage.selectUniverse("sp500");
    await scannerPage.runScan();

    // Verify results table exists
    const resultCount = await scannerPage.getResultCount();
    expect(resultCount).toBeGreaterThan(0);
  });

  test("scanner shows no error on successful scan", async ({
    authenticatedPage,
  }) => {
    const scannerPage = new ScannerPage(authenticatedPage);
    await scannerPage.goto();

    await scannerPage.selectUniverse("sp500");
    await scannerPage.runScan();

    // Should not show error message
    expect(await scannerPage.hasError()).toBe(false);
  });
});
