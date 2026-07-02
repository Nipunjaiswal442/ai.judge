import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from "@/lib/firebaseAdmin";

// Exchange a Firebase ID token for a long-lived httpOnly session cookie.
export async function POST(req: Request) {
  try {
    const missing = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"]
      .filter((k) => !process.env[k]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Server is missing environment variables: ${missing.join(", ")}. Add them in Vercel and redeploy.` },
        { status: 500 }
      );
    }

    const adminAuth = await getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ error: "Firebase admin could not initialize." }, { status: 500 });
    }

    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session create error:", error);
    // Surface the underlying cause: bad private-key formatting and project
    // mismatches are the two common failure modes on Vercel.
    const detail = error instanceof Error ? error.message : "Unknown error";
    const hint = /parse private key|DECODER|PEM/i.test(detail)
      ? " — FIREBASE_PRIVATE_KEY is malformed in Vercel. Re-paste it exactly as it appears in .env.local (with the \\n sequences, no surrounding quotes)."
      : "";
    return NextResponse.json({ error: `Session failed: ${detail}${hint}` }, { status: 401 });
  }
}

// Sign out: clear the session cookie.
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ success: true });
}
