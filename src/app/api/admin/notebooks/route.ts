import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUserId } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"

export async function GET() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUserId(user.id)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const { data, error } = await supabase
        .from("notebooks")
        .select("id, name, description, is_public, public_category, public_description, display_order, created_at, updated_at")
        .eq("user_id", user.id)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })

    if (error) return serverError(error, "GET /api/admin/notebooks")

    // Fetch item counts
    const counts = await Promise.all(
        (data ?? []).map((nb) =>
            supabase
                .from("notebook_items")
                .select("*", { count: "exact", head: true })
                .eq("notebook_id", nb.id)
                .then(({ count }) => ({ id: nb.id, count: count ?? 0 }))
        )
    )
    const countMap = new Map(counts.map((c) => [c.id, c.count]))

    const result = (data ?? []).map((nb) => ({
        ...nb,
        item_count: countMap.get(nb.id) ?? 0,
    }))

    return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUserId(user.id)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

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
