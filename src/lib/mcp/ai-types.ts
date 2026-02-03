/**
 * AI Analysis Types for MCP Finance
 *
 * These types define the structure of AI analysis responses from the
 * Gemini-powered backend. All 9 MCP tools can return AI analysis when
 * the `use_ai` parameter is set to true.
 */

/**
 * Market bias direction from AI analysis
 */
export type MarketBias = "BULLISH" | "BEARISH" | "NEUTRAL";

/**
 * Importance level for key drivers
 */
export type ImportanceLevel = "HIGH" | "MEDIUM" | "LOW";

/**
 * Timeframe for action items
 */
export type ActionTimeframe = "IMMEDIATE" | "TODAY" | "THIS_WEEK" | "MONITOR";

/**
 * Confidence level for AI predictions
 */
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

/**
 * A key driver identified by AI analysis
 */
export interface AIKeyDriver {
  /** The signal or factor driving the analysis */
  signal: string;
  /** How important this driver is */
  importance: ImportanceLevel;
  /** Explanation of why this matters */
  explanation: string;
}

/**
 * An actionable item from AI analysis
 */
export interface AIActionItem {
  /** Priority ranking (1 = highest) */
  priority: number;
  /** When to act on this item */
  timeframe: ActionTimeframe;
  /** The recommended action */
  action: string;
  /** Optional: specific price level if applicable */
  price_level?: number;
}

/**
 * A risk factor identified by AI
 */
export interface AIRiskFactor {
  /** Description of the risk */
  risk: string;
  /** Severity of the risk */
  severity: ImportanceLevel;
  /** How to mitigate this risk */
  mitigation?: string;
}

/**
 * Base AI analysis structure returned by all MCP tools
 */
export interface AIAnalysis {
  /** Plain English summary of the analysis */
  summary: string;

  /** Overall market bias */
  market_bias?: MarketBias;

  /** Explanation of the bias determination */
  bias_explanation?: string;

  /** Key factors driving the analysis */
  key_drivers?: AIKeyDriver[];

  /** Recommended actions */
  action_items?: AIActionItem[];

  /** Identified risk factors */
  risk_factors?: string[];

  /** AI confidence in the analysis (0-100) */
  confidence_score?: number;

  /** When the AI analysis was generated */
  generated_at?: string;
}

/**
 * Extended AI analysis for security analysis (analyze_security)
 */
export interface SecurityAIAnalysis extends AIAnalysis {
  /** Price target if AI determines one */
  price_target?: {
    target: number;
    timeframe: string;
    confidence: ConfidenceLevel;
  };

  /** Support and resistance levels identified by AI */
  key_levels?: {
    support: number[];
    resistance: number[];
  };

  /** AI-generated trade idea */
  trade_idea?: {
    direction: "LONG" | "SHORT" | "NEUTRAL";
    entry_zone: [number, number];
    stop_loss: number;
    take_profit: number[];
    rationale: string;
  };
}

/**
 * Extended AI analysis for comparison (compare_securities)
 */
export interface ComparisonAIAnalysis extends AIAnalysis {
  /** AI's top pick among compared securities */
  top_pick?: {
    symbol: string;
    reason: string;
    confidence: ConfidenceLevel;
  };

  /** Relative strength ranking */
  rankings?: {
    symbol: string;
    rank: number;
    strength_score: number;
    key_advantage: string;
  }[];
}

/**
 * Extended AI analysis for portfolio risk (portfolio_risk)
 */
export interface PortfolioAIAnalysis extends AIAnalysis {
  /** Overall portfolio health assessment */
  health_score?: number;

  /** Diversification analysis */
  diversification?: {
    score: number;
    assessment: string;
    recommendations: string[];
  };

  /** Specific rebalancing suggestions */
  rebalancing_suggestions?: {
    action: "BUY" | "SELL" | "REDUCE" | "INCREASE";
    symbol: string;
    reason: string;
    urgency: ActionTimeframe;
  }[];
}

/**
 * Extended AI analysis for options (options_risk_analysis)
 */
export interface OptionsAIAnalysis extends AIAnalysis {
  /** Implied volatility analysis */
  iv_analysis?: {
    current_iv: number;
    historical_percentile: number;
    assessment: "EXPENSIVE" | "FAIR" | "CHEAP";
    recommendation: string;
  };

  /** Strategy recommendation */
  strategy_recommendation?: {
    strategy: string;
    rationale: string;
    risk_profile: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";
    expected_outcome: string;
  };

  /** Greeks analysis */
  greeks_assessment?: {
    primary_risk: string;
    secondary_risk: string;
    hedging_suggestion: string;
  };
}

/**
 * Extended AI analysis for Fibonacci (analyze_fibonacci)
 */
export interface FibonacciAIAnalysis extends AIAnalysis {
  /** Most significant level identified */
  key_level?: {
    price: number;
    name: string;
    significance: string;
  };

  /** Confluence zone analysis */
  confluence_assessment?: {
    strongest_zone: number;
    zone_strength: ConfidenceLevel;
    expected_reaction: "BOUNCE" | "BREAK" | "CONSOLIDATION";
  };
}

/**
 * Extended AI analysis for morning brief (morning_brief)
 */
export interface MorningBriefAIAnalysis extends AIAnalysis {
  /** Market outlook for the day */
  day_outlook?: {
    sentiment: MarketBias;
    key_event: string;
    trading_strategy: string;
  };

  /** Sector rotation insights */
  sector_insight?: {
    leading_sectors: string[];
    lagging_sectors: string[];
    rotation_theme: string;
  };

  /** Specific watchlist alerts */
  watchlist_alerts?: {
    symbol: string;
    alert_type: "OPPORTUNITY" | "WARNING" | "MONITOR";
    message: string;
  }[];
}

/**
 * Extended AI analysis for scan results (scan_trades)
 */
export interface ScanAIAnalysis extends AIAnalysis {
  /** Best trade from the scan */
  top_trade?: {
    symbol: string;
    setup_quality: ConfidenceLevel;
    key_signal: string;
    risk_reward: number;
  };

  /** Market conditions assessment */
  market_conditions?: {
    overall: "FAVORABLE" | "MIXED" | "UNFAVORABLE";
    sector_trends: string;
    volatility_assessment: string;
  };
}

/**
 * Type guard to check if AI analysis exists
 */
export function hasAIAnalysis<T extends { ai_analysis?: AIAnalysis }>(
  data: T,
): data is T & { ai_analysis: AIAnalysis } {
  return data.ai_analysis !== undefined && data.ai_analysis !== null;
}

/**
 * Type guard for specific AI analysis types
 */
export function isSecurityAIAnalysis(
  analysis: AIAnalysis,
): analysis is SecurityAIAnalysis {
  return "price_target" in analysis || "trade_idea" in analysis;
}

export function isPortfolioAIAnalysis(
  analysis: AIAnalysis,
): analysis is PortfolioAIAnalysis {
  return "health_score" in analysis || "rebalancing_suggestions" in analysis;
}

export function isOptionsAIAnalysis(
  analysis: AIAnalysis,
): analysis is OptionsAIAnalysis {
  return "iv_analysis" in analysis || "strategy_recommendation" in analysis;
}
