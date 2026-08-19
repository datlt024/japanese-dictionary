import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    createNotebook,
    listNotebooksWithItemCount,
    type NotebookWithCount,
} from "@/server/repositories/notebook/notebook.repository"

export const dynamic = "force-dynamic"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`nb-get:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { data, error } = await listNotebooksWithItemCount(supabase, user.id)

    if (error) {
        return serverError(error, "GET /api/notebooks")
    }

    const transformed = (data as unknown as NotebookWithCount[] ?? []).map((nb) => ({
        id: nb.id,
        name: nb.name,
        description: nb.description,
        group_id: nb.group_id ?? null,
        created_at: nb.created_at,
        updated_at: nb.updated_at,
        item_count: nb.notebook_items?.[0]?.count ?? 0,
    }))

    return NextResponse.json(transformed)
}

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`nb-post:${user.id}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)
    const name = typeof body?.name === "string" ? body.name.trim() : ""

    if (!name) {
        return NextResponse.json({ error: "Tên sổ tay không được để trống" }, { status: 400 })
    }

    const description = typeof body?.description === "string"
        ? body.description.trim() || null
        : null

    const groupId = typeof body?.group_id === "string" ? body.group_id : null

    if (groupId) {
        const { data: grp } = await supabase
            .from("notebook_groups")
            .select("id")
            .eq("id", groupId)
            .eq("user_id", user.id)
            .maybeSingle()
        if (!grp) {
            return NextResponse.json({ error: "Nhóm không tồn tại" }, { status: 400 })
        }
    }

    const { data, error } = await createNotebook(supabase, user.id, name, description ?? undefined, groupId)

    if (error) {
        return serverError(error, "POST /api/notebooks")
    }

    return NextResponse.json(data, { status: 201 })
}
