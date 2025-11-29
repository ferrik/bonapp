import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Користувачі системи
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        image: v.optional(v.string()),
        phone: v.optional(v.string()),
        role: v.optional(v.union(
            v.literal("admin"),
            v.literal("editor"),
            v.literal("viewer")
        )),
    }),

    // Партнери/Ресторани
    partners: defineTable({
        name: v.string(),
        category: v.string(),
        commissionRate: v.number(),
        premiumTier: v.string(),
        contactPhone: v.string(),
        userId: v.id("users"),
        externalId: v.optional(v.string()),
        status: v.string(),
    })
        .index("by_userId", ["userId"])
        .index("by_externalId", ["externalId"]),

    // Меню страв
    menuItems: defineTable({
        name: v.string(),
        category: v.string(),
        description: v.string(),
        price: v.number(),
        partnerId: v.id("partners"),
        preparationTime: v.number(),
        deliveryTime: v.number(),
        photoUrl: v.optional(v.string()), // Виправлено з imageUrl
        rating: v.number(),
        isActive: v.boolean(),
        externalId: v.optional(v.string()),
    })
        .index("by_partnerId", ["partnerId"])
        .index("by_partnerId_and_isActive", ["partnerId", "isActive"]),

    // Замовлення
    orders: defineTable({
        orderNumber: v.string(),
        telegramUserId: v.string(),
        partnerId: v.id("partners"),
        items: v.string(), // JSON string
        subtotal: v.number(),
        deliveryAddress: v.string(),
        phone: v.string(),
        paymentMethod: v.string(),
        status: v.string(),
        deliveryCost: v.number(),
        totalAmount: v.number(),
        deliveryType: v.string(),
        commission: v.number(),
        isPaid: v.boolean(),
        paymentStatus: v.string(),
        platformRevenue: v.number(),
        discount: v.number(),
        promocode: v.optional(v.string()),
        createdAt: v.optional(v.number()), // Додано!
    })
        .index("by_partnerId", ["partnerId"])
        .index("by_status", ["status"])
        .index("by_orderNumber", ["orderNumber"]),

    // Промокоди
    promocodes: defineTable({
        code: v.string(),
        discountPercent: v.number(),
        status: v.string(),
        expiryDate: v.optional(v.string()),
        usageLimit: v.optional(v.number()),
        usageCount: v.number(),
        partnerId: v.optional(v.id("partners")),
    })
        .index("by_code", ["code"])
        .index("by_partnerId", ["partnerId"]),

    // Відгуки
    reviews: defineTable({
        orderId: v.id("orders"),
        partnerId: v.id("partners"),
        telegramUserId: v.string(),
        rating: v.number(),
        comment: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_partnerId", ["partnerId"])
        .index("by_orderId", ["orderId"]),
});
