import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminApp: App | null = null;

// Tolerates the common paste mistakes: surrounding quotes, literal \n
// sequences, and stray whitespace.
export function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let key = raw.trim();
  while (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  key = key.replace(/\\n/g, "\n");
  return key.includes("-----BEGIN") ? key : undefined;
}

function getAdminApp(): App | null {
  if (adminApp) return adminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) return null;

  adminApp =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  return adminApp;
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export const SESSION_COOKIE_NAME = "__session";
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
