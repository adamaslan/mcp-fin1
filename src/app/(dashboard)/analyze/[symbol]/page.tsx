'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TradePlanCard } from '@/components/trade-plan/TradePlanCard';
import { TimeframeSelector } from '@/components/trade-plan/TimeframeSelector';
import { useTier } from '@/hooks/useTier';
import { canAccessTimeframe, TIER_LIMITS } from '@/lib/auth/tiers';
import { TradePlan } from '@/lib/mcp/types';
import { Loader2, AlertCircle } from 'lucide-react';

interface AnalyzePageProps {
  params: { symbol: string };
}

export default function AnalyzePage({ params }: AnalyzePageProps) {
  const router = useRouter();
  const { symbol } = params;
  const { tier } = useTier();

  const [inputSymbol, setInputSymbol] = useState(symbol.toUpperCase());
  const [selectedTimeframe, setSelectedTimeframe] = useState<'swing' | 'day' | 'scalp'>('swing');
  const [tradePlans, setTradePlans] = useState<TradePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tierLimits = TIER_LIMITS[tier];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputSymbol.trim()) {
      setError('Please enter a symbol');
      return;
    }

    router.push(`/dashboard/analyze/${inputSymbol.toUpperCase()}`);
  };

  const fetchTradePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mcp/trade-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.toUpperCase(), period: '1mo' }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trade plan');
      }

      const data = await response.json();
      const plans = data.trade_plans || [];

      // Filter by selected timeframe
      const filteredPlans = plans.filter((p: TradePlan) => p.timeframe === selectedTimeframe);
      setTradePlans(filteredPlans);

      if (plans.length === 0) {
        setError('No trade plans available for this security at this time.');
      } else if (filteredPlans.length === 0) {
        setError(`No ${selectedTimeframe} trade plans available. Try another timeframe.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount or when symbol/timeframe changes
  useEffect(() => {
    fetchTradePlan();
  }, [symbol, selectedTimeframe]);

  const handleTimeframeChange = (tf: 'swing' | 'day' | 'scalp') => {
    if (canAccessTimeframe(tier as any, tf)) {
      setSelectedTimeframe(tf);
    }
  };

  return (
    <div className="space-y-6">
      {/* Symbol search */}
      <Card>
        <CardHeader>
          <CardTitle>Search for Trade Plans</CardTitle>
          <CardDescription>
            Enter any stock ticker to analyze. Free: 5/day, Pro: 50/day, Max: Unlimited
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="flex gap-2">
            <Input
              placeholder="Enter symbol (e.g., AAPL, MSFT)"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
              disabled={loading}
            />
            <Button disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Timeframe selector (Pro+) */}
      {tier !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Timeframe</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeframeSelector value={selectedTimeframe} onChange={handleTimeframeChange} />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {error && (
        <Card className="bg-red-500/10 border-red-200 dark:border-red-800">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && tradePlans.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {symbol.toUpperCase()} - {selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)} Trade Plans
            </h2>
            <p className="text-sm text-muted-foreground">
              {tradePlans.length} trade plan{tradePlans.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {tradePlans.map((plan, index) => (
            <TradePlanCard key={index} plan={plan} />
          ))}
        </div>
      )}

      {!loading && tradePlans.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Enter a symbol and click Search to see trade plans</p>
          </CardContent>
        </Card>
      )}

      {/* Usage info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Your Tier: {tier.toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Analyses per day: {tierLimits.analysesPerDay === Infinity ? 'Unlimited' : tierLimits.analysesPerDay}</li>
            <li>• Timeframes available: {tierLimits.timeframes.join(', ')}</li>
            <li>
              • Signal visibility: {
                tier === 'free' ? 'Top 3' : tier === 'pro' ? 'Top 10' : 'All 150+'
              } signals
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
