import type { Metadata } from "next"
import { supabaseServer } from "@/server/supabase/server"
import AppLayout from "@/shared/components/layout/AppLayout"
import GrammarDataClient from "./GrammarDataClient"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Ngữ pháp | Yomi Admin" }

export default async function GrammarDataPage() {

    const { data, count } = await supabaseServer
        .from("grammars")
        .select("id, pattern, display_pattern, jlpt_level, meaning_vi, short_meaning_vi, explanation_vi, nuance_vi, is_common, ai_status, slug, created_at", { count: "exact" })
        .order("jlpt_level", { ascending: true })
        .order("id", { ascending: true })
        .range(0, 49)

    return (
        <AppLayout title="Ngữ pháp" hideSearch>
            <GrammarDataClient initialRows={data ?? []} initialTotal={count ?? 0} />
        </AppLayout>
    )
}
