import type { Metadata } from "next"

import { supabaseServer } from "@/server/supabase/server"
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
    const resolved = await searchParams
    const page = Math.max(0, Number(resolved.page ?? "0") || 0)
    const entryType = resolved.entry_type ?? ""
    const offset = page * PAGE_SIZE

    let baseQuery = supabaseServer
        .from("word_comments")
        .select("id, user_id, entry_type, entry_id, content, likes_count, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

    if (entryType && ["vocabulary", "kanji", "grammar"].includes(entryType)) {
        baseQuery = baseQuery.eq("entry_type", entryType)
    }

    // Fetch comments + all user profiles in parallel
    const [{ data: comments, count, error }, { data: allProfiles }] = await Promise.all([
        baseQuery,
        supabaseServer.from("user_profiles").select("user_id, display_name"),
    ])

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

    const profileMap: Record<string, string> = {}
    for (const p of allProfiles ?? []) {
        if (p.user_id) profileMap[p.user_id] = p.display_name
    }

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
                    comments={(comments ?? []).map((c) => ({
                        id: c.id,
                        user_id: c.user_id,
                        display_name: profileMap[c.user_id] ?? "Ẩn danh",
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
