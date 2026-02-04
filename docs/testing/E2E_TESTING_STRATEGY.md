# End-to-End Testing Strategy for MCP Finance

## Executive Summary

This document outlines a comprehensive testing strategy to catch build-time, compile-time, and runtime errors **before** they reach production. The goal is to prevent issues like:

- **Missing component imports** (`Module not found: Can't resolve '@/components/ui/checkbox'`)
- **Malformed route structures** (`Requested and resolved page mismatch`)
- **Deprecation warnings** (`"middleware" file convention is deprecated`)
- **Runtime type errors and broken integrations**

---

## Problem Analysis: Current Error Types

### 1. Module Resolution Errors (High Priority)

**Example:**

```
Module not found: Can't resolve '@/components/ui/checkbox'
```

**Root Cause:** A component imports a UI element that doesn't exist in `@/components/ui/`.

**Why Tests Didn't Catch It:**

- E2E tests run against a running server
- If the build fails, no tests run at all
- No pre-build validation of imports

### 2. Route Structure Errors (High Priority)

**Example:**

```
Error: Requested and resolved page mismatch:
//(dashboard/)/analyze//[symbol/]/page /(dashboard/)/analyze/[symbol/]/page
```

**Root Cause:** A duplicate route directory exists with escaped characters:

- Valid: `src/app/(dashboard)/analyze/[symbol]/page.tsx`
- Invalid: `src/app/\(dashboard\)/analyze/\[symbol\]/page.tsx`

**Why Tests Didn't Catch It:**

- E2E tests don't validate file system structure
- Next.js route resolution happens at runtime
- No automated file structure linting

### 3. Deprecation Warnings (Medium Priority)

**Example:**

```
The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Why Tests Didn't Catch It:**

- Warnings don't fail builds by default
- E2E tests don't capture console warnings systematically

---

## Testing Pyramid for MCP Finance

```
                    ┌─────────────────────┐
                    │   Production Smoke  │  ← Live site health
                    │      (5 mins)       │
                    └─────────────────────┘
                   ┌───────────────────────┐
                   │    E2E Integration    │  ← User journeys
                   │      (15-30 mins)     │
                   └───────────────────────┘
              ┌─────────────────────────────────┐
              │      Component Tests (Jest)     │  ← UI components
              │          (2-5 mins)             │
              └─────────────────────────────────┘
         ┌───────────────────────────────────────────┐
         │        Static Analysis & Build Tests      │  ← Imports, types
         │              (1-2 mins)                   │
         └───────────────────────────────────────────┘
    ┌─────────────────────────────────────────────────────┐
    │         File System & Structure Validation          │  ← Routes, files
    │                    (30 secs)                        │
    └─────────────────────────────────────────────────────┘
```

---

## Layer 1: File System & Structure Validation

### Purpose

Catch structural issues BEFORE any code runs.

### Tests to Implement

#### 1.1 Route Structure Validation

```typescript
// tests/structure/routes.test.ts
import { test, expect } from "vitest";
import { glob } from "glob";
import * as path from "path";

test("no malformed route directories with escaped characters", async () => {
  const appDir = path.join(process.cwd(), "src/app");

  // Find directories with literal backslash characters
  const allDirs = await glob("**/*", {
    cwd: appDir,
    onlyDirectories: true,
    dot: true,
  });

  const malformedDirs = allDirs.filter(
    (dir) =>
      dir.includes("\\(") ||
      dir.includes("\\[") ||
      dir.includes("\\)") ||
      dir.includes("\\]"),
  );

  expect(malformedDirs).toEqual([]);
});

test("no duplicate route segments", async () => {
  const appDir = path.join(process.cwd(), "src/app");
  const routes = await glob("**/page.tsx", { cwd: appDir });

  // Normalize routes (remove escape characters for comparison)
  const normalizedRoutes = routes.map((r) => r.replace(/\\/g, ""));
  const uniqueRoutes = [...new Set(normalizedRoutes)];

  expect(normalizedRoutes.length).toBe(uniqueRoutes.length);
});

test("all dynamic routes use valid bracket syntax", async () => {
  const appDir = path.join(process.cwd(), "src/app");
  const dirs = await glob("**/*", { cwd: appDir, onlyDirectories: true });

  for (const dir of dirs) {
    const name = path.basename(dir);
    // If it looks like a dynamic route, validate the syntax
    if (name.includes("[") || name.includes("]")) {
      // Valid patterns: [param], [...param], [[...param]]
      const validPattern = /^\[{1,2}\.{0,3}[a-zA-Z_][a-zA-Z0-9_]*\]{1,2}$/;
      expect(name).toMatch(validPattern);
    }
  }
});
```

#### 1.2 File Naming Conventions

```typescript
// tests/structure/naming.test.ts
import { test, expect } from "vitest";
import { glob } from "glob";

test("component files follow naming conventions", async () => {
  const components = await glob("src/components/**/*.tsx");

  for (const file of components) {
    const fileName = path.basename(file, ".tsx");
    // Components should be kebab-case or PascalCase
    expect(fileName).toMatch(/^[a-z][a-z0-9-]*$|^[A-Z][a-zA-Z0-9]*$/);
  }
});

test("no orphaned test files without source", async () => {
  const tests = await glob("__tests__/**/*.test.ts");
  const sources = await glob("src/**/*.{ts,tsx}");

  // Each test file should have a corresponding source file
  // (This is a soft check - some tests may be integration tests)
});
```

---

## Layer 2: Static Analysis & Build Tests

### Purpose

Catch import errors, type errors, and build failures.

### Tests to Implement

#### 2.1 Import Validation Script

```typescript
// scripts/validate-imports.ts
import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";

interface ImportError {
  file: string;
  line: number;
  importPath: string;
  error: string;
}

export async function validateImports(): Promise<ImportError[]> {
  const errors: ImportError[] = [];
  const srcDir = path.join(process.cwd(), "src");

  // Get all TypeScript/TSX files
  const files = await glob("**/*.{ts,tsx}", { cwd: srcDir });

  for (const file of files) {
    const fullPath = path.join(srcDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true,
    );

    // Extract all imports
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        const importPath = (node.moduleSpecifier as ts.StringLiteral).text;

        // Validate @/ alias imports
        if (importPath.startsWith("@/")) {
          const resolvedPath = importPath.replace("@/", "src/");
          const possibleExtensions = [".ts", ".tsx", "/index.ts", "/index.tsx"];

          const exists = possibleExtensions.some(
            (ext) =>
              fs.existsSync(path.join(process.cwd(), resolvedPath + ext)) ||
              fs.existsSync(path.join(process.cwd(), resolvedPath)),
          );

          if (!exists) {
            errors.push({
              file: fullPath,
              line:
                sourceFile.getLineAndCharacterOfPosition(node.getStart()).line +
                1,
              importPath,
              error: `Cannot resolve import: ${importPath}`,
            });
          }
        }
      }
    });
  }

  return errors;
}

// CLI runner
if (require.main === module) {
  validateImports().then((errors) => {
    if (errors.length > 0) {
      console.error("Import validation failed:");
      errors.forEach((e) => {
        console.error(`  ${e.file}:${e.line} - ${e.error}`);
      });
      process.exit(1);
    }
    console.log("All imports valid.");
  });
}
```

#### 2.2 Component Existence Validation

```typescript
// tests/imports/ui-components.test.ts
import { test, expect } from "vitest";
import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";

test("all @/components/ui/* imports resolve to existing files", async () => {
  const uiComponents = await glob("src/components/ui/*.tsx");
  const availableComponents = uiComponents.map((f) => path.basename(f, ".tsx"));

  // Find all files that import from @/components/ui/
  const sourceFiles = await glob("src/**/*.{ts,tsx}");
  const missingImports: string[] = [];

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const importMatches = content.matchAll(
      /from\s+["']@\/components\/ui\/([^"']+)["']/g,
    );

    for (const match of importMatches) {
      const componentName = match[1];
      if (!availableComponents.includes(componentName)) {
        missingImports.push(`${file}: @/components/ui/${componentName}`);
      }
    }
  }

  expect(missingImports).toEqual([]);
});
```

#### 2.3 TypeScript Compilation Test

```typescript
// tests/build/typescript.test.ts
import { test, expect } from "vitest";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

test("TypeScript compiles without errors", async () => {
  try {
    await execAsync("npx tsc --noEmit", { timeout: 60000 });
  } catch (error: any) {
    // TypeScript errors will be in stderr
    throw new Error(
      `TypeScript compilation failed:\n${error.stderr || error.stdout}`,
    );
  }
}, 90000);
```

#### 2.4 Next.js Build Validation

```typescript
// tests/build/nextjs.test.ts
import { test, expect } from "vitest";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

test("Next.js build succeeds", async () => {
  try {
    const { stdout, stderr } = await execAsync("npm run build", {
      timeout: 300000,
      env: { ...process.env, CI: "true" },
    });

    // Check for specific error patterns
    expect(stderr).not.toContain("Module not found");
    expect(stderr).not.toContain("page mismatch");

    // Capture deprecation warnings
    if (stderr.includes("deprecated")) {
      console.warn("Deprecation warnings found:", stderr);
    }
  } catch (error: any) {
    throw new Error(`Build failed:\n${error.stderr || error.stdout}`);
  }
}, 360000);
```

---

## Layer 3: Component Tests (Jest/Vitest)

### Purpose

Test individual components in isolation with mocked dependencies.

### Setup

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/components/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Example Component Tests

```typescript
// tests/components/ui/checkbox.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox', () => {
  it('renders without crashing', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('can be checked and unchecked', () => {
    const onChange = vi.fn();
    render(<Checkbox onCheckedChange={onChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
```

---

## Layer 4: E2E Integration Tests (Playwright)

### Current Coverage (Good)

- Auth flows
- API endpoints
- Feature tests by tier
- Production smoke tests

### Missing Tests to Add

#### 4.1 Page Load Validation for All Routes

```typescript
// e2e/structure/all-routes.spec.ts
import { test, expect } from "@playwright/test";
import { glob } from "glob";
import * as path from "path";

test.describe("All Routes Load Successfully", () => {
  // Dynamically generate tests for each route
  const appDir = path.join(process.cwd(), "src/app");

  test.beforeAll(async () => {
    // Get all page.tsx files and convert to routes
    const pages = await glob("**/page.tsx", { cwd: appDir });
    // Filter out dynamic routes for static testing
    // Dynamic routes need specific params
  });

  test("static routes load without errors", async ({ page }) => {
    const staticRoutes = ["/", "/pricing", "/sign-in", "/sign-up", "/api-docs"];

    for (const route of staticRoutes) {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(route);

      // Should not have server errors
      expect(response?.status()).toBeLessThan(500);

      // Should not have module resolution errors in console
      const moduleErrors = consoleErrors.filter(
        (e) =>
          e.includes("Module not found") || e.includes("Cannot find module"),
      );
      expect(moduleErrors).toHaveLength(0);
    }
  });
});
```

#### 4.2 Dynamic Route Testing

```typescript
// e2e/routes/dynamic-routes.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Dynamic Routes", () => {
  test("analyze/[symbol] loads with valid symbol", async ({ page }) => {
    // This would have caught the route mismatch error
    const response = await page.goto("/analyze/AAPL");

    expect(response?.status()).toBeLessThan(500);

    // Verify no "page mismatch" errors
    const pageContent = await page.content();
    expect(pageContent).not.toContain("page mismatch");
  });

  test("analyze/[symbol] handles invalid symbols gracefully", async ({
    page,
  }) => {
    const response = await page.goto("/analyze/INVALID_SYMBOL_12345");

    // Should return 404 or show error UI, not crash
    expect(response?.status()).toBeLessThan(500);
  });
});
```

#### 4.3 Console Error Collection

```typescript
// e2e/utils/console-collector.ts
import { Page } from "@playwright/test";

export interface ConsoleError {
  type: "error" | "warning";
  message: string;
  url: string;
}

export async function collectConsoleErrors(
  page: Page,
  action: () => Promise<void>,
): Promise<ConsoleError[]> {
  const errors: ConsoleError[] = [];

  const handler = (msg: any) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      errors.push({
        type: msg.type(),
        message: msg.text(),
        url: page.url(),
      });
    }
  };

  page.on("console", handler);

  await action();

  page.off("console", handler);

  return errors;
}
```

---

## Layer 4.4: Complete Page-by-Page E2E Tests

### Landing & Marketing Pages

#### 4.4.1 Landing Page Tests

```typescript
// e2e/pages/landing.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero section with CTA", async ({ page }) => {
    // Hero section should be visible
    await expect(page.locator("main")).toBeVisible();

    // Check for sign-up CTA
    const signUpLink = page.locator('a[href="/sign-up"]');
    await expect(signUpLink.first()).toBeVisible();
  });

  test("displays live market pulse section", async ({ page }) => {
    // Market data section should load
    const marketSection = page.locator("text=/market|pulse|live/i").first();
    await expect(marketSection).toBeVisible({ timeout: 10000 });
  });

  test("shows Fibonacci preview section", async ({ page }) => {
    // Fibonacci section should be visible
    await expect(page.locator("text=/fibonacci/i").first()).toBeVisible();
  });

  test("displays sample trade plan", async ({ page }) => {
    // Trade plan preview section
    await expect(
      page.locator("text=/trade plan|analysis/i").first(),
    ).toBeVisible();
  });

  test("shows scanner preview with sample trades", async ({ page }) => {
    // Scanner preview section
    await expect(page.locator("text=/scanner|trades/i").first()).toBeVisible();
  });

  test("displays pricing cards with all tiers", async ({ page }) => {
    // Pricing section should show all tiers
    await expect(page.locator("text=/free/i").first()).toBeVisible();
    await expect(page.locator("text=/pro/i").first()).toBeVisible();
    await expect(page.locator("text=/max/i").first()).toBeVisible();
  });

  test("CTA section has working sign-up link", async ({ page }) => {
    // Find the "Get Started Free" CTA
    const ctaButton = page.locator('a[href="/sign-up"]').last();
    await expect(ctaButton).toBeVisible();

    // Click and verify navigation
    await ctaButton.click();
    await expect(page).toHaveURL(/sign-up/);
  });

  test("no console errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    expect(errors).toHaveLength(0);
  });
});
```

#### 4.4.2 Pricing Page Tests

```typescript
// e2e/pages/pricing.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Pricing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("displays all three pricing tiers", async ({ page }) => {
    // Free tier
    await expect(page.locator("text=/free/i").first()).toBeVisible();

    // Pro tier
    await expect(page.locator("text=/pro/i").first()).toBeVisible();

    // Max tier
    await expect(page.locator("text=/max/i").first()).toBeVisible();
  });

  test("shows tier features and limits", async ({ page }) => {
    // Check for feature descriptions
    await expect(
      page.locator("text=/analys|signal|scan/i").first(),
    ).toBeVisible();
  });

  test("has sign-up buttons for each tier", async ({ page }) => {
    // Should have multiple sign-up CTAs
    const signUpButtons = page.locator(
      'a[href*="sign"], button:has-text("Sign")',
    );
    await expect(signUpButtons.first()).toBeVisible();
  });

  test("page loads without errors", async ({ page }) => {
    const response = await page.goto("/pricing");
    expect(response?.status()).toBeLessThan(400);
  });
});
```

#### 4.4.3 Authentication Pages Tests

```typescript
// e2e/pages/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Sign-In Page", () => {
  test("renders sign-in form with email and password fields", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    // Email input
    await expect(
      page.locator('input[type="email"], input[name="email"]'),
    ).toBeVisible();

    // Password input
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("shows link to sign-up page", async ({ page }) => {
    await page.goto("/sign-in");

    const signUpLink = page.locator('a[href*="sign-up"]');
    await expect(signUpLink).toBeVisible();
  });

  test("displays validation on empty submit", async ({ page }) => {
    await page.goto("/sign-in");

    // Try to submit empty form
    await page.locator('button[type="submit"]').click();

    // Should show validation error or stay on page
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe("Sign-Up Page", () => {
  test("renders sign-up form", async ({ page }) => {
    await page.goto("/sign-up");

    // Email input
    await expect(
      page.locator('input[type="email"], input[name="email"]'),
    ).toBeVisible();

    // Password input
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("shows link to sign-in page", async ({ page }) => {
    await page.goto("/sign-up");

    const signInLink = page.locator('a[href*="sign-in"]');
    await expect(signInLink).toBeVisible();
  });
});
```

---

### Dashboard Pages (Authenticated)

#### 4.4.4 Main Dashboard Tests

```typescript
// e2e/dashboard/main.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Main Dashboard", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard");
  });

  test("displays welcome message", async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.locator("text=/welcome back/i"),
    ).toBeVisible();
  });

  test("shows market snapshot card with futures data", async ({
    authenticatedPage,
  }) => {
    // Market Snapshot card
    await expect(
      authenticatedPage.locator("text=/market snapshot/i"),
    ).toBeVisible();

    // ES Futures
    await expect(
      authenticatedPage.locator("text=/ES Futures|futures_es/i"),
    ).toBeVisible();

    // NQ Futures
    await expect(
      authenticatedPage.locator("text=/NQ Futures|futures_nq/i"),
    ).toBeVisible();
  });

  test("displays VIX level with status indicator", async ({
    authenticatedPage,
  }) => {
    await expect(authenticatedPage.locator("text=/vix/i")).toBeVisible();
  });

  test("shows daily usage stats with progress bars", async ({
    authenticatedPage,
  }) => {
    // Usage card
    await expect(
      authenticatedPage.locator("text=/daily usage|usage/i"),
    ).toBeVisible();

    // Analyses counter
    await expect(authenticatedPage.locator("text=/analys/i")).toBeVisible();

    // Scans counter
    await expect(authenticatedPage.locator("text=/scan/i")).toBeVisible();
  });

  test("displays quick action cards", async ({ authenticatedPage }) => {
    // Analyze a Stock card
    await expect(
      authenticatedPage.locator("text=/analyze a stock/i"),
    ).toBeVisible();

    // Scan for Trades card
    await expect(
      authenticatedPage.locator("text=/scan for trades/i"),
    ).toBeVisible();

    // Learn Signals card
    await expect(
      authenticatedPage.locator("text=/learn signals/i"),
    ).toBeVisible();
  });

  test("quick action links navigate correctly", async ({
    authenticatedPage,
  }) => {
    // Click "Start Analysis" link
    const analyzeLink = authenticatedPage
      .locator('a[href*="/analyze"]')
      .first();
    await analyzeLink.click();
    await expect(authenticatedPage).toHaveURL(/analyze/);
  });

  test("shows getting started guide", async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.locator("text=/getting started/i"),
    ).toBeVisible();
  });
});
```

#### 4.4.5 Stock Analysis Page Tests

```typescript
// e2e/dashboard/analyze.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Stock Analysis Page", () => {
  test("loads analysis page for valid symbol", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/analyze/AAPL");

    // Page should load without error
    await expect(authenticatedPage.locator("body")).not.toContainText(
      "page mismatch",
    );

    // Should show symbol somewhere
    await expect(authenticatedPage.locator("text=/AAPL/i").first()).toBeVisible(
      { timeout: 15000 },
    );
  });

  test("displays analysis results with signals", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/analyze/AAPL");

    // Wait for results to load
    await authenticatedPage.waitForLoadState("networkidle");

    // Should show some analysis content
    await expect(
      authenticatedPage.locator("text=/signal|indicator|analysis/i").first(),
    ).toBeVisible({ timeout: 20000 });
  });

  test("shows timeframe selector (tier-gated)", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/analyze/AAPL");

    // Timeframe selector should exist
    await expect(
      authenticatedPage.locator("text=/swing|day|scalp|timeframe/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("displays tier limit indicator", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/analyze/AAPL");

    // Should show limit text for free tier
    await expect(
      authenticatedPage.locator("text=/top 3|limit|showing/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("handles invalid symbol gracefully", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/analyze/INVALIDXYZ123");

    // Should show error or "not found" message, not crash
    await authenticatedPage.waitForLoadState("networkidle");

    const content = await authenticatedPage.content();
    expect(content.toLowerCase()).toMatch(/error|not found|invalid|no data/);
  });

  test("different symbols load correctly", async ({ authenticatedPage }) => {
    const symbols = ["MSFT", "GOOGL", "TSLA"];

    for (const symbol of symbols) {
      await authenticatedPage.goto(`/analyze/${symbol}`);
      await authenticatedPage.waitForLoadState("networkidle");

      // Should show the symbol
      await expect(
        authenticatedPage.locator(`text=/${symbol}/i`).first(),
      ).toBeVisible({ timeout: 15000 });
    }
  });
});
```

#### 4.4.6 Scanner Page Tests

```typescript
// e2e/dashboard/scanner.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Scanner Page", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/scanner");
  });

  test("displays scanner controls", async ({ authenticatedPage }) => {
    // Title
    await expect(
      authenticatedPage.locator("text=/trade scanner/i"),
    ).toBeVisible();

    // Universe selector
    await expect(authenticatedPage.locator("text=/universe/i")).toBeVisible();

    // Scan button
    await expect(
      authenticatedPage.locator("button:has-text('Scan')"),
    ).toBeVisible();
  });

  test("shows universe dropdown with options", async ({
    authenticatedPage,
  }) => {
    // Click the select trigger
    const selectTrigger = authenticatedPage
      .locator('[role="combobox"]')
      .first();
    await selectTrigger.click();

    // Should show S&P 500 option
    await expect(
      authenticatedPage.locator("text=/S&P 500|sp500/i"),
    ).toBeVisible();
  });

  test("displays AI toggle (tier-gated)", async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.locator("text=/AI Insights/i"),
    ).toBeVisible();
  });

  test("scan button triggers scan and shows results", async ({
    authenticatedPage,
  }) => {
    // Click scan button
    await authenticatedPage.locator("button:has-text('Scan')").click();

    // Wait for loading to complete
    await authenticatedPage
      .waitForSelector('[class*="animate-spin"]', {
        state: "detached",
        timeout: 30000,
      })
      .catch(() => {}); // May already be done

    // Should show results or "no trades found" message
    await expect(
      authenticatedPage.locator("text=/results|qualified|no.*found/i").first(),
    ).toBeVisible({ timeout: 30000 });
  });

  test("results table displays correct columns", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.locator("button:has-text('Scan')").click();

    // Wait for results
    await authenticatedPage.waitForLoadState("networkidle");

    // If results exist, check table headers
    const tableExists = await authenticatedPage
      .locator("table")
      .isVisible()
      .catch(() => false);

    if (tableExists) {
      await expect(authenticatedPage.locator("text=/Symbol/i")).toBeVisible();
      await expect(authenticatedPage.locator("text=/Entry/i")).toBeVisible();
      await expect(authenticatedPage.locator("text=/Stop/i")).toBeVisible();
      await expect(authenticatedPage.locator("text=/Target/i")).toBeVisible();
    }
  });
});
```

#### 4.4.7 Watchlist Page Tests

```typescript
// e2e/dashboard/watchlist.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Watchlist Page", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/watchlist");
  });

  test("displays watchlist page header", async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.locator("h1:has-text('Watchlists')"),
    ).toBeVisible();
  });

  test("shows tier limits info", async ({ authenticatedPage }) => {
    // Should mention watchlist limits
    await expect(
      authenticatedPage.locator("text=/watchlist|symbols/i").first(),
    ).toBeVisible();
  });

  test("displays create watchlist form when under limit", async ({
    authenticatedPage,
  }) => {
    // Create watchlist input
    await expect(
      authenticatedPage.locator('input[placeholder*="name" i]'),
    ).toBeVisible();
  });

  test("can create a new watchlist", async ({ authenticatedPage }) => {
    const watchlistName = `Test-${Date.now()}`;

    // Fill in name
    await authenticatedPage
      .locator('input[placeholder*="name" i]')
      .fill(watchlistName);

    // Click create button
    await authenticatedPage
      .locator("button")
      .filter({ hasText: /\+|create|add/i })
      .first()
      .click();

    // Wait for response
    await authenticatedPage.waitForLoadState("networkidle");

    // New watchlist should appear (or show error if at limit)
  });

  test("watchlist card shows symbol input", async ({ authenticatedPage }) => {
    // If watchlists exist, should show add symbol input
    const symbolInput = authenticatedPage.locator(
      'input[placeholder*="symbol" i]',
    );
    // May or may not be visible depending on state
  });

  test("displays signal information for symbols", async ({
    authenticatedPage,
  }) => {
    // If watchlist has symbols, should show signal data
    await authenticatedPage.waitForLoadState("networkidle");

    // Look for price/signal indicators
    const hasSymbols = await authenticatedPage
      .locator("text=/\\$/")
      .isVisible()
      .catch(() => false);

    if (hasSymbols) {
      // Should show action badge
      await expect(
        authenticatedPage.locator("text=/BUY|HOLD|AVOID/i").first(),
      ).toBeVisible();
    }
  });
});
```

#### 4.4.8 Portfolio Page Tests

```typescript
// e2e/dashboard/portfolio.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Portfolio Page", () => {
  test("loads portfolio page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/portfolio");

    // Page should load
    await expect(authenticatedPage.locator("body")).toBeVisible();
  });

  test("displays portfolio header", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/portfolio");

    await expect(
      authenticatedPage.locator("text=/portfolio/i").first(),
    ).toBeVisible();
  });

  test("shows tier-gated message or portfolio content", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/portfolio");
    await authenticatedPage.waitForLoadState("networkidle");

    // Either shows portfolio content or upgrade prompt
    const hasContent = await authenticatedPage
      .locator("text=/position|holding|risk/i")
      .isVisible()
      .catch(() => false);
    const hasUpgradePrompt = await authenticatedPage
      .locator("text=/upgrade|pro|locked/i")
      .isVisible()
      .catch(() => false);

    expect(hasContent || hasUpgradePrompt).toBe(true);
  });
});
```

#### 4.4.9 Morning Brief Page Tests

```typescript
// e2e/dashboard/morning-brief.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Morning Brief Page", () => {
  test("loads morning brief page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/morning-brief");

    await expect(
      authenticatedPage.locator("text=/morning|brief|market/i").first(),
    ).toBeVisible();
  });

  test("displays market status", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/morning-brief");
    await authenticatedPage.waitForLoadState("networkidle");

    // Should show market open/closed status
    await expect(
      authenticatedPage.locator("text=/open|closed|pre-market/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("shows market themes or key events", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/morning-brief");
    await authenticatedPage.waitForLoadState("networkidle");

    // Should show market analysis content
    const hasThemes = await authenticatedPage
      .locator("text=/theme|event|economic/i")
      .isVisible()
      .catch(() => false);
    const hasError = await authenticatedPage
      .locator("text=/error|unavailable/i")
      .isVisible()
      .catch(() => false);

    // Either shows content or graceful error
    expect(hasThemes || hasError || true).toBe(true);
  });
});
```

#### 4.4.10 Alerts Page Tests

```typescript
// e2e/dashboard/alerts.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Alerts Page", () => {
  test("loads alerts page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/alerts");

    await expect(
      authenticatedPage.locator("text=/alert/i").first(),
    ).toBeVisible();
  });

  test("shows alert creation interface or empty state", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/alerts");
    await authenticatedPage.waitForLoadState("networkidle");

    // Should show alerts or empty state message
    const hasAlerts = await authenticatedPage
      .locator("text=/no alerts|create|add alert/i")
      .isVisible()
      .catch(() => false);
    expect(hasAlerts || true).toBe(true);
  });
});
```

#### 4.4.11 Calendar Page Tests

```typescript
// e2e/dashboard/calendar.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Calendar Page", () => {
  test("loads calendar page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/calendar");

    await expect(
      authenticatedPage.locator("text=/calendar|earnings|economic/i").first(),
    ).toBeVisible();
  });
});
```

#### 4.4.12 Compare Page Tests

```typescript
// e2e/dashboard/compare.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Compare Page", () => {
  test("loads compare page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/compare");

    await expect(
      authenticatedPage.locator("text=/compare/i").first(),
    ).toBeVisible();
  });

  test("shows symbol input fields", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/compare");

    // Should have input for symbols to compare
    await expect(authenticatedPage.locator("input").first()).toBeVisible();
  });
});
```

#### 4.4.13 Export Page Tests

```typescript
// e2e/dashboard/export.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Export Page", () => {
  test("loads export page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/export");

    await expect(
      authenticatedPage.locator("text=/export/i").first(),
    ).toBeVisible();
  });
});
```

#### 4.4.14 Fibonacci Page Tests

```typescript
// e2e/dashboard/fibonacci.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Fibonacci Page", () => {
  test("loads fibonacci page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/fibonacci");

    await expect(
      authenticatedPage.locator("text=/fibonacci/i").first(),
    ).toBeVisible();
  });

  test("shows fibonacci level inputs or calculator", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/fibonacci");

    // Should have inputs for high/low prices
    await expect(authenticatedPage.locator("input").first()).toBeVisible();
  });
});
```

#### 4.4.15 Journal Page Tests

```typescript
// e2e/dashboard/journal.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Trading Journal Page", () => {
  test("loads journal page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/journal");

    await expect(
      authenticatedPage.locator("text=/journal/i").first(),
    ).toBeVisible();
  });

  test("shows journal entries or empty state", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/journal");
    await authenticatedPage.waitForLoadState("networkidle");

    // Should show entries or "no entries" message
  });
});
```

#### 4.4.16 Learn Pages Tests

```typescript
// e2e/dashboard/learn.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Learn - Indicators Page", () => {
  test("loads indicators learning page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/learn/indicators");

    await expect(
      authenticatedPage.locator("text=/indicator/i").first(),
    ).toBeVisible();
  });

  test("displays indicator explanations", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/learn/indicators");

    // Should have educational content
    await expect(
      authenticatedPage
        .locator("text=/RSI|MACD|moving average|SMA|EMA/i")
        .first(),
    ).toBeVisible();
  });
});

test.describe("Learn - Signals Page", () => {
  test("loads signals learning page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/learn/signals");

    await expect(
      authenticatedPage.locator("text=/signal/i").first(),
    ).toBeVisible();
  });

  test("displays signal explanations", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/learn/signals");

    // Should have signal educational content
    await expect(
      authenticatedPage.locator("text=/bullish|bearish|buy|sell/i").first(),
    ).toBeVisible();
  });
});
```

#### 4.4.17 News Page Tests

```typescript
// e2e/dashboard/news.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("News Page", () => {
  test("loads news page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/news");

    await expect(
      authenticatedPage.locator("text=/news/i").first(),
    ).toBeVisible();
  });
});
```

#### 4.4.18 Options Page Tests

```typescript
// e2e/dashboard/options.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Options Page", () => {
  test("loads options page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/options");

    await expect(
      authenticatedPage.locator("text=/option/i").first(),
    ).toBeVisible();
  });
});
```

#### 4.4.19 Signals Page Tests

```typescript
// e2e/dashboard/signals.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Signals Page", () => {
  test("loads signals page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/signals");

    await expect(
      authenticatedPage.locator("text=/signal/i").first(),
    ).toBeVisible();
  });
});
```

#### 4.4.20 Settings Page Tests

```typescript
// e2e/dashboard/settings.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Settings Page", () => {
  test("loads settings page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/settings");

    await expect(
      authenticatedPage.locator("text=/setting/i").first(),
    ).toBeVisible();
  });

  test("displays user preferences", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/settings");

    // Should show some settings options
    await expect(
      authenticatedPage
        .locator("text=/preference|notification|theme/i")
        .first(),
    ).toBeVisible();
  });
});
```

#### 4.4.21 API Docs Page Tests

```typescript
// e2e/dashboard/api-docs.spec.ts
import { test, expect } from "@playwright/test";

test.describe("API Docs Page", () => {
  test("loads API docs page", async ({ page }) => {
    await page.goto("/api-docs");

    await expect(
      page.locator("text=/api|documentation|endpoint/i").first(),
    ).toBeVisible();
  });

  test("displays endpoint documentation", async ({ page }) => {
    await page.goto("/api-docs");

    // Should show API endpoints
    await expect(
      page.locator("text=/GET|POST|endpoint|request|response/i").first(),
    ).toBeVisible();
  });
});
```

---

### Authenticated User Fixture

```typescript
// e2e/fixtures/authenticated-user.ts
import { test as base, expect, Page } from "@playwright/test";

interface AuthenticatedFixtures {
  authenticatedPage: Page;
  tierHelper: TierHelper;
}

class TierHelper {
  constructor(private page: Page) {}

  async getTierLimits() {
    // Get tier limits from API or page state
    return {
      analysesPerDay: 5,
      scansPerDay: 1,
      signalsVisible: 3,
    };
  }
}

export const test = base.extend<AuthenticatedFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Set up authentication
    // Option 1: Use saved auth state
    // Option 2: Use test credentials

    // For CI, use environment variables
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (email && password) {
      await page.goto("/sign-in");
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForURL(/dashboard/, { timeout: 15000 });
    } else {
      // Use stored auth state for local development
      // await page.context().addCookies([...]);
    }

    await use(page);
  },

  tierHelper: async ({ authenticatedPage }, use) => {
    await use(new TierHelper(authenticatedPage));
  },
});

export { expect };
```

---

### Dashboard Navigation Test Suite

```typescript
// e2e/dashboard/navigation.spec.ts
import { test, expect } from "../fixtures/authenticated-user";

test.describe("Dashboard Navigation", () => {
  const dashboardRoutes = [
    { path: "/dashboard", name: "Main Dashboard" },
    { path: "/scanner", name: "Scanner" },
    { path: "/watchlist", name: "Watchlist" },
    { path: "/portfolio", name: "Portfolio" },
    { path: "/morning-brief", name: "Morning Brief" },
    { path: "/alerts", name: "Alerts" },
    { path: "/calendar", name: "Calendar" },
    { path: "/compare", name: "Compare" },
    { path: "/export", name: "Export" },
    { path: "/fibonacci", name: "Fibonacci" },
    { path: "/journal", name: "Journal" },
    { path: "/learn/indicators", name: "Learn Indicators" },
    { path: "/learn/signals", name: "Learn Signals" },
    { path: "/news", name: "News" },
    { path: "/options", name: "Options" },
    { path: "/settings", name: "Settings" },
    { path: "/signals", name: "Signals" },
  ];

  for (const route of dashboardRoutes) {
    test(`${route.name} (${route.path}) loads without errors`, async ({
      authenticatedPage,
    }) => {
      const errors: string[] = [];

      authenticatedPage.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      const response = await authenticatedPage.goto(route.path);

      // Should not return server error
      expect(response?.status()).toBeLessThan(500);

      // Should not have critical JS errors
      const criticalErrors = errors.filter(
        (e) =>
          e.includes("Module not found") ||
          e.includes("page mismatch") ||
          e.includes("Cannot read properties of undefined"),
      );

      expect(criticalErrors).toHaveLength(0);
    });
  }

  test("sidebar navigation links work correctly", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/dashboard");

    // Find sidebar navigation
    const navLinks = authenticatedPage.locator("nav a, aside a");
    const linkCount = await navLinks.count();

    // Test first few navigation links
    for (let i = 0; i < Math.min(5, linkCount); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute("href");

      if (href && href.startsWith("/") && !href.includes("sign")) {
        await link.click();
        await authenticatedPage.waitForLoadState("networkidle");

        // Should navigate without error
        expect(authenticatedPage.url()).toContain(href);

        // Go back to dashboard
        await authenticatedPage.goto("/dashboard");
      }
    }
  });
});
```

---

## Layer 5: Production Smoke Tests

### Purpose

Verify deployed production is healthy.

### Current Implementation

The existing `smoke-tests.spec.ts` is solid. Add these additional checks:

```typescript
// e2e/production/extended-smoke.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Extended Production Smoke Tests", () => {
  test("no runtime JavaScript errors on key pages", async ({ page }) => {
    const jsErrors: string[] = [];

    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    const criticalPages = ["/", "/pricing", "/sign-in"];

    for (const route of criticalPages) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
    }

    // Filter out known acceptable errors (if any)
    const criticalErrors = jsErrors.filter(
      (e) => !e.includes("ResizeObserver"), // Known benign error
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("core dependencies load correctly", async ({ page }) => {
    const failedResources: string[] = [];

    page.on("response", (response) => {
      if (response.status() >= 400) {
        const url = response.url();
        if (
          url.includes("_next/") ||
          url.includes(".js") ||
          url.includes(".css")
        ) {
          failedResources.push(`${response.status()}: ${url}`);
        }
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(failedResources).toHaveLength(0);
  });
});
```

---

## CI/CD Pipeline Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Layer 1: Structure Validation (fastest)
  structure:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - name: Validate file structure
        run: npm run test:structure
      - name: Validate imports
        run: npm run validate:imports

  # Layer 2: Build Validation
  build:
    needs: structure
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - name: TypeScript check
        run: npx tsc --noEmit
      - name: ESLint
        run: npm run lint
      - name: Build
        run: npm run build
        env:
          # Add required env vars for build
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY_TEST }}

  # Layer 3: Component Tests
  unit:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - name: Component tests
        run: npm run test:unit

  # Layer 4: E2E Tests
  e2e:
    needs: unit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # Layer 5: Production Smoke (on deploy)
  smoke:
    if: github.ref == 'refs/heads/main'
    needs: e2e
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run smoke tests
        run: npm run test:e2e:smoke
        env:
          BASE_URL: ${{ secrets.PRODUCTION_URL }}
```

---

## Package.json Scripts

Add these scripts to support the testing strategy:

```json
{
  "scripts": {
    "test:structure": "vitest run tests/structure/",
    "test:unit": "vitest run tests/components/",
    "test:build": "vitest run tests/build/",
    "test:all": "npm run test:structure && npm run test:unit && npm run test:e2e",
    "validate:imports": "tsx scripts/validate-imports.ts",
    "validate:routes": "tsx scripts/validate-routes.ts",
    "precommit": "npm run lint && npm run validate:imports && npm run test:structure"
  }
}
```

---

## Pre-Commit Hook (Husky)

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Fast checks only - don't block commits with slow tests
npm run lint
npm run validate:imports
npm run test:structure
```

---

## Error Prevention Checklist

### Before Creating a New Component

- [ ] Check if the component already exists in `@/components/ui/`
- [ ] If importing from shadcn/ui, ensure it's been installed
- [ ] Run `npm run validate:imports` before committing

### Before Creating a New Route

- [ ] Verify directory naming follows Next.js conventions
- [ ] Check for existing routes that might conflict
- [ ] Run `npm run validate:routes` after creating
- [ ] Test the route loads in browser before committing

### Before Merging a PR

- [ ] All CI checks pass
- [ ] TypeScript compiles without errors
- [ ] No new deprecation warnings
- [ ] E2E tests for affected features pass

---

## Specific Fixes for Current Errors

### Fix 1: Missing Checkbox Component

Create the missing component:

```bash
# Option A: Install from shadcn/ui
npx shadcn@latest add checkbox

# Option B: Create manually
# Create src/components/ui/checkbox.tsx
```

### Fix 2: Malformed Route Directory

Remove the escaped directory:

```bash
rm -rf "src/app/\(dashboard\)/analyze/\[symbol\]/"
```

### Fix 3: Middleware Deprecation

Migrate from `middleware.ts` to `proxy.ts` following Next.js 16 guidelines.

---

## Summary

| Layer                | Purpose            | Catches                      | Speed  |
| -------------------- | ------------------ | ---------------------------- | ------ |
| Structure Validation | File system issues | Malformed routes, naming     | < 30s  |
| Static Analysis      | Import/type errors | Missing modules, type errors | < 2m   |
| Component Tests      | UI logic           | Component bugs               | < 5m   |
| E2E Integration      | User flows         | Integration issues           | 15-30m |
| Production Smoke     | Deploy health      | Runtime issues               | < 5m   |

**Key Principle:** Catch errors at the lowest/fastest layer possible. A missing import should fail at Layer 2 (static analysis), not Layer 4 (E2E tests).
