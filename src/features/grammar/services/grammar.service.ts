import { supabase } from "@/lib/supabase"

export type GrammarPoint = {
    id: number
    pattern: string
    jlpt_level: string | null
    meaning_vi: string | null
    meaning_en: string | null
    structure: string | null
    explanation_vi: string | null
    explanation_en: string | null
    example_jp: string | null
    example_vi: string | null
    source: string | null
}

export async function searchGrammarPoints(
    keyword: string
): Promise<GrammarPoint[]> {
    const value = keyword.trim()

    if (!value) {
        return []
    }

    const { data, error } = await supabase
        .from("grammar_points")
        .select("*")
        .or(
            [
                `pattern.ilike.%${value}%`,
                `meaning_vi.ilike.%${value}%`,
                `meaning_en.ilike.%${value}%`,
                `structure.ilike.%${value}%`,
            ].join(",")
        )
        .limit(20)

    if (error) {
        console.error("Supabase grammar search error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        })

        return []
    }

    return (data ?? []) as GrammarPoint[]
}

export async function getGrammarPointById(
    id: string
): Promise<GrammarPoint | null> {
    const { data, error } = await supabase
        .from("grammar_points")
        .select("*")
        .eq("id", Number(id))
        .maybeSingle()

    if (error) {
        console.error("Supabase grammar detail error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        })

        return null
    }

    return data as GrammarPoint | null
}