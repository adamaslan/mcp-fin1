"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FibonacciAnalysisResult, FibonacciSignal } from "@/lib/mcp/types";

interface SignalsBreakdownProps {
  result: FibonacciAnalysisResult;
}

function getStrengthColor(strength: string): string {
  switch (strength?.toUpperCase()) {
    case "VERY_STRONG":
      return "bg-amber-500/20 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800";
    case "STRONG":
      return "bg-green-500/20 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-800";
    case "SIGNIFICANT":
      return "bg-blue-500/20 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-800";
    case "MODERATE":
      return "bg-purple-500/20 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-800";
    case "WEAK":
      return "bg-gray-400/20 text-gray-600 border-gray-200 dark:bg-gray-400/10 dark:text-gray-400 dark:border-gray-800";
    default:
      return "bg-gray-500/20 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-800";
  }
}

function getSignalIcon(signal: string): string {
  const lower = signal?.toLowerCase() || "";
  if (
    lower.includes("bullish") ||
    lower.includes("buy") ||
    lower.includes("upside")
  )
    return "📈";
  if (
    lower.includes("bearish") ||
    lower.includes("sell") ||
    lower.includes("downside")
  )
    return "📉";
  if (lower.includes("neutral") || lower.includes("consolidat")) return "➡️";
  return "🎯";
}

function SignalRow({
  signal,
  isMultiTimeframe,
}: {
  signal: FibonacciSignal;
  isMultiTimeframe: boolean;
}) {
  return (
    <div className="p-3 border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getSignalIcon(signal.signal)}</span>
            <span className="font-semibold text-sm">{signal.signal}</span>
            {isMultiTimeframe && (
              <Badge
                variant="outline"
                className="bg-green-500/20 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-800 text-xs py-0"
              >
                MTF
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {signal.description}
          </p>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "border text-xs",
                getStrengthColor(signal.strength),
              )}
            >
              {signal.strength}
            </Badge>
            {signal.category && (
              <Badge variant="outline" className="text-xs">
                {signal.category}
              </Badge>
            )}
            {signal.timeframe && (
              <Badge variant="outline" className="text-xs bg-muted/50">
                {signal.timeframe}
              </Badge>
            )}
          </div>
        </div>
        {signal.value !== undefined && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Value</div>
            <div className="text-sm font-bold">{signal.value.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function SignalSection({
  title,
  signals,
  strengthLevel,
}: {
  title: string;
  signals: FibonacciSignal[];
  strengthLevel: string;
}) {
  const displaySignals = signals.slice(0, 10);

  if (signals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
            {signals.length}
          </span>
          {title}
        </h3>
        {signals.length > 10 && (
          <span className="text-xs text-muted-foreground">
            Showing 10 of {signals.length}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {displaySignals.map((signal, idx) => (
          <SignalRow
            key={`${signal.signal}-${idx}`}
            signal={signal}
            isMultiTimeframe={
              signal.timeframe?.toLowerCase().includes("multi") || false
            }
          />
        ))}
      </div>
    </div>
  );
}

export function SignalsBreakdown({ result }: SignalsBreakdownProps) {
  // Group signals by strength
  const strongSignals = result.signals.filter(
    (s) =>
      s.strength?.toUpperCase() === "STRONG" ||
      s.strength?.toUpperCase() === "VERY_STRONG",
  );

  const significantSignals = result.signals.filter(
    (s) => s.strength?.toUpperCase() === "SIGNIFICANT",
  );

  const moderateSignals = result.signals.filter(
    (s) => s.strength?.toUpperCase() === "MODERATE",
  );

  const weakSignals = result.signals.filter(
    (s) => s.strength?.toUpperCase() === "WEAK",
  );

  const totalByStrength = {
    strong: strongSignals.length,
    significant: significantSignals.length,
    moderate: moderateSignals.length,
    weak: weakSignals.length,
  };

  const hasNoSignals = result.signals.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Signal Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {result.signals.length} total signals by strength
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasNoSignals ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground">
              <p className="mb-2">No signals detected</p>
              <p className="text-sm">
                Signals will appear when Fibonacci analysis identifies specific
                price action patterns
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Chart */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Distribution
              </p>
              <div className="space-y-2">
                {/* Strong/Very Strong */}
                {totalByStrength.strong > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Strong</span>
                      <span className="text-sm font-bold">
                        {totalByStrength.strong}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(totalByStrength.strong / result.signals.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Significant */}
                {totalByStrength.significant > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Significant</span>
                      <span className="text-sm font-bold">
                        {totalByStrength.significant}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(totalByStrength.significant / result.signals.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Moderate */}
                {totalByStrength.moderate > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Moderate</span>
                      <span className="text-sm font-bold">
                        {totalByStrength.moderate}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${(totalByStrength.moderate / result.signals.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Weak */}
                {totalByStrength.weak > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Weak</span>
                      <span className="text-sm font-bold">
                        {totalByStrength.weak}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400"
                        style={{
                          width: `${(totalByStrength.weak / result.signals.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border/50 pt-6 space-y-6">
              {/* Strong Signals */}
              {strongSignals.length > 0 && (
                <SignalSection
                  title="Strong Signals"
                  signals={strongSignals}
                  strengthLevel="strong"
                />
              )}

              {/* Significant Signals */}
              {significantSignals.length > 0 && (
                <SignalSection
                  title="Significant Signals"
                  signals={significantSignals}
                  strengthLevel="significant"
                />
              )}

              {/* Moderate Signals */}
              {moderateSignals.length > 0 && (
                <SignalSection
                  title="Moderate Signals"
                  signals={moderateSignals}
                  strengthLevel="moderate"
                />
              )}

              {/* Weak Signals */}
              {weakSignals.length > 0 && (
                <SignalSection
                  title="Weak Signals"
                  signals={weakSignals}
                  strengthLevel="weak"
                />
              )}
            </div>
          </div>
        )}

        {/* Tier Gating Notice */}
        {result.tierLimit &&
          typeof result.tierLimit.signalsTotal === "number" &&
          result.tierLimit.signalsShown < result.tierLimit.signalsTotal && (
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Pro/Max Feature:</span> Showing{" "}
                {result.tierLimit.signalsShown} of{" "}
                {result.tierLimit.signalsTotal} signals.{" "}
                <a href="/pricing" className="underline hover:opacity-80">
                  Upgrade to see all
                </a>
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
