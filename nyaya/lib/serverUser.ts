import { cache } from "react";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getAdminAuth, SESSION_COOKIE_NAME } from "@/lib/firebaseAdmin";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const getServerUser = cache(async () => {
  // cookies() stays outside the try/catch so Next.js can mark the route
  // dynamic during prerender instead of baking in a signed-out state.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const adminAuth = await getAdminAuth();
    if (!adminAuth) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie).catch(() => null);
    if (!decoded) return null;

    let convexUser = await convex.query(api.users.getUserByAuthId, { authId: decoded.uid });

    if (!convexUser) {
      // Lazy create (e.g. Google sign-in that skipped the register call)
      const firebaseUser = await adminAuth.getUser(decoded.uid);
      const email = firebaseUser.email || decoded.email || "";
      const name = firebaseUser.displayName || email || "User";
      await convex.mutation(api.users.createUser, {
        authId: decoded.uid,
        email,
        name,
        role: "LAWYER",
      });
      convexUser = await convex.query(api.users.getUserByAuthId, { authId: decoded.uid });
    }

    if (!convexUser) return null;

    return {
      authId: decoded.uid,
      convexId: convexUser._id as Id<"users">,
      role: convexUser.role,
      name: convexUser.name,
      email: convexUser.email,
      initials: convexUser.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() || "U",
    };
  } catch {
    return null;
  }
});
