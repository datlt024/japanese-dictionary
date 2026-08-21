import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import type { TablesUpdate } from "@/shared/types/database.generated"

async function requireAdmin() {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || !isAdminUser(user)) return null
    return user
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })

    const rl = await rateLimit(`admin-user-patch:${admin.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const profileUpdates: TablesUpdate<"user_profiles"> = {}
    if (typeof body.display_name === "string") profileUpdates.display_name = body.display_name.trim()
    if (typeof body.jlpt_level === "string" || body.jlpt_level === null) profileUpdates.jlpt_level = body.jlpt_level || null

    const metaUpdates: Record<string, unknown> = {}
    if (typeof body.role === "string") metaUpdates.role = body.role
    if (typeof body.subscription_until === "string" || body.subscription_until === null) {
        metaUpdates.subscription_until = body.subscription_until || null
    }

    if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabaseServer
            .from("user_profiles")
            .update(profileUpdates)
            .eq("id", id)
        if (error) return serverError(error, "PATCH /api/admin/users/[id] profile")
    }

    if (Object.keys(metaUpdates).length > 0) {
        const { data: existing } = await supabaseServer.auth.admin.getUserById(id)
        const currentMeta = existing?.user?.app_metadata ?? {}
        const { error } = await supabaseServer.auth.admin.updateUserById(id, {
            app_metadata: { ...currentMeta, ...metaUpdates },
        })
        if (error) return serverError(error, "PATCH /api/admin/users/[id] meta")
    }

    return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: Params) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })

    const rl = await rateLimit(`admin-user-delete:${admin.id}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const { id } = await params

    // admin user already retrieved by requireAdmin() — no second getUser() needed
    if (admin.id === id) {
        return NextResponse.json({ error: "Không thể xóa tài khoản đang đăng nhập" }, { status: 400 })
    }

    const { error: profileError } = await supabaseServer.from("user_profiles").delete().eq("id", id)
    // PGRST116 = row not found; acceptable if profile was never created
    if (profileError && profileError.code !== "PGRST116") {
        return serverError(profileError, "DELETE /api/admin/users/[id] profile")
    }

    const { error } = await supabaseServer.auth.admin.deleteUser(id)
    if (error) return serverError(error, "DELETE /api/admin/users/[id]")

    return NextResponse.json({ ok: true })
}
