import {
  TradePlan,
  AnalysisResult,
  ScanResult,
  PortfolioRiskResult,
  MorningBriefResult,
  FibonacciAnalysisResult,
} from "./types";

export class MCPClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MCP_CLOUD_RUN_URL || "http://localhost:8000";
  }

  private async handleResponse<T>(
    response: Response,
    endpoint: string,
  ): Promise<T> {
    if (!response.ok) {
      let errorDetails = "";
      try {
        const body = await response.json();
        errorDetails = JSON.stringify(body);
      } catch {
        errorDetails = await response.text();
      }

      throw new Error(
        `MCP API error (${response.status} ${response.statusText}): ${endpoint} - ${errorDetails || "No response body"}`,
      );
    }

    return response.json();
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

    return this.handleResponse(response, `/api/analyze (symbol=${symbol})`);
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

    const data = await this.handleResponse<any>(
      response,
      `/api/analyze (symbol=${symbol})`,
    );

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

    return this.handleResponse<ScanResult>(
      response,
      `/api/screen (universe=${universe})`,
    );
  }

  async portfolioRisk(
    positions: Array<{ symbol: string; shares: number; entry_price: number }>,
  ): Promise<PortfolioRiskResult> {
    const response = await fetch(`${this.baseUrl}/api/portfolio-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positions }),
    });

    return this.handleResponse<PortfolioRiskResult>(
      response,
      `/api/portfolio-risk`,
    );
  }

  async morningBrief(
    watchlist?: string[],
    marketRegion = "US",
  ): Promise<MorningBriefResult> {
    const response = await fetch(`${this.baseUrl}/api/morning-brief`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        watchlist: watchlist || [],
        market_region: marketRegion,
      }),
    });

    return this.handleResponse<MorningBriefResult>(
      response,
      `/api/morning-brief`,
    );
  }

  async compareSecurity(symbols: string[], metric = "signals"): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols, metric }),
    });

    return this.handleResponse<any>(
      response,
      `/api/compare (symbols=${symbols.join(",")})`,
    );
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

    return this.handleResponse<any>(
      response,
      `/api/screen (universe=${universe}, limit=${limit})`,
    );
  }

  async analyzeFibonacci(
    symbol: string,
    period = "1d",
    window = 50,
  ): Promise<FibonacciAnalysisResult> {
    const response = await fetch(`${this.baseUrl}/api/fibonacci`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, period, window }),
    });

    return this.handleResponse<FibonacciAnalysisResult>(
      response,
      `/api/fibonacci (symbol=${symbol})`,
    );
  }
}

export function getMCPClient(): MCPClient {
  return new MCPClient();
}
