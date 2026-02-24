import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface AnalysisData {
  symbol: string;
  signals?: any[];
  summary?: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  indicators?: Record<string, any>;
}

export function SampleTradePlan({ data }: { data?: AnalysisData | null }) {
  const hasData = !!data && data.signals && data.signals.length > 0;
  const symbol = data?.symbol || "[Symbol]";
  const bullishCount = data?.summary?.bullish || 0;
  const bearishCount = data?.summary?.bearish || 0;
  const neutralCount = data?.summary?.neutral || 0;
  const totalSignals = bullishCount + bearishCount + neutralCount;
  const topSignal =
    data?.signals?.[0]?.signal || data?.signals?.[0]?.name || "[Signal]";

  const getQualityBadge = () => {
    if (bullishCount > 70)
      return { label: "VERY BULLISH", color: "bg-green-500" };
    if (bullishCount > 50) return { label: "BULLISH", color: "bg-green-600" };
    if (bearishCount > 50) return { label: "BEARISH", color: "bg-red-600" };
    return { label: "NEUTRAL", color: "bg-gray-500" };
  };

  const quality = getQualityBadge();

  return (
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">See What You Get</h2>
        <p className="text-muted-foreground">
          {hasData
            ? "🔴 Live Signal Analysis"
            : "Risk-qualified trade plans with entry, stop, and target prices"}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{symbol}</CardTitle>
                <CardDescription>
                  {hasData
                    ? `${totalSignals} Signals Analyzed • ${bullishCount} Bullish • ${bearishCount} Bearish`
                    : "Apple Inc. • Swing Trade • Bullish Bias"}
                </CardDescription>
              </div>
              <Badge className={quality.color}>{quality.label}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Bullish Signals
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {bullishCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Bearish Signals
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {bearishCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Signal Score
                </p>
                <p className="text-2xl font-bold">
                  {totalSignals > 0
                    ? Math.round((bullishCount / totalSignals) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div>
                <p className="text-xs text-muted-foreground">Total Signals</p>
                <p className="text-lg font-semibold">{totalSignals}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Consensus</p>
                <p className="text-lg font-semibold">
                  {bullishCount > bearishCount
                    ? "🟢 BULLISH"
                    : bullishCount < bearishCount
                      ? "🔴 BEARISH"
                      : "⚪ NEUTRAL"}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Top Signal</p>
              <Badge variant="outline" className="bg-blue-500/10">
                {topSignal}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Analysis includes:
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✓ 150+ technical signal analysis</li>
                <li>✓ Risk/reward assessment</li>
                <li>✓ Volatility regime analysis</li>
                <li>✓ Support & resistance levels</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {hasData ? (
              <>
                <span className="font-semibold">🔴 Live analysis from GCP</span>{" "}
                • Sign up to see real-time trade plans for any stock with entry,
                stop, and target prices.
              </>
            ) : (
              <>
                This is a sample. Sign up free to see real-time trade plans for
                any stock.
              </>
            )}
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="/sign-up">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
