import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { dashboardForRole, normalizeRole } from "@/lib/authRoles";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as { name?: unknown; role?: unknown };
    const requestedRole = normalizeRole(body.role);
    const metadataRole = normalizeRole(
      clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role || requestedRole
    );
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const displayName =
      (typeof body.name === "string" && body.name.trim()) ||
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      email ||
      "User";

    const existingUser = await convex.query(api.users.getUserByClerkId, {
      clerkId: userId,
    });
    const validRole = existingUser ? normalizeRole(existingUser.role) : metadataRole;

    // Keep Clerk metadata aligned, but do not let a returning user overwrite
    // their saved Convex role by selecting the wrong sign-in card.
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: validRole },
    });

    if (!existingUser) {
      await convex.mutation(api.users.createUser, {
        clerkId: userId,
        email,
        name: displayName,
        role: validRole,
      });
    }

    return NextResponse.json(
      { success: true, role: validRole, dashboardUrl: dashboardForRole(validRole) },
      { status: existingUser ? 200 : 201 }
    );
  } catch (error: unknown) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
