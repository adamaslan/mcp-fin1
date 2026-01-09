import { Hero } from '@/components/landing/Hero';
import { LiveMarketPulse } from '@/components/landing/LiveMarketPulse';
import { SampleTradePlan } from '@/components/landing/SampleTradePlan';
import { ScannerPreview } from '@/components/landing/ScannerPreview';
import { PricingCards } from '@/components/landing/PricingCards';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />

      {/* Live market pulse section */}
      <section className="py-16 border-t">
        <LiveMarketPulse />
      </section>

      {/* Sample trade plan section */}
      <section className="py-16 bg-muted/50 border-t">
        <SampleTradePlan />
      </section>

      {/* Scanner preview section */}
      <section className="py-16 border-t">
        <ScannerPreview />
      </section>

      {/* Pricing section */}
      <section className="py-16 bg-muted/50 border-t">
        <PricingCards />
      </section>

      {/* CTA section */}
      <section className="py-16 border-t">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to trade smarter?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of traders using technical analysis to make better trading decisions.
          </p>
          <a
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started Free
          </a>
        </div>
      </section>
    </main>
  );
}
