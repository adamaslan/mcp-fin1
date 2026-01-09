import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started with swing trading analysis',
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
    cta: 'Get Started',
    href: '/sign-up',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'All timeframes for serious traders',
    features: [
      { text: '50 analyses per day', included: true },
      { text: '10 scans per day (top 25 results)', included: true },
      { text: 'All timeframes (Swing, Day, Scalp)', included: true },
      { text: 'Full trade plans with R:R', included: true },
      { text: 'Portfolio risk dashboard', included: true },
      { text: 'Sector concentration analysis', included: true },
      { text: 'Trade journal', included: true },
      { text: 'Alerts & notifications', included: false },
    ],
    cta: 'Start Pro',
    href: '/sign-up?tier=pro',
    highlighted: true,
  },
  {
    name: 'Max',
    price: '$79',
    period: '/month',
    description: 'Full pipeline access for professionals',
    features: [
      { text: 'Unlimited analyses', included: true },
      { text: 'Unlimited scans (all results)', included: true },
      { text: 'All timeframes', included: true },
      { text: 'Hedge suggestions', included: true },
      { text: 'Raw signal data (150+)', included: true },
      { text: 'Raw indicator data (18+)', included: true },
      { text: 'Alerts & notifications', included: true },
      { text: 'CSV/JSON export', included: true },
    ],
    cta: 'Start Max',
    href: '/sign-up?tier=max',
    highlighted: false,
  },
];

export function PricingCards() {
  return (
    <div className="py-12">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade when you&apos;re ready for more power.
          </p>
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
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-muted-foreground ml-2">{tier.period}</span>
                  )}
                </div>
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
                        className={
                          !feature.included ? 'text-muted-foreground' : ''
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={tier.highlighted ? 'default' : 'outline'}
                >
                  <a href={tier.href}>{tier.cta}</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
