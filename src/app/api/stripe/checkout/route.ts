import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import type { CheckoutSessionRequest } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body: CheckoutSessionRequest = await request.json();
    const { tier, interval } = body;

    // Validate tier
    if (!["pro", "max"].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "pro" or "max"' },
        { status: 400 },
      );
    }

    // Validate interval
    if (!["monthly", "yearly"].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval. Must be "monthly" or "yearly"' },
        { status: 400 },
      );
    }

    // Get the appropriate price ID
    const priceId = STRIPE_PRICES[tier][interval];
    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured. Please contact support." },
        { status: 500 },
      );
    }

    // Check if user already has a Stripe customer ID
    const existingCustomerId = (user.publicMetadata as any)?.stripeCustomerId;

    // Create or retrieve customer
    let customerId = existingCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0]?.emailAddress,
        metadata: {
          clerkUserId: userId,
        },
      });
      customerId = customer.id;
    }

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl =
      body.successUrl || `${baseUrl}/dashboard?subscription=success`;
    const cancelUrl =
      body.cancelUrl || `${baseUrl}/pricing?subscription=canceled`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          clerkUserId: userId,
          tier,
        },
      },
      metadata: {
        clerkUserId: userId,
        tier,
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
