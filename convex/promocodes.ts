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

export const getMyPromocodes = query({
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        const partnerId = await getMyPartnerId(ctx, user);

        if (!partnerId) {
            if (user.role === "admin") return await ctx.db.query("promocodes").take(100);
            return [];
        }

        return await ctx.db
            .query("promocodes")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", partnerId))
            .collect();
    },
});

export const createPromocode = mutation({
    args: {
        code: v.string(),
        discountPercent: v.number(),
        status: v.string(),
        expiryDate: v.optional(v.string()),
        usageLimit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await requireEditor(ctx);
        const partnerId = await getMyPartnerId(ctx, user);

        // Перевірка унікальності
        const existing = await ctx.db
            .query("promocodes")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (existing) throw new Error("Code already exists");

        return await ctx.db.insert("promocodes", {
            ...args,
            partnerId: partnerId || undefined,
            usageCount: 0
        });
    },
});

export const togglePromocodeStatus = mutation({
    args: { id: v.id("promocodes") },
    handler: async (ctx, args) => {
        await requireEditor(ctx);
        const promo = await ctx.db.get(args.id);
        if (promo) {
            const newStatus = promo.status === "Активний" ? "Неактивний" : "Активний";
            await ctx.db.patch(args.id, { status: newStatus });
        }
    },
});

export const validatePromocode = mutation({
    args: { code: v.string(), partnerId: v.id("partners") },
    handler: async (ctx, args) => {
        const promo = await ctx.db
            .query("promocodes")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (!promo) return { valid: false, reason: "Not found" };
        if (promo.partnerId && promo.partnerId !== args.partnerId) return { valid: false, reason: "Invalid partner" };
        if (promo.status !== "Активний") return { valid: false, reason: "Inactive" };
        if (promo.usageLimit && promo.usageCount >= promo.usageLimit) return { valid: false, reason: "Max uses reached" };

        // Перевірка дати (якщо рядок у форматі YYYY-MM-DD)
        if (promo.expiryDate) {
            const expiry = new Date(promo.expiryDate).getTime();
            if (Date.now() > expiry) return { valid: false, reason: "Expired" };
        }

        return { valid: true, discountPercent: promo.discountPercent };
    },
});
