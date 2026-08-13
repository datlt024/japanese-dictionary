import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    updateNotebookGroup,
    deleteNotebookGroup,
} from "@/server/repositories/notebook/notebook-groups.repository"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
    const { id } = await params

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = rateLimit(`nbg-write:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)
    const fields: { name?: string; description?: string | null } = {}

    if (typeof body?.name === "string") {
        const name = body.name.trim()
        if (!name) {
            return NextResponse.json({ error: "Tên nhóm không được để trống" }, { status: 400 })
        }
        fields.name = name
    }

    if ("description" in (body ?? {})) {
        fields.description = typeof body.description === "string"
            ? body.description.trim() || null
            : null
    }

    if (Object.keys(fields).length === 0) {
        return NextResponse.json({ error: "Không có trường nào để cập nhật" }, { status: 400 })
    }

    const { data, error } = await updateNotebookGroup(supabase, id, user.id, fields)

    if (error) {
        return serverError(error, "PATCH /api/notebook-groups/[id]")
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

    const rl = rateLimit(`nbg-write:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const { error } = await deleteNotebookGroup(supabase, id, user.id)

    if (error) {
        return serverError(error, "DELETE /api/notebook-groups/[id]")
    }

    return new NextResponse(null, { status: 204 })
}
