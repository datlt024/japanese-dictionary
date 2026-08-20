import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
    // Auth before rate limit so we key by user ID, not spoofable IP
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const rl = await rateLimit(`admin-nb-patch:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })

    type NotebookUpdate = {
        is_public?: boolean
        public_category?: string | null
        public_description?: string | null
        display_order?: number
        name?: string
        description?: string | null
        group_id?: string | null
        updated_at?: string
    }
    const updates: NotebookUpdate = { updated_at: new Date().toISOString() }
    if ("is_public" in body && typeof body.is_public === "boolean") updates.is_public = body.is_public
    if ("public_category" in body) updates.public_category = typeof body.public_category === "string" ? body.public_category : null
    if ("public_description" in body) updates.public_description = typeof body.public_description === "string" ? body.public_description : null
    if ("display_order" in body && typeof body.display_order === "number") updates.display_order = body.display_order
    if ("group_id" in body) updates.group_id = typeof body.group_id === "string" ? body.group_id : null
    if ("name" in body && typeof body.name === "string") {
        const name = body.name.trim()
        if (!name || name.length > 200) return NextResponse.json({ error: "Tên sổ tay không được để trống hoặc quá dài" }, { status: 400 })
        updates.name = name
    }
    if ("description" in body) updates.description = typeof body.description === "string" ? body.description : null

    if (Object.keys(updates).length <= 1) {
        return NextResponse.json({ error: "Không có trường nào để cập nhật" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
        .from("notebooks")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

    if (error) return serverError(error, "PATCH /api/admin/notebooks/[id]")
    return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const rl = await rateLimit(`admin-nb-del:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const { error } = await supabaseServer
        .from("notebooks")
        .delete()
        .eq("id", id)

    if (error) return serverError(error, "DELETE /api/admin/notebooks/[id]")
    return new NextResponse(null, { status: 204 })
}
