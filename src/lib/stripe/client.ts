import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}

export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error("Stripe failed to load");
  }

  // redirectToCheckout exists at runtime but was removed from Stripe.js v8 types
  interface StripeWithLegacyCheckout {
    redirectToCheckout: (opts: { sessionId: string }) => Promise<{ error?: { message: string } }>;
  }
  const result = await (stripe as unknown as StripeWithLegacyCheckout).redirectToCheckout({ sessionId });
  if (result?.error) {
    throw new Error(result.error.message);
  }
}

// Alternative: Direct redirect to checkout URL
export function redirectToCheckoutUrl(url: string): void {
  window.location.href = url;
}
