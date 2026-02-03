"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Search,
  BarChart3,
  PieChart,
  Sun,
  GitBranch,
  LineChart,
  Layers,
  Activity,
} from "lucide-react";
import type { MCPToolName } from "./MCPLoadingState";

interface MCPEmptyStateProps {
  /** The MCP tool to show empty state for */
  tool?: MCPToolName;
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Action button text */
  actionLabel?: string;
  /** Action button callback */
  onAction?: () => void;
}

const TOOL_CONFIG: Record<
  MCPToolName,
  {
    icon: React.ReactNode;
    title: string;
    message: string;
    actionLabel: string;
  }
> = {
  analyze_security: {
    icon: <TrendingUp className="h-12 w-12" />,
    title: "Ready to Analyze",
    message:
      "Enter a stock symbol to get detailed technical analysis with 150+ signals.",
    actionLabel: "Enter Symbol",
  },
  compare_securities: {
    icon: <BarChart3 className="h-12 w-12" />,
    title: "Compare Securities",
    message:
      "Add multiple symbols to compare them side-by-side across key metrics.",
    actionLabel: "Add Symbols",
  },
  screen_securities: {
    icon: <Search className="h-12 w-12" />,
    title: "Screen Securities",
    message:
      "Set your screening criteria to find stocks matching your requirements.",
    actionLabel: "Set Criteria",
  },
  get_trade_plan: {
    icon: <Layers className="h-12 w-12" />,
    title: "Generate Trade Plan",
    message: "Enter a symbol to generate entry, stop, and target levels.",
    actionLabel: "Enter Symbol",
  },
  scan_trades: {
    icon: <Activity className="h-12 w-12" />,
    title: "Scan for Trades",
    message: "Select a universe and scan for high-probability trade setups.",
    actionLabel: "Start Scan",
  },
  portfolio_risk: {
    icon: <PieChart className="h-12 w-12" />,
    title: "Analyze Portfolio Risk",
    message: "Add your positions to calculate total portfolio risk exposure.",
    actionLabel: "Add Positions",
  },
  morning_brief: {
    icon: <Sun className="h-12 w-12" />,
    title: "Morning Brief",
    message:
      "Get your daily market briefing with key levels and economic events.",
    actionLabel: "Load Brief",
  },
  analyze_fibonacci: {
    icon: <GitBranch className="h-12 w-12" />,
    title: "Fibonacci Analysis",
    message:
      "Enter a symbol to calculate Fibonacci retracements and extensions.",
    actionLabel: "Enter Symbol",
  },
  options_risk_analysis: {
    icon: <LineChart className="h-12 w-12" />,
    title: "Options Analysis",
    message:
      "Analyze options risk with Greeks, scenarios, and strategy recommendations.",
    actionLabel: "Enter Details",
  },
};

/**
 * Consistent empty state for MCP tool pages.
 * Shows helpful guidance before any data is loaded.
 */
export function MCPEmptyState({
  tool,
  title,
  message,
  actionLabel,
  onAction,
}: MCPEmptyStateProps) {
  const config = tool ? TOOL_CONFIG[tool] : null;

  const displayIcon = config?.icon || <Search className="h-12 w-12" />;
  const displayTitle = title || config?.title || "No Data";
  const displayMessage =
    message || config?.message || "Get started by making a request.";
  const displayActionLabel =
    actionLabel || config?.actionLabel || "Get Started";

  return (
    <Card>
      <CardContent className="py-16">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="text-muted-foreground/50">{displayIcon}</div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{displayTitle}</h3>
            <p className="text-muted-foreground max-w-md">{displayMessage}</p>
          </div>

          {onAction && (
            <Button onClick={onAction} className="mt-4">
              {displayActionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact empty state for use within cards or smaller areas
 */
export function MCPCompactEmpty({
  message = "No data available",
  icon,
}: {
  message?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      {icon || <Search className="h-8 w-8 mb-2 opacity-50" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}
