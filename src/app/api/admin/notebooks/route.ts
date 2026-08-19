import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUserId } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

export async function GET() {
    // Auth before rate limit so we key by user ID, not spoofable IP
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUserId(user.id)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const rl = await rateLimit(`admin-nb:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const { data, error } = await supabase
        .from("notebooks")
        .select("id, name, description, group_id, is_public, public_category, public_description, display_order, created_at, updated_at")
        .eq("user_id", user.id)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })

    if (error) return serverError(error, "GET /api/admin/notebooks")

    // Fetch all item counts in a single query and group by notebook_id in JS
    const notebookIds = (data ?? []).map((nb) => nb.id)
    const countMap = new Map<string, number>()
    if (notebookIds.length > 0) {
        const { data: allCounts } = await supabase
            .from("notebook_items")
            .select("notebook_id")
            .in("notebook_id", notebookIds)
        for (const row of allCounts ?? []) {
            countMap.set(row.notebook_id, (countMap.get(row.notebook_id) ?? 0) + 1)
        }
    }

    const result = (data ?? []).map((nb) => ({
        ...nb,
        item_count: countMap.get(nb.id) ?? 0,
    }))

    return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
    // Auth before rate limit so we key by user ID, not spoofable IP
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUserId(user.id)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const rl = await rateLimit(`admin-nb-post:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const body = await req.json().catch(() => null)
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    if (!name) return NextResponse.json({ error: "Tên sổ tay không được để trống" }, { status: 400 })

    const { data, error } = await supabase
        .from("notebooks")
        .insert({ user_id: user.id, name, description: body?.description ?? null })
        .select()
        .single()

    if (error) return serverError(error, "POST /api/admin/notebooks")
    return NextResponse.json(data, { status: 201 })
}
