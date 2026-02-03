import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Trade {
  symbol: string;
  entry_price?: number;
  stop_loss?: number;
  target_price?: number;
  timeframe?: string;
  bias?: string;
  signal_quality?: string;
  risk_reward?: number;
}

// Placeholder structure - no real price data
// Real trades require live connection to MCP server
const DEFAULT_TRADES: Trade[] = [
  {
    symbol: "SAMPLE1",
    bias: "Bullish",
    signal_quality: "HIGH",
  },
  {
    symbol: "SAMPLE2",
    bias: "Bullish",
    signal_quality: "HIGH",
  },
  {
    symbol: "SAMPLE3",
    bias: "Bullish",
    signal_quality: "MEDIUM",
  },
];

export function ScannerPreview({ trades }: { trades?: Trade[] | null }) {
  const displayTrades =
    trades && trades.length > 0 ? trades.slice(0, 5) : DEFAULT_TRADES;

  const getQualityColor = (quality?: string) => {
    if (!quality) return "bg-gray-500";
    if (quality.toUpperCase() === "HIGH" || quality.toUpperCase() === "STRONG")
      return "bg-green-500";
    if (quality.toUpperCase() === "MEDIUM") return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getBiasColor = (bias?: string) => {
    if (!bias) return "bg-gray-500/10";
    if (bias.toUpperCase() === "BULLISH") return "bg-green-500/10";
    if (bias.toUpperCase() === "BEARISH") return "bg-red-500/10";
    return "bg-gray-500/10";
  };

  return (
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Find Trades in Seconds</h2>
        <p className="text-muted-foreground">
          Scan 500+ stocks and find the best setups automatically
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {trades && trades.length > 0
                ? "Today's Top 5 Setups (S&P 500) 🔴 LIVE"
                : "Today's Top 3 Setups (S&P 500)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Symbol</th>
                    <th className="text-right py-2">Entry</th>
                    <th className="text-right py-2">Stop</th>
                    <th className="text-right py-2">Target</th>
                    <th className="text-center py-2">Bias</th>
                    <th className="text-center py-2">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTrades.map((trade) => (
                    <tr key={trade.symbol} className="border-b last:border-b-0">
                      <td className="py-3 font-semibold">{trade.symbol}</td>
                      <td className="text-right text-muted-foreground">
                        [Entry]
                      </td>
                      <td className="text-right text-muted-foreground">
                        [Stop]
                      </td>
                      <td className="text-right text-muted-foreground">
                        [Target]
                      </td>
                      <td className="text-center">
                        <Badge
                          variant="outline"
                          className={getBiasColor(trade.bias)}
                        >
                          {trade.bias || "Neutral"}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge
                          className={getQualityColor(trade.signal_quality)}
                        >
                          {trade.signal_quality || "MEDIUM"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {trades && trades.length > 0 ? (
                  <>
                    <span className="font-semibold">🔴 Live data from GCP</span>{" "}
                    • Free users see 5 results. Pro users see 25. Max users see
                    all 50 results across multiple universes.
                  </>
                ) : (
                  <>
                    Free users see 5 results. Pro users see 25. Max users see
                    all 50 results across multiple universes.
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button asChild size="lg" className="gap-2">
            <a href="/sign-up">
              Start Scanning Now
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
