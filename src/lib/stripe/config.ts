import Stripe from "stripe";

// Lazy-initialized Stripe client to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Export as a getter for backwards compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripeServer() as any)[prop];
  },
});

// Price IDs from Stripe Dashboard
// These should be created in Stripe and the IDs added to env vars
export const STRIPE_PRICES = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
  },
  max: {
    monthly: process.env.STRIPE_MAX_MONTHLY_PRICE_ID || "",
    yearly: process.env.STRIPE_MAX_YEARLY_PRICE_ID || "",
  },
} as const;

// Map Stripe price IDs to tiers
export function getTierFromPriceId(priceId: string): "pro" | "max" | null {
  if (
    priceId === STRIPE_PRICES.pro.monthly ||
    priceId === STRIPE_PRICES.pro.yearly
  ) {
    return "pro";
  }
  if (
    priceId === STRIPE_PRICES.max.monthly ||
    priceId === STRIPE_PRICES.max.yearly
  ) {
    return "max";
  }
  return null;
}

// Pricing display configuration
export const PRICING_CONFIG = {
  pro: {
    name: "Pro",
    description: "For active traders who want full analysis capabilities",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "50 analyses per day",
      "10 scans per day",
      "All timeframes (Swing, Day, Scalp)",
      "Portfolio risk analysis",
      "Trade journal",
      "5 watchlists (50 symbols each)",
      "S&P 500, NASDAQ, ETF universes",
      "All 40+ Fibonacci levels (23.6% to 423.6%)",
      "Fibonacci channels & clusters",
      "Golden Pocket detection",
      "Multi-timeframe confluence",
      "15 Fibonacci signals per analysis",
    ],
  },
  max: {
    name: "Max",
    description: "For power users and semi-professional traders",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "Unlimited analyses",
      "Unlimited scans",
      "All Pro features",
      "Price alerts",
      "Hedge suggestions",
      "CSV/JSON export",
      "API access",
      "Crypto universe",
      "Unlimited watchlists",
      "Priority support",
      "Harmonic patterns (Gartley, Bat, Crab, Shark)",
      "Elliott Wave Fibonacci relationships",
      "Fibonacci arcs & fan lines",
      "Unlimited Fibonacci signals",
      "Custom Fibonacci alerts",
    ],
  },
} as const;
