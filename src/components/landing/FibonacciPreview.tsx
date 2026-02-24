import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Waves, Zap, ArrowRight } from "lucide-react";

interface FibLevel {
  name: string;
  price?: number;
  strength: string;
  distanceFromCurrent?: number;
}

interface FibSignal {
  signal: string;
  description: string;
  strength: string;
  category: string;
}

interface FibCluster {
  centerPrice?: number;
  levels: string[];
  levelCount: number;
  strength: string;
}

interface FibonacciData {
  symbol: string;
  price: number;
  levels: FibLevel[];
  signals: FibSignal[];
  clusters: FibCluster[];
  summary?: {
    totalSignals: number;
    strongestLevel?: string;
    confluenceZoneCount?: number;
  };
}

// Fallback data when MCP backend is unavailable
const DEMO_LEVELS: FibLevel[] = [
  { name: "23.6%", strength: "MODERATE", distanceFromCurrent: 0.012 },
  { name: "38.2%", strength: "SIGNIFICANT", distanceFromCurrent: 0.035 },
  { name: "50.0%", strength: "STRONG", distanceFromCurrent: 0.053 },
  { name: "61.8%", strength: "STRONG", distanceFromCurrent: 0.071 },
  { name: "78.6%", strength: "MODERATE", distanceFromCurrent: 0.093 },
];

const DEMO_SIGNALS: FibSignal[] = [
  {
    signal: "FIB RETRACE 61.8%",
    description: "Fibonacci retracement signal",
    strength: "STRONG",
    category: "FIB_PRICE_LEVEL",
  },
  {
    signal: "FIB BOUNCE DETECTED",
    description: "Fibonacci bounce signal",
    strength: "SIGNIFICANT",
    category: "FIB_BOUNCE",
  },
  {
    signal: "GOLDEN POCKET",
    description: "Fibonacci confluence zone",
    strength: "STRONG",
    category: "FIB_GOLDEN_POCKET",
  },
];

const DEMO_CLUSTERS: FibCluster[] = [
  {
    levels: ["61.8%", "50.0% Ext", "127.2% Proj"],
    levelCount: 3,
    strength: "STRONG",
  },
  { levels: ["38.2%", "78.6% Ext"], levelCount: 2, strength: "MODERATE" },
];

interface FeatureBadgeProps {
  icon: React.ElementType;
  label: string;
}

function FeatureBadge({ icon: Icon, label }: FeatureBadgeProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function getStrengthColor(strength: string): string {
  switch (strength.toUpperCase()) {
    case "STRONG":
      return "bg-green-500";
    case "SIGNIFICANT":
      return "bg-blue-500";
    case "MODERATE":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
}

export function FibonacciPreview({ data }: { data?: FibonacciData | null }) {
  const hasData = !!data && data.levels && data.levels.length > 0;
  const levels = hasData ? data.levels : DEMO_LEVELS;
  const signals = hasData ? data.signals : DEMO_SIGNALS;
  const clusters = hasData ? data.clusters : DEMO_CLUSTERS;
  const symbol = data?.symbol;
  const totalSignals = data?.summary?.totalSignals ?? 0;

  return (
    <section className="py-16 border-t">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {hasData
              ? `Advanced Fibonacci Analysis — ${symbol}`
              : "Advanced Fibonacci Analysis"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {hasData
              ? `${totalSignals} Fibonacci signals detected for ${symbol} at $${data.price.toFixed(2)}`
              : "200+ Fibonacci signals including retracements, extensions, harmonic patterns, and multi-timeframe confluences"}
          </p>
          {hasData && (
            <Badge
              variant="outline"
              className="mt-3 text-green-600 border-green-500/30 bg-green-500/10"
            >
              Live Data
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Left: Fibonacci Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Price Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {levels.slice(0, 5).map((level, i) => (
                  <div
                    key={level.name + i}
                    className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <span className="font-mono font-semibold">
                        {level.name}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {((level.distanceFromCurrent ?? 0) * 100).toFixed(1)}%
                        away
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-muted-foreground">
                        {hasData && level.price
                          ? `$${level.price.toFixed(2)}`
                          : "[Price Data]"}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStrengthColor(level.strength)} text-white border-none`}
                      >
                        {level.strength}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
                Free: 3 basic levels • Pro: 40+ levels • Max: All levels
              </div>
            </CardContent>
          </Card>

          {/* Middle: Active Signals (highlighted) */}
          <Card className="border-primary shadow-lg md:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {hasData ? "Live Signals" : "Signals"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signals.slice(0, 3).map((signal, i) => (
                  <div key={i} className="border-l-2 border-primary pl-3 py-2">
                    <div className="font-semibold text-sm mb-1">
                      {signal.signal}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {signal.description}
                    </div>
                    <Badge
                      className={`${getStrengthColor(signal.strength)} text-white text-xs`}
                    >
                      {signal.strength}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {hasData
                      ? `Showing 3 of ${totalSignals} signals`
                      : "Showing 3 of 5 signals"}
                  </span>
                  <br />
                  Free: 3 signals • Pro: 15 signals • Max: Unlimited
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right: Confluence Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-primary" />
                Confluence Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clusters.slice(0, 3).map((cluster, i) => (
                  <div
                    key={i}
                    className="p-3 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline" className="text-xs">
                        {cluster.levelCount} levels
                      </Badge>
                      <span className="font-mono text-sm font-semibold text-muted-foreground">
                        {hasData && cluster.centerPrice
                          ? `$${cluster.centerPrice.toFixed(2)}`
                          : "[Price Zone]"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {cluster.levels.join(" + ")}
                    </div>
                    <Badge
                      className={`${getStrengthColor(cluster.strength)} text-white text-xs`}
                    >
                      {cluster.strength}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
                Clusters identify key support/resistance zones where multiple
                Fibonacci levels converge
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          <FeatureBadge icon={TrendingUp} label="23.6%-423.6% Levels" />
          <FeatureBadge icon={Target} label="Golden Pocket" />
          <FeatureBadge icon={Waves} label="Harmonic Patterns" />
          <FeatureBadge icon={Zap} label="Multi-Timeframe" />
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Button asChild size="lg" className="gap-2">
            <a href="/sign-up">
              Start Analyzing with Fibonacci
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
