# Stripe Integration Setup Guide

## Overview

This guide documents the Stripe integration for the MCP Finance application. It provides setup instructions, API endpoints, and configuration templates **without exposing sensitive credentials**.

## Environment Variables (Template) 2

### Required Variables

Copy this template to `.env` or configure in Vercel:

```bash
# Stripe Test Keys (Get from https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Secret (Get from https://dashboard.stripe.com/test/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Product Price IDs (Create in Stripe Dashboard)
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxx
STRIPE_MAX_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxx
STRIPE_MAX_YEARLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxx
```

### Key Retrieval Instructions

1. **Publishable Key & Secret Key**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy the test keys (pk*test*_ and sk*test*_)
   - Never expose these in public code or logs

2. **Webhook Secret**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Create endpoint: `POST {APP_URL}/api/webhooks/stripe`
   - Copy the signing secret (whsec\_\*)

3. **Price IDs**
   - Create products in Stripe Dashboard
   - Get price IDs from each product's pricing details
   - Format: `price_*`

## Vercel Integration

### Setup Steps

```bash
# Link project to Vercel (if not already linked)
vercel link

# Pull existing environment variables
vercel env pull .env.local

# View configured variables
vercel env ls

# Add variables (interactive)
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production preview development
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
```

### Environment Variable Scope

| Variable                             | Scope  | Visibility      |
| ------------------------------------ | ------ | --------------- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Client & server |
| `STRIPE_SECRET_KEY`                  | Secret | Server only     |
| `STRIPE_WEBHOOK_SECRET`              | Secret | Server only     |
| `STRIPE_PRO_MONTHLY_PRICE_ID`        | Secret | Server only     |
| `STRIPE_PRO_YEARLY_PRICE_ID`         | Secret | Server only     |
| `STRIPE_MAX_MONTHLY_PRICE_ID`        | Secret | Server only     |
| `STRIPE_MAX_YEARLY_PRICE_ID`         | Secret | Server only     |

## API Endpoints

All Stripe API endpoints are server-side only and require authentication.

### Create Checkout Session

**Route:** `POST /api/stripe/checkout`

**Request Body:**

```json
{
  "tier": "pro" | "max",
  "interval": "month" | "year"
}
```

**Response:**

```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxxxx"
}
```

**Usage:**

- Called from `src/components/landing/PricingCards.tsx`
- Redirects to Stripe Checkout
- Requires authenticated user (Clerk)

### Get Subscription Status

**Route:** `GET /api/stripe/subscription`

**Response:**

```json
{
  "tier": "free" | "pro" | "max",
  "status": "active" | "canceled" | "past_due" | "trialing" | "none",
  "currentPeriodEnd": "2025-02-15T12:34:56Z",
  "cancelAtPeriodEnd": false,
  "interval": "month" | "year" | null
}
```

**Purpose:**

- Retrieve current subscription status from Stripe
- Updates user metadata in Clerk

### Billing Portal

**Route:** `GET /api/stripe/portal`

**Response:**

```json
{
  "url": "https://billing.stripe.com/session/xxxxx"
}
```

**Usage:**

- Allows users to manage subscriptions
- Access payment methods, invoices, etc.
- Called from `src/components/subscription/SubscriptionManager.tsx`

### Webhooks

**Route:** `POST /api/webhooks/stripe`

**Signature Verification:**

- Uses `STRIPE_WEBHOOK_SECRET`
- Validates all incoming requests
- Returns 400 if signature invalid

**Handled Events:**

- `checkout.session.completed` - Purchase completed
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_failed` - Payment failed
- `invoice.payment_succeeded` - Payment successful

**Actions:**

- Updates Clerk user `publicMetadata`:
  - `tier` (free/pro/max)
  - `stripeCustomerId`
  - `stripeSubscriptionId`
  - `tierUpdatedAt`

## Tier Configuration

Defined in: `src/lib/auth/tiers.ts`

### Tier Limits

```typescript
export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    analysesPerDay: 5,
    scansPerDay: 1,
    scanResultsLimit: 5,
    watchlistCount: 1,
    watchlistSymbolLimit: 10,
    timeframes: ["swing"],
    universes: ["sp500"],
    features: [
      "basic_trade_plan",
      "signal_help",
      "indicator_help",
      "morning_brief_limited",
    ],
  },
  pro: {
    analysesPerDay: 50,
    scansPerDay: 10,
    scanResultsLimit: 25,
    watchlistCount: 5,
    watchlistSymbolLimit: 50,
    timeframes: ["swing", "day", "scalp"],
    universes: ["sp500", "nasdaq100", "etf_large_cap"],
    features: [
      "basic_trade_plan",
      "full_trade_plan",
      "all_timeframes",
      "portfolio_risk",
      "sector_concentration",
      "position_tracking",
      "trade_journal",
      "option_suggestions",
      "morning_brief_full",
      "signal_help",
      "indicator_help",
    ],
  },
  max: {
    analysesPerDay: Infinity,
    scansPerDay: Infinity,
    scanResultsLimit: 50,
    watchlistCount: Infinity,
    watchlistSymbolLimit: Infinity,
    timeframes: ["swing", "day", "scalp"],
    universes: ["sp500", "nasdaq100", "etf_large_cap", "crypto"],
    features: [
      "basic_trade_plan",
      "full_trade_plan",
      "all_timeframes",
      "portfolio_risk",
      "sector_concentration",
      "position_tracking",
      "trade_journal",
      "option_suggestions",
      "hedge_suggestions",
      "raw_signals",
      "raw_indicators",
      "alerts",
      "email_briefs",
      "api_access",
      "export",
      "multi_universe_scan",
      "signal_help",
      "indicator_help",
      "morning_brief_full",
    ],
  },
};
```

### Access Control Functions

```typescript
// Check if user can access a feature
canAccessFeature(tier: UserTier, feature: string): boolean

// Check if user can access timeframe
canAccessTimeframe(tier: UserTier, timeframe: 'swing' | 'day' | 'scalp'): boolean

// Check if user can access universe
canAccessUniverse(tier: UserTier, universe: string): boolean
```

## Route Protection

Defined in: `src/middleware.ts`

### Public Routes (No Auth Required)

- `/` - Home
- `/pricing` - Pricing page
- `/sign-in` - Sign in
- `/sign-up` - Sign up
- `/api/webhooks/*` - Webhook endpoints

### Pro-Only Routes (Requires Pro or Max Tier)

- `/dashboard/portfolio/*` - Portfolio management
- `/dashboard/journal/*` - Trade journal

### Max-Only Routes (Requires Max Tier)

- `/dashboard/alerts/*` - Alert management
- `/dashboard/export/*` - Data export
- `/dashboard/signals/*` - Advanced signals
- `/api/admin/*` - Admin endpoints

### Authentication Check Flow

```
Request → Middleware
  ├─ Is public route? → Allow
  ├─ User authenticated? → Check tier
  ├─ Max-only route? → Require max tier
  ├─ Pro-only route? → Require pro tier
  └─ Other routes → Require auth
```

## Component: TierGate

Located in: `src/components/gating/TierGate.tsx`

### Purpose

Protect features at the component level with visual feedback.

### Props

```typescript
interface TierGateProps {
  feature: string; // Feature name from TIER_LIMITS
  requiredTier?: "pro" | "max"; // Tier required (default: 'pro')
  children: React.ReactNode; // Content to gate
  fallback?: React.ReactNode; // Alternative content
  blurContent?: boolean; // Blur locked content (default: true)
}
```

### Usage Example

```tsx
<TierGate feature="hedge_suggestions" requiredTier="max" blurContent={true}>
  <HedgeSuggestionsComponent />
</TierGate>
```

### Behavior

- **Has Access:** Renders children normally
- **No Access (blurContent=true):** Shows blurred content + upgrade CTA
- **No Access (blurContent=false):** Shows only upgrade CTA
- **Custom Fallback:** Shows fallback content if provided

## Hook: useTier

Located in: `src/hooks/useTier.ts`

### Purpose

Get current user's tier in client components.

### Returns

```typescript
{
  tier: 'free' | 'pro' | 'max',
  loading: boolean
}
```

### Usage Example

```tsx
const { tier, loading } = useTier();

if (loading) return <div>Loading...</div>;

if (tier === "max") {
  return <AdvancedFeatures />;
}
```

## Testing

Comprehensive test suite in `__tests__/`:

```bash
# Run all tier tests
npx tsx __tests__/tiers.test.ts

# Run middleware protection tests
npx tsx __tests__/middleware.test.ts

# Run TierGate component tests
npx tsx __tests__/tiergating.test.ts
```

### Test Coverage

- ✅ 72 tier limit & feature tests
- ✅ 42 route protection tests
- ✅ 22 component gating tests
- **Total: 136 tests**

## Local Testing with Stripe CLI

### Setup

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Listen for webhook events
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret to .env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Testing Checkout

```bash
# In one terminal
npm run dev

# Create test payment token
stripe payment_methods create \
  --type card \
  --card-number 4242424242424242 \
  --card-exp-month 12 \
  --card-exp-year 25 \
  --card-cvc 123
```

### Testing Webhooks

```bash
# Simulate checkout completion
stripe trigger payment_intent.succeeded

# Simulate subscription created
stripe trigger customer.subscription.created
```

## Stripe Dashboard Configuration

### Create Products

1. Go to: https://dashboard.stripe.com/test/products
2. Create 4 products:
   - Pro - Monthly
   - Pro - Yearly
   - Max - Monthly
   - Max - Yearly

### Price IDs Mapping

After creating products, map price IDs:

```
STRIPE_PRO_MONTHLY_PRICE_ID  → Pro - Monthly price ID
STRIPE_PRO_YEARLY_PRICE_ID   → Pro - Yearly price ID
STRIPE_MAX_MONTHLY_PRICE_ID  → Max - Monthly price ID
STRIPE_MAX_YEARLY_PRICE_ID   → Max - Yearly price ID
```

### Webhook Endpoint Configuration

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Create endpoint:
   - URL: `https://your-app.com/api/webhooks/stripe`
   - Events: Select all relevant events
3. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Data Flow

### Checkout Flow

```
User clicks "Upgrade"
  ↓
PricingCards component
  ↓
POST /api/stripe/checkout
  ├─ Creates/retrieves Stripe customer
  ├─ Creates checkout session
  └─ Returns session URL
  ↓
Stripe Checkout redirects to payment
  ↓
Payment successful
  ↓
Stripe webhook: checkout.session.completed
  ├─ Verifies signature
  ├─ Updates Clerk metadata (tier, stripeCustomerId)
  └─ Webhook completes
  ↓
User tier updated in next session
```

### Subscription Status Check

```
User loads dashboard
  ↓
useTier hook
  ├─ Gets tier from Clerk publicMetadata
  └─ Returns cached tier
  ↓
GET /api/stripe/subscription (optional refresh)
  ├─ Calls Stripe API
  ├─ Gets current subscription status
  └─ Returns subscription details
```

## Security Checklist

- ✅ Publishable key is public-safe (starts with `pk_test_`)
- ✅ Secret key never exposed to client
- ✅ Webhook signature verified before processing
- ✅ User tier validated on server before critical operations
- ✅ API routes require authentication via Clerk
- ✅ Middleware enforces route-level tier checks
- ✅ TierGate component prevents accidental feature exposure
- ✅ Environment variables loaded from Vercel (never committed)

## Troubleshooting

### Webhook Not Firing

1. Check `STRIPE_WEBHOOK_SECRET` is correct
2. Verify endpoint URL in Stripe Dashboard
3. Check logs: `vercel logs`
4. Test locally with Stripe CLI: `stripe trigger payment_intent.succeeded`

### Tier Not Updating

1. Check Clerk user `publicMetadata` updated
2. Verify webhook signature validation passing
3. Check Stripe customer ID matches
4. Review webhook event logs in Stripe Dashboard

### Payment Errors

1. Use Stripe test cards: `4242 4242 4242 4242`
2. Any future date for expiry
3. Any 3-digit CVC
4. Check error logs: `vercel logs --follow`

### Local Testing Issues

1. Ensure `npm run dev` is running on port 3000
2. Run `stripe listen` in separate terminal
3. Use correct webhook secret from Stripe CLI output
4. Clear browser cache/cookies for auth state

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Clerk Documentation](https://clerk.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

**Last Updated:** January 2025
**Maintainer:** Development Team
**Status:** Production Ready ✅
