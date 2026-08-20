import { unstable_cache } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { serverError } from "@/server/utils/api-error"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"
import {
    createComment,
    getUserLikedCommentIds,
    upsertProfile,
} from "@/server/repositories/community/community.repository"
import type { EntryType, SortOrder } from "@/server/repositories/community/community.repository"

export const dynamic = "force-dynamic"

const ENTRY_TYPES: EntryType[] = ["vocabulary", "kanji", "grammar"]
const SORT_ORDERS: SortOrder[] = ["likes", "newest"]
const PAGE_SIZE = 10

// Fetch public comments + count in one round-trip, with profiles inlined via FK join.
// Declared at module scope so Next.js can deduplicate concurrent requests by stable
// function reference. Arguments are passed through to the inner async fn.
const getPublicCommentPage = unstable_cache(
    async (entryType: EntryType, entryId: number, sort: SortOrder, page: number) => {
        const orderCol = sort === "likes" ? "likes_count" : "created_at"
        const offset = page * PAGE_SIZE
        const [commentsResult, countResult] = await Promise.all([
            supabaseServer
                .from("word_comments")
                .select("id, user_id, content, likes_count, created_at, user_profiles(display_name, jlpt_level)")
                .eq("entry_type", entryType)
                .eq("entry_id", entryId)
                .order(orderCol, { ascending: false })
                .range(offset, offset + PAGE_SIZE - 1),
            supabaseServer
                .from("word_comments")
                .select("id", { count: "exact", head: true })
                .eq("entry_type", entryType)
                .eq("entry_id", entryId),
        ])
        return { commentsResult, countResult }
    },
    ["public-comments"],
    { revalidate: 60 }
)

export async function GET(request: NextRequest) {
    const ip = getClientIp(request)
    const rl = await rateLimit(`comments-get:${ip}`, 60, 60_000)
    if (!rl.ok) return rl.response

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

    // Run auth check and comment page fetch in parallel — auth result is only needed
    // to personalize liked_by_me/is_mine, which we apply after both complete.
    const [{ data: { user } }, { commentsResult, countResult }] = await Promise.all([
        createSupabaseServerClient().then((s) => s.auth.getUser()),
        getPublicCommentPage(entryType, entryId, resolvedSort, page),
    ])

    if (commentsResult.error) {
        return serverError(commentsResult.error, "GET /api/comments")
    }

    type CommentWithProfile = {
        id: string
        user_id: string
        content: string
        likes_count: number
        created_at: string
        user_profiles: { display_name: string; jlpt_level: string | null } | null
    }
    const comments = (commentsResult.data ?? []) as unknown as CommentWithProfile[]
    const total = countResult.count ?? 0

    const likedIds = user && comments.length > 0
        ? await getUserLikedCommentIds(supabaseServer, user.id, comments.map((c) => c.id))
            .then((r) => (r.data ?? []).map((row) => row.comment_id))
        : []

    return NextResponse.json({
        comments: comments.map((c) => ({
            id: c.id,
            user_id: c.user_id,
            content: c.content,
            likes_count: c.likes_count,
            created_at: c.created_at,
            display_name: c.user_profiles?.display_name ?? "Ẩn danh",
            jlpt_level: c.user_profiles?.jlpt_level ?? null,
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

    const rl = await rateLimit(`comments-post:${user.id}`, 20, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)
    const entryType = body?.entry_type as EntryType
    const entryId = Number(body?.entry_id)
    const content = typeof body?.content === "string" ? body.content.trim() : ""
    const displayName = typeof body?.display_name === "string" ? body.display_name.trim() : ""
    const VALID_JLPT = new Set(["N1", "N2", "N3", "N4", "N5"])
    const jlptLevel = typeof body?.jlpt_level === "string" && VALID_JLPT.has(body.jlpt_level)
        ? body.jlpt_level
        : null

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

    await upsertProfile(supabaseServer, user.id, displayName, jlptLevel)

    const { data, error } = await createComment(supabaseServer, user.id, entryType, entryId, content)

    if (error) {
        return serverError(error, "POST /api/comments")
    }

    return NextResponse.json({
        id: data.id,
        user_id: data.user_id,
        content: data.content,
        likes_count: data.likes_count,
        created_at: data.created_at,
        display_name: displayName,
        jlpt_level: jlptLevel,
        liked_by_me: false,
        is_mine: true,
    }, { status: 201 })
}
