'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown, Minus, PieChart } from 'lucide-react';

interface SectorData {
  name: string;
  symbol: string;
  performance1D: number;
  performance1W: number;
  performance1M: number;
  performance3M: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  flowDirection: 'inflow' | 'outflow' | 'neutral';
}

// Mock data - in production, fetch from API
const SECTOR_DATA: SectorData[] = [
  {
    name: 'Technology',
    symbol: 'XLK',
    performance1D: 1.24,
    performance1W: 3.45,
    performance1M: 5.67,
    performance3M: 12.34,
    trend: 'bullish',
    flowDirection: 'inflow',
  },
  {
    name: 'Healthcare',
    symbol: 'XLV',
    performance1D: 0.56,
    performance1W: 1.23,
    performance1M: 2.45,
    performance3M: 4.56,
    trend: 'bullish',
    flowDirection: 'inflow',
  },
  {
    name: 'Financials',
    symbol: 'XLF',
    performance1D: -0.34,
    performance1W: 0.87,
    performance1M: 3.21,
    performance3M: 8.90,
    trend: 'bullish',
    flowDirection: 'neutral',
  },
  {
    name: 'Consumer Discretionary',
    symbol: 'XLY',
    performance1D: 0.78,
    performance1W: 2.34,
    performance1M: 4.56,
    performance3M: 7.89,
    trend: 'bullish',
    flowDirection: 'inflow',
  },
  {
    name: 'Communication Services',
    symbol: 'XLC',
    performance1D: 0.45,
    performance1W: 1.67,
    performance1M: 3.45,
    performance3M: 9.12,
    trend: 'bullish',
    flowDirection: 'neutral',
  },
  {
    name: 'Industrials',
    symbol: 'XLI',
    performance1D: -0.12,
    performance1W: 0.56,
    performance1M: 2.34,
    performance3M: 5.67,
    trend: 'neutral',
    flowDirection: 'neutral',
  },
  {
    name: 'Consumer Staples',
    symbol: 'XLP',
    performance1D: -0.23,
    performance1W: -0.45,
    performance1M: 0.67,
    performance3M: 2.34,
    trend: 'neutral',
    flowDirection: 'outflow',
  },
  {
    name: 'Energy',
    symbol: 'XLE',
    performance1D: -1.45,
    performance1W: -2.34,
    performance1M: -4.56,
    performance3M: -8.90,
    trend: 'bearish',
    flowDirection: 'outflow',
  },
  {
    name: 'Materials',
    symbol: 'XLB',
    performance1D: -0.67,
    performance1W: -1.23,
    performance1M: -2.34,
    performance3M: 1.23,
    trend: 'bearish',
    flowDirection: 'outflow',
  },
  {
    name: 'Utilities',
    symbol: 'XLU',
    performance1D: -0.34,
    performance1W: -0.78,
    performance1M: -1.23,
    performance3M: 0.45,
    trend: 'bearish',
    flowDirection: 'outflow',
  },
  {
    name: 'Real Estate',
    symbol: 'XLRE',
    performance1D: -0.45,
    performance1W: -1.12,
    performance1M: -2.34,
    performance3M: -3.45,
    trend: 'bearish',
    flowDirection: 'outflow',
  },
];

function PerformanceCell({ value }: { value: number }) {
  const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-500';
  const sign = value > 0 ? '+' : '';
  return <span className={`font-medium ${color}`}>{sign}{value.toFixed(2)}%</span>;
}

function TrendBadge({ trend }: { trend: 'bullish' | 'bearish' | 'neutral' }) {
  const config = {
    bullish: { icon: <TrendingUp className="h-3 w-3" />, color: 'bg-green-500' },
    bearish: { icon: <TrendingDown className="h-3 w-3" />, color: 'bg-red-500' },
    neutral: { icon: <Minus className="h-3 w-3" />, color: 'bg-gray-500' },
  };

  return (
    <Badge className={`${config[trend].color} text-white gap-1`}>
      {config[trend].icon}
      {trend.charAt(0).toUpperCase() + trend.slice(1)}
    </Badge>
  );
}

function FlowIndicator({ direction }: { direction: 'inflow' | 'outflow' | 'neutral' }) {
  const config = {
    inflow: { icon: <ArrowRight className="h-4 w-4 rotate-[-45deg]" />, color: 'text-green-500', label: 'Inflow' },
    outflow: { icon: <ArrowRight className="h-4 w-4 rotate-[135deg]" />, color: 'text-red-500', label: 'Outflow' },
    neutral: { icon: <Minus className="h-4 w-4" />, color: 'text-gray-500', label: 'Neutral' },
  };

  return (
    <div className={`flex items-center gap-1 ${config[direction].color}`}>
      {config[direction].icon}
      <span className="text-xs">{config[direction].label}</span>
    </div>
  );
}

export function SectorRotation() {
  // Sort by 1M performance
  const sortedSectors = [...SECTOR_DATA].sort((a, b) => b.performance1M - a.performance1M);

  // Get leaders and laggards
  const leaders = sortedSectors.slice(0, 3);
  const laggards = sortedSectors.slice(-3).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Sector Rotation Analysis
        </CardTitle>
        <CardDescription>
          Track money flow between sectors to identify market themes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Leading Sectors</h4>
            <div className="space-y-2">
              {leaders.map((sector) => (
                <div key={sector.symbol} className="flex items-center justify-between">
                  <span className="text-sm">{sector.name}</span>
                  <PerformanceCell value={sector.performance1M} />
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Lagging Sectors</h4>
            <div className="space-y-2">
              {laggards.map((sector) => (
                <div key={sector.symbol} className="flex items-center justify-between">
                  <span className="text-sm">{sector.name}</span>
                  <PerformanceCell value={sector.performance1M} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b">
                <th className="pb-2 font-medium">Sector</th>
                <th className="pb-2 font-medium text-right">1D</th>
                <th className="pb-2 font-medium text-right">1W</th>
                <th className="pb-2 font-medium text-right">1M</th>
                <th className="pb-2 font-medium text-right">3M</th>
                <th className="pb-2 font-medium text-center">Trend</th>
                <th className="pb-2 font-medium text-center">Flow</th>
              </tr>
            </thead>
            <tbody>
              {sortedSectors.map((sector) => (
                <tr key={sector.symbol} className="border-b border-muted hover:bg-muted/50">
                  <td className="py-3">
                    <a href={`/analyze/${sector.symbol}`} className="hover:text-primary">
                      <div className="font-medium">{sector.name}</div>
                      <div className="text-xs text-muted-foreground">{sector.symbol}</div>
                    </a>
                  </td>
                  <td className="py-3 text-right">
                    <PerformanceCell value={sector.performance1D} />
                  </td>
                  <td className="py-3 text-right">
                    <PerformanceCell value={sector.performance1W} />
                  </td>
                  <td className="py-3 text-right">
                    <PerformanceCell value={sector.performance1M} />
                  </td>
                  <td className="py-3 text-right">
                    <PerformanceCell value={sector.performance3M} />
                  </td>
                  <td className="py-3 text-center">
                    <TrendBadge trend={sector.trend} />
                  </td>
                  <td className="py-3">
                    <div className="flex justify-center">
                      <FlowIndicator direction={sector.flowDirection} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insight */}
        <div className="p-4 rounded-lg bg-muted">
          <h4 className="font-medium mb-2">Market Theme</h4>
          <p className="text-sm text-muted-foreground">
            Money is rotating <strong>into</strong> growth sectors (Technology, Healthcare) and{' '}
            <strong>out of</strong> defensive sectors (Utilities, Energy). This suggests risk-on
            sentiment and expectations for continued economic expansion. Consider overweighting
            leading sectors and underweighting laggards.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
