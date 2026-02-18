# Phase 5: E2E Tests for MCP Finance

This directory contains comprehensive Playwright E2E tests for Phase 5 of the MCP Finance project.

## Test Files

### 1. **landing-page.spec.ts**

Tests for public landing page (no authentication required)

- ✅ Page loads without authentication
- ✅ Latest analysis section visible
- ✅ Page load time < 2 seconds
- ✅ Mobile responsiveness (375px)
- ✅ No console errors
- ✅ Authentication option available

**Run**: `npm run test:e2e -- e2e/phase5/landing-page.spec.ts`

### 2. **mcp-control-free.spec.ts**

Tests for free tier user capabilities

- ✅ Control page loads
- ✅ Tool selector displays
- ✅ Parameter form visible
- ✅ No AI toggle for free users
- ✅ Results area present
- ✅ Page load < 3 seconds
- ✅ Mobile responsive
- ✅ No critical errors

**Run**: `npm run test:e2e -- e2e/phase5/mcp-control-free.spec.ts`

### 3. **mcp-control-pro.spec.ts**

Tests for pro tier user capabilities

- ✅ Control page loads for pro
- ✅ AI toggle visible
- ✅ Can toggle AI on/off
- ✅ Gemini insights display
- ✅ Preset selector present
- ✅ Can save presets
- ✅ All parameters available
- ✅ Fast load time
- ✅ Mobile responsive with pro features
- ✅ Proper desktop layout

**Run**: `npm run test:e2e -- e2e/phase5/mcp-control-pro.spec.ts`

### 4. **tools-smoke-test.spec.ts**

Smoke tests for all 9 MCP tools

- ✅ All 9 tools listed
- ✅ Tools selectable
- ✅ Parameters area present
- ✅ Results area displays
- ✅ Tool names shown
- ✅ Load < 3 seconds
- ✅ Mobile responsive
- ✅ Tool switching works
- ✅ All tool concepts present

**Run**: `npm run test:e2e -- e2e/phase5/tools-smoke-test.spec.ts`

## Running Tests

### Run All Phase 5 Tests

```bash
npm run test:e2e -- e2e/phase5/
```

### Run Specific Test File

```bash
npm run test:e2e -- e2e/phase5/landing-page.spec.ts
```

### Run with UI (Interactive)

```bash
npm run test:e2e:ui -- e2e/phase5/
```

### Run with Browser Visible

```bash
npm run test:e2e:headed -- e2e/phase5/
```

### Debug Mode

```bash
npm run test:e2e:debug -- e2e/phase5/landing-page.spec.ts
```

### Run Specific Test

```bash
npx playwright test e2e/phase5/landing-page.spec.ts -g "should load landing page"
```

## Test Report

After running tests, view the report:

```bash
npm run test:e2e:report
```

This opens an interactive HTML report showing:

- All tests passed/failed
- Timing for each test
- Screenshots on failure
- Video recordings
- Detailed error messages

## Environment Setup

### Prerequisites

1. Frontend running: `npm run dev`
2. Playwright installed: `npm install --save-dev @playwright/test`
3. Browsers installed: `npx playwright install`

### Configuration

Tests use `playwright.config.ts`:

- Base URL: `http://localhost:3000` (local) or from `TEST_BASE_URL`
- Timeout: 30 seconds per test
- Retries: 0 (local) or 2 (CI)
- Reports: HTML, list, GitHub (if in CI)

## Test Coverage Matrix

| Feature        | Landing | Free | Pro | Tools |
| -------------- | ------- | ---- | --- | ----- |
| Load time      | ✅      | ✅   | ✅  | ✅    |
| Navigation     | ✅      | ✅   | ✅  | ✅    |
| Responsiveness | ✅      | ✅   | ✅  | ✅    |
| UI Elements    | ✅      | ✅   | ✅  | ✅    |
| Console errors | ✅      | ✅   | ✅  | ✅    |
| Free features  | ✅      | ✅   | -   | ✅    |
| Pro features   | -       | ✅   | ✅  | -     |
| AI features    | -       | ✅   | ✅  | -     |
| All 9 tools    | -       | -    | -   | ✅    |

## Common Issues & Solutions

### Tests timeout

```bash
# Increase timeout in test
test.setTimeout(60000); // 60 seconds
```

### Port 3000 in use

```bash
# Use different base URL
TEST_BASE_URL=http://localhost:3001 npm run test:e2e
```

### Playwright browsers missing

```bash
npx playwright install
```

### Permission denied

```bash
# Clear playwright cache
rm -rf ~/.cache/ms-playwright
npx playwright install
```

## Success Criteria

✅ All tests pass locally
✅ No critical console errors
✅ Page loads within time targets
✅ Responsive design works
✅ UI elements present
✅ Feature gating works (free vs pro)
✅ No unhandled rejections

## CI/CD Integration

Tests run automatically on:

- Pull requests
- Commits to main
- Manual trigger

GitHub Actions config: `.github/workflows/test.yml`

## Performance Targets

- Landing page: < 2 seconds
- MCP Control: < 3 seconds
- Tool load: < 3 seconds
- Mobile viewport: responsive
- No horizontal scroll

## Next Steps

1. Run tests locally: `npm run test:e2e -- e2e/phase5/`
2. Check report: `npm run test:e2e:report`
3. Fix any failures
4. Commit and push
5. Tests run in CI automatically

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Test Patterns](https://playwright.dev/docs/test-auth)

---

**Phase 5 E2E Tests** - Ready to verify MCP Finance system functionality! 🚀
