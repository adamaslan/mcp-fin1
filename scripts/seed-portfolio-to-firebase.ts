/**
 * Seed script: pushes portfolio_risk_results.json to Firestore.
 *
 * Reclassifies positions into three equal tiers using percentile-based
 * thresholds so the landing page always shows a meaningful distribution:
 *   Tight (risk_quality: "high")    — bottom 33% of max_loss_percent
 *   Moderate (risk_quality: "medium") — middle 33%
 *   Wide (risk_quality: "low")      — top 33%
 *
 * How stops are set:
 *   Each position's stop_level is calculated using the Average True Range
 *   (ATR) — a measure of a stock's typical daily price swing. The stop is
 *   placed ATR × multiplier below the entry price. A "Tight" stop is close
 *   to the current price (low ATR or small multiplier), risking little. A
 *   "Wide" stop allows more room but risks more capital if hit.
 *
 * Usage:
 *   npx tsx scripts/seed-portfolio-to-firebase.ts
 *
 * Requires these env vars in .env.local:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 */

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../.env.local") });

const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) {
  console.error("❌ FIREBASE_PROJECT_ID is required in .env.local");
  process.exit(1);
}

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Support both GOOGLE_APPLICATION_CREDENTIALS and explicit cert vars
const app =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || (!clientEmail && !privateKey)
    ? initializeApp({ credential: applicationDefault(), projectId })
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail: clientEmail!,
          privateKey: privateKey!,
        }),
        projectId,
      });

const db = getFirestore(app);

/**
 * Reclassify positions into three equal tiers based on max_loss_percent.
 * Sorts ascending, then assigns bottom 1/3 → "high" (Tight),
 * middle 1/3 → "medium" (Moderate), top 1/3 → "low" (Wide).
 *
 * This guarantees at least Math.floor(n/3) positions per tier.
 */
function reclassifyByPercentile(
  positions: any[],
): { position: any; quality: string }[] {
  const sorted = [...positions].sort(
    (a, b) => a.max_loss_percent - b.max_loss_percent,
  );
  const n = sorted.length;
  const tier1End = Math.floor(n / 3);
  const tier2End = Math.floor((2 * n) / 3);

  return sorted.map((pos, i) => ({
    position: pos,
    quality: i < tier1End ? "high" : i < tier2End ? "medium" : "low",
  }));
}

async function seed(): Promise<void> {
  const dataPath = resolve(__dirname, "../../portfolio_risk_results.json");
  const raw = readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw);

  const reclassified = reclassifyByPercentile(data.positions);

  const tightCount = reclassified.filter((r) => r.quality === "high").length;
  const moderateCount = reclassified.filter(
    (r) => r.quality === "medium",
  ).length;
  const wideCount = reclassified.filter((r) => r.quality === "low").length;

  console.log(
    `📊 Reclassified ${data.positions.length} positions: ${tightCount} Tight / ${moderateCount} Moderate / ${wideCount} Wide`,
  );

  // Determine percentile thresholds for metadata
  const sortedPcts = [...data.positions]
    .map((p: any) => p.max_loss_percent)
    .sort((a: number, b: number) => a - b);
  const p33 = sortedPcts[Math.floor(sortedPcts.length / 3)];
  const p66 = sortedPcts[Math.floor((2 * sortedPcts.length) / 3)];

  const positions = reclassified.map((r) => ({
    ...r.position,
    risk_quality: r.quality,
  }));

  const portfolioDoc = {
    total_value: data.total_value,
    total_max_loss: data.total_max_loss,
    risk_percent_of_portfolio: data.risk_percent_of_portfolio,
    positions,
    seeded_at: new Date().toISOString(),
    stop_methodology: {
      description:
        "Stops are set using Average True Range (ATR) — a measure of typical daily price swing. " +
        "The stop_level is placed ATR × multiplier below the entry price. " +
        "Tight stops risk <" +
        p33.toFixed(1) +
        "% of position value (disciplined). " +
        "Moderate stops risk " +
        p33.toFixed(1) +
        "–" +
        p66.toFixed(1) +
        "%. " +
        "Wide stops risk >" +
        p66.toFixed(1) +
        "% (review position sizing).",
      tight_threshold_pct: p33,
      moderate_threshold_pct: p66,
      tier_counts: {
        tight: tightCount,
        moderate: moderateCount,
        wide: wideCount,
      },
    },
  };

  // Store the summary document (includes all positions inline for the demo API)
  await db.collection("demo").doc("portfolio_risk").set(portfolioDoc);
  console.log(`✅ Seeded portfolio summary to Firestore (demo/portfolio_risk)`);

  // Store each position as a sub-document for individual queries
  const batch = db.batch();
  for (const position of positions) {
    const ref = db
      .collection("demo")
      .doc("portfolio_risk")
      .collection("positions")
      .doc(position.symbol);
    batch.set(ref, position);
  }
  await batch.commit();
  console.log(
    `✅ Seeded ${positions.length} positions to sub-collection (demo/portfolio_risk/positions)`,
  );
  console.log("🎉 Done! Run the app to verify the landing page distribution.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
