import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe, getTierFromPriceId } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";

// Disable body parsing - Stripe needs raw body for signature verification
export const runtime = "nodejs";

async function updateUserTier(
  clerkUserId: string,
  tier: "free" | "pro" | "max",
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
) {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        tier,
        stripeCustomerId,
        stripeSubscriptionId,
        tierUpdatedAt: new Date().toISOString(),
      },
    });
    console.log(`Updated user ${clerkUserId} to tier: ${tier}`);
  } catch (error) {
    console.error(`Failed to update user ${clerkUserId} tier:`, error);
    throw error;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clerkUserId = session.metadata?.clerkUserId;
  const tier = session.metadata?.tier as "pro" | "max";

  if (!clerkUserId || !tier) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

  await updateUserTier(
    clerkUserId,
    tier,
    session.customer as string,
    session.subscription as string,
  );
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const clerkUserId = subscription.metadata?.clerkUserId;

  if (!clerkUserId) {
    console.error(
      "Missing clerkUserId in subscription metadata:",
      subscription.id,
    );
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const tier = getTierFromPriceId(priceId);

  if (tier) {
    await updateUserTier(
      clerkUserId,
      tier,
      subscription.customer as string,
      subscription.id,
    );
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const clerkUserId = subscription.metadata?.clerkUserId;

  if (!clerkUserId) {
    // Try to find user by customer ID
    console.warn(
      "Missing clerkUserId in subscription metadata, attempting lookup",
    );
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const tier = getTierFromPriceId(priceId);
  const status = subscription.status;

  // If subscription is active and we have a valid tier, update
  if (status === "active" && tier) {
    await updateUserTier(
      clerkUserId,
      tier,
      subscription.customer as string,
      subscription.id,
    );
  }

  // If subscription is canceled or past_due, consider downgrading
  if (status === "canceled" || status === "unpaid") {
    await updateUserTier(clerkUserId, "free");
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const clerkUserId = subscription.metadata?.clerkUserId;

  if (!clerkUserId) {
    console.error(
      "Missing clerkUserId in deleted subscription:",
      subscription.id,
    );
    return;
  }

  // Downgrade user to free tier
  await updateUserTier(clerkUserId, "free");
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Retrieve subscription to get user info
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const clerkUserId = subscription.metadata?.clerkUserId;

  if (clerkUserId) {
    // Could send notification, update UI state, etc.
    console.warn(
      `Payment failed for user ${clerkUserId}, subscription ${subscriptionId}`,
    );
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  console.log(`Processing Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_succeeded":
        // Could track successful payments, send receipts, etc.
        console.log(
          "Invoice payment succeeded:",
          (event.data.object as Stripe.Invoice).id,
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
