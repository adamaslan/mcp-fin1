# Claude Skills Development Guide

## Overview

This guide explains how to build Claude skills for the MCP Finance application **without exposing secrets** or requiring direct access to sensitive credentials.

## Architecture Principles

### 1. Secrets Never in Skills

Claude skills should:

- ❌ Never contain hardcoded API keys or secrets
- ❌ Never access `.env` files directly
- ❌ Never make direct calls to Stripe/payment endpoints
- ✅ Always go through your application's safe API layer
- ✅ Use public information from documentation and code
- ✅ Interact through public endpoints only

### 2. Safe Skill Types

There are three categories of safe skills:

#### Type A: Documentation & Code Analysis

- Read and analyze public code
- Understand architecture & patterns
- Answer questions about the system
- **Example:** "Explain how tier-based access control works"
- **No secrets exposed:** Uses public documentation

#### Type B: Testing & Validation

- Run tests that don't require secrets
- Validate code without secrets
- Check configuration integrity
- **Example:** "Run the tier tests to verify feature access"
- **No secrets exposed:** Tests use mock data

#### Type C: Development Assistance

- Suggest code improvements
- Fix bugs in non-sensitive code
- Refactor features
- **Example:** "Add caching to the TierGate component"
- **No secrets exposed:** Changes don't involve credentials

## Skill Template Structure

### Safe Skill: Tier System Documentation

```typescript
/**
 * Skill: Analyze Tier-Based Access Control
 * Purpose: Understand and modify tier features without accessing secrets
 * Safety: No secrets required, uses public code only
 */

import { Glob, Read, Grep } from "@/tools";

export async function analyzeTierSystem() {
  // Read public tier configuration (NO SECRETS HERE)
  const tiers = await Read("/src/lib/auth/tiers.ts");

  // Analyze feature distribution
  const features = extractFeatures(tiers);

  // Check for tier progression (verify constraints)
  const tierOrder = validateTierHierarchy(features);

  // Report findings (safe to share)
  return {
    tierCount: 3,
    features,
    tierOrder,
    issues: [], // Any non-secret issues found
  };
}

// ✅ SAFE: Doesn't touch .env or credentials
// ✅ SAFE: Uses only public code files
// ✅ SAFE: Can be called by Claude without risk
```

### Unsafe Skill Pattern (What NOT to Do)

```typescript
// ❌ UNSAFE: Never do this!
import * as fs from "fs";

export async function unsafeSkill() {
  // ❌ NEVER read .env directly
  const env = fs.readFileSync(".env", "utf-8");

  // ❌ NEVER expose secrets
  const secretKey = env
    .split("\n")
    .find((line) => line.startsWith("STRIPE_SECRET_KEY="));

  // ❌ NEVER make direct API calls
  const response = await fetch("https://api.stripe.com/v1/...", {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  return response.json(); // EXPOSED SECRETS!
}
```

## Safe Skill Examples

### Skill 1: Test Runner

**Purpose:** Run existing tests without secrets

```bash
# Safe to call - tests use mocks
npx tsx __tests__/tiers.test.ts
npx tsx __tests__/middleware.test.ts
npx tsx __tests__/tiergating.test.ts
```

**What Claude can do:**

- Run test suite
- Report test results
- Suggest fixes for failing tests
- Verify tier configuration

**What Claude cannot do:**

- Access actual Stripe API
- View real API keys
- Make changes to payment system
- Modify webhook logic

### Skill 2: Code Quality Analysis

**Purpose:** Analyze code without accessing secrets

```typescript
export async function analyzeCodeQuality() {
  // Search for public code issues
  const results = await Grep({
    pattern: "TODO|FIXME|XXX|HACK",
    type: "typescript",
    exclude: [".env*", ".git", "node_modules"],
  });

  return {
    issues: results,
    recommendations: [
      // Safe recommendations based on code analysis
    ],
  };
}
```

### Skill 3: Feature Documentation

**Purpose:** Generate documentation from code

```typescript
export async function generateFeatureDocs() {
  // Read public source files
  const tierFile = await Read("/src/lib/auth/tiers.ts");
  const middlewareFile = await Read("/src/middleware.ts");
  const componentFile = await Read("/src/components/gating/TierGate.tsx");

  // Extract documentation
  const features = extractFeatures(tierFile);
  const routes = extractRoutes(middlewareFile);
  const components = extractComponents(componentFile);

  // Generate markdown documentation
  return generateMarkdown({
    features,
    routes,
    components,
  });
}
```

## Safe vs Unsafe Operations

### File Access Rules

```
✅ SAFE to read:
  - /src/**/*.ts (except files with secrets)
  - /src/**/*.tsx
  - /public/**
  - *.md (markdown docs)
  - package.json, tsconfig.json (config)
  - __tests__/** (test files)

❌ UNSAFE to read:
  - .env* (all environment files)
  - .vercel/** (Vercel config)
  - /.git/** (git secrets)
  - Anything with 'secret', 'key', 'token', 'credential'
```

### API Call Rules

```
✅ SAFE:
  - Call your own application APIs: /api/analyze, /api/validate
  - Call public APIs that don't require secrets
  - Make requests that go through your auth layer

❌ UNSAFE:
  - Call Stripe API directly
  - Call Clerk API directly
  - Include secret keys in requests
  - Bypass your application's API layer
```

### Code Modification Rules

```
✅ SAFE to modify:
  - Components: Add features, improve UI
  - Utilities: Refactor, optimize
  - Tests: Add new test cases
  - Documentation: Update guides
  - Non-critical configuration

❌ UNSAFE to modify:
  - Anything with secret/key/token
  - Payment processing logic
  - Authentication flows
  - Webhook handlers
  - Environment variable loading
  - Stripe integration code
```

## Skill Development Workflow

### Step 1: Plan the Skill

```markdown
# Skill: [Name]

## Safety Level: [Public/Internal/Admin]

## Purpose

What problem does this solve?

## Secret Requirements

- Does it need API keys? NO ✅
- Does it access .env files? NO ✅
- Does it modify sensitive code? NO ✅

## Capabilities

- What can it do? (Safe operations only)
- What can't it do? (Unsafe operations)

## Example Usage

How would Claude use this skill?
```

### Step 2: Implement Safely

```typescript
// 1. Only use public tools
import { Glob, Read, Write, Grep } from "@tools";

// 2. Never access secrets
async function mySkill(input: string) {
  // Safe: Read public code
  const code = await Read("/src/components/MyComponent.tsx");

  // Safe: Analyze without modifying secrets
  const analysis = analyzeCode(code);

  // Safe: Write documentation
  await Write("/docs/analysis.md", analysis);

  // Safe: Return insights
  return analysis;
}

// 3. Add safety checks
function validateInput(input: string): boolean {
  // Reject if input contains secret patterns
  if (/secret|key|token|password|credential/i.test(input)) {
    throw new Error("Input contains sensitive keywords");
  }
  return true;
}
```

### Step 3: Document for Claude

Create a skill documentation file:

```yaml
# skill-example.yaml
name: Analyze Tier System
description: |
  Analyzes the tier-based access control system.
  Safe for Claude to run without access restrictions.

capabilities:
  - Read tier configuration
  - Validate tier hierarchy
  - Suggest feature improvements
  - Generate documentation

security:
  secrets_required: false
  modifies_sensitive: false
  reads_env: false
  requires_approval: false

commands:
  - name: analyze-tiers
    description: Analyze current tier configuration
    command: "analyze tier system"

  - name: validate-hierarchy
    description: Validate tier progression
    command: "validate tier hierarchy"
```

## Build Systems Safe for Claude

### 1. Code Analysis System

```typescript
// Safe: Only reads & analyzes code
export async function analyzeCodebase() {
  const files = await Glob("src/**/*.ts");

  for (const file of files) {
    const content = await Read(file);
    const analysis = analyzeForPatterns(content);

    // Safe findings
    return {
      codeMetrics: analysis,
      improvements: suggestImprovements(analysis),
      testCoverage: checkTestFiles(),
    };
  }
}
```

### 2. Documentation Generation System

```typescript
// Safe: Reads code and generates docs
export async function generateDocs() {
  const components = await Glob("src/components/**/*.tsx");
  const docs = [];

  for (const component of components) {
    const code = await Read(component);
    const docstring = extractDocumentation(code);
    docs.push(docstring);
  }

  return generateMarkdown(docs);
}
```

### 3. Test Validation System

```typescript
// Safe: Runs existing tests
export async function validateTests() {
  const result = await executeCommand("npx tsx __tests__/tiers.test.ts");

  return {
    passed: result.exitCode === 0,
    output: result.stdout,
    failures: parseFailures(result.stdout),
  };
}
```

## Integration Checklist

Before deploying a Claude skill:

- [ ] No hardcoded secrets in code
- [ ] No `.env` file access
- [ ] No direct API key usage
- [ ] No modification of sensitive files
- [ ] No bypass of authentication
- [ ] Safe file patterns only
- [ ] Proper input validation
- [ ] Error handling without exposing secrets
- [ ] Documentation of limitations
- [ ] Clear safety disclaimers

## Example: Safe Tier Analysis Skill

```typescript
/**
 * Safe Skill: Analyze Tier System
 *
 * This skill analyzes the tier-based access control system
 * WITHOUT accessing any secrets or credentials.
 */

import { Read, Grep, Glob } from "@/tools";

interface TierAnalysis {
  totalFeatures: number;
  tierLimits: Record<string, object>;
  protectedRoutes: string[];
  recommendations: string[];
}

export async function analyzeTierSystem(): Promise<TierAnalysis> {
  // ✅ Safe: Read public tier configuration
  const tiersContent = await Read("src/lib/auth/tiers.ts");
  const tierLimits = extractTierLimits(tiersContent);

  // ✅ Safe: Count total features
  const totalFeatures = Object.values(tierLimits).reduce(
    (sum, tier) => sum + tier.features.length,
    0,
  );

  // ✅ Safe: Identify protected routes
  const middlewareContent = await Read("src/middleware.ts");
  const protectedRoutes = extractProtectedRoutes(middlewareContent);

  // ✅ Safe: Generate recommendations
  const recommendations = generateRecommendations(tierLimits, protectedRoutes);

  return {
    totalFeatures,
    tierLimits,
    protectedRoutes,
    recommendations,
  };
}

function extractTierLimits(content: string) {
  // Parse tier configuration from file content
  // No secrets involved - this is public code
  return {
    // tier config here
  };
}

function extractProtectedRoutes(content: string): string[] {
  // Find all protected routes in middleware
  // No secrets involved - these are route definitions
  return [];
}

function generateRecommendations(tiers: object, routes: string[]): string[] {
  return [
    // Safe recommendations based on analysis
  ];
}

export default analyzeTierSystem;
```

## Common Skill Requests (Safe Versions)

### ❌ Don't: "Access Stripe API"

### ✅ Do: "Analyze Stripe integration code"

### ❌ Don't: "Get user payment data"

### ✅ Do: "Document the payment flow"

### ❌ Don't: "Modify webhook secrets"

### ✅ Do: "Validate webhook implementation"

### ❌ Don't: "Change API keys"

### ✅ Do: "Suggest API security improvements"

## Testing Your Skill

```bash
# 1. Run locally without secrets
npx tsx my-skill.ts

# 2. Check for secret leaks
grep -r "pk_test_\|sk_test_\|whsec_" src/
grep -r "process.env" my-skill.ts

# 3. Verify safe file access
grep -r "\.env\|getenv\|environ" my-skill.ts

# 4. Validate with Claude
# Ask Claude to review the code for security
```

## Resources

- [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md) - Safe integration guide
- [src/lib/auth/tiers.ts](./src/lib/auth/tiers.ts) - Public tier configuration
- [**tests**](.//__tests__) - Public test files (safe to run)
- [src/middleware.ts](./src/middleware.ts) - Route protection logic

## Summary

Safe Claude skills:

1. **Never access secrets** - Use .md documentation instead
2. **Read public code** - Analyze without modifying sensitive parts
3. **Run existing tests** - Validate without creating new ones
4. **Generate documentation** - Explain the system to users
5. **Suggest improvements** - Code analysis and recommendations
6. **Validate architecture** - Check patterns and best practices

---

**Last Updated:** January 2025
**Maintainer:** Security Team
**Status:** Active 🔒
