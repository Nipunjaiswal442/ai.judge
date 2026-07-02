import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// NEXT_PUBLIC_* vars are inlined at build/start time. If these are missing,
// the dev server was started before .env.local existed (restart it) or the
// Vercel project is missing its environment variables.
if (typeof window !== "undefined" && (!firebaseConfig.apiKey || !firebaseConfig.authDomain)) {
  console.error(
    "[nyaya] Firebase client config is missing. " +
    "Local: restart the dev server so .env.local is loaded. " +
    "Vercel: add the NEXT_PUBLIC_FIREBASE_* environment variables and redeploy."
  );
}

const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
