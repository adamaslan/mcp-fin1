"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TradePlanCard } from "@/components/trade-plan/TradePlanCard";
import { TimeframeSelector } from "@/components/trade-plan/TimeframeSelector";
import { useMCPQuery } from "@/hooks/useMCPQuery";
import { useTier } from "@/hooks/useTier";
import { canAccessTimeframe, canAccessAI, TIER_LIMITS } from "@/lib/auth/tiers";
import {
  MCPLoadingState,
  MCPErrorState,
  MCPEmptyState,
  AIInsightsPanel,
} from "@/components/mcp";
import { TradePlan } from "@/lib/mcp/types";
import { Sparkles } from "lucide-react";

interface AnalyzePageProps {
  params: Promise<{ symbol: string }>;
}

interface TradePlanResponse {
  trade_plans: TradePlan[];
  has_trades: boolean;
  ai_analysis?: any;
}

export default function AnalyzePage({ params }: AnalyzePageProps) {
  const router = useRouter();
  const { symbol } = use(params);
  const { tier, loading: tierLoading } = useTier();

  const [inputSymbol, setInputSymbol] = useState(symbol.toUpperCase());
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "swing" | "day" | "scalp"
  >("swing");
  const [aiEnabled, setAiEnabled] = useState(false);

  // Use MCP query for auto-loading trade plans
  const {
    data: result,
    loading,
    error,
    refetch,
  } = useMCPQuery<TradePlanResponse>({
    endpoint: "/api/mcp/trade-plan",
    params: {
      symbol: symbol.toUpperCase(),
      period: "1mo",
      use_ai: aiEnabled && canUseAi,
    },
    enabled: !!symbol,
    refetchOnParamsChange: true,
  });

  const tierLimits = TIER_LIMITS[tier];
  const canUseAi = !tierLoading && canAccessAI(tier, "get_trade_plan");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputSymbol.trim()) {
      return;
    }

    router.push(`/analyze/${inputSymbol.toUpperCase()}`);
  };

  const handleTimeframeChange = (tf: "swing" | "day" | "scalp") => {
    if (canAccessTimeframe(tier as any, tf)) {
      setSelectedTimeframe(tf);
    }
  };

  // Filter trade plans by selected timeframe
  const filteredPlans = (result?.trade_plans || []).filter(
    (p: TradePlan) => p.timeframe === selectedTimeframe,
  );

  return (
    <div className="space-y-6">
      {/* Symbol search */}
      <Card>
        <CardHeader>
          <CardTitle>Search for Trade Plans</CardTitle>
          <CardDescription>
            Enter any stock ticker to analyze. Free: 5/day, Pro: 50/day, Max:
            Unlimited
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="flex gap-2">
            <Input
              placeholder="Enter symbol (e.g., AAPL, MSFT)"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
              disabled={loading}
            />
            <Button disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Timeframe selector (Pro+) */}
      {tier !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Timeframe</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeframeSelector
              value={selectedTimeframe}
              onChange={handleTimeframeChange}
            />
          </CardContent>
        </Card>
      )}

      {/* AI Toggle */}
      {canUseAi && (
        <Card>
          <CardContent className="pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="rounded border-gray-300"
                disabled={loading}
              />
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Enable AI Analysis</span>
            </label>
          </CardContent>
        </Card>
      )}

      {!canUseAi && tier === "free" && (
        <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="pt-6 flex gap-2 items-center text-sm">
            <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="text-blue-700 dark:text-blue-300">
              AI analysis available on Pro+ tiers
            </span>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && <MCPLoadingState tool="get_trade_plan" />}

      {/* Error State */}
      {error && !loading && <MCPErrorState error={error} onRetry={refetch} />}

      {/* AI Insights */}
      {result?.ai_analysis && !loading && (
        <div className="mb-6">
          <AIInsightsPanel
            analysis={result.ai_analysis}
            tool="get_trade_plan"
          />
        </div>
      )}

      {/* Results */}
      {!loading && filteredPlans.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {symbol.toUpperCase()} -{" "}
              {selectedTimeframe.charAt(0).toUpperCase() +
                selectedTimeframe.slice(1)}{" "}
              Trade Plans
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredPlans.length} trade plan
              {filteredPlans.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filteredPlans.map((plan, index) => (
            <TradePlanCard key={index} plan={plan} />
          ))}
        </div>
      )}

      {/* Empty State - No plans for timeframe */}
      {!loading &&
        result?.trade_plans &&
        result.trade_plans.length > 0 &&
        filteredPlans.length === 0 && (
          <Card className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="pt-6 text-center text-amber-700 dark:text-amber-300">
              <p>
                No {selectedTimeframe} trade plans available. Try another
                timeframe.
              </p>
            </CardContent>
          </Card>
        )}

      {/* Empty State - Initial or no plans */}
      {!loading && !result && !error && (
        <MCPEmptyState
          tool="get_trade_plan"
          onAction={() => document.querySelector("input")?.focus()}
        />
      )}

      {/* Usage info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">
            Your Tier: {tier.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Analyses per day:{" "}
              {tierLimits.analysesPerDay === Infinity
                ? "Unlimited"
                : tierLimits.analysesPerDay}
            </li>
            <li>• Timeframes available: {tierLimits.timeframes.join(", ")}</li>
            <li>
              • Signal visibility:{" "}
              {tier === "free"
                ? "Top 3"
                : tier === "pro"
                  ? "Top 10"
                  : "All 150+"}{" "}
              signals
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
