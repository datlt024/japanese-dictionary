import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
    }

    const rl = await rateLimit(`admin-comments-get:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const { searchParams } = request.nextUrl
    const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0)
    const PAGE_SIZE = 50
    const offset = page * PAGE_SIZE

    const { data, error, count } = await supabaseServer
        .from("word_comments")
        .select("id, user_id, content, likes_count, created_at, entry_type, entry_id, user_profiles(display_name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

    if (error) return serverError(error, "GET /api/admin/comments")

    return NextResponse.json({
        comments: data ?? [],
        total: count ?? 0,
        page,
        has_more: (page + 1) * PAGE_SIZE < (count ?? 0),
    })
}
