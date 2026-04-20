import type { NextAuthConfig } from "next-auth";

// Edge-safe config used by middleware. Do NOT import bcrypt or ConvexHttpClient here.
const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "nyaya-local-dev-secret";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/sign-in",
  },
  session: { strategy: "jwt" },
  secret: authSecret,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "LAWYER";
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
