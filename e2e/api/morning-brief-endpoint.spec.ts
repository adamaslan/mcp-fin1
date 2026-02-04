import { test, expect, APIRequestContext } from "@playwright/test";

test.describe("API: /api/mcp/morning-brief", () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test("morning-brief endpoint requires authentication", async () => {
    const response = await apiContext.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response.status()).toBe(401);
  });

  test("morning-brief returns valid structure", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY", "QQQ"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    // Verify structure
    expect(data).toHaveProperty("market_status");
    expect(data).toHaveProperty("economic_events");
    expect(data).toHaveProperty("watchlist_signals");
    expect(data).toHaveProperty("sector_leaders");
    expect(data).toHaveProperty("sector_losers");
    expect(data).toHaveProperty("key_themes");
    expect(data).toHaveProperty("timestamp");
  });

  test("market_status has required fields", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    const status = data.market_status;

    expect(status).toHaveProperty("market_status");
    expect(status).toHaveProperty("current_time");
    expect(status).toHaveProperty("futures_es");
    expect(status).toHaveProperty("futures_nq");
    expect(status).toHaveProperty("vix");

    expect(["OPEN", "CLOSED", "PRE_MARKET", "AFTER_HOURS"]).toContain(
      status.market_status,
    );
  });

  test("economic_events is an array", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.economic_events)).toBe(true);

    // If events exist, verify structure
    if (data.economic_events.length > 0) {
      const event = data.economic_events[0];
      expect(event).toHaveProperty("timestamp");
      expect(event).toHaveProperty("event_name");
      expect(event).toHaveProperty("importance");
      expect(["HIGH", "MEDIUM", "LOW"]).toContain(event.importance);
    }
  });

  test("watchlist_signals is an array", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY", "QQQ", "AAPL"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.watchlist_signals)).toBe(true);
    expect(data.watchlist_signals.length).toBeGreaterThan(0);

    // Verify signal structure
    const signal = data.watchlist_signals[0];
    expect(signal).toHaveProperty("symbol");
    expect(signal).toHaveProperty("price");
    expect(signal).toHaveProperty("change_percent");
    expect(signal).toHaveProperty("action");
    expect(["BUY", "HOLD", "AVOID"]).toContain(signal.action);
  });

  test("sector_leaders and sector_losers are arrays", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.sector_leaders)).toBe(true);
    expect(Array.isArray(data.sector_losers)).toBe(true);

    // Verify structure if data exists
    if (data.sector_leaders.length > 0) {
      const leader = data.sector_leaders[0];
      expect(leader).toHaveProperty("sector");
      expect(leader).toHaveProperty("change_percent");
    }
  });

  test("key_themes is an array", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.key_themes)).toBe(true);
  });

  test("use_ai parameter works correctly", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: true,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    // If tier allows AI, ai_analysis should be present (when enabled)
    if (data.tierLimit?.ai === true) {
      expect(data).toHaveProperty("ai_analysis");
    }
  });

  test("free tier cannot access AI analysis", async ({ request }) => {
    // This test assumes authenticated user is on free tier
    // The response should not include ai_analysis even if use_ai: true
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: true,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    // If tierLimit.ai is false, ai_analysis should not be in response
    if (data.tierLimit?.ai === false) {
      expect(data.ai_analysis).toBeUndefined();
    }
  });

  test("handles empty symbols array", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: [],
        region: "US",
        use_ai: false,
      },
    });

    // Should return 400 (validation error)
    expect([400, 422]).toContain(response.status());
  });

  test("uses default symbols when not provided", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        region: "US",
        use_ai: false,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    // Should have watchlist signals from default symbols
    expect(Array.isArray(data.watchlist_signals)).toBe(true);
  });

  test("returns tierLimit info", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty("tierLimit");
    expect(data.tierLimit).toHaveProperty("ai");
    expect(typeof data.tierLimit.ai).toBe("boolean");
  });

  test("invalid region still returns data", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "INVALID_REGION",
        use_ai: false,
      },
    });

    // Should either accept region or use default
    expect([200, 400]).toContain(response.status());
  });

  test("timestamps are valid ISO format", async ({ request }) => {
    const response = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    // Main timestamp
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    // Market status timestamp
    expect(data.market_status.current_time).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    // Economic event timestamps
    if (data.economic_events.length > 0) {
      data.economic_events.forEach((event: any) => {
        expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });
    }
  });

  test("API response is consistent across calls", async ({ request }) => {
    const response1 = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response1.status()).toBe(200);
    const data1 = await response1.json();

    const response2 = await request.post("/api/mcp/morning-brief", {
      data: {
        symbols: ["SPY"],
        region: "US",
        use_ai: false,
      },
    });

    expect(response2.status()).toBe(200);
    const data2 = await response2.json();

    // Structure should be consistent
    expect(Object.keys(data1).sort()).toEqual(Object.keys(data2).sort());
    expect(data1.watchlist_signals.length).toEqual(
      data2.watchlist_signals.length,
    );
  });
});
