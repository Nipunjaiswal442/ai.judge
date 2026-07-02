"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { generateBrief, generateJudgeCaseSynthesis } from "../lib/llm";

export const generateAnalysisBrief = action({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args): Promise<{ ok: true }> => {
    const context: any = await ctx.runQuery(internal.analysisData.collectBriefContext, {
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

    await ctx.runMutation(internal.analysisData.saveBrief, {
      caseId: args.caseId,
      brief,
      citedPrecedentIds: citedIds,
    });

    return { ok: true };
  },
});

export const askJudgeCaseSynthesis = action({
  args: {
    caseId: v.id("cases"),
    question: v.string(),
  },
  handler: async (ctx, args): Promise<{ answer: string }> => {
    if (!process.env.NVIDIA_API_KEY) {
      throw new Error("LLM API key not configured. Set NVIDIA_API_KEY in Vercel env.");
    }

    const context: any = await ctx.runQuery(internal.analysisData.collectBriefContext, {
      caseId: args.caseId,
    });

    const submittedSides = context.sessions.filter((s: any) => s.status === "SUBMITTED");
    if (submittedSides.length === 0) {
      throw new Error("No submitted lawyer material found for this case yet.");
    }

    const brief = await ctx.runQuery(api.judge.getAnalysisBrief, {
      caseId: args.caseId,
    });

    const citedPrecedents = brief?.citedPrecedentIds?.length
      ? await ctx.runQuery(api.precedents.getManyByIds, { ids: brief.citedPrecedentIds })
      : [];

    const caseDetails = {
      humanId: context.caseDoc.humanId,
      category: context.caseDoc.category,
      parties: `${context.caseDoc.complainantName} v. ${context.caseDoc.opposingPartyName}`,
      jurisdiction: context.caseDoc.jurisdiction,
      claimAmount: context.caseDoc.claimAmount,
      reliefSought: context.caseDoc.reliefSought,
      status: context.caseDoc.status,
    };

    const qaSessions = submittedSides.map((session: any) => ({
      side: session.side,
      status: session.status,
      entries: (session.entries || []).filter((entry: any) =>
        Boolean(String(entry.a || "").trim())
      ),
    }));

    const answer = await generateJudgeCaseSynthesis({
      caseDetails,
      qaSessions,
      brief,
      precedents: citedPrecedents.filter(Boolean),
      judgeQuestion: args.question,
    });

    return { answer };
  },
});
