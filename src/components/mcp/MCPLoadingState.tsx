"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export type MCPToolName =
  | "analyze_security"
  | "compare_securities"
  | "screen_securities"
  | "get_trade_plan"
  | "scan_trades"
  | "portfolio_risk"
  | "morning_brief"
  | "analyze_fibonacci"
  | "options_risk_analysis";

interface MCPLoadingStateProps {
  /** The MCP tool being loaded */
  tool?: MCPToolName;
  /** Custom message to display */
  message?: string;
  /** Whether to show a minimal loading state */
  minimal?: boolean;
}

const TOOL_MESSAGES: Record<MCPToolName, string> = {
  analyze_security: "Analyzing security...",
  compare_securities: "Comparing securities...",
  screen_securities: "Screening securities...",
  get_trade_plan: "Generating trade plans...",
  scan_trades: "Scanning for trades...",
  portfolio_risk: "Calculating portfolio risk...",
  morning_brief: "Loading market brief...",
  analyze_fibonacci: "Calculating Fibonacci levels...",
  options_risk_analysis: "Analyzing options risk...",
};

/**
 * Consistent loading state for MCP tool pages.
 * Eliminates duplicated loading skeletons across pages.
 */
export function MCPLoadingState({
  tool,
  message,
  minimal = false,
}: MCPLoadingStateProps) {
  const displayMessage = message || (tool ? TOOL_MESSAGES[tool] : "Loading...");

  if (minimal) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">{displayMessage}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span className="text-lg text-muted-foreground">{displayMessage}</span>
      </div>

      {/* Content skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional content skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Inline loading spinner for use within components
 */
export function MCPInlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}
