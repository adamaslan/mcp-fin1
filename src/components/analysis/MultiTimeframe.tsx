"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

type Timeframe = "daily" | "weekly" | "monthly";
type TrendDirection = "bullish" | "bearish" | "neutral";
type SignalStrength = "strong" | "moderate" | "weak";

interface TimeframeAnalysis {
  timeframe: Timeframe;
  trend: TrendDirection;
  strength: SignalStrength;
  keyLevels: {
    support: number;
    resistance: number;
  };
  indicators: {
    name: string;
    signal: "buy" | "sell" | "neutral";
  }[];
  notes: string;
}

// Mock data - in production, this comes from the MCP server
const MOCK_ANALYSIS: TimeframeAnalysis[] = [
  {
    timeframe: "daily",
    trend: "bullish",
    strength: "strong",
    keyLevels: { support: 178.5, resistance: 192.3 },
    indicators: [
      { name: "MACD", signal: "buy" },
      { name: "RSI", signal: "neutral" },
      { name: "Moving Averages", signal: "buy" },
      { name: "Volume", signal: "buy" },
    ],
    notes:
      "Price above all major MAs. MACD bullish crossover. Volume confirming.",
  },
  {
    timeframe: "weekly",
    trend: "bullish",
    strength: "moderate",
    keyLevels: { support: 165.0, resistance: 200.0 },
    indicators: [
      { name: "MACD", signal: "buy" },
      { name: "RSI", signal: "neutral" },
      { name: "Moving Averages", signal: "buy" },
      { name: "Volume", signal: "neutral" },
    ],
    notes:
      "Healthy uptrend. RSI approaching overbought. Weekly support at 165.",
  },
  {
    timeframe: "monthly",
    trend: "bullish",
    strength: "strong",
    keyLevels: { support: 140.0, resistance: 210.0 },
    indicators: [
      { name: "MACD", signal: "buy" },
      { name: "RSI", signal: "buy" },
      { name: "Moving Averages", signal: "buy" },
      { name: "Volume", signal: "buy" },
    ],
    notes:
      "Long-term uptrend intact. Major support at 140. All-time highs in sight.",
  },
];

const TREND_CONFIG: Record<
  TrendDirection,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  bullish: {
    icon: <TrendingUp className="h-5 w-5" />,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  bearish: {
    icon: <TrendingDown className="h-5 w-5" />,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  neutral: {
    icon: <Minus className="h-5 w-5" />,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
  },
};

const SIGNAL_CONFIG: Record<
  "buy" | "sell" | "neutral",
  { icon: React.ReactNode; color: string }
> = {
  buy: { icon: <Check className="h-4 w-4" />, color: "text-green-500" },
  sell: { icon: <X className="h-4 w-4" />, color: "text-red-500" },
  neutral: { icon: <Minus className="h-4 w-4" />, color: "text-gray-500" },
};

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

interface MultiTimeframeProps {
  symbol: string;
  data?: TimeframeAnalysis[];
}

export function MultiTimeframe({
  symbol,
  data = MOCK_ANALYSIS,
}: MultiTimeframeProps) {
  // Calculate confluence
  const bullishCount = data.filter((d) => d.trend === "bullish").length;
  const bearishCount = data.filter((d) => d.trend === "bearish").length;

  let confluence:
    | "strong_bullish"
    | "bullish"
    | "mixed"
    | "bearish"
    | "strong_bearish";
  if (bullishCount === 3) confluence = "strong_bullish";
  else if (bullishCount >= 2) confluence = "bullish";
  else if (bearishCount === 3) confluence = "strong_bearish";
  else if (bearishCount >= 2) confluence = "bearish";
  else confluence = "mixed";

  const confluenceConfig = {
    strong_bullish: {
      label: "Strong Bullish",
      color: "bg-green-500",
      description: "All timeframes aligned bullish",
    },
    bullish: {
      label: "Bullish",
      color: "bg-green-400",
      description: "Most timeframes bullish",
    },
    mixed: {
      label: "Mixed",
      color: "bg-yellow-500",
      description: "Timeframes not aligned",
    },
    bearish: {
      label: "Bearish",
      color: "bg-red-400",
      description: "Most timeframes bearish",
    },
    strong_bearish: {
      label: "Strong Bearish",
      color: "bg-red-500",
      description: "All timeframes aligned bearish",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Multi-Timeframe Analysis
        </CardTitle>
        <CardDescription>
          Confluence across daily, weekly, and monthly charts for {symbol}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confluence Summary */}
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Timeframe Confluence</span>
            <Badge
              className={`${confluenceConfig[confluence].color} text-white`}
            >
              {confluenceConfig[confluence].label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {confluenceConfig[confluence].description}
          </p>
          {confluence === "mixed" && (
            <div className="flex items-center gap-2 mt-2 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">
                Mixed signals - exercise caution or wait for alignment
              </span>
            </div>
          )}
        </div>

        {/* Timeframe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((tf) => (
            <div
              key={tf.timeframe}
              className={`p-4 rounded-lg border ${TREND_CONFIG[tf.trend].bgColor}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">
                  {TIMEFRAME_LABELS[tf.timeframe]}
                </span>
                <div
                  className={`flex items-center gap-1 ${TREND_CONFIG[tf.trend].color}`}
                >
                  {TREND_CONFIG[tf.trend].icon}
                  <span className="text-sm capitalize">{tf.trend}</span>
                </div>
              </div>

              {/* Strength */}
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Signal Strength
                </div>
                <div className="flex gap-1">
                  {["strong", "moderate", "weak"].map((s) => (
                    <div
                      key={s}
                      className={`h-2 flex-1 rounded ${
                        s === "strong" &&
                        tf.strength !== "weak" &&
                        tf.strength !== "moderate"
                          ? TREND_CONFIG[tf.trend].color.replace("text-", "bg-")
                          : s === "moderate" && tf.strength !== "weak"
                            ? TREND_CONFIG[tf.trend].color
                                .replace("text-", "bg-")
                                .replace("-500", "-400")
                            : s === "weak"
                              ? TREND_CONFIG[tf.trend].color
                                  .replace("text-", "bg-")
                                  .replace("-500", "-300")
                              : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">
                  {tf.strength}
                </div>
              </div>

              {/* Key Levels */}
              <div className="mb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Support:</span>
                  <span className="font-medium">
                    ${tf.keyLevels.support.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resistance:</span>
                  <span className="font-medium">
                    ${tf.keyLevels.resistance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Indicators */}
              <div className="space-y-1">
                {tf.indicators.map((ind) => (
                  <div
                    key={ind.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{ind.name}</span>
                    <div
                      className={`flex items-center gap-1 ${SIGNAL_CONFIG[ind.signal].color}`}
                    >
                      {SIGNAL_CONFIG[ind.signal].icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">{tf.notes}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trading Implications */}
        <div className="p-4 rounded-lg border">
          <h4 className="font-medium mb-2">Trading Implications</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Swing trades:</strong> Align with weekly trend, use
                daily for entry timing
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Day trades:</strong> Trade in direction of daily trend,
                respect weekly levels
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Position trades:</strong> Monthly trend is your friend,
                weekly for adds
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
