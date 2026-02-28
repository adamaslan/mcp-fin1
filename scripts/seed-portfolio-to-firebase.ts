/**
 * One-time seed script: pushes portfolio_risk_results.json to Firestore.
 *
 * Usage:
 *   npx tsx scripts/seed-portfolio-to-firebase.ts
 *
 * Requires these env vars in .env.local:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

// Load .env.local
config({ path: resolve(__dirname, "../.env.local") });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "❌ Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local",
  );
  process.exit(1);
}

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  projectId,
});
const db = getFirestore(app);

async function seed(): Promise<void> {
  const dataPath = resolve(__dirname, "../../portfolio_risk_results.json");
  const raw = readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw);

  const portfolioDoc = {
    ...data,
    seeded_at: new Date().toISOString(),
  };

  // Store the summary document
  await db.collection("demo").doc("portfolio_risk").set(portfolioDoc);
  console.log(
    `✅ Seeded portfolio summary (${data.positions.length} positions) to Firestore`,
  );

  // Store each position as a sub-document for efficient querying
  const batch = db.batch();
  for (const position of data.positions) {
    const ref = db
      .collection("demo")
      .doc("portfolio_risk")
      .collection("positions")
      .doc(position.symbol);
    batch.set(ref, position);
  }
  await batch.commit();
  console.log(
    `✅ Seeded ${data.positions.length} positions to Firestore sub-collection`,
  );
  console.log(
    "🎉 Done! Portfolio data is now in Firestore at demo/portfolio_risk",
  );
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
