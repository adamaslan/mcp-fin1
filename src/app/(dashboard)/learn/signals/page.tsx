import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const signals = [
  {
    name: 'Golden Cross',
    category: 'MA_CROSS',
    description: 'When a fast moving average crosses above a slow moving average, indicating potential uptrend.',
    strength: 'BULLISH',
  },
  {
    name: 'Death Cross',
    category: 'MA_CROSS',
    description: 'When a fast moving average crosses below a slow moving average, indicating potential downtrend.',
    strength: 'BEARISH',
  },
  {
    name: 'RSI Oversold',
    category: 'RSI',
    description: 'RSI below 30 indicates oversold conditions, potential bounce.',
    strength: 'BULLISH',
  },
  {
    name: 'RSI Overbought',
    category: 'RSI',
    description: 'RSI above 70 indicates overbought conditions, potential pullback.',
    strength: 'BEARISH',
  },
  {
    name: 'MACD Bullish Crossover',
    category: 'MACD',
    description: 'MACD line crosses above signal line with histogram positive.',
    strength: 'BULLISH',
  },
  {
    name: 'MACD Bearish Crossover',
    category: 'MACD',
    description: 'MACD line crosses below signal line with histogram negative.',
    strength: 'BEARISH',
  },
];

export default function SignalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Signal Education</h1>
        <p className="text-muted-foreground">
          Learn about the 150+ technical signals that power MCP Finance analysis.
        </p>
      </div>

      <div className="grid gap-4">
        {signals.map((signal) => (
          <Card key={signal.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{signal.name}</CardTitle>
                  <CardDescription>{signal.category}</CardDescription>
                </div>
                <Badge
                  className={
                    signal.strength === 'BULLISH'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }
                >
                  {signal.strength}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{signal.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-500/10 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6 text-sm text-blue-700 dark:text-blue-400">
          <p>
            <strong>Max tier users:</strong> See all 150+ signals and raw signal strength values in the analysis results.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
