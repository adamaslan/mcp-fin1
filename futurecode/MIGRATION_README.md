# Futurecode - Non-MCP Features Archive

This directory contains frontend code that is **not directly related to the 9 MCP tools** and has been moved out of the active codebase to simplify the build and focus on core MCP functionality.

## Migration Date
**2026-02-05**

## Reason for Migration
To resolve Vercel build issues and streamline the frontend by focusing exclusively on the 9 MCP tool integrations:

1. **analyze_security** - Single security analysis with 150+ technical signals
2. **compare_securities** - Compare multiple stocks/ETFs
3. **screen_securities** - Screen universe against technical criteria
4. **get_trade_plan** - Risk-qualified trade plans with stop/target levels
5. **scan_trades** - Scan universe for qualified trade setups
6. **portfolio_risk** - Assess aggregate risk across positions
7. **morning_brief** - Generate daily market briefing
8. **analyze_fibonacci** - Comprehensive Fibonacci analysis
9. **options_risk_analysis** - Options chain risk analysis

---

## What Was Moved

### Pages (5 total)

| Original Location | New Location | Description |
|-------------------|--------------|-------------|
| `src/app/(dashboard)/learn/indicators/page.tsx` | `futurecode/pages/learn/indicators/page.tsx` | Educational content about technical indicators |
| `src/app/(dashboard)/learn/signals/page.tsx` | `futurecode/pages/learn/signals/page.tsx` | Educational content about trading signals |
| `src/app/(dashboard)/calendar/page.tsx` | `futurecode/pages/calendar/page.tsx` | Economic and earnings calendar page |
| `src/app/(dashboard)/news/page.tsx` | `futurecode/pages/news/page.tsx` | Market news feed page |
| `src/app/(dashboard)/journal/page.tsx` | `futurecode/pages/journal/page.tsx` | Trade journal with local state |

### Components (3 total)

| Original Location | New Location | Description |
|-------------------|--------------|-------------|
| `src/components/calendar/EconomicCalendar.tsx` | `futurecode/components/calendar/EconomicCalendar.tsx` | Economic events calendar component |
| `src/components/calendar/EarningsCalendar.tsx` | `futurecode/components/calendar/EarningsCalendar.tsx` | Earnings reports calendar component |
| `src/components/news/NewsFeed.tsx` | `futurecode/components/news/NewsFeed.tsx` | News feed aggregation component |

### Navigation Updates

The following navigation items were **removed from `src/components/dashboard/Sidebar.tsx`**:

- `/dashboard/journal` - Trade Journal
- `/dashboard/calendar` - Calendar
- `/dashboard/news` - News
- `/dashboard/learn` - Learn (indicators/signals education)

---

## Why These Features Were Moved

### 1. Learn Pages (indicators, signals)
- **Hardcoded educational data** - not connected to MCP
- Static content that doesn't require real-time analysis
- Can be re-added as documentation or help pages later

### 2. Calendar Page
- **Requires external data source** (TradingEconomics, Forex Factory, etc.)
- Components use empty arrays (no mock data per project guidelines)
- Would need API integration for real economic/earnings data

### 3. News Page
- **Requires external news API** (Alpha Vantage, Benzinga, etc.)
- Component uses empty arrays (no mock data)
- Would need API integration for real market news

### 4. Journal Page
- **Local state only** - trades not persisted to database
- Not connected to any MCP tool
- Would need database schema and API routes to be production-ready

---

## How to Restore These Features

### Quick Restore (for development/testing)

1. Copy page files back to their original locations:
   ```bash
   cp futurecode/pages/learn/indicators/page.tsx src/app/(dashboard)/learn/indicators/
   cp futurecode/pages/learn/signals/page.tsx src/app/(dashboard)/learn/signals/
   cp futurecode/pages/calendar/page.tsx src/app/(dashboard)/calendar/
   cp futurecode/pages/news/page.tsx src/app/(dashboard)/news/
   cp futurecode/pages/journal/page.tsx src/app/(dashboard)/journal/
   ```

2. Copy components back:
   ```bash
   mkdir -p src/components/calendar src/components/news
   cp futurecode/components/calendar/*.tsx src/components/calendar/
   cp futurecode/components/news/*.tsx src/components/news/
   ```

3. Re-add navigation items to `src/components/dashboard/Sidebar.tsx`

### Production-Ready Restore

Before restoring for production, each feature needs:

| Feature | Requirements |
|---------|--------------|
| **Learn** | No changes needed - static content |
| **Calendar** | External API integration (TradingEconomics, Finnhub, or similar) |
| **News** | External API integration (Benzinga, Alpha Vantage News, or similar) |
| **Journal** | Database schema, API routes, user authentication integration |

---

## Directory Structure

```
futurecode/
├── MIGRATION_README.md          # This file
├── pages/
│   ├── learn/
│   │   ├── indicators/
│   │   │   └── page.tsx         # Technical indicators education
│   │   └── signals/
│   │       └── page.tsx         # Trading signals education
│   ├── calendar/
│   │   └── page.tsx             # Economic/earnings calendar
│   ├── news/
│   │   └── page.tsx             # Market news feed
│   └── journal/
│       └── page.tsx             # Trade journal
└── components/
    ├── calendar/
    │   ├── EconomicCalendar.tsx # Economic events display
    │   └── EarningsCalendar.tsx # Earnings reports display
    └── news/
        └── NewsFeed.tsx         # News article feed
```

---

## Dependencies

These components have the following dependencies that remain in the codebase:

- `@/components/ui/*` - Radix UI components (Card, Badge, Button, Input)
- `@/components/analysis/SectorRotation` - Used by News page (still in codebase)
- `lucide-react` - Icons

---

## Notes

- All components follow the project's **NO MOCK DATA** rule
- Calendar and News components use empty arrays and show empty states
- Journal uses local React state (not persisted)
- These features are **optional enhancements** and not required for core MCP functionality

---

## Future Considerations

When re-implementing these features:

1. **Calendar**: Consider using free-tier APIs like Finnhub or Alpha Vantage for earnings data
2. **News**: Implement news sentiment analysis using the MCP analyze_security tool's AI capabilities
3. **Journal**: Integrate with portfolio_risk MCP tool to track positions automatically
4. **Learn**: Could be converted to markdown files and rendered with MDX for easier maintenance
