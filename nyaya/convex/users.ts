import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getUserByAuthId = query({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .unique();
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    authId: v.string(),
    role: v.union(v.literal("JUDGE"), v.literal("LAWYER"), v.literal("ADMIN")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      authId: args.authId,
      role: args.role,
    });
  },
});
