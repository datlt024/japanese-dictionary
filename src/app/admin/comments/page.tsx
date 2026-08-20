import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"
import CommentsClient from "./CommentsClient"

import styles from "./page.module.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Bình luận | Yomi Admin",
}

const PAGE_SIZE = 50

type Props = {
    searchParams: Promise<{ page?: string; entry_type?: string }>
}

export default async function AdminCommentsPage({ searchParams }: Props) {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || !isAdminUser(user)) redirect("/")

    const resolved = await searchParams
    const page = Math.max(0, Number(resolved.page ?? "0") || 0)
    const entryType = resolved.entry_type ?? ""

    const offset = page * PAGE_SIZE

    let query = supabaseServer
        .from("word_comments")
        .select("id, user_id, entry_type, entry_id, content, likes_count, created_at, user_profiles(display_name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

    if (entryType && ["vocabulary", "kanji", "grammar"].includes(entryType)) {
        query = query.eq("entry_type", entryType)
    }

    const { data: comments, count, error } = await query

    if (error) {
        return (
            <AppLayout title="Bình luận" hideSearch>
                <div className={styles.page}>
                    <p style={{ color: "var(--color-danger)" }}>Lỗi tải dữ liệu: {String(error.message)}</p>
                </div>
            </AppLayout>
        )
    }

    const total = count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    type CommentRow = typeof comments extends (infer T)[] | null ? T : never
    type CommentWithProfile = CommentRow & {
        user_profiles: { display_name: string } | null
    }

    const rows = (comments ?? []) as unknown as CommentWithProfile[]

    return (
        <AppLayout title="Bình luận" hideSearch>
            <div className={styles.page}>
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Bình luận</h1>
                        <p className={styles.pageSubtitle}>{total.toLocaleString("vi-VN")} bình luận tổng cộng</p>
                    </div>
                </div>

                <CommentsClient
                    comments={rows.map((c) => ({
                        id: c.id,
                        user_id: c.user_id,
                        display_name: c.user_profiles?.display_name ?? "Ẩn danh",
                        entry_type: c.entry_type,
                        entry_id: c.entry_id,
                        content: c.content,
                        likes_count: c.likes_count,
                        created_at: c.created_at,
                    }))}
                    total={total}
                    page={page}
                    totalPages={totalPages}
                    currentEntryType={entryType}
                />
            </div>
        </AppLayout>
    )
}
