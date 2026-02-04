# MCP-Frontend Integration Guide

**Complete guide for integrating all 9 MCP tools with AI into the frontend UI**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [The 9 MCP Tools](#the-9-mcp-tools)
3. [Data Flow](#data-flow)
4. [MCP Client Layer](#mcp-client-layer)
5. [API Routes Layer](#api-routes-layer)
6. [UI Component Layer](#ui-component-layer)
7. [AI Analysis Integration](#ai-analysis-integration)
8. [How to Update MCP Tools](#how-to-update-mcp-tools)
9. [Adding New Data to Frontend](#adding-new-data-to-frontend)
10. [Tier-Based Access Control](#tier-based-access-control)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐     ┌──────────────────────┐                      │
│  │    Landing Page      │     │      Dashboard       │                      │
│  │  - Hero              │     │  - Overview          │                      │
│  │  - Previews          │     │  - Analysis pages    │                      │
│  │  - Tool Grid         │     │  - All 9 MCP tools   │                      │
│  └──────────┬───────────┘     └──────────┬───────────┘                      │
│             │                             │                                  │
│             ▼                             ▼                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Shared Components Layer                         │    │
│  │  - AIInsightsPanel    - MCPLoadingState    - TierGate               │    │
│  │  - AIMarketBias       - MCPErrorState      - UpgradeCTA             │    │
│  │  - AIActionItems      - MCPEmptyState      - BlurredContent         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       Custom Hooks Layer                             │    │
│  │  - useMCPQuery()          - useTier()                               │    │
│  │  - useAIAnalysis()        - useUsageLimit()                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       API Routes Layer                               │    │
│  │                    /api/mcp/[tool-name]                             │    │
│  │  - Authentication (Clerk)                                           │    │
│  │  - Usage tracking                                                   │    │
│  │  - Tier validation                                                  │    │
│  │  - Response filtering                                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       MCP Client Layer                               │    │
│  │                   src/lib/mcp/client.ts                             │    │
│  │  - MCPClient class                                                  │    │
│  │  - 9 tool methods                                                   │    │
│  │  - AI parameter handling                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Python MCP Server)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    technical_analysis_mcp/                           │    │
│  │                                                                      │    │
│  │  server.py                    ai_analyzer.py                        │    │
│  │  ├── analyze_security         ├── analyze_security_output()         │    │
│  │  ├── compare_securities       ├── analyze_comparison_output()       │    │
│  │  ├── screen_securities        ├── analyze_screening_output()        │    │
│  │  ├── get_trade_plan           ├── analyze_trade_plan_output()       │    │
│  │  ├── scan_trades              ├── analyze_scan_output()             │    │
│  │  ├── portfolio_risk           ├── analyze_portfolio_risk_output()   │    │
│  │  ├── morning_brief            ├── analyze_morning_brief_output()    │    │
│  │  ├── analyze_fibonacci        ├── analyze_fibonacci_output()        │    │
│  │  └── options_risk_analysis    └── analyze_options_risk_output()     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The 9 MCP Tools

### Complete Reference Table

| #   | Tool Name               | Purpose                                         | Frontend Page       | Primary Data                   | AI Analysis Output                     |
| --- | ----------------------- | ----------------------------------------------- | ------------------- | ------------------------------ | -------------------------------------- |
| 1   | `analyze_security`      | Deep technical analysis of a single stock       | `/analyze/[symbol]` | Price, signals, indicators     | Market bias, key drivers, action items |
| 2   | `compare_securities`    | Side-by-side comparison of multiple stocks      | `/compare`          | Rankings, metrics comparison   | Best pick, rationale, strategy         |
| 3   | `screen_securities`     | Filter stocks by technical/fundamental criteria | `/scanner`          | Filtered stock list            | Pattern recognition, refinements       |
| 4   | `get_trade_plan`        | Entry/stop/target levels for a trade            | `/analyze/[symbol]` | Trade plans per timeframe      | Risk analysis, execution plan          |
| 5   | `scan_trades`           | Find high-probability setups in real-time       | `/scanner`          | Qualified trades list          | Opportunity ranking, themes            |
| 6   | `portfolio_risk`        | Quantify total portfolio risk exposure          | `/portfolio`        | Risk metrics, positions        | Hedge recommendations, rebalancing     |
| 7   | `morning_brief`         | Daily market briefing                           | `/` (dashboard)     | Market status, events, signals | Top opportunities, key risks           |
| 8   | `analyze_fibonacci`     | Fibonacci levels and confluence zones           | `/fibonacci`        | Levels, clusters, zones        | Setup type, trading zones              |
| 9   | `options_risk_analysis` | Options flow sentiment and risk                 | `/options`          | Greeks, scenarios, flow        | Strategy recommendations               |

---

## Data Flow

### Request Flow (User Action → MCP Server)

```
1. User clicks "Analyze AAPL" button
                │
                ▼
2. React component calls useMCPQuery hook
   const { data, loading } = useMCPQuery({
     endpoint: '/api/mcp/trade-plan',
     params: { symbol: 'AAPL', period: '1mo', use_ai: true }
   });
                │
                ▼
3. Hook makes fetch() to Next.js API route
   POST /api/mcp/trade-plan
   Body: { symbol: 'AAPL', period: '1mo', use_ai: true }
                │
                ▼
4. API route authenticates with Clerk
   const { userId, tier } = await ensureUserInitialized();
                │
                ▼
5. API route checks usage limits
   await checkUsageLimit(userId, 'analysis');
                │
                ▼
6. API route calls MCP client
   const mcp = getMCPClient();
   const result = await mcp.getTradePlan('AAPL', '1mo', true);
                │
                ▼
7. MCP client makes HTTP POST to Python server
   POST http://mcp-server:8000/api/analyze
   Body: { symbol: 'AAPL', period: '1mo', use_ai: true }
                │
                ▼
8. Python server processes request
   - Fetches market data
   - Runs technical analysis
   - Generates trade plans
   - (if use_ai) Calls Gemini for AI analysis
                │
                ▼
9. Response flows back through all layers
   - Python → MCP Client → API Route → Hook → Component
```

### Response Flow (MCP Server → UI)

```
MCP Server Response:
{
  "symbol": "AAPL",
  "trade_plans": [...],
  "ai_analysis": {
    "market_bias": "BULLISH",
    "key_drivers": [...],
    "action_items": [...]
  }
}
        │
        ▼
API Route applies tier filtering:
{
  ...response,
  "trade_plans": filteredByTier,
  "tierLimit": TIER_LIMITS[tier]
}
        │
        ▼
Hook updates component state:
setData(response);
setLoading(false);
        │
        ▼
Component renders data:
<TradePlanCard plan={data.trade_plans[0]} />
<AIInsightsPanel analysis={data.ai_analysis} />
```

---

## MCP Client Layer

### Location

`nextjs-mcp-finance/src/lib/mcp/client.ts`

### Complete Client API

```typescript
class MCPClient {
  private baseUrl: string; // MCP_CLOUD_RUN_URL or localhost:8000

  // Tool 1: Analyze Security
  async analyzeSecurity(
    symbol: string,
    period: string = "1mo",
    useAi: boolean = false,
  ): Promise<AnalysisResult>;

  // Tool 2: Compare Securities
  async compareSecurity(
    symbols: string[], // Up to 10 symbols
    metric: string = "signals",
    useAi: boolean = false,
  ): Promise<ComparisonResult>;

  // Tool 3: Screen Securities
  async screenSecurities(
    universe: string = "sp500",
    criteria: ScreeningCriteria = {},
    limit: number = 20,
    useAi: boolean = false,
  ): Promise<ScreeningResult>;

  // Tool 4: Get Trade Plan
  async getTradePlan(
    symbol: string,
    period: string = "1mo",
    useAi: boolean = false,
  ): Promise<TradePlanResult>;

  // Tool 5: Scan Trades
  async scanTrades(
    universe: string = "sp500",
    maxResults: number = 10,
    useAi: boolean = false,
  ): Promise<ScanResult>;

  // Tool 6: Portfolio Risk
  async portfolioRisk(
    positions: PortfolioPosition[],
    useAi: boolean = false,
  ): Promise<PortfolioRiskResult>;

  // Tool 7: Morning Brief
  async morningBrief(
    watchlist: string[] = [],
    marketRegion: string = "US",
    useAi: boolean = false,
  ): Promise<MorningBriefResult>;

  // Tool 8: Analyze Fibonacci
  async analyzeFibonacci(
    symbol: string,
    period: string = "1d",
    window: number = 50,
    useAi: boolean = false,
  ): Promise<FibonacciAnalysisResult>;

  // Tool 9: Options Risk Analysis
  async optionsRiskAnalysis(
    symbol: string,
    positionType: "call" | "put" | "spread",
    options: OptionsParams = {},
    useAi: boolean = false,
  ): Promise<OptionsRiskResult>;
}
```

### Adding a New Method

To add a new MCP tool method:

```typescript
// 1. Add to client.ts
async newToolMethod(
  param1: string,
  param2: number,
  useAi: boolean = false
): Promise<NewToolResult> {
  const response = await fetch(`${this.baseUrl}/api/new-endpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ param1, param2, use_ai: useAi }),
  });

  return this.handleResponse<NewToolResult>(
    response,
    `/api/new-endpoint (param1=${param1})`
  );
}

// 2. Add types to types.ts
export interface NewToolResult {
  // ... type definition
  ai_analysis?: NewToolAIAnalysis;
}
```

---

## API Routes Layer

### Location

`nextjs-mcp-finance/src/app/api/mcp/[tool]/route.ts`

### Standard Route Pattern

Every MCP API route follows this pattern:

```typescript
// /api/mcp/[tool]/route.ts
import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import { checkUsageLimit, recordUsage } from "@/lib/auth/usage-limits";
import { TIER_LIMITS, filterByTier } from "@/lib/auth/tiers";

export async function POST(request: Request) {
  try {
    // 1. AUTHENTICATION
    const { userId, tier } = await ensureUserInitialized();

    // 2. PARSE REQUEST
    const body = await request.json();
    const { param1, param2, use_ai } = body;

    // 3. VALIDATE INPUT
    if (!param1) {
      return NextResponse.json(
        { error: "param1 is required" },
        { status: 400 },
      );
    }

    // 4. CHECK USAGE LIMITS (if applicable)
    const canProceed = await checkUsageLimit(userId, "tool_name");
    if (!canProceed) {
      return NextResponse.json(
        { error: "Daily limit reached", upgrade: true },
        { status: 429 },
      );
    }

    // 5. VALIDATE TIER ACCESS
    const tierLimit = TIER_LIMITS[tier];
    if (tierLimit.toolName === false) {
      return NextResponse.json(
        { error: "Upgrade required for this feature" },
        { status: 403 },
      );
    }

    // 6. CALL MCP CLIENT
    const mcp = getMCPClient();
    const result = await mcp.toolMethod(param1, param2, use_ai);

    // 7. APPLY TIER FILTERING
    const filteredResult = filterByTier(result, tier, "tool_name");

    // 8. RECORD USAGE
    await recordUsage(userId, "tool_name");

    // 9. RETURN RESPONSE
    return NextResponse.json({
      ...filteredResult,
      tierLimit: tierLimit,
    });
  } catch (error) {
    // 10. ERROR HANDLING
    console.error("[API /mcp/tool] Error:", error);

    if (error.message.includes("MCP API error")) {
      return NextResponse.json(
        { error: "Analysis service unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
```

### Route-to-Tool Mapping

| API Route                           | MCP Tool                | Client Method           |
| ----------------------------------- | ----------------------- | ----------------------- |
| `POST /api/mcp/analyze`             | `analyze_security`      | `analyzeSecurity()`     |
| `POST /api/mcp/compare`             | `compare_securities`    | `compareSecurity()`     |
| `POST /api/mcp/screen`              | `screen_securities`     | `screenSecurities()`    |
| `POST /api/mcp/trade-plan`          | `get_trade_plan`        | `getTradePlan()`        |
| `POST /api/mcp/scan`                | `scan_trades`           | `scanTrades()`          |
| `POST /api/mcp/portfolio-risk`      | `portfolio_risk`        | `portfolioRisk()`       |
| `POST /api/dashboard/morning-brief` | `morning_brief`         | `morningBrief()`        |
| `POST /api/mcp/fibonacci`           | `analyze_fibonacci`     | `analyzeFibonacci()`    |
| `POST /api/mcp/options-risk`        | `options_risk_analysis` | `optionsRiskAnalysis()` |

---

## UI Component Layer

### Page Structure Pattern

Every MCP tool page follows this structure:

```typescript
// /app/(dashboard)/[tool]/page.tsx
'use client';

import { useMCPQuery } from '@/hooks/useMCPQuery';
import { useTier } from '@/hooks/useTier';
import { MCPLoadingState } from '@/components/mcp/MCPLoadingState';
import { MCPErrorState } from '@/components/mcp/MCPErrorState';
import { MCPEmptyState } from '@/components/mcp/MCPEmptyState';
import { AIInsightsPanel } from '@/components/mcp/AIInsightsPanel';
import { TierGate } from '@/components/gating/TierGate';

export default function ToolPage() {
  // 1. STATE & HOOKS
  const [params, setParams] = useState({ /* tool-specific params */ });
  const [aiEnabled, setAiEnabled] = useState(false);
  const { tier } = useTier();

  // 2. DATA FETCHING
  const { data, loading, error, refetch } = useMCPQuery<ToolResult>({
    endpoint: '/api/mcp/tool',
    params: { ...params, use_ai: aiEnabled },
    enabled: !!params.requiredParam,
  });

  // 3. LOADING STATE
  if (loading) {
    return <MCPLoadingState tool="tool-name" />;
  }

  // 4. ERROR STATE
  if (error) {
    return <MCPErrorState error={error} onRetry={refetch} />;
  }

  // 5. EMPTY STATE
  if (!data || data.results.length === 0) {
    return <MCPEmptyState tool="tool-name" onAction={handleAction} />;
  }

  // 6. MAIN CONTENT
  return (
    <div className="space-y-6">
      {/* CONTROLS */}
      <ToolControls params={params} onChange={setParams} />

      {/* AI TOGGLE */}
      <TierGate feature="ai-analysis" requiredTier="pro">
        <AIToggle enabled={aiEnabled} onChange={setAiEnabled} />
      </TierGate>

      {/* MAIN DATA DISPLAY */}
      <ToolDataDisplay data={data} />

      {/* AI INSIGHTS (if enabled and available) */}
      {data.ai_analysis && (
        <AIInsightsPanel
          analysis={data.ai_analysis}
          tool="tool-name"
        />
      )}

      {/* TIER LIMIT INDICATOR */}
      {data.tierLimit && (
        <TierLimitBanner limit={data.tierLimit} tier={tier} />
      )}
    </div>
  );
}
```

### Shared MCP Components

#### AIInsightsPanel

```typescript
// src/components/mcp/AIInsightsPanel.tsx
interface AIInsightsPanelProps {
  analysis: AIAnalysis;
  tool: MCPToolName;
  expanded?: boolean;
}

export function AIInsightsPanel({ analysis, tool, expanded = true }: AIInsightsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-500" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Bias */}
        {analysis.market_bias && (
          <AIMarketBias bias={analysis.market_bias} explanation={analysis.bias_explanation} />
        )}

        {/* Key Drivers */}
        {analysis.key_drivers && (
          <AIKeyDrivers drivers={analysis.key_drivers} />
        )}

        {/* Action Items */}
        {analysis.action_items && (
          <AIActionItems items={analysis.action_items} />
        )}

        {/* Summary */}
        {analysis.summary && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">{analysis.summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### MCPLoadingState

```typescript
// src/components/mcp/MCPLoadingState.tsx
const TOOL_LOADING_MESSAGES: Record<MCPToolName, string> = {
  'analyze_security': 'Analyzing technical indicators...',
  'compare_securities': 'Comparing securities...',
  'screen_securities': 'Screening universe...',
  'get_trade_plan': 'Generating trade plans...',
  'scan_trades': 'Scanning for setups...',
  'portfolio_risk': 'Calculating risk metrics...',
  'morning_brief': 'Preparing market brief...',
  'analyze_fibonacci': 'Calculating Fibonacci levels...',
  'options_risk_analysis': 'Analyzing options risk...',
};

export function MCPLoadingState({ tool }: { tool: MCPToolName }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full" />
      <p className="text-sm text-muted-foreground animate-pulse">
        {TOOL_LOADING_MESSAGES[tool]}
      </p>
    </div>
  );
}
```

---

## AI Analysis Integration

### Enabling AI Analysis

AI analysis is controlled by the `use_ai` parameter at every layer:

```typescript
// 1. Component level - user toggles AI
const [aiEnabled, setAiEnabled] = useState(false);

// 2. Hook level - passed to API
useMCPQuery({
  endpoint: '/api/mcp/tool',
  params: { symbol, use_ai: aiEnabled },
});

// 3. API route level - passed to MCP client
const result = await mcp.toolMethod(symbol, aiEnabled);

// 4. MCP client level - sent to Python server
body: JSON.stringify({ symbol, use_ai: useAi })

// 5. Python server level - calls Gemini if true
if use_ai and os.getenv("GEMINI_API_KEY"):
    result = ai_analyzer.analyze_tool_output(result)
```

### AI Analysis Response Structure

All 9 tools return AI analysis in a consistent structure:

```typescript
interface AIAnalysis {
  // Always present
  summary: string; // Plain English summary

  // Usually present
  market_bias?: "BULLISH" | "BEARISH" | "NEUTRAL";
  bias_explanation?: string; // Why this bias

  // Structured insights
  key_drivers?: {
    signal: string; // What signal
    importance: "HIGH" | "MEDIUM" | "LOW";
    explanation: string; // Why it matters
  }[];

  // Actionable items
  action_items?: {
    priority: number; // 1-5
    timeframe: "IMMEDIATE" | "TODAY" | "THIS_WEEK" | "MONITOR";
    action: string; // What to do
  }[];

  // Risk awareness
  risk_factors?: string[]; // Key risks

  // Confidence
  confidence_score?: number; // 0-100
}
```

### Tool-Specific AI Extensions

Each tool adds specific fields:

```typescript
// analyze_security
interface SecurityAIAnalysis extends AIAnalysis {
  indicator_analysis: Record<string, string>; // RSI, MACD, ADX explanations
  trading_implications: {
    setup_type: string;
    timeframe: string;
    entry_considerations: string;
  };
  signal_quality_assessment: string;
}

// options_risk_analysis
interface OptionsAIAnalysis extends AIAnalysis {
  sentiment_from_flow: string;
  iv_analysis: string;
  strategy_recommendations: {
    type: "directional" | "spread" | "income";
    strategy: string;
    rationale: string;
  }[];
  optimal_strikes: {
    strike: number;
    reason: string;
  }[];
  position_sizing: string;
}

// portfolio_risk
interface PortfolioAIAnalysis extends AIAnalysis {
  concentration_analysis: string;
  hedge_recommendations: {
    instrument: string;
    size: string;
    rationale: string;
  }[];
  rebalancing_suggestions: string[];
  stress_scenarios: {
    scenario: string;
    impact: string;
    mitigation: string;
  }[];
}
```

---

## How to Update MCP Tools

### Scenario: Add New Field to Existing Tool

**Example**: Add `sector` field to `analyze_security`

#### Step 1: Update Python Server

```python
# mcp-finance1/src/technical_analysis_mcp/server.py
async def analyze_security(symbol: str, period: str = "1mo") -> dict:
    # ... existing code ...

    # NEW: Add sector information
    sector = await get_sector(symbol)

    return {
        "symbol": symbol,
        "price": current_price,
        "sector": sector,  # NEW
        # ... rest of response
    }
```

#### Step 2: Update TypeScript Types

```typescript
// nextjs-mcp-finance/src/lib/mcp/types.ts
export interface AnalysisResult {
  symbol: string;
  price: number;
  sector: string; // NEW
  // ... rest of interface
}
```

#### Step 3: Display in UI

```typescript
// In your component
<Badge>{data.sector}</Badge>
```

### Scenario: Add New MCP Tool

**Example**: Add `sentiment_analysis` tool

#### Step 1: Add Python Server Endpoint

```python
# mcp-finance1/src/technical_analysis_mcp/server.py
@app.route('/api/sentiment', methods=['POST'])
async def sentiment_analysis():
    data = await request.json
    symbol = data.get('symbol')
    sources = data.get('sources', ['news', 'social'])

    result = await analyze_sentiment(symbol, sources)

    if data.get('use_ai'):
        result = ai_analyzer.analyze_sentiment_output(result)

    return jsonify(result)
```

#### Step 2: Add AI Analyzer Method

```python
# mcp-finance1/src/technical_analysis_mcp/ai_analyzer.py
def analyze_sentiment_output(self, data: dict) -> dict:
    prompt = self._build_sentiment_prompt(data)
    ai_response = self._call_gemini(prompt)
    data['ai_analysis'] = ai_response
    return data
```

#### Step 3: Add MCP Client Method

```typescript
// nextjs-mcp-finance/src/lib/mcp/client.ts
async sentimentAnalysis(
  symbol: string,
  sources: string[] = ['news', 'social'],
  useAi: boolean = false
): Promise<SentimentResult> {
  const response = await fetch(`${this.baseUrl}/api/sentiment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, sources, use_ai: useAi }),
  });

  return this.handleResponse<SentimentResult>(
    response,
    `/api/sentiment (symbol=${symbol})`
  );
}
```

#### Step 4: Add Types

```typescript
// nextjs-mcp-finance/src/lib/mcp/types.ts
export interface SentimentResult {
  symbol: string;
  timestamp: string;
  overall_sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  sentiment_score: number; // -100 to 100
  sources: SentimentSource[];
  ai_analysis?: SentimentAIAnalysis;
}

export interface SentimentSource {
  source: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence: number;
  sample_headlines?: string[];
}

export interface SentimentAIAnalysis extends AIAnalysis {
  narrative_summary: string;
  sentiment_drivers: string[];
  contrarian_view: string;
}
```

#### Step 5: Add API Route

```typescript
// nextjs-mcp-finance/src/app/api/mcp/sentiment/route.ts
import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp";
import { ensureUserInitialized } from "@/lib/auth/user-init";

export async function POST(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();
    const { symbol, sources, use_ai } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    const mcp = getMCPClient();
    const result = await mcp.sentimentAnalysis(symbol, sources, use_ai);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /mcp/sentiment] Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

#### Step 6: Add UI Page

```typescript
// nextjs-mcp-finance/src/app/(dashboard)/sentiment/page.tsx
'use client';

import { useState } from 'react';
import { useMCPQuery } from '@/hooks/useMCPQuery';
import { SentimentResult } from '@/lib/mcp/types';

export default function SentimentPage() {
  const [symbol, setSymbol] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);

  const { data, loading, error } = useMCPQuery<SentimentResult>({
    endpoint: '/api/mcp/sentiment',
    params: { symbol, use_ai: aiEnabled },
    enabled: !!symbol,
  });

  return (
    <div>
      <input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      {data && <SentimentDisplay data={data} />}
    </div>
  );
}
```

#### Step 7: Add Navigation

```typescript
// nextjs-mcp-finance/src/components/dashboard/Sidebar.tsx
const navItems = [
  // ... existing items
  { name: "Sentiment", href: "/sentiment", icon: MessageCircleIcon },
];
```

---

## Adding New Data to Frontend

### Quick Reference: Where to Make Changes

| What You Want                       | Files to Change                 |
| ----------------------------------- | ------------------------------- |
| New field in existing tool response | `types.ts` → Component          |
| New parameter for existing tool     | `client.ts` → Route → Component |
| New AI analysis field               | `types.ts` → `AIInsightsPanel`  |
| New MCP tool                        | All files (see above)           |
| New UI for existing data            | Component only                  |
| New tier restriction                | `tiers.ts` → Route              |

### Data Pipeline Checklist

When adding new data from MCP to frontend:

- [ ] Python server returns the data
- [ ] TypeScript types updated in `types.ts`
- [ ] MCP client method updated (if new param)
- [ ] API route passes data through
- [ ] Component receives and displays data
- [ ] Loading state handles new data shape
- [ ] Error state handles failures
- [ ] Tier restrictions applied (if needed)

---

## Tier-Based Access Control

### Tier Configuration

```typescript
// nextjs-mcp-finance/src/lib/auth/tiers.ts
export const TIER_LIMITS = {
  free: {
    analyze_security: { daily: 5, ai: false },
    compare_securities: { maxSymbols: 2, ai: false },
    screen_securities: { criteria: "basic", ai: false },
    get_trade_plan: { timeframes: ["swing"], ai: false },
    scan_trades: { daily: 1, maxResults: 5, ai: false },
    portfolio_risk: false, // Not available
    morning_brief: { basic: true, ai: false },
    analyze_fibonacci: { levels: 3, ai: false },
    options_risk_analysis: false, // Not available
  },
  pro: {
    analyze_security: { daily: 50, ai: true },
    compare_securities: { maxSymbols: 5, ai: true },
    screen_securities: { criteria: "advanced", ai: true },
    get_trade_plan: { timeframes: ["swing", "day"], ai: true },
    scan_trades: { daily: 10, maxResults: 25, ai: true },
    portfolio_risk: { basic: true, ai: false },
    morning_brief: { full: true, ai: true },
    analyze_fibonacci: { levels: 15, ai: true },
    options_risk_analysis: { basic: true, ai: false },
  },
  max: {
    analyze_security: { daily: Infinity, ai: true },
    compare_securities: { maxSymbols: 10, ai: true },
    screen_securities: { criteria: "all", ai: true },
    get_trade_plan: { timeframes: ["swing", "day", "scalp"], ai: true },
    scan_trades: { daily: Infinity, maxResults: 50, ai: true },
    portfolio_risk: { full: true, ai: true },
    morning_brief: { full: true, ai: true },
    analyze_fibonacci: { levels: Infinity, ai: true },
    options_risk_analysis: { full: true, ai: true },
  },
};
```

### Applying Tier Restrictions

#### In API Routes

```typescript
// Check feature availability
if (TIER_LIMITS[tier].tool_name === false) {
  return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
}

// Check AI availability
const canUseAi = TIER_LIMITS[tier].tool_name.ai;
const useAi = body.use_ai && canUseAi;

// Filter results
const filtered = result.items.slice(0, TIER_LIMITS[tier].tool_name.maxResults);
```

#### In Components

```typescript
<TierGate feature="options_risk_analysis" requiredTier="pro">
  <OptionsAnalysis />
</TierGate>

<TierGate feature="ai-analysis" requiredTier="pro">
  <AIToggle enabled={aiEnabled} onChange={setAiEnabled} />
</TierGate>
```

---

## Troubleshooting

### Common Issues

#### 1. MCP Server Not Responding

```
Error: MCP API error (503): /api/analyze - Connection refused
```

**Solution**: Check MCP server is running

```bash
# Check if server is running
curl http://localhost:8000/health

# Start server
cd mcp-finance1
mamba activate fin-ai1
uvicorn src.technical_analysis_mcp.server:app --host 0.0.0.0 --port 8000
```

#### 2. AI Analysis Returns Empty

```
{ "ai_analysis": null }
```

**Solution**: Check Gemini API key

```bash
# Verify key is set
echo $GEMINI_API_KEY

# Set if missing
export GEMINI_API_KEY='your-key-here'
```

#### 3. Type Errors After Update

```
Type 'AnalysisResult' is missing property 'newField'
```

**Solution**: Update all type definitions

1. Update `types.ts`
2. Rebuild: `npm run build`
3. Restart dev server

#### 4. Tier Restrictions Not Working

**Solution**: Check tier sync

```typescript
// Debug in component
const { tier } = useTier();
console.log("Current tier:", tier);

// Debug in API route
console.log("User tier:", tier, "Limit:", TIER_LIMITS[tier]);
```

### Debug Mode

Enable debug logging:

```typescript
// In MCP client
private async handleResponse<T>(response: Response, endpoint: string): Promise<T> {
  console.log(`[MCP] ${endpoint} - Status: ${response.status}`);
  // ...
}
```

---

## Summary

### Key Integration Points

1. **MCP Client** (`src/lib/mcp/client.ts`) - Central interface to Python server
2. **Types** (`src/lib/mcp/types.ts`) - TypeScript definitions for all data
3. **API Routes** (`src/app/api/mcp/`) - Authentication, usage, tier filtering
4. **Hooks** (`src/hooks/`) - Reusable data fetching logic
5. **Components** (`src/components/mcp/`) - Shared UI components

### Update Workflow

1. Update Python server with new data/endpoint
2. Update TypeScript types
3. Update MCP client method (if needed)
4. Update API route (if needed)
5. Update UI component to display new data
6. Test all tiers

### Best Practices

- Always use `useMCPQuery` hook for data fetching
- Always use shared MCP components for loading/error/empty states
- Always check tier restrictions before calling MCP
- Always include `use_ai` parameter for AI-enabled tools
- Always handle the case where AI analysis is null

---

**Document Version**: 1.0
**Last Updated**: February 2, 2026
**Related**: [MCP AI Implementation Summary](mcp-ai-implementation-summary.md) | [Refactor Plan](mcp-ui-refactor-plan.md)
