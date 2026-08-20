import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
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

    const rl = await rateLimit(`like:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    try {
        const existing = await getLike(supabaseServer, user.id, commentId)

        const liked = !existing.data

        if (existing.data) {
            const { error: removeError } = await removeLike(supabaseServer, user.id, commentId)
            if (removeError) return serverError(removeError, "POST /api/comments/[id]/like")
        } else {
            const { error: addError } = await addLike(supabaseServer, user.id, commentId)
            if (addError) return serverError(addError, "POST /api/comments/[id]/like")
        }

        // Recount from source of truth to avoid read-modify-write race conditions.
        // This is safer than reading likes_count and incrementing/decrementing it,
        // but a narrow race still exists between the COUNT query and the UPDATE.
        // The ideal fix is a database trigger that keeps likes_count in sync automatically:
        //   CREATE TRIGGER sync_likes_count AFTER INSERT OR DELETE ON word_comment_likes
        //   FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();
        const { count } = await supabaseServer
            .from("word_comment_likes")
            .select("*", { count: "exact", head: true })
            .eq("comment_id", commentId)

        const newCount = count ?? 0
        await supabaseServer
            .from("word_comments")
            .update({ likes_count: newCount })
            .eq("id", commentId)

        return NextResponse.json({ liked, likes_count: newCount })
    } catch (err) {
        return serverError(err, "POST /api/comments/[id]/like")
    }
}
