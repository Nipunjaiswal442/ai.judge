import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getAdminAuth, SESSION_COOKIE_NAME } from "@/lib/firebaseAdmin";
import { dashboardForRole, normalizeRole } from "@/lib/authRoles";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Idempotent: creates the Convex user record for the signed-in Firebase user.
// If the account already exists, returns its stored role — a sign-in with a
// different role selected never overwrites the original role.
export async function POST(req: Request) {
  try {
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ error: "Auth is not configured on the server." }, { status: 500 });
    }

    const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie).catch(() => null);
    if (!decoded) {
      return NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedRole = normalizeRole(body?.role);
    const nameFromBody = typeof body?.name === "string" ? body.name.trim() : "";

    const existing = await convex.query(api.users.getUserByAuthId, { authId: decoded.uid });
    if (existing) {
      return NextResponse.json({
        success: true,
        role: existing.role,
        dashboardUrl: dashboardForRole(existing.role),
      });
    }

    const firebaseUser = await adminAuth.getUser(decoded.uid);
    const email = firebaseUser.email || decoded.email || "";
    const name = nameFromBody || firebaseUser.displayName || email || "User";

    await convex.mutation(api.users.createUser, {
      authId: decoded.uid,
      email,
      name,
      role: requestedRole,
    });

    return NextResponse.json(
      { success: true, role: requestedRole, dashboardUrl: dashboardForRole(requestedRole) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
