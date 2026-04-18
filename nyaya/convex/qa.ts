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
      .then((entries) => entries.sort((a, b) => a.orderIndex - b.orderIndex));
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
    // Simple completeness heuristic: short answers flagged for follow-up.
    const trimmed = args.answerText.trim();
    const followUpNeeded = trimmed.length > 0 && trimmed.length < 20;
    const followUpNote = followUpNeeded
      ? "Answer appears brief — please elaborate with specific dates, amounts, or document references."
      : undefined;

    await ctx.db.patch(args.entryId, {
      answerText: args.answerText,
      aiFollowUpNeeded: followUpNeeded,
      aiFollowUpNote: followUpNote,
    });
  },
});

export const submitQASession = mutation({
  args: { sessionId: v.id("qaSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args.sessionId, {
      status: "SUBMITTED",
      submittedAt: Date.now(),
    });

    // Advance case status based on which sides are submitted.
    const allSessions = await ctx.db
      .query("qaSessions")
      .withIndex("by_case", (q) => q.eq("caseId", session.caseId))
      .collect();

    const submitted = allSessions.filter((s) =>
      s._id === args.sessionId ? true : s.status === "SUBMITTED"
    );
    const complainantSubmitted = submitted.some((s) => s.side === "COMPLAINANT");
    const opposingSubmitted = submitted.some((s) => s.side === "OPPOSING");

    let newStatus: "AWAITING_OPPOSING" | "OPPOSING_IN_PROGRESS" | "READY_FOR_BRIEF" | null = null;
    if (complainantSubmitted && opposingSubmitted) {
      newStatus = "READY_FOR_BRIEF";
    } else if (complainantSubmitted && !opposingSubmitted) {
      newStatus = "AWAITING_OPPOSING";
    } else if (!complainantSubmitted && opposingSubmitted) {
      newStatus = "OPPOSING_IN_PROGRESS";
    }

    if (newStatus) {
      await ctx.db.patch(session.caseId, { status: newStatus });
    }
  },
});
