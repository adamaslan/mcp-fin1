# Mock Data Removal & API Integration Guide

## Overview

All hardcoded mock data has been removed from the UI components to comply with the critical "NO MOCK DATA - EVER" rule for financial applications. This document outlines what was removed and how to integrate real data from APIs.

**Why?** Mock financial data is dangerous - it can lead to incorrect trading decisions and gives false confidence in untested code.

---

## 1. Landing Page Components

### FibonacciPreview.tsx

**Location:** `src/components/landing/FibonacciPreview.tsx`

**Removed:**

- `DEMO_LEVELS` - 5 Fibonacci retracement levels with placeholder prices
- `DEMO_SIGNALS` - 5 Fibonacci trading signals
- `DEMO_CLUSTERS` - 2 confluence zones with price zones

**Current State:** Uses UI placeholders `[Price Data]` and `[Price Zone]` to show component structure

**Integration Steps:**

```typescript
// 1. Add prop to component
interface FibonacciPreviewProps {
  symbol?: string;
  isLive?: boolean; // For landing page vs. authenticated views
}

// 2. Fetch from MCP server when authenticated
async function fetchFibonacciLevels(symbol: string) {
  const response = await fetch(`/api/mcp/fibonacci/levels?symbol=${symbol}`);
  const data = await response.json();
  return data;
}

// 3. Update component to use real data
export function FibonacciPreview({
  symbol = "SPY",
  isLive = false,
}: FibonacciPreviewProps) {
  if (isLive && symbol) {
    const levels = await fetchFibonacciLevels(symbol);
    // Render with real levels and prices
  }
  // Otherwise show placeholder structure for landing page
}
```

**API Endpoint to Implement:**

- `GET /api/mcp/fibonacci/levels?symbol={SYMBOL}`
- Returns: `{ levels: FibonacciLevel[], signals: Signal[], clusters: Cluster[] }`

---

### ScannerPreview.tsx

**Location:** `src/components/landing/ScannerPreview.tsx`

**Removed:**

- `DEFAULT_TRADES` - 3 sample trades with hardcoded NVDA, MSFT, GOOGL prices
  - NVDA: Entry 142.3, Stop 135.5, Target 152.8
  - MSFT: Entry 438.2, Stop 428.4, Target 455.8
  - GOOGL: Entry 188.5, Stop 180.1, Target 201.3

**Current State:** Shows `[Entry]`, `[Stop]`, `[Target]` placeholders

**Integration Steps:**

```typescript
// 1. Fetch live scan results
async function fetchScanResults(universe: string = "SP500") {
  const response = await fetch(`/api/mcp/scanner/results?universe=${universe}`);
  return response.json();
}

// 2. Component receives live trades prop
interface ScannerPreviewProps {
  trades?: Trade[] | null;
}

// 3. Display real trades or empty state
export function ScannerPreview({ trades }: ScannerPreviewProps) {
  const displayTrades = trades && trades.length > 0 ? trades : null;

  if (!displayTrades) {
    return <div>Connect to MCP server to see live scan results</div>;
  }
  // Render with real trade data
}
```

**API Endpoint to Implement:**

- `GET /api/mcp/scanner/results?universe=SP500&limit=5`
- Returns: `{ trades: Trade[] }`

---

### LiveMarketPulse.tsx

**Location:** `src/components/landing/LiveMarketPulse.tsx`

**Removed:**

- `DEFAULT_DATA` - Fallback market data with hardcoded values:
  - futuresES: 0.45%
  - futuresNQ: 0.62%
  - vix: 14.2

**Current State:** Shows `[Data]` placeholders when no real data available

**Integration Steps:**

```typescript
// 1. Fetch market data from external API
async function fetchMarketData() {
  // Could use:
  // - Alpha Vantage (free tier)
  // - Finnhub
  // - Yahoo Finance API
  // - Custom MCP server endpoint

  const response = await fetch('/api/market/pulse');
  return response.json();
}

// 2. Component requires real data
interface MarketData {
  futuresES: number;
  futuresNQ: number;
  vix: number;
}

// 3. Only display if data is available
export function LiveMarketPulse({ data }: { data?: MarketData | null }) {
  if (!data) {
    return <NoDataPlaceholder />;
  }
  // Render with real data
}
```

**API Endpoint to Implement:**

- `GET /api/market/pulse`
- Returns: `{ futuresES: number, futuresNQ: number, vix: number }`
- Source: Alpha Vantage, Finnhub, or MCP server

---

### SampleTradePlan.tsx

**Location:** `src/components/landing/SampleTradePlan.tsx`

**Removed:**

- Default signal counts (75 bullish, 15 bearish, 10 neutral)
- Default symbol "SPY"
- Default top signal "Moving Average Crossover"

**Current State:** Shows `[Symbol]` and `[Signal]` when no data provided

**Integration Steps:**

```typescript
// 1. Add symbol parameter
interface SampleTradePlanProps {
  symbol?: string;
  data?: AnalysisData | null;
}

// 2. Fetch analysis when symbol provided
async function fetchSymbolAnalysis(symbol: string) {
  const response = await fetch(`/api/analysis/trade-plan?symbol=${symbol}`);
  return response.json();
}

// 3. Display only when real data available
export function SampleTradePlan({ symbol, data }: SampleTradePlanProps) {
  if (!data) {
    return <LoadingOrEmptyState />;
  }
  // Render with real analysis
}
```

**API Endpoint to Implement:**

- `GET /api/analysis/trade-plan?symbol={SYMBOL}`
- Returns: `{ symbol: string, signals: Signal[], summary: { bullish, bearish, neutral } }`

---

## 2. Analysis Components

### MultiTimeframe.tsx

**Location:** `src/components/analysis/MultiTimeframe.tsx`

**Removed:**

- `MOCK_ANALYSIS` - 3 timeframes with hardcoded levels:
  - Daily: support 178.5, resistance 192.3
  - Weekly: support 165.0, resistance 200.0
  - Monthly: support 140.0, resistance 210.0

**Current State:** Empty array, shows no data state

**Integration Steps:**

```typescript
// 1. Fetch from MCP fibonacci server
async function fetchMultiTimeframeAnalysis(symbol: string) {
  const response = await fetch(`/api/mcp/analysis/multi-timeframe?symbol=${symbol}`);
  const data = await response.json();
  return data; // { daily: Analysis, weekly: Analysis, monthly: Analysis }
}

// 2. Component requires symbol and real data
interface MultiTimeframeProps {
  symbol: string;
  data?: TimeframeAnalysis[];
}

// 3. Server-side data fetching
export async function MultiTimeframe({ symbol, data }: MultiTimeframeProps) {
  if (!data) {
    const fetchedData = await fetchMultiTimeframeAnalysis(symbol);
    return <MultiTimeframeDisplay data={fetchedData} />;
  }
}
```

**API Endpoint to Implement:**

- `GET /api/mcp/analysis/multi-timeframe?symbol={SYMBOL}`
- Returns: `{ daily: TimeframeAnalysis, weekly: TimeframeAnalysis, monthly: TimeframeAnalysis }`
- Source: MCP Fibonacci server with real price data

---

### SectorRotation.tsx

**Location:** `src/components/analysis/SectorRotation.tsx`

**Removed:**

- `SECTOR_DATA` - 11 sectors with hardcoded performance percentages:
  - Technology: 1.24% (1D), 3.45% (1W), 5.67% (1M), 12.34% (3M)
  - Healthcare: 0.56%, 1.23%, 2.45%, 4.56%
  - Energy: -1.45%, -2.34%, -4.56%, -8.9%
  - [8 more sectors with fake data]

**Current State:** Empty array, shows no data state

**Integration Steps:**

```typescript
// 1. Fetch sector performance data
async function fetchSectorRotation() {
  // Could use:
  // - Finnhub
  // - Alpha Vantage
  // - Custom MCP server

  const response = await fetch('/api/market/sector-rotation');
  return response.json();
}

// 2. Update component
interface SectorRotationProps {
  data?: SectorData[];
}

export async function SectorRotation({ data }: SectorRotationProps) {
  if (!data) {
    const sectorData = await fetchSectorRotation();
    return <SectorRotationDisplay sectors={sectorData} />;
  }
}
```

**API Endpoint to Implement:**

- `GET /api/market/sector-rotation`
- Returns: `{ sectors: SectorData[] }` where each sector has:
  - `name: string`
  - `performance1D: number` (%)
  - `performance1W: number` (%)
  - `performance1M: number` (%)
  - `performance3M: number` (%)
  - `trend: "bullish" | "bearish" | "neutral"`
  - `flowDirection: "inflow" | "outflow" | "neutral"`
- Source: Finnhub or MCP market data server

---

### FundamentalData.tsx

**Location:** `src/components/analysis/FundamentalData.tsx`

**Removed:**

- `MOCK_FUNDAMENTALS` - Comprehensive financial metrics:
  - marketCap: "$3.45T"
  - peRatio: 32.5, forwardPE: 28.4
  - eps: 6.42, epsGrowth: 12.3%
  - revenue: "$394.3B", revenueGrowth: 8.2%
  - roe: 147.3%, debtToEquity: 1.87
  - [More metrics...]
- Hardcoded `currentPrice: 185.42`

**Current State:** Requires both `data` and `currentPrice` props

**Integration Steps:**

```typescript
// 1. Fetch fundamental data from financial API
async function fetchFundamentals(symbol: string) {
  // Could use:
  // - Finnhub (free tier)
  // - Alpha Vantage
  // - Financial Modeling Prep
  // - IEX Cloud

  const response = await fetch(`/api/market/fundamentals?symbol=${symbol}`);
  return response.json();
}

// 2. Fetch current price
async function fetchCurrentPrice(symbol: string) {
  const response = await fetch(`/api/market/price?symbol=${symbol}`);
  return response.json(); // { price: number, timestamp: string }
}

// 3. Compose component with real data
export async function FundamentalAnalysis({ symbol }: { symbol: string }) {
  const [fundamentals, priceData] = await Promise.all([
    fetchFundamentals(symbol),
    fetchCurrentPrice(symbol),
  ]);

  return (
    <FundamentalData
      symbol={symbol}
      data={fundamentals}
      currentPrice={priceData.price}
    />
  );
}
```

**API Endpoints to Implement:**

- `GET /api/market/fundamentals?symbol={SYMBOL}`
  - Returns: `FundamentalMetrics` object
  - Source: Finnhub, Financial Modeling Prep, or IEX Cloud

- `GET /api/market/price?symbol={SYMBOL}`
  - Returns: `{ price: number, timestamp: string, change: number, changePercent: number }`
  - Source: Real-time market data API

---

## 3. Calendar Components

### EconomicCalendar.tsx

**Location:** `src/components/calendar/EconomicCalendar.tsx`

**Removed:**

- `MOCK_EVENTS` - 8 hardcoded economic events:
  - CPI (YoY): previous 3.2%, forecast 3.1%
  - Consumer Sentiment: previous 69.7, forecast 70.0
  - Initial Jobless Claims: previous 218K, forecast 215K
  - Retail Sales, Building Permits, Industrial Production, Existing Home Sales
  - [All with fake data]

**Current State:** Empty array, shows no data state

**Integration Steps:**

```typescript
// 1. Fetch from economic calendar API
async function fetchEconomicCalendar() {
  // Could use:
  // - Finnhub (requires API key)
  // - TradingEconomics (free calendar)
  // - Forex Factory (scraping)
  // - FRED API (US economic data)

  const response = await fetch('/api/calendar/economic-events');
  return response.json();
}

// 2. Component with real data
export async function EconomicCalendar() {
  const events = await fetchEconomicCalendar();

  if (!events || events.length === 0) {
    return <NoEventsMessage />;
  }

  return <EconomicCalendarDisplay events={events} />;
}
```

**API Endpoint to Implement:**

- `GET /api/calendar/economic-events`
- Returns: `{ events: EconomicEvent[] }` where each event has:
  - `date: string` (ISO format)
  - `time: string` (HH:MM format)
  - `event: string` (e.g., "CPI (YoY)")
  - `country: string` (e.g., "US")
  - `impact: "high" | "medium" | "low"`
  - `previous?: string` (previous value)
  - `forecast?: string` (forecasted value)
  - `actual?: string` (actual released value)
- Source: Finnhub, TradingEconomics, or FRED API

---

### EarningsCalendar.tsx

**Location:** `src/components/calendar/EarningsCalendar.tsx`

**Removed:**

- `MOCK_EARNINGS` - 7 fake earnings records:
  - AAPL: EPS $2.10, Revenue $118.2B
  - MSFT: EPS $2.78, Revenue $61.1B
  - TSLA: EPS $0.73, Revenue $25.6B
  - META, GOOGL, AMZN, NVDA [all with fake earnings data]

**Current State:** Empty array, shows no data state

**Integration Steps:**

```typescript
// 1. Fetch earnings calendar
async function fetchEarningsCalendar(days: number = 14) {
  // Could use:
  // - Finnhub earnings calendar
  // - Marketstack
  // - Seeking Alpha (scraping)
  // - Company investor relations APIs

  const response = await fetch(`/api/calendar/earnings?days=${days}`);
  return response.json();
}

// 2. Component with filtering and real data
interface EarningsCalendarProps {
  days?: number;
  symbols?: string[];
}

export async function EarningsCalendar({ days = 14, symbols }: EarningsCalendarProps) {
  const earnings = await fetchEarningsCalendar(days);

  let filtered = earnings;
  if (symbols) {
    filtered = earnings.filter((e: EarningsEvent) => symbols.includes(e.symbol));
  }

  return <EarningsCalendarDisplay events={filtered} />;
}
```

**API Endpoint to Implement:**

- `GET /api/calendar/earnings?days={DAYS}&symbols={SYMBOL1,SYMBOL2}`
- Returns: `{ events: EarningsEvent[] }` where each event has:
  - `symbol: string` (e.g., "AAPL")
  - `company: string` (e.g., "Apple Inc.")
  - `date: string` (ISO format)
  - `time: "BMO" | "AMC" | "TBD"` (Before/After Market Close)
  - `epsEstimate?: string` (e.g., "$2.10")
  - `epsPrior?: string`
  - `revenueEstimate?: string` (e.g., "$118.2B")
  - `revenuePrior?: string`
- Source: Finnhub, Marketstack, or TradingView

---

## 4. News Components

### NewsFeed.tsx

**Location:** `src/components/news/NewsFeed.tsx`

**Removed:**

- `MOCK_NEWS` - 6 fabricated news articles:
  - "Apple Reports Record Q4 Revenue Driven by iPhone 16 Sales"
  - "Fed Officials Signal Patience on Rate Cuts Amid Inflation Concerns"
  - "NVIDIA Unveils Next-Gen AI Chips at CES 2026"
  - "Tesla Deliveries Miss Estimates as Competition Intensifies"
  - "Microsoft Cloud Revenue Beats Estimates on AI Demand"
  - "Oil Prices Stabilize as OPEC+ Maintains Production Cuts"

**Current State:** Empty array, shows no data state

**Integration Steps:**

```typescript
// 1. Fetch financial news
async function fetchFinancialNews(filters?: {
  symbols?: string[];
  sentiment?: "bullish" | "bearish" | "neutral";
  limit?: number;
}) {
  // Could use:
  // - Finnhub news API
  // - Alpha Vantage news
  // - NewsAPI.org (finance section)
  // - CNBC/Reuters/Bloomberg feeds

  const params = new URLSearchParams();
  if (filters?.symbols) params.append('symbols', filters.symbols.join(','));
  if (filters?.sentiment) params.append('sentiment', filters.sentiment);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await fetch(`/api/news?${params.toString()}`);
  return response.json();
}

// 2. Component with real news
interface NewsFeedProps {
  symbols?: string[];
  sentiment?: "bullish" | "bearish" | "neutral";
}

export async function NewsFeed({ symbols, sentiment }: NewsFeedProps) {
  const news = await fetchFinancialNews({ symbols, sentiment, limit: 10 });

  if (!news || news.length === 0) {
    return <NoNewsMessage />;
  }

  return <NewsFeedDisplay articles={news} />;
}
```

**API Endpoint to Implement:**

- `GET /api/news?symbols={AAPL,MSFT}&sentiment=bullish&limit=10`
- Returns: `{ articles: NewsItem[] }` where each article has:
  - `id: string` (unique identifier)
  - `title: string`
  - `summary: string`
  - `source: string` (e.g., "Reuters")
  - `url: string` (link to full article)
  - `publishedAt: string` (ISO timestamp)
  - `symbols: string[]` (related stock symbols)
  - `sentiment?: "bullish" | "bearish" | "neutral"`
  - `imageUrl?: string`
- Source: Finnhub, Alpha Vantage, NewsAPI, or CNBC/Reuters feeds

---

## 5. Portfolio Components

### CorrelationMatrix.tsx

**Location:** `src/components/portfolio/CorrelationMatrix.tsx`

**Removed:**

- `MOCK_CORRELATION` - 6x6 correlation matrix with fake coefficients:
  - AAPL-MSFT: 0.85
  - MSFT-GOOGL: 0.82
  - TSLA-others: 0.38-0.48 (low correlation)
  - [Complete matrix with synthetic data]

**Current State:** Empty matrix, shows no data state

**Integration Steps:**

```typescript
// 1. Calculate correlations from price history
async function calculateCorrelationMatrix(symbols: string[], period: number = 252) {
  // Fetch price history for all symbols
  const priceData = await Promise.all(
    symbols.map(symbol => fetchPriceHistory(symbol, period))
  );

  // Calculate correlation coefficients
  const correlations = calculateCorrelations(priceData);

  return { symbols, matrix: correlations };
}

// 2. Fetch with portfolio holdings
async function fetchPortfolioCorrelations(userId: string) {
  const portfolio = await fetchUserPortfolio(userId);
  const symbols = portfolio.holdings.map(h => h.symbol);

  return calculateCorrelationMatrix(symbols);
}

// 3. Component receives real correlation data
interface CorrelationMatrixProps {
  data?: CorrelationData;
}

export async function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  if (!data || data.symbols.length === 0) {
    return <NoDataMessage />;
  }

  return <CorrelationMatrixDisplay data={data} />;
}
```

**API Endpoints to Implement:**

- `GET /api/portfolio/{userId}/correlation-matrix`
  - Returns: `{ symbols: string[], matrix: number[][] }`
  - Calculates from user's portfolio holdings

- `GET /api/market/correlation?symbols={AAPL,MSFT,GOOGL}&period=252`
  - Returns: `{ symbols: string[], matrix: number[][] }`
  - Source: Historical price data API

---

### DividendTracker.tsx

**Location:** `src/components/portfolio/DividendTracker.tsx`

**Removed:**

- `MOCK_DIVIDENDS` - 5 dividend records with dollar amounts:
  - AAPL: $0.24/share, 100 shares = $24 payout
  - MSFT: $0.75/share
  - JNJ: $1.24/share
  - O (Realty Income): $0.256/share (monthly)
  - KO (Coca-Cola): $0.485/share
- `MOCK_SUMMARY` - Annual/YTD totals:
  - Annual: $1,847.20
  - YTD: $156.80
  - Next month: $118.90
  - Avg yield: 2.34%

**Current State:** Empty arrays, shows no data state

**Integration Steps:**

```typescript
// 1. Fetch dividend data for holdings
async function fetchDividendHistory(userId: string) {
  // Get user portfolio
  const portfolio = await fetchUserPortfolio(userId);

  // Fetch dividend records from dividend API
  const dividends = await Promise.all(
    portfolio.holdings.map(holding =>
      fetchDividendsBySymbol(holding.symbol, holding.shares)
    )
  );

  return dividends.flat();
}

// 2. Calculate summary metrics
function calculateDividendSummary(dividends: DividendRecord[]): DividendSummary {
  const now = new Date();
  const currentYear = now.getFullYear();

  const yearlyDivs = dividends.filter(d => new Date(d.payDate).getFullYear() === currentYear);
  const ytdDivs = dividends.filter(d => new Date(d.payDate) <= now);
  const nextMonth = dividends.filter(d => {
    const payDate = new Date(d.payDate);
    return payDate > now && payDate < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  });

  return {
    totalAnnual: yearlyDivs.reduce((sum, d) => sum + d.totalPayout, 0),
    totalYTD: ytdDivs.reduce((sum, d) => sum + d.totalPayout, 0),
    nextMonthProjected: nextMonth.reduce((sum, d) => sum + d.totalPayout, 0),
    avgYield: calculateAverageYield(dividends),
  };
}

// 3. Component with real dividend data
interface DividendTrackerProps {
  userId: string;
}

export async function DividendTracker({ userId }: DividendTrackerProps) {
  const dividends = await fetchDividendHistory(userId);
  const summary = calculateDividendSummary(dividends);

  return <DividendTrackerDisplay dividends={dividends} summary={summary} />;
}
```

**API Endpoints to Implement:**

- `GET /api/portfolio/{userId}/dividends`
  - Returns: `{ records: DividendRecord[], summary: DividendSummary }`

- `GET /api/market/dividends/{symbol}?shares={COUNT}`
  - Returns: `{ symbol: string, dividends: DividendRecord[] }`
  - Source: Yahoo Finance, Dividend.com, or Finnhub

---

## 6. Alert Components

### PriceTargetAlerts.tsx

**Location:** `src/components/alerts/PriceTargetAlerts.tsx`

**Removed:**

- `MOCK_ALERTS` - 3 hardcoded price alerts:
  - AAPL: $200 target, current $185.42
  - NVDA: $800 target, current $875.32
  - TSLA: $250 target, current $242.18
- Random price generation: `100 + Math.random() * 100`

**Current State:** Prevents alert creation without real price data, logs warning

**Integration Steps:**

```typescript
// 1. Create alert with real current price
async function createPriceAlert(symbol: string, targetPrice: number, direction: "above" | "below") {
  // CRITICAL: Always fetch real current price from API
  const currentPrice = await fetchCurrentPrice(symbol);

  // Validate input
  if (!currentPrice) {
    throw new Error(`Unable to fetch current price for ${symbol}`);
  }

  // Create alert in database
  const alert = await fetch('/api/alerts/price-targets', {
    method: 'POST',
    body: JSON.stringify({
      symbol,
      targetPrice,
      direction,
      currentPrice: currentPrice.price, // REAL price
      userId: getCurrentUserId(),
    }),
  });

  return alert.json();
}

// 2. Fetch user alerts from database
async function fetchUserAlerts(userId: string) {
  const response = await fetch(`/api/alerts/price-targets?userId=${userId}`);
  return response.json(); // { alerts: PriceAlert[] }
}

// 3. Component with real alert data
interface PriceTargetAlertsProps {
  userId: string;
}

export async function PriceTargetAlerts({ userId }: PriceTargetAlertsProps) {
  const alerts = await fetchUserAlerts(userId);

  return <PriceTargetAlertsDisplay alerts={alerts} onCreateAlert={createPriceAlert} />;
}
```

**API Endpoints to Implement:**

- `POST /api/alerts/price-targets`
  - Body: `{ symbol, targetPrice, direction, currentPrice, userId }`
  - Returns: `{ id, symbol, targetPrice, direction, currentPrice, enabled, createdAt }`

- `GET /api/alerts/price-targets?userId={USER_ID}`
  - Returns: `{ alerts: PriceAlert[] }`

- `PATCH /api/alerts/price-targets/{alertId}`
  - Body: `{ enabled: boolean }` or `{ targetPrice: number }`

- `DELETE /api/alerts/price-targets/{alertId}`

**Critical Implementation Rules:**

- ✅ Always fetch `currentPrice` from real API before creating alert
- ✅ Store alerts in database with real prices
- ❌ Never generate random/mock prices
- ❌ Never use client-side only alerts

---

### VolumeSpikeAlerts.tsx

**Location:** `src/components/alerts/VolumeSpikeAlerts.tsx`

**Removed:**

- `MOCK_ALERTS` - 3 hardcoded volume alerts:
  - AAPL: 2.0x multiplier, avgVolume 54.2M
  - NVDA: 1.5x multiplier, avgVolume 48.3M
  - TSLA: 3.0x multiplier, avgVolume 95.6M
- Random volume generation: `Math.random() * 100`

**Current State:** Prevents alert creation without real volume data, logs warning

**Integration Steps:**

```typescript
// 1. Fetch real average volume
async function fetchAverageVolume(symbol: string, period: number = 30) {
  const priceHistory = await fetchPriceHistory(symbol, period);
  const volumes = priceHistory.map(p => p.volume);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

  return avgVolume;
}

// 2. Create volume alert with real data
async function createVolumeAlert(symbol: string, multiplier: number) {
  // CRITICAL: Always fetch real average volume from API
  const avgVolume = await fetchAverageVolume(symbol);

  if (!avgVolume) {
    throw new Error(`Unable to fetch volume data for ${symbol}`);
  }

  const alert = await fetch('/api/alerts/volume-spikes', {
    method: 'POST',
    body: JSON.stringify({
      symbol,
      multiplier,
      avgVolume: formatVolume(avgVolume), // REAL average volume
      userId: getCurrentUserId(),
    }),
  });

  return alert.json();
}

// 3. Component with real alert data
interface VolumeSpikeAlertsProps {
  userId: string;
}

export async function VolumeSpikeAlerts({ userId }: VolumeSpikeAlertsProps) {
  const alerts = await fetchUserAlerts(userId);

  return <VolumeSpikeAlertsDisplay alerts={alerts} onCreateAlert={createVolumeAlert} />;
}
```

**API Endpoints to Implement:**

- `POST /api/alerts/volume-spikes`
  - Body: `{ symbol, multiplier, avgVolume, userId }`
  - Returns: `{ id, symbol, multiplier, avgVolume, enabled, createdAt }`

- `GET /api/alerts/volume-spikes?userId={USER_ID}`
  - Returns: `{ alerts: VolumeAlert[] }`

- `PATCH /api/alerts/volume-spikes/{alertId}`
- `DELETE /api/alerts/volume-spikes/{alertId}`

**Critical Implementation Rules:**

- ✅ Always fetch real `avgVolume` from price history API
- ✅ Store calculated averages in database
- ❌ Never generate random/mock volume data
- ❌ Never use estimates or guesses

---

### WebhookSettings.tsx

**Location:** `src/components/alerts/WebhookSettings.tsx`

**Removed:**

- `MOCK_WEBHOOKS` - 2 example webhook configurations:
  - Slack: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXX`
  - Discord: `https://discord.com/api/webhooks/0000000000/XXXXXXXXXXXX`

**Current State:** Empty array, shows no data state

**Integration Steps:**

```typescript
// 1. Fetch user webhooks from database
async function fetchUserWebhooks(userId: string) {
  const response = await fetch(`/api/webhooks?userId=${userId}`);
  return response.json(); // { webhooks: WebhookConfig[] }
}

// 2. Create new webhook
async function createWebhook(config: WebhookConfig) {
  const response = await fetch('/api/webhooks', {
    method: 'POST',
    body: JSON.stringify({
      ...config,
      userId: getCurrentUserId(),
      testPayload: true, // Test the webhook URL
    }),
  });

  if (!response.ok) {
    throw new Error('Invalid webhook URL');
  }

  return response.json();
}

// 3. Component with real webhook data
interface WebhookSettingsProps {
  userId: string;
}

export async function WebhookSettings({ userId }: WebhookSettingsProps) {
  const webhooks = await fetchUserWebhooks(userId);

  return <WebhookSettingsDisplay webhooks={webhooks} onCreateWebhook={createWebhook} />;
}
```

**API Endpoints to Implement:**

- `POST /api/webhooks`
  - Body: `{ name, type, url, events, userId }`
  - Tests URL validity before storing
  - Returns: `{ id, name, type, url, events, enabled, createdAt }`

- `GET /api/webhooks?userId={USER_ID}`
  - Returns: `{ webhooks: WebhookConfig[] }`

- `PATCH /api/webhooks/{webhookId}`
  - Body: `{ enabled: boolean }` or full config update

- `DELETE /api/webhooks/{webhookId}`

- `POST /api/webhooks/{webhookId}/test`
  - Sends test payload to validate webhook

---

## Quick Reference: API Integration Checklist

### Before Implementing Each Component:

- [ ] Identify the data source (MCP server, Finnhub, Alpha Vantage, etc.)
- [ ] Verify API authentication credentials are in `.env`
- [ ] Check API rate limits and add caching if needed
- [ ] Add error handling for API failures (don't fall back to mock data)
- [ ] Implement loading states while fetching
- [ ] Add data validation to ensure response format matches TypeScript interfaces
- [ ] Store real data in database where needed (alerts, watchlists)
- [ ] Test with multiple symbols to verify data accuracy
- [ ] Never display stale/cached data as current market data
- [ ] Add console warnings if real data unavailable instead of showing mocks

---

## Environment Setup

Add these to `.env.local`:

```bash
# Market Data APIs
FINNHUB_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
IEX_CLOUD_API_KEY=your_key_here

# MCP Server (if local)
MCP_SERVER_URL=http://localhost:5000

# Financial Data Sources
NEWS_API_KEY=your_key_here
FRED_API_KEY=your_key_here  # Federal Reserve Economic Data

# Cache settings
CACHE_TTL_SECONDS=300  # 5 minutes for price data
CACHE_TTL_FUNDAMENTAL=3600  # 1 hour for fundamentals
```

---

## Testing Without Real APIs

For development/testing, create a mock backend layer:

```typescript
// lib/api/client.ts
async function fetchData<T>(
  url: string,
  options?: { bypassMock?: boolean },
): Promise<T> {
  // In development, use mock data with clear warnings
  if (process.env.NODE_ENV === "development" && !options?.bypassMock) {
    console.warn(
      `⚠️  Using mock data for ${url}. Set NODE_ENV=production or bypassMock=true to use real APIs.`,
    );
    return getMockDataForUrl(url);
  }

  // Production: always use real APIs
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

---

## Summary Table

| Component         | Removed Data                | Items          | API to Implement                                |
| ----------------- | --------------------------- | -------------- | ----------------------------------------------- |
| FibonacciPreview  | Prices, signals, clusters   | 3 arrays       | `/api/mcp/fibonacci/levels`                     |
| ScannerPreview    | Trade entries/stops/targets | 3 trades       | `/api/mcp/scanner/results`                      |
| LiveMarketPulse   | Market data                 | 1 object       | `/api/market/pulse`                             |
| SampleTradePlan   | Signal counts               | 1 default      | `/api/analysis/trade-plan`                      |
| MultiTimeframe    | Support/resistance          | 3 timeframes   | `/api/mcp/analysis/multi-timeframe`             |
| SectorRotation    | Performance %s              | 11 sectors     | `/api/market/sector-rotation`                   |
| EconomicCalendar  | Economic events             | 8 events       | `/api/calendar/economic-events`                 |
| EarningsCalendar  | Earnings data               | 7 records      | `/api/calendar/earnings`                        |
| FundamentalData   | Metrics & price             | 1 full dataset | `/api/market/fundamentals`, `/api/market/price` |
| NewsFeed          | News articles               | 6 articles     | `/api/news`                                     |
| CorrelationMatrix | Correlation data            | 6x6 matrix     | `/api/market/correlation`                       |
| DividendTracker   | Dividend records            | 5 records      | `/api/portfolio/{userId}/dividends`             |
| PriceTargetAlerts | Mock prices                 | 3 alerts       | `/api/alerts/price-targets`                     |
| VolumeSpikeAlerts | Mock volumes                | 3 alerts       | `/api/alerts/volume-spikes`                     |
| WebhookSettings   | Webhook URLs                | 2 examples     | `/api/webhooks`                                 |

---

## Related Documentation

- [API Architecture Guide](./API_ARCHITECTURE.md)
- [MCP Server Integration](./MCP_SERVER.md)
- [Data Caching Strategy](./CACHING.md)
- [Error Handling](./ERROR_HANDLING.md)
- [Testing Real API Integration](./TESTING.md)
