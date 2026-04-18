import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveDocument = mutation({
  args: {
    caseId: v.id("cases"),
    uploadedByUserId: v.id("users"),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", args);
  },
});

export const getDocumentUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const attachDocumentToEntry = mutation({
  args: { entryId: v.id("qaEntries"), documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) throw new Error("Entry not found");
    
    await ctx.db.patch(args.entryId, {
      attachmentIds: [...entry.attachmentIds, args.documentId]
    });
  }
});
