import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const indicators = [
  {
    name: 'Relative Strength Index (RSI)',
    period: '14',
    range: '0-100',
    description: 'Measures the magnitude of recent price changes to evaluate overbought/oversold conditions.',
  },
  {
    name: 'Moving Average (SMA)',
    period: '5, 10, 20, 50, 100, 200',
    range: 'Variable',
    description: 'Average price over a specified period. Helps identify trends and support/resistance levels.',
  },
  {
    name: 'MACD (Moving Average Convergence Divergence)',
    period: '12, 26, 9',
    range: 'Variable',
    description: 'Shows the relationship between two moving averages. Used to identify momentum changes.',
  },
  {
    name: 'Bollinger Bands',
    period: '20',
    range: 'Variable',
    description: 'Upper and lower bands based on standard deviation. Shows volatility and potential breakouts.',
  },
  {
    name: 'Stochastic Oscillator',
    period: '14, 3',
    range: '0-100',
    description: 'Compares closing price to price range. Identifies overbought/oversold conditions.',
  },
  {
    name: 'Average True Range (ATR)',
    period: '14',
    range: 'Variable',
    description: 'Measures market volatility. Helps determine appropriate stop loss and position sizing.',
  },
  {
    name: 'Average Directional Index (ADX)',
    period: '14',
    range: '0-100',
    description: 'Measures trend strength without indicating direction. 25+ indicates strong trend.',
  },
  {
    name: 'Volume Moving Average',
    period: '20, 50',
    range: 'Variable',
    description: 'Average trading volume over a period. Confirms price moves with volume analysis.',
  },
];

export default function IndicatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Indicator Education</h1>
        <p className="text-muted-foreground">
          Learn about the 18+ technical indicators used in MCP Finance analysis.
        </p>
      </div>

      <div className="grid gap-4">
        {indicators.map((indicator) => (
          <Card key={indicator.name}>
            <CardHeader>
              <CardTitle className="text-base">{indicator.name}</CardTitle>
              <CardDescription>
                Period: {indicator.period} • Range: {indicator.range}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{indicator.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-500/10 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6 text-sm text-blue-700 dark:text-blue-400">
          <p>
            <strong>Max tier users:</strong> See all raw indicator values and historical indicator data in the analysis results.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
