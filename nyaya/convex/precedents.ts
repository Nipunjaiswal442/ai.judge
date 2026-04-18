import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

export const listPrecedents = query({
  args: {
    cpaSection: v.optional(v.string()),
    commission: v.optional(v.string()),
    year: v.optional(v.number()),
    keyword: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("precedents").collect();
    const lowerKeyword = args.keyword?.toLowerCase();
    return all.filter((p) => {
      if (args.cpaSection && !p.cpaSections.includes(args.cpaSection)) return false;
      if (args.commission && p.commission !== args.commission) return false;
      if (args.year && p.year !== args.year) return false;
      if (lowerKeyword) {
        const hay = (p.title + " " + p.summary + " " + p.keywords.join(" ")).toLowerCase();
        if (!hay.includes(lowerKeyword)) return false;
      }
      return true;
    });
  },
});

export const searchPrecedents = action({
  args: { embedding: v.array(v.float64()) },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("precedents", "by_embedding", {
      vector: args.embedding,
      limit: 5,
    });

    const documents = await Promise.all(
      results.map((res) =>
        ctx.runQuery(api.precedents.getPrecedentById, { id: res._id })
      )
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

export const getManyByIds = query({
  args: { ids: v.array(v.id("precedents")) },
  handler: async (ctx, args) => {
    return await Promise.all(args.ids.map((id) => ctx.db.get(id)));
  },
});
