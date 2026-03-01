import { test } from "vitest";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

test("TypeScript compiles without errors", async () => {
  try {
    await execAsync("npx tsc --noEmit", { timeout: 60000 });
  } catch (error: unknown) {
    // TypeScript errors will be in stderr
    const err = error as { stderr?: string; stdout?: string };
    throw new Error(
      `TypeScript compilation failed:\n${err.stderr || err.stdout}`,
    );
  }
}, 90000);
