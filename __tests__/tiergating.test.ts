/**
 * TierGate Component Tests
 *
 * This test suite verifies:
 * - Feature access based on current user tier
 * - Proper blurring/hiding of content for locked features
 * - Upgrade prompts for insufficient tier
 * - Component rendering behavior
 */

import { canAccessFeature, TIER_LIMITS } from '../src/lib/auth/tiers';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
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
      `${colors.red}✗${colors.reset} ${name}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function assertTrue(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertFalse(condition: boolean, message?: string) {
  if (condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================================================
// TIERGATING LOGIC SIMULATION
// ============================================================================

interface TierGateProps {
  feature: string;
  currentTier: 'free' | 'pro' | 'max';
  requiredTier?: 'pro' | 'max';
  blurContent?: boolean;
}

interface TierGateRenderOutput {
  hasAccess: boolean;
  shouldBlur: boolean;
  shouldShowUpgradePrompt: boolean;
  upgradeMessage: string;
}

function simulateTierGateRender({
  feature,
  currentTier,
  requiredTier = 'pro',
  blurContent = true,
}: TierGateProps): TierGateRenderOutput {
  const hasAccess = canAccessFeature(currentTier, feature);

  if (hasAccess) {
    return {
      hasAccess: true,
      shouldBlur: false,
      shouldShowUpgradePrompt: false,
      upgradeMessage: '',
    };
  }

  // Determine upgrade message based on current tier and required tier
  const messages = {
    free: {
      pro: `Upgrade to Pro to unlock ${feature}`,
      max: `Upgrade to Max to unlock ${feature}`,
    },
    pro: {
      pro: `${feature} is not available in your plan`,
      max: `Upgrade to Max to unlock ${feature}`,
    },
    max: {
      pro: `${feature} is not available`,
      max: `${feature} is not available`,
    },
  };

  const upgradeMessage = messages[currentTier][requiredTier];

  return {
    hasAccess: false,
    shouldBlur: blurContent,
    shouldShowUpgradePrompt: true,
    upgradeMessage,
  };
}

// ============================================================================
// FEATURE ACCESS TESTS
// ============================================================================

console.log(`\n${colors.blue}=== TIERGATING TESTS ===${colors.reset}\n`);

test('Free user can access basic_trade_plan feature', () => {
  const result = simulateTierGateRender({
    feature: 'basic_trade_plan',
    currentTier: 'free',
  });

  assertTrue(result.hasAccess, 'Free user should have access');
  assertFalse(result.shouldBlur, 'Content should not be blurred');
  assertFalse(result.shouldShowUpgradePrompt, 'Should not show upgrade prompt');
});

test('Free user cannot access trade_journal feature', () => {
  const result = simulateTierGateRender({
    feature: 'trade_journal',
    currentTier: 'free',
  });

  assertFalse(result.hasAccess, 'Free user should not have access');
  assertTrue(result.shouldBlur, 'Content should be blurred');
  assertTrue(result.shouldShowUpgradePrompt, 'Should show upgrade prompt');
});

test('Free user sees correct upgrade message for Pro feature', () => {
  const result = simulateTierGateRender({
    feature: 'trade_journal',
    currentTier: 'free',
    requiredTier: 'pro',
  });

  assertTrue(
    result.upgradeMessage === 'Upgrade to Pro to unlock trade_journal',
    `Expected 'Upgrade to Pro to unlock trade_journal', got '${result.upgradeMessage}'`
  );
});

test('Free user sees correct upgrade message for Max feature', () => {
  const result = simulateTierGateRender({
    feature: 'alerts',
    currentTier: 'free',
    requiredTier: 'max',
  });

  assertTrue(
    result.upgradeMessage === 'Upgrade to Max to unlock alerts',
    `Expected 'Upgrade to Max to unlock alerts', got '${result.upgradeMessage}'`
  );
});

// ============================================================================
// PRO TIER GATING TESTS
// ============================================================================

console.log(`\n${colors.blue}=== PRO TIER GATING TESTS ===${colors.reset}\n`);

test('Pro user can access full_trade_plan feature', () => {
  const result = simulateTierGateRender({
    feature: 'full_trade_plan',
    currentTier: 'pro',
  });

  assertTrue(result.hasAccess, 'Pro user should have access');
  assertFalse(result.shouldBlur, 'Content should not be blurred');
  assertFalse(result.shouldShowUpgradePrompt, 'Should not show upgrade prompt');
});

test('Pro user can access trade_journal feature', () => {
  const result = simulateTierGateRender({
    feature: 'trade_journal',
    currentTier: 'pro',
  });

  assertTrue(result.hasAccess, 'Pro user should have access');
});

test('Pro user can access portfolio_risk feature', () => {
  const result = simulateTierGateRender({
    feature: 'portfolio_risk',
    currentTier: 'pro',
  });

  assertTrue(result.hasAccess, 'Pro user should have access');
});

test('Pro user cannot access hedge_suggestions (Max-only)', () => {
  const result = simulateTierGateRender({
    feature: 'hedge_suggestions',
    currentTier: 'pro',
    requiredTier: 'max',
  });

  assertFalse(result.hasAccess, 'Pro user should not have access to Max feature');
  assertTrue(result.shouldBlur, 'Content should be blurred');
  assertTrue(result.shouldShowUpgradePrompt, 'Should show upgrade prompt');
});

test('Pro user sees upgrade to Max message', () => {
  const result = simulateTierGateRender({
    feature: 'alerts',
    currentTier: 'pro',
    requiredTier: 'max',
  });

  assertTrue(
    result.upgradeMessage === 'Upgrade to Max to unlock alerts',
    `Expected upgrade message, got '${result.upgradeMessage}'`
  );
});

// ============================================================================
// MAX TIER GATING TESTS
// ============================================================================

console.log(`\n${colors.blue}=== MAX TIER GATING TESTS ===${colors.reset}\n`);

test('Max user can access all features', () => {
  const features = TIER_LIMITS.max.features;

  features.forEach((feature) => {
    const result = simulateTierGateRender({
      feature,
      currentTier: 'max',
    });

    assertTrue(result.hasAccess, `Max user should have access to ${feature}`);
  });
});

test('Max user can access hedge_suggestions', () => {
  const result = simulateTierGateRender({
    feature: 'hedge_suggestions',
    currentTier: 'max',
  });

  assertTrue(result.hasAccess, 'Max user should have access');
});

test('Max user can access raw_signals', () => {
  const result = simulateTierGateRender({
    feature: 'raw_signals',
    currentTier: 'max',
  });

  assertTrue(result.hasAccess, 'Max user should have access');
});

test('Max user can access api_access', () => {
  const result = simulateTierGateRender({
    feature: 'api_access',
    currentTier: 'max',
  });

  assertTrue(result.hasAccess, 'Max user should have access');
});

// ============================================================================
// BLUR CONTENT TESTS
// ============================================================================

console.log(`\n${colors.blue}=== BLUR CONTENT TESTS ===${colors.reset}\n`);

test('Content is blurred by default for locked features', () => {
  const result = simulateTierGateRender({
    feature: 'trade_journal',
    currentTier: 'free',
    blurContent: true,
  });

  assertTrue(result.shouldBlur, 'Content should be blurred by default');
});

test('Content is not blurred when blurContent=false', () => {
  const result = simulateTierGateRender({
    feature: 'trade_journal',
    currentTier: 'free',
    blurContent: false,
  });

  assertFalse(result.shouldBlur, 'Content should not be blurred when blurContent=false');
});

test('Content is not blurred for accessible features', () => {
  const result = simulateTierGateRender({
    feature: 'basic_trade_plan',
    currentTier: 'free',
    blurContent: true,
  });

  assertFalse(result.shouldBlur, 'Content should not be blurred for accessible features');
});

// ============================================================================
// REQUIRED TIER TESTS
// ============================================================================

console.log(`\n${colors.blue}=== REQUIRED TIER TESTS ===${colors.reset}\n`);

test('Free user sees Pro upgrade message for Pro-tier feature', () => {
  const result = simulateTierGateRender({
    feature: 'portfolio_risk',
    currentTier: 'free',
    requiredTier: 'pro',
  });

  assertTrue(
    result.upgradeMessage.includes('Pro'),
    'Message should mention Pro tier'
  );
  assertTrue(
    result.upgradeMessage.includes('portfolio_risk'),
    'Message should mention the feature'
  );
});

test('Free user sees Max upgrade message for Max-tier feature', () => {
  const result = simulateTierGateRender({
    feature: 'alerts',
    currentTier: 'free',
    requiredTier: 'max',
  });

  assertTrue(
    result.upgradeMessage.includes('Max'),
    'Message should mention Max tier'
  );
  assertTrue(
    result.upgradeMessage.includes('alerts'),
    'Message should mention the feature'
  );
});

// ============================================================================
// UPGRADE PROMPT EDGE CASES
// ============================================================================

console.log(`\n${colors.blue}=== UPGRADE PROMPT EDGE CASES ===${colors.reset}\n`);

test('Max user does not see upgrade prompt for existing Max-tier features', () => {
  const maxFeatures = TIER_LIMITS.max.features;

  maxFeatures.forEach((feature) => {
    const result = simulateTierGateRender({
      feature,
      currentTier: 'max',
    });

    assertFalse(
      result.shouldShowUpgradePrompt,
      `Max user should not see upgrade prompt for ${feature}`
    );
  });
});

test('User sees upgrade message even for nonexistent features', () => {
  const result = simulateTierGateRender({
    feature: 'nonexistent_feature',
    currentTier: 'free',
    requiredTier: 'pro',
  });

  assertTrue(
    result.upgradeMessage.includes('nonexistent_feature'),
    'Message should mention the requested feature'
  );
});

test('Pro user cannot downgrade to lower tier', () => {
  // This is more of a conceptual test - in the app, tier progression is always upward
  const proFeatures = TIER_LIMITS.pro.features;
  const freeFeatures = TIER_LIMITS.free.features;

  // All free features should be accessible to pro users (or their upgrades)
  freeFeatures.forEach((feature) => {
    const hasFeature = proFeatures.includes(feature);
    const hasUpgrade = proFeatures.includes(feature.replace('_limited', '_full'));

    assertTrue(
      hasFeature || hasUpgrade,
      `Pro user should have ${feature} or its upgrade`
    );
  });
});

// ============================================================================
// FEATURE AVAILABILITY SUMMARY
// ============================================================================

console.log(`\n${colors.blue}=== FEATURE AVAILABILITY SUMMARY ===${colors.reset}\n`);

const tierNames = ['free', 'pro', 'max'] as const;
const allFeatures = new Set<string>();

tierNames.forEach((tier) => {
  TIER_LIMITS[tier].features.forEach((f) => allFeatures.add(f));
});

console.log(`\nTotal unique features: ${allFeatures.size}`);
console.log(`Free tier features: ${TIER_LIMITS.free.features.length}`);
console.log(`Pro tier features: ${TIER_LIMITS.pro.features.length}`);
console.log(`Max tier features: ${TIER_LIMITS.max.features.length}`);

test('Feature count increases with tier', () => {
  assertTrue(
    TIER_LIMITS.pro.features.length > TIER_LIMITS.free.features.length,
    'Pro should have more features than Free'
  );
  assertTrue(
    TIER_LIMITS.max.features.length > TIER_LIMITS.pro.features.length,
    'Max should have more features than Pro'
  );
});

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
const total = results.length;

console.log(
  `\n${colors.blue}${'='.repeat(50)}${colors.reset}`
);
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
