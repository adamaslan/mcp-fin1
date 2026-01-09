'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingDown, Zap } from 'lucide-react';

interface HedgeSuggestion {
  symbol: string;
  action: 'buy_put' | 'buy_call' | 'reduce_position' | 'diversify';
  rationale: string;
  estimated_cost: number;
  protection_level: 'low' | 'medium' | 'high';
}

interface HedgeSuggestionsProps {
  suggestions: HedgeSuggestion[];
}

export function HedgeSuggestions({ suggestions }: HedgeSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const actionLabels = {
    buy_put: 'Buy Put Option',
    buy_call: 'Buy Call Option',
    reduce_position: 'Reduce Position',
    diversify: 'Diversify Holdings',
  };

  const actionIcons = {
    buy_put: <TrendingDown className="h-4 w-4" />,
    buy_call: <Zap className="h-4 w-4" />,
    reduce_position: <Shield className="h-4 w-4" />,
    diversify: <Shield className="h-4 w-4" />,
  };

  const protectionColors = {
    low: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    medium: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    high: 'bg-red-500/10 text-red-700 dark:text-red-400',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Hedge Suggestions
        </CardTitle>
        <CardDescription>
          Recommended hedging strategies to reduce portfolio risk
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {actionIcons[suggestion.action]}
                  <div>
                    <p className="font-semibold">{suggestion.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {actionLabels[suggestion.action]}
                    </p>
                  </div>
                </div>
                <Badge className={protectionColors[suggestion.protection_level]}>
                  {suggestion.protection_level.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{suggestion.rationale}</p>
              <div className="flex items-center justify-between pt-2 border-t border-muted">
                <span className="text-xs text-muted-foreground">Estimated Cost</span>
                <span className="font-semibold text-sm">
                  ${suggestion.estimated_cost.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
