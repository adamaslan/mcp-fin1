# Claude Development Guide

Best practices for using Claude Code to develop the MCP Finance application.

---

## Table of Contents

1. [Project Context Setup](#project-context-setup)
2. [Effective Prompts by Task Type](#effective-prompts-by-task-type)
3. [Reference Files Cheatsheet](#reference-files-cheatsheet)
4. [Workflow Best Practices](#workflow-best-practices)
5. [Common Tasks Quick Reference](#common-tasks-quick-reference)
6. [Multi-File Changes](#multi-file-changes)
7. [What Claude Excels At](#what-claude-excels-at)
8. [What Needs Human Input](#what-needs-human-input)
9. [Debugging with Claude](#debugging-with-claude)
10. [Example Prompts](#example-prompts)

---

## Project Context Setup

### CLAUDE.md File

Create a `CLAUDE.md` in your project root with project-specific instructions:

```markdown
# MCP Finance Project

## Tech Stack

- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Clerk for auth
- Drizzle ORM + PostgreSQL
- MCP backend on Cloud Run

## Key Patterns

- API routes in src/app/api/
- Components in src/components/
- Tier gating via Clerk metadata
- All MCP calls go through MCPClient

## Tier System

- free: Basic features, 5 analyses/day
- pro: Portfolio risk, journal, 50 analyses/day
- max: All features, unlimited
```

### Providing Context

When starting a conversation, provide relevant context:

```
I'm working on MCP Finance, a Next.js SaaS for technical analysis.

Key files:
- src/lib/mcp/client.ts (MCP HTTP client)
- src/lib/auth/tiers.ts (tier configuration)
- src/app/api/mcp/ (API routes)

Current task: [describe what you're doing]
```

---

## Effective Prompts by Task Type

### Adding New Features

**Template:**

```
Create a [component/page/API route] that:
- Does [specific functionality]
- Follows the pattern in [reference file]
- Is tier-gated for [tier] (optional)
- Uses TypeScript
- Uses shadcn/ui components
```

**Example:**

```
Create a new alert component for "Moving Average Crossover" alerts that:
- Follows the pattern in src/components/alerts/PriceTargetAlerts.tsx
- Allows users to select MA periods (20, 50, 200)
- Is tier-gated for Pro tier
- Uses shadcn/ui Card and Badge components
```

### Bug Fixes

**Template:**

```
Fix the bug in [file path]:

Error message:
[paste full error]

Expected behavior: [what should happen]
Actual behavior: [what actually happens]

Relevant context: [any additional info]
```

**Example:**

```
Fix the bug in src/app/(dashboard)/portfolio/page.tsx:

Error message:
Type error: Property 'holdings' does not exist on type 'CorrelationMatrixProps'

Expected: CorrelationMatrix should accept a holdings prop
Actual: Component only accepts data prop

Context: I'm trying to pass portfolio symbols to the correlation matrix
```

### Refactoring

**Template:**

```
Refactor [component/file]:
- From: [current pattern/problem]
- To: [target pattern/solution]
- Keep: [what must be preserved]
- Test: [how to verify]
```

**Example:**

```
Refactor src/components/dashboard/ThemeToggle.tsx:
- From: Simple toggle between light/dark
- To: Dropdown with light/dark/OLED options
- Keep: Current icon animation behavior
- Test: Run npm run build after changes
```

### Adding to Existing Files

**Template:**

```
Add [feature] to [file]:
- New functionality: [description]
- Insert after/before: [location hint]
- Reference: [similar code to follow]
```

**Example:**

```
Add a "Copy to Clipboard" button to the API docs page:
- New functionality: Copy code snippets with one click
- Insert after: Each code block
- Reference: Similar to the copy button in keyboard-shortcuts.tsx
```

---

## Reference Files Cheatsheet

Use these files as patterns when creating new features:

| Task                     | Reference File                                    | Key Pattern           |
| ------------------------ | ------------------------------------------------- | --------------------- |
| New API route            | `src/app/api/mcp/analyze/route.ts`                | Auth + tier filtering |
| New dashboard page       | `src/app/(dashboard)/alerts/page.tsx`             | Layout + tabs         |
| New component with state | `src/components/alerts/PriceTargetAlerts.tsx`     | useState + CRUD       |
| New component with form  | `src/components/settings/EmailDigestSettings.tsx` | Form handling         |
| Tier-gated content       | `src/lib/auth/tiers.ts`                           | `canAccessFeature()`  |
| TypeScript types         | `src/lib/mcp/types.ts`                            | Interface definitions |
| Database schema          | `src/lib/db/schema.ts`                            | Drizzle ORM           |
| UI components            | `src/components/ui/*.tsx`                         | shadcn/ui             |
| Calendar component       | `src/components/calendar/EarningsCalendar.tsx`    | Date handling         |
| Chart/visualization      | `src/components/portfolio/CorrelationMatrix.tsx`  | Data display          |

### Quick File Lookup

```
"Look at src/components/alerts/PriceTargetAlerts.tsx for the pattern to follow"

"Use the same structure as src/app/api/mcp/analyze/route.ts"

"Follow the type definitions in src/lib/mcp/types.ts"
```

---

## Workflow Best Practices

### 1. Use Plan Mode for Complex Tasks

For tasks touching multiple files:

```
/plan Add a new "Sector Heatmap" feature to the dashboard
```

This lets Claude explore the codebase and design an approach before coding.

### 2. Build Incrementally

Break large features into steps:

```
Step 1: "Create the SectorHeatmap component with mock data"
[verify it works]

Step 2: "Add the API route to fetch real sector data"
[verify it works]

Step 3: "Connect the component to the API"
[verify it works]

Step 4: "Add tier gating for Pro users"
[verify it works]
```

### 3. Always Test After Changes

```
After making changes, run:
npm run build

If there are errors, paste them and say:
"Fix these build errors"
```

### 4. Provide Full Error Context

When fixing errors, include:

- The complete error message
- The file path
- What you were trying to do

```
Build error:

./src/components/alerts/VolumeSpikeAlerts.tsx:45:7
Type error: Property 'enabled' does not exist on type 'VolumeAlert'.

I was adding a toggle feature to volume alerts.
```

---

## Common Tasks Quick Reference

### Add a New Page to Sidebar

```
Add "Backtesting" to the Sidebar component:
- Icon: LineChart from lucide-react
- Route: /backtesting
- Tier required: pro
- Follow the existing navItems pattern
```

### Add a New API Endpoint

```
Add /api/mcp/compare endpoint:
- Follow the pattern in src/app/api/mcp/analyze/route.ts
- Call getMCPClient().compareSecurity()
- No tier restriction (available to all)
```

### Create a New Alert Type

```
Create a new alert component for RSI alerts:
- Follow src/components/alerts/PriceTargetAlerts.tsx pattern
- Allow setting RSI threshold (overbought/oversold)
- Add to the Alerts page tabs
```

### Add Mock Data

```
Add mock data for the SectorHeatmap component:
- Include all 11 GICS sectors
- Include change_percent and volume data
- Follow the MOCK_DATA pattern from other components
```

### Fix TypeScript Errors

```
[paste error]

Fix this TypeScript error. Check the type definitions in
src/lib/mcp/types.ts if needed.
```

### Add a New shadcn Component

```
Add the Slider component from shadcn/ui to the project,
then use it in [component] for [purpose].
```

---

## Multi-File Changes

### Using TodoWrite

For complex tasks, ask Claude to track progress:

```
Implement the Morning Brief feature. Use TodoWrite to track:
1. Create API route for morning-brief
2. Create MorningBrief component
3. Add to dashboard home page
4. Add tier gating for Pro users
```

### Parallel vs Sequential

**Parallel (independent tasks):**

```
Create these three components (they don't depend on each other):
1. SectorHeatmap.tsx
2. MarketMood.tsx
3. VolumeLeaders.tsx
```

**Sequential (dependent tasks):**

```
First: Create the TypeScript interface for SectorData
Then: Create the API route that returns SectorData
Finally: Create the component that uses the API
```

---

## What Claude Excels At

### Pattern Replication

```
"Create a new component like PriceTargetAlerts but for earnings alerts"
```

Claude will replicate the structure, styling, and patterns exactly.

### TypeScript Accuracy

```
"Add proper TypeScript types for this API response"
```

Claude generates accurate interfaces matching your data.

### Boilerplate Generation

```
"Create a new API route with auth, validation, and error handling"
```

Claude writes complete, production-ready boilerplate.

### Bug Fixing with Context

```
[paste error message]
"Fix this error"
```

Claude understands the error and applies the correct fix.

### Consistent Styling

```
"Style this component to match the rest of the dashboard"
```

Claude follows your existing Tailwind patterns.

### Documentation

```
"Add JSDoc comments to the MCPClient methods"
```

Claude writes clear, accurate documentation.

---

## What Needs Human Input

### Business Logic Decisions

Claude will ask or you should specify:

- What tier should access this feature?
- What's the default value for X?
- Should this be required or optional?

### Design Choices

Specify preferences:

- "Use a card layout, not a table"
- "Put the button on the right side"
- "Use green for positive, red for negative"

### API Credentials

Never paste secrets in chat. Instead:

```
"Add the Stripe webhook secret from environment variables"
```

### Architecture Decisions

For major changes, discuss first:

```
"I want to add real-time updates. What approaches would work?"
```

### External Service Integration

Provide documentation links:

```
"Integrate with Alpaca API. Here's their docs: [link]"
```

---

## Debugging with Claude

### Build Errors

```
npm run build failed:

[paste full error]

What's wrong and how do I fix it?
```

### Runtime Errors

```
Getting this error in the browser console:

[paste error]

The component is: src/components/[name].tsx
I was trying to: [action]
```

### Logic Bugs

```
The PriceTargetAlerts component isn't filtering correctly:
- Expected: Only show alerts for current user
- Actual: Shows all alerts
- File: src/components/alerts/PriceTargetAlerts.tsx
- Relevant code: [paste snippet]
```

### API Issues

```
The /api/mcp/analyze endpoint returns 500:
- Request body: {"symbol": "AAPL"}
- MCP server is running on localhost:8000
- Error in console: [paste]
```

---

## Example Prompts

### Complete Feature Implementation

```
Implement a "Trade Ideas" feature:

1. Create src/components/trade-ideas/TradeIdeasList.tsx
   - Display a list of AI-generated trade ideas
   - Each idea shows: symbol, bias, confidence, reasoning
   - Use Card components from shadcn/ui
   - Follow the pattern in src/components/news/NewsFeed.tsx

2. Create src/app/api/trade-ideas/route.ts
   - Call the MCP server's /api/trade-ideas endpoint
   - Require Pro tier to access
   - Return top 5 ideas for free tier, all for Pro/Max

3. Add "Trade Ideas" to the sidebar
   - Use Lightbulb icon
   - Tier required: free (but limited results)

Run build after each step to catch errors early.
```

### Quick Fix

```
The CorrelationMatrix shows "undefined" for some cells.
File: src/components/portfolio/CorrelationMatrix.tsx
Add null checks to prevent this.
```

### Add Missing Feature

```
The email digest settings save button doesn't actually persist.
Add localStorage persistence to EmailDigestSettings.tsx
so settings survive page refresh.
```

### Code Review Request

```
Review src/components/alerts/WebhookSettings.tsx:
- Is the error handling adequate?
- Are there any security concerns with the webhook URLs?
- Suggest any improvements
```

---

## Quick Tips

1. **Be specific about files**: Include full paths
2. **Reference existing patterns**: "Like X component"
3. **Include error messages**: Paste the full error
4. **State your goal**: What are you trying to achieve?
5. **Verify after changes**: Run build, test the feature
6. **One thing at a time**: Break complex tasks into steps

---

## Summary

| Situation    | Approach                                 |
| ------------ | ---------------------------------------- |
| New feature  | Reference existing pattern + be specific |
| Bug fix      | Paste full error + file path             |
| Refactoring  | State from/to + what to keep             |
| Multi-file   | Use plan mode or TodoWrite               |
| Quick fix    | Direct request with file path            |
| Architecture | Discuss options first                    |

Happy coding with Claude!
