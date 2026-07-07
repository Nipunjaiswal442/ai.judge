"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { generateCounselResearch } from "../lib/llm";

// LLM-backed research & Q&A assistant for counsel (model: lib/llmModel.ts,
// served via NVIDIA's OpenAI-compatible endpoint). Grounded in the
// curated precedent set plus (optionally) one of the lawyer's own cases.
export const askCounselResearch = action({
  args: {
    lawyerId: v.id("users"),
    caseId: v.optional(v.id("cases")),
    question: v.string(),
    history: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args): Promise<{ answer: string }> => {
    if (!process.env.NVIDIA_API_KEY) {
      throw new Error("LLM API key not configured. Set NVIDIA_API_KEY in the environment.");
    }
    const question = args.question.trim();
    if (!question) throw new Error("Ask a question to research.");

    let side: "COMPLAINANT" | "OPPOSING" | null = null;
    let caseDetails: any = null;
    let ownSubmission: any = null;
    let precedents: any[] = [];

    if (args.caseId) {
      const context: any = await ctx.runQuery(internal.analysisData.collectBriefContext, {
        caseId: args.caseId,
      });
      const caseDoc = context.caseDoc;
      if (caseDoc.complainantLawyerId === args.lawyerId) side = "COMPLAINANT";
      else if (caseDoc.opposingLawyerId === args.lawyerId) side = "OPPOSING";
      else throw new Error("You are not listed as counsel on this case.");

      caseDetails = {
        humanId: caseDoc.humanId,
        category: caseDoc.category,
        parties: `${caseDoc.complainantName} v. ${caseDoc.opposingPartyName}`,
        jurisdiction: caseDoc.jurisdiction,
        claimAmount: caseDoc.claimAmount,
        reliefSought: caseDoc.reliefSought,
        status: caseDoc.status,
      };
      // Counsel research is grounded only in the lawyer's OWN side of the
      // record — the other side's submission stays with the bench.
      ownSubmission = context.sessions.find((s: any) => s.side === side) || null;
      precedents = context.precedents;
    } else {
      const context: any = await ctx.runQuery(internal.analysisData.collectPrecedents, {});
      precedents = context;
    }

    const answer = await generateCounselResearch({
      question,
      side,
      caseDetails,
      ownSubmission,
      precedents,
      history: args.history || [],
    });

    return { answer };
  },
});
