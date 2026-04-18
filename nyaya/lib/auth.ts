import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

// Ensure the URL is available to the Node.js runtime
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
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
              id: user.authId,
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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "LAWYER";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await convex.query(api.users.getUserByEmail, {
            email: user.email!,
          });
          if (!existingUser) {
            // Registering via Google for the first time
            await convex.mutation(api.users.createUser, {
              email: user.email!,
              name: user.name || "Unknown",
              authId: user.id || account.providerAccountId,
              role: "LAWYER", // Default role
            });
          }
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }
      return true;
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
});
