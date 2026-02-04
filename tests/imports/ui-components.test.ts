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
