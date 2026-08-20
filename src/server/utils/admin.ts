import "server-only"
import type { User } from "@supabase/supabase-js"

function isAdminById(userId: string): boolean {
    const raw = process.env.ADMIN_USER_IDS ?? ""
    return raw.split(",").map(s => s.trim()).filter(Boolean).includes(userId)
}

/**
 * Kiểm tra quyền quản trị.
 * Ưu tiên: user trong ADMIN_USER_IDS env var HOẶC có app_metadata.role = "admin".
 */
export function isAdminUser(user: Pick<User, "id" | "app_metadata">): boolean {
    return isAdminById(user.id) || user.app_metadata?.role === "admin"
}
