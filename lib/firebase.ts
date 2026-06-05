// Firebase app singleton — lazy-initialized so it never runs during SSR.
// Only import this from "use client" code paths.

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig, validateFirebaseConfig } from "@/lib/config/firebase";

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _rtdb: Database | null = null;

function app(): FirebaseApp {
  if (!_app) {
    validateFirebaseConfig();
    _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return _app;
}

export function firebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(app());
  return _auth;
}

export function firebaseDb(): Firestore {
  if (!_db) _db = getFirestore(app());
  return _db;
}

// Realtime Database — live game state (rooms, likes, presence, matches).
export function firebaseRtdb(): Database {
  if (!_rtdb) _rtdb = getDatabase(app());
  return _rtdb;
}
