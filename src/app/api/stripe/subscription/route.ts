import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, getTierFromPriceId } from "@/lib/stripe";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import type { SubscriptionStatus } from "@/lib/stripe";

export async function GET() {
  try {
    const { userId, tier } = await ensureUserInitialized();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const metadata = user.publicMetadata as any;
    const stripeSubscriptionId = metadata?.stripeSubscriptionId;

    // If no subscription, return free tier status
    if (!stripeSubscriptionId) {
      const status: SubscriptionStatus = {
        tier: "free",
        status: "none",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        interval: null,
      };
      return NextResponse.json(status);
    }

    // Fetch subscription from Stripe
    try {
      const subscription = (await stripe.subscriptions.retrieve(
        stripeSubscriptionId,
      )) as any;

      const priceId = subscription.items?.data?.[0]?.price?.id;
      const interval =
        subscription.items?.data?.[0]?.price?.recurring?.interval;

      const status: SubscriptionStatus = {
        tier: getTierFromPriceId(priceId) || tier,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
        interval: interval === "year" ? "yearly" : "monthly",
      };

      return NextResponse.json(status);
    } catch (stripeError) {
      // Subscription might have been deleted
      console.warn("Could not retrieve subscription:", stripeError);
      const status: SubscriptionStatus = {
        tier,
        status: "none",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        interval: null,
      };
      return NextResponse.json(status);
    }
  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 },
    );
  }
}
