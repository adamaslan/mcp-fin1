"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Target,
  Clock,
  Zap,
} from "lucide-react";
import type {
  AIAnalysis,
  AIKeyDriver,
  AIActionItem,
  MarketBias,
  ImportanceLevel,
  ActionTimeframe,
} from "@/lib/mcp/ai-types";
import type { MCPToolName } from "./MCPLoadingState";

interface AIInsightsPanelProps {
  /** The AI analysis data */
  analysis: AIAnalysis;
  /** The MCP tool this analysis is for */
  tool?: MCPToolName;
  /** Whether to show in collapsed state initially */
  defaultCollapsed?: boolean;
  /** Custom title for the panel */
  title?: string;
}

/**
 * Get the appropriate icon and color for market bias
 */
function getBiasDisplay(bias: MarketBias): {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
} {
  switch (bias) {
    case "BULLISH":
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      };
    case "BEARISH":
      return {
        icon: <TrendingDown className="h-4 w-4" />,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
      };
    case "NEUTRAL":
      return {
        icon: <Minus className="h-4 w-4" />,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-100 dark:bg-gray-800",
      };
  }
}

/**
 * Get importance badge styling
 */
function getImportanceStyle(importance: ImportanceLevel): string {
  switch (importance) {
    case "HIGH":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "LOW":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
}

/**
 * Get timeframe badge styling
 */
function getTimeframeStyle(timeframe: ActionTimeframe): {
  style: string;
  icon: React.ReactNode;
} {
  switch (timeframe) {
    case "IMMEDIATE":
      return {
        style: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: <Zap className="h-3 w-3" />,
      };
    case "TODAY":
      return {
        style:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        icon: <Clock className="h-3 w-3" />,
      };
    case "THIS_WEEK":
      return {
        style:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        icon: <Clock className="h-3 w-3" />,
      };
    case "MONITOR":
      return {
        style: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
        icon: <Target className="h-3 w-3" />,
      };
  }
}

/**
 * Market bias badge component
 */
export function AIMarketBias({ bias }: { bias: MarketBias }) {
  const { icon, color, bgColor } = getBiasDisplay(bias);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bgColor}`}
    >
      <span className={color}>{icon}</span>
      <span className={`text-sm font-medium ${color}`}>{bias}</span>
    </div>
  );
}

/**
 * Key drivers list component
 */
export function AIKeyDrivers({ drivers }: { drivers: AIKeyDriver[] }) {
  if (!drivers || drivers.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground">
        Key Drivers
      </h4>
      <div className="space-y-2">
        {drivers.map((driver, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
          >
            <Badge
              className={`text-xs ${getImportanceStyle(driver.importance)}`}
            >
              {driver.importance}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{driver.signal}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {driver.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Action items list component
 */
export function AIActionItems({ items }: { items: AIActionItem[] }) {
  if (!items || items.length === 0) return null;

  // Sort by priority
  const sortedItems = [...items].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground">
        Recommended Actions
      </h4>
      <div className="space-y-2">
        {sortedItems.map((item, idx) => {
          const { style, icon } = getTimeframeStyle(item.timeframe);
          return (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {item.priority}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{item.action}</p>
                {item.price_level && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Price level: ${item.price_level.toFixed(2)}
                  </p>
                )}
              </div>
              <Badge className={`text-xs flex items-center gap-1 ${style}`}>
                {icon}
                {item.timeframe.replace("_", " ")}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Risk factors list component
 */
export function AIRiskFactors({ factors }: { factors: string[] }) {
  if (!factors || factors.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        Risk Factors
      </h4>
      <ul className="space-y-1">
        {factors.map((factor, idx) => (
          <li
            key={idx}
            className="text-sm text-muted-foreground flex items-start gap-2"
          >
            <span className="text-yellow-500 mt-1">•</span>
            {factor}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Confidence score display
 */
export function AIConfidenceScore({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">AI Confidence:</span>
      <span className={`text-sm font-bold ${getColor()}`}>{score}%</span>
    </div>
  );
}

/**
 * Main AI Insights Panel component.
 * Displays AI analysis with summary, market bias, key drivers, and action items.
 */
export function AIInsightsPanel({
  analysis,
  tool,
  defaultCollapsed = false,
  title = "AI Insights",
}: AIInsightsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className="border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {title}
            {tool && (
              <Badge variant="outline" className="text-xs font-normal">
                {tool.replace(/_/g, " ")}
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-3">
            {analysis.confidence_score && (
              <AIConfidenceScore score={analysis.confidence_score} />
            )}

            {analysis.market_bias && (
              <AIMarketBias bias={analysis.market_bias} />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Summary
            </h4>
            <p className="text-sm leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Bias Explanation */}
          {analysis.bias_explanation && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Bias Analysis
              </h4>
              <p className="text-sm text-muted-foreground">
                {analysis.bias_explanation}
              </p>
            </div>
          )}

          {/* Key Drivers */}
          {analysis.key_drivers && analysis.key_drivers.length > 0 && (
            <AIKeyDrivers drivers={analysis.key_drivers} />
          )}

          {/* Action Items */}
          {analysis.action_items && analysis.action_items.length > 0 && (
            <AIActionItems items={analysis.action_items} />
          )}

          {/* Risk Factors */}
          {analysis.risk_factors && analysis.risk_factors.length > 0 && (
            <AIRiskFactors factors={analysis.risk_factors} />
          )}

          {/* Generation timestamp */}
          {analysis.generated_at && (
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Generated: {new Date(analysis.generated_at).toLocaleString()}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
