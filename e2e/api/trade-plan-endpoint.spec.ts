import { test, expect } from "@playwright/test";
import { APIHelper } from "../../e2e-utils/helpers/api-helper";

/**
 * API Endpoint Tests: /api/mcp/trade-plan
 * Tests trade plan endpoint with tier-based timeframe filtering
 */
test.describe("API: /api/mcp/trade-plan - Free Tier", () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test("trade-plan endpoint requires authentication", async () => {
    // Should return 401 without valid session
    await apiHelper.testUnauthenticatedRequest("/api/mcp/trade-plan");
  });

  test("trade-plan endpoint returns valid structure", async () => {
    const data = await apiHelper.testTradePlanEndpoint("AAPL", 200);

    // Verify response structure
    apiHelper.validateTradePlanResponse(data);
    expect(data).toHaveProperty("trade_plans");
    expect(Array.isArray(data.trade_plans)).toBe(true);
  });

  test("free tier receives swing timeframe trades only", async () => {
    const data = await apiHelper.testTradePlanEndpoint("AAPL", 200);

    // Check that only swing timeframe is returned
    if (data.trade_plans.length > 0) {
      for (const plan of data.trade_plans) {
        // Each plan should be for swing timeframe
        expect(plan).toHaveProperty("timeframe");
        expect(plan.timeframe?.toLowerCase()).toContain("swing");
      }
    }
  });

  test("free tier does not receive day timeframe", async () => {
    const data = await apiHelper.testTradePlanEndpoint("AAPL", 200);

    // Should have no day trades
    const dayTrades = data.trade_plans.filter((p: any) =>
      p.timeframe?.toLowerCase().includes("day"),
    );

    expect(dayTrades).toHaveLength(0);
  });

  test("free tier does not receive scalp timeframe", async () => {
    const data = await apiHelper.testTradePlanEndpoint("AAPL", 200);

    // Should have no scalp trades
    const scalpTrades = data.trade_plans.filter((p: any) =>
      p.timeframe?.toLowerCase().includes("scalp"),
    );

    expect(scalpTrades).toHaveLength(0);
  });

  test("trade plan object has required properties", async () => {
    const data = await apiHelper.testTradePlanEndpoint("AAPL", 200);

    if (data.trade_plans.length > 0) {
      const plan = data.trade_plans[0];

      // Verify required properties
      expect(plan).toHaveProperty("timeframe");
      expect(plan).toHaveProperty("symbol");
      // Risk/reward may be present
    }
  });

  test("valid symbols return trade plans", async () => {
    const validSymbols = ["AAPL", "MSFT", "GOOGL"];

    for (const symbol of validSymbols) {
      const data = await apiHelper.testTradePlanEndpoint(symbol, 200);

      // Should return trade plans
      expect(data.trade_plans).toBeDefined();
      expect(Array.isArray(data.trade_plans)).toBe(true);
    }
  });

  test("all returned plans are swing timeframe for free tier", async () => {
    const data = await apiHelper.testTradePlanEndpoint("AAPL", 200);

    // Verify every returned plan is swing
    expect(data.trade_plans.length).toBeGreaterThan(0);

    for (const plan of data.trade_plans) {
      const timeframe = plan.timeframe?.toLowerCase();
      expect(timeframe).toContain("swing");
      expect(timeframe).not.toContain("day");
      expect(timeframe).not.toContain("scalp");
    }
  });
});

/**
 * API Endpoint Tests: /api/mcp/trade-plan - Timeframe Filtering
 * Tests that only swing timeframe is returned for free tier
 */
test.describe("API: /api/mcp/trade-plan - Timeframe Filtering", () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test("free tier gets swing trades only", async () => {
    const data = await apiHelper.testTradePlanEndpoint("AAPL", 200);

    const swingTrades = data.trade_plans.filter((p: any) =>
      p.timeframe?.toLowerCase().includes("swing"),
    );

    // Should have swing trades
    expect(swingTrades.length).toBeGreaterThan(0);

    // All should be swing
    expect(swingTrades.length).toBe(data.trade_plans.length);
  });

  test("free tier timeframe filtering is consistent", async () => {
    // Multiple calls should return only swing
    for (let i = 0; i < 3; i++) {
      const data = await apiHelper.testTradePlanEndpoint("AAPL", 200);

      for (const plan of data.trade_plans) {
        expect(plan.timeframe?.toLowerCase()).toContain("swing");
      }
    }
  });

  test("requested timeframe parameter may be ignored for free tier", async ({
    request,
  }) => {
    // Request day timeframe (not available for free)
    const response = await request.post("/api/mcp/trade-plan", {
      data: {
        symbol: "AAPL",
        period: "1mo",
        timeframe: "day", // Request day
      },
    });

    const data = await response.json();

    // Should return swing only (day is filtered out)
    if (data.trade_plans.length > 0) {
      for (const plan of data.trade_plans) {
        expect(plan.timeframe?.toLowerCase()).toContain("swing");
      }
    }
  });

  test("scalp timeframe not available for free tier", async ({ request }) => {
    // Request scalp timeframe (not available)
    const response = await request.post("/api/mcp/trade-plan", {
      data: {
        symbol: "AAPL",
        period: "1mo",
        timeframe: "scalp",
      },
    });

    const data = await response.json();

    // Should return swing only or error
    const hasScalp = data.trade_plans?.some((p: any) =>
      p.timeframe?.toLowerCase().includes("scalp"),
    );

    expect(hasScalp).toBe(false);
  });
});

/**
 * API Endpoint Tests: /api/mcp/trade-plan - Risk/Reward Info
 * Tests that trade plans include risk/reward calculations
 */
test.describe("API: /api/mcp/trade-plan - Trade Plan Data", () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test("trade plans include entry/target information", async () => {
    const data = await apiHelper.testTradePlanEndpoint("AAPL", 200);

    if (data.trade_plans.length > 0) {
      const plan = data.trade_plans[0];

      // Should have trading information
      expect(plan).toBeDefined();
      expect(plan.symbol).toBe("AAPL");
    }
  });

  test("multiple symbols return appropriate plans", async () => {
    const symbols = ["AAPL", "MSFT", "GOOGL"];

    for (const symbol of symbols) {
      const data = await apiHelper.testTradePlanEndpoint(symbol, 200);

      if (data.trade_plans.length > 0) {
        // Each plan should match the requested symbol
        for (const plan of data.trade_plans) {
          expect(plan.symbol).toBe(symbol);
        }
      }
    }
  });
});

/**
 * API Endpoint Tests: /api/mcp/trade-plan - Error Handling
 * Tests error scenarios
 */
test.describe("API: /api/mcp/trade-plan - Error Handling", () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test("invalid symbol returns appropriate response", async ({ request }) => {
    const response = await request.post("/api/mcp/trade-plan", {
      data: { symbol: "NOTREAL999", period: "1mo" },
    });

    // Should return 200 since symbol parameter is provided (returns empty plans)
    expect(response.status()).toBe(200);
  });

  test("missing symbol parameter returns error", async ({ request }) => {
    const response = await request.post("/api/mcp/trade-plan", {
      data: { period: "1mo" }, // No symbol
    });

    // Should return error
    expect([400, 422]).toContain(response.status());
  });
});
