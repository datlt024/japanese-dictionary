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

    const [commentsResult, countResult] = await Promise.all([
        supabaseServer
            .from("word_comments")
            .select("id, user_id, content, likes_count, created_at, entry_type, entry_id")
            .order("created_at", { ascending: false })
            .range(offset, offset + PAGE_SIZE - 1),
        supabaseServer
            .from("word_comments")
            .select("id", { count: "exact", head: true }),
    ])

    if (commentsResult.error) return serverError(commentsResult.error, "GET /api/admin/comments")
    if (countResult.error) return serverError(countResult.error, "GET /api/admin/comments count")

    const comments = commentsResult.data ?? []
    const count = countResult.count ?? 0

    const userIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))]
    const profileMap: Record<string, string> = {}

    if (userIds.length > 0) {
        const { data: profiles } = await supabaseServer
            .from("user_profiles")
            .select("user_id, display_name")
            .in("user_id", userIds)
        for (const p of profiles ?? []) {
            if (p.user_id) profileMap[p.user_id] = p.display_name
        }
    }

    return NextResponse.json({
        comments: comments.map((c) => ({
            ...c,
            display_name: profileMap[c.user_id] ?? "Ẩn danh",
        })),
        total: count,
        page,
        has_more: (page + 1) * PAGE_SIZE < count,
    })
}
