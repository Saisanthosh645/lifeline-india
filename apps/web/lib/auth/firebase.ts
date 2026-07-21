import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || "";
const rawAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || "";
const rawProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "";
const rawStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || "";
const rawMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || "";
const rawAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || "";

const isConfigured = Boolean(
  rawApiKey &&
    rawApiKey !== "dummy-api-key-for-build" &&
    rawApiKey !== "your-api-key-here" &&
    rawAuthDomain &&
    rawProjectId &&
    rawAppId
);

const firebaseConfig = isConfigured
  ? {
      apiKey: rawApiKey,
      authDomain: rawAuthDomain,
      projectId: rawProjectId,
      storageBucket: rawStorageBucket || undefined,
      messagingSenderId: rawMessagingSenderId || undefined,
      appId: rawAppId,
    }
  : null;

// Initialize Firebase only when the required web config is present.
const app = firebaseConfig ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;
export const auth = app ? getAuth(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;

export function isFirebaseConfigured(): boolean {
  return isConfigured;
}
