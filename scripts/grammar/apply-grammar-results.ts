import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: ".env.local" })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESULTS_DIR = path.join(process.cwd(), "data/generated/grammar-results")

type FormationPattern =
    | { left: string | null; remove: string | null; right: string | null }
    | { structure: string; tokens: unknown[] }

type FormationGroup = {
    patterns: FormationPattern[]
}

type EnrichedGrammar = {
    id: number
    meaning_vi: string
    short_meaning_vi: string
    explanation_vi: string
    nuance_vi: string | null
    formation: FormationGroup[]
    variants: { pattern: string; type: string }[]
    short_forms: { pattern: string }[]
    common_pairs: { expression: string }[]
    notes: string[]
    similar_grammar: string[]
    differences: { pattern: string; difference_vi: string }[]
    tags: string[]
    examples: { japanese: string; translation_vi: string }[]
}

type ResultFile = {
    batch_id: string
    results: EnrichedGrammar[]
}

function normalizeText(value: unknown): string | null {
    if (typeof value !== "string") return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

function isRemovePattern(p: FormationPattern): p is { left: string | null; remove: string | null; right: string | null } {
    return "left" in p || "remove" in p || "right" in p
}

function isStructurePattern(p: FormationPattern): p is { structure: string; tokens: unknown[] } {
    return "structure" in p
}

async function deleteChildRows(grammarId: number) {
    const tables = [
        "grammar_formations",
        "grammar_variants",
        "grammar_examples",
        "grammar_notes",
        "grammar_tags",
        "grammar_common_pairs",
        "grammar_short_forms",
        "grammar_differences",
        "grammar_similar",
    ]

    for (const table of tables) {
        const { error } = await supabase
            .from(table as any)
            .delete()
            .eq("grammar_id", grammarId)

        if (error) {
            console.error(`Failed to delete from ${table} for grammar ${grammarId}:`, error.message)
            throw error
        }
    }
}

async function insertChildRows(grammarId: number, grammar: EnrichedGrammar) {
    if (grammar.formation?.length) {
        const formationRows: any[] = []

        grammar.formation.forEach((group, groupIndex) => {
            group.patterns?.forEach((p) => {
                if (isRemovePattern(p)) {
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
                } else if (isStructurePattern(p)) {
                    const structure = normalizeText(p.structure)
                    if (!structure) return

                    formationRows.push({
                        grammar_id: grammarId,
                        group_index: groupIndex + 1,
                        left_text: null,
                        remove_text: null,
                        right_text: structure,
                    })
                }
            })
        })

        if (formationRows.length > 0) {
            const { error } = await supabase.from("grammar_formations").insert(formationRows)
            if (error) throw error
        }
    }

    if (grammar.variants?.length) {
        const rows = grammar.variants
            .filter((v) => normalizeText(v.pattern))
            .map((v) => ({
                grammar_id: grammarId,
                pattern: v.pattern,
                variant_type: normalizeText(v.type),
            }))

        if (rows.length > 0) {
            const { error } = await supabase.from("grammar_variants").insert(rows)
            if (error) throw error
        }
    }

    if (grammar.examples?.length) {
        const rows = grammar.examples
            .filter((ex) => normalizeText(ex.japanese))
            .map((ex, i) => ({
                grammar_id: grammarId,
                japanese: ex.japanese,
                translation_vi: normalizeText(ex.translation_vi),
                example_order: i + 1,
            }))

        if (rows.length > 0) {
            const { error } = await supabase.from("grammar_examples").insert(rows)
            if (error) throw error
        }
    }

    if (grammar.notes?.length) {
        const rows = grammar.notes
            .map((note, i) => ({ text: normalizeText(note), index: i }))
            .filter(({ text }) => text)
            .map(({ text, index }) => ({
                grammar_id: grammarId,
                note_text: text!,
                sort_order: index + 1,
            }))

        if (rows.length > 0) {
            const { error } = await supabase.from("grammar_notes").insert(rows)
            if (error) throw error
        }
    }

    if (grammar.tags?.length) {
        const rows = grammar.tags
            .filter((tag) => normalizeText(tag))
            .map((tag) => ({ grammar_id: grammarId, tag }))

        if (rows.length > 0) {
            const { error } = await supabase.from("grammar_tags").insert(rows)
            if (error) throw error
        }
    }

    if (grammar.common_pairs?.length) {
        const rows = grammar.common_pairs
            .filter((pair) => normalizeText(pair.expression))
            .map((pair) => ({ grammar_id: grammarId, expression: pair.expression }))

        if (rows.length > 0) {
            const { error } = await supabase.from("grammar_common_pairs").insert(rows)
            if (error) throw error
        }
    }

    if (grammar.short_forms?.length) {
        const rows = grammar.short_forms
            .filter((sf) => normalizeText(sf.pattern))
            .map((sf) => ({ grammar_id: grammarId, pattern: sf.pattern }))

        if (rows.length > 0) {
            const { error } = await supabase.from("grammar_short_forms").insert(rows)
            if (error) throw error
        }
    }

    if (grammar.differences?.length) {
        const rows = grammar.differences
            .filter((d) => normalizeText(d.pattern) && normalizeText(d.difference_vi))
            .map((d) => ({
                grammar_id: grammarId,
                compared_pattern: d.pattern,
                difference_text: d.difference_vi,
            }))

        if (rows.length > 0) {
            const { error } = await supabase.from("grammar_differences").insert(rows)
            if (error) throw error
        }
    }

    if (grammar.similar_grammar?.length) {
        const patterns = grammar.similar_grammar.filter((p) => normalizeText(p))

        if (patterns.length > 0) {
            const { data: matched, error: lookupError } = await (supabase.from("grammars") as any)
                .select("id")
                .in("pattern", patterns)

            if (lookupError) throw lookupError

            if (matched?.length) {
                const rows = (matched as { id: number }[]).map((g) => ({
                    grammar_id: grammarId,
                    similar_grammar_id: g.id,
                }))

                const { error } = await (supabase.from("grammar_similar") as any).insert(rows)
                if (error) throw error
            }
        }
    }
}

async function applyGrammar(grammar: EnrichedGrammar) {
    const { error: updateError } = await (supabase.from("grammars") as any)
        .update({
            meaning_vi: grammar.meaning_vi,
            short_meaning_vi: grammar.short_meaning_vi,
            explanation_vi: grammar.explanation_vi,
            nuance_vi: grammar.nuance_vi ?? null,
            ai_status: "done",
        })
        .eq("id", grammar.id)

    if (updateError) {
        console.error(`Failed to update grammar ${grammar.id}:`, updateError.message)
        throw updateError
    }

    await deleteChildRows(grammar.id)
    await insertChildRows(grammar.id, grammar)
}

async function main() {
    if (!fs.existsSync(RESULTS_DIR)) {
        console.log("No results directory found, nothing to apply")
        return
    }

    const files = fs
        .readdirSync(RESULTS_DIR)
        .filter((f) => f.endsWith(".json"))
        .sort()

    if (files.length === 0) {
        console.log("No result files found in", RESULTS_DIR)
        return
    }

    console.log(`Found ${files.length} result file(s)`)

    let totalApplied = 0
    let totalFailed = 0

    for (const file of files) {
        const filePath = path.join(RESULTS_DIR, file)
        let parsed: ResultFile

        try {
            parsed = JSON.parse(fs.readFileSync(filePath, "utf8"))
        } catch {
            console.error(`Failed to parse ${file}, skipping`)
            continue
        }

        const results = parsed.results ?? []
        console.log(`\nApplying ${results.length} grammar(s) from ${file}`)

        for (const grammar of results) {
            try {
                await applyGrammar(grammar)
                totalApplied++
                process.stdout.write(".")
            } catch (err) {
                totalFailed++
                console.error(`\nFailed to apply grammar ${grammar.id}:`, err)
            }
        }

        console.log()
    }

    console.log(`\nDone — applied: ${totalApplied}, failed: ${totalFailed}`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
