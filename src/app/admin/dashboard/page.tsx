import { redirect } from "next/navigation"
import { unstable_cache } from "next/cache"
import type { Metadata } from "next"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUserId } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"
import DashboardClient from "./DashboardClient"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Dashboard | Yomi Admin" }

function buildMonths(now: Date) {
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
        return {
            label: d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" }),
            start: d.toISOString(),
            end: new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString(),
        }
    })
}

// Cache key changes each calendar month, so data auto-refreshes monthly.
// Within a month, stale-while-revalidate of 5 minutes keeps charts fresh.
const getDashboardStats = unstable_cache(
    async (monthKey: string) => {
        const now = new Date(monthKey + "-01")
        const months = buildMonths(now)

        const [userCounts, practiceCounts, notebookCounts, commentCounts, contentTotals] =
            await Promise.all([
                Promise.all(months.map(m =>
                    supabaseServer.from("user_profiles")
                        .select("id", { count: "exact", head: true })
                        .gte("created_at", m.start).lt("created_at", m.end)
                        .then(({ count }) => count ?? 0)
                )),
                Promise.all(months.map(m =>
                    supabaseServer.from("practice_sessions")
                        .select("id", { count: "exact", head: true })
                        .gte("created_at", m.start).lt("created_at", m.end)
                        .then(({ count }) => count ?? 0)
                )),
                Promise.all(months.map(m =>
                    supabaseServer.from("notebooks")
                        .select("id", { count: "exact", head: true })
                        .gte("created_at", m.start).lt("created_at", m.end)
                        .then(({ count }) => count ?? 0)
                )),
                Promise.all(months.map(m =>
                    supabaseServer.from("word_comments")
                        .select("id", { count: "exact", head: true })
                        .gte("created_at", m.start).lt("created_at", m.end)
                        .then(({ count }) => count ?? 0)
                )),
                Promise.all([
                    supabaseServer.from("vocabularies").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
                    supabaseServer.from("kanjis").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
                    supabaseServer.from("grammars").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
                    supabaseServer.from("user_profiles").select("id", { count: "exact", head: true }).then(({ count }) => count ?? 0),
                ]),
            ])

        const [vocabTotal, kanjiTotal, grammarTotal, userTotal] = contentTotals

        return {
            months: months.map(m => ({ label: m.label })),
            userCounts,
            practiceCounts,
            notebookCounts,
            commentCounts,
            vocabTotal,
            kanjiTotal,
            grammarTotal,
            userTotal,
        }
    },
    ["admin-dashboard-stats"],
    { revalidate: 300 }
)

export default async function AdminDashboardPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminUserId(user.id)) redirect("/")

    const now = new Date()
    // Use YYYY-MM as the cache-key segment so the cache auto-invalidates each month.
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

    const stats = await getDashboardStats(monthKey)

    const updatedAt = now.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit", minute: "2-digit",
        day: "2-digit", month: "2-digit", year: "numeric",
    })
    const monthLabel = now.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })

    return (
        <AppLayout hideSearch>
            <DashboardClient
                data={{
                    ...stats,
                    updatedAt,
                    monthLabel,
                }}
            />
        </AppLayout>
    )
}
