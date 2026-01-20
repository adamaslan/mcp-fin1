"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Users,
  Building2,
} from "lucide-react";

interface FundamentalMetrics {
  marketCap: string;
  peRatio: number | null;
  forwardPE: number | null;
  pegRatio: number | null;
  eps: number;
  epsGrowth: number;
  revenue: string;
  revenueGrowth: number;
  profitMargin: number;
  operatingMargin: number;
  roe: number;
  debtToEquity: number;
  dividendYield: number | null;
  payoutRatio: number | null;
  beta: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  avgVolume: string;
  sharesOutstanding: string;
  institutionalOwnership: number;
}

// Mock data - in production, fetch from API
const MOCK_FUNDAMENTALS: FundamentalMetrics = {
  marketCap: "$3.45T",
  peRatio: 32.5,
  forwardPE: 28.4,
  pegRatio: 2.1,
  eps: 6.42,
  epsGrowth: 12.3,
  revenue: "$394.3B",
  revenueGrowth: 8.2,
  profitMargin: 24.8,
  operatingMargin: 30.5,
  roe: 147.3,
  debtToEquity: 1.87,
  dividendYield: 0.52,
  payoutRatio: 15.8,
  beta: 1.28,
  fiftyTwoWeekHigh: 199.62,
  fiftyTwoWeekLow: 143.9,
  avgVolume: "54.2M",
  sharesOutstanding: "15.44B",
  institutionalOwnership: 60.8,
};

interface FundamentalDataProps {
  symbol: string;
  data?: FundamentalMetrics;
}

function MetricCard({
  label,
  value,
  suffix = "",
  trend,
  icon,
}: {
  label: string;
  value: string | number | null;
  suffix?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}) {
  const displayValue = value === null ? "N/A" : `${value}${suffix}`;

  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">{displayValue}</span>
        {trend && (
          <span
            className={
              trend === "up"
                ? "text-green-500"
                : trend === "down"
                  ? "text-red-500"
                  : "text-gray-500"
            }
          >
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4" />
            ) : trend === "down" ? (
              <TrendingDown className="h-4 w-4" />
            ) : null}
          </span>
        )}
      </div>
    </div>
  );
}

export function FundamentalData({
  symbol,
  data = MOCK_FUNDAMENTALS,
}: FundamentalDataProps) {
  const currentPrice = 185.42; // Mock current price
  const percentFromHigh =
    ((data.fiftyTwoWeekHigh - currentPrice) / data.fiftyTwoWeekHigh) * 100;
  const percentFromLow =
    ((currentPrice - data.fiftyTwoWeekLow) / data.fiftyTwoWeekLow) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Fundamental Data
            </CardTitle>
            <CardDescription>
              Key financial metrics for {symbol}
            </CardDescription>
          </div>
          <Badge variant="secondary">Quarterly</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Valuation */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Valuation
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Market Cap" value={data.marketCap} />
            <MetricCard
              label="P/E Ratio"
              value={data.peRatio?.toFixed(1) ?? null}
            />
            <MetricCard
              label="Forward P/E"
              value={data.forwardPE?.toFixed(1) ?? null}
            />
            <MetricCard
              label="PEG Ratio"
              value={data.pegRatio?.toFixed(2) ?? null}
            />
          </div>
        </div>

        {/* Profitability */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Profitability
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="EPS"
              value={data.eps.toFixed(2)}
              suffix=""
              icon={<DollarSign className="h-3 w-3" />}
            />
            <MetricCard
              label="EPS Growth"
              value={data.epsGrowth.toFixed(1)}
              suffix="%"
              trend={data.epsGrowth > 0 ? "up" : "down"}
            />
            <MetricCard label="Revenue" value={data.revenue} />
            <MetricCard
              label="Rev Growth"
              value={data.revenueGrowth.toFixed(1)}
              suffix="%"
              trend={data.revenueGrowth > 0 ? "up" : "down"}
            />
          </div>
        </div>

        {/* Margins & Returns */}
        <div>
          <h4 className="text-sm font-medium mb-3">Margins & Returns</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Profit Margin"
              value={data.profitMargin.toFixed(1)}
              suffix="%"
            />
            <MetricCard
              label="Operating Margin"
              value={data.operatingMargin.toFixed(1)}
              suffix="%"
            />
            <MetricCard label="ROE" value={data.roe.toFixed(1)} suffix="%" />
            <MetricCard
              label="Debt/Equity"
              value={data.debtToEquity.toFixed(2)}
            />
          </div>
        </div>

        {/* Dividends */}
        {data.dividendYield && (
          <div>
            <h4 className="text-sm font-medium mb-3">Dividends</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard
                label="Dividend Yield"
                value={data.dividendYield?.toFixed(2) ?? null}
                suffix="%"
              />
              <MetricCard
                label="Payout Ratio"
                value={data.payoutRatio?.toFixed(1) ?? null}
                suffix="%"
              />
            </div>
          </div>
        )}

        {/* Trading Info */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Trading Information
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Beta" value={data.beta.toFixed(2)} />
            <MetricCard label="Avg Volume" value={data.avgVolume} />
            <MetricCard label="Shares Out" value={data.sharesOutstanding} />
            <MetricCard
              label="Institutional"
              value={data.institutionalOwnership.toFixed(1)}
              suffix="%"
              icon={<Building2 className="h-3 w-3" />}
            />
          </div>
        </div>

        {/* 52-Week Range */}
        <div>
          <h4 className="text-sm font-medium mb-3">52-Week Range</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${data.fiftyTwoWeekLow.toFixed(2)}
              </span>
              <span className="font-medium">${currentPrice.toFixed(2)}</span>
              <span className="text-muted-foreground">
                ${data.fiftyTwoWeekHigh.toFixed(2)}
              </span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-primary"
                style={{
                  left: "0%",
                  width: `${
                    ((currentPrice - data.fiftyTwoWeekLow) /
                      (data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow)) *
                    100
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>+{percentFromLow.toFixed(1)}% from low</span>
              <span>-{percentFromHigh.toFixed(1)}% from high</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
