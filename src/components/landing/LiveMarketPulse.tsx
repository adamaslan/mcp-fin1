import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketData {
  status: string;
  futuresES: number;
  futuresNQ: number;
  vix: number;
  economicEvents?: any[];
}

export function LiveMarketPulse({ data }: { data?: MarketData | null }) {
  const hasData = data !== null && data !== undefined;
  const esChange =
    hasData && typeof data.futuresES === "number" ? data.futuresES : 0;
  const nqChange =
    hasData && typeof data.futuresNQ === "number" ? data.futuresNQ : 0;
  const vixValue = hasData && typeof data.vix === "number" ? data.vix : 0;

  const getVixSentiment = (vix: number) => {
    if (vix < 15) return "Low volatility";
    if (vix < 20) return "Normal volatility";
    if (vix < 30) return "Elevated volatility";
    return "High volatility";
  };

  const isESUp = esChange >= 0;
  const isNQUp = nqChange >= 0;

  return (
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Live Market Pulse</h2>
        <p className="text-muted-foreground">
          Real-time market status and sentiment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              S&P 500 Futures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="flex items-center gap-2">
                {isESUp ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                <span
                  className={`text-2xl font-bold ${isESUp ? "text-green-500" : "text-red-500"}`}
                >
                  {isESUp ? "+" : ""}
                  {esChange.toFixed(2)}%
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                [Data]
              </span>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Pre-market trading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              NASDAQ 100 Futures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="flex items-center gap-2">
                {isNQUp ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                <span
                  className={`text-2xl font-bold ${isNQUp ? "text-green-500" : "text-red-500"}`}
                >
                  {isNQUp ? "+" : ""}
                  {nqChange.toFixed(2)}%
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                [Data]
              </span>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Pre-market trading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">VIX Index</CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="flex items-center gap-2">
                {vixValue < 20 ? (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                )}
                <span className="text-2xl font-bold">
                  {vixValue.toFixed(1)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                [Data]
              </span>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {hasData ? getVixSentiment(vixValue) : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          {data ? (
            <>
              Market data is live from GCP. Sign in to see real-time analysis of
              your watchlist, trade opportunities, and risk metrics.
            </>
          ) : (
            <>
              Market data updates when you sign in. See real-time analysis of
              your watchlist, trade opportunities, and risk metrics.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
