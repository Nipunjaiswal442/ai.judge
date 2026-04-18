import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getLawyerCases = query({
  args: { lawyerId: v.id("users") },
  handler: async (ctx, args) => {
    // Complainant cases
    const complainantCases = await ctx.db
      .query("cases")
      .withIndex("by_complainant", (q) => q.eq("complainantLawyerId", args.lawyerId))
      .collect();

    // Opposing cases
    const opposingCases = await ctx.db
      .query("cases")
      .withIndex("by_opposing", (q) => q.eq("opposingLawyerId", args.lawyerId))
      .collect();

    return [...complainantCases, ...opposingCases].sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const createCase = mutation({
  args: {
    category: v.string(),
    complainantLawyerId: v.id("users"),
    complainantName: v.string(),
    opposingPartyName: v.string(),
    claimAmount: v.number(),
    jurisdiction: v.string(),
    reliefSought: v.string(),
    opposingLawyerEmailInvite: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const humanId = `CPA-${new Date().getFullYear()}-DCDRC-00${Math.floor(Math.random() * 1000)}`;

    const caseId = await ctx.db.insert("cases", {
      humanId,
      category: args.category,
      complainantLawyerId: args.complainantLawyerId,
      complainantName: args.complainantName,
      opposingPartyName: args.opposingPartyName,
      claimAmount: args.claimAmount,
      jurisdiction: args.jurisdiction,
      reliefSought: args.reliefSought,
      opposingLawyerEmailInvite: args.opposingLawyerEmailInvite,
      status: "DRAFT",
      deadline: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    return caseId;
  },
});
