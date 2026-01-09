import { TradePlan, AnalysisResult, ScanResult, PortfolioRiskResult, MorningBriefResult } from './types';

export class MCPClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MCP_CLOUD_RUN_URL || 'http://localhost:8000';
  }

  async analyzeSecurity(symbol: string, period = '1mo', useAi = false): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, period, use_ai: useAi }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getTradePlan(symbol: string, period = '1mo'): Promise<{ trade_plans: TradePlan[]; has_trades: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/trade-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, period }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  async scanTrades(universe = 'sp500', maxResults = 10): Promise<ScanResult> {
    const response = await fetch(`${this.baseUrl}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ universe, max_results: maxResults }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  async portfolioRisk(positions: Array<{ symbol: string; shares: number; entry_price: number }>): Promise<PortfolioRiskResult> {
    const response = await fetch(`${this.baseUrl}/api/portfolio-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  async morningBrief(watchlist?: string[], marketRegion = 'US'): Promise<MorningBriefResult> {
    const response = await fetch(`${this.baseUrl}/api/morning-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watchlist, market_region: marketRegion }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  async compareSecurity(symbols: string[], metric = 'signals'): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols, metric }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  async screenSecurities(universe = 'sp500', criteria: any = {}, limit = 20): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/screen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ universe, criteria, limit }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }
}

export function getMCPClient(): MCPClient {
  return new MCPClient();
}
