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
      total_value: 0,
      total_max_loss: 0,
      risk_percent_of_portfolio: 0,
      overall_risk_level: "LOW",
      positions: positions.map((p) => ({
        symbol: p.symbol,
        shares: p.shares,
        entry_price: p.entry_price,
        current_price: p.entry_price,
        current_value: p.shares * p.entry_price,
        max_loss_dollar: 0,
        max_loss_percent: 0,
        stop_level: p.entry_price,
        risk_quality: "low" as const,
      })),
      sector_concentration: {},
      hedge_suggestions: [],
    };
  }

  async morningBrief(
    watchlist?: string[],
    marketRegion = "US",
  ): Promise<MorningBriefResult> {
    // Morning brief endpoint not available, return mock data
    return {
      timestamp: new Date().toISOString(),
      market_status: {
        market_status: "CLOSED",
        market_hours_remaining: "Market Closed",
        current_time: new Date().toISOString(),
        futures_es: { change_percent: 0 },
        futures_nq: { change_percent: 0 },
        vix: 0,
      },
      economic_events: [],
      watchlist_signals: (watchlist || []).map((symbol) => ({
        symbol,
        price: 0,
        change_percent: 0,
        action: "HOLD" as const,
        risk_assessment: "HOLD" as const,
        top_signals: [],
        key_support: 0,
        key_resistance: 0,
      })),
      sector_leaders: [],
      sector_losers: [],
      key_themes: ["Market data unavailable"],
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
