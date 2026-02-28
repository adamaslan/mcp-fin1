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

  // Prefer GOOGLE_APPLICATION_CREDENTIALS (key file path) if set,
  // otherwise fall back to explicit FIREBASE_* env vars.
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = initializeApp({ credential: applicationDefault(), projectId });
  } else {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
      throw new Error(
        "Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env.local"
      );
    }

    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  }

  db = getFirestore(app);
  return { app, db };
}

export function getDb(): Firestore {
  return getFirebaseAdmin().db;
}
