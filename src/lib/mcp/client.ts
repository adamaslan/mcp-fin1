import {
  TradePlan,
  AnalysisResult,
  ScanResult,
  PortfolioRiskResult,
  MorningBriefResult,
  FibonacciAnalysisResult,
  ComparisonResult,
  ScreeningResult,
  OptionsRiskResult,
} from "./types";

/**
 * MCP Client for communicating with the Python backend.
 * All 9 MCP tools are accessible through this client.
 * Each method supports an optional `useAi` parameter for AI-enhanced analysis.
 */
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

  /**
   * Tool #1: analyze_security
   * Deep technical analysis of a single stock with 150+ signals.
   */
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

  /**
   * Tool #2: compare_securities
   * Compare multiple stocks side-by-side across key metrics.
   */
  async compareSecurity(
    symbols: string[],
    metric = "signals",
    useAi = false,
  ): Promise<ComparisonResult> {
    const response = await fetch(`${this.baseUrl}/api/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols, metric, use_ai: useAi }),
    });

    return this.handleResponse<ComparisonResult>(
      response,
      `/api/compare (symbols=${symbols.join(",")})`,
    );
  }

  /**
   * Tool #3: screen_securities
   * Filter stocks against customizable technical and fundamental criteria.
   */
  async screenSecurities(
    universe = "sp500",
    criteria: Record<string, unknown> = {},
    limit = 20,
    useAi = false,
  ): Promise<ScreeningResult> {
    const response = await fetch(`${this.baseUrl}/api/screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universe, criteria, limit, use_ai: useAi }),
    });

    return this.handleResponse<ScreeningResult>(
      response,
      `/api/screen (universe=${universe}, limit=${limit})`,
    );
  }

  /**
   * Tool #4: get_trade_plan
   * Generate entry/stop/target levels for a symbol.
   */
  async getTradePlan(
    symbol: string,
    period = "1mo",
    useAi = false,
  ): Promise<{ trade_plans: TradePlan[]; has_trades: boolean }> {
    // Use analyze endpoint which provides trade plan data
    const response = await fetch(`${this.baseUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, period, use_ai: useAi }),
    });

    const data = await this.handleResponse<AnalysisResult>(
      response,
      `/api/analyze (symbol=${symbol})`,
    );

    // Transform analyze response to trade plan format
    return {
      trade_plans: data.trade_plans || [],
      has_trades: (data.trade_plans || []).length > 0,
    };
  }

  /**
   * Tool #5: scan_trades
   * Scan a universe for high-probability trade setups.
   */
  async scanTrades(
    universe = "sp500",
    maxResults = 10,
    useAi = false,
  ): Promise<ScanResult> {
    const response = await fetch(`${this.baseUrl}/api/screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        universe,
        max_results: maxResults,
        use_ai: useAi,
      }),
    });

    return this.handleResponse<ScanResult>(
      response,
      `/api/screen (universe=${universe})`,
    );
  }

  /**
   * Tool #6: portfolio_risk
   * Calculate total portfolio risk exposure and concentration.
   */
  async portfolioRisk(
    positions: Array<{ symbol: string; shares: number; entry_price: number }>,
    useAi = false,
  ): Promise<PortfolioRiskResult> {
    const response = await fetch(`${this.baseUrl}/api/portfolio-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positions, use_ai: useAi }),
    });

    return this.handleResponse<PortfolioRiskResult>(
      response,
      `/api/portfolio-risk`,
    );
  }

  /**
   * Tool #7: morning_brief
   * Daily market briefing with overnight trends and key levels.
   */
  async morningBrief(
    watchlist?: string[],
    marketRegion = "US",
    useAi = false,
  ): Promise<MorningBriefResult> {
    const response = await fetch(`${this.baseUrl}/api/morning-brief`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        watchlist: watchlist || [],
        market_region: marketRegion,
        use_ai: useAi,
      }),
    });

    return this.handleResponse<MorningBriefResult>(
      response,
      `/api/morning-brief`,
    );
  }

  /**
   * Tool #8: analyze_fibonacci
   * Calculate Fibonacci retracements, extensions, and confluence zones.
   */
  async analyzeFibonacci(
    symbol: string,
    period = "1d",
    window = 50,
    useAi = false,
  ): Promise<FibonacciAnalysisResult> {
    const response = await fetch(`${this.baseUrl}/api/fibonacci`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, period, window, use_ai: useAi }),
    });

    return this.handleResponse<FibonacciAnalysisResult>(
      response,
      `/api/fibonacci (symbol=${symbol})`,
    );
  }

  /**
   * Tool #9: options_risk_analysis
   * Analyze options risk with Greeks, scenarios, and strategy recommendations.
   */
  async optionsRiskAnalysis(
    symbol: string,
    positionType: "call" | "put" | "spread",
    options: {
      strike?: number;
      expiry?: string;
      contracts?: number;
      premium?: number;
    } = {},
    useAi = false,
  ): Promise<OptionsRiskResult> {
    const response = await fetch(`${this.baseUrl}/api/options-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol,
        position_type: positionType,
        ...options,
        use_ai: useAi,
      }),
    });

    return this.handleResponse<OptionsRiskResult>(
      response,
      `/api/options-risk (symbol=${symbol})`,
    );
  }
}

/**
 * Get an instance of the MCP client.
 * Use this factory function to ensure consistent client creation.
 */
export function getMCPClient(): MCPClient {
  return new MCPClient();
}
