import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function SampleTradePlan() {
  return (
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">See What You Get</h2>
        <p className="text-muted-foreground">Risk-qualified trade plans with entry, stop, and target prices</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">AAPL</CardTitle>
                <CardDescription>Apple Inc. • Swing Trade • Bullish Bias</CardDescription>
              </div>
              <Badge className="bg-green-500">HIGH QUALITY</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Entry Price</p>
                <p className="text-2xl font-bold">$192.50</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Stop Price</p>
                <p className="text-2xl font-bold blur-sm select-none">••••••</p>
                <p className="text-xs text-amber-500 mt-1">Unlock with Free signup</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Target Price</p>
                <p className="text-2xl font-bold blur-sm select-none">••••••</p>
                <p className="text-xs text-amber-500 mt-1">Unlock with Free signup</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div>
                <p className="text-xs text-muted-foreground">Risk:Reward Ratio</p>
                <p className="text-lg font-semibold blur-sm select-none">••••</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expected Move %</p>
                <p className="text-lg font-semibold">+4.2%</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Primary Signal</p>
              <Badge variant="outline" className="bg-blue-500/10">Golden Cross (MA50 > MA200)</Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-3">Analysis includes:</p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✓ 150+ technical signal analysis</li>
                <li>✓ Risk/reward assessment</li>
                <li>✓ Volatility regime analysis</li>
                <li>✓ Support & resistance levels</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            This is a sample. Sign up free to see real-time trade plans for any stock.
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="/sign-up">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
