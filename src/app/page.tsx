import { Hero } from "@/components/landing/Hero";
import { LiveMarketPulse } from "@/components/landing/LiveMarketPulse";
import { ToolShowcase } from "@/components/landing/ToolShowcase";
import { TickerComparison } from "@/components/landing/TickerComparison";
import { FibonacciPreview } from "@/components/landing/FibonacciPreview";
import { SampleTradePlan } from "@/components/landing/SampleTradePlan";
import { PricingCards } from "@/components/landing/PricingCards";
import { IndustryPerformers } from "@/components/landing/IndustryPerformers";
import { PortfolioRiskDemo } from "@/components/landing/PortfolioRiskDemo";
import type { PortfolioRiskData } from "@/lib/firebase/types";

async function fetchPortfolioDemo(): Promise<PortfolioRiskData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/public/portfolio-demo`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const result = await response.json();
    return result.data ?? null;
  } catch {
    return null;
  }
}

async function fetchMarketData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/public/market-data`, {
      next: { revalidate: 300 },
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
  const [marketData, portfolioData] = await Promise.allSettled([
    fetchMarketData(),
    fetchPortfolioDemo(),
  ]);

  const market = marketData.status === "fulfilled" ? marketData.value : null;
  const portfolio =
    portfolioData.status === "fulfilled" ? portfolioData.value : null;

  return (
    <main className="min-h-screen bg-background">
      <Hero />

      {/* Positioning band */}
      <section className="py-10 border-b bg-muted/40">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3">
            An AI trading decision engine — not another charting tool
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            We rank market opportunities in real time, then design the optimal
            stock or options trade — including entries, risk, and strategy
            structure — in one continuous workflow.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            <span className="rounded-full border px-3 py-1">
              Rank opportunities
            </span>
            <span className="rounded-full border px-3 py-1">
              Choose stock vs options
            </span>
            <span className="rounded-full border px-3 py-1">
              Design the trade
            </span>
            <span className="rounded-full border px-3 py-1">
              Quantified risk & payoff
            </span>
          </div>
        </div>
      </section>

      {/* Live market pulse section */}
      <section className="py-16 border-t">
        <LiveMarketPulse data={market?.market} />
      </section>

      {/* Industry Performance Table */}
      <IndustryPerformers />

      {/* Decision engine surface */}
      <div id="tools">
        <ToolShowcase />
      </div>

      {/* Ranked opportunities */}
      <section className="py-16 border-t">
        <TickerComparison
          comparison={market?.comparison}
          featuredTickers={market?.portfolioSymbols}
        />
      </section>

      {/* Trade design (stock or options) */}
      <section className="py-16 bg-muted/50 border-t">
        <SampleTradePlan
          data={market?.sampleAnalysis}
          tradePlan={market?.tradePlan}
        />
      </section>

      {/* Supporting analysis */}
      <FibonacciPreview data={market?.fibonacci} />

      {/* Portfolio risk demo — live from Firebase */}
      <PortfolioRiskDemo data={portfolio} />

      {/* Pricing section */}
      <section id="pricing" className="py-16 bg-muted/50 border-t">
        <PricingCards />
      </section>

      {/* CTA section */}
      <section className="py-20 border-t bg-gradient-to-b from-background to-primary/5">
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            From opportunity ranking to trade construction — in one engine
          </h2>

          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Stop jumping between scanners, indicators, and options tools. This
            platform ranks the best opportunities, decides whether stock or
            options are the right vehicle, and designs the trade with quantified
            risk and payoff.
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            Built for active traders. Analysis and decision support only — no
            execution, no hype.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Start using the decision engine
            </a>
            <a
              href="#tools"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              See how trades are built
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
