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
