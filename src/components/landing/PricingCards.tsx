'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, X, Loader2 } from 'lucide-react';
import { PRICING_CONFIG } from '@/lib/stripe/config';
import { redirectToCheckout } from '@/lib/stripe/client';
import type { BillingInterval } from '@/lib/stripe';

const FREE_TIER = {
  name: 'Free',
  description: 'Get started with swing trading analysis',
  monthlyPrice: 0,
  yearlyPrice: 0,
  features: [
    { text: '5 analyses per day', included: true },
    { text: '1 scan per day (top 5 results)', included: true },
    { text: 'Swing timeframe only', included: true },
    { text: 'Basic trade plans', included: true },
    { text: 'Signal & indicator education', included: true },
    { text: 'Day & Scalp timeframes', included: false },
    { text: 'Portfolio risk tracking', included: false },
    { text: 'Trade journal', included: false },
  ],
};

const PRO_FEATURES = [
  { text: '50 analyses per day', included: true },
  { text: '10 scans per day (top 25 results)', included: true },
  { text: 'All timeframes (Swing, Day, Scalp)', included: true },
  { text: 'Full trade plans with R:R', included: true },
  { text: 'Portfolio risk dashboard', included: true },
  { text: 'Sector concentration analysis', included: true },
  { text: 'Trade journal', included: true },
  { text: 'Alerts & notifications', included: false },
];

const MAX_FEATURES = [
  { text: 'Unlimited analyses', included: true },
  { text: 'Unlimited scans (all results)', included: true },
  { text: 'All timeframes', included: true },
  { text: 'Hedge suggestions', included: true },
  { text: 'Raw signal data (150+)', included: true },
  { text: 'Raw indicator data (18+)', included: true },
  { text: 'Alerts & notifications', included: true },
  { text: 'CSV/JSON export & API access', included: true },
];

interface PricingCardsProps {
  showIntervalToggle?: boolean;
}

export function PricingCards({ showIntervalToggle = true }: PricingCardsProps) {
  const { user, isSignedIn } = useUser();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loadingTier, setLoadingTier] = useState<'pro' | 'max' | null>(null);

  const currentTier = (user?.publicMetadata as any)?.tier || 'free';

  const handleCheckout = async (tier: 'pro' | 'max') => {
    if (!isSignedIn) {
      // Redirect to sign up with tier intent
      window.location.href = `/sign-up?redirect_url=/pricing&tier=${tier}`;
      return;
    }

    setLoadingTier(tier);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      await redirectToCheckout(sessionId);
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setLoadingTier(null);
    }
  };

  const getPrice = (tier: 'pro' | 'max') => {
    const config = PRICING_CONFIG[tier];
    return interval === 'yearly' ? config.yearlyPrice : config.monthlyPrice;
  };

  const getSavings = (tier: 'pro' | 'max') => {
    const config = PRICING_CONFIG[tier];
    const yearlyMonthly = config.yearlyPrice / 12;
    const monthlyPrice = config.monthlyPrice;
    const savingsPercent = Math.round((1 - yearlyMonthly / monthlyPrice) * 100);
    return savingsPercent;
  };

  const tiers = [
    {
      id: 'free' as const,
      name: FREE_TIER.name,
      description: FREE_TIER.description,
      price: 0,
      features: FREE_TIER.features,
      cta: currentTier === 'free' ? 'Current Plan' : 'Downgrade',
      highlighted: false,
      disabled: currentTier === 'free',
    },
    {
      id: 'pro' as const,
      name: PRICING_CONFIG.pro.name,
      description: PRICING_CONFIG.pro.description,
      price: getPrice('pro'),
      features: PRO_FEATURES,
      cta:
        currentTier === 'pro'
          ? 'Current Plan'
          : currentTier === 'max'
          ? 'Downgrade to Pro'
          : 'Start Pro',
      highlighted: true,
      disabled: currentTier === 'pro',
    },
    {
      id: 'max' as const,
      name: PRICING_CONFIG.max.name,
      description: PRICING_CONFIG.max.description,
      price: getPrice('max'),
      features: MAX_FEATURES,
      cta: currentTier === 'max' ? 'Current Plan' : 'Start Max',
      highlighted: false,
      disabled: currentTier === 'max',
    },
  ];

  return (
    <div className="py-12">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free. Upgrade when you&apos;re ready for more power.
          </p>

          {showIntervalToggle && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setInterval('monthly')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  interval === 'monthly'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval('yearly')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  interval === 'yearly'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                  Save {getSavings('pro')}%
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.highlighted ? 'border-primary shadow-lg md:scale-105' : ''}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${tier.price}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-muted-foreground ml-2">
                      /{interval === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                {tier.price > 0 && interval === 'yearly' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ${Math.round(tier.price / 12)}/month billed annually
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span
                        className={!feature.included ? 'text-muted-foreground' : ''}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {tier.id === 'free' ? (
                  <Button asChild className="w-full" variant="outline" disabled={tier.disabled}>
                    <a href={tier.disabled ? '#' : '/sign-up'}>{tier.cta}</a>
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? 'default' : 'outline'}
                    disabled={tier.disabled || loadingTier !== null}
                    onClick={() => handleCheckout(tier.id)}
                  >
                    {loadingTier === tier.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      tier.cta
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Secure payment powered by Stripe. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}
