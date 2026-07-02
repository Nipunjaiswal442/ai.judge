import type { Auth } from "firebase-admin/auth";

// firebase-admin is loaded via dynamic import() only. Statically importing it
// crashes the whole serverless function on Vercel (module-load failure before
// any handler runs), while runtime dynamic import resolves fine.
let adminAuth: Auth | null = null;

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

export async function getAdminAuth(): Promise<Auth | null> {
  if (adminAuth) return adminAuth;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) return null;

  const { cert, getApps, initializeApp } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  adminAuth = getAuth(app);
  return adminAuth;
}

export const SESSION_COOKIE_NAME = "__session";
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
