import { NextResponse } from "next/server";
import { normalizePrivateKey } from "@/lib/firebaseAdmin";

// Temporary production diagnostic: reports runtime + import health without
// leaking secrets. Remove once deployment issues are resolved.
export async function GET() {
  const report: Record<string, unknown> = {
    node: process.version,
    env: {
      NEXT_PUBLIC_CONVEX_URL: !!process.env.NEXT_PUBLIC_CONVEX_URL,
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_PRIVATE_KEY_STARTS_OK: (process.env.FIREBASE_PRIVATE_KEY || "").startsWith("-----BEGIN"),
      FIREBASE_PRIVATE_KEY_NORMALIZED_OK: !!normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      NVIDIA_API_KEY: !!process.env.NVIDIA_API_KEY,
    },
  };

  try {
    const { getApps } = await import("firebase-admin/app");
    report.firebaseAdminImport = `ok (${getApps().length} apps)`;
  } catch (e) {
    report.firebaseAdminImport = String(e);
  }

  try {
    const { cert } = await import("firebase-admin/app");
    const normalized = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
    if (normalized) {
      cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalized,
      });
      report.certParse = "ok";
    } else {
      report.certParse = "skipped (no key)";
    }
  } catch (e) {
    report.certParse = String(e);
  }

  try {
    const { ConvexHttpClient } = await import("convex/browser");
    new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    report.convexClient = "ok";
  } catch (e) {
    report.convexClient = String(e);
  }

  return NextResponse.json(report);
}
