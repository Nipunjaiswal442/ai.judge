import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

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

    const { name, role } = await req.json();
    const validRole = role === "JUDGE" ? "JUDGE" : "LAWYER";
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const displayName = name || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email;

    // Set role in Clerk publicMetadata (server-side, trusted)
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: validRole },
    });

    // Create Convex user record (idempotent — returns existing if already created)
    await convex.mutation(api.users.createUser, {
      clerkId: userId,
      email,
      name: displayName,
      role: validRole,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
