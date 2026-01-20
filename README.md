# MCP Finance

A Next.js SaaS dashboard for technical analysis powered by MCP (Model Context Protocol) and 150+ trading signals.

## Features

- **Technical Analysis**: 150+ signals including MA crosses, RSI, MACD, volume analysis
- **Trade Plans**: Entry, stop, and target prices with risk-reward calculations
- **Portfolio Risk**: Aggregate risk assessment across positions
- **Scanner**: Find qualified trades across S&P 500, NASDAQ 100, and more
- **Multi-Timeframe**: Swing, day, and scalp trading analysis
- **Alerts**: Price targets, volume spikes, and webhook notifications

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Auth**: Clerk
- **Database**: PostgreSQL + Drizzle ORM
- **Payments**: Stripe (subscriptions)
- **Backend**: Python MCP server on Google Cloud Run

## Getting Started

### Prerequisites

- Node.js 18+
- MCP backend running (see [mcp-finance1](../mcp-finance1))
- Clerk account
- (Optional) Stripe account for payments

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
```

### Development

```bash
# Start the MCP backend (in mcp-finance1 directory)
python -m uvicorn cloud-run.main:app --reload --port 8000

# Start Next.js (in this directory)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Documentation

| Guide                                                              | Description                                |
| ------------------------------------------------------------------ | ------------------------------------------ |
| [Frontend-Backend Connection](docs/FRONTEND_BACKEND_CONNECTION.md) | How to connect Next.js to the MCP backend  |
| [Claude Development Guide](docs/CLAUDE_DEVELOPMENT_GUIDE.md)       | Best practices for AI-assisted development |
| [Improvements](IMPROVEMENTS.md)                                    | Product improvements and roadmap           |
| [Business Plan](BUSINESS_PLAN.md)                                  | Business model and go-to-market strategy   |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── (marketing)/       # Public pages (landing, pricing)
│   └── api/               # API routes
│       └── mcp/           # MCP backend wrappers
├── components/            # React components
│   ├── alerts/            # Alert management
│   ├── analysis/          # Analysis displays
│   ├── calendar/          # Calendars
│   ├── dashboard/         # Dashboard layout
│   ├── portfolio/         # Portfolio features
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom hooks
└── lib/                   # Utilities
    ├── auth/              # Tier configuration
    ├── db/                # Database schema
    ├── mcp/               # MCP client
    └── stripe/            # Stripe integration
```

## Tier System

| Feature        | Free  | Pro | Max       |
| -------------- | ----- | --- | --------- |
| Analyses/day   | 5     | 50  | Unlimited |
| Scan results   | 5     | 25  | 50        |
| Timeframes     | Swing | All | All       |
| Portfolio Risk | No    | Yes | Yes       |
| Alerts         | No    | No  | Yes       |
| API Access     | No    | No  | Yes       |

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm run start
```

## Related

- [mcp-finance1](../mcp-finance1) - MCP backend server
- [Clerk](https://clerk.com) - Authentication
- [shadcn/ui](https://ui.shadcn.com) - UI components

## License

MIT
