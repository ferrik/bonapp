import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, requireAdmin, requireEditor } from "./auth";

export const getMyPartner = query({
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        const partner = await ctx.db
            .query("partners")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        return partner;
    },
});

export const listPartners = query({
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.db.query("partners").collect();
    },
});

export const getPartner = query({
    args: { id: v.id("partners") },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const partner = await ctx.db.get(args.id);

        if (user.role !== "admin") {
            const myPartner = await ctx.db
                .query("partners")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .first();
            if (!myPartner || myPartner._id !== args.id) {
                throw new Error("Access denied");
            }
        }
        return partner;
    },
});

export const createPartner = mutation({
    args: {
        name: v.string(),
        category: v.string(),
        commissionRate: v.number(),
        premiumTier: v.string(),
        contactPhone: v.string(),
        userId: v.id("users"),
        externalId: v.optional(v.string()),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        return await ctx.db.insert("partners", args);
    },
});

export const updatePartner = mutation({
    args: {
        id: v.id("partners"),
        name: v.optional(v.string()),
        category: v.optional(v.string()),
        commissionRate: v.optional(v.number()),
        premiumTier: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await requireEditor(ctx);
        const { id, ...updates } = args;

        if (user.role !== "admin") {
            // Додаткові перевірки для не-адмінів
            if (updates.commissionRate !== undefined || updates.premiumTier !== undefined) {
                throw new Error("Access denied");
            }
        }

        await ctx.db.patch(id, updates);
        return id;
    },
});

export const deletePartner = mutation({
    args: { id: v.id("partners") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.delete(args.id);
        return args.id;
    },
});
