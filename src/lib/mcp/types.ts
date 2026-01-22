export interface Signal {
  signal: string;
  desc: string;
  strength: string;
  category: string;
  ai_score?: number;
  ai_reasoning?: string;
  rank?: number;
}

export interface AnalysisResult {
  symbol: string;
  timestamp: string;
  price: number;
  change: number;
  signals: Signal[];
  summary: {
    total_signals: number;
    bullish: number;
    bearish: number;
    avg_score: number;
  };
  indicators: {
    rsi: number;
    macd: number;
    adx: number;
    volume: number;
  };
  cached: boolean;
}

export type TradeVehicle =
  | "stock"
  | "option_call"
  | "option_put"
  | "option_spread";
export type TradeTimeframe = "swing" | "day" | "scalp";
export type TradeBias = "bullish" | "bearish" | "neutral";
export type RiskQuality = "high" | "medium" | "low";

export interface SuppressionReason {
  code: string;
  message: string;
  threshold?: number;
  actual?: number;
}

export interface TradePlan {
  symbol: string;
  timestamp: string;
  timeframe: TradeTimeframe;
  bias: TradeBias;
  risk_quality: RiskQuality;
  entry_price: number;
  stop_price: number;
  target_price: number;
  invalidation_price: number;
  risk_reward_ratio: number;
  expected_move_percent: number;
  max_loss_percent: number;
  vehicle: TradeVehicle;
  vehicle_notes?: string;
  option_dte_range?: [number, number];
  option_delta_range?: [number, number];
  option_spread_width?: number;
  primary_signal: string;
  supporting_signals: string[];
  is_suppressed: boolean;
  suppression_reasons: SuppressionReason[];
}

export interface RiskAssessment {
  symbol: string;
  current_price: number;
  metrics: {
    atr: number;
    atr_percent: number;
    volatility_regime: "low" | "medium" | "high";
    adx: number;
    is_trending: boolean;
    bb_width_percent: number;
    volume_ratio: number;
  };
}

export interface QualifiedTrade {
  symbol: string;
  entry_price: number;
  stop_price: number;
  target_price: number;
  risk_reward_ratio: number;
  bias: TradeBias;
  timeframe: TradeTimeframe;
  risk_quality: RiskQuality;
  primary_signal: string;
  vehicle: TradeVehicle;
}

export interface ScanResult {
  universe: string;
  total_scanned: number;
  qualified_trades: QualifiedTrade[];
  timestamp: string;
  duration_seconds: number;
}

export interface PortfolioPosition {
  symbol: string;
  shares: number;
  entry_price: number;
  current_price: number;
  current_value: number;
  max_loss_dollar: number;
  max_loss_percent: number;
  stop_level: number;
  risk_quality: RiskQuality;
}

export interface PortfolioRiskResult {
  total_value: number;
  total_max_loss: number;
  risk_percent_of_portfolio: number;
  overall_risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  positions: PortfolioPosition[];
  sector_concentration: Record<string, number>;
  hedge_suggestions: string[];
}

export interface WatchlistSignal {
  symbol: string;
  price: number;
  change_percent: number;
  action: "BUY" | "HOLD" | "AVOID";
  risk_assessment: "TRADE" | "HOLD" | "AVOID";
  top_signals: string[];
  key_support: number;
  key_resistance: number;
}

export interface EconomicEvent {
  timestamp: string;
  event_name: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
  forecast: string;
  previous: string;
}

export interface SectorMovement {
  sector: string;
  change_percent: number;
}

export interface MorningBriefResult {
  timestamp: string;
  market_status: {
    market_status: "OPEN" | "CLOSED" | "PRE_MARKET" | "AFTER_HOURS";
    market_hours_remaining: string;
    current_time: string;
    futures_es: { change_percent: number };
    futures_nq: { change_percent: number };
    vix: number;
  };
  economic_events: EconomicEvent[];
  watchlist_signals: WatchlistSignal[];
  sector_leaders: SectorMovement[];
  sector_losers: SectorMovement[];
  key_themes: string[];
}

export interface FibonacciLevel {
  key: string;
  ratio: number;
  name: string;
  type: string;
  price: number;
  strength: string;
  distanceFromCurrent: number;
}

export interface FibonacciSignal {
  signal: string;
  description: string;
  strength: string;
  category: string;
  timeframe: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface FibonacciCluster {
  centerPrice: number;
  levels: string[];
  levelCount: number;
  strength: string;
  type: string;
}

export interface ConfluenceZone {
  price: number;
  levelName: string;
  confluenceScore: number;
  strength: "WEAK" | "MODERATE" | "SIGNIFICANT" | "STRONG" | "VERY_STRONG";
  signalCount: number;
  averageSignalStrength: number;
  multiTimeframeAligned: number;
  signalCategories: string[];
}

export interface FibonacciAnalysisResult {
  symbol: string;
  timestamp: string;
  price: number;
  swingHigh: number;
  swingLow: number;
  swingRange: number;
  levels: FibonacciLevel[];
  signals: FibonacciSignal[];
  clusters: FibonacciCluster[];
  confluenceZones: ConfluenceZone[];
  summary: {
    totalSignals: number;
    byCategory: Record<string, number>;
    strongestLevel: string;
    confluenceZoneCount: number;
    highConfidenceZones: number;
  };
  tierLimit?: {
    levelsAvailable: number;
    categoriesAvailable: number | "all";
    signalsShown: number;
    signalsTotal: number;
  };
}
