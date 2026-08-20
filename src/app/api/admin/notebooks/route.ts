import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

export async function GET() {
    // Auth before rate limit so we key by user ID, not spoofable IP
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const rl = await rateLimit(`admin-nb:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const { data, error } = await supabaseServer
        .from("notebooks")
        .select("id, name, description, group_id, is_public, public_category, public_description, display_order, created_at, updated_at, notebook_items(count)")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })

    if (error) return serverError(error, "GET /api/admin/notebooks")

    const result = (data ?? []).map((nb) => {
        const { notebook_items, ...rest } = nb as typeof nb & { notebook_items: { count: number }[] }
        return { ...rest, item_count: notebook_items?.[0]?.count ?? 0 }
    })

    return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
    // Auth before rate limit so we key by user ID, not spoofable IP
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const rl = await rateLimit(`admin-nb-post:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const body = await req.json().catch(() => null)
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    if (!name || name.length > 200) return NextResponse.json({ error: "Tên sổ tay không được để trống hoặc quá dài" }, { status: 400 })

    const { data, error } = await supabaseServer
        .from("notebooks")
        .insert({ user_id: user.id, name, description: body?.description ?? null })
        .select()
        .single()

    if (error) return serverError(error, "POST /api/admin/notebooks")
    return NextResponse.json(data, { status: 201 })
}
