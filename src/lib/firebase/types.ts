export interface PortfolioPosition {
  symbol: string;
  shares: number;
  entry_price: number;
  current_price: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_percent: number;
  stop_level: number;
  max_loss_dollar: number;
  max_loss_percent: number;
  risk_quality: "high" | "medium" | "low";
  timeframe: "day" | "swing" | "position";
  sector: string;
}

export interface PortfolioRiskData {
  total_value: number;
  total_max_loss: number;
  risk_percent_of_portfolio: number;
  positions: PortfolioPosition[];
  seeded_at?: string;
}
