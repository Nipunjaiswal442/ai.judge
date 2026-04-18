import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getLawyerCases = query({
  args: { lawyerId: v.id("users") },
  handler: async (ctx, args) => {
    const complainantCases = await ctx.db
      .query("cases")
      .withIndex("by_complainant", (q) => q.eq("complainantLawyerId", args.lawyerId))
      .collect();

    const opposingCases = await ctx.db
      .query("cases")
      .withIndex("by_opposing", (q) => q.eq("opposingLawyerId", args.lawyerId))
      .collect();

    return [...complainantCases, ...opposingCases].sort(
      (a, b) => b._creationTime - a._creationTime
    );
  },
});

function extractStateCode(jurisdiction: string): string {
  const trimmed = jurisdiction.trim().toUpperCase();
  const afterComma = trimmed.split(",").pop()?.trim() || trimmed;
  const words = afterComma.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "IN";
  if (words.length === 1) return words[0].slice(0, 2);
  return (words[0][0] + words[1][0]).slice(0, 2);
}

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
    const year = new Date().getFullYear();
    const stateCode = extractStateCode(args.jurisdiction);

    const all = await ctx.db.query("cases").collect();
    const prefix = `CPA-${year}-DCDRC-${stateCode}-`;
    const existing = all.filter((c) => c.humanId.startsWith(prefix));
    const nextSeq = (existing.length + 1).toString().padStart(4, "0");
    const humanId = `${prefix}${nextSeq}`;

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
      deadline: Date.now() + 1000 * 60 * 60 * 24 * 30,
    });

    await ctx.db.insert("auditLogs", {
      userId: args.complainantLawyerId,
      action: "CASE_CREATED",
      entityType: "case",
      entityId: caseId,
      timestamp: Date.now(),
    });

    return caseId;
  },
});

export const acceptOpposingCounsel = mutation({
  args: { caseId: v.id("cases"), lawyerId: v.id("users") },
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.caseId);
    if (!c) throw new Error("Case not found");
    if (c.opposingLawyerId && c.opposingLawyerId !== args.lawyerId) {
      throw new Error("Opposing counsel is already assigned.");
    }
    await ctx.db.patch(args.caseId, {
      opposingLawyerId: args.lawyerId,
      status: c.status === "DRAFT" ? "OPPOSING_IN_PROGRESS" : c.status,
    });
  },
});
