import { supabase } from "@/shared/lib/supabase"

import type { GrammarPoint } from "../types"

export async function searchGrammarPoints(
    keyword: string
): Promise<GrammarPoint[]> {
    const value = keyword.trim()

    if (!value) {
        return []
    }

    const { data, error } = await supabase
        .from("grammars")
        .select("*")
        .or(
            [
                `pattern.ilike.%${value}%`,
                `reading.ilike.%${value}%`,
                `meaning_vi.ilike.%${value}%`,
                `meaning_en.ilike.%${value}%`,
                `short_meaning_vi.ilike.%${value}%`,
                `explanation_vi.ilike.%${value}%`,
                `explanation_en.ilike.%${value}%`,
            ].join(",")
        )
        .order("id", { ascending: true })
        .limit(20)

    if (error) {
        console.error("Supabase grammar search error:", error)
        return []
    }

    return (data ?? []) as GrammarPoint[]
}

export async function getGrammarPointById(
    id: string
): Promise<GrammarPoint | null> {
    const grammarId = Number(id)

    if (Number.isNaN(grammarId)) {
        return null
    }

    const { data, error } = await supabase
        .from("grammars")
        .select("*")
        .eq("id", grammarId)
        .maybeSingle()

    if (error) {
        console.error("Supabase grammar detail error:", error)
        return null
    }

    return data as GrammarPoint | null
}