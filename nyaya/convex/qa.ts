import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { CATEGORY_QUESTIONS } from "../lib/caseCategories";

export const getQASession = query({
  args: { caseId: v.id("cases"), side: v.union(v.literal("COMPLAINANT"), v.literal("OPPOSING")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("qaSessions")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .filter((q) => q.eq(q.field("side"), args.side))
      .unique();
  },
});

export const getQAEntries = query({
  args: { sessionId: v.id("qaSessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("qaEntries")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect()
      .then(entries => entries.sort((a, b) => a.orderIndex - b.orderIndex));
  },
});

export const initializeQASession = mutation({
  args: { caseId: v.id("cases"), side: v.union(v.literal("COMPLAINANT"), v.literal("OPPOSING")), category: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("qaSessions")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .filter((q) => q.eq(q.field("side"), args.side))
      .unique();

    if (existing) return existing._id;

    const sessionId = await ctx.db.insert("qaSessions", {
      caseId: args.caseId,
      side: args.side,
      status: "IN_PROGRESS",
    });

    // Seed questions
    const cat = CATEGORY_QUESTIONS[args.category];
    if (cat) {
      const qs = args.side === "COMPLAINANT" ? cat.complainant : cat.opposing;
      for (let i = 0; i < qs.length; i++) {
        await ctx.db.insert("qaEntries", {
          sessionId,
          orderIndex: i,
          questionText: qs[i],
          attachmentIds: [],
          aiFollowUpNeeded: false,
        });
      }
    }

    return sessionId;
  },
});

export const updateAnswer = mutation({
  args: { entryId: v.id("qaEntries"), answerText: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.entryId, { answerText: args.answerText });
  },
});

export const submitQASession = mutation({
  args: { sessionId: v.id("qaSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { 
      status: "SUBMITTED",
      submittedAt: Date.now() 
    });
  },
});
