"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Waves, Zap, ArrowRight } from "lucide-react";

// Demo data for landing page (no API calls)
const DEMO_LEVELS = [
  { name: "23.6%", price: 178.45, strength: "MODERATE", distance: 0.012 },
  { name: "38.2%", price: 174.32, strength: "SIGNIFICANT", distance: 0.035 },
  { name: "50.0%", price: 171.2, strength: "STRONG", distance: 0.053 },
  { name: "61.8%", price: 168.08, strength: "STRONG", distance: 0.071 },
  { name: "78.6%", price: 164.15, strength: "MODERATE", distance: 0.093 },
];

const DEMO_SIGNALS = [
  {
    signal: "FIB RETRACE 61.8%",
    description: "Price approaching key Fibonacci support level",
    strength: "STRONG",
    category: "FIB_PRICE_LEVEL",
  },
  {
    signal: "FIB BOUNCE DETECTED",
    description: "Bullish bounce off 50% retracement level",
    strength: "SIGNIFICANT",
    category: "FIB_BOUNCE",
  },
  {
    signal: "GOLDEN POCKET",
    description: "Price within 61.8%-65% zone (Golden Pocket)",
    strength: "STRONG",
    category: "FIB_GOLDEN_POCKET",
  },
  {
    signal: "FIB CLUSTER SUPPORT",
    description: "3 Fibonacci levels converging at $168",
    strength: "SIGNIFICANT",
    category: "FIB_CLUSTER",
  },
  {
    signal: "FIB MA CONFLUENCE",
    description: "50% retracement aligns with 50-day MA",
    strength: "MODERATE",
    category: "FIB_MA_CONFLUENCE",
  },
];

const DEMO_CLUSTERS = [
  {
    centerPrice: 168.5,
    levels: ["61.8%", "50.0% Ext", "127.2% Proj"],
    count: 3,
    strength: "STRONG",
  },
  {
    centerPrice: 174.2,
    levels: ["38.2%", "78.6% Ext"],
    count: 2,
    strength: "MODERATE",
  },
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

export function FibonacciPreview() {
  return (
    <section className="py-16 border-t">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Advanced Fibonacci Analysis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            200+ Fibonacci signals including retracements, extensions, harmonic
            patterns, and multi-timeframe confluences
          </p>
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
                {DEMO_LEVELS.map((level) => (
                  <div
                    key={level.name}
                    className="flex justify-between items-center p-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <span className="font-mono font-semibold">
                        {level.name}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {(level.distance * 100).toFixed(1)}% away
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">${level.price}</div>
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
                Live Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DEMO_SIGNALS.slice(0, 3).map((signal, i) => (
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
                    Showing 3 of 5 signals
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
                {DEMO_CLUSTERS.map((cluster, i) => (
                  <div
                    key={i}
                    className="p-3 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline" className="text-xs">
                        {cluster.count} levels
                      </Badge>
                      <span className="font-mono text-sm font-semibold">
                        ${cluster.centerPrice.toFixed(2)}
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
