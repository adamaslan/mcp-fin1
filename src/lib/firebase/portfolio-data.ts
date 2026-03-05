import { readFileSync } from "fs";
import { resolve } from "path";
import { getDb } from "@/lib/firebase/admin";
import { PortfolioRiskData } from "@/lib/firebase/types";

export type PortfolioDataSource =
  | "firestore_demo"
  | "firestore_cache"
  | "local_json"
  | null;

export interface PortfolioRiskWithSource {
  data: PortfolioRiskData | null;
  source: PortfolioDataSource;
}

/**
 * Attempt to load portfolio risk data from Firestore `demo/portfolio_risk`.
 *
 * @returns PortfolioRiskData if the document exists and contains data, otherwise null.
 */
async function loadFromFirestoreDemo(): Promise<PortfolioRiskData | null> {
  const db = getDb();
  const docRef = db.collection("demo").doc("portfolio_risk");
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    return null;
  }

  const docData = snapshot.data();
  if (!docData) {
    return null;
  }

  return docData as PortfolioRiskData;
}

/**
 * Attempt to load portfolio risk data from the latest entry in
 * Firestore `mcp_tool_cache/portfolio_risk/results`.
 *
 * The document structure stored there is:
 *   `{ result: { ...portfolioData... }, updated_at: "...", period: "..." }`
 *
 * The `result` object may expose positions under either `positions` or
 * `all_positions` — both are normalised to `positions` before returning.
 *
 * @returns PortfolioRiskData if a matching document is found, otherwise null.
 */
async function loadFromFirestoreCache(): Promise<PortfolioRiskData | null> {
  const db = getDb();
  const querySnapshot = await db
    .collection("mcp_tool_cache")
    .doc("portfolio_risk")
    .collection("results")
    .orderBy("updated_at", "desc")
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    return null;
  }

  const docData = querySnapshot.docs[0].data();
  if (!docData?.result) {
    return null;
  }

  // The cached result may store positions under `all_positions` instead of
  // `positions` depending on which pipeline version wrote it. Normalise here
  // so downstream consumers always find `positions`.
  const result = { ...(docData.result as Record<string, unknown>) };
  if (!result.positions && result.all_positions) {
    result.positions = result.all_positions;
  }

  return result as unknown as PortfolioRiskData;
}

/**
 * Attempt to load portfolio risk data from the local
 * `portfolio_risk_results.json` file on disk.
 *
 * Tries two candidate paths in order:
 *  1. One directory above `process.cwd()` (monorepo root when Next.js starts
 *     from the `nextjs-mcp-finance` sub-directory).
 *  2. `process.cwd()` itself (fallback for other execution contexts).
 *
 * @returns PortfolioRiskData if the file exists and is valid JSON,
 *          otherwise null.
 */
function loadFromLocalJson(): PortfolioRiskData | null {
  const candidatePaths = [
    resolve(process.cwd(), "../portfolio_risk_results.json"),
    resolve(process.cwd(), "portfolio_risk_results.json"),
  ];

  for (const filePath of candidatePaths) {
    try {
      const raw = readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw) as PortfolioRiskData;

      // Inject a seeded_at timestamp when the file does not carry one so that
      // consumers can distinguish freshly-seeded data.
      if (!parsed.seeded_at) {
        parsed.seeded_at = new Date().toISOString();
      }

      return parsed;
    } catch {
      // File not found or unreadable at this path — try the next candidate.
    }
  }

  return null;
}

/**
 * Return portfolio risk data together with the source it was loaded from.
 *
 * Priority order:
 *  1. Firestore `demo/portfolio_risk`
 *  2. Firestore `mcp_tool_cache/portfolio_risk/results` (latest document)
 *  3. Local `portfolio_risk_results.json` file
 *  4. `{ data: null, source: null }` when all sources fail
 *
 * Each priority level is attempted independently; errors are caught, logged
 * with `console.warn`, and execution falls through to the next level.
 *
 * @returns An object containing `data` (the portfolio risk data or null) and
 *          `source` (a discriminated string identifying where the data came
 *          from, or null if no source succeeded).
 */
export async function getPortfolioRiskDataWithSource(): Promise<PortfolioRiskWithSource> {
  // Priority 1 — Firestore demo document
  try {
    const data = await loadFromFirestoreDemo();
    if (data !== null) {
      return { data, source: "firestore_demo" };
    }
  } catch (err) {
    console.warn(
      "[portfolio-data] Firestore demo/portfolio_risk unavailable:",
      err,
    );
  }

  // Priority 2 — Firestore mcp_tool_cache latest result
  try {
    const data = await loadFromFirestoreCache();
    if (data !== null) {
      return { data, source: "firestore_cache" };
    }
  } catch (err) {
    console.warn(
      "[portfolio-data] Firestore mcp_tool_cache/portfolio_risk/results unavailable:",
      err,
    );
  }

  // Priority 3 — Local JSON file
  try {
    const data = loadFromLocalJson();
    if (data !== null) {
      return { data, source: "local_json" };
    }
  } catch (err) {
    console.warn(
      "[portfolio-data] Local portfolio_risk_results.json unavailable:",
      err,
    );
  }

  // Priority 4 — No source succeeded
  return { data: null, source: null };
}

/**
 * Convenience wrapper that returns only the portfolio risk data without the
 * source metadata.
 *
 * @returns PortfolioRiskData from the highest-priority available source, or
 *          null if no source is available.
 */
export async function getPortfolioRiskData(): Promise<PortfolioRiskData | null> {
  const { data } = await getPortfolioRiskDataWithSource();
  return data;
}
