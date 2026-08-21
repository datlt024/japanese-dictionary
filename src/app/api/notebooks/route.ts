import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { serverError } from "@/server/utils/api-error"
import { parseBody } from "@/server/utils/validate"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    createNotebook,
    listNotebooksWithItemCount,
    type NotebookWithCount,
} from "@/server/repositories/notebook/notebook.repository"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 50

export async function GET(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`nb-get:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor") ?? undefined
    const limitParam = parseInt(searchParams.get("limit") ?? "", 10)
    const limit = isNaN(limitParam) || limitParam <= 0 ? PAGE_SIZE : Math.min(limitParam, 200)

    const { data, error } = await listNotebooksWithItemCount(supabaseServer, user.id, { cursor, limit })

    if (error) {
        return serverError(error, "GET /api/notebooks")
    }

    const rows = data as unknown as NotebookWithCount[] ?? []
    const transformed = rows.map((nb) => ({
        id: nb.id,
        name: nb.name,
        description: nb.description,
        group_id: nb.group_id ?? null,
        created_at: nb.created_at,
        updated_at: nb.updated_at,
        item_count: nb.notebook_items?.[0]?.count ?? 0,
    }))

    const headers: Record<string, string> = {}
    if (rows.length === limit) {
        headers["X-Next-Cursor"] = rows[rows.length - 1].created_at
    }

    return NextResponse.json(transformed, { headers: Object.keys(headers).length ? headers : undefined })
}

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`nb-post:${user.id}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const raw = await request.json().catch(() => null)
    const parsed = parseBody(raw, {
        name: { type: "string", min: 1, max: 200 },
        description: { type: "string", max: 500, optional: true },
        group_id: { type: "string", optional: true },
    })
    if (!parsed.ok) return parsed.response

    const { name, group_id: groupId = null } = parsed.data
    const description = parsed.data.description?.trim() || null

    if (groupId) {
        const { data: grp } = await supabaseServer
            .from("notebook_groups")
            .select("id")
            .eq("id", groupId)
            .eq("user_id", user.id)
            .maybeSingle()
        if (!grp) {
            return NextResponse.json({ error: "Nhóm không tồn tại" }, { status: 400 })
        }
    }

    const { data, error } = await createNotebook(supabaseServer, user.id, name, description ?? undefined, groupId)

    if (error) {
        return serverError(error, "POST /api/notebooks")
    }

    return NextResponse.json(data, { status: 201 })
}
