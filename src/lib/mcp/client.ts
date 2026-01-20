import {
  TradePlan,
  AnalysisResult,
  ScanResult,
  PortfolioRiskResult,
  MorningBriefResult,
} from "./types";

export class MCPClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MCP_CLOUD_RUN_URL || "http://localhost:8000";
  }

  async analyzeSecurity(
    symbol: string,
    period = "1mo",
    useAi = false,
  ): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, period, use_ai: useAi }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getTradePlan(
    symbol: string,
    period = "1mo",
  ): Promise<{ trade_plans: TradePlan[]; has_trades: boolean }> {
    // Use analyze endpoint which provides trade plan data
    const response = await fetch(`${this.baseUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, period }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform analyze response to trade plan format
    return {
      trade_plans: data.trade_plans || [],
      has_trades: (data.trade_plans || []).length > 0,
    };
  }

  async scanTrades(universe = "sp500", maxResults = 10): Promise<ScanResult> {
    const response = await fetch(`${this.baseUrl}/api/screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universe, max_results: maxResults }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  async portfolioRisk(
    positions: Array<{ symbol: string; shares: number; entry_price: number }>,
  ): Promise<PortfolioRiskResult> {
    // Portfolio risk endpoint not available, return mock data
    return {
      total_risk: 0,
      max_drawdown: 0,
      var_95: 0,
      expected_return: 0,
      sharpe_ratio: 0,
      positions: positions.map((p) => ({
        symbol: p.symbol,
        risk_contribution: 0,
        var: 0,
      })),
    };
  }

  async morningBrief(
    watchlist?: string[],
    marketRegion = "US",
  ): Promise<MorningBriefResult> {
    // Morning brief endpoint not available, return mock data
    return {
      market_sentiment: "neutral",
      top_gainers: [],
      top_losers: [],
      key_economic_events: [],
      watchlist_updates: (watchlist || []).map((symbol) => ({
        symbol,
        change: 0,
        signal_status: "neutral",
      })),
      summary: "Market data unavailable",
    };
  }

  async compareSecurity(symbols: string[], metric = "signals"): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols, metric }),
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }

    return response.json();
  }

  async screenSecurities(
    universe = "sp500",
    criteria: any = {},
    limit = 20,
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
