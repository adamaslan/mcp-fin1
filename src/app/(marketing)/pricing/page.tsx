import { PricingCards } from "@/components/landing/PricingCards";

export default function PricingPage() {
  return (
    <div className="py-16">
      <div className="container">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade when you&apos;re ready for more power. No
            contracts, cancel anytime.
          </p>
        </div>

        <PricingCards />

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes! You can change your tier at any time. Changes take effect
                immediately.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Our Free tier is your trial. Get 5 analyses/day, 1 scan/day, and
                full signal/indicator education.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American
                Express) via Stripe. Apple Pay and Google Pay are also
                supported.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                Yes! If you&apos;re not satisfied within the first 14 days,
                contact us for a full refund. After that, you can cancel anytime
                and continue using your plan until the end of the billing
                period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                What&apos;s included in the Pro tier?
              </h3>
              <p className="text-muted-foreground">
                All timeframes (Swing, Day, Scalp), 50 analyses/day, 10
                scans/day with top 25 results, portfolio risk tracking, trade
                journal, and more.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Can I use this for algorithmic trading?
              </h3>
              <p className="text-muted-foreground">
                Max tier includes API access for programmatic access to all
                tools and data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
