import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const sampleTrades = [
  { symbol: 'NVDA', entry: 142.30, stop: 135.50, target: 152.80, bias: 'Bullish', quality: 'HIGH' },
  { symbol: 'MSFT', entry: 438.20, stop: 428.40, target: 455.80, bias: 'Bullish', quality: 'HIGH' },
  { symbol: 'GOOGL', entry: 188.50, stop: 180.10, target: 201.30, bias: 'Bullish', quality: 'MEDIUM' },
];

export function ScannerPreview() {
  return (
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Find Trades in Seconds</h2>
        <p className="text-muted-foreground">Scan 500+ stocks and find the best setups automatically</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Today's Top 3 Setups (S&P 500)</CardTitle>
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
                  {sampleTrades.map((trade) => (
                    <tr key={trade.symbol} className="border-b last:border-b-0">
                      <td className="py-3 font-semibold">{trade.symbol}</td>
                      <td className="text-right">${trade.entry}</td>
                      <td className="text-right text-red-500">${trade.stop}</td>
                      <td className="text-right text-green-500">${trade.target}</td>
                      <td className="text-center">
                        <Badge variant="outline" className="bg-green-500/10">
                          {trade.bias}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge
                          className={
                            trade.quality === 'HIGH'
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                          }
                        >
                          {trade.quality}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Free users see 5 results. Pro users see 25. Max users see all 50 results across multiple universes.
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
