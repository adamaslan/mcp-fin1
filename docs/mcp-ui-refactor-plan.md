# MCP-UI Complete Integration Refactor Plan

**Date**: February 2, 2026
**Goal**: Integrate all 9 MCP tools with AI analysis into the frontend UI with minimal code duplication

---

## Executive Summary

This document outlines the complete refactoring plan to integrate all 9 MCP tools with their AI-enhanced analysis capabilities into the MCP Finance frontend. The refactor prioritizes:

1. **Complete MCP Integration** - All 9 tools fully functional in UI
2. **Minimal Code Duplication** - Shared components, hooks, and utilities
3. **Consistent AI Analysis Display** - Unified AI insights presentation
4. **Tier-Based Access Control** - Proper gating for all features

---

## Current State Analysis

### Existing MCP Client Methods (7 of 9)

| #   | MCP Tool                | Client Method        | API Route                      | UI Page             | AI Support    |
| --- | ----------------------- | -------------------- | ------------------------------ | ------------------- | ------------- |
| 1   | `analyze_security`      | `analyzeSecurity()`  | `/api/mcp/analyze`             | `/analyze/[symbol]` | `useAi` param |
| 2   | `compare_securities`    | `compareSecurity()`  | ❌ Missing                     | ❌ Missing          | ❌            |
| 3   | `screen_securities`     | `screenSecurities()` | `/api/mcp/scan`                | `/scanner`          | ❌            |
| 4   | `get_trade_plan`        | `getTradePlan()`     | `/api/mcp/trade-plan`          | `/analyze/[symbol]` | ❌            |
| 5   | `scan_trades`           | `scanTrades()`       | `/api/mcp/scan`                | `/scanner`          | ❌            |
| 6   | `portfolio_risk`        | `portfolioRisk()`    | `/api/mcp/portfolio-risk`      | `/portfolio`        | ❌            |
| 7   | `morning_brief`         | `morningBrief()`     | `/api/dashboard/morning-brief` | `/` (dashboard)     | ❌            |
| 8   | `analyze_fibonacci`     | `analyzeFibonacci()` | `/api/mcp/fibonacci`           | `/fibonacci`        | ❌            |
| 9   | `options_risk_analysis` | ❌ **MISSING**       | ❌ **MISSING**                 | ❌ **MISSING**      | ❌            |

### Key Gaps Identified

1. **Missing MCP Tool**: `options_risk_analysis` not implemented
2. **Missing UI**: `compare_securities` has no dedicated page
3. **No AI Integration**: Only `analyzeSecurity` has `useAi` parameter
4. **Duplicated Patterns**: Each page reimplements fetch, loading, error handling
5. **Inconsistent AI Display**: No unified component for AI insights

---

## What Will Be ADDED

### 1. New MCP Client Methods

**File**: `nextjs-mcp-finance/src/lib/mcp/client.ts`

```typescript
// NEW: Options Risk Analysis
async optionsRiskAnalysis(
  symbol: string,
  positionType: 'call' | 'put' | 'spread',
  options?: {
    strike?: number;
    expiration?: string;
    quantity?: number;
  },
  useAi = false
): Promise<OptionsRiskResult>

// UPDATE: Add useAi parameter to ALL existing methods
async compareSecurity(symbols: string[], metric: string, useAi = false)
async screenSecurities(universe: string, criteria: any, limit: number, useAi = false)
async scanTrades(universe: string, maxResults: number, useAi = false)
async portfolioRisk(positions: Position[], useAi = false)
async morningBrief(watchlist: string[], marketRegion: string, useAi = false)
async analyzeFibonacci(symbol: string, period: string, window: number, useAi = false)
```

### 2. New Types

**File**: `nextjs-mcp-finance/src/lib/mcp/types.ts`

```typescript
// NEW: AI Analysis Types (shared across all tools)
export interface AIAnalysis {
  summary: string;
  market_bias?: "BULLISH" | "BEARISH" | "NEUTRAL";
  bias_explanation?: string;
  key_drivers?: AIKeyDriver[];
  action_items?: AIActionItem[];
  risk_factors?: string[];
  confidence_score?: number;
}

export interface AIKeyDriver {
  signal: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
}

export interface AIActionItem {
  priority: number;
  timeframe: "IMMEDIATE" | "TODAY" | "THIS_WEEK" | "MONITOR";
  action: string;
}

// NEW: Options Risk Types
export interface OptionsRiskResult {
  symbol: string;
  timestamp: string;
  underlying_price: number;
  position: OptionsPosition;
  greeks: OptionsGreeks;
  risk_metrics: OptionsRiskMetrics;
  scenarios: OptionsScenario[];
  ai_analysis?: OptionsAIAnalysis;
}

export interface OptionsPosition {
  type: "call" | "put" | "spread";
  strike: number;
  expiration: string;
  premium: number;
  quantity: number;
  implied_volatility: number;
}

export interface OptionsGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface OptionsRiskMetrics {
  max_profit: number;
  max_loss: number;
  breakeven: number | number[];
  probability_of_profit: number;
  expected_value: number;
}

export interface OptionsScenario {
  name: string;
  price_change_percent: number;
  pnl: number;
  new_delta: number;
}

export interface OptionsAIAnalysis extends AIAnalysis {
  sentiment_from_flow: string;
  iv_analysis: string;
  strategy_recommendations: OptionsStrategyRec[];
  optimal_strikes: OptimalStrike[];
  position_sizing: string;
}

// UPDATE: Add ai_analysis to existing types
export interface AnalysisResult {
  // ... existing fields ...
  ai_analysis?: SecurityAIAnalysis;
}

export interface ScanResult {
  // ... existing fields ...
  ai_analysis?: ScanAIAnalysis;
}

// ... (similar updates for all result types)
```

### 3. New API Routes

**Files to create**:

```
nextjs-mcp-finance/src/app/api/
├── mcp/
│   ├── options-risk/route.ts      # NEW
│   ├── compare/route.ts           # NEW
│   └── [existing routes]          # UPDATE for AI
```

### 4. New UI Pages

**Files to create**:

```
nextjs-mcp-finance/src/app/(dashboard)/
├── options/                       # NEW - Options Analysis
│   └── page.tsx
├── compare/                       # NEW - Security Comparison
│   └── page.tsx
```

### 5. Shared Components (Reduce Duplication)

**Files to create**:

```
nextjs-mcp-finance/src/components/
├── mcp/                           # NEW - MCP-specific shared components
│   ├── AIInsightsPanel.tsx        # Unified AI analysis display
│   ├── AIMarketBias.tsx           # Market bias indicator
│   ├── AIActionItems.tsx          # Action items display
│   ├── AIKeyDrivers.tsx           # Key drivers list
│   ├── MCPLoadingState.tsx        # Consistent loading skeleton
│   ├── MCPErrorState.tsx          # Consistent error display
│   └── MCPEmptyState.tsx          # Empty state with suggestions
├── options/                       # NEW - Options components
│   ├── GreeksDisplay.tsx
│   ├── RiskScenarios.tsx
│   ├── OptionChainSelector.tsx
│   └── ProfitLossChart.tsx
├── compare/                       # NEW - Comparison components
│   ├── ComparisonTable.tsx
│   ├── ComparisonChart.tsx
│   └── SecuritySelector.tsx
```

### 6. Shared Hooks (Reduce Duplication)

**File**: `nextjs-mcp-finance/src/hooks/useMCPQuery.ts`

```typescript
// Generic hook for all MCP queries with AI support
export function useMCPQuery<T>({
  endpoint: string,
  params: Record<string, any>,
  useAi?: boolean,
  enabled?: boolean,
}): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

**File**: `nextjs-mcp-finance/src/hooks/useAIAnalysis.ts`

```typescript
// Hook to request AI analysis on-demand
export function useAIAnalysis<T>({ tool: MCPTool, data: T }): {
  aiAnalysis: AIAnalysis | null;
  loading: boolean;
  requestAnalysis: () => void;
};
```

### 7. Landing Page Enhancements

**Updates to**: `nextjs-mcp-finance/src/components/landing/`

```
├── OptionsPreview.tsx             # NEW - Options analysis preview
├── ComparePreview.tsx             # NEW - Comparison preview
├── AIInsightsShowcase.tsx         # NEW - Show AI capabilities
├── ToolGrid.tsx                   # NEW - Grid of all 9 tools
```

---

## What Will Be REMOVED

### 1. Duplicated Fetch Logic

**Remove from each page** (consolidate into hooks):

```typescript
// REMOVE this pattern from every page:
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<T | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/mcp/...");
      // ... same pattern repeated 10+ times
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [deps]);
```

**Replace with**:

```typescript
const { data, loading, error, refetch } = useMCPQuery<TradePlanResult>({
  endpoint: "/api/mcp/trade-plan",
  params: { symbol, period },
  useAi: aiEnabled,
});
```

### 2. Inconsistent Loading States

**Remove**: Individual skeleton implementations per page

**Replace with**: Shared `<MCPLoadingState tool="trade-plan" />` component

### 3. Duplicated Error Handling

**Remove**: Individual error display implementations

**Replace with**: Shared `<MCPErrorState error={error} onRetry={refetch} />` component

### 4. Inline Tier Checking

**Remove**: Repeated tier checking logic in components

```typescript
// REMOVE this pattern:
const { tier } = useTier();
if (tier === 'free' && someFeature) {
  return <UpgradeCTA />;
}
```

**Replace with**: Wrapper component `<TierGate feature="options-analysis">{children}</TierGate>`

---

## What Will Be MODIFIED

### 1. MCP Client (`src/lib/mcp/client.ts`)

| Change         | Before                    | After                         |
| -------------- | ------------------------- | ----------------------------- |
| AI parameter   | Only on `analyzeSecurity` | On ALL 9 methods              |
| Options method | Missing                   | `optionsRiskAnalysis()` added |
| Return types   | Partial AI types          | Full AI analysis types        |

### 2. API Routes

| Route                          | Change                   |
| ------------------------------ | ------------------------ |
| `/api/mcp/trade-plan`          | Add `use_ai` query param |
| `/api/mcp/scan`                | Add `use_ai` query param |
| `/api/mcp/fibonacci`           | Add `use_ai` query param |
| `/api/mcp/portfolio-risk`      | Add `use_ai` query param |
| `/api/dashboard/morning-brief` | Add `use_ai` query param |
| `/api/mcp/compare`             | NEW route                |
| `/api/mcp/options-risk`        | NEW route                |

### 3. Dashboard Pages

| Page                | Modifications                                     |
| ------------------- | ------------------------------------------------- |
| `/` (Dashboard)     | Add AI insights toggle, use shared loading state  |
| `/analyze/[symbol]` | Add AI toggle, display AI panel, use shared hooks |
| `/scanner`          | Add AI toggle, display AI panel, use shared hooks |
| `/watchlist`        | Add AI signal explanations                        |
| `/fibonacci`        | Add AI toggle, display AI panel                   |
| `/portfolio`        | Add AI toggle, display AI recommendations         |

### 4. Landing Page

| Section          | Modifications                             |
| ---------------- | ----------------------------------------- |
| Hero             | Add "AI-Powered" badge, update value prop |
| Feature previews | Add AI examples to each preview           |
| Tool grid        | Show all 9 tools with AI badges           |
| Pricing          | Highlight AI features per tier            |

### 5. Navigation (Sidebar)

| Change       | Details                          |
| ------------ | -------------------------------- |
| Add Options  | New nav item for `/options`      |
| Add Compare  | New nav item for `/compare`      |
| AI indicator | Show AI availability per feature |

---

## Tier Access Matrix (Updated)

| Feature                 | Free             | Pro                | Max              |
| ----------------------- | ---------------- | ------------------ | ---------------- |
| `analyze_security`      | 5/day, no AI     | 50/day, AI         | Unlimited, AI    |
| `compare_securities`    | 2 symbols        | 5 symbols          | 10 symbols       |
| `screen_securities`     | Basic criteria   | Advanced           | All + custom     |
| `get_trade_plan`        | Swing only       | +Day               | +Scalp           |
| `scan_trades`           | 1/day, 5 results | 10/day, 25 results | Unlimited        |
| `portfolio_risk`        | ❌               | Basic              | Full + AI        |
| `morning_brief`         | Basic            | Full               | Full + AI        |
| `analyze_fibonacci`     | 3 levels         | 15 levels          | Unlimited        |
| `options_risk_analysis` | ❌               | Basic              | Full + AI        |
| **AI Analysis**         | ❌               | On request         | Always available |

---

## Code Duplication Reduction Summary

### Before (Current State)

| Pattern                      | Occurrences   | Lines          |
| ---------------------------- | ------------- | -------------- |
| Fetch + useState + useEffect | 8 pages       | ~320 lines     |
| Loading skeleton             | 8 pages       | ~160 lines     |
| Error handling               | 8 pages       | ~120 lines     |
| Tier checking                | 12 components | ~180 lines     |
| **Total duplicated**         |               | **~780 lines** |

### After (Refactored)

| Shared Utility       | Replaces         | Lines Saved    |
| -------------------- | ---------------- | -------------- |
| `useMCPQuery` hook   | 8 fetch patterns | ~280 lines     |
| `<MCPLoadingState>`  | 8 skeletons      | ~140 lines     |
| `<MCPErrorState>`    | 8 error handlers | ~100 lines     |
| `<TierGate>` wrapper | 12 tier checks   | ~150 lines     |
| **Total saved**      |                  | **~670 lines** |

### Net Impact

- **Removed**: ~780 lines of duplicated code
- **Added**: ~200 lines of shared utilities
- **Net reduction**: ~580 lines
- **Maintainability**: Single source of truth for common patterns

---

## File Changes Summary

### New Files (21)

```
src/lib/mcp/
├── client.ts                      # UPDATE
├── types.ts                       # UPDATE
└── ai-types.ts                    # NEW

src/hooks/
├── useMCPQuery.ts                 # NEW
└── useAIAnalysis.ts               # NEW

src/app/api/mcp/
├── options-risk/route.ts          # NEW
└── compare/route.ts               # NEW

src/app/(dashboard)/
├── options/page.tsx               # NEW
└── compare/page.tsx               # NEW

src/components/mcp/
├── AIInsightsPanel.tsx            # NEW
├── AIMarketBias.tsx               # NEW
├── AIActionItems.tsx              # NEW
├── AIKeyDrivers.tsx               # NEW
├── MCPLoadingState.tsx            # NEW
├── MCPErrorState.tsx              # NEW
└── MCPEmptyState.tsx              # NEW

src/components/options/
├── GreeksDisplay.tsx              # NEW
├── RiskScenarios.tsx              # NEW
├── OptionChainSelector.tsx        # NEW
└── ProfitLossChart.tsx            # NEW

src/components/compare/
├── ComparisonTable.tsx            # NEW
├── ComparisonChart.tsx            # NEW
└── SecuritySelector.tsx           # NEW

src/components/landing/
├── OptionsPreview.tsx             # NEW
├── ComparePreview.tsx             # NEW
├── AIInsightsShowcase.tsx         # NEW
└── ToolGrid.tsx                   # NEW
```

### Modified Files (15)

```
src/lib/mcp/client.ts              # Add AI params, options method
src/lib/mcp/types.ts               # Add AI types, options types
src/lib/auth/tiers.ts              # Update tier limits

src/app/(dashboard)/page.tsx       # Use shared hooks
src/app/(dashboard)/analyze/[symbol]/page.tsx
src/app/(dashboard)/scanner/page.tsx
src/app/(dashboard)/watchlist/page.tsx
src/app/(dashboard)/fibonacci/page.tsx
src/app/(dashboard)/portfolio/page.tsx

src/app/api/mcp/trade-plan/route.ts    # Add AI support
src/app/api/mcp/scan/route.ts
src/app/api/mcp/fibonacci/route.ts
src/app/api/mcp/portfolio-risk/route.ts
src/app/api/dashboard/morning-brief/route.ts

src/components/dashboard/Sidebar.tsx   # Add new nav items
src/app/page.tsx                       # Landing page updates
```

### Removed Code (from multiple files)

```
- Duplicated useState/useEffect patterns (~280 lines)
- Duplicated loading skeletons (~140 lines)
- Duplicated error handlers (~100 lines)
- Inline tier checks (~150 lines)
```

---

## Implementation Priority

### Phase 1: Foundation (Week 1)

1. Create shared hooks (`useMCPQuery`, `useAIAnalysis`)
2. Create shared MCP components (loading, error, empty states)
3. Update MCP client with AI parameters
4. Add new types for AI analysis

### Phase 2: AI Integration (Week 2)

1. Add `AIInsightsPanel` and related components
2. Update existing pages to use shared hooks
3. Add AI toggle to all analysis pages
4. Implement AI analysis display

### Phase 3: New Features (Week 3)

1. Add `options_risk_analysis` to MCP client
2. Create `/options` page with full UI
3. Create `/compare` page with comparison features
4. Add new API routes

### Phase 4: Landing Page & Polish (Week 4)

1. Update landing page with all 9 tools
2. Add AI showcase section
3. Update pricing to reflect AI tiers
4. Final testing and bug fixes

---

## Testing Requirements

### Unit Tests

- [ ] `useMCPQuery` hook with all endpoints
- [ ] `useAIAnalysis` hook with all tools
- [ ] AI type transformations
- [ ] Tier gating logic

### Integration Tests

- [ ] All 9 MCP tools return data
- [ ] AI analysis toggle works
- [ ] Tier restrictions enforced
- [ ] Error handling works

### E2E Tests

- [ ] Full flow: landing → signup → analysis → AI insights
- [ ] Options analysis workflow
- [ ] Comparison workflow
- [ ] Tier upgrade prompts

---

## Success Criteria

- [ ] All 9 MCP tools accessible in UI
- [ ] AI analysis available for all tools (tier-gated)
- [ ] Code duplication reduced by 70%+
- [ ] Consistent loading/error/empty states
- [ ] Landing page showcases all 9 tools
- [ ] Documentation complete

---

## Questions for Review

1. Should AI analysis be on by default for Pro+ users?
2. Options risk analysis - which position types to support initially?
3. Compare feature - allow cross-sector comparison?
4. Landing page - show live AI demo or just static examples?

---

**Status**: Ready for Implementation
**Next Step**: Begin Phase 1 - Create shared hooks and components
