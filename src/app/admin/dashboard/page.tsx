import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUserId } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"
import DashboardClient from "./DashboardClient"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Dashboard | Yomi Admin" }

export default async function AdminDashboardPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUserId(user.id)) redirect("/")

    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
        return {
            label: d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" }),
            start: d.toISOString(),
            end: new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString(),
        }
    })

    const [userCounts, practiceCounts, notebookCounts, commentCounts, contentTotals] = await Promise.all([
        Promise.all(months.map(m =>
            supabase.from("user_profiles").select("id", { count: "exact", head: true })
                .gte("created_at", m.start).lt("created_at", m.end)
                .then(({ count }) => count ?? 0)
        )),
        Promise.all(months.map(m =>
            supabase.from("practice_sessions").select("id", { count: "exact", head: true })
                .gte("created_at", m.start).lt("created_at", m.end)
                .then(({ count }) => count ?? 0)
        )),
        Promise.all(months.map(m =>
            supabase.from("notebooks").select("id", { count: "exact", head: true })
                .gte("created_at", m.start).lt("created_at", m.end)
                .then(({ count }) => count ?? 0)
        )),
        Promise.all(months.map(m =>
            supabase.from("word_comments").select("id", { count: "exact", head: true })
                .gte("created_at", m.start).lt("created_at", m.end)
                .then(({ count }) => count ?? 0)
        )),
        Promise.all([
            supabase.from("vocabularies").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
            supabase.from("kanjis").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
            supabase.from("grammars").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
            supabase.from("user_profiles").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
        ]),
    ])

    const [vocabTotal, kanjiTotal, grammarTotal, userTotal] = contentTotals

    const updatedAt = new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit", minute: "2-digit",
        day: "2-digit", month: "2-digit", year: "numeric",
    })
    const monthLabel = now.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })

    return (
        <AppLayout hideSearch>
            <DashboardClient
                data={{
                    months: months.map(m => ({ label: m.label })),
                    userCounts,
                    practiceCounts,
                    notebookCounts,
                    commentCounts,
                    vocabTotal,
                    kanjiTotal,
                    grammarTotal,
                    userTotal,
                    updatedAt,
                    monthLabel,
                }}
            />
        </AppLayout>
    )
}
