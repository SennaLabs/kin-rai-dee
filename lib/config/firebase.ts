// Firebase project configuration — values come from environment variables.
// See .env.example for the full list. Install the SDK: yarn add firebase

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";

// The Realtime Database lives in its own region-specific URL. Prefer an explicit
// env var; otherwise fall back to the conventional default-RTDB host derived from
// the project id (works for projects whose RTDB sits in the default location).
const databaseURL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
  (projectId ? `https://${projectId}-default-rtdb.firebaseio.com` : "");

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  databaseURL,
  projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Called once before Firebase is initialized; logs a warning per missing key.
export function validateFirebaseConfig(): void {
  const missing = (
    Object.entries(firebaseConfig) as [string, string][]
  ).filter(([, v]) => !v);
  if (missing.length > 0) {
    console.warn(
      `[Firebase] Missing env vars: ${missing.map(([k]) => "NEXT_PUBLIC_FIREBASE_" + k.toUpperCase()).join(", ")}. ` +
        "Copy .env.example → .env.local and fill in the values.",
    );
  }
}
