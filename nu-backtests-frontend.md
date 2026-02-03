# Frontend Backtest UI — Implementation notes (Next.js + Tailwind) ✨

## Goal

Add a stylish, flexible backtest configuration UI that lets users compose test parameters, run tests, and view results. Use Tailwind for fast, consistent styling and componentization.

## Components

- `BacktestConfigurator` (created) — parameter form with lookback, top_n, weighting, rebalance, transaction costs, universe input, advanced JSON editor toggle
- `BacktestJobsPanel` — list of submitted jobs, status, links to outputs
- `BacktestResults` — plots (using recharts or chart.js), tables for trades and metrics

## API

- POST `/api/run-backtest` — accepts JSON config, writes job to queue (Redis or database), returns job_id
- GET `/api/job/:id` — job status and output links

## Styling & UX

- Use Tailwind and small utility classes. Component is mobile-first, responsive.
- Provide accesible form elements and helpful tooltips for expert parameters.

## Extensibility

- Add an advanced mode that exposes every parameter from the YAML templates (slippage models, cost sweeps, event windows, risk controls).
- Allow saving/loading presets per user.

---

If you want, I can implement a minimal serverless API (`pages/api/run-backtest.js`) that directly calls the runner script (assuming server environment has Python available), or queue the job for background workers.
