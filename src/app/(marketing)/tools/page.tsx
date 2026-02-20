import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const TOOLS = [
  {
    id: "analyze_security",
    name: "Analyze Security",
    icon: "📊",
    description:
      "Deep analysis with 150+ signals to identify technical levels, trend strength, and trading opportunities",
    tier: "free",
    features: ["150+ signals", "Trend analysis", "Technical levels"],
  },
  {
    id: "analyze_fibonacci",
    name: "Fibonacci Analysis",
    icon: "📈",
    description:
      "40+ Fibonacci levels with 200+ signals and confluence zones to identify key price targets",
    tier: "free",
    features: ["40+ levels", "Confluence zones", "200+ signals"],
  },
  {
    id: "get_trade_plan",
    name: "Trade Plan",
    icon: "🎯",
    description:
      "Generate risk-qualified trade plans with entry points, stop losses, and profit targets",
    tier: "free",
    features: ["Entry points", "Risk management", "Profit targets"],
  },
  {
    id: "compare_securities",
    name: "Compare Securities",
    icon: "⚖️",
    description:
      "Compare multiple stocks side-by-side with technical analysis and key metrics",
    tier: "pro",
    features: ["Side-by-side", "Technical metrics", "Comparative analysis"],
  },
  {
    id: "screen_securities",
    name: "Screen Securities",
    icon: "🔍",
    description:
      "Screen the market universe by technical criteria to find stocks matching your strategy",
    tier: "pro",
    features: ["Custom screening", "Technical filters", "Market universe"],
  },
  {
    id: "scan_trades",
    name: "Scan Trades",
    icon: "📡",
    description:
      "Real-time trade scanning with technical signals and market opportunities",
    tier: "pro",
    features: ["Real-time scanning", "Signal detection", "Opportunity alerts"],
  },
  {
    id: "portfolio_risk",
    name: "Portfolio Risk",
    icon: "⚠️",
    description:
      "Analyze portfolio risk exposure and correlation between holdings",
    tier: "pro",
    features: ["Risk exposure", "Correlation analysis", "Portfolio metrics"],
  },
  {
    id: "morning_brief",
    name: "Morning Brief",
    icon: "☀️",
    description:
      "Daily market overview with key themes, technical levels, and trading opportunities",
    tier: "pro",
    features: ["Market overview", "Key themes", "Daily analysis"],
  },
  {
    id: "options_risk_analysis",
    name: "Options Risk Analysis",
    icon: "💰",
    description:
      "Analyze options strategies with risk-reward assessment and Greeks analysis",
    tier: "max",
    features: ["Strategy analysis", "Greeks analysis", "Risk assessment"],
  },
];

const tierColors = {
  free: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  pro: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  max: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export default function ToolsPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Analysis Tools</h1>
        <p className="text-lg text-muted-foreground">
          Powerful technical analysis tools to help you make smarter trading
          decisions. Choose the plan that fits your needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => (
          <Card key={tool.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{tool.icon}</span>
                <Badge
                  className={tierColors[tool.tier as keyof typeof tierColors]}
                >
                  {tool.tier}
                </Badge>
              </div>
              <CardTitle>{tool.name}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-2 mb-6 flex-1">
                {tool.features.map((feature) => (
                  <li key={feature} className="text-sm flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link
                  href={`/tools/${tool.id.replace(/_/g, "-")}`}
                  className="flex items-center justify-center gap-2"
                >
                  Try Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-6">
          Sign in to access all tools based on your subscription plan
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
