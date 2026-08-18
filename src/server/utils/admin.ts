export function isAdminUserId(userId: string): boolean {
    const raw = process.env.ADMIN_USER_IDS ?? ""
    const ids = raw.split(",").map((s) => s.trim()).filter(Boolean)
    return ids.includes(userId)
}
