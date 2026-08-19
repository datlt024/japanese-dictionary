import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const revalidate = 86400

import AppLayout from "@/shared/components/layout/AppLayout"

import GrammarDetailContent from "@/features/dictionary/grammar/components/GrammarDetailContent"
import {
    getGrammarPointById,
    searchGrammarPoints,
} from "@/server/services/grammar/grammar.service"
import { supabaseServer } from "@/server/supabase/server"

export async function generateStaticParams() {
    const { data } = await supabaseServer.from("grammars").select("id").limit(5000)
    return (data ?? []).map((g) => ({ id: String(g.id) }))
}

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const grammar = await getGrammarPointById(id)
    if (!grammar) return { title: "Ngữ pháp | Yomi" }
    const pattern = grammar.display_pattern ?? grammar.pattern
    const meaning = grammar.meaning_vi || grammar.meaning_en || ""
    return {
        title: `${pattern} — ${grammar.jlpt_level ?? "Ngữ pháp"} | Yomi`,
        description: meaning
            ? `${pattern}: ${meaning}. Giải thích ngữ pháp tiếng Nhật bằng tiếng Việt.`
            : `Tra cứu ngữ pháp ${pattern} tiếng Nhật.`,
        alternates: { canonical: `/grammar/${id}` },
    }
}

export default async function GrammarDetailPage({ params, searchParams }: Props) {
    const { id } = await params
    const { q: keyword = "" } = await searchParams

    const [grammar, keywordRelated] = await Promise.all([
        getGrammarPointById(id),
        keyword ? searchGrammarPoints(keyword) : Promise.resolve(null),
    ])

    if (!grammar) notFound()

    const relatedGrammars = (
        keywordRelated ?? await searchGrammarPoints(grammar.pattern)
    ).filter((g) => g.id !== grammar.id)

    return (
        <AppLayout
            title="Tra cứu"
            searchKeyword={keyword || grammar.pattern}
            activeSearchTab="grammar"
        >
            <GrammarDetailContent
                grammar={grammar}
                relatedGrammars={relatedGrammars}
                keyword={keyword}
            />
        </AppLayout>
    )
}
