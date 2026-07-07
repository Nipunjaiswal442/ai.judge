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

// All documents on one case, with download URLs and uploader names —
// backs the Document Vault page.
export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .collect();

    return await Promise.all(
      docs
        .sort((a, b) => b._creationTime - a._creationTime)
        .map(async (d) => {
          const uploader = await ctx.db.get(d.uploadedByUserId);
          return {
            _id: d._id,
            _creationTime: d._creationTime,
            filename: d.filename,
            mimeType: d.mimeType,
            url: await ctx.storage.getUrl(d.storageId),
            uploadedBy: uploader?.name || "Unknown",
          };
        })
    );
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
