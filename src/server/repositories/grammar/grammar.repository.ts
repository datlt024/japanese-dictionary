import type { Database } from "@/shared/types/database.generated"

import type { GrammarRubyItem, GrammarSpecialCase } from "@/domain/grammar"

import { supabaseServer } from "@/server/supabase/server"

type GrammarRow = Database["public"]["Tables"]["grammars"]["Row"]
type GrammarFormationRow = Database["public"]["Tables"]["grammar_formations"]["Row"]
type GrammarVariantRow = Database["public"]["Tables"]["grammar_variants"]["Row"]
type GrammarExampleRow = Database["public"]["Tables"]["grammar_examples"]["Row"]
type GrammarSenseRow = Database["public"]["Tables"]["grammar_senses"]["Row"]
type GrammarNoteRow = Database["public"]["Tables"]["grammar_notes"]["Row"]
type GrammarTagRow = Database["public"]["Tables"]["grammar_tags"]["Row"]
type GrammarCommonPairRow = Database["public"]["Tables"]["grammar_common_pairs"]["Row"]
type GrammarShortFormRow = Database["public"]["Tables"]["grammar_short_forms"]["Row"]
type GrammarDifferenceRow = Database["public"]["Tables"]["grammar_differences"]["Row"]
type GrammarSimilarRow = Database["public"]["Tables"]["grammar_similar"]["Row"]

type GrammarDetailRow = GrammarRow & {
    grammar_formations: GrammarFormationRow[]
    grammar_variants: GrammarVariantRow[]
    grammar_examples: GrammarExampleRow[]
    grammar_senses: GrammarSenseRow[]
    grammar_notes: GrammarNoteRow[]
    grammar_tags: GrammarTagRow[]
    grammar_common_pairs: GrammarCommonPairRow[]
    grammar_short_forms: GrammarShortFormRow[]
    grammar_differences: GrammarDifferenceRow[]
}

const GRAMMAR_DETAIL_COLUMNS = `
    id,
    source_id,
    slug,
    pattern,
    display_pattern,
    reading,
    jlpt_level,
    meaning_vi,
    meaning_en,
    short_meaning_vi,
    explanation_vi,
    explanation_en,
    nuance_vi,
    register,
    special_cases,
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
        ruby,
        translation_vi,
        example_order
    ),
    grammar_senses (
        id,
        sense_index,
        meaning_vi,
        explanation_vi,
        nuance_vi
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


async function fetchSimilarGrammarPatterns(grammarId: number): Promise<string[]> {
    const { data: links } = await supabaseServer
        .from("grammar_similar")
        .select("similar_grammar_id")
        .eq("grammar_id", grammarId)

    if (!links?.length) return []

    const ids = (links as GrammarSimilarRow[]).map((l) => l.similar_grammar_id)

    const { data: grammars } = await supabaseServer
        .from("grammars")
        .select("pattern")
        .in("id", ids)

    return (grammars ?? []).map((g) => g.pattern)
}

function mapGrammarDetail(row: GrammarDetailRow | null, similar_grammar: string[] = []) {
    if (!row) return null

    const formationGroups = new Map<
        number,
        { left: string | null; remove: string | null; right: string | null }[]
    >()

    ;(row.grammar_formations ?? []).forEach((item) => {
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
        .map(([, patterns]) => ({ patterns }))

    const examples = (row.grammar_examples ?? [])
        .sort(
            (a, b) => (a.example_order ?? 0) - (b.example_order ?? 0)
        )
        .map((item) => ({
            jp: item.japanese,
            vi: item.translation_vi ?? "",
            ruby: (item.ruby as GrammarRubyItem[]) ?? [],
        }))

    const senses = (row.grammar_senses ?? [])
        .sort((a, b) => (a.sense_index ?? 0) - (b.sense_index ?? 0))
        .map((item) => ({
            sense_index: item.sense_index,
            meaning_vi: item.meaning_vi,
            explanation_vi: item.explanation_vi ?? null,
            nuance_vi: item.nuance_vi ?? null,
        }))

    const notes = (row.grammar_notes ?? [])
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((item) => item.note_text)
        .filter(Boolean)

    const tags = (row.grammar_tags ?? [])
        .map((item) => item.tag)
        .filter(Boolean)

    const differences = (row.grammar_differences ?? [])
        .map((item) => ({
            grammar: item.compared_pattern,
            description_vi: item.difference_text,
        }))
        .filter((item) => item.grammar || item.description_vi)

    const variants = (row.grammar_variants ?? []).map((item) => ({
        pattern: item.pattern,
        type: item.variant_type,
    }))

    const common_pairs = (row.grammar_common_pairs ?? []).map((item) => ({
        expression: item.expression,
    }))

    const short_forms = (row.grammar_short_forms ?? []).map((item) => ({
        pattern: item.pattern,
    }))

    return {
        ...row,

        formation,
        examples,
        senses,
        special_cases: (row.special_cases as GrammarSpecialCase[]) ?? [],
        notes,
        tags,
        differences,

        similar_grammar,
        variants,
        common_pairs,
        short_forms,
    }
}


export async function findGrammarPointById(id: number) {
    // Run main query and similar-patterns lookup in parallel — both only need `id`
    const [{ data: rawData, error }, similar_grammar] = await Promise.all([
        supabaseServer
            .from("grammars")
            .select(GRAMMAR_DETAIL_COLUMNS)
            .eq("id", id)
            .maybeSingle(),
        fetchSimilarGrammarPatterns(id),
    ])

    return {
        data: mapGrammarDetail(rawData as unknown as GrammarDetailRow | null, similar_grammar),
        error,
    }
}

export async function findGrammarPointBySourceId(sourceId: string) {
    const { data: rawData, error } = await supabaseServer
        .from("grammars")
        .select(GRAMMAR_DETAIL_COLUMNS)
        .eq("source_id", sourceId)
        .maybeSingle()

    const similar_grammar = rawData
        ? await fetchSimilarGrammarPatterns((rawData as { id: number }).id)
        : []

    return {
        data: mapGrammarDetail(rawData as unknown as GrammarDetailRow | null, similar_grammar),
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
