import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Знайти партнера по externalId (ID з таблиці)
export const findPartnerByExternalId = internalQuery({
    args: { externalId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("partners")
            .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
            .first();
    },
});

// Створити або оновити партнера
export const upsertPartner = internalMutation({
    args: {
        externalId: v.string(),
        name: v.string(),
        category: v.string(),
        commissionRate: v.number(),
        premiumTier: v.string(),
        contactPhone: v.string(),
        status: v.string(),
        rating: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("partners")
            .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
            .first();

        // Знайти дефолтного адміна для прив'язки (тимчасово)
        const admin = await ctx.db.query("users").first();
        if (!admin) throw new Error("No users found to link partner");

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                category: args.category,
                commissionRate: args.commissionRate,
                premiumTier: args.premiumTier,
                contactPhone: args.contactPhone,
                status: args.status,
            });
            return existing._id;
        } else {
            return await ctx.db.insert("partners", {
                ...args,
                userId: admin._id,
            });
        }
    },
});

// Створити або оновити страву
export const upsertMenuItem = internalMutation({
    args: {
        externalId: v.string(),
        partnerExternalId: v.string(),
        name: v.string(),
        category: v.string(),
        description: v.string(),
        price: v.number(),
        preparationTime: v.number(),
        deliveryTime: v.number(),
        photoUrl: v.optional(v.string()),
        allergens: v.optional(v.string()),
        rating: v.number(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        // Знайти партнера
        const partner = await ctx.db
            .query("partners")
            .withIndex("by_externalId", (q) => q.eq("externalId", args.partnerExternalId))
            .first();

        if (!partner) {
            console.error(`Partner not found for menu item: ${args.name} (PartnerID: ${args.partnerExternalId})`);
            return null;
        }

        // Знайти існуючу страву
        // Оскільки у нас немає індексу by_externalId для menuItems, шукаємо вручну (це ок для імпорту)
        const existing = await ctx.db
            .query("menuItems")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", partner._id))
            .filter((q) => q.eq(q.field("externalId"), args.externalId))
            .first();

        const itemData = {
            name: args.name,
            category: args.category,
            description: args.description,
            price: args.price,
            partnerId: partner._id,
            preparationTime: args.preparationTime,
            deliveryTime: args.deliveryTime,
            photoUrl: args.photoUrl,
            allergens: args.allergens,
            rating: args.rating,
            isActive: args.isActive,
            externalId: args.externalId,
        };

        if (existing) {
            await ctx.db.patch(existing._id, itemData);
            return existing._id;
        } else {
            return await ctx.db.insert("menuItems", itemData);
        }
    },
});

// Створити або оновити промокод
export const upsertPromocode = internalMutation({
    args: {
        code: v.string(),
        partnerExternalId: v.optional(v.string()),
        discountPercent: v.number(),
        usageLimit: v.optional(v.number()),
        usageCount: v.number(),
        expiryDate: v.optional(v.string()),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        let partnerId = undefined;

        if (args.partnerExternalId) {
            const partner = await ctx.db
                .query("partners")
                .withIndex("by_externalId", (q) => q.eq("externalId", args.partnerExternalId!))
                .first();
            if (partner) partnerId = partner._id;
        }

        const existing = await ctx.db
            .query("promocodes")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        const promoData = {
            code: args.code,
            discountPercent: args.discountPercent,
            usageLimit: args.usageLimit,
            usageCount: args.usageCount,
            expiryDate: args.expiryDate,
            status: args.status,
            partnerId: partnerId,
        };

        if (existing) {
            await ctx.db.patch(existing._id, promoData);
            return existing._id;
        } else {
            return await ctx.db.insert("promocodes", promoData);
        }
    },
});
