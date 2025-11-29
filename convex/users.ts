import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, requireAdmin } from "./auth";

export const getCurrentUser = query({
    handler: async (ctx) => {
        return await requireUser(ctx);
    },
});

export const getAllUsers = query({
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.db.query("users").collect();
    },
});

export const updateUserRole = mutation({
    args: { userId: v.id("users"), role: v.string() },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        if (!["admin", "editor", "viewer"].includes(args.role)) {
            throw new Error("Invalid role");
        }
        await ctx.db.patch(args.userId, { role: args.role as any });
    },
});

// Функція ініціалізації (створює адміна, якщо немає)
export const init = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("users").first();
        if (existing) return existing._id;

        const userId = await ctx.db.insert("users", {
            name: "Admin",
            email: "admin@ferrikbot.com",
            role: "admin",
        });
        return userId;
    },
});
