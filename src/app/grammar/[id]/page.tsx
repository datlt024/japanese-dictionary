"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

import type { GrammarPoint } from "@/domain/grammar"

import AppLayout from "@/shared/components/layout/AppLayout"

import GrammarDetailContent from "@/features/dictionary/grammar/components/GrammarDetailContent"

import {
    getGrammarPointById,
    searchGrammarPoints,
} from "@/features/dictionary/grammar/services/grammar.service"

export default function GrammarDetailPage() {
    const params = useParams<{ id: string }>()
    const searchParams = useSearchParams()

    const id = params.id
    const keywordFromUrl = searchParams.get("q") || ""

    const [grammar, setGrammar] = useState<GrammarPoint | null>(null)
    const [relatedGrammars, setRelatedGrammars] = useState<GrammarPoint[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchGrammar() {
            setLoading(true)

            try {
                const data = await getGrammarPointById(id)

                if (!data) {
                    setGrammar(null)
                    setRelatedGrammars([])
                    return
                }

                setGrammar(data)

                const related = await searchGrammarPoints(
                    keywordFromUrl || data.pattern
                )

                setRelatedGrammars(
                    related.filter((item) => item.id !== data.id)
                )
            } catch (error) {
                console.error("Failed to fetch grammar:", error)
                setGrammar(null)
                setRelatedGrammars([])
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchGrammar()
        }
    }, [id, keywordFromUrl])

    return (
        <AppLayout
            title="Tra cứu"
            searchKeyword={keywordFromUrl || grammar?.pattern || ""}
            activeSearchTab="grammar"
        >
            <GrammarDetailContent
                grammar={grammar}
                relatedGrammars={relatedGrammars}
                loading={loading}
                keyword={keywordFromUrl}
            />
        </AppLayout>
    )
}