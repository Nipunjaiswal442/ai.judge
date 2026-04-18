import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("JUDGE"), v.literal("LAWYER"), v.literal("ADMIN")),
    barCouncilId: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
    jurisdiction: v.optional(v.string()),
    authId: v.string(), // NextAuth subject
    password: v.optional(v.string()), // added for credentials
  }).index("by_email", ["email"]).index("by_authId", ["authId"]),

  cases: defineTable({
    humanId: v.string(), // e.g. CPA-2026-DCDRC-AP-0001
    category: v.string(),
    complainantLawyerId: v.id("users"),
    opposingLawyerId: v.optional(v.id("users")),
    opposingLawyerEmailInvite: v.optional(v.string()),
    assignedJudgeId: v.optional(v.id("users")),
    status: v.union(
      v.literal("DRAFT"),
      v.literal("AWAITING_OPPOSING"),
      v.literal("OPPOSING_IN_PROGRESS"),
      v.literal("READY_FOR_BRIEF"),
      v.literal("BRIEF_GENERATED"),
      v.literal("JUDGE_REVIEWED")
    ),
    complainantName: v.string(),
    opposingPartyName: v.string(),
    claimAmount: v.number(),
    jurisdiction: v.string(),
    reliefSought: v.string(),
    deadline: v.number(),
  }).index("by_complainant", ["complainantLawyerId"])
    .index("by_opposing", ["opposingLawyerId"])
    .index("by_judge", ["assignedJudgeId"]),

  qaSessions: defineTable({
    caseId: v.id("cases"),
    side: v.union(v.literal("COMPLAINANT"), v.literal("OPPOSING")),
    status: v.union(v.literal("IN_PROGRESS"), v.literal("SUBMITTED")),
    submittedAt: v.optional(v.number()),
  }).index("by_case", ["caseId"]),

  qaEntries: defineTable({
    sessionId: v.id("qaSessions"),
    orderIndex: v.number(),
    questionText: v.string(),
    answerText: v.optional(v.string()),
    attachmentIds: v.array(v.id("documents")),
    aiFollowUpNeeded: v.boolean(),
    aiFollowUpNote: v.optional(v.string()),
  }).index("by_session", ["sessionId"]),

  documents: defineTable({
    caseId: v.id("cases"),
    uploadedByUserId: v.id("users"),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
  }).index("by_case", ["caseId"]),

  analysisBriefs: defineTable({
    caseId: v.id("cases"),
    generatedAt: v.number(),
    caseSummary: v.string(),
    agreedFacts: v.array(v.string()),
    disputedFacts: v.array(v.object({
      point: v.string(),
      complainantPosition: v.string(),
      opposingPosition: v.string(),
    })),
    applicableLaw: v.array(v.object({
      statute: v.string(),
      section: v.string(),
      relevance: v.string(),
    })),
    citedPrecedentIds: v.array(v.id("precedents")),
    proceduralFlags: v.array(v.string()),
    evidentiaryGaps: v.array(v.string()),
    confidenceScore: v.number(),
    caveats: v.array(v.string()),
    llmModel: v.string(),
    judgeAcknowledged: v.boolean(),
    judgeNotes: v.optional(v.string()),
  }).index("by_case", ["caseId"]),

  precedents: defineTable({
    title: v.string(),
    citation: v.string(),
    commission: v.string(),
    year: v.number(),
    cpaSections: v.array(v.string()),
    summary: v.string(),
    outcome: v.string(),
    keywords: v.array(v.string()),
    embedding: v.optional(v.array(v.float64())),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 768, // Keeping 768 as requested
  }),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),
});
