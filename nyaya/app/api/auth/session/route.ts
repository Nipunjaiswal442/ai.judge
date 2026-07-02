import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from "@/lib/firebaseAdmin";

// Exchange a Firebase ID token for a long-lived httpOnly session cookie.
export async function POST(req: Request) {
  try {
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ error: "Auth is not configured on the server." }, { status: 500 });
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
    return NextResponse.json({ error: "Could not create session." }, { status: 401 });
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
