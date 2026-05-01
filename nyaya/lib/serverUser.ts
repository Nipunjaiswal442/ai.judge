import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const getServerUser = cache(async () => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const role = (
      ((clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role || "LAWYER") as string)
        .toUpperCase()
    ) as "JUDGE" | "LAWYER";

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name =
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      email ||
      "User";

    let convexUser = await convex.query(api.users.getUserByClerkId, {
      clerkId: clerkUser.id,
    });

    if (!convexUser) {
      await convex.mutation(api.users.createUser, {
        clerkId: clerkUser.id,
        email,
        name,
        role,
      });
      convexUser = await convex.query(api.users.getUserByClerkId, {
        clerkId: clerkUser.id,
      });
    }

    if (!convexUser) return null;

    return {
      clerkId: clerkUser.id,
      convexId: convexUser._id as Id<"users">,
      role: convexUser.role,
      name,
      email,
      initials: name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase(),
    };
  } catch {
    return null;
  }
});
