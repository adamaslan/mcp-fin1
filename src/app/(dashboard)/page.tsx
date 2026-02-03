import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Activity,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MarketBriefData {
  timestamp: string;
  market_status: {
    market_status: "OPEN" | "CLOSED" | "PRE_MARKET";
    futures_es: { change_percent: number };
    futures_nq: { change_percent: number };
    vix: number;
  };
  key_themes?: string[];
}

interface UsageStatsData {
  tier: "free" | "pro" | "max";
  date: string;
  analyses: {
    used: number;
    limit: number;
    remaining: number;
  };
  scans: {
    used: number;
    limit: number;
    remaining: number;
  };
}

async function getDashboardData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Fetch both in parallel
    const [briefRes, usageRes] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/morning-brief`, {
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/dashboard/usage-stats`, {
        cache: "no-store",
      }),
    ]);

    const briefData = briefRes.ok
      ? ((await briefRes.json()) as { success: boolean; data: MarketBriefData })
      : null;
    const usageData = usageRes.ok
      ? ((await usageRes.json()) as { success: boolean; data: UsageStatsData })
      : null;

    return {
      brief: briefData?.data || null,
      usage: usageData?.data || null,
      error:
        briefRes.ok && usageRes.ok ? null : "Failed to load dashboard data",
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return {
      brief: null,
      usage: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function getVixStatus(vix: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (vix > 20) {
    return { label: "High Volatility", color: "text-red-600", bg: "bg-red-50" };
  }
  if (vix > 15) {
    return {
      label: "Elevated",
      color: "text-orange-600",
      bg: "bg-orange-50",
    };
  }
  return {
    label: "Low Volatility",
    color: "text-green-600",
    bg: "bg-green-50",
  };
}

function ProgressBar({
  used,
  limit,
  label,
}: {
  used: number;
  limit: number;
  label: string;
}) {
  const percentage = limit === Infinity ? 0 : (used / limit) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {used}/{limit === Infinity ? "∞" : limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage > 80 ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { brief, usage, error } = await getDashboardData();

  const marketStatus = brief?.market_status;
  const vixStatus = marketStatus ? getVixStatus(marketStatus.vix) : null;

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">
          {brief
            ? "Here's your market snapshot and daily usage stats."
            : "Get started by analyzing a stock, running a scan, or checking your watchlist."}
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Some dashboard features may be unavailable.
          </AlertDescription>
        </Alert>
      )}

      {/* Market Snapshot and Usage Stats */}
      {brief && usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Market Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Market Snapshot
              </CardTitle>
              <CardDescription>
                {marketStatus?.market_status === "OPEN"
                  ? "Market is OPEN"
                  : "Market is CLOSED"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Futures ES */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ES Futures</p>
                  <p
                    className={`text-lg font-bold ${
                      (marketStatus?.futures_es.change_percent || 0) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(marketStatus?.futures_es.change_percent || 0).toFixed(2)}%
                  </p>
                </div>

                {/* Futures NQ */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">NQ Futures</p>
                  <p
                    className={`text-lg font-bold ${
                      (marketStatus?.futures_nq.change_percent || 0) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(marketStatus?.futures_nq.change_percent || 0).toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* VIX */}
              <div className="border-t pt-4 space-y-2">
                <p className="text-sm text-muted-foreground">VIX Level</p>
                <div className={`p-3 rounded-lg ${vixStatus?.bg}`}>
                  <p className={`text-2xl font-bold ${vixStatus?.color}`}>
                    {marketStatus?.vix.toFixed(2)}
                  </p>
                  <p className={`text-sm ${vixStatus?.color}`}>
                    {vixStatus?.label}
                  </p>
                </div>
              </div>

              {/* Key Themes */}
              {brief.key_themes && brief.key_themes.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm font-medium">Market Themes</p>
                  <ul className="space-y-1">
                    {brief.key_themes.slice(0, 3).map((theme, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {theme}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Daily Usage
              </CardTitle>
              <CardDescription>
                {usage.tier.toUpperCase()} Tier • {usage.date}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressBar
                used={usage.analyses.used}
                limit={usage.analyses.limit}
                label="Analyses"
              />
              <ProgressBar
                used={usage.scans.used}
                limit={usage.scans.limit}
                label="Scans"
              />

              {usage.analyses.remaining === 0 || usage.scans.remaining === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {usage.analyses.remaining === 0 &&
                    usage.scans.remaining === 0
                      ? "Daily limits reached for both analyses and scans."
                      : usage.analyses.remaining === 0
                        ? "Analysis limit reached for today."
                        : "Scan limit reached for today."}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    ✓ You have room for more analyses and scans today.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analyze a Stock
            </CardTitle>
            <CardDescription>Get 150+ signals for any ticker</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full gap-2">
              <a href="/analyze/AAPL">
                Start Analysis <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Scan for Trades
            </CardTitle>
            <CardDescription>Find qualified trade setups</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full gap-2">
              <a href="/scanner">
                Start Scan <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learn Signals
            </CardTitle>
            <CardDescription>Understand the signals</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full gap-2">
              <a href="/learn/signals">
                View Signals <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting started guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            New to MCP Finance? Here&apos;s how to get the most out of your
            dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1</span>
              <span>
                <strong>Analyze Securities:</strong> Paste any ticker symbol to
                see technical signals, indicators, and risk assessment.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2</span>
              <span>
                <strong>Scan Universes:</strong> Automatically find stocks
                matching your criteria across 500+ companies.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3</span>
              <span>
                <strong>Build Watchlists:</strong> Save your favorite stocks and
                track their signals daily.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4</span>
              <span>
                <strong>Track Portfolio Risk:</strong> (Pro+) Monitor aggregate
                risk across your positions.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
