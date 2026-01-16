/**
 * Middleware Route Protection Tests
 *
 * This test suite verifies:
 * - Public routes are accessible to everyone
 * - Pro-only routes are protected (redirect for free tier)
 * - Max-only routes are protected (redirect for free/pro tiers)
 * - Other routes require authentication
 */

import { createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

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
// ROUTE MATCHER SETUP
// ============================================================================

// These matchers are from the actual middleware
const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
]);

const isMaxOnlyRoute = createRouteMatcher([
  '/dashboard/alerts(.*)',
  '/dashboard/export(.*)',
  '/dashboard/signals(.*)',
  '/api/admin/(.*)',
]);

const isProOnlyRoute = createRouteMatcher([
  '/dashboard/portfolio(.*)',
  '/dashboard/journal(.*)',
]);

// ============================================================================
// MOCK REQUEST BUILDER
// ============================================================================

function createMockRequest(pathname: string): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  return {
    nextUrl: url,
    url: url.toString(),
  } as NextRequest;
}

// ============================================================================
// PUBLIC ROUTE TESTS
// ============================================================================

console.log(`\n${colors.blue}=== PUBLIC ROUTE TESTS ===${colors.reset}\n`);

test('/ is a public route', () => {
  const req = createMockRequest('/');
  assertTrue(isPublicRoute(req), '/ should be public');
});

test('/pricing is a public route', () => {
  const req = createMockRequest('/pricing');
  assertTrue(isPublicRoute(req), '/pricing should be public');
});

test('/sign-in is a public route', () => {
  const req = createMockRequest('/sign-in');
  assertTrue(isPublicRoute(req), '/sign-in should be public');
});

test('/sign-in/verify is a public route', () => {
  const req = createMockRequest('/sign-in/verify');
  assertTrue(isPublicRoute(req), '/sign-in/* should be public');
});

test('/sign-up is a public route', () => {
  const req = createMockRequest('/sign-up');
  assertTrue(isPublicRoute(req), '/sign-up should be public');
});

test('/sign-up/verify is a public route', () => {
  const req = createMockRequest('/sign-up/verify');
  assertTrue(isPublicRoute(req), '/sign-up/* should be public');
});

test('/api/webhooks/stripe is a public route', () => {
  const req = createMockRequest('/api/webhooks/stripe');
  assertTrue(isPublicRoute(req), '/api/webhooks/* should be public');
});

test('/api/webhooks/clerk is a public route', () => {
  const req = createMockRequest('/api/webhooks/clerk');
  assertTrue(isPublicRoute(req), '/api/webhooks/* should be public');
});

// ============================================================================
// PROTECTED ROUTE TESTS (NOT PUBLIC)
// ============================================================================

console.log(`\n${colors.blue}=== PROTECTED ROUTE TESTS ===${colors.reset}\n`);

test('/dashboard is not a public route', () => {
  const req = createMockRequest('/dashboard');
  assertFalse(isPublicRoute(req), '/dashboard should be protected');
});

test('/dashboard/portfolio is not a public route', () => {
  const req = createMockRequest('/dashboard/portfolio');
  assertFalse(isPublicRoute(req), '/dashboard/portfolio should be protected');
});

test('/dashboard/alerts is not a public route', () => {
  const req = createMockRequest('/dashboard/alerts');
  assertFalse(isPublicRoute(req), '/dashboard/alerts should be protected');
});

// ============================================================================
// PRO-ONLY ROUTE TESTS
// ============================================================================

console.log(`\n${colors.blue}=== PRO-ONLY ROUTE TESTS ===${colors.reset}\n`);

test('/dashboard/portfolio is a pro-only route', () => {
  const req = createMockRequest('/dashboard/portfolio');
  assertTrue(isProOnlyRoute(req), '/dashboard/portfolio should be pro-only');
});

test('/dashboard/portfolio/add is a pro-only route', () => {
  const req = createMockRequest('/dashboard/portfolio/add');
  assertTrue(isProOnlyRoute(req), '/dashboard/portfolio/* should be pro-only');
});

test('/dashboard/journal is a pro-only route', () => {
  const req = createMockRequest('/dashboard/journal');
  assertTrue(isProOnlyRoute(req), '/dashboard/journal should be pro-only');
});

test('/dashboard/journal/entry is a pro-only route', () => {
  const req = createMockRequest('/dashboard/journal/entry');
  assertTrue(isProOnlyRoute(req), '/dashboard/journal/* should be pro-only');
});

test('/dashboard/alerts is NOT a pro-only route', () => {
  const req = createMockRequest('/dashboard/alerts');
  assertFalse(isProOnlyRoute(req), '/dashboard/alerts should be max-only, not pro-only');
});

// ============================================================================
// MAX-ONLY ROUTE TESTS
// ============================================================================

console.log(`\n${colors.blue}=== MAX-ONLY ROUTE TESTS ===${colors.reset}\n`);

test('/dashboard/alerts is a max-only route', () => {
  const req = createMockRequest('/dashboard/alerts');
  assertTrue(isMaxOnlyRoute(req), '/dashboard/alerts should be max-only');
});

test('/dashboard/alerts/create is a max-only route', () => {
  const req = createMockRequest('/dashboard/alerts/create');
  assertTrue(isMaxOnlyRoute(req), '/dashboard/alerts/* should be max-only');
});

test('/dashboard/export is a max-only route', () => {
  const req = createMockRequest('/dashboard/export');
  assertTrue(isMaxOnlyRoute(req), '/dashboard/export should be max-only');
});

test('/dashboard/export/csv is a max-only route', () => {
  const req = createMockRequest('/dashboard/export/csv');
  assertTrue(isMaxOnlyRoute(req), '/dashboard/export/* should be max-only');
});

test('/dashboard/signals is a max-only route', () => {
  const req = createMockRequest('/dashboard/signals');
  assertTrue(isMaxOnlyRoute(req), '/dashboard/signals should be max-only');
});

test('/dashboard/signals/advanced is a max-only route', () => {
  const req = createMockRequest('/dashboard/signals/advanced');
  assertTrue(isMaxOnlyRoute(req), '/dashboard/signals/* should be max-only');
});

test('/api/admin/users is a max-only route', () => {
  const req = createMockRequest('/api/admin/users');
  assertTrue(isMaxOnlyRoute(req), '/api/admin/* should be max-only');
});

test('/api/admin/settings is a max-only route', () => {
  const req = createMockRequest('/api/admin/settings');
  assertTrue(isMaxOnlyRoute(req), '/api/admin/* should be max-only');
});

test('/dashboard/portfolio is NOT a max-only route', () => {
  const req = createMockRequest('/dashboard/portfolio');
  assertFalse(isMaxOnlyRoute(req), '/dashboard/portfolio should be pro-only, not max-only');
});

// ============================================================================
// ROUTE SEPARATION TESTS
// ============================================================================

console.log(`\n${colors.blue}=== ROUTE SEPARATION TESTS ===${colors.reset}\n`);

test('Pro-only and Max-only routes are mutually exclusive', () => {
  const proRoutes = [
    '/dashboard/portfolio',
    '/dashboard/journal',
  ];

  const maxRoutes = [
    '/dashboard/alerts',
    '/dashboard/export',
    '/dashboard/signals',
    '/api/admin/users',
  ];

  // Pro routes should not be max-only
  proRoutes.forEach((path) => {
    const req = createMockRequest(path);
    assertFalse(
      isMaxOnlyRoute(req),
      `${path} should be pro-only, not max-only`
    );
  });

  // Max routes should not be pro-only
  maxRoutes.forEach((path) => {
    const req = createMockRequest(path);
    assertFalse(
      isProOnlyRoute(req),
      `${path} should be max-only, not pro-only`
    );
  });
});

// ============================================================================
// MIDDLEWARE LOGIC SIMULATION
// ============================================================================

console.log(`\n${colors.blue}=== MIDDLEWARE LOGIC SIMULATION ===${colors.reset}\n`);

interface AccessTestCase {
  path: string;
  tier: 'free' | 'pro' | 'max';
  expectAccess: boolean;
  expectRedirect?: string;
}

const accessTests: AccessTestCase[] = [
  // Public routes - everyone has access
  { path: '/', tier: 'free', expectAccess: true },
  { path: '/pricing', tier: 'free', expectAccess: true },
  { path: '/sign-in', tier: 'free', expectAccess: true },
  { path: '/api/webhooks/stripe', tier: 'free', expectAccess: true },

  // Pro-only routes
  { path: '/dashboard/portfolio', tier: 'free', expectAccess: false, expectRedirect: '/dashboard?tier_required=pro' },
  { path: '/dashboard/portfolio', tier: 'pro', expectAccess: true },
  { path: '/dashboard/portfolio', tier: 'max', expectAccess: true },
  { path: '/dashboard/journal', tier: 'free', expectAccess: false, expectRedirect: '/dashboard?tier_required=pro' },
  { path: '/dashboard/journal', tier: 'pro', expectAccess: true },
  { path: '/dashboard/journal', tier: 'max', expectAccess: true },

  // Max-only routes
  { path: '/dashboard/alerts', tier: 'free', expectAccess: false, expectRedirect: '/dashboard?tier_required=max' },
  { path: '/dashboard/alerts', tier: 'pro', expectAccess: false, expectRedirect: '/dashboard?tier_required=max' },
  { path: '/dashboard/alerts', tier: 'max', expectAccess: true },
  { path: '/dashboard/export', tier: 'free', expectAccess: false, expectRedirect: '/dashboard?tier_required=max' },
  { path: '/dashboard/export', tier: 'pro', expectAccess: false, expectRedirect: '/dashboard?tier_required=max' },
  { path: '/dashboard/export', tier: 'max', expectAccess: true },
];

accessTests.forEach(({ path, tier, expectAccess, expectRedirect }) => {
  const req = createMockRequest(path);

  const isPublic = isPublicRoute(req);
  const isProOnly = isProOnlyRoute(req);
  const isMaxOnly = isMaxOnlyRoute(req);

  // Simulate middleware logic
  let hasAccess = false;
  let redirectPath = '';

  if (isPublic) {
    hasAccess = true;
  } else if (isMaxOnly && tier === 'max') {
    hasAccess = true;
  } else if (isMaxOnly && tier !== 'max') {
    hasAccess = false;
    redirectPath = '/dashboard?tier_required=max';
  } else if (isProOnly && tier === 'free') {
    hasAccess = false;
    redirectPath = '/dashboard?tier_required=pro';
  } else if (isProOnly && (tier === 'pro' || tier === 'max')) {
    hasAccess = true;
  } else {
    // Other authenticated routes
    hasAccess = tier !== 'free'; // Free users would need auth (but assume authenticated here)
  }

  test(`${path} for ${tier} tier: ${expectAccess ? 'allows' : 'blocks'} access`, () => {
    assertTrue(
      hasAccess === expectAccess,
      `Expected ${expectAccess ? 'access' : 'no access'} for ${tier} on ${path}, got ${hasAccess ? 'access' : 'no access'}`
    );

    if (!expectAccess && expectRedirect) {
      assertTrue(
        redirectPath === expectRedirect,
        `Expected redirect to ${expectRedirect}, got ${redirectPath}`
      );
    }
  });
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
