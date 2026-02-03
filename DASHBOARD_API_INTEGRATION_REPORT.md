# Dashboard API Integration & Type Safety Report

**Date**: February 2, 2026
**Project**: MCP Finance (Next.js)
**Scope**: Dashboard Pages API Connectivity & Additional Type Safety Issues

---

## Executive Summary

Completed comprehensive analysis of dashboard pages in `/src/app/(dashboard)` to verify:

1. ✅ API endpoint connectivity from dashboard components
2. ✅ Type safety in API response handling
3. ❌ Additional TypeScript errors found in API routes and components

**Result**: Most dashboard pages are properly connected to APIs and correctly typed. However, 5 additional type safety issues were discovered that require attention.

---

## Dashboard Pages Status

### ✅ Properly Connected (No Issues)

| Page                  | API Endpoint                 | Status       | Type Safety          |
| --------------------- | ---------------------------- | ------------ | -------------------- |
| `/fibonacci`          | `/api/mcp/fibonacci`         | ✅ Connected | ✅ Properly Typed    |
| `/fibonacci/[symbol]` | `/api/mcp/fibonacci/history` | ✅ Connected | ✅ Properly Typed    |
| `/analyze/[symbol]`   | `/api/mcp/analyze`           | ✅ Connected | ✅ Properly Typed    |
| `/scanner`            | `/api/mcp/scan`              | ✅ Connected | ✅ Properly Typed    |
| `/watchlist`          | `/api/watchlist/*`           | ✅ Connected | ✅ Properly Typed    |
| `/signals`            | `/api/watchlist/signals`     | ✅ Connected | ✅ Properly Typed    |
| `/portfolio`          | `/api/mcp/portfolio-risk`    | ✅ Connected | ✅ Properly Typed    |
| `/journal`            | `/api/export`                | ✅ Connected | ⚠️ Type Issues Found |
| `/alerts`             | `/api/alerts`                | ✅ Connected | ✅ Properly Typed    |

---

## Additional Type Safety Issues Found

### Issue 1: Unsafe Type Casting in watchlist/analyze/route.ts ⚠️

**Severity**: HIGH
**File**: `src/app/api/watchlist/analyze/route.ts`
**Lines**: 106, 109, 133-134

#### Problem

```typescript
const signals = (analysis.signals || []) as Signal[];
const bullishCount = signals.filter(
  (s: Signal) => (s as any).direction === "bullish", // ❌ Unsafe cast
).length;
```

Using `as any` on Signal properties bypasses type checking. The `Signal` interface doesn't explicitly define `direction` property, making this unsafe.

#### Impact

- Runtime errors if Signal objects don't have `direction` property
- Type checker cannot verify property existence
- Violates TypeScript strict mode philosophy

#### Recommendation

Create a proper interface with explicit properties:

```typescript
interface AnalysisSignal {
  signal: string;
  direction: "bullish" | "bearish" | "neutral";
  strength: string;
  category: string;
}
```

---

### Issue 2: Missing Type Annotations in export/route.ts ⚠️

**Severity**: MEDIUM
**File**: `src/app/api/export/route.ts`
**Lines**: 49, 56, 70, 71

#### Problem

```typescript
// Lines 49, 56 - forEach callbacks missing types
trades.forEach((trade) => {  // ❌ Implicit any
  csv += `${trade.symbol}...`;
});

userPositions.forEach((pos) => {  // ❌ Implicit any
  csv += `${pos.symbol}...`;
});

// Lines 70, 71 - Reduce callback parameter not typed
.reduce((sum, t: Trade) => sum + (t.pnl || 0), 0)  // ❌ sum is implicitly any
```

#### Impact

- Type checker cannot verify `trade` and `pos` properties
- Reduce function parameter `sum` lacks type annotation
- Potential runtime errors with undefined properties

#### Recommendation

Add explicit type annotations:

```typescript
trades.forEach((trade: Trade) => {
  csv += `${trade.symbol}...`;
});

.reduce((sum: number, t: Trade) => sum + (t.pnl || 0), 0)
```

---

### Issue 3: Invalid Type Cast in fibonacci/history/route.ts ⚠️

**Severity**: HIGH
**File**: `src/app/api/mcp/fibonacci/history/route.ts`
**Lines**: 82-85

#### Problem

```typescript
gte(
  fibonacciSignalHistory.confluenceScore,
  minConfluence.toString() as never,  // ❌ Invalid cast from string to never
),
```

Casting a string to `never` type is fundamentally unsound and indicates a type mismatch in the Drizzle ORM query.

#### Impact

- Drizzle ORM comparison may fail at runtime
- Type safety is completely bypassed
- The `confluenceScore` field likely expects a numeric type, not string

#### Recommendation

Investigate the schema definition for `confluenceScore`:

```typescript
// If confluenceScore is numeric in DB:
gte(fibonacciSignalHistory.confluenceScore, minConfluence); // Don't convert to string

// Or if it must be string:
gte(fibonacciSignalHistory.confluenceScore, minConfluence.toString()); // Remove as never
```

---

### Issue 4: Unsafe Object.entries Casting in fibonacci/history/route.ts ⚠️

**Severity**: MEDIUM
**File**: `src/app/api/mcp/fibonacci/history/route.ts`
**Lines**: 176-178

#### Problem

```typescript
for (const [key, metrics] of Object.entries(data) as Array<
  [string, PerformanceMetrics]
>) {  // ❌ Casting without validation
```

TypeScript cannot verify that all values in the object conform to `PerformanceMetrics` type.

#### Impact

- Runtime errors if object contains values of different types
- Type assertion masks potential problems
- No validation that metrics actually has expected structure

#### Recommendation

Create a type-safe helper:

```typescript
const entries = Object.entries(data) as Array<[string, PerformanceMetrics]>;
// or use Object.keys + proper typing:
for (const key of Object.keys(data)) {
  const metrics = data[key];
  if (isPerformanceMetrics(metrics)) {
    // safe operations
  }
}
```

---

### Issue 5: Unsafe Any Cast in RiskDashboard Component ⚠️

**Severity**: MEDIUM
**File**: `src/components/portfolio/RiskDashboard.tsx`
**Lines**: 209-211

#### Problem

```typescript
{(riskData as any).hedge_suggestions &&
  (riskData as any).hedge_suggestions.length > 0 && (
    <HedgeSuggestions suggestions={(riskData as any).hedge_suggestions} />
  )}
```

Casting `riskData` to `any` bypasses type checking for optional properties.

#### Impact

- Type system cannot verify `hedge_suggestions` is defined
- No IDE autocomplete for this property
- Increases maintenance burden

#### Recommendation

Update type definition to explicitly include optional property:

```typescript
// Update PortfolioRiskResult interface
interface PortfolioRiskResult {
  total_value: number;
  total_max_loss: number;
  risk_percent_of_portfolio: number;
  overall_risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  positions: PortfolioPosition[];
  sector_concentration: Record<string, number>;
  hedge_suggestions?: string[];  // Make this explicit
}

// Then in component:
{riskData.hedge_suggestions && riskData.hedge_suggestions.length > 0 && (
  <HedgeSuggestions suggestions={riskData.hedge_suggestions} />
)}
```

---

## Dashboard Component Type Safety Status

### ✅ Well-Typed Components

- `FibonacciAnalysis.tsx` - Excellent type safety
- `TradePlanCard.tsx` - Props properly typed
- `AnalysisSummary.tsx` - Type definitions comprehensive
- `PortfolioOverview.tsx` - Good use of derived types
- `SignalsBreakdown.tsx` - TypeScript inference working well
- `Scanner.tsx` - Proper typing throughout

### ⚠️ Components with Issues

- `RiskDashboard.tsx` - Unsafe `any` cast on optional property (Line 209-211)
- `ExportData.tsx` - Uses export API with type issues

---

## API Integration Verification

All dashboard pages correctly call their respective API endpoints:

| Dashboard Page    | Uses API | Endpoint                                 | Response Type             | Notes                      |
| ----------------- | -------- | ---------------------------------------- | ------------------------- | -------------------------- |
| Fibonacci         | ✅       | POST `/api/mcp/fibonacci`                | `FibonacciAnalysisResult` | Properly typed             |
| Fibonacci History | ✅       | GET `/api/mcp/fibonacci/history?symbol=` | Historical signals array  | Properly typed             |
| Stock Analysis    | ✅       | POST `/api/mcp/analyze`                  | `AnalysisResult`          | Properly typed             |
| Watchlist Batch   | ✅       | POST `/api/watchlist/analyze`            | Batch analysis results    | ⚠️ Type issues in response |
| Portfolio Risk    | ✅       | POST `/api/mcp/portfolio-risk`           | `PortfolioRiskResult`     | ⚠️ Component casting issue |
| Market Scanner    | ✅       | POST `/api/mcp/scan`                     | `ScanResult`              | Properly typed             |
| Trade Export      | ✅       | GET `/api/export?format=`                | JSON/CSV                  | ⚠️ Type issues in handler  |

---

## Next Steps - Priority Order

### 🔴 Critical (Fix Immediately)

1. [ ] Fix line 84 in `fibonacci/history/route.ts` - Remove invalid `as never` cast
2. [ ] Remove unsafe `as any` in `watchlist/analyze/route.ts` (lines 106, 109)

### 🟠 High Priority (Fix Soon)

3. [ ] Add `AnalysisSignal` interface with explicit `direction` property
4. [ ] Update `PortfolioRiskResult` type to include `hedge_suggestions?: string[]`

### 🟡 Medium Priority (Fix This Sprint)

5. [ ] Add explicit types to forEach callbacks in `export/route.ts`
6. [ ] Replace Object.entries casting with type-safe approach
7. [ ] Update RiskDashboard component to remove `as any` cast

---

## Type Safety Improvement Summary

**Current State**:

- ✅ 8/9 dashboard pages properly connected to APIs
- ✅ Component type safety is generally good
- ⚠️ 5 type safety issues in API routes and components requiring fixes

**Recommendation**:

1. Run `tsc --noEmit --strict` to catch remaining issues
2. Enable `noImplicitAny: true` in tsconfig if not already set
3. Consider using ESLint rules to prevent unsafe type assertions

---

**Status**: ⚠️ **REQUIRES ADDITIONAL FIXES**
**Expected Completion**: After fixing the 5 identified issues
**Ready for Testing**: Once all high/critical priority items are resolved
