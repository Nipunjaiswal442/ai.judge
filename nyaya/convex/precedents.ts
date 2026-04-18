import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

export const insertPrecedent = mutation({
  args: {
    title: v.string(),
    citation: v.string(),
    commission: v.string(),
    year: v.number(),
    cpaSections: v.array(v.string()),
    summary: v.string(),
    outcome: v.string(),
    keywords: v.array(v.string()),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("precedents", args);
  },
});

export const searchPrecedents = action({
  args: { embedding: v.array(v.float64()) },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("precedents", "by_embedding", {
      vector: args.embedding,
      limit: 5,
    });
    
    // We fetch the actual documents based on the vector search results
    const documents = await Promise.all(
      results.map(async (res) => {
        return await ctx.runQuery(api.precedents.getPrecedentById, { id: res._id });
      })
    );
    return documents;
  },
});

export const getPrecedentById = query({
  args: { id: v.id("precedents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

import { api } from "./_generated/api";
