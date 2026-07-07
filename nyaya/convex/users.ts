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

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    authId: v.string(),
    role: v.union(v.literal("JUDGE"), v.literal("LAWYER"), v.literal("ADMIN")),
    counselType: v.optional(v.union(v.literal("COMPLAINANT"), v.literal("OPPOSING"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .unique();

    if (existing) {
      // Signing in with a different counsel side selected switches the
      // workspace flavor without touching the account's core role.
      if (existing.role === "LAWYER" && args.counselType && existing.counselType !== args.counselType) {
        await ctx.db.patch(existing._id, { counselType: args.counselType });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      authId: args.authId,
      role: args.role,
      counselType: args.role === "LAWYER" ? args.counselType : undefined,
    });
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    barCouncilId: v.optional(v.string()),
    jurisdiction: v.optional(v.string()),
    phone: v.optional(v.string()),
    counselType: v.optional(v.union(v.literal("COMPLAINANT"), v.literal("OPPOSING"))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined && args.name.trim()) patch.name = args.name.trim();
    if (args.barCouncilId !== undefined) patch.barCouncilId = args.barCouncilId.trim();
    if (args.jurisdiction !== undefined) patch.jurisdiction = args.jurisdiction.trim();
    if (args.phone !== undefined) patch.phone = args.phone.trim();
    if (args.counselType !== undefined && user.role === "LAWYER") patch.counselType = args.counselType;

    await ctx.db.patch(args.userId, patch);

    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: "PROFILE_UPDATED",
      entityType: "user",
      entityId: args.userId,
      timestamp: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});
