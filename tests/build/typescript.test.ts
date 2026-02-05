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
