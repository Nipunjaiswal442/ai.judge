"use node";

import { action, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { generateBrief } from "../lib/llm";

export const collectBriefContext = internalQuery({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) throw new Error("Case not found");

    const sessions = await ctx.db
      .query("qaSessions")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .collect();

    const hydrated = await Promise.all(
      sessions.map(async (s) => {
        const entries = await ctx.db
          .query("qaEntries")
          .withIndex("by_session", (q) => q.eq("sessionId", s._id))
          .collect();
        return {
          side: s.side,
          status: s.status,
          entries: entries
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((e) => ({ q: e.questionText, a: e.answerText || "" })),
        };
      })
    );

    const precedents = await ctx.db.query("precedents").take(10);

    return {
      caseDoc,
      sessions: hydrated,
      precedents: precedents.map((p) => ({
        _id: p._id,
        title: p.title,
        citation: p.citation,
        commission: p.commission,
        year: p.year,
        cpaSections: p.cpaSections,
        summary: p.summary,
        outcome: p.outcome,
      })),
    };
  },
});

export const saveBrief = internalMutation({
  args: {
    caseId: v.id("cases"),
    brief: v.any(),
    citedPrecedentIds: v.array(v.id("precedents")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("analysisBriefs")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .unique();

    const payload = {
      caseId: args.caseId,
      generatedAt: Date.now(),
      caseSummary: String(args.brief.caseSummary || ""),
      agreedFacts: Array.isArray(args.brief.agreedFacts) ? args.brief.agreedFacts : [],
      disputedFacts: Array.isArray(args.brief.disputedFacts) ? args.brief.disputedFacts : [],
      applicableLaw: Array.isArray(args.brief.applicableLaw) ? args.brief.applicableLaw : [],
      citedPrecedentIds: args.citedPrecedentIds,
      proceduralFlags: Array.isArray(args.brief.proceduralFlags) ? args.brief.proceduralFlags : [],
      evidentiaryGaps: Array.isArray(args.brief.evidentiaryGaps) ? args.brief.evidentiaryGaps : [],
      confidenceScore: Number(args.brief.confidenceScore) || 50,
      caveats: Array.isArray(args.brief.caveats) && args.brief.caveats.length > 0
        ? args.brief.caveats
        : ["AI-generated advisory brief; verify all facts and precedents."],
      llmModel: "deepseek-ai/deepseek-v3.2",
      judgeAcknowledged: false,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("analysisBriefs", payload);
    }

    await ctx.db.patch(args.caseId, { status: "BRIEF_GENERATED" });
  },
});

export const generateAnalysisBrief = action({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args): Promise<{ ok: true }> => {
    const context: any = await ctx.runQuery(internal.analysis.collectBriefContext, {
      caseId: args.caseId,
    });

    const submittedSides = context.sessions.filter((s: any) => s.status === "SUBMITTED");
    if (submittedSides.length < 2) {
      throw new Error("Both sides must submit their Q&A before a brief can be generated.");
    }

    if (!process.env.NVIDIA_API_KEY) {
      throw new Error("LLM API key not configured. Set NVIDIA_API_KEY in Vercel env.");
    }

    const caseDetails = {
      humanId: context.caseDoc.humanId,
      category: context.caseDoc.category,
      parties: `${context.caseDoc.complainantName} v. ${context.caseDoc.opposingPartyName}`,
      jurisdiction: context.caseDoc.jurisdiction,
      claimAmount: context.caseDoc.claimAmount,
      reliefSought: context.caseDoc.reliefSought,
      qa: context.sessions,
    };

    const brief = await generateBrief(caseDetails, context.precedents);

    // Map cited precedents from the closed set only
    const citedIds = context.precedents.slice(0, 3).map((p: any) => p._id);

    await ctx.runMutation(internal.analysis.saveBrief, {
      caseId: args.caseId,
      brief,
      citedPrecedentIds: citedIds,
    });

    return { ok: true };
  },
});
