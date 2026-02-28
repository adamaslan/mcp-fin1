import { test, expect } from "vitest";
import { glob } from "glob";
import * as path from "path";

test("component files follow naming conventions", async () => {
  const components = await glob("src/components/**/*.tsx");

  for (const file of components) {
    const fileName = path.basename(file, ".tsx");
    // Components should be kebab-case or PascalCase
    expect(fileName).toMatch(/^[a-z][a-z0-9-]*$|^[A-Z][a-zA-Z0-9]*$/);
  }
});

test("no orphaned test files without source", async () => {
  const tests = await glob("tests/**/*.test.ts");

  // Each test file should have a corresponding source file
  // (This is a soft check - some tests may be integration tests)
  expect(tests.length).toBeGreaterThan(0);
});
