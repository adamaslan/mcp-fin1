import {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
  App,
} from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App;
let db: Firestore;

function getFirebaseAdmin(): { app: App; db: Firestore } {
  if (getApps().length > 0) {
    app = getApps()[0];
    db = getFirestore(app);
    return { app, db };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID ?? "ttb-lang1";

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // Prefer GOOGLE_APPLICATION_CREDENTIALS (key file path) if set,
  // otherwise require both FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.
  if (
    !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
    (!clientEmail || !privateKey)
  ) {
    console.error(
      "❌ Missing Firebase credentials. Set GOOGLE_APPLICATION_CREDENTIALS, or both FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local",
    );
    process.exit(1);
  }

  app = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? initializeApp({ credential: applicationDefault(), projectId })
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail: clientEmail!,
          privateKey: privateKey!,
        }),
        projectId,
      });

  db = getFirestore(app);
  return { app, db };
}

export function getDb(): Firestore {
  return getFirebaseAdmin().db;
}
