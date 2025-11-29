import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

// POST /api/orders/create - Створення замовлення з бота
http.route({
    path: "/api/orders/create",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const body = await request.json();

            // Валідація обов'язкових полів
            const requiredFields = [
                "orderNumber",
                "telegramUserId",
                "partnerId",
                "items",
                "subtotal",
                "deliveryAddress",
                "phone",
                "paymentMethod",
                "deliveryCost",
                "totalAmount",
                "deliveryType",
                "commission",
                "platformRevenue",
            ];

            for (const field of requiredFields) {
                if (body[field] === undefined) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: `Missing required field: ${field}`,
                        }),
                        {
                            status: 400,
                            headers: { "Content-Type": "application/json" },
                        }
                    );
                }
            }

            // Знайти партнера по externalId
            const partners = await ctx.runQuery(api.partners.listPartners);
            const partner = partners.find((p: any) => p.externalId === body.partnerId);

            if (!partner) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: `Partner not found: ${body.partnerId}`,
                    }),
                    {
                        status: 404,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            // Створити замовлення
            const orderId = await ctx.runMutation(api.orders.createOrder, {
                orderNumber: body.orderNumber,
                telegramUserId: body.telegramUserId,
                partnerId: partner._id,
                items: body.items,
                subtotal: body.subtotal,
                deliveryAddress: body.deliveryAddress,
                phone: body.phone,
                paymentMethod: body.paymentMethod,
                deliveryCost: body.deliveryCost,
                totalAmount: body.totalAmount,
                deliveryType: body.deliveryType,
                commission: body.commission,
                platformRevenue: body.platformRevenue,
                discount: body.discount ?? 0,
                customerName: body.customerName || "Unknown",
                comment: body.comment,
            });

            return new Response(
                JSON.stringify({
                    success: true,
                    orderId,
                    orderNumber: body.orderNumber,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error: any) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: error.message,
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }),
});

// GET /api/menu?partnerId=P001 - Отримання меню партнера
http.route({
    path: "/api/menu",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        try {
            const url = new URL(request.url);
            const partnerExternalId = url.searchParams.get("partnerId");

            if (!partnerExternalId) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "Missing partnerId parameter",
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            // Знайти партнера
            const partners = await ctx.runQuery(api.partners.listPartners);
            const partner = partners.find((p: any) => p.externalId === partnerExternalId);

            if (!partner) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: `Partner not found: ${partnerExternalId}`,
                    }),
                    {
                        status: 404,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            // Отримати меню
            const menuItems = await ctx.runQuery(api.menu_items.getMenuItemsByPartnerId, {
                partnerId: partner._id,
            });

            // Фільтруємо тільки активні страви
            const activeMenu = menuItems.filter((item: any) => item.isActive);

            return new Response(
                JSON.stringify({
                    success: true,
                    partnerId: partnerExternalId,
                    partnerName: partner.name,
                    menu: activeMenu,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error: any) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: error.message,
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }),
});

export default http;

