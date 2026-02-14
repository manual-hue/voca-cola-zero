import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _app: App | undefined;
let _db: Firestore | undefined;

function getFirebaseAdmin(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 env var is not set");
  }

  const serviceAccount = JSON.parse(
    Buffer.from(base64, "base64").toString("utf-8"),
  );

  _app = initializeApp({ credential: cert(serviceAccount) });
  return _app;
}

export function getDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseAdmin());
  return _db;
}
