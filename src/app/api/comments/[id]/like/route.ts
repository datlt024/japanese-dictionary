import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { addLike, getLike, removeLike } from "@/server/repositories/community/community.repository"
import { serverError } from "@/server/utils/api-error"

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

    try {
        const existing = await getLike(supabase, user.id, commentId)

        if (existing.data) {
            await removeLike(supabase, user.id, commentId)
            const { data: comment } = await supabase
                .from("word_comments")
                .select("likes_count")
                .eq("id", commentId)
                .single()
            const newCount = Math.max(0, (comment?.likes_count ?? 1) - 1)
            await supabase
                .from("word_comments")
                .update({ likes_count: newCount })
                .eq("id", commentId)
            return NextResponse.json({ liked: false, likes_count: newCount })
        }

        await addLike(supabase, user.id, commentId)
        const { data: comment } = await supabase
            .from("word_comments")
            .select("likes_count")
            .eq("id", commentId)
            .single()
        const newCount = (comment?.likes_count ?? 0) + 1
        await supabase
            .from("word_comments")
            .update({ likes_count: newCount })
            .eq("id", commentId)

        return NextResponse.json({ liked: true, likes_count: newCount })
    } catch (err) {
        return serverError(err, "POST /api/comments/[id]/like")
    }
}
