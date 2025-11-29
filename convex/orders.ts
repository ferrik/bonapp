import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, requireAdmin, requireEditor } from "./auth";

// Допоміжна функція
async function getMyPartner(ctx: any, user: any) {
    const partner = await ctx.db
        .query("partners")
        .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
        .first();

    if (!partner && user.role !== "admin") {
        return null;
    }
    return partner;
}

export const getMyOrders = query({
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        const myPartner = await getMyPartner(ctx, user);

        if (!myPartner) {
            if (user.role === "admin") {
                return await ctx.db.query("orders").order("desc").take(100);
            }
            return [];
        }

        const orders = await ctx.db
            .query("orders")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", myPartner._id))
            .order("desc")
            .take(100);

        return orders;
    },
});

export const getOrderStats = query({
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        const myPartner = await getMyPartner(ctx, user);

        let orders;
        if (myPartner) {
            orders = await ctx.db
                .query("orders")
                .withIndex("by_partnerId", (q) => q.eq("partnerId", myPartner._id))
                .collect();
        } else if (user.role === "admin") {
            orders = await ctx.db.query("orders").collect();
        } else {
            return {
                totalRevenue: 0,
                totalOrders: 0,
                newOrders: 0,
                processingOrders: 0,
            };
        }

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        const newOrders = orders.filter((o) => o.status === "new").length;
        const processingOrders = orders.filter((o) => o.status === "processing").length;

        return {
            totalRevenue,
            totalOrders,
            newOrders,
            processingOrders,
        };
    },
});

export const updateOrderStatus = mutation({
    args: { id: v.id("orders"), status: v.string() },
    handler: async (ctx, args) => {
        const user = await requireEditor(ctx);
        await ctx.db.patch(args.id, { status: args.status });
    },
});

export const updatePaymentStatus = mutation({
    args: { id: v.id("orders"), paymentStatus: v.string() },
    handler: async (ctx, args) => {
        const user = await requireEditor(ctx);
        await ctx.db.patch(args.id, { paymentStatus: args.paymentStatus });
    },
});

export const createOrder = mutation({
    args: {
        partnerId: v.id("partners"),
        items: v.string(), // JSON string
        totalAmount: v.number(),
        customerName: v.string(),
        phone: v.string(), // customerPhone -> phone (згідно схеми)
        deliveryAddress: v.string(),
        comment: v.optional(v.string()),
        telegramUserId: v.string(), // telegramChatId -> telegramUserId (згідно схеми)
        orderNumber: v.string(), // Додано
        subtotal: v.number(), // Додано
        paymentMethod: v.string(), // Додано
        deliveryCost: v.number(), // Додано
        deliveryType: v.string(), // Додано
        commission: v.number(), // Додано
        platformRevenue: v.number(), // Додано
        discount: v.number(), // Додано
    },
    handler: async (ctx, args) => {
        // Публічна функція для бота
        const orderId = await ctx.db.insert("orders", {
            ...args,
            status: "new",
            paymentStatus: "pending",
            isPaid: false,
            // createdAt: Date.now(), // Видалено, бо немає в схемі
        });
        return orderId;
    },
});
