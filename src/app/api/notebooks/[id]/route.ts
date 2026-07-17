import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { serverError } from "@/server/utils/api-error"
import {
    deleteNotebook,
    updateNotebook,
} from "@/server/repositories/notebook/notebook.repository"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
    const { id } = await params

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)

    const fields: { name?: string; description?: string | null } = {}

    if (typeof body?.name === "string") {
        const name = body.name.trim()
        if (!name) {
            return NextResponse.json({ error: "Tên sổ tay không được để trống" }, { status: 400 })
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

    const { data, error } = await updateNotebook(supabase, id, fields)

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

    const { error } = await deleteNotebook(supabase, id)

    if (error) {
        return serverError(error, "DELETE /api/notebooks/[id]")
    }

    return new NextResponse(null, { status: 204 })
}
