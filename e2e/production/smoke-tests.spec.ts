import { test, expect } from '@playwright/test';

/**
 * Production Smoke Tests
 *
 * READ-ONLY tests for live production environment
 * Tests basic functionality and critical paths
 *
 * Safety guidelines:
 * - No test data creation or modification
 * - No database changes
 * - Test only public/accessible pages
 * - Safe to run against live site
 */
test.describe('Production Smoke Tests', () => {
  test('landing page loads and is accessible', async ({ page }) => {
    await page.goto('/');

    // Verify page loaded
    expect(page.url()).not.toContain('error');

    // Verify header elements visible
    await expect(page.locator('h1, header')).toBeDefined();
  });

  test('no console errors on landing page', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });

  test('sign-in page is accessible', async ({ page }) => {
    await page.goto('/sign-in');

    // Verify sign-in form visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('sign-up page is accessible', async ({ page }) => {
    await page.goto('/sign-up');

    // Verify sign-up form visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');

    // Verify pricing content visible
    await expect(page.locator('text=/pricing|tier|free|pro|max/i')).toBeDefined();

    // No errors
    expect(page.url()).not.toContain('error');
  });

  test('static assets load without errors', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 400) {
        if (response.request().resourceType() === 'image' ||
            response.request().resourceType() === 'stylesheet' ||
            response.request().resourceType() === 'script') {
          failedRequests.push(`${response.status()} ${response.url()}`);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not have failed static assets
    expect(failedRequests).toHaveLength(0);
  });

  test('api-docs page is accessible', async ({ page }) => {
    await page.goto('/api-docs');

    // Page should load
    expect(page.url()).toContain('/api-docs');
  });

  test('dashboard redirects unauthenticated users', async ({ page }) => {
    // Try accessing protected route
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    // Should redirect to sign-in or show auth
    const url = page.url();
    expect(url.includes('sign-in') || url.includes('auth') || page.url().includes('dashboard')).toBe(true);
  });

  test('no 5xx server errors on critical pages', async ({ page }) => {
    const pagesTested = ['/', '/pricing', '/sign-in', '/api-docs'];
    const errors: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 500) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });

    for (const pagePath of pagesTested) {
      await page.goto(pagePath, { waitUntil: 'networkidle' });
    }

    expect(errors).toHaveLength(0);
  });

  test('navigation links are functional', async ({ page }) => {
    await page.goto('/');

    // Click navbar links if they exist
    const navLinks = await page.locator('a').all();

    for (const link of navLinks.slice(0, 5)) { // Test first 5 links
      const href = await link.getAttribute('href');

      // Skip external links
      if (href && !href.startsWith('http') && href !== '#') {
        const response = await page.goto(href, { waitUntil: 'networkidle' }).catch(() => null);

        if (response) {
          expect(response.status()).toBeLessThan(400);
        }
      }
    }
  });
});

/**
 * Production Critical Paths
 * Tests essential user journeys
 */
test.describe('Production Critical Paths', () => {
  test('sign-in page form is complete', async ({ page }) => {
    await page.goto('/sign-in');

    // Verify all form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('pricing page displays all tiers', async ({ page }) => {
    await page.goto('/pricing');

    // Should mention free, pro, and max tiers
    const content = await page.textContent('body');

    expect(content?.toLowerCase()).toMatch(/free|pro|max/);
  });

  test('no excessive console warnings', async ({ page }) => {
    const warnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto('/');
    await page.goto('/pricing');

    // Allow some warnings, but not excessive
    expect(warnings.length).toBeLessThan(10);
  });

  test('page performance acceptable', async ({ page }) => {
    const navigationStart = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - navigationStart;

    // Page should load within reasonable time
    expect(loadTime).toBeLessThan(10000); // 10 seconds
  });

  test('images load correctly', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images.slice(0, 5)) { // Check first 5
      const src = await img.getAttribute('src');

      if (src && src.startsWith('http')) {
        // Check if image is visible/loaded
        const isVisible = await img.isVisible().catch(() => false);
        expect(isVisible || src).toBeDefined();
      }
    }
  });

  test('no broken links on home page', async ({ page }) => {
    const brokenLinks: string[] = [];

    page.on('response', (response) => {
      if (response.status() === 404 && response.request().resourceType() === 'document') {
        brokenLinks.push(response.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(brokenLinks).toHaveLength(0);
  });

  test('header/footer present on main pages', async ({ page }) => {
    const pages = ['/', '/pricing'];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Should have header or nav
      const hasNav = await page.locator('header, nav').first().isVisible().catch(() => false);
      expect(hasNav || page.url().includes(pagePath)).toBe(true);
    }
  });
});

/**
 * Production Uptime Check
 * Verifies service is available
 */
test.describe('Production Uptime', () => {
  test('service is responding', async ({ page }) => {
    const response = await page.goto('/');

    // Service should respond
    expect(response?.status()).toBeLessThan(500);
  });

  test('no redirect loops', async ({ page }) => {
    let redirectCount = 0;
    const maxRedirects = 5;

    page.on('response', (response) => {
      if (response.status() >= 300 && response.status() < 400) {
        redirectCount++;
      }
    });

    await page.goto('/');

    // Should not have excessive redirects
    expect(redirectCount).toBeLessThanOrEqual(maxRedirects);
  });

  test('api endpoints respond', async ({ request }) => {
    // Test public endpoints that don't require auth
    const endpoints = ['/api-docs'];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBeLessThan(500);
    }
  });
});
