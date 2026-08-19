import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUserId } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

export async function GET() {
    // Auth before rate limit so we key by user ID (not IP), preventing
    // unauthenticated callers from exhausting the admin bucket
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUserId(user.id)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const rl = rateLimit(`admin-grp:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const { data: groups, error } = await supabase
        .from("notebook_groups")
        .select("id, name, description, is_public, public_description, display_order, created_at")
        .eq("user_id", user.id)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true })

    if (error) return serverError(error, "GET /api/admin/groups")

    // Fetch notebook counts per group in parallel
    const counts = await Promise.all(
        (groups ?? []).map(async (g) => {
            const { count } = await supabase
                .from("notebooks")
                .select("*", { count: "exact", head: true })
                .eq("group_id", g.id)
            return { id: g.id, count: count ?? 0 }
        })
    )
    const countMap = new Map(counts.map((c) => [c.id, c.count]))

    const result = (groups ?? []).map((g) => ({
        ...g,
        notebook_count: countMap.get(g.id) ?? 0,
    }))

    return NextResponse.json(result)
}
