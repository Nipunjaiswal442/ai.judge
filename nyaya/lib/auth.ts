import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex =
  convexUrl && convexUrl.startsWith("https://")
    ? new ConvexHttpClient(convexUrl)
    : null;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (!convex) {
          console.error("Auth error: NEXT_PUBLIC_CONVEX_URL is not configured.");
          return null;
        }

        try {
          const user = await convex.query(api.users.getUserByEmail, {
            email: credentials.email as string,
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (passwordsMatch) {
            return {
              id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!convex) {
          console.error("Google sign in error: NEXT_PUBLIC_CONVEX_URL is not configured.");
          return false;
        }
        try {
          const existingUser = await convex.query(api.users.getUserByEmail, {
            email: user.email!,
          });
          let convexUserId: string;
          if (!existingUser) {
            convexUserId = await convex.mutation(api.users.createUser, {
              email: user.email!,
              name: user.name || "Unknown",
              authId: user.id || account.providerAccountId,
              role: "LAWYER",
            });
          } else {
            convexUserId = existingUser._id;
          }
          // Override user.id so jwt callback stores Convex _id
          (user as any).id = convexUserId;
          (user as any).role = existingUser?.role || "LAWYER";
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }
      return true;
    },
  },
});
