'use client';

import { TradePlan } from '@/lib/mcp/types';
import { useTier } from '@/hooks/useTier';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TierGate } from '@/components/gating/TierGate';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface TradePlanCardProps {
  plan: TradePlan;
}

export function TradePlanCard({ plan }: TradePlanCardProps) {
  const { tier } = useTier();

  const riskQualityColors = {
    high: 'bg-green-500/10 text-green-700 dark:text-green-400',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    low: 'bg-red-500/10 text-red-700 dark:text-red-400',
  };

  const biasIcon = plan.bias === 'bullish' ?
    <TrendingUp className="h-5 w-5 text-green-500" /> :
    <TrendingDown className="h-5 w-5 text-red-500" />;

  const shouldBlurFields = tier === 'free';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{plan.symbol}</CardTitle>
            <CardDescription>
              {plan.timeframe.charAt(0).toUpperCase() + plan.timeframe.slice(1)} • {plan.vehicle}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={riskQualityColors[plan.risk_quality]}>
              {plan.risk_quality.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="flex gap-1">
              {biasIcon}
              {plan.bias.charAt(0).toUpperCase() + plan.bias.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Entry Price</p>
            <p className="text-2xl font-bold">${plan.entry_price.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Stop Price</p>
            {shouldBlurFields ? (
              <TierGate feature="full_trade_plan" blurContent={false}>
                <p className="text-2xl font-bold">${plan.stop_price.toFixed(2)}</p>
              </TierGate>
            ) : (
              <p className="text-2xl font-bold text-red-500">${plan.stop_price.toFixed(2)}</p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Target Price</p>
            {shouldBlurFields ? (
              <TierGate feature="full_trade_plan" blurContent={false}>
                <p className="text-2xl font-bold">${plan.target_price.toFixed(2)}</p>
              </TierGate>
            ) : (
              <p className="text-2xl font-bold text-green-500">${plan.target_price.toFixed(2)}</p>
            )}
          </div>
        </div>

        {/* Risk metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Risk:Reward Ratio</p>
            {shouldBlurFields ? (
              <TierGate feature="full_trade_plan" blurContent={false}>
                <p className="text-lg font-semibold">{plan.risk_reward_ratio.toFixed(2)}:1</p>
              </TierGate>
            ) : (
              <p className="text-lg font-semibold">{plan.risk_reward_ratio.toFixed(2)}:1</p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Expected Move %</p>
            <p className="text-lg font-semibold">+{plan.expected_move_percent.toFixed(1)}%</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Max Loss %</p>
            <p className="text-lg font-semibold text-red-500">-{plan.max_loss_percent.toFixed(1)}%</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Invalidation</p>
            <p className="text-lg font-semibold">${plan.invalidation_price.toFixed(2)}</p>
          </div>
        </div>

        {/* Signals */}
        <div>
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Signals</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">{plan.primary_signal}</Badge>
              <span className="text-xs text-muted-foreground">Primary Signal</span>
            </div>
            {plan.supporting_signals && plan.supporting_signals.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {plan.supporting_signals.map((signal) => (
                  <Badge key={signal} variant="outline">
                    {signal}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle notes */}
        {plan.vehicle_notes && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="text-muted-foreground">{plan.vehicle_notes}</p>
          </div>
        )}

        {/* Option suggestions (Pro+) */}
        {(plan.option_dte_range || plan.option_delta_range) && (
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
              Option Suggestions
            </p>
            {plan.option_dte_range && (
              <p className="text-sm">
                DTE: {plan.option_dte_range[0]} - {plan.option_dte_range[1]} days
              </p>
            )}
            {plan.option_delta_range && (
              <p className="text-sm">
                Delta: {plan.option_delta_range[0].toFixed(2)} - {plan.option_delta_range[1].toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Suppression reasons (if any) */}
        {plan.is_suppressed && plan.suppression_reasons && plan.suppression_reasons.length > 0 && (
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-yellow-700 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                  Suppression Reasons
                </p>
                <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                  {plan.suppression_reasons.map((reason) => (
                    <li key={reason.code}>
                      <strong>{reason.code}:</strong> {reason.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
