import { Hero } from "@/components/landing/Hero";
import { LiveMarketPulse } from "@/components/landing/LiveMarketPulse";
import { FibonacciPreview } from "@/components/landing/FibonacciPreview";
import { SampleTradePlan } from "@/components/landing/SampleTradePlan";
import { ScannerPreview } from "@/components/landing/ScannerPreview";
import { PricingCards } from "@/components/landing/PricingCards";

async function fetchMarketData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/public/market-data`, {
      next: { revalidate: 120 }, // ISR: revalidate every 2 minutes
    });

    if (!response.ok) {
      console.warn("Failed to fetch market data, using defaults");
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching market data:", error);
    return null;
  }
}

export default async function Home() {
  const marketData = await fetchMarketData();

  return (
    <main className="min-h-screen bg-background">
      <Hero />

      {/* Live market pulse section */}
      <section className="py-16 border-t">
        <LiveMarketPulse data={marketData?.market} />
      </section>

      {/* Fibonacci analysis preview */}
      <FibonacciPreview />

      {/* Sample trade plan section */}
      <section className="py-16 bg-muted/50 border-t">
        <SampleTradePlan data={marketData?.sampleAnalysis} />
      </section>

      {/* Scanner preview section */}
      <section className="py-16 border-t">
        <ScannerPreview trades={marketData?.topTrades} />
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
       We can help you know when there is too much risk in a trade, when to sell, and when to buy.   </p>
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
