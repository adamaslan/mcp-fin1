"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTier } from "@/hooks/useTier";
import { useLazyMCPQuery } from "@/hooks/useMCPQuery";
import { ParameterForm } from "@/components/mcp-control/ParameterForm";
import { PresetSelector } from "@/components/mcp-control/PresetSelector";
import { ResultsDisplay } from "@/components/mcp-control/ResultsDisplay";
import { Loader2, ArrowLeft } from "lucide-react";

interface ToolPageProps {
  toolId: string;
  toolName: string;
  description: string;
}

export function ToolPage({ toolId, toolName, description }: ToolPageProps) {
  const router = useRouter();
  const { tier } = useTier();
  const [useAi, setUseAi] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    loading,
    error: queryError,
    execute,
    reset,
    cancel,
  } = useLazyMCPQuery<any>();

  useEffect(() => {
    if (queryError) {
      setError(queryError);
    }
  }, [queryError]);

  const handleExecute = useCallback(async () => {
    if (!parameters || Object.keys(parameters).length === 0) {
      setError("Please fill in required parameters");
      return;
    }

    setError(null);
    setResult(null);

    const data: any = await execute("/api/gcloud/execute", {
      toolName: toolId,
      parameters,
      useAi: useAi && tier !== "free",
    });

    if (data) {
      setResult(data.result || data);
    }
  }, [toolId, parameters, useAi, tier, execute]);

  const handleReset = useCallback(() => {
    reset();
    setParameters({});
    setResult(null);
    setError(null);
  }, [reset]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{toolName}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        <Badge variant="outline">{tier}</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left panel: Parameters */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PresetSelector
                toolName={toolId}
                onLoadPreset={setParameters}
                tier={tier}
              />

              <ParameterForm
                toolName={toolId}
                parameters={parameters}
                onChange={setParameters}
                tier={tier}
              />

              {/* AI Insights Toggle - Pro only */}
              {tier !== "free" && (
                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAi}
                      onChange={(e) => setUseAi(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">
                      Include AI Insights
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Gemini 1.5 Flash analysis of results
                  </p>
                </div>
              )}

              <Button
                onClick={handleExecute}
                disabled={loading || Object.keys(parameters).length === 0}
                className="w-full"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? "Executing..." : "Execute Analysis"}
              </Button>

              {result && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  Clear Results
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right panel: Results */}
        <div className="lg:col-span-2">
          {error && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">
                  Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-destructive/80">{error}</p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing {toolName.toLowerCase()}...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && !loading && (
            <ResultsDisplay toolName={toolId} result={result} tier={tier} />
          )}

          {!result && !loading && !error && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Configure parameters and click Execute to see results
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
