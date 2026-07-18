import type { Metadata } from "next"
import { notFound } from "next/navigation"

import AppLayout from "@/shared/components/layout/AppLayout"

import GrammarDetailContent from "@/features/dictionary/grammar/components/GrammarDetailContent"
import {
    getGrammarPointById,
    searchGrammarPoints,
} from "@/features/dictionary/grammar/services/grammar.service"

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
    }
}

export default async function GrammarDetailPage({ params, searchParams }: Props) {
    const { id } = await params
    const { q: keyword = "" } = await searchParams

    const grammar = await getGrammarPointById(id)

    if (!grammar) notFound()

    const relatedGrammars = (
        await searchGrammarPoints(keyword || grammar.pattern)
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
