/**
 * Tier-Based Access Control Tests
 *
 * This test suite verifies:
 * - Tier limits (analyses/day, scans/day, watchlists, etc.)
 * - Feature access control
 * - Timeframe access control
 * - Universe access control
 */

import {
  TIER_LIMITS,
  canAccessFeature,
  canAccessTimeframe,
  canAccessUniverse,
} from "../src/lib/auth/tiers";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(
      `${colors.red}✗${colors.reset} ${name}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function assertEqual(actual: unknown, expected: unknown, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, but got ${actual}`);
  }
}

function assertTrue(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function assertFalse(condition: boolean, message?: string) {
  if (condition) {
    throw new Error(message || "Assertion failed");
  }
}

// ============================================================================
// TIER LIMITS TESTS
// ============================================================================

console.log(`\n${colors.blue}=== TIER LIMITS TESTS ===${colors.reset}\n`);

test("Free tier: analysesPerDay should be 5", () => {
  assertEqual(TIER_LIMITS.free.analysesPerDay, 5);
});

test("Free tier: scansPerDay should be 1", () => {
  assertEqual(TIER_LIMITS.free.scansPerDay, 1);
});

test("Free tier: scanResultsLimit should be 5", () => {
  assertEqual(TIER_LIMITS.free.scanResultsLimit, 5);
});

test("Free tier: watchlistCount should be 1", () => {
  assertEqual(TIER_LIMITS.free.watchlistCount, 1);
});

test("Free tier: watchlistSymbolLimit should be 10", () => {
  assertEqual(TIER_LIMITS.free.watchlistSymbolLimit, 10);
});

test("Pro tier: analysesPerDay should be 50", () => {
  assertEqual(TIER_LIMITS.pro.analysesPerDay, 50);
});

test("Pro tier: scansPerDay should be 10", () => {
  assertEqual(TIER_LIMITS.pro.scansPerDay, 10);
});

test("Pro tier: watchlistCount should be 5", () => {
  assertEqual(TIER_LIMITS.pro.watchlistCount, 5);
});

test("Pro tier: watchlistSymbolLimit should be 50", () => {
  assertEqual(TIER_LIMITS.pro.watchlistSymbolLimit, 50);
});

test("Max tier: analysesPerDay should be Infinity", () => {
  assertEqual(TIER_LIMITS.max.analysesPerDay, Infinity);
});

test("Max tier: scansPerDay should be Infinity", () => {
  assertEqual(TIER_LIMITS.max.scansPerDay, Infinity);
});

test("Max tier: watchlistCount should be Infinity", () => {
  assertEqual(TIER_LIMITS.max.watchlistCount, Infinity);
});

test("Max tier: watchlistSymbolLimit should be Infinity", () => {
  assertEqual(TIER_LIMITS.max.watchlistSymbolLimit, Infinity);
});

// ============================================================================
// TIMEFRAME ACCESS TESTS
// ============================================================================

console.log(`\n${colors.blue}=== TIMEFRAME ACCESS TESTS ===${colors.reset}\n`);

test("Free tier: can access swing timeframe", () => {
  assertTrue(canAccessTimeframe("free", "swing"));
});

test("Free tier: cannot access day timeframe", () => {
  assertFalse(canAccessTimeframe("free", "day"));
});

test("Free tier: cannot access scalp timeframe", () => {
  assertFalse(canAccessTimeframe("free", "scalp"));
});

test("Pro tier: can access swing timeframe", () => {
  assertTrue(canAccessTimeframe("pro", "swing"));
});

test("Pro tier: can access day timeframe", () => {
  assertTrue(canAccessTimeframe("pro", "day"));
});

test("Pro tier: can access scalp timeframe", () => {
  assertTrue(canAccessTimeframe("pro", "scalp"));
});

test("Max tier: can access all timeframes", () => {
  assertTrue(canAccessTimeframe("max", "swing"));
  assertTrue(canAccessTimeframe("max", "day"));
  assertTrue(canAccessTimeframe("max", "scalp"));
});

// ============================================================================
// UNIVERSE ACCESS TESTS
// ============================================================================

console.log(`\n${colors.blue}=== UNIVERSE ACCESS TESTS ===${colors.reset}\n`);

test("Free tier: can access sp500", () => {
  assertTrue(canAccessUniverse("free", "sp500"));
});

test("Free tier: cannot access nasdaq100", () => {
  assertFalse(canAccessUniverse("free", "nasdaq100"));
});

test("Free tier: cannot access etf_large_cap", () => {
  assertFalse(canAccessUniverse("free", "etf_large_cap"));
});

test("Free tier: cannot access crypto", () => {
  assertFalse(canAccessUniverse("free", "crypto"));
});

test("Pro tier: can access sp500", () => {
  assertTrue(canAccessUniverse("pro", "sp500"));
});

test("Pro tier: can access nasdaq100", () => {
  assertTrue(canAccessUniverse("pro", "nasdaq100"));
});

test("Pro tier: can access etf_large_cap", () => {
  assertTrue(canAccessUniverse("pro", "etf_large_cap"));
});

test("Pro tier: cannot access crypto", () => {
  assertFalse(canAccessUniverse("pro", "crypto"));
});

test("Max tier: can access sp500", () => {
  assertTrue(canAccessUniverse("max", "sp500"));
});

test("Max tier: can access nasdaq100", () => {
  assertTrue(canAccessUniverse("max", "nasdaq100"));
});

test("Max tier: can access etf_large_cap", () => {
  assertTrue(canAccessUniverse("max", "etf_large_cap"));
});

test("Max tier: can access crypto", () => {
  assertTrue(canAccessUniverse("max", "crypto"));
});

// ============================================================================
// FEATURE ACCESS TESTS
// ============================================================================

console.log(`\n${colors.blue}=== FEATURE ACCESS TESTS ===${colors.reset}\n`);

// Free tier features
test("Free tier: can access basic_trade_plan", () => {
  assertTrue(canAccessFeature("free", "basic_trade_plan"));
});

test("Free tier: cannot access full_trade_plan", () => {
  assertFalse(canAccessFeature("free", "full_trade_plan"));
});

test("Free tier: cannot access trade_journal", () => {
  assertFalse(canAccessFeature("free", "trade_journal"));
});

test("Free tier: cannot access portfolio_risk", () => {
  assertFalse(canAccessFeature("free", "portfolio_risk"));
});

test("Free tier: cannot access alerts", () => {
  assertFalse(canAccessFeature("free", "alerts"));
});

test("Free tier: cannot access api_access", () => {
  assertFalse(canAccessFeature("free", "api_access"));
});

test("Free tier: cannot access export", () => {
  assertFalse(canAccessFeature("free", "export"));
});

// Pro tier features
test("Pro tier: can access full_trade_plan", () => {
  assertTrue(canAccessFeature("pro", "full_trade_plan"));
});

test("Pro tier: can access all_timeframes", () => {
  assertTrue(canAccessFeature("pro", "all_timeframes"));
});

test("Pro tier: can access portfolio_risk", () => {
  assertTrue(canAccessFeature("pro", "portfolio_risk"));
});

test("Pro tier: can access trade_journal", () => {
  assertTrue(canAccessFeature("pro", "trade_journal"));
});

test("Pro tier: cannot access hedge_suggestions", () => {
  assertFalse(canAccessFeature("pro", "hedge_suggestions"));
});

test("Pro tier: cannot access alerts", () => {
  assertFalse(canAccessFeature("pro", "alerts"));
});

test("Pro tier: cannot access api_access", () => {
  assertFalse(canAccessFeature("pro", "api_access"));
});

// Max tier features
test("Max tier: can access full_trade_plan", () => {
  assertTrue(canAccessFeature("max", "full_trade_plan"));
});

test("Max tier: can access all_timeframes", () => {
  assertTrue(canAccessFeature("max", "all_timeframes"));
});

test("Max tier: can access portfolio_risk", () => {
  assertTrue(canAccessFeature("max", "portfolio_risk"));
});

test("Max tier: can access trade_journal", () => {
  assertTrue(canAccessFeature("max", "trade_journal"));
});

test("Max tier: can access hedge_suggestions", () => {
  assertTrue(canAccessFeature("max", "hedge_suggestions"));
});

test("Max tier: can access raw_signals", () => {
  assertTrue(canAccessFeature("max", "raw_signals"));
});

test("Max tier: can access raw_indicators", () => {
  assertTrue(canAccessFeature("max", "raw_indicators"));
});

test("Max tier: can access alerts", () => {
  assertTrue(canAccessFeature("max", "alerts"));
});

test("Max tier: can access api_access", () => {
  assertTrue(canAccessFeature("max", "api_access"));
});

test("Max tier: can access export", () => {
  assertTrue(canAccessFeature("max", "export"));
});

// ============================================================================
// FEATURE PROGRESSIONS TESTS
// ============================================================================

console.log(
  `\n${colors.blue}=== FEATURE PROGRESSION TESTS ===${colors.reset}\n`,
);

const freeFeatures = TIER_LIMITS.free.features;
const proFeatures = TIER_LIMITS.pro.features;
const maxFeatures = TIER_LIMITS.max.features;

test("Pro tier should include all free tier features (or their upgraded versions)", () => {
  freeFeatures.forEach((feature) => {
    // Handle versioned features (e.g., morning_brief_limited -> morning_brief_full)
    const hasFeature = proFeatures.includes(feature);
    const hasUpgradedVersion = proFeatures.includes(
      feature.replace("_limited", "_full"),
    );

    assertTrue(
      hasFeature || hasUpgradedVersion,
      `Pro should include free feature: ${feature}`,
    );
  });
});

test("Max tier should include all pro tier features", () => {
  proFeatures.forEach((feature) => {
    assertTrue(
      maxFeatures.includes(feature),
      `Max should include pro feature: ${feature}`,
    );
  });
});

test("Pro tier should have more features than free", () => {
  assertTrue(
    proFeatures.length > freeFeatures.length,
    "Pro should have more features than free",
  );
});

test("Max tier should have more features than pro", () => {
  assertTrue(
    maxFeatures.length > proFeatures.length,
    "Max should have more features than pro",
  );
});

// ============================================================================
// LIMIT PROGRESSION TESTS
// ============================================================================

console.log(`\n${colors.blue}=== LIMIT PROGRESSION TESTS ===${colors.reset}\n`);

test("Pro tier analysesPerDay > Free tier analysesPerDay", () => {
  assertTrue(TIER_LIMITS.pro.analysesPerDay > TIER_LIMITS.free.analysesPerDay);
});

test("Max tier analysesPerDay >= Pro tier analysesPerDay", () => {
  assertTrue(TIER_LIMITS.max.analysesPerDay >= TIER_LIMITS.pro.analysesPerDay);
});

test("Pro tier scansPerDay > Free tier scansPerDay", () => {
  assertTrue(TIER_LIMITS.pro.scansPerDay > TIER_LIMITS.free.scansPerDay);
});

test("Max tier scansPerDay >= Pro tier scansPerDay", () => {
  assertTrue(TIER_LIMITS.max.scansPerDay >= TIER_LIMITS.pro.scansPerDay);
});

test("Pro tier watchlistCount > Free tier watchlistCount", () => {
  assertTrue(TIER_LIMITS.pro.watchlistCount > TIER_LIMITS.free.watchlistCount);
});

test("Max tier watchlistCount >= Pro tier watchlistCount", () => {
  assertTrue(TIER_LIMITS.max.watchlistCount >= TIER_LIMITS.pro.watchlistCount);
});

test("Pro tier scanResultsLimit > Free tier scanResultsLimit", () => {
  assertTrue(
    TIER_LIMITS.pro.scanResultsLimit > TIER_LIMITS.free.scanResultsLimit,
  );
});

test("Max tier scanResultsLimit >= Pro tier scanResultsLimit", () => {
  assertTrue(
    TIER_LIMITS.max.scanResultsLimit >= TIER_LIMITS.pro.scanResultsLimit,
  );
});

// ============================================================================
// UNIVERSE PROGRESSION TESTS
// ============================================================================

console.log(
  `\n${colors.blue}=== UNIVERSE PROGRESSION TESTS ===${colors.reset}\n`,
);

test("Pro tier should include all free tier universes", () => {
  TIER_LIMITS.free.universes.forEach((universe) => {
    assertTrue(
      TIER_LIMITS.pro.universes.includes(universe),
      `Pro should include free universe: ${universe}`,
    );
  });
});

test("Max tier should include all pro tier universes", () => {
  TIER_LIMITS.pro.universes.forEach((universe) => {
    assertTrue(
      TIER_LIMITS.max.universes.includes(universe),
      `Max should include pro universe: ${universe}`,
    );
  });
});

test("Pro tier should have more universes than free", () => {
  assertTrue(
    TIER_LIMITS.pro.universes.length > TIER_LIMITS.free.universes.length,
    "Pro should have more universes than free",
  );
});

test("Max tier should have more universes than pro", () => {
  assertTrue(
    TIER_LIMITS.max.universes.length > TIER_LIMITS.pro.universes.length,
    "Max should have more universes than pro",
  );
});

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
const total = results.length;

console.log(`\n${colors.blue}${"=".repeat(50)}${colors.reset}`);
console.log(`\n${colors.blue}TEST SUMMARY${colors.reset}`);
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
console.log(`Total: ${total}\n`);

if (failed > 0) {
  console.log(`${colors.red}Failed tests:${colors.reset}`);
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.log(`  - ${r.name}`);
      if (r.error) {
        console.log(`    ${colors.red}${r.error}${colors.reset}`);
      }
    });
  process.exit(1);
} else {
  console.log(`${colors.green}All tests passed! ✓${colors.reset}\n`);
  process.exit(0);
}
