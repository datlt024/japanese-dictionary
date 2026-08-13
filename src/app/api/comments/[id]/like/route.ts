import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { addLike, getLike, removeLike } from "@/server/repositories/community/community.repository"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id: commentId } = await params
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 })
    }

    const rl = rateLimit(`like:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    try {
        const existing = await getLike(supabase, user.id, commentId)

        const liked = !existing.data

        if (existing.data) {
            await removeLike(supabase, user.id, commentId)
        } else {
            await addLike(supabase, user.id, commentId)
        }

        // Recount from source of truth to avoid read-modify-write race conditions
        const { count } = await supabase
            .from("word_comment_likes")
            .select("*", { count: "exact", head: true })
            .eq("comment_id", commentId)

        const newCount = count ?? 0
        await supabase
            .from("word_comments")
            .update({ likes_count: newCount })
            .eq("id", commentId)

        return NextResponse.json({ liked, likes_count: newCount })
    } catch (err) {
        return serverError(err, "POST /api/comments/[id]/like")
    }
}
