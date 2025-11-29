import { QueryCtx, MutationCtx } from "./_generated/server";

// Типи ролей
export type Role = "admin" | "editor" | "viewer";

// Пріоритети ролей
const ROLE_PRIORITY: Record<Role, number> = {
    admin: 3,
    editor: 2,
    viewer: 1,
};

export function hasRole(userRole: Role, requiredRole: Role): boolean {
    return ROLE_PRIORITY[userRole] >= ROLE_PRIORITY[requiredRole];
}

// Отримання користувача з перевіркою (тільки читання)
export async function requireUser(ctx: QueryCtx | MutationCtx) {
    const user = await ctx.db.query("users").first();
    if (!user) {
        // Якщо це dev середовище, можна кинути зрозумілу помилку
        throw new Error("Unauthenticated: No user found. Please run 'npx convex run users:init' to create an admin user.");
    }
    return user;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
    const user = await requireUser(ctx);
    if (user.role !== "admin") throw new Error("Access denied: admin only");
    return user;
}

export async function requireEditor(ctx: QueryCtx | MutationCtx) {
    const user = await requireUser(ctx);
    if (!hasRole(user.role as Role, "editor")) throw new Error("Access denied");
    return user;
}
