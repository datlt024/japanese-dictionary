import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"
import KanjiDataClient from "./KanjiDataClient"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Hán tự | Yomi Admin" }

export default async function KanjiDataPage() {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || !isAdminUser(user)) redirect("/")

    const { data, count } = await supabaseServer
        .from("kanjis")
        .select("id, kanji, meaning_vi, meaning_en, onyomi, kunyomi, han_viet, jlpt, stroke_count, created_at", { count: "exact" })
        .order("jlpt", { ascending: true, nullsFirst: false })
        .order("id", { ascending: true })
        .range(0, 49)

    return (
        <AppLayout title="Hán tự" hideSearch>
            <KanjiDataClient initialRows={data ?? []} initialTotal={count ?? 0} />
        </AppLayout>
    )
}
