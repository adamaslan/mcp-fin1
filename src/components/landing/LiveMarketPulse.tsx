import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function LiveMarketPulse() {
  return (
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Live Market Pulse</h2>
        <p className="text-muted-foreground">Real-time market status and sentiment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">S&P 500 Futures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">+0.45%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Pre-market trading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">NASDAQ 100 Futures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">+0.62%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Pre-market trading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">VIX Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">14.2</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Low volatility</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          Market data updates when you sign in. See real-time analysis of your watchlist, trade opportunities, and risk metrics.
        </p>
      </div>
    </div>
  );
}
