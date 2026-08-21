import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"
import GrammarDataClient from "./GrammarDataClient"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Ngữ pháp | Yomi Admin" }

export default async function GrammarDataPage() {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || !isAdminUser(user)) redirect("/")

    const { data, count } = await supabaseServer
        .from("grammars")
        .select("id, pattern, display_pattern, jlpt_level, meaning_vi, short_meaning_vi, is_common, ai_status, slug, created_at", { count: "exact" })
        .order("jlpt_level", { ascending: true })
        .order("id", { ascending: true })
        .range(0, 49)

    return (
        <AppLayout title="Ngữ pháp" hideSearch>
            <GrammarDataClient initialRows={data ?? []} initialTotal={count ?? 0} />
        </AppLayout>
    )
}
