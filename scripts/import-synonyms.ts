import dotenv from "dotenv"
import fs from "fs"
import path from "path"

import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

type VocabularyRow = {
    id: number
    primary_word: string | null
    primary_kana: string | null
}

type SynonymGroup = string[]

type RelationRow = {
    vocabulary_id: number
    related_vocabulary_id: number
    relation_type: "synonym"
    note_vi: null
    source: "manual_synonyms"
    status: "approved"
    confidence: number
}

const SYNONYMS_DIR = path.join(
    process.cwd(),
    "data-import",
    "relations",
    "synonyms"
)

async function getSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
        )
    }

    return createClient(url, serviceRoleKey)
}

async function fetchVocabularyMap() {
    const supabase = await getSupabaseClient()

    const rows: VocabularyRow[] = []
    const pageSize = 1000
    let from = 0

    while (true) {
        const { data, error } = await supabase
            .from("vocabularies")
            .select("id, primary_word, primary_kana")
            .range(from, from + pageSize - 1)

        if (error) {
            throw error
        }

        if (!data || data.length === 0) {
            break
        }

        rows.push(...(data as VocabularyRow[]))

        if (data.length < pageSize) {
            break
        }

        from += pageSize
    }

    const map = new Map<string, VocabularyRow>()

    for (const row of rows) {
        if (row.primary_word) {
            map.set(row.primary_word, row)
        }

        if (row.primary_kana) {
            map.set(row.primary_kana, row)
        }
    }

    return {
        supabase,
        vocabularyMap: map,
    }
}

function normalizeGroup(group: SynonymGroup) {
    return Array.from(
        new Set(
            group
                .map((word) => word.trim())
                .filter(Boolean)
        )
    )
}

function findVocabularyByWord(
    word: string,
    vocabularyMap: Map<string, VocabularyRow>
) {
    const exact = vocabularyMap.get(word)

    if (exact) {
        return exact
    }

    if (word.endsWith("する") && word.length > 2) {
        return vocabularyMap.get(word.slice(0, -2))
    }

    return undefined
}

function readSynonymGroups() {
    const files = fs
        .readdirSync(SYNONYMS_DIR)
        .filter((file) => file.endsWith(".json"))

    const groups: SynonymGroup[] = []

    for (const file of files) {
        const filePath = path.join(SYNONYMS_DIR, file)
        const raw = fs.readFileSync(filePath, "utf8")
        const json = JSON.parse(raw) as SynonymGroup[]

        const normalizedGroups = json
            .map(normalizeGroup)
            .filter((group) => group.length >= 2)

        console.log(
            `[read] ${file}: ${normalizedGroups.length} groups`
        )

        groups.push(...normalizedGroups)
    }

    return groups
}

function buildSynonymRows(
    groups: SynonymGroup[],
    vocabularyMap: Map<string, VocabularyRow>
) {
    const rows = new Map<string, RelationRow>()

    for (const group of groups) {
        const vocabularies = group
            .map((word) => ({
                word,
                vocabulary: findVocabularyByWord(
                    word,
                    vocabularyMap
                ),
            }))
            .filter(
                (
                    item
                ): item is {
                    word: string
                    vocabulary: VocabularyRow
                } => Boolean(item.vocabulary)
            )

        if (vocabularies.length < 2) {
            console.warn("[skip synonym group]", {
                group,
                found: vocabularies.map((item) => item.word),
            })
            continue
        }

        for (const source of vocabularies) {
            for (const target of vocabularies) {
                if (
                    source.vocabulary.id ===
                    target.vocabulary.id
                ) {
                    continue
                }

                const row: RelationRow = {
                    vocabulary_id: source.vocabulary.id,
                    related_vocabulary_id:
                        target.vocabulary.id,
                    relation_type: "synonym",
                    note_vi: null,
                    source: "manual_synonyms",
                    status: "approved",
                    confidence: 100,
                }

                rows.set(
                    `${row.vocabulary_id}:${row.related_vocabulary_id}:${row.relation_type}`,
                    row
                )
            }
        }
    }

    return Array.from(rows.values())
}

async function upsertRows(
    supabase: Awaited<ReturnType<typeof getSupabaseClient>>,
    rows: RelationRow[]
) {
    const batchSize = 500

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)

        const { error } = await supabase
            .from("vocabulary_relations")
            .upsert(batch, {
                onConflict:
                    "vocabulary_id,related_vocabulary_id,relation_type",
            })

        if (error) {
            throw error
        }

        console.log(
            `Inserted ${Math.min(
                i + batchSize,
                rows.length
            )}/${rows.length}`
        )
    }
}

async function main() {
    const groups = readSynonymGroups()

    console.log("Synonym groups:", groups.length)

    const { supabase, vocabularyMap } =
        await fetchVocabularyMap()

    console.log("Vocabulary map:", vocabularyMap.size)

    const rows = buildSynonymRows(groups, vocabularyMap)

    console.log("Synonym rows:", rows.length)
    console.log(rows.slice(0, 10))

    await upsertRows(supabase, rows)

    console.log("Done.")
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})