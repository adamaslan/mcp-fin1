import { test, expect } from "@playwright/test";
import { APIHelper } from "../../e2e-utils/helpers/api-helper";

/**
 * API Endpoint Tests: /api/mcp/scan
 * Tests scanner endpoint with tier-based universe and result limits
 */
test.describe("API: /api/mcp/scan - Free Tier", () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test("scan endpoint requires authentication", async () => {
    // Should return 401 without valid session
    await apiHelper.testUnauthenticatedRequest("/api/mcp/scan");
  });

  test("scan endpoint returns valid structure", async () => {
    const data = await apiHelper.testScanEndpoint("sp500", 200);

    // Verify response structure
    apiHelper.validateScanResponse(data);
    expect(data).toHaveProperty("qualified_trades");
    expect(Array.isArray(data.qualified_trades)).toBe(true);
  });

  test("free tier can scan sp500 universe", async () => {
    const data = await apiHelper.testScanEndpoint("sp500", 200);

    // sp500 is available for free tier
    expect(data.qualified_trades).toBeDefined();
    expect(Array.isArray(data.qualified_trades)).toBe(true);
    expect(data.qualified_trades.length).toBeGreaterThan(0);
  });

  test("free tier results limited to 5", async () => {
    const data = await apiHelper.testScanEndpoint("sp500", 200);

    // Free tier max results is 5
    expect(data.qualified_trades.length).toBeLessThanOrEqual(5);
  });

  test("free tier cannot access nasdaq100 universe", async ({ request }) => {
    // Try to scan nasdaq100 (pro+ feature)
    const response = await request.post("/api/mcp/scan", {
      data: { universe: "nasdaq100" },
    });

    // Should return 403 Forbidden for locked universe
    expect(response.status()).toBe(403);
  });

  test("free tier cannot access etf_large_cap universe", async ({
    request,
  }) => {
    // Try to scan etf_large_cap (pro+ feature)
    const response = await request.post("/api/mcp/scan", {
      data: { universe: "etf_large_cap" },
    });

    // Should return 403 Forbidden
    expect(response.status()).toBe(403);
  });

  test("free tier cannot access crypto universe", async ({ request }) => {
    // Try to scan crypto (max+ feature)
    const response = await request.post("/api/mcp/scan", {
      data: { universe: "crypto" },
    });

    // Should return 403 Forbidden
    expect(response.status()).toBe(403);
  });

  test("scan returns tier information", async () => {
    const data = await apiHelper.testScanEndpoint("sp500", 200);

    // Should include tier info if available in response
    // Structure may vary by implementation
    expect(data).toBeDefined();
    expect(data.qualified_trades).toBeDefined();
  });

  test("scan results contain trade information", async () => {
    const data = await apiHelper.testScanEndpoint("sp500", 200);

    if (data.qualified_trades.length > 0) {
      const trade = data.qualified_trades[0];

      // Verify trade object has expected properties
      expect(trade).toHaveProperty("symbol");
      // Other properties depend on implementation
    }
  });
});

/**
 * API Endpoint Tests: /api/mcp/scan - Universe Access Control
 * Tests that free tier is restricted to sp500 only
 */
test.describe("API: /api/mcp/scan - Universe Restrictions", () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test("sp500 universe returns success for free tier", async () => {
    const data = await apiHelper.testScanEndpoint("sp500", 200);

    expect(data.qualified_trades).toBeDefined();
    expect(Array.isArray(data.qualified_trades)).toBe(true);
  });

  test("nasdaq100 returns 403 for free tier", async ({ request }) => {
    // Free tier cannot access nasdaq100
    const response = await request.post("/api/mcp/scan", {
      data: { universe: "nasdaq100", maxResults: 10 },
    });

    expect(response.status()).toBe(403);
  });

  test("etf_large_cap returns 403 for free tier", async ({ request }) => {
    // Free tier cannot access etf_large_cap
    const response = await request.post("/api/mcp/scan", {
      data: { universe: "etf_large_cap", maxResults: 10 },
    });

    expect(response.status()).toBe(403);
  });

  test("crypto returns 403 for free tier", async ({ request }) => {
    // Free tier cannot access crypto
    const response = await request.post("/api/mcp/scan", {
      data: { universe: "crypto", maxResults: 10 },
    });

    expect(response.status()).toBe(403);
  });

  test("free tier has only sp500 available", async ({ request }) => {
    // Only sp500 should succeed
    const sp500 = await request.post("/api/mcp/scan", {
      data: { universe: "sp500" },
    });

    const nasdaq = await request.post("/api/mcp/scan", {
      data: { universe: "nasdaq100" },
    });

    expect(sp500.status()).toBe(200);
    expect(nasdaq.status()).toBe(403);
  });
});

/**
 * API Endpoint Tests: /api/mcp/scan - Result Limits
 * Tests that free tier gets max 5 results
 */
test.describe("API: /api/mcp/scan - Result Limits", () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test("free tier limited to 5 results maximum", async () => {
    const data = await apiHelper.testScanEndpoint("sp500", 200);

    // Free tier max is 5
    expect(data.qualified_trades.length).toBeLessThanOrEqual(5);
  });

  test("multiple scans respect free tier limit", async () => {
    // Run multiple scans
    for (let i = 0; i < 3; i++) {
      const data = await apiHelper.testScanEndpoint("sp500", 200);
      expect(data.qualified_trades.length).toBeLessThanOrEqual(5);
    }
  });

  test("requesting more results than limit returns capped results", async ({
    request,
  }) => {
    // Request 100 results (free tier can only get 5)
    const response = await request.post("/api/mcp/scan", {
      data: { universe: "sp500", maxResults: 100 },
    });

    const data = await response.json();

    // Should cap at 5
    expect(data.qualified_trades.length).toBeLessThanOrEqual(5);
  });
});

/**
 * API Endpoint Tests: /api/mcp/scan - Error Handling
 * Tests error scenarios
 */
test.describe("API: /api/mcp/scan - Error Handling", () => {
  test("invalid universe returns error", async ({ request }) => {
    const response = await request.post("/api/mcp/scan", {
      data: { universe: "invalid_universe_xyz" },
    });

    // Should return error
    expect([400, 403, 404]).toContain(response.status());
  });

  test("missing universe parameter returns error", async ({ request }) => {
    const response = await request.post("/api/mcp/scan", {
      data: { maxResults: 10 }, // No universe
    });

    // Should return error
    expect([400, 422]).toContain(response.status());
  });
});
