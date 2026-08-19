import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUserId } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
    // Auth before rate limit so we key by user ID, not spoofable IP
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUserId(user.id)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const rl = await rateLimit(`admin-grp-patch:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })

    type GroupUpdate = {
        is_public?: boolean
        public_description?: string | null
        display_order?: number
        name?: string
        description?: string | null
        updated_at?: string
    }
    const updates: GroupUpdate = { updated_at: new Date().toISOString() }
    if ("is_public" in body && typeof body.is_public === "boolean") updates.is_public = body.is_public
    if ("public_description" in body) updates.public_description = typeof body.public_description === "string" ? body.public_description : null
    if ("display_order" in body && typeof body.display_order === "number") updates.display_order = body.display_order
    if ("name" in body && typeof body.name === "string") {
        const name = body.name.trim()
        if (!name || name.length > 200) return NextResponse.json({ error: "Tên nhóm không được để trống hoặc quá dài" }, { status: 400 })
        updates.name = name
    }
    if ("description" in body) updates.description = typeof body.description === "string" ? body.description : null

    const { data, error } = await supabase
        .from("notebook_groups")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

    if (error) return serverError(error, "PATCH /api/admin/groups/[id]")
    return NextResponse.json(data)
}
