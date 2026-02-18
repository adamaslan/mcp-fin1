"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTier } from "@/hooks/useTier";
import { useLazyMCPQuery } from "@/hooks/useMCPQuery";
import { TierGate } from "@/components/gating/TierGate";
import { ToolSelector } from "@/components/mcp-control/ToolSelector";
import { ParameterForm } from "@/components/mcp-control/ParameterForm";
import { PresetSelector } from "@/components/mcp-control/PresetSelector";
import { ResultsDisplay } from "@/components/mcp-control/ResultsDisplay";
import { Loader2 } from "lucide-react";

const MCP_TOOLS = [
  {
    id: "analyze_security",
    name: "Analyze Security",
    description: "Deep analysis with 150+ signals",
    icon: "📊",
    tier: "free" as const,
  },
  {
    id: "analyze_fibonacci",
    name: "Fibonacci Analysis",
    description: "40+ levels, 200+ signals, confluence zones",
    icon: "📈",
    tier: "free" as const,
  },
  {
    id: "get_trade_plan",
    name: "Trade Plan",
    description: "Risk-qualified trade plans with stops & targets",
    icon: "🎯",
    tier: "free" as const,
  },
  {
    id: "compare_securities",
    name: "Compare Securities",
    description: "Compare multiple stocks side-by-side",
    icon: "⚖️",
    tier: "pro" as const,
  },
  {
    id: "screen_securities",
    name: "Screen Securities",
    description: "Screen universe by technical criteria",
    icon: "🔍",
    tier: "pro" as const,
  },
  {
    id: "scan_trades",
    name: "Scan Trades",
    description: "Find qualified trade setups (1-10 per universe)",
    icon: "🔎",
    tier: "pro" as const,
  },
  {
    id: "portfolio_risk",
    name: "Portfolio Risk",
    description: "Assess aggregate portfolio risk",
    icon: "⚠️",
    tier: "pro" as const,
  },
  {
    id: "morning_brief",
    name: "Morning Brief",
    description: "Daily market briefing with key themes",
    icon: "📰",
    tier: "pro" as const,
  },
  {
    id: "options_risk_analysis",
    name: "Options Risk",
    description: "Options chain risk analysis (IV, Greeks, PCR)",
    icon: "📉",
    tier: "pro" as const,
  },
];

export default function MCPControlPage() {
  const router = useRouter();
  const { tier } = useTier();

  const [selectedTool, setSelectedTool] = useState<string>("analyze_security");
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const {
    loading,
    error: queryError,
    execute,
    cancel,
  } = useLazyMCPQuery<any>();

  const currentTool = MCP_TOOLS.find((t) => t.id === selectedTool);

  // Cancel in-flight request when tool selection changes
  useEffect(() => {
    cancel();
  }, [selectedTool, cancel]);

  const handleExecute = useCallback(async () => {
    if (!parameters.symbol && selectedTool !== "options_risk_analysis") {
      setError("Symbol is required");
      return;
    }

    setError(null);
    setResult(null);

    const startTime = performance.now();

    const data = await execute("/api/gcloud/execute", {
      toolName: selectedTool,
      parameters,
    });

    const endTime = performance.now();
    setExecutionTime(endTime - startTime);

    if (data) {
      setResult(data.result || data);
    }
  }, [selectedTool, parameters, execute]);

  // Update error state from query error
  useEffect(() => {
    if (queryError) {
      setError(queryError);
    }
  }, [queryError]);

  const handleClearForm = useCallback(() => {
    setParameters({});
    setResult(null);
    setError(null);
    cancel();
  }, [cancel]);

  const handleLoadPreset = useCallback((presetParams: Record<string, any>) => {
    setParameters(presetParams);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">MCP Control Center</h1>
          <Badge>{tier?.toUpperCase()}</Badge>
        </div>
        <p className="text-muted-foreground">
          Execute MCP tools with custom parameters. Real-time analysis powered
          by technical indicators and Gemini AI.
        </p>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Tool & Preset Selection */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tool Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <ToolSelector
                tools={MCP_TOOLS}
                selectedTool={selectedTool}
                onSelectTool={setSelectedTool}
                tier={tier}
              />
            </CardContent>
          </Card>

          {/* Tool Info */}
          {currentTool && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="text-3xl">{currentTool.icon}</div>
                  <div>
                    <h3 className="font-semibold">{currentTool.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentTool.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentTool.tier}</Badge>
                    {currentTool.tier === "pro" && tier === "free" && (
                      <Badge variant="destructive">Upgrade required</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preset Selector (Pro+ only) */}
          <TierGate feature="preset_selector" requiredTier="pro">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <PresetSelector
                  toolName={selectedTool}
                  onLoadPreset={handleLoadPreset}
                  tier={tier}
                />
              </CardContent>
            </Card>
          </TierGate>
        </div>

        {/* CENTER: Parameter Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Parameters</CardTitle>
                {Object.keys(parameters).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearForm}
                    className="h-6 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ParameterForm
                toolName={selectedTool}
                parameters={parameters}
                onChange={setParameters}
                tier={tier}
              />

              <Button
                onClick={handleExecute}
                disabled={
                  loading ||
                  (!parameters.symbol &&
                    selectedTool !== "options_risk_analysis")
                }
                className="w-full"
                size="lg"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Executing..." : "Execute"}
              </Button>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/30">
                  {error}
                </div>
              )}

              {executionTime && (
                <div className="text-xs text-muted-foreground text-center">
                  Completed in {executionTime.toFixed(0)}ms
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Results Display */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Results</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Executing {currentTool?.name.toLowerCase()}...
                  </p>
                </div>
              ) : result ? (
                <ResultsDisplay
                  toolName={selectedTool}
                  result={result}
                  tier={tier}
                />
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <p className="text-sm">
                    Configure parameters and click Execute to see results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
