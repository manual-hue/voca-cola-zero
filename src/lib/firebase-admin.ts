import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getServiceAccountCredentials } from "./credentials";

let _app: App | undefined;
let _db: Firestore | undefined;

function getFirebaseAdmin(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  _app = initializeApp({ credential: cert(getServiceAccountCredentials()) });
  return _app;
}

export function getDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseAdmin());
  return _db;
}
