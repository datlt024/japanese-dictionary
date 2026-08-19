import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    deleteNotebook,
    updateNotebook,
} from "@/server/repositories/notebook/notebook.repository"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
    const { id } = await params

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`nb-write:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)

    const fields: { name?: string; description?: string | null; group_id?: string | null } = {}

    if (typeof body?.name === "string") {
        const name = body.name.trim()
        if (!name || name.length > 200) {
            return NextResponse.json({ error: "Tên sổ tay không được để trống hoặc quá dài" }, { status: 400 })
        }
        fields.name = name
    }

    if ("description" in (body ?? {})) {
        fields.description = typeof body.description === "string"
            ? body.description.trim() || null
            : null
    }

    if ("group_id" in (body ?? {})) {
        const gid = typeof body.group_id === "string" ? body.group_id : null
        if (gid) {
            const { data: grp } = await supabase
                .from("notebook_groups")
                .select("id")
                .eq("id", gid)
                .eq("user_id", user.id)
                .maybeSingle()
            if (!grp) {
                return NextResponse.json({ error: "Nhóm không tồn tại" }, { status: 400 })
            }
        }
        fields.group_id = gid
    }

    if (Object.keys(fields).length === 0) {
        return NextResponse.json({ error: "Không có trường nào để cập nhật" }, { status: 400 })
    }

    const { data, error } = await updateNotebook(supabase, id, user.id, fields)

    if (error) {
        return serverError(error, "PATCH /api/notebooks/[id]")
    }

    return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    const { id } = await params

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`nb-write:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const { error } = await deleteNotebook(supabase, id, user.id)

    if (error) {
        return serverError(error, "DELETE /api/notebooks/[id]")
    }

    return new NextResponse(null, { status: 204 })
}
