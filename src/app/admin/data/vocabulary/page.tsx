import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { isAdminUser } from "@/server/utils/admin"
import AppLayout from "@/shared/components/layout/AppLayout"
import VocabularyDataClient from "./VocabularyDataClient"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Từ vựng | Yomi Admin" }

export default async function VocabularyDataPage() {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || !isAdminUser(user)) redirect("/")

    const { data, count } = await supabaseServer
        .from("vocabularies")
        .select("id, primary_word, primary_kana, romaji, jlpt, is_common, verb_group, created_at, vocabulary_senses(id, meaning_vi, meaning_en, sense_index)", { count: "exact" })
        .order("id", { ascending: true })
        .range(0, 49)

    return (
        <AppLayout title="Từ vựng" hideSearch>
            <VocabularyDataClient initialRows={data ?? []} initialTotal={count ?? 0} />
        </AppLayout>
    )
}
