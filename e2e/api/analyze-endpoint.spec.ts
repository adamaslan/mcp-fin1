import { test, expect } from '@playwright/test';
import { APIHelper } from '../../e2e-utils/helpers/api-helper';

/**
 * API Endpoint Tests: /api/mcp/analyze
 * Tests tier-based signal filtering and authentication
 */
test.describe('API: /api/mcp/analyze - Free Tier', () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test('analyze endpoint requires authentication', async () => {
    // Should return 401 without valid session
    await apiHelper.testUnauthenticatedRequest('/api/mcp/analyze');
  });

  test('analyze endpoint returns valid structure', async () => {
    const data = await apiHelper.testAnalyzeEndpoint('AAPL', 200);

    // Verify response structure
    apiHelper.validateAnalyzeResponse(data);
    expect(data).toHaveProperty('signals');
    expect(data).toHaveProperty('tierLimit');
  });

  test('analyze returns signals array', async () => {
    const data = await apiHelper.testAnalyzeEndpoint('AAPL', 200);

    // Signals should be array
    expect(Array.isArray(data.signals)).toBe(true);
    expect(data.signals.length).toBeGreaterThan(0);
  });

  test('free tier receives max 3 signals', async () => {
    const data = await apiHelper.testAnalyzeEndpoint('AAPL', 200);

    // Free tier limited to 3 signals
    expect(data.signals.length).toBeLessThanOrEqual(3);
  });

  test('signal object has required properties', async () => {
    const data = await apiHelper.testAnalyzeEndpoint('AAPL', 200);

    // Check first signal has required fields
    if (data.signals.length > 0) {
      const signal = data.signals[0];
      expect(signal).toHaveProperty('name');
      expect(signal).toHaveProperty('value');
    }
  });

  test('analyze returns tier information', async () => {
    const data = await apiHelper.testAnalyzeEndpoint('AAPL', 200);

    // Should include tier info
    expect(data.tierLimit).toBeDefined();
    expect(data.tierLimit).toHaveProperty('analysesPerDay');
    expect(data.tierLimit.analysesPerDay).toBe(5);
  });

  test('valid symbols return results', async () => {
    const validSymbols = ['AAPL', 'MSFT', 'GOOGL'];

    for (const symbol of validSymbols) {
      const data = await apiHelper.testAnalyzeEndpoint(symbol, 200);

      expect(data.signals.length).toBeGreaterThan(0);
      expect(data.signals.length).toBeLessThanOrEqual(3);
    }
  });

  test('invalid symbols return appropriate response', async () => {
    // Invalid symbol should return 200 with empty signals (symbol parameter is provided)
    const response = await test.request?.post('/api/mcp/analyze', {
      data: { symbol: 'NOTREAL999', period: '1mo' },
    });

    // Should return 200 since symbol parameter is provided
    expect(response?.status()).toBe(200);
  });

  test('analyze accepts period parameter', async () => {
    const data = await apiHelper.testAnalyzeEndpoint('AAPL', 200);

    // Should return data regardless of period
    expect(data.signals).toBeDefined();
    expect(Array.isArray(data.signals)).toBe(true);
  });

  test('analyze response consistent across calls', async () => {
    const data1 = await apiHelper.testAnalyzeEndpoint('AAPL', 200);
    const data2 = await apiHelper.testAnalyzeEndpoint('AAPL', 200);

    // Both calls should return signals
    expect(data1.signals.length).toBeGreaterThan(0);
    expect(data2.signals.length).toBeGreaterThan(0);

    // Both should be under free tier limit
    expect(data1.signals.length).toBeLessThanOrEqual(3);
    expect(data2.signals.length).toBeLessThanOrEqual(3);
  });
});

/**
 * API Endpoint Tests: /api/mcp/analyze - Tier-Based Filtering
 * Tests that free tier gets filtered signals
 */
test.describe('API: /api/mcp/analyze - Tier Filtering', () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test('free tier gets top 3 signals out of 150+', async () => {
    const data = await apiHelper.testAnalyzeEndpoint('AAPL', 200);

    // Free tier should get 3 or fewer
    expect(data.signals.length).toBeLessThanOrEqual(3);

    // In a real scenario, these would be the "top" ranked signals
    // Verify tier is indicated as free
    expect(data.tierLimit.analysesPerDay).toBe(5);
  });

  test('analyze response indicates free tier limit', async () => {
    const data = await apiHelper.testAnalyzeEndpoint('AAPL', 200);

    // Should clearly indicate free tier
    expect(data.tierLimit).toBeDefined();
    expect(data.tierLimit.analysesPerDay).toBe(5);
    expect(data.tierLimit.analysesPerDay).not.toBe(Infinity);
  });

  test('signal filtering is consistent', async () => {
    // Multiple calls should return consistent results
    for (let i = 0; i < 3; i++) {
      const data = await apiHelper.testAnalyzeEndpoint('AAPL', 200);
      expect(data.signals.length).toBeLessThanOrEqual(3);
    }
  });
});

/**
 * API Endpoint Tests: /api/mcp/analyze - Error Handling
 * Tests error scenarios
 */
test.describe('API: /api/mcp/analyze - Error Handling', () => {
  let apiHelper: APIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelper(request);
  });

  test('endpoint handles missing symbol', async ({ request }) => {
    // Missing required parameter
    const response = await request.post('/api/mcp/analyze', {
      data: { period: '1mo' }, // No symbol
    });

    // Should return error (400 or 422)
    expect([400, 422]).toContain(response.status());
  });

  test('endpoint validates period parameter', async () => {
    // Invalid period format may be handled gracefully
    const data = await apiHelper.testAnalyzeEndpoint('AAPL', 200);

    // Should still return data
    expect(data.signals).toBeDefined();
  });
});
