"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles } from "lucide-react";
import { useTier } from "@/hooks/useTier";
import { canAccessAI } from "@/lib/auth/tiers";
import { useMCPQuery } from "@/hooks/useMCPQuery";
import {
  AIInsightsPanel,
  MCPLoadingState,
  MCPErrorState,
  MCPEmptyState,
} from "@/components/mcp";
import {
  MarketStatusCard,
  EconomicEventsCard,
  WatchlistSignalsCard,
  SectorMovementCard,
  KeyThemesCard,
} from "@/components/morning-brief";
import type { MorningBriefResult } from "@/lib/mcp/types";

export default function MorningBriefPage() {
  const { tier } = useTier();
  const [useAI, setUseAI] = useState(false);

  const { data, loading, error, refetch } = useMCPQuery<MorningBriefResult>({
    endpoint: "/api/mcp/morning-brief",
    params: {
      symbols: ["SPY", "QQQ", "AAPL"],
      region: "US",
      use_ai: useAI,
    },
    enabled: true,
    refetchOnParamsChange: true,
  });

  const canUseAi = canAccessAI(tier, "morning_brief");

  return (
    <div className="space-y-6">
      {/* Header with AI Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Morning Market Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Market status, economic events, watchlist signals, and sector
            movements for today.
          </p>

          {/* AI Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Checkbox
              id="ai-toggle"
              checked={useAI}
              onCheckedChange={(checked) => setUseAI(checked)}
              disabled={loading || !canUseAi}
            />
            <label
              htmlFor="ai-toggle"
              className="text-sm cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              Market AI Insights {!canUseAi && "(Pro+)"}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && <MCPLoadingState tool="morning_brief" />}

      {/* Error State */}
      {error && <MCPErrorState error={error} onRetry={refetch} />}

      {/* Main Content */}
      {data && !loading && !error && (
        <>
          {/* Market Status */}
          <MarketStatusCard status={data.market_status} />

          {/* Economic Events */}
          <EconomicEventsCard events={data.economic_events} />

          {/* Watchlist Signals */}
          <WatchlistSignalsCard signals={data.watchlist_signals} />

          {/* Sector Movement */}
          <SectorMovementCard
            leaders={data.sector_leaders}
            losers={data.sector_losers}
          />

          {/* Key Themes */}
          <KeyThemesCard themes={data.key_themes} />

          {/* AI Insights Panel */}
          {data.ai_analysis && (
            <AIInsightsPanel
              analysis={data.ai_analysis}
              tool="morning_brief"
              title="Market AI Analysis"
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && !data && (
        <MCPEmptyState
          message="No market data available"
          description="Check back during market hours or try refreshing the page"
        />
      )}
    </div>
  );
}
