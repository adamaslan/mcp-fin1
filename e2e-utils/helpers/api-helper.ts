import { APIRequestContext, expect } from '@playwright/test';

/**
 * Helper class for testing API endpoints
 * Provides methods to test MCP endpoints and validate tier-based access control
 */
export class APIHelper {
  constructor(private request: APIRequestContext) {}

  /**
   * Test /api/mcp/analyze endpoint
   * Tests analysis functionality with tier-based signal filtering
   */
  async testAnalyzeEndpoint(
    symbol: string = 'AAPL',
    expectedStatus: number = 200,
  ): Promise<any> {
    const response = await this.request.post('/api/mcp/analyze', {
      data: { symbol, period: '1mo', useAi: false },
    });

    expect(response.status()).toBe(expectedStatus);

    if (expectedStatus === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('signals');
      return data;
    }

    return null;
  }

  /**
   * Test /api/mcp/scan endpoint
   * Tests scanner functionality with tier-based universe and result limits
   */
  async testScanEndpoint(
    universe: string = 'sp500',
    expectedStatus: number = 200,
  ): Promise<any> {
    const response = await this.request.post('/api/mcp/scan', {
      data: { universe, maxResults: 10 },
    });

    expect(response.status()).toBe(expectedStatus);

    if (expectedStatus === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('qualified_trades');
      return data;
    }

    return null;
  }

  /**
   * Test /api/mcp/trade-plan endpoint
   * Tests trade plan generation with timeframe filtering
   */
  async testTradePlanEndpoint(
    symbol: string = 'AAPL',
    expectedStatus: number = 200,
  ): Promise<any> {
    const response = await this.request.post('/api/mcp/trade-plan', {
      data: { symbol, period: '1mo' },
    });

    expect(response.status()).toBe(expectedStatus);

    if (expectedStatus === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('trade_plans');
      return data;
    }

    return null;
  }

  /**
   * Test endpoint without authentication
   * Should return 401 Unauthorized
   */
  async testUnauthenticatedRequest(endpoint: string): Promise<any> {
    const response = await this.request.post(endpoint, {
      data: { symbol: 'AAPL' },
    });

    // Should return 401 Unauthorized without valid auth
    expect(response.status()).toBe(401);

    return await response.json();
  }

  /**
   * Test /api/mcp/portfolio-risk endpoint
   * Tests portfolio risk analysis (pro+ feature)
   */
  async testPortfolioRiskEndpoint(expectedStatus: number = 200): Promise<any> {
    const response = await this.request.post('/api/mcp/portfolio-risk', {
      data: {
        positions: [
          { symbol: 'AAPL', quantity: 10, entryPrice: 150 },
          { symbol: 'MSFT', quantity: 5, entryPrice: 350 },
        ],
      },
    });

    expect(response.status()).toBe(expectedStatus);

    if (expectedStatus === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('aggregate_risk');
      return data;
    }

    return null;
  }

  /**
   * Test /api/alerts endpoint
   * Tests alerts CRUD (max-only feature)
   */
  async testAlertsEndpoint(method: 'GET' | 'POST' = 'GET', expectedStatus: number = 200): Promise<any> {
    let response;

    if (method === 'GET') {
      response = await this.request.get('/api/alerts');
    } else {
      response = await this.request.post('/api/alerts', {
        data: {
          symbol: 'AAPL',
          priceTarget: 150,
          condition: 'above',
        },
      });
    }

    expect(response.status()).toBe(expectedStatus);

    if (expectedStatus === 200) {
      return await response.json();
    }

    return null;
  }

  /**
   * Validate response has expected structure
   */
  validateAnalyzeResponse(data: any): void {
    expect(data).toHaveProperty('signals');
    expect(data).toHaveProperty('tierLimit');
    expect(Array.isArray(data.signals)).toBe(true);
  }

  /**
   * Validate scan response has expected structure
   */
  validateScanResponse(data: any): void {
    expect(data).toHaveProperty('qualified_trades');
    expect(Array.isArray(data.qualified_trades)).toBe(true);
  }

  /**
   * Validate trade plan response has expected structure
   */
  validateTradePlanResponse(data: any): void {
    expect(data).toHaveProperty('trade_plans');
    expect(Array.isArray(data.trade_plans)).toBe(true);
  }
}
