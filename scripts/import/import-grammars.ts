import dotenv from "dotenv"
import fs from "fs/promises"
import path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type FormationPattern = {
    left?: string | null
    remove?: string | null
    right?: string | null
}

type RawRubyItem = {
    base?: string | null
    reading?: string | null
}

type RawSense = {
    sense_index?: number | null
    meaning_vi?: string | null
    explanation_vi?: string | null
    nuance_vi?: string | null
}

type RawSpecialCase = {
    from?: string | null
    to?: string | null
    note?: string | null
}

type RawGrammar = {
    id: string
    slug: string
    pattern: string
    display_pattern?: string | null
    reading?: string | null
    jlpt_level: string
    meaning_vi: string
    meaning_en?: string | null
    short_meaning_vi?: string | null
    explanation_vi?: string | null
    explanation_en?: string | null
    nuance_vi?: string | null
    register?: string | null
    formation?: {
        patterns?: FormationPattern[]
    }[]
    variants?: {
        pattern?: string | null
        type?: string | null
    }[]
    short_forms?: (
        | string
        | {
            pattern?: string | null
        }
    )[]
    common_pairs?: (
        | string
        | {
            expression?: string | null
            pattern?: string | null
        }
    )[]
    senses?: RawSense[]
    special_cases?: RawSpecialCase[]
    notes?: string[]
    tags?: string[]
    examples?: {
        sentence_jp?: string | null
        japanese?: string | null
        jp?: string | null
        translation_vi?: string | null
        vi?: string | null
        ruby?: RawRubyItem[]
    }[]
    differences?: {
        compared_pattern?: string | null
        pattern?: string | null
        grammar?: string | null
        difference_text?: string | null
        explanation_vi?: string | null
        description_vi?: string | null
    }[]
    similar_grammar?: string[]
}

function normalizeText(value: unknown): string | null {
    if (typeof value !== "string") return null

    const trimmed = value.trim()

    return trimmed.length > 0 ? trimmed : null
}

async function insertMany(table: string, rows: Record<string, unknown>[]) {
    if (rows.length === 0) return

    const { error } = await supabase.from(table).insert(rows)

    if (error) {
        console.error(`Insert failed: ${table}`)
        throw error
    }
}

async function main() {
    const filePath = path.join(
        process.cwd(),
        "data-import",
        "grammar-n5.json"
    )

    const raw = await fs.readFile(filePath, "utf8")
    const parsed = JSON.parse(raw)

    const data: RawGrammar[] = Array.isArray(parsed)
        ? parsed
        : parsed.grammars ?? parsed.items ?? parsed.data ?? []

    if (!Array.isArray(data)) {
        throw new Error("Invalid grammar JSON format")
    }

    console.log(`Found ${data.length} grammar items`)

    await supabase.from("grammar_differences").delete().neq("id", 0)
    await supabase.from("grammar_similar").delete().neq("grammar_id", 0)
    await supabase.from("grammar_short_forms").delete().neq("id", 0)
    await supabase.from("grammar_common_pairs").delete().neq("id", 0)
    await supabase.from("grammar_tags").delete().neq("id", 0)
    await supabase.from("grammar_notes").delete().neq("id", 0)
    await supabase.from("grammar_senses").delete().neq("id", 0)
    await supabase.from("grammar_examples").delete().neq("id", 0)
    await supabase.from("grammar_variants").delete().neq("id", 0)
    await supabase.from("grammar_formations").delete().neq("id", 0)
    await supabase.from("grammars").delete().neq("id", 0)

    const grammarRows = data.map((g, index) => ({
        source_id: g.id,
        slug: g.slug,
        pattern: g.pattern,
        display_pattern: g.display_pattern ?? null,
        reading: g.reading ?? null,
        jlpt_level: g.jlpt_level,
        meaning_vi: g.meaning_vi,
        meaning_en: g.meaning_en ?? null,
        short_meaning_vi: g.short_meaning_vi ?? null,
        explanation_vi: g.explanation_vi ?? null,
        explanation_en: g.explanation_en ?? null,
        nuance_vi: g.nuance_vi ?? null,
        register: g.register ?? null,
        special_cases: g.special_cases ?? [],
        frequency: "medium",
        is_common: true,
        sort_order: index + 1,
    }))

    const { data: insertedGrammars, error } = await supabase
        .from("grammars")
        .insert(grammarRows)
        .select("id, source_id")

    if (error) throw error

    const grammarIdMap = new Map(
        insertedGrammars.map((g) => [g.source_id, g.id])
    )

    const formationRows: Record<string, unknown>[] = []
    const variantRows: Record<string, unknown>[] = []
    const exampleRows: Record<string, unknown>[] = []
    const senseRows: Record<string, unknown>[] = []
    const noteRows: Record<string, unknown>[] = []
    const tagRows: Record<string, unknown>[] = []
    const commonPairRows: Record<string, unknown>[] = []
    const shortFormRows: Record<string, unknown>[] = []
    const differenceRows: Record<string, unknown>[] = []

    for (const g of data) {
        const grammarId = grammarIdMap.get(g.id)
        if (!grammarId) continue

        g.formation?.forEach((group, groupIndex) => {
            group.patterns?.forEach((p) => {
                const leftText = normalizeText(p.left)
                const removeText = normalizeText(p.remove)
                const rightText = normalizeText(p.right)

                if (!leftText && !removeText && !rightText) return

                formationRows.push({
                    grammar_id: grammarId,
                    group_index: groupIndex + 1,
                    left_text: leftText,
                    remove_text: removeText,
                    right_text: rightText,
                })
            })
        })

        g.variants?.forEach((v) => {
            const pattern = normalizeText(v.pattern)
            if (!pattern) return

            variantRows.push({
                grammar_id: grammarId,
                pattern,
                variant_type: normalizeText(v.type),
            })
        })

        g.examples?.forEach((ex, index) => {
            const japanese =
                normalizeText(ex.sentence_jp) ??
                normalizeText(ex.japanese) ??
                normalizeText(ex.jp)
            if (!japanese) return

            const ruby = (ex.ruby ?? [])
                .filter((r) => r.base && r.reading)
                .map((r) => ({ base: r.base!, reading: r.reading! }))

            exampleRows.push({
                grammar_id: grammarId,
                japanese,
                ruby,
                translation_vi:
                    normalizeText(ex.translation_vi) ?? normalizeText(ex.vi),
                example_order: index + 1,
            })
        })

        g.senses?.forEach((s, index) => {
            const meaning_vi = normalizeText(s.meaning_vi)
            if (!meaning_vi) return

            senseRows.push({
                grammar_id: grammarId,
                sense_index: s.sense_index ?? index + 1,
                meaning_vi,
                explanation_vi: normalizeText(s.explanation_vi),
                nuance_vi: normalizeText(s.nuance_vi),
            })
        })

        g.notes?.forEach((note, index) => {
            const noteText = normalizeText(note)
            if (!noteText) return

            noteRows.push({
                grammar_id: grammarId,
                note_text: noteText,
                sort_order: index + 1,
            })
        })

        g.tags?.forEach((tag) => {
            const tagText = normalizeText(tag)
            if (!tagText) return

            tagRows.push({
                grammar_id: grammarId,
                tag: tagText,
            })
        })

        g.common_pairs?.forEach((pair) => {
            const expression =
                typeof pair === "string"
                    ? normalizeText(pair)
                    : normalizeText(pair.expression) ?? normalizeText(pair.pattern)

            if (!expression) return

            commonPairRows.push({
                grammar_id: grammarId,
                expression,
            })
        })

        g.short_forms?.forEach((sf) => {
            const pattern =
                typeof sf === "string"
                    ? normalizeText(sf)
                    : normalizeText(sf.pattern)

            if (!pattern) return

            shortFormRows.push({
                grammar_id: grammarId,
                pattern,
            })
        })

        g.differences?.forEach((diff) => {
            const comparedPattern =
                normalizeText(diff.grammar) ??
                normalizeText(diff.compared_pattern) ??
                normalizeText(diff.pattern)

            const differenceText =
                normalizeText(diff.description_vi) ??
                normalizeText(diff.difference_text) ??
                normalizeText(diff.explanation_vi)

            if (!comparedPattern || !differenceText) return

            differenceRows.push({
                grammar_id: grammarId,
                compared_pattern: comparedPattern,
                difference_text: differenceText,
            })
        })
    }

    await insertMany("grammar_formations", formationRows)
    await insertMany("grammar_variants", variantRows)
    await insertMany("grammar_examples", exampleRows)
    await insertMany("grammar_senses", senseRows)
    await insertMany("grammar_notes", noteRows)
    await insertMany("grammar_tags", tagRows)
    await insertMany("grammar_common_pairs", commonPairRows)
    await insertMany("grammar_short_forms", shortFormRows)
    await insertMany("grammar_differences", differenceRows)

    // Resolve similar_grammar: pattern strings → DB IDs
    const patternToDbId = new Map(
        insertedGrammars.map((r) => {
            const item = data.find((d) => d.id === r.source_id)
            return [item?.pattern ?? "", r.id]
        })
    )

    const resolvedSimilarRows: Record<string, unknown>[] = []
    for (const g of data) {
        if (!g.similar_grammar?.length) continue
        const grammarId = grammarIdMap.get(g.id)
        if (!grammarId) continue

        for (const pattern of g.similar_grammar) {
            const similarId = patternToDbId.get(pattern)
            if (similarId && similarId !== grammarId) {
                resolvedSimilarRows.push({ grammar_id: grammarId, similar_grammar_id: similarId })
            }
        }
    }

    await insertMany("grammar_similar", resolvedSimilarRows)

    console.log("Import completed")
    console.log({
        grammars: grammarRows.length,
        formations: formationRows.length,
        variants: variantRows.length,
        examples: exampleRows.length,
        senses: senseRows.length,
        notes: noteRows.length,
        similar: resolvedSimilarRows.length,
        tags: tagRows.length,
        common_pairs: commonPairRows.length,
        short_forms: shortFormRows.length,
        differences: differenceRows.length,
    })
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})