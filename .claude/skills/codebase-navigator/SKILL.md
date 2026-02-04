---
name: codebase-navigator
description: Help navigate, understand, and explore the MCP Finance frontend and backend codebase structure, components, services, and architecture. Use when understanding project structure, finding files, learning how features work, or exploring the codebase organization.
allowed-tools: Read, Glob, Grep
---

# Codebase Navigator Skill

Comprehensive guide to understanding and navigating the MCP Finance application structure, including both frontend (Next.js) and backend (Python MCP) components.

## Project Structure Overview

```
nextjs-mcp-finance/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth-protected route group
│   │   ├── (public)/           # Public route group
│   │   ├── api/                # API routes (backend endpoints)
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   └── features/           # Feature-specific components
│   ├── lib/                    # Utilities and helpers
│   │   ├── db/                 # Database schema and client
│   │   ├── api/                # API client helpers
│   │   ├── mcp/                # MCP server integration
│   │   └── utils/              # Utility functions
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── __tests__/                  # Unit tests
├── e2e/                        # E2E tests
├── .claude/                    # Claude Code configuration
│   ├── CLAUDE.md               # Project guidelines
│   ├── rules/                  # Project-specific rules
│   └── skills/                 # Reusable skills
├── .env                        # Environment variables (DO NOT COMMIT)
├── .env.example                # Template for env vars
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
└── drizzle.config.ts           # Database migration config
```

## Frontend Architecture (Next.js)

### App Router Structure

The application uses Next.js 16 App Router with organized route groups:

#### Public Routes (`src/app/(public)/`)

- **`/`** - Landing/home page
- **`/sign-in`** - Clerk sign-in page
- **`/sign-up`** - Clerk sign-up page

#### Protected Routes (`src/app/(auth)/`)

These routes require authentication via Clerk:

- **`/dashboard`** - Main dashboard
- **`/portfolio`** - User portfolio view
- **`/stocks/[symbol]`** - Individual stock pages
- **`/transactions`** - Transaction history
- **`/settings`** - User settings

#### API Routes (`src/app/api/`)

RESTful API endpoints:

```
/api/health               # Health check
/api/stocks              # Stock operations
/api/stocks/[symbol]     # Stock details
/api/stocks/favorite     # Favorite management
/api/transactions        # Transaction operations
/api/webhooks/clerk      # Clerk webhook handler
/api/webhooks/stripe     # Stripe webhook handler
/api/mcp/[endpoint]      # MCP server proxy
```

### Component Organization

#### UI Components (`src/components/ui/`)

Reusable, unstyled components from Radix UI:

- `Button.tsx` - Button component
- `Card.tsx` - Card container
- `Dialog.tsx` - Modal dialog
- `Input.tsx` - Text input
- `Table.tsx` - Data table
- `Badge.tsx` - Status badge

**Usage Pattern:**

```typescript
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return <Button onClick={() => {}}>Click me</Button>;
}
```

#### Feature Components (`src/components/features/`)

Business logic components that use UI components:

- `StockChart.tsx` - Stock price chart
- `TransactionForm.tsx` - Form for creating transactions
- `PortfolioSummary.tsx` - Portfolio overview widget
- `StockSearch.tsx` - Stock search functionality

### Server Components vs Client Components

**Default: Server Components**

- Fetch data directly in components
- No client-side JavaScript overhead
- Access database and MCP server directly

```typescript
// Server Component (default)
import { getStocks } from '@/lib/api/stocks';

export default async function StocksPage() {
  const stocks = await getStocks();
  return (
    <div>
      {stocks.map(stock => (
        <StockCard key={stock.id} stock={stock} />
      ))}
    </div>
  );
}
```

**Client Components: When Needed**

- Interactive features (forms, buttons, state)
- Browser APIs (localStorage, window)
- Real-time updates (WebSocket)

```typescript
// Client Component (explicit)
'use client';

import { useState } from 'react';

export function CounterButton() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Data Fetching Patterns

#### Server Component Data Fetching

```typescript
// src/lib/api/stocks.ts
export async function getStocks() {
  const response = await fetch('http://localhost:8000/api/stocks', {
    headers: {
      'Authorization': `Bearer ${process.env.MCP_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stocks: ${response.statusText}`);
  }

  return response.json();
}

// In a Server Component
import { getStocks } from '@/lib/api/stocks';

export default async function Dashboard() {
  const stocks = await getStocks();
  return <StockList stocks={stocks} />;
}
```

#### Client-Side Data Fetching

Uses TanStack Query for caching and state management:

```typescript
// src/lib/api/hooks.ts
import { useQuery } from '@tanstack/react-query';

export function useStocks() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: async () => {
      const response = await fetch('/api/stocks');
      return response.json();
    },
  });
}

// In a Client Component
'use client';

import { useStocks } from '@/lib/api/hooks';

export function StockList() {
  const { data: stocks, isLoading, error } = useStocks();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {stocks.map(stock => (
        <li key={stock.symbol}>{stock.name}</li>
      ))}
    </ul>
  );
}
```

## Database Schema (Drizzle ORM)

Located in `src/lib/db/schema/`:

### Core Tables

#### Users Table

```typescript
users {
  id: text (primary key)
  email: varchar (unique)
  name: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Stocks Table

```typescript
stocks {
  id: text (primary key)
  symbol: varchar (unique)
  name: text
  currentPrice: decimal
  lastUpdated: timestamp
  createdAt: timestamp
}
```

#### UserStocks (Favorites/Holdings)

```typescript
userStocks {
  id: text (primary key)
  userId: text (FK → users.id)
  stockId: text (FK → stocks.id)
  quantity: integer
  createdAt: timestamp
}
```

#### Transactions Table

```typescript
transactions {
  id: text (primary key)
  userId: text (FK → users.id)
  symbol: varchar
  type: enum ('buy' | 'sell')
  quantity: integer
  price: decimal
  total: decimal
  createdAt: timestamp
}
```

## Backend Architecture (Python MCP)

The Python backend runs as an MCP (Model Context Protocol) server, providing:

- Real-time stock market data
- Technical analysis
- AI-powered trading recommendations

### MCP Server Location

```
../ (parent directory)
├── python_backend/           # Python MCP server
│   ├── src/
│   │   ├── mcp_server.py     # Main MCP server
│   │   ├── stock_service.py  # Stock data fetching
│   │   ├── analysis.py       # Technical analysis
│   │   └── models.py         # Data models
│   ├── requirements.txt
│   └── environment.yml
```

### Key Services

#### Stock Service

Fetches real-time market data:

```python
async def get_stock_data(symbol: str) -> StockData:
    # Returns current price, volume, market cap, etc.
    # Uses yfinance or real market data API
```

#### Analysis Service

Performs technical analysis:

```python
def calculate_indicators(stock_data) -> Indicators:
    # RSI, MACD, Moving Averages
    # Trend analysis
```

#### Recommendation Service

Generates trading signals:

```python
def generate_signal(stock_data, indicators) -> TradingSignal:
    # BUY, SELL, HOLD
    # Confidence score
```

## Key File Locations

### Finding Frontend Files

**To find a component:**

```bash
# Search by component name
grep -r "export function StockCard" src/components/

# List all components
find src/components -name "*.tsx" -type f
```

**To find API routes:**

```bash
# List all API endpoints
find src/app/api -name "route.ts" -type f

# Example: Find stock API
cat src/app/api/stocks/route.ts
```

### Finding Backend Files

**Python MCP server:**

```bash
# From gcp app w mcp directory
ls -la python_backend/
ls -la python_backend/src/

# Run the MCP server
python python_backend/src/mcp_server.py
```

## Common Development Tasks

### Adding a New API Endpoint

1. **Create route file:**

   ```bash
   mkdir -p src/app/api/[resource]
   touch src/app/api/[resource]/route.ts
   ```

2. **Implement endpoint:**

   ```typescript
   // src/app/api/[resource]/route.ts
   import { auth } from "@clerk/nextjs/server";
   import { validateInput } from "@/lib/validation";

   export async function GET(request: Request) {
     const { userId } = await auth();
     if (!userId) {
       return Response.json({ error: "Unauthorized" }, { status: 401 });
     }

     // Fetch from database
     const data = await db.query.myTable.findMany({
       where: eq(myTable.userId, userId),
     });

     return Response.json({ success: true, data });
   }
   ```

3. **Test with API skill:**
   ```bash
   curl http://localhost:3000/api/[resource]
   ```

### Adding a New Database Table

1. **Create schema file:**

   ```bash
   touch src/lib/db/schema/[tableName].ts
   ```

2. **Define table:**

   ```typescript
   import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

   export const myTable = pgTable("my_table", {
     id: text("id").primaryKey(),
     userId: text("user_id").notNull(),
     name: text("name").notNull(),
     createdAt: timestamp("created_at").defaultNow().notNull(),
   });
   ```

3. **Generate migration:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

### Adding a New Component

1. **Create component file:**

   ```bash
   touch src/components/features/MyComponent.tsx
   ```

2. **Implement component:**

   ```typescript
   interface MyComponentProps {
     title: string;
     onClick: () => void;
   }

   export function MyComponent({ title, onClick }: MyComponentProps) {
     return (
       <div>
         <h1>{title}</h1>
         <button onClick={onClick}>Click me</button>
       </div>
     );
   }
   ```

3. **Export from barrel file:**
   ```bash
   # Add to src/components/features/index.ts
   export { MyComponent } from './MyComponent';
   ```

### Calling MCP Server from Frontend

The frontend communicates with the Python MCP server via API routes:

```typescript
// src/lib/mcp/client.ts
async function callMCP(endpoint: string, params: object) {
  const response = await fetch(`/api/mcp/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  return response.json();
}

// Usage in components
const signal = await callMCP("analyze", { symbol: "AAPL" });
```

## Navigation Commands

### Quick File Finding

**Find files by pattern:**

```bash
# Find all TypeScript files
find src -name "*.tsx" -type f

# Find all API routes
find src/app/api -name "route.ts"

# Find specific component
find src/components -name "*Stock*"

# Search for a function
grep -r "function fetchStocks" src/

# Find imports of a component
grep -r "from.*StockCard" src/
```

### Understanding File Dependencies

**To see what a file imports:**

```bash
head -30 src/components/features/StockCard.tsx
```

**To see what imports a file:**

```bash
grep -r "from.*StockCard" src/
```

## Architecture Diagrams

### Request Flow (Frontend to Backend)

```
User Interaction (Browser)
        ↓
React Component (Client/Server)
        ↓
Next.js API Route (/api/...)
        ↓
Frontend Service Layer (/lib/api/...)
        ↓
Python MCP Server (localhost:8000)
        ↓
Real Market Data APIs
```

### Database Flow

```
Frontend Form
        ↓
Next.js API Route (validates input)
        ↓
Drizzle ORM (src/lib/db/)
        ↓
PostgreSQL Database
```

### Authentication Flow

```
User Sign-in
        ↓
Clerk Authentication Service
        ↓
Session Cookie Set
        ↓
Protected Route Access
        ↓
API Route Checks auth() helper
```

## Environment Variables

Located in `.env.local` (never commit):

```bash
# Next.js / Frontend
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database
DATABASE_URL=postgresql://...

# MCP Server
MCP_SERVER_URL=http://localhost:8000
MCP_API_KEY=sk_...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing Structure

### Unit Tests

```
__tests__/
├── lib/
│   ├── api/
│   └── utils/
└── components/
    └── features/
```

### E2E Tests

```
e2e/
├── auth.spec.ts
├── dashboard.spec.ts
└── stocks.spec.ts
```

**Run tests:**

```bash
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:watch       # Watch mode
```

## Performance Optimization Points

### Frontend

- **Server Components** - Use by default for data fetching
- **Image Optimization** - Use `next/image` for stock charts
- **Code Splitting** - Route-based automatic with App Router
- **CSS** - Tailwind CSS with purging

### Database

- **Indexes** - On frequently queried columns (userId, symbol)
- **Queries** - Use relations to avoid N+1
- **Caching** - TanStack Query on frontend

### MCP Server

- **Caching** - Cache stock data with TTL
- **Rate Limiting** - Respect API rate limits
- **Connection Pool** - Reuse connections to market data APIs

## Debugging Tips

### Frontend Issues

**Check server logs:**

```bash
cd nextjs-mcp-finance
npm run dev
# Watch for errors in console
```

**Check browser console:**

- F12 → Console tab
- Look for JavaScript errors
- Check Network tab for failed requests

**Check database:**

```bash
npm run db:studio  # Opens Drizzle Studio on http://localhost:3001
```

### Backend Issues

**Check MCP server logs:**

```bash
# From gcp app w mcp directory
python python_backend/src/mcp_server.py
# Watch console output for errors
```

**Test MCP endpoint directly:**

```bash
curl http://localhost:8000/api/stocks/AAPL
```

### Database Issues

**Check migrations:**

```bash
npm run db:migrate
npm run db:migrate:rollback
```

**Query directly:**

```bash
npm run db:studio  # GUI interface
# Or use psql if available
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 1;"
```

## Common File Locations

| Task                  | Location                          |
| --------------------- | --------------------------------- |
| Add UI component      | `src/components/ui/`              |
| Add feature component | `src/components/features/`        |
| Add API endpoint      | `src/app/api/[resource]/route.ts` |
| Add database table    | `src/lib/db/schema/`              |
| Add API client        | `src/lib/api/`                    |
| Add type definitions  | `src/types/`                      |
| Add utility functions | `src/lib/utils/`                  |
| Add tests             | `__tests__/` or `e2e/`            |

## Next Steps

1. **Explore the codebase:** Use Find functionality to locate specific files
2. **Read the CLAUDE.md file:** Understand project guidelines and standards
3. **Run the application:** `npm run dev` to start frontend + `python` to start MCP server
4. **Use api-test skill:** Test APIs as you develop
5. **Run tests:** Ensure everything works before committing

---

**Need help?** Use Glob and Grep tools to search the codebase, or ask specific questions about file locations and architecture.
