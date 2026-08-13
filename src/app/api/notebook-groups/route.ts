import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    listNotebookGroups,
    createNotebookGroup,
} from "@/server/repositories/notebook/notebook-groups.repository"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = rateLimit(`nbg-get:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { data, error } = await listNotebookGroups(supabase, user.id)

    if (error) {
        return serverError(error, "GET /api/notebook-groups")
    }

    return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = rateLimit(`nbg-post:${user.id}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)
    const name = typeof body?.name === "string" ? body.name.trim() : ""

    if (!name) {
        return NextResponse.json({ error: "Tên nhóm không được để trống" }, { status: 400 })
    }

    const description = typeof body?.description === "string"
        ? body.description.trim() || null
        : null

    const { data, error } = await createNotebookGroup(supabase, user.id, name, description ?? undefined)

    if (error) {
        return serverError(error, "POST /api/notebook-groups")
    }

    return NextResponse.json(data, { status: 201 })
}
