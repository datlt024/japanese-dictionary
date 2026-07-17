import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import {
    countComments,
    createComment,
    getUserLikedCommentIds,
    listComments,
    upsertProfile,
} from "@/server/repositories/community/community.repository"
import type { EntryType, SortOrder } from "@/server/repositories/community/community.repository"

const ENTRY_TYPES: EntryType[] = ["vocabulary", "kanji", "grammar"]
const SORT_ORDERS: SortOrder[] = ["likes", "newest"]
const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const entryType = searchParams.get("type") as EntryType
    const entryIdRaw = searchParams.get("id")
    const sort = (searchParams.get("sort") ?? "likes") as SortOrder
    const pageRaw = searchParams.get("page") ?? "0"

    if (!ENTRY_TYPES.includes(entryType)) {
        return NextResponse.json({ error: "type không hợp lệ" }, { status: 400 })
    }
    const entryId = Number(entryIdRaw)
    if (!Number.isInteger(entryId) || entryId <= 0) {
        return NextResponse.json({ error: "id không hợp lệ" }, { status: 400 })
    }
    const page = Math.max(0, Number(pageRaw) || 0)
    const resolvedSort = SORT_ORDERS.includes(sort) ? sort : "likes"

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const [commentsResult, countResult] = await Promise.all([
        listComments(supabase, entryType, entryId, resolvedSort, PAGE_SIZE, page * PAGE_SIZE),
        countComments(supabase, entryType, entryId),
    ])

    if (commentsResult.error) {
        return NextResponse.json({ error: commentsResult.error.message }, { status: 500 })
    }

    const comments = commentsResult.data ?? []
    const total = countResult.count ?? 0

    let likedIds: string[] = []
    if (user && comments.length > 0) {
        const commentIds = comments.map((c) => c.id)
        const likesResult = await getUserLikedCommentIds(supabase, user.id, commentIds)
        likedIds = (likesResult.data ?? []).map((r) => r.comment_id)
    }

    return NextResponse.json({
        comments: comments.map((c) => ({
            id: c.id,
            user_id: c.user_id,
            content: c.content,
            likes_count: c.likes_count,
            created_at: c.created_at,
            display_name: (c.user_profiles as unknown as { display_name: string; jlpt_level: string | null } | null)?.display_name ?? "Ẩn danh",
            jlpt_level: (c.user_profiles as unknown as { display_name: string; jlpt_level: string | null } | null)?.jlpt_level ?? null,
            liked_by_me: likedIds.includes(c.id),
            is_mine: user?.id === c.user_id,
        })),
        total,
        page,
        has_more: (page + 1) * PAGE_SIZE < total,
    })
}

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Cần đăng nhập để bình luận" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const entryType = body?.entry_type as EntryType
    const entryId = Number(body?.entry_id)
    const content = typeof body?.content === "string" ? body.content.trim() : ""
    const displayName = typeof body?.display_name === "string" ? body.display_name.trim() : ""
    const jlptLevel = typeof body?.jlpt_level === "string" ? body.jlpt_level || null : null

    if (!ENTRY_TYPES.includes(entryType)) {
        return NextResponse.json({ error: "entry_type không hợp lệ" }, { status: 400 })
    }
    if (!Number.isInteger(entryId) || entryId <= 0) {
        return NextResponse.json({ error: "entry_id không hợp lệ" }, { status: 400 })
    }
    if (!content || content.length > 500) {
        return NextResponse.json({ error: "Nội dung bình luận từ 1–500 ký tự" }, { status: 400 })
    }
    if (!displayName || displayName.length > 30) {
        return NextResponse.json({ error: "Tên hiển thị từ 1–30 ký tự" }, { status: 400 })
    }

    await upsertProfile(supabase, user.id, displayName, jlptLevel)

    const { data, error } = await createComment(supabase, user.id, entryType, entryId, content)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const profile = data.user_profiles as unknown as { display_name: string; jlpt_level: string | null } | null

    return NextResponse.json({
        id: data.id,
        user_id: data.user_id,
        content: data.content,
        likes_count: data.likes_count,
        created_at: data.created_at,
        display_name: profile?.display_name ?? displayName,
        jlpt_level: profile?.jlpt_level ?? jlptLevel,
        liked_by_me: false,
        is_mine: true,
    }, { status: 201 })
}
