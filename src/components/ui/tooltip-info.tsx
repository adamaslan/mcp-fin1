"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

// Technical indicator explanations
const INDICATOR_TOOLTIPS: Record<
  string,
  { title: string; description: string; interpretation: string }
> = {
  rsi: {
    title: "RSI (Relative Strength Index)",
    description:
      "Momentum oscillator measuring speed and magnitude of price changes on a 0-100 scale.",
    interpretation:
      "RSI > 70 = Overbought (potential sell). RSI < 30 = Oversold (potential buy). Look for divergences between price and RSI.",
  },
  macd: {
    title: "MACD (Moving Average Convergence Divergence)",
    description:
      "Trend-following momentum indicator showing relationship between two moving averages.",
    interpretation:
      "Bullish when MACD crosses above signal line. Bearish when crossing below. Histogram shows momentum strength.",
  },
  sma: {
    title: "SMA (Simple Moving Average)",
    description:
      "Average price over a specified period, smoothing out price fluctuations.",
    interpretation:
      "Price above SMA = bullish trend. Price below = bearish. Common periods: 20, 50, 200 days.",
  },
  ema: {
    title: "EMA (Exponential Moving Average)",
    description:
      "Weighted moving average giving more importance to recent prices.",
    interpretation:
      "Faster to react than SMA. EMA crossovers signal trend changes. 12/26 EMA used in MACD.",
  },
  bollinger: {
    title: "Bollinger Bands",
    description:
      "Volatility bands placed 2 standard deviations above/below a 20-period SMA.",
    interpretation:
      "Price near upper band = overbought. Near lower = oversold. Band squeeze = low volatility, breakout expected.",
  },
  atr: {
    title: "ATR (Average True Range)",
    description:
      "Measures market volatility by calculating average range between high and low prices.",
    interpretation:
      "Higher ATR = more volatility. Used for stop-loss placement (e.g., 2x ATR from entry).",
  },
  volume: {
    title: "Volume",
    description: "Number of shares/contracts traded in a given period.",
    interpretation:
      "High volume confirms price moves. Low volume = weak conviction. Volume spikes signal important events.",
  },
  obv: {
    title: "OBV (On-Balance Volume)",
    description:
      "Cumulative indicator adding volume on up days, subtracting on down days.",
    interpretation:
      "Rising OBV = accumulation (bullish). Falling OBV = distribution (bearish). Divergences predict reversals.",
  },
  stochastic: {
    title: "Stochastic Oscillator",
    description:
      "Compares closing price to price range over a period, scaled 0-100.",
    interpretation:
      "%K > 80 = overbought. %K < 20 = oversold. %K crossing %D signals trades.",
  },
  adx: {
    title: "ADX (Average Directional Index)",
    description: "Measures trend strength regardless of direction.",
    interpretation:
      "ADX > 25 = strong trend. ADX < 20 = weak/no trend. Use with +DI/-DI for direction.",
  },
  vwap: {
    title: "VWAP (Volume Weighted Average Price)",
    description: "Average price weighted by volume, resets daily.",
    interpretation:
      "Price > VWAP = bullish intraday. Institutions use VWAP as benchmark for execution quality.",
  },
  fibonacci: {
    title: "Fibonacci Retracement",
    description:
      "Horizontal lines at key Fibonacci ratios (23.6%, 38.2%, 50%, 61.8%) between swing high/low.",
    interpretation:
      "38.2% and 61.8% are key support/resistance levels. 50% level often acts as major support.",
  },
  pivot: {
    title: "Pivot Points",
    description:
      "Support/resistance levels calculated from previous day high, low, close.",
    interpretation:
      "Price above pivot = bullish bias. S1/S2 are support, R1/R2 are resistance levels.",
  },
  ichimoku: {
    title: "Ichimoku Cloud",
    description:
      "Japanese indicator showing support, resistance, momentum, and trend direction.",
    interpretation:
      "Price above cloud = bullish. Below = bearish. Cloud thickness shows support/resistance strength.",
  },
};

// Signal explanations
const SIGNAL_TOOLTIPS: Record<
  string,
  { title: string; description: string; action: string }
> = {
  golden_cross: {
    title: "Golden Cross",
    description: "50-day SMA crosses above 200-day SMA.",
    action:
      "Bullish signal suggesting long-term uptrend beginning. Consider long positions.",
  },
  death_cross: {
    title: "Death Cross",
    description: "50-day SMA crosses below 200-day SMA.",
    action:
      "Bearish signal suggesting long-term downtrend. Consider reducing exposure or shorting.",
  },
  bullish_divergence: {
    title: "Bullish Divergence",
    description: "Price makes lower low while indicator makes higher low.",
    action:
      "Suggests selling pressure weakening. Potential reversal upward. Watch for confirmation.",
  },
  bearish_divergence: {
    title: "Bearish Divergence",
    description: "Price makes higher high while indicator makes lower high.",
    action:
      "Suggests buying pressure weakening. Potential reversal downward. Consider taking profits.",
  },
  breakout: {
    title: "Breakout",
    description:
      "Price moves above resistance or below support with increased volume.",
    action:
      "Strong signal when confirmed by volume. Enter in breakout direction with stop at breakout level.",
  },
  support_bounce: {
    title: "Support Bounce",
    description: "Price tests support level and bounces higher.",
    action:
      "Bullish if support holds. Entry near support with tight stop below.",
  },
  resistance_rejection: {
    title: "Resistance Rejection",
    description: "Price tests resistance and fails to break through.",
    action:
      "Bearish if resistance holds. Consider short or wait for breakout confirmation.",
  },
};

interface TooltipInfoProps {
  type: "indicator" | "signal";
  id: string;
  children?: React.ReactNode;
  className?: string;
}

export function TooltipInfo({
  type,
  id,
  children,
  className = "",
}: TooltipInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tooltip =
    type === "indicator" ? INDICATOR_TOOLTIPS[id] : SIGNAL_TOOLTIPS[id];

  if (!tooltip) {
    return <>{children}</>;
  }

  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`}>
      {children}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Info about ${tooltip.title}`}
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip content */}
          <div className="absolute z-50 left-0 top-full mt-2 w-72 p-4 bg-popover border rounded-lg shadow-lg">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm">{tooltip.title}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {tooltip.description}
            </p>
            <div className="text-sm">
              <span className="font-medium">
                {type === "indicator" ? "How to use: " : "Action: "}
              </span>
              <span className="text-muted-foreground">
                {type === "indicator"
                  ? (tooltip as typeof INDICATOR_TOOLTIPS.rsi).interpretation
                  : (tooltip as typeof SIGNAL_TOOLTIPS.golden_cross).action}
              </span>
            </div>
          </div>
        </>
      )}
    </span>
  );
}

// Standalone info card for education pages
interface InfoCardProps {
  type: "indicator" | "signal";
  id: string;
}

export function InfoCard({ type, id }: InfoCardProps) {
  const tooltip =
    type === "indicator" ? INDICATOR_TOOLTIPS[id] : SIGNAL_TOOLTIPS[id];

  if (!tooltip) return null;

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="font-semibold mb-2">{tooltip.title}</h3>
      <p className="text-sm text-muted-foreground mb-3">
        {tooltip.description}
      </p>
      <div className="text-sm p-3 bg-muted rounded">
        <span className="font-medium">
          {type === "indicator" ? "Interpretation: " : "Recommended Action: "}
        </span>
        {type === "indicator"
          ? (tooltip as typeof INDICATOR_TOOLTIPS.rsi).interpretation
          : (tooltip as typeof SIGNAL_TOOLTIPS.golden_cross).action}
      </div>
    </div>
  );
}

// Export tooltips for use elsewhere
export { INDICATOR_TOOLTIPS, SIGNAL_TOOLTIPS };
