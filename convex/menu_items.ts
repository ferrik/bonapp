import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, requireEditor } from "./auth";

async function getMyPartnerId(ctx: any, user: any) {
    const partner = await ctx.db
        .query("partners")
        .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
        .first();
    return partner ? partner._id : null;
}

export const getMyMenuItems = query({
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        const partnerId = await getMyPartnerId(ctx, user);

        if (!partnerId) {
            if (user.role === "admin") return await ctx.db.query("menuItems").take(100);
            return [];
        }

        return await ctx.db
            .query("menuItems")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", partnerId))
            .collect();
    },
});

// Додано для HTTP API
export const getMenuItemsByPartnerId = query({
    args: { partnerId: v.id("partners") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("menuItems")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", args.partnerId))
            .collect();
    },
});

export const createMenuItem = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        price: v.number(),
        category: v.string(),
        photoUrl: v.optional(v.string()),
        isActive: v.boolean(),
        preparationTime: v.number(),
        deliveryTime: v.number(),
        rating: v.number(),
        externalId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await requireEditor(ctx);
        const partnerId = await getMyPartnerId(ctx, user);

        if (!partnerId && user.role !== "admin") throw new Error("Partner required");
        if (!partnerId) throw new Error("Partner required"); // Admin needs to specify partnerId ideally

        return await ctx.db.insert("menuItems", { ...args, partnerId });
    },
});

export const updateMenuItem = mutation({
    args: {
        id: v.id("menuItems"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        price: v.optional(v.number()),
        category: v.optional(v.string()),
        photoUrl: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requireEditor(ctx);
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const deleteMenuItem = mutation({
    args: { id: v.id("menuItems") },
    handler: async (ctx, args) => {
        await requireEditor(ctx);
        await ctx.db.delete(args.id);
    },
});

export const toggleMenuItemActive = mutation({
    args: { id: v.id("menuItems") },
    handler: async (ctx, args) => {
        await requireEditor(ctx);
        const item = await ctx.db.get(args.id);
        if (item) {
            await ctx.db.patch(args.id, { isActive: !item.isActive });
        }
    },
});
