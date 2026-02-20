"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Target,
  GitCompareArrows,
  Search,
  ScanLine,
  ShieldAlert,
  Newspaper,
  LineChart,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  icon: React.ElementType;
  tier: "free" | "pro";
  headline: string;
  description: string;
  highlights: string[];
  stat: string;
  statLabel: string;
}

const TOOLS: Tool[] = [
  {
    id: "analyze_security",
    name: "Analyze Security",
    icon: BarChart3,
    tier: "free",
    headline: "Deep-dive any stock with 150+ signals",
    description:
      "Run a comprehensive technical analysis on any ticker. Get bullish/bearish signal counts, a consensus score, volatility regime, and support/resistance levels — all from one command.",
    highlights: [
      "150+ technical signals scored",
      "Volatility regime detection",
      "Support & resistance mapping",
      "Bullish/bearish consensus score",
    ],
    stat: "150+",
    statLabel: "Signals Analyzed",
  },
  {
    id: "analyze_fibonacci",
    name: "Fibonacci Analysis",
    icon: TrendingUp,
    tier: "free",
    headline: "40+ Fibonacci levels with confluence detection",
    description:
      "Go beyond basic retracements. Get extensions, projections, harmonic patterns, golden pocket detection, and multi-timeframe confluence zones that pinpoint high-probability reversal areas.",
    highlights: [
      "40+ Fibonacci levels (23.6%–423.6%)",
      "Golden Pocket detection",
      "Multi-timeframe confluence zones",
      "Harmonic pattern recognition",
    ],
    stat: "200+",
    statLabel: "Fibonacci Signals",
  },
  {
    id: "get_trade_plan",
    name: "Trade Plan",
    icon: Target,
    tier: "free",
    headline: "Risk-qualified plans with exact entry, stop, and target",
    description:
      "Get a complete trade plan with precise entry price, stop loss, and profit target calculated from real market data. Includes risk/reward ratio, position sizing guidance, and quality scoring.",
    highlights: [
      "Exact entry, stop, and target prices",
      "Risk/reward ratio calculation",
      "Signal quality scoring",
      "Position sizing guidance",
    ],
    stat: "3",
    statLabel: "Price Levels per Trade",
  },
  {
    id: "compare_securities",
    name: "Compare Securities",
    icon: GitCompareArrows,
    tier: "pro",
    headline: "Compare stocks head-to-head on every metric",
    description:
      "Put two or more tickers side by side and compare their technical profiles, momentum, volatility, and signal strength. Instantly see which stock has the stronger setup.",
    highlights: [
      "Side-by-side signal comparison",
      "Relative strength ranking",
      "Momentum & volatility metrics",
      "Best-setup identification",
    ],
    stat: "2-5",
    statLabel: "Stocks Compared at Once",
  },
  {
    id: "screen_securities",
    name: "Screen Securities",
    icon: Search,
    tier: "pro",
    headline: "Filter the universe by technical criteria",
    description:
      "Screen hundreds of stocks by signal strength, trend direction, volatility, and more. Narrow a 500-stock universe down to the handful that match your exact criteria.",
    highlights: [
      "Multi-criteria filtering",
      "Signal strength thresholds",
      "Trend & momentum filters",
      "Custom universe selection",
    ],
    stat: "500+",
    statLabel: "Stocks Screened",
  },
  {
    id: "scan_trades",
    name: "Scan Trades",
    icon: ScanLine,
    tier: "pro",
    headline: "Find the best setups across the entire market",
    description:
      "Automatically scan entire stock universes and surface the top-quality trade setups with entry, stop, and target already calculated. Stop searching — let the scanner find trades for you.",
    highlights: [
      "Auto-ranked by quality score",
      "Entry/stop/target pre-calculated",
      "Multi-universe scanning",
      "Bias & timeframe filtering",
    ],
    stat: "50+",
    statLabel: "Setups Found per Scan",
  },
  {
    id: "portfolio_risk",
    name: "Portfolio Risk",
    icon: ShieldAlert,
    tier: "pro",
    headline: "Know your real portfolio risk before it's too late",
    description:
      "Assess aggregate risk across all your positions. See sector concentration, correlation risk, total exposure, and get alerts when your portfolio is overweight in a single direction.",
    highlights: [
      "Aggregate risk scoring",
      "Sector concentration analysis",
      "Correlation risk detection",
      "Overexposure alerts",
    ],
    stat: "360°",
    statLabel: "Risk View",
  },
  {
    id: "morning_brief",
    name: "Morning Brief",
    icon: Newspaper,
    tier: "pro",
    headline: "Start every trading day with a market briefing",
    description:
      "Get a daily summary of market conditions, key themes, sector rotation, and overnight developments. Know what moved and why before you place a single trade.",
    highlights: [
      "Pre-market sentiment summary",
      "Key themes & catalysts",
      "Sector rotation signals",
      "Overnight developments",
    ],
    stat: "Daily",
    statLabel: "Market Intelligence",
  },
  {
    id: "options_risk_analysis",
    name: "Options Risk Analysis",
    icon: LineChart,
    tier: "pro",
    headline: "Understand options risk with IV, Greeks, and PCR",
    description:
      "Analyze the options chain for any stock. See implied volatility, put/call ratios, and Greeks-based risk metrics to understand how the options market is pricing risk.",
    highlights: [
      "Implied volatility analysis",
      "Put/call ratio (PCR)",
      "Greeks-based risk metrics",
      "Options chain insights",
    ],
    stat: "IV + Greeks",
    statLabel: "Options Intelligence",
  },
];

function ToolCard({
  tool,
  isActive,
  onClick,
}: {
  tool: Tool;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-primary/10 border border-primary/30 shadow-sm"
          : "hover:bg-muted/50 border border-transparent"
      }`}
    >
      <tool.icon
        className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}
          >
            {tool.name}
          </span>
          {tool.tier === "pro" && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 flex-shrink-0"
            >
              PRO
            </Badge>
          )}
        </div>
      </div>
      <ChevronRight
        className={`h-4 w-4 flex-shrink-0 transition-transform ${isActive ? "text-primary rotate-90" : "text-muted-foreground"}`}
      />
    </button>
  );
}

export function ToolShowcase() {
  const [activeToolId, setActiveToolId] = useState(TOOLS[0].id);
  const activeTool = TOOLS.find((t) => t.id === activeToolId) || TOOLS[0];

  return (
    <section className="py-20 border-t bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span>9 Professional Analysis Tools</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            One Platform. Every Tool You Need.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From quick stock scans to deep options analysis — each tool is
            powered by real market data and runs on Google Cloud for speed and
            reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Tool selector - left side */}
          <div className="lg:col-span-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4">
              Free Tools
            </p>
            {TOOLS.filter((t) => t.tier === "free").map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isActive={activeToolId === tool.id}
                onClick={() => setActiveToolId(tool.id)}
              />
            ))}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6 px-4">
              Pro Tools
            </p>
            {TOOLS.filter((t) => t.tier === "pro").map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isActive={activeToolId === tool.id}
                onClick={() => setActiveToolId(tool.id)}
              />
            ))}
          </div>

          {/* Tool detail - right side */}
          <div className="lg:col-span-8">
            <Card className="h-full border-primary/10 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <activeTool.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-bold">{activeTool.name}</h3>
                      <Badge
                        variant={
                          activeTool.tier === "free" ? "secondary" : "default"
                        }
                        className={
                          activeTool.tier === "free"
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : ""
                        }
                      >
                        {activeTool.tier === "free" ? "Free" : "Pro"}
                      </Badge>
                    </div>
                    <p className="text-lg font-medium text-primary">
                      {activeTool.headline}
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {activeTool.description}
                </p>

                {/* Stat callout */}
                <div className="flex items-center gap-6 mb-8 p-4 bg-muted/50 rounded-xl">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {activeTool.stat}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activeTool.statLabel}
                    </div>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div className="text-sm text-muted-foreground">
                    Powered by real-time market data from Google Cloud. No mock
                    data, no delays — live results every time.
                  </div>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeTool.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            3 tools free forever. Upgrade to Pro for all 9 tools + AI insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <a href="/sign-up">
                Try Free Tools Now
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#pricing">See Pricing</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
