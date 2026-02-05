import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";
import { glob } from "glob";

interface ImportError {
  file: string;
  line: number;
  importPath: string;
  error: string;
}

export async function validateImports(): Promise<ImportError[]> {
  const errors: ImportError[] = [];
  const srcDir = path.join(process.cwd(), "src");

  // Get all TypeScript/TSX files
  const files = await glob("**/*.{ts,tsx}", { cwd: srcDir });

  for (const file of files) {
    const fullPath = path.join(srcDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true,
    );

    // Extract all imports
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        const importPath = (node.moduleSpecifier as ts.StringLiteral).text;

        // Validate @/ alias imports
        if (importPath.startsWith("@/")) {
          const resolvedPath = importPath.replace("@/", "src/");
          const possibleExtensions = [".ts", ".tsx", "/index.ts", "/index.tsx"];

          const exists = possibleExtensions.some(
            (ext) =>
              fs.existsSync(path.join(process.cwd(), resolvedPath + ext)) ||
              fs.existsSync(path.join(process.cwd(), resolvedPath)),
          );

          if (!exists) {
            errors.push({
              file: fullPath,
              line:
                sourceFile.getLineAndCharacterOfPosition(node.getStart()).line +
                1,
              importPath,
              error: `Cannot resolve import: ${importPath}`,
            });
          }
        }
      }
    });
  }

  return errors;
}

// CLI runner
if (require.main === module) {
  validateImports().then((errors) => {
    if (errors.length > 0) {
      console.error("Import validation failed:");
      errors.forEach((e) => {
        console.error(`  ${e.file}:${e.line} - ${e.error}`);
      });
      process.exit(1);
    }
    console.log("✓ All imports valid.");
  });
}
