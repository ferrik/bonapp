import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const importData = action({
    args: {
        partners: v.array(v.any()), // Приймаємо raw JSON
        menuItems: v.array(v.any()),
        promocodes: v.array(v.any()),
    },
    handler: async (ctx, args) => {
        console.log(`Starting import: ${args.partners.length} partners, ${args.menuItems.length} menu items`);

        // 1. Імпорт партнерів
        for (const p of args.partners) {
            await ctx.runMutation(internal.import_helpers.upsertPartner, {
                externalId: String(p.ID),
                name: p["Назва_партнера"],
                category: p["Категорія"],
                commissionRate: Number(p["Комісія_%"]),
                premiumTier: p["Рівень"] || "Standard",
                contactPhone: String(p["Телефон"]),
                status: p["Статус"],
                rating: Number(p["Рейтинг"] || 0),
            });
        }

        // 2. Імпорт меню
        for (const m of args.menuItems) {
            await ctx.runMutation(internal.import_helpers.upsertMenuItem, {
                externalId: String(m.ID),
                partnerExternalId: String(m["Ресторан"]), // Це має бути ID партнера
                name: m["Страва"],
                category: m["Категорія"],
                description: m["Опис"] || "",
                price: Number(m["Ціна"]),
                preparationTime: Number(m["Час_приготування_хв"] || 20),
                deliveryTime: Number(m["Час_доставки_хв"] || 30),
                photoUrl: m["Фото_URL"],
                allergens: m["Алергени"],
                rating: Number(m["Рейтинг"] || 0),
                isActive: m["Активний"] === "TRUE" || m["Активний"] === true,
            });
        }

        // 3. Імпорт промокодів
        for (const pc of args.promocodes) {
            await ctx.runMutation(internal.import_helpers.upsertPromocode, {
                code: pc["Код"],
                partnerExternalId: pc["ID_партнера"] ? String(pc["ID_партнера"]) : undefined,
                discountPercent: Number(pc["Знижка_%"]),
                usageLimit: pc["Ліміт_використань"] ? Number(pc["Ліміт_використань"]) : undefined,
                usageCount: Number(pc["Використано"] || 0),
                expiryDate: pc["Дійсний_до"],
                status: pc["Статус"],
            });
        }

        return { success: true, message: "Import completed" };
    },
});
