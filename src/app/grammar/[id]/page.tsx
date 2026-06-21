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
