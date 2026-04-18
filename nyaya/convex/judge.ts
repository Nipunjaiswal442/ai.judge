import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getJudgeCases = query({
  args: { statusFilter: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Return all cases for MVP to allow demo
    let cases = await ctx.db.query("cases").collect();
    
    // Sort by newest
    cases.sort((a, b) => b._creationTime - a._creationTime);
    
    if (args.statusFilter) {
       cases = cases.filter(c => c.status === args.statusFilter);
    }
    
    return cases;
  },
});

export const getCaseById = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.caseId);
  },
});

export const getAnalysisBrief = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analysisBriefs")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .unique();
  },
});

export const acknowledgeBrief = mutation({
  args: { caseId: v.id("cases"), briefId: v.id("analysisBriefs"), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.briefId, {
      judgeAcknowledged: true,
      judgeNotes: args.note
    });

    await ctx.db.patch(args.caseId, {
      status: "JUDGE_REVIEWED"
    });
  }
});
