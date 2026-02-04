import { test, expect } from "vitest";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

test("Next.js build succeeds", async () => {
  try {
    const { stdout, stderr } = await execAsync("npm run build", {
      timeout: 300000,
      env: { ...process.env, CI: "true" },
    });

    // Check for specific error patterns
    expect(stderr).not.toContain("Module not found");
    expect(stderr).not.toContain("page mismatch");

    // Capture deprecation warnings
    if (stderr.includes("deprecated")) {
      console.warn("Deprecation warnings found:", stderr);
    }
  } catch (error: any) {
    throw new Error(`Build failed:\n${error.stderr || error.stdout}`);
  }
}, 360000);
