"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Grid3X3 } from "lucide-react";

interface CorrelationData {
  symbols: string[];
  matrix: number[][];
}

// Mock data - in production, calculate from price history
const MOCK_CORRELATION: CorrelationData = {
  symbols: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"],
  matrix: [
    [1.0, 0.85, 0.78, 0.72, 0.45, 0.68],
    [0.85, 1.0, 0.82, 0.75, 0.48, 0.72],
    [0.78, 0.82, 1.0, 0.8, 0.42, 0.65],
    [0.72, 0.75, 0.8, 1.0, 0.38, 0.58],
    [0.45, 0.48, 0.42, 0.38, 1.0, 0.55],
    [0.68, 0.72, 0.65, 0.58, 0.55, 1.0],
  ],
};

function getCorrelationColor(value: number): string {
  if (value >= 0.8) return "bg-red-500";
  if (value >= 0.6) return "bg-orange-500";
  if (value >= 0.4) return "bg-yellow-500";
  if (value >= 0.2) return "bg-green-400";
  if (value >= 0) return "bg-green-500";
  if (value >= -0.2) return "bg-blue-400";
  if (value >= -0.4) return "bg-blue-500";
  if (value >= -0.6) return "bg-indigo-500";
  return "bg-purple-500";
}

function getCorrelationTextColor(value: number): string {
  if (Math.abs(value) >= 0.6) return "text-white";
  return "text-foreground";
}

interface CorrelationMatrixProps {
  data?: CorrelationData;
}

export function CorrelationMatrix({
  data = MOCK_CORRELATION,
}: CorrelationMatrixProps) {
  const { symbols, matrix } = data;

  // Calculate average correlation (excluding self-correlation)
  let totalCorr = 0;
  let count = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (i !== j) {
        totalCorr += matrix[i][j];
        count++;
      }
    }
  }
  const avgCorrelation = totalCorr / count;

  // Find highest correlated pairs (excluding self)
  const pairs: { pair: string; correlation: number }[] = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix[i].length; j++) {
      pairs.push({
        pair: `${symbols[i]}/${symbols[j]}`,
        correlation: matrix[i][j],
      });
    }
  }
  pairs.sort((a, b) => b.correlation - a.correlation);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          Correlation Matrix
        </CardTitle>
        <CardDescription>
          Shows how correlated your holdings are (1 = move together, -1 =
          opposite)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2"></th>
                {symbols.map((symbol) => (
                  <th
                    key={symbol}
                    className="p-2 text-xs font-medium text-muted-foreground text-center"
                  >
                    {symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {symbols.map((rowSymbol, i) => (
                <tr key={rowSymbol}>
                  <td className="p-2 text-xs font-medium text-muted-foreground">
                    {rowSymbol}
                  </td>
                  {matrix[i].map((value, j) => (
                    <td key={j} className="p-1">
                      <div
                        className={`w-12 h-10 flex items-center justify-center rounded text-xs font-medium ${getCorrelationColor(
                          value,
                        )} ${getCorrelationTextColor(value)}`}
                        title={`${symbols[i]} vs ${symbols[j]}: ${value.toFixed(2)}`}
                      >
                        {value.toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">
            Correlation:
          </span>
          <div className="flex items-center gap-0.5">
            <div className="w-6 h-4 bg-purple-500 rounded-l" title="-1.0" />
            <div className="w-6 h-4 bg-indigo-500" title="-0.6" />
            <div className="w-6 h-4 bg-blue-500" title="-0.4" />
            <div className="w-6 h-4 bg-blue-400" title="-0.2" />
            <div className="w-6 h-4 bg-green-500" title="0" />
            <div className="w-6 h-4 bg-green-400" title="0.2" />
            <div className="w-6 h-4 bg-yellow-500" title="0.4" />
            <div className="w-6 h-4 bg-orange-500" title="0.6" />
            <div className="w-6 h-4 bg-red-500 rounded-r" title="1.0" />
          </div>
          <span className="text-xs text-muted-foreground ml-2">-1 to +1</span>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="text-sm text-muted-foreground mb-1">
              Average Correlation
            </div>
            <div className="text-2xl font-bold">
              {avgCorrelation.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {avgCorrelation > 0.7
                ? "High - Consider diversifying"
                : avgCorrelation > 0.4
                  ? "Moderate - Reasonably diversified"
                  : "Low - Well diversified"}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <div className="text-sm text-muted-foreground mb-1">
              Most Correlated Pair
            </div>
            <div className="text-2xl font-bold">{pairs[0]?.pair}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Correlation: {pairs[0]?.correlation.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Top Correlated Pairs */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Highest Correlations</h4>
          <div className="space-y-2">
            {pairs.slice(0, 5).map((pair) => (
              <div
                key={pair.pair}
                className="flex items-center justify-between text-sm"
              >
                <span>{pair.pair}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-24 h-2 bg-muted rounded-full overflow-hidden"
                    title={pair.correlation.toFixed(2)}
                  >
                    <div
                      className={`h-full ${getCorrelationColor(pair.correlation)}`}
                      style={{ width: `${Math.abs(pair.correlation) * 100}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-12 text-right">
                    {pair.correlation.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
