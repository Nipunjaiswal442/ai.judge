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

// Full case record for the bench: case metadata, both counsels' professional
// details, and each side's structured Q&A submission.
export const getCaseFullRecord = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) return null;

    const pickCounsel = (u: any) =>
      u && {
        _id: u._id,
        name: u.name,
        email: u.email,
        barCouncilId: u.barCouncilId,
        jurisdiction: u.jurisdiction,
        phone: u.phone,
      };

    const complainantLawyer = pickCounsel(await ctx.db.get(caseDoc.complainantLawyerId));
    const opposingLawyer = caseDoc.opposingLawyerId
      ? pickCounsel(await ctx.db.get(caseDoc.opposingLawyerId))
      : null;

    const sessions = await ctx.db
      .query("qaSessions")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .collect();

    const submissions = await Promise.all(
      sessions.map(async (s) => {
        const entries = await ctx.db
          .query("qaEntries")
          .withIndex("by_session", (q) => q.eq("sessionId", s._id))
          .collect();
        return {
          side: s.side,
          status: s.status,
          submittedAt: s.submittedAt,
          entries: entries
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((e) => ({ question: e.questionText, answer: e.answerText || "" })),
        };
      })
    );

    return {
      case: caseDoc,
      complainantLawyer,
      opposingLawyer,
      opposingLawyerEmailInvite: caseDoc.opposingLawyerEmailInvite,
      submissions,
    };
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
