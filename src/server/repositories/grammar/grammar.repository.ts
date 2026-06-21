import { supabaseServer } from "@/server/supabase/server"

const GRAMMAR_DETAIL_COLUMNS = `
    id,
    source_id,
    slug,
    pattern,
    reading,
    jlpt_level,
    meaning_vi,
    meaning_en,
    short_meaning_vi,
    explanation_vi,
    explanation_en,
    nuance_vi,
    frequency,
    is_common,
    sort_order,
    created_at,
    updated_at,
    grammar_formations (
        id,
        group_index,
        left_text,
        remove_text,
        right_text
    ),
    grammar_variants (
        id,
        pattern,
        variant_type
    ),
    grammar_examples (
        id,
        japanese,
        translation_vi,
        example_order
    ),
    grammar_notes (
        id,
        note_text,
        sort_order
    ),
    grammar_tags (
        id,
        tag
    ),
    grammar_common_pairs (
        id,
        expression
    ),
    grammar_short_forms (
        id,
        pattern
    ),
    grammar_differences (
        id,
        compared_pattern,
        difference_text
    )
`

const SEARCH_GRAMMAR_COLUMNS = `
    id,
    source_id,
    slug,
    pattern,
    reading,
    jlpt_level,
    meaning_vi,
    meaning_en,
    short_meaning_vi,
    explanation_vi,
    explanation_en,
    nuance_vi,
    frequency,
    is_common,
    sort_order,
    created_at,
    updated_at
`

const SEARCH_LIMIT = 20

function normalizeKeyword(keyword: string) {
    return keyword.trim()
}

function escapeLikePattern(keyword: string) {
    return keyword.replace(/[%_]/g, "\\$&")
}

function mapGrammarDetail(row: any) {
    if (!row) return null

    const formationGroups = new Map<number, any[]>()

        ; (row.grammar_formations ?? []).forEach((item: any) => {
            const groupIndex = item.group_index ?? 1

            if (!formationGroups.has(groupIndex)) {
                formationGroups.set(groupIndex, [])
            }

            formationGroups.get(groupIndex)?.push({
                left: item.left_text,
                remove: item.remove_text,
                right: item.right_text,
            })
        })

    const formation = Array.from(formationGroups.entries())
        .sort(([a], [b]) => a - b)
        .map(([, patterns]) => ({
            patterns,
        }))

    const examples = (row.grammar_examples ?? [])
        .sort(
            (a: any, b: any) =>
                (a.example_order ?? 0) - (b.example_order ?? 0)
        )
        .map((item: any) => ({
            japanese: item.japanese,
            translation_vi: item.translation_vi,
            jp: item.japanese,
            vi: item.translation_vi,
        }))

    const notes = (row.grammar_notes ?? [])
        .sort(
            (a: any, b: any) =>
                (a.sort_order ?? 0) - (b.sort_order ?? 0)
        )
        .map((item: any) => item.note_text)
        .filter(Boolean)

    const tags = (row.grammar_tags ?? [])
        .map((item: any) => item.tag)
        .filter(Boolean)

    const differences = (row.grammar_differences ?? [])
        .map((item: any) => ({
            compared_pattern: item.compared_pattern,
            pattern: item.compared_pattern,
            difference_text: item.difference_text,
            explanation_vi: item.difference_text,
        }))
        .filter((item: any) => item.compared_pattern || item.difference_text)

    const variants = (row.grammar_variants ?? []).map((item: any) => ({
        pattern: item.pattern,
        type: item.variant_type,
    }))

    const common_pairs = (row.grammar_common_pairs ?? []).map(
        (item: any) => ({
            expression: item.expression,
            pattern: item.expression,
        })
    )

    const short_forms = (row.grammar_short_forms ?? []).map(
        (item: any) => ({
            pattern: item.pattern,
        })
    )

    return {
        ...row,

        formation,
        examples,
        notes,
        tags,
        differences,

        similar_grammar: [],
        variants,
        common_pairs,
        short_forms,

        grammar_formations: row.grammar_formations ?? [],
        grammar_variants: row.grammar_variants ?? [],
        grammar_examples: row.grammar_examples ?? [],
        grammar_notes: row.grammar_notes ?? [],
        grammar_tags: row.grammar_tags ?? [],
        grammar_common_pairs: row.grammar_common_pairs ?? [],
        grammar_short_forms: row.grammar_short_forms ?? [],
        grammar_differences: row.grammar_differences ?? [],
    }
}

export async function searchGrammarPointsByKeyword(keyword: string) {
    const value = escapeLikePattern(normalizeKeyword(keyword))

    if (!value) {
        return {
            data: [],
            error: null,
        }
    }

    const { data, error } = await (supabaseServer.from("grammars") as any)
        .select(SEARCH_GRAMMAR_COLUMNS)
        .or(
            [
                `pattern.ilike.%${value}%`,
                `reading.ilike.%${value}%`,
                `slug.ilike.%${value}%`,
                `source_id.ilike.%${value}%`,
                `meaning_vi.ilike.%${value}%`,
                `meaning_en.ilike.%${value}%`,
                `short_meaning_vi.ilike.%${value}%`,
                `explanation_vi.ilike.%${value}%`,
                `explanation_en.ilike.%${value}%`,
            ].join(",")
        )
        .order("sort_order", {
            ascending: true,
        })
        .limit(SEARCH_LIMIT)

    return {
        data: data ?? [],
        error,
    }
}

export async function findGrammarPointById(id: number) {
    const { data, error } = await (supabaseServer.from("grammars") as any)
        .select(GRAMMAR_DETAIL_COLUMNS)
        .eq("id", id)
        .maybeSingle()

    return {
        data: mapGrammarDetail(data),
        error,
    }
}

export async function findGrammarPointBySourceId(sourceId: string) {
    const { data, error } = await (supabaseServer.from("grammars") as any)
        .select(GRAMMAR_DETAIL_COLUMNS)
        .eq("source_id", sourceId)
        .maybeSingle()

    return {
        data: mapGrammarDetail(data),
        error,
    }
}

export async function findGrammarPointByIdOrSourceId(value: string) {
    const numericId = Number(value)

    if (Number.isInteger(numericId)) {
        return findGrammarPointById(numericId)
    }

    return findGrammarPointBySourceId(value)
}