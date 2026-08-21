import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { serverError } from "@/server/utils/api-error"
import { parseBody } from "@/server/utils/validate"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    listNotebookGroups,
    createNotebookGroup,
} from "@/server/repositories/notebook/notebook-groups.repository"

export const dynamic = "force-dynamic"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = await rateLimit(`nbg-get:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { data, error } = await listNotebookGroups(supabaseServer, user.id)

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

    const rl = await rateLimit(`nbg-post:${user.id}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const raw = await request.json().catch(() => null)
    const parsed = parseBody(raw, {
        name: { type: "string", min: 1, max: 200 },
        description: { type: "string", max: 500, optional: true },
    })
    if (!parsed.ok) return parsed.response

    const { name } = parsed.data
    const description = parsed.data.description?.trim() || null

    const { data, error } = await createNotebookGroup(supabaseServer, user.id, name, description ?? undefined)

    if (error) {
        return serverError(error, "POST /api/notebook-groups")
    }

    return NextResponse.json(data, { status: 201 })
}
