export type BillingInterval = "monthly" | "yearly";

export type SubscriptionTier = "free" | "pro" | "max";

export interface CheckoutSessionRequest {
  tier: "pro" | "max";
  interval: BillingInterval;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  status: "active" | "canceled" | "past_due" | "trialing" | "none";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  interval: BillingInterval | null;
}

export interface CustomerPortalResponse {
  url: string;
}

// Stripe webhook event types we handle
export type StripeWebhookEvent =
  | "checkout.session.completed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_succeeded"
  | "invoice.payment_failed";
