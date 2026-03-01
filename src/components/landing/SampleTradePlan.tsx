import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AnalysisData {
  symbol: string;
  signals?: any[];
  summary?: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  indicators?: Record<string, any>;
}

interface TradePlanData {
  symbol?: string;
  entry_price?: number;
  stop_price?: number;
  target_price?: number;
  risk_reward_ratio?: number;
  bias?: string;
  timeframe?: string;
  risk_quality?: string;
  primary_signal?: string;
}

export function SampleTradePlan({
  data,
  tradePlan,
}: {
  data?: AnalysisData | null;
  tradePlan?: TradePlanData | null;
}) {
  const hasAnalysis = !!data && data.signals && data.signals.length > 0;
  const hasTradePlan =
    !!tradePlan &&
    (tradePlan.entry_price != null ||
      tradePlan.stop_price != null ||
      tradePlan.target_price != null);

  // hasRealSymbol: true if the API resolved an actual ticker (winner from comparison),
  // even when MCP is offline and prices are unavailable.
  const hasRealSymbol = !!(tradePlan?.symbol || data?.symbol);
  const hasLiveSignals = hasAnalysis || hasTradePlan;

  const symbol = tradePlan?.symbol || data?.symbol || "[Symbol]";
  const bullishCount = data?.summary?.bullish || 0;
  const bearishCount = data?.summary?.bearish || 0;
  const neutralCount = data?.summary?.neutral || 0;
  const totalSignals = bullishCount + bearishCount + neutralCount;
  const signalScorePct =
    totalSignals > 0 ? Math.round((bullishCount / totalSignals) * 100) : 0;
  const topSignal =
    tradePlan?.primary_signal ||
    data?.signals?.[0]?.signal ||
    data?.signals?.[0]?.name ||
    "[Signal]";

  const bias =
    tradePlan?.bias ||
    (bullishCount > bearishCount
      ? "bullish"
      : bearishCount > bullishCount
        ? "bearish"
        : "neutral");
  const biasUpper = bias.charAt(0).toUpperCase() + bias.slice(1).toLowerCase();

  const getBiasIcon = () => {
    if (bias.toLowerCase().includes("bull"))
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (bias.toLowerCase().includes("bear"))
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getBiasBadge = () => {
    if (bias.toLowerCase().includes("bull"))
      return { label: "BULLISH", color: "bg-green-500" };
    if (bias.toLowerCase().includes("bear"))
      return { label: "BEARISH", color: "bg-red-600" };
    return { label: "NEUTRAL", color: "bg-gray-500" };
  };

  const badgeInfo = getBiasBadge();

  const timeframeLabel =
    tradePlan?.timeframe === "swing"
      ? "Swing Trade"
      : tradePlan?.timeframe === "day"
        ? "Day Trade"
        : tradePlan?.timeframe === "position"
          ? "Position Trade"
          : tradePlan?.timeframe || "Swing Trade";

  const riskQualityLabel =
    tradePlan?.risk_quality === "high"
      ? "Tight Stop"
      : tradePlan?.risk_quality === "medium"
        ? "Moderate Stop"
        : tradePlan?.risk_quality === "low"
          ? "Wide Stop"
          : tradePlan?.risk_quality || "";

  const riskQualityColor =
    tradePlan?.risk_quality === "high"
      ? "text-green-500"
      : tradePlan?.risk_quality === "medium"
        ? "text-yellow-500"
        : "text-orange-500";

  return (
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">See What You Get</h2>
        <p className="text-muted-foreground">
          {hasRealSymbol
            ? "🔴 Live Signal Analysis"
            : "Risk-qualified trade plans with entry, stop, and target prices"}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{symbol}</CardTitle>
                <CardDescription>
                  {hasRealSymbol
                    ? hasTradePlan
                      ? `${timeframeLabel} • ${biasUpper} Bias`
                      : `${symbol} • Swing Trade • Awaiting MCP`
                    : "Apple Inc. • Swing Trade • Bullish Bias"}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={badgeInfo.color}>{badgeInfo.label}</Badge>
                {riskQualityLabel && (
                  <span className={`text-xs font-medium ${riskQualityColor}`}>
                    {riskQualityLabel}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Primary: Entry / Stop / Target */}
            <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Entry Price
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {hasTradePlan && tradePlan?.entry_price != null
                    ? `$${tradePlan.entry_price.toFixed(2)}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
                <p className="text-2xl font-bold text-red-500">
                  {hasTradePlan && tradePlan?.stop_price != null
                    ? `$${tradePlan.stop_price.toFixed(2)}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Target</p>
                <p className="text-2xl font-bold text-green-500">
                  {hasTradePlan && tradePlan?.target_price != null
                    ? `$${tradePlan.target_price.toFixed(2)}`
                    : "—"}
                </p>
              </div>
            </div>

            {/* Secondary: R:R + signal score */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Risk / Reward
                </p>
                <p className="text-lg font-semibold">
                  {hasTradePlan && tradePlan?.risk_reward_ratio != null
                    ? `1 : ${tradePlan.risk_reward_ratio.toFixed(2)}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Signal Score
                </p>
                <p className="text-lg font-semibold">
                  {totalSignals > 0 ? (
                    <>
                      {signalScorePct}%{" "}
                      <span className="text-sm text-muted-foreground font-normal">
                        ({bullishCount}B / {bearishCount}Be)
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>

            {/* Top signal */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {getBiasIcon()}
                <p className="text-xs text-muted-foreground">Top Signal</p>
              </div>
              <Badge variant="outline" className="bg-blue-500/10">
                {topSignal}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Analysis includes:
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✓ ATR-based entry, stop, and target levels</li>
                <li>✓ 150+ technical signal analysis</li>
                <li>✓ Risk/reward assessment with stop quality rating</li>
                <li>✓ Fibonacci confluence and support/resistance levels</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {hasRealSymbol ? (
              <>
                <span className="font-semibold">🔴 Live analysis from GCP</span>{" "}
                • Sign up to see real-time trade plans for any stock with entry,
                stop, and target prices.
              </>
            ) : (
              <>
                This is a sample. Sign up free to see real-time trade plans for
                any stock.
              </>
            )}
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="/sign-up">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
