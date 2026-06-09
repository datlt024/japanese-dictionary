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

type RelationRow = {
    vocabulary_id: number
    related_vocabulary_id: number
    relation_type: "antonym"
    note_vi: null
    source: "manual_antonyms"
    status: "approved"
    confidence: number
}

const ANTONYM_PATH = path.join(
    process.cwd(),
    "data-import",
    "relations",
    "antonyms.json"
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

function buildAntonymRows(
    pairs: [string, string][],
    vocabularyMap: Map<string, VocabularyRow>
) {
    const rows = new Map<string, RelationRow>()

    for (const [left, right] of pairs) {
        const leftVocabulary = vocabularyMap.get(left)
        const rightVocabulary = vocabularyMap.get(right)

        if (!leftVocabulary || !rightVocabulary) {
            console.warn("[skip antonym]", {
                left,
                right,
                leftFound: Boolean(leftVocabulary),
                rightFound: Boolean(rightVocabulary),
            })
            continue
        }

        const pairRows: RelationRow[] = [
            {
                vocabulary_id: leftVocabulary.id,
                related_vocabulary_id: rightVocabulary.id,
                relation_type: "antonym",
                note_vi: null,
                source: "manual_antonyms",
                status: "approved",
                confidence: 100,
            },
            {
                vocabulary_id: rightVocabulary.id,
                related_vocabulary_id: leftVocabulary.id,
                relation_type: "antonym",
                note_vi: null,
                source: "manual_antonyms",
                status: "approved",
                confidence: 100,
            },
        ]

        for (const row of pairRows) {
            rows.set(
                `${row.vocabulary_id}:${row.related_vocabulary_id}:${row.relation_type}`,
                row
            )
        }
    }

    return Array.from(rows.values())
}

async function main() {
    const raw = fs.readFileSync(ANTONYM_PATH, "utf8")
    const pairs = JSON.parse(raw) as [string, string][]

    console.log("Antonym pairs:", pairs.length)

    const { supabase, vocabularyMap } =
        await fetchVocabularyMap()

    console.log("Vocabulary map:", vocabularyMap.size)

    const rows = buildAntonymRows(pairs, vocabularyMap)

    console.log("Antonym rows:", rows.length)
    console.log(rows.slice(0, 10))

    const { error } = await supabase
        .from("vocabulary_relations")
        .upsert(rows, {
            onConflict:
                "vocabulary_id,related_vocabulary_id,relation_type",
        })

    if (error) {
        throw error
    }

    console.log("Done.")
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})