# MCP Finance Frontend-Backend Communication Optimization Plan (Simplified)

## 1. Title and Metadata

Project: MCP Finance Dashboard
Version: 2.0.0
Document ID: PLAN-MCP-FE-BE-OPT-2024-002
Date: 2024-01-10
Owners: Engineering Team
Status: Draft
Parent Document: PLAN-MCP-FE-BE-OPT-2024-001 (v1.0.0)

Summary: This simplified plan consolidates the original 9-phase approach into 6 focused phases by merging tightly coupled concerns. All 26 requirements and features are preserved. Key consolidations: (1) Usage Tracking + Rate Limiting merged into single phase, (2) Error Handling + Monitoring merged into single phase, (3) Testing integrated into each phase rather than standalone.

---

## 2. Simplification Rationale

### Phase Consolidations

| Original Phases | Simplified To | Rationale |
|----------------|---------------|-----------|
| P02: Usage Tracking + P03: Rate Limiting | P02: Usage & Rate Limiting | Rate limiting requires usage tracking; implementing together avoids double integration |
| P04: Error Handling + P05: Monitoring | P03: Resilience & Observability | Circuit breaker needs monitoring; logging is inherent to error handling |
| P06: Testing + P07: Performance | P04: Quality & Performance | Testing verifies performance; load testing is testing |
| P08: Production Deployment | P05: Production Deployment | Renumbered only |

### Architecture Simplifications

| Area | Original Approach | Simplified Approach | Benefit |
|------|------------------|---------------------|---------|
| Middleware Chain | Separate rate limiter + circuit breaker + logger | Unified request pipeline | Single integration point |
| Usage Service | Separate tracking + limiting services | Combined UsageService with limit checking | Fewer service boundaries |
| Test Strategy | Standalone phase at end | Tests written per-phase as verification | Earlier bug detection |
| Health Endpoint | Separate monitoring phase | Built during resilience phase | Natural fit with circuit breaker |

### Lines of Code Reduction

Original plan implementation estimate: ~2,500 LoC across 9 phases
Simplified plan implementation estimate: ~1,800 LoC across 6 phases
Reduction: ~28% less code while maintaining functionality

---

## 3. Design Consensus & Trade-offs (Unchanged)

| Topic | Verdict | Rationale |
|-------|---------|-----------|
| MCP Communication Pattern | FOR HTTP via Cloud Run | Cloud Run provides async scalability, managed infrastructure |
| Tier Filtering Location | FOR API Route Layer | Keeps backend stateless, enables frontend-specific filtering |
| Database Choice | FOR PostgreSQL + Drizzle | Relational model suits users/watchlists; type-safe ORM |
| Authentication Provider | FOR Clerk | Handles auth complexity, provides publicMetadata for tier |
| Stripe Integration Pattern | FOR Lazy Initialization | Avoids build-time errors, uses Proxy pattern |
| Rate Limiting Enforcement | AGAINST Client-Only | Server-side enforcement required for security |
| Error Handling Strategy | FOR Circuit Breaker | Cloud Run cold starts require resilient retry logic |
| Caching Strategy | FOR Dual-Layer | In-memory + Firestore for persistence |

---

## 4. PRD (IEEE 29148 Stakeholder/System Needs)

### Problem Statement
The MCP Finance application requires reliable, performant, and secure communication between its Next.js frontend and Python MCP backend. Current gaps: 3 MCP methods lack API routes, rate limiting is cosmetic, error handling is basic.

### Users
  - Primary: Retail traders using web dashboard
  - Secondary: Developers extending the platform
  - Tertiary: Operations team monitoring system health

### Value Proposition
  - Sub-3s response times for technical analysis
  - 99.5% uptime for API endpoints
  - Secure tier-gated access to premium features
  - Auditable usage tracking for billing accuracy

### Business Goals
  - BG-01: Enable tiered monetization (Free/Pro/Max)
  - BG-02: Reduce support tickets from API failures by 80%
  - BG-03: Support 10,000 concurrent users at launch

### Success Metrics
  - SM-01: P95 latency < 3000ms for /api/mcp/* endpoints
  - SM-02: Error rate < 0.5% for authenticated requests
  - SM-03: Rate limit enforcement accuracy > 99%
  - SM-04: Zero unauthorized tier access incidents

### Scope
  - IN: API route completion, rate limiting, error handling, monitoring, testing
  - OUT: MCP server algorithm changes, UI redesign, mobile app

---

## 5. SRS (IEEE 29148 Canonical Requirements)

*All 26 requirements from v1.0.0 preserved. See parent document for full details.*

### Requirements Summary by Phase

| Phase | Requirements Covered |
|-------|---------------------|
| P00: Foundation | REQ-013, REQ-017, REQ-018, REQ-024 |
| P01: Missing Routes | REQ-001, REQ-002, REQ-003, REQ-017, REQ-018, REQ-019 |
| P02: Usage & Rate Limiting | REQ-004, REQ-005, REQ-006, REQ-007, REQ-014, REQ-016, REQ-021, REQ-022, REQ-023, REQ-026 |
| P03: Resilience & Observability | REQ-008, REQ-009, REQ-015, REQ-020, REQ-024, REQ-025 |
| P04: Quality & Performance | REQ-010, REQ-011, REQ-012, AC-001 through AC-006 |
| P05: Production Deployment | REQ-015, AC-005, AC-006 |

### Acceptance Criteria (Unchanged)

AC-001: All 7 MCP tools accessible via /api/mcp/* routes
AC-002: Rate limiting blocks requests beyond tier quota with 429 status
AC-003: Circuit breaker opens after 5 consecutive failures, closes after 30s
AC-004: Usage dashboard shows accurate remaining quota
AC-005: Production deployment passes smoke test suite
AC-006: Load test demonstrates 100 concurrent users at P95 < 3s

### Simplified System Architecture

```
+------------------+     +------------------------+     +------------------+
|   User Browser   |---->|   Next.js App          |---->|   Cloud Run      |
|   (React SPA)    |     |   (Vercel)             |     |   (MCP Server)   |
+------------------+     +------------------------+     +------------------+
                               |                              |
                    +----------+----------+                   v
                    |          |          |            +----------+
                    v          v          v            |Firestore |
               +------+  +--------+  +-------+         +----------+
               |Clerk |  |Postgres|  |Request|
               +------+  +--------+  |Pipeline|
                              ^      +-------+
                              |           |
                         +----+----+      |
                         | Usage   |<-----+
                         | Service |
                         +---------+
```

Request Pipeline (Unified Middleware):
```
Request -> Auth -> RateLimit -> CircuitBreaker -> MCPClient -> Response
              \                         |
               \--> UsageService <------/
                         |
                         v
                    PostgreSQL
```

---

## 6. Risk Register (Simplified)

| Risk ID | Risk | Mitigation |
|---------|------|------------|
| R01 | Cloud Run cold start timeout | Set min instances = 1 in production |
| R02 | Rate limit bypass | Server-side tier validation from Clerk API |
| R03 | Database connection exhaustion | Connection pooling, max 20 connections |
| R04 | MCP server unavailable | Circuit breaker with fallback response |
| R05 | Usage count race condition | Atomic UPSERT operations |

### Suspension/Resumption Criteria (Unchanged)

Suspension Triggers:
  - Any security vulnerability discovered (immediate stop)
  - Test coverage drops below 70%
  - P95 latency exceeds 5000ms in staging

---

## 7. Iterative Implementation Plan

### Phase P00: Foundation & Validation

Scope: Verify current system state, establish baselines, create restore point
Objectives: REQ-013, REQ-017, REQ-018, REQ-024

Iterative Execution Steps:

Step 1: Create git tag for restore point
  Command: `git tag v0.0.0-baseline`
  Verification: `git tag -l v0.0.0-baseline` returns tag

Step 2: Verify existing 4 MCP routes respond
  Command: `curl -X POST localhost:3000/api/mcp/analyze -H "Content-Type: application/json" -d '{"symbol":"AAPL"}'`
  Verification: Response contains `"symbol":"AAPL"`

Step 3: Document current MCPClient methods and route mappings
  Command: Count methods in `src/lib/mcp/client.ts`
  Verification: Methods = 7, Routes = 4, Missing = 3

Step 4: Measure baseline latency for each endpoint
  Record: P50/P95/P99 for analyze, trade-plan, scan, portfolio-risk
  Verification: Metrics recorded in execution log

Step 5: Verify Clerk auth blocks unauthenticated requests
  Command: `curl localhost:3000/api/mcp/analyze`
  Verification: Returns 401 Unauthorized

Tests for P00:
  - TEST-AUTH-001: Unauthenticated request returns 401
  - TEST-BASELINE-001: All 4 existing routes respond with 200

Exit Gate:
  - Green: All 5 steps pass, baseline recorded
  - Red: Auth verification fails

Phase Metrics:
  - Confidence: 95%
  - Complexity: 15%
  - MoSCoW: Must-have

---

### Phase P01: Missing API Routes

Scope: Implement 3 missing MCP API routes
Objectives: REQ-001, REQ-002, REQ-003, REQ-017, REQ-018, REQ-019

Iterative Execution Steps:

Step 1: Create /api/mcp/morning-brief/route.ts
  Pattern: Follow src/app/api/mcp/analyze/route.ts
  Verification: `npm run build` passes

Step 2: Create /api/mcp/compare/route.ts
  Input Validation: symbols[] array, min 2, max 10
  Verification: Route responds to valid request

Step 3: Create /api/mcp/screen/route.ts
  Input Validation: criteria object with signal_count, volume_min, etc.
  Verification: Route responds to valid request

Step 4: Add TypeScript interfaces for new responses
  Location: src/lib/mcp/types.ts
  Verification: `npx tsc --noEmit` passes

Step 5: Test tier filtering for new routes
  Test: Free tier receives filtered results per tier config
  Verification: Response matches tier limits

Step 6: Update documentation
  Location: docs/FRONTEND_BACKEND_CONNECTION.md
  Verification: All 7 routes documented

Tests for P01:
  - TEST-001: Morning brief returns valid AnalysisResult
  - TEST-002: Compare handles 2-10 symbols
  - TEST-003: Screen filters by criteria
  - TEST-TYPES-001: All responses match TypeScript interfaces

Exit Gate:
  - Green: All 7 MCP methods have routes, build passes
  - Yellow: Routes work but some types use `any`
  - Red: Any route returns 500 on valid input

Phase Metrics:
  - Confidence: 85%
  - Complexity: 25%
  - MoSCoW: Must-have

---

### Phase P02: Usage & Rate Limiting (Consolidated)

Scope: Implement usage tracking AND rate limiting in unified service
Objectives: REQ-004, REQ-005, REQ-006, REQ-007, REQ-014, REQ-016, REQ-021, REQ-022, REQ-023, REQ-026

**Simplification: This phase combines original P02 + P03 into a single coherent implementation.**

Iterative Execution Steps:

Step 1: Add usage_tracking table to Drizzle schema
  Schema:
  ```typescript
  export const usageTracking = pgTable('usage_tracking', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    date: date('date').notNull().defaultNow(),
    analysisCount: integer('analysis_count').notNull().default(0),
    scanCount: integer('scan_count').notNull().default(0),
    compareCount: integer('compare_count').notNull().default(0),
    screenCount: integer('screen_count').notNull().default(0),
    morningBriefCount: integer('morning_brief_count').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  }, (table) => ({
    userDateIdx: uniqueIndex('user_date_idx').on(table.userId, table.date),
  }));
  ```
  Verification: `npm run db:generate` creates migration

Step 2: Create unified UsageService with rate checking
  Location: src/lib/usage/service.ts
  Key Methods:
  - `checkAndIncrement(userId, tier, action)`: Returns `{allowed, remaining}`
  - `getUsage(userId, date)`: Returns current usage counts
  - `getRemainingQuota(userId, tier)`: Returns remaining for all action types
  Verification: Unit tests pass for concurrent increments

Step 3: Create rate limiting middleware using UsageService
  Location: src/lib/middleware/rate-limit.ts
  Behavior:
  - Calls `UsageService.checkAndIncrement()`
  - Returns 429 with Retry-After header if limit exceeded
  - Includes remaining quota in response headers
  Verification: Middleware returns 429 after limit reached

Step 4: Integrate middleware into all 7 MCP routes
  Pattern: Wrap handler with rate limit check
  Verification: Each route checks limits before processing

Step 5: Add remaining quota to API responses
  Response Format: `{ data: {...}, quota: { remaining: { analyses: N, scans: M } } }`
  Verification: Response includes quota object

Step 6: Implement Max tier bypass
  Logic: Skip limit check if tier === 'max'
  Verification: Max tier user not rate limited

Step 7: Add rate limit violation logging
  Log: userId, endpoint, currentCount, limit, tier
  Verification: 429 responses logged with context

Tests for P02:
  - TEST-004: Free tier limited to 5 analyses/day
  - TEST-005: Pro tier limited to 50 analyses/day
  - TEST-006: Usage persists across sessions
  - TEST-007: Remaining quota in response accurate
  - TEST-014: Tier cannot be spoofed
  - TEST-016: Concurrent increments atomic
  - TEST-RATE-001: 429 returned with Retry-After header
  - TEST-RATE-002: Max tier unlimited

Exit Gate:
  - Green: All tiers correctly limited, usage persists, 429 proper
  - Yellow: Logging incomplete
  - Red: Limit can be bypassed

Phase Metrics:
  - Confidence: 78%
  - Complexity: 45% (database + middleware)
  - MoSCoW: Must-have
  - Architectural Changes: 1 (database schema)

---

### Phase P03: Resilience & Observability (Consolidated)

Scope: Implement circuit breaker, retry logic, structured logging, and health endpoint
Objectives: REQ-008, REQ-009, REQ-015, REQ-016, REQ-020, REQ-024, REQ-025

**Simplification: This phase combines original P04 + P05 since circuit breaker needs monitoring to be useful.**

Iterative Execution Steps:

Step 1: Create structured logger utility
  Location: src/lib/logging/logger.ts
  Format: JSON with timestamp, level, context
  Fields: requestId, userId, endpoint, duration, status, error
  Verification: Logger outputs JSON format

Step 2: Implement circuit breaker for MCPClient
  Library: opossum (or simple implementation)
  Config:
  - Open after 5 consecutive failures
  - Half-open after 30 seconds
  - Close after successful request in half-open
  Verification: Consecutive failures trigger open state

Step 3: Add retry logic with exponential backoff
  Config: 3 attempts, delays: 1s, 2s, 4s
  Retry On: Network errors, 5xx responses
  No Retry: 4xx responses, validation errors
  Verification: Logs show retry attempts on transient failure

Step 4: Add fallback responses for circuit open state
  Response: 503 Service Temporarily Unavailable
  Body: `{ error: "Service temporarily unavailable", retryAfter: 30 }`
  Verification: User sees helpful message, not 500

Step 5: Create /api/health endpoint
  Location: src/app/api/health/route.ts
  Response: `{ status, version, mcp_status, db_status, circuit_state }`
  Verification: Health endpoint comprehensive

Step 6: Add request/response logging to all MCP routes
  Log Points: Request received, MCP call made, Response sent
  Verification: Logs include duration and status

Step 7: Emit telemetry for circuit state changes
  Events: circuit_opened, circuit_half_open, circuit_closed
  Include: timestamp, failure_count, last_error
  Verification: Console logs circuit transitions

Tests for P03:
  - TEST-008: Retry attempts 3 times on failure
  - TEST-009: Circuit opens after 5 failures
  - TEST-015: Health endpoint returns all statuses
  - TEST-CIRCUIT-001: Circuit closes after recovery
  - TEST-LOG-001: All requests logged with context

Exit Gate:
  - Green: Circuit opens/closes correctly, logging complete
  - Yellow: Some log fields missing
  - Red: Circuit stuck open, no recovery

Phase Metrics:
  - Confidence: 75%
  - Complexity: 45%
  - MoSCoW: Should-have
  - Architectural Changes: 1 (MCPClient wrapper)

---

### Phase P04: Quality & Performance (Consolidated)

Scope: Integration testing suite and performance optimization
Objectives: REQ-010, REQ-011, REQ-012, AC-001 through AC-006

**Simplification: This phase combines original P06 + P07 since load testing is testing.**

Iterative Execution Steps:

Step 1: Set up Vitest for API route testing
  Config: vitest.config.ts with test environment
  Verification: `npm test` runs without error

Step 2: Create test utilities and fixtures
  Location: tests/fixtures/, tests/utils/
  Fixtures: Mock MCP responses, test users by tier
  Verification: Fixtures load correctly

Step 3: Write integration tests for all 7 routes
  Coverage: Happy path + error cases for each
  Verification: 7 route test files, all pass

Step 4: Write rate limiting and circuit breaker tests
  Test: Limit enforcement, circuit state transitions
  Verification: Edge cases covered

Step 5: Implement response caching for repeated requests
  Strategy: In-memory cache, 5-minute TTL
  Key: `${symbol}-${timeframe}`
  Verification: Second request faster, cache hit logged

Step 6: Optimize database queries
  Actions: Add indexes, use connection pooling
  Verification: EXPLAIN shows index usage

Step 7: Run load test (100 concurrent users)
  Tool: k6 or autocannon
  Target: P95 < 3000ms
  Verification: Results meet target

Step 8: Measure test coverage
  Target: > 70%
  Verification: Coverage report generated

Tests for P04:
  - TEST-010: P95 latency < 3000ms
  - TEST-011: P99 latency < 5000ms
  - TEST-012: 100 concurrent requests handled
  - TEST-COVERAGE-001: Coverage > 70%

Exit Gate:
  - Green: P95 < 3000ms, coverage > 70%, all tests pass
  - Yellow: P95 3000-4000ms or coverage 60-70%
  - Red: P95 > 5000ms or any happy path fails

Phase Metrics:
  - Confidence: 72%
  - Complexity: 50%
  - MoSCoW: Should-have

---

### Phase P05: Production Deployment

Scope: Deploy and verify production environment
Objectives: REQ-015, AC-005, AC-006

Iterative Execution Steps:

Step 1: Configure Vercel environment variables
  Required: NEXT_PUBLIC_MCP_URL, CLERK_*, DATABASE_URL
  Verification: All vars set in Vercel dashboard

Step 2: Deploy to Vercel preview
  Command: Push to feature branch, Vercel auto-deploys
  Verification: Preview URL accessible

Step 3: Run smoke test suite against preview
  Tests: Auth, each MCP endpoint, rate limiting, health
  Verification: All smoke tests pass

Step 4: Verify Cloud Run connectivity
  Check: /api/health shows mcp_status: "healthy"
  Verification: MCP server reachable

Step 5: Promote to production
  Method: Merge to main, Vercel auto-deploys
  Verification: Production URL live

Step 6: Run production verification
  Tests: Same smoke tests on production
  Monitor: Error rate first hour < 0.5%
  Verification: No 5xx errors in first hour

Step 7: Create release tag
  Command: `git tag v1.0.0`
  Verification: Tag exists and points to production commit

Exit Gate:
  - Green: All smoke tests pass, no 5xx first hour
  - Yellow: Minor issues requiring hotfix
  - Red: Data loss or security incident

Phase Metrics:
  - Confidence: 90%
  - Complexity: 30%
  - MoSCoW: Must-have

---

## 8. Tests Overview

Total Tests: 20 (reduced from 16 by consolidating overlapping tests)

| Test ID | Type | Phase | Verifies | Description |
|---------|------|-------|----------|-------------|
| TEST-AUTH-001 | security | P00 | REQ-013 | Unauthenticated request blocked |
| TEST-001 | integration | P01 | REQ-001 | Morning brief returns valid response |
| TEST-002 | integration | P01 | REQ-002 | Compare handles symbol array |
| TEST-003 | integration | P01 | REQ-003 | Screen filters by criteria |
| TEST-004 | unit | P02 | REQ-004 | Free tier analysis limit enforced |
| TEST-005 | unit | P02 | REQ-005 | Scan limit enforced per tier |
| TEST-006 | integration | P02 | REQ-006 | Usage persists in database |
| TEST-007 | integration | P02 | REQ-007 | Remaining quota in response |
| TEST-RATE-001 | integration | P02 | REQ-004 | 429 with Retry-After header |
| TEST-RATE-002 | integration | P02 | REQ-004 | Max tier unlimited |
| TEST-014 | security | P02 | REQ-014 | Tier spoofing prevented |
| TEST-016 | unit | P02 | REQ-022 | Atomic usage increment |
| TEST-008 | unit | P03 | REQ-008 | Retry logic 3 attempts |
| TEST-009 | unit | P03 | REQ-009 | Circuit opens after 5 failures |
| TEST-015 | integration | P03 | REQ-020 | Health endpoint comprehensive |
| TEST-CIRCUIT-001 | integration | P03 | REQ-009 | Circuit recovery behavior |
| TEST-010 | performance | P04 | REQ-010 | P95 < 3000ms |
| TEST-011 | performance | P04 | REQ-011 | P99 < 5000ms |
| TEST-012 | performance | P04 | REQ-012 | 100 concurrent handled |
| TEST-COVERAGE-001 | quality | P04 | - | Coverage > 70% |

---

## 9. Data Contract

### usage_tracking Schema (Unchanged)

```sql
CREATE TABLE usage_tracking (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  analysis_count INT NOT NULL DEFAULT 0,
  scan_count INT NOT NULL DEFAULT 0,
  compare_count INT NOT NULL DEFAULT 0,
  screen_count INT NOT NULL DEFAULT 0,
  morning_brief_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_usage_user_date ON usage_tracking(user_id, date);
```

### Invariants
  - INV-01: All count fields >= 0
  - INV-02: user_id matches Clerk user ID format
  - INV-03: date is never in future
  - INV-04: Increment operations are atomic (UPSERT with ON CONFLICT)

---

## 10. RTM (Requirements Traceability Matrix)

| REQ-ID | TEST-ID | Phase | Type |
|--------|---------|-------|------|
| REQ-001 | TEST-001 | P01 | func |
| REQ-002 | TEST-002 | P01 | func |
| REQ-003 | TEST-003 | P01 | func |
| REQ-004 | TEST-004, TEST-RATE-001 | P02 | func |
| REQ-005 | TEST-005 | P02 | func |
| REQ-006 | TEST-006 | P02 | func |
| REQ-007 | TEST-007 | P02 | func |
| REQ-008 | TEST-008 | P03 | func |
| REQ-009 | TEST-009, TEST-CIRCUIT-001 | P03 | func |
| REQ-010 | TEST-010 | P04 | perf |
| REQ-011 | TEST-011 | P04 | perf |
| REQ-012 | TEST-012 | P04 | nfr |
| REQ-013 | TEST-AUTH-001 | P00 | security |
| REQ-014 | TEST-014 | P02 | security |
| REQ-015 | - | P05 | reliability |
| REQ-016 | TEST-016 | P02 | reliability |
| REQ-017 | - | P00 | int |
| REQ-018 | - | P01 | int |
| REQ-019 | - | P01 | int |
| REQ-020 | TEST-015 | P03 | int |
| REQ-021 | TEST-006 | P02 | data |
| REQ-022 | TEST-016 | P02 | data |
| REQ-023 | - | P02 | data |
| REQ-024 | - | P03 | tel |
| REQ-025 | - | P03 | tel |
| REQ-026 | - | P02 | tel |

---

## 11. Execution Log Template

### Phase P00: Foundation & Validation

Status: [ ] Pending  [ ] In Progress  [ ] Done

| Step | Status | Notes |
|------|--------|-------|
| 1. Git baseline tag | [ ] | |
| 2. Verify 4 routes | [ ] | |
| 3. Document mappings | [ ] | |
| 4. Baseline latency | [ ] | P50: ___ms, P95: ___ms |
| 5. Auth verification | [ ] | |

Issues:
Lessons Learned:

---

### Phase P01: Missing API Routes

Status: [ ] Pending  [ ] In Progress  [ ] Done

| Step | Status | Notes |
|------|--------|-------|
| 1. morning-brief route | [ ] | |
| 2. compare route | [ ] | |
| 3. screen route | [ ] | |
| 4. TypeScript types | [ ] | |
| 5. Tier filtering | [ ] | |
| 6. Documentation | [ ] | |

Tests Passing: [ ] TEST-001 [ ] TEST-002 [ ] TEST-003

Issues:
Lessons Learned:

---

### Phase P02: Usage & Rate Limiting

Status: [ ] Pending  [ ] In Progress  [ ] Done

| Step | Status | Notes |
|------|--------|-------|
| 1. Database schema | [ ] | Migration: |
| 2. UsageService | [ ] | |
| 3. Rate limit middleware | [ ] | |
| 4. Route integration | [ ] | |
| 5. Quota in response | [ ] | |
| 6. Max tier bypass | [ ] | |
| 7. Violation logging | [ ] | |

Tests Passing: [ ] TEST-004 [ ] TEST-005 [ ] TEST-006 [ ] TEST-007 [ ] TEST-014 [ ] TEST-016 [ ] TEST-RATE-001 [ ] TEST-RATE-002

Issues:
Lessons Learned:

---

### Phase P03: Resilience & Observability

Status: [ ] Pending  [ ] In Progress  [ ] Done

| Step | Status | Notes |
|------|--------|-------|
| 1. Structured logger | [ ] | |
| 2. Circuit breaker | [ ] | Library: |
| 3. Retry logic | [ ] | |
| 4. Fallback responses | [ ] | |
| 5. Health endpoint | [ ] | |
| 6. Request logging | [ ] | |
| 7. Circuit telemetry | [ ] | |

Tests Passing: [ ] TEST-008 [ ] TEST-009 [ ] TEST-015 [ ] TEST-CIRCUIT-001

Issues:
Lessons Learned:

---

### Phase P04: Quality & Performance

Status: [ ] Pending  [ ] In Progress  [ ] Done

| Step | Status | Notes |
|------|--------|-------|
| 1. Vitest setup | [ ] | |
| 2. Fixtures | [ ] | |
| 3. Route tests | [ ] | |
| 4. Edge case tests | [ ] | |
| 5. Response caching | [ ] | |
| 6. DB optimization | [ ] | |
| 7. Load test | [ ] | P95: ___ms |
| 8. Coverage report | [ ] | Coverage: ___% |

Tests Passing: [ ] TEST-010 [ ] TEST-011 [ ] TEST-012 [ ] TEST-COVERAGE-001

Issues:
Lessons Learned:

---

### Phase P05: Production Deployment

Status: [ ] Pending  [ ] In Progress  [ ] Done

| Step | Status | Notes |
|------|--------|-------|
| 1. Vercel env vars | [ ] | |
| 2. Preview deploy | [ ] | URL: |
| 3. Smoke tests | [ ] | |
| 4. Cloud Run verify | [ ] | |
| 5. Production promote | [ ] | |
| 6. Production verify | [ ] | Error rate: |
| 7. Release tag | [ ] | Version: |

Issues:
Lessons Learned:

---

## 12. Appendix: ADR Index

| ADR-ID | Date | Decision |
|--------|------|----------|
| ADR-001 | 2024-01-10 | Use HTTP via Cloud Run for MCP communication |
| ADR-002 | 2024-01-10 | Implement tier filtering at API route layer |
| ADR-003 | 2024-01-10 | Use PostgreSQL for usage tracking persistence |
| ADR-004 | TBD | Unified UsageService for tracking + limiting |
| ADR-005 | TBD | Circuit breaker library selection |
| ADR-006 | TBD | Caching strategy for repeated requests |

---

## 13. Consistency Check

### Comparison to v1.0.0

| Metric | v1.0.0 | v2.0.0 | Change |
|--------|--------|--------|--------|
| Phases | 9 | 6 | -33% |
| Total Steps | 46 | 38 | -17% |
| Requirements | 26 | 26 | 0% |
| Tests | 16 | 20 | +25% |
| Architectural Changes | 4 | 2 | -50% |

### Preserved Features
  - All 26 requirements covered
  - All 6 acceptance criteria verifiable
  - All 7 MCP tools get routes
  - Tier-based rate limiting
  - Circuit breaker resilience
  - Structured logging
  - Production deployment process

### Simplification Benefits
  - Fewer integration points (services merged)
  - Tests written alongside features (earlier bug detection)
  - Single UsageService handles tracking + limiting
  - Combined logging + monitoring phase reduces boilerplate
  - Estimated 28% less implementation code

---

## 14. Implementation Timeline (Phases Only)

| Phase | Depends On | Scope |
|-------|------------|-------|
| P00: Foundation | - | Verification only |
| P01: Missing Routes | P00 | 3 new files |
| P02: Usage & Rate Limiting | P01 | Schema + service + middleware |
| P03: Resilience & Observability | P01 | Circuit breaker + logging |
| P04: Quality & Performance | P02, P03 | Testing + optimization |
| P05: Production Deployment | P04 | Deployment + verification |

Critical Path: P00 -> P01 -> P02 -> P04 -> P05
Optional Path: P03 can run parallel to P02 after P01 completes

---

End of Simplified Document
