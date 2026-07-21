import dotenv from "dotenv"
import fs from "fs"
import path from "path"

import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

type JmdictGloss = {
    text?: string
}

type JmdictSense = {
    gloss?: JmdictGloss[]
    partOfSpeech?: string[]
    antonym?: (string | number)[][]
    related?: (string | number)[][]
}

type JmdictKana = {
    text: string
    common?: boolean
}

type JmdictKanji = {
    text: string
    common?: boolean
}

type JmdictEntry = {
    id?: string | number
    kanji?: JmdictKanji[]
    kana?: JmdictKana[]
    sense?: JmdictSense[]
}

type VocabularyRow = {
    id: number
    primary_word: string | null
    primary_kana: string | null
    is_common: boolean | null
}

type VocabularyRelationInsert = {
    vocabulary_id: number
    related_vocabulary_id: number
    relation_type: "synonym" | "antonym" | "related"
    note_vi: string | null
    source: string
    status: "auto"
    confidence: number
}

const JM_DICT_PATH = path.join(
    process.cwd(),
    "data-import",
    "jmdict-eng-3.6.2.json"
)

const MIN_GROUP_SIZE = 2
const MAX_GROUP_SIZE = 8
const MAX_RELATIONS_PER_WORD = 12

function getEntryWords(entry: JmdictEntry) {
    const words = new Set<string>()

    for (const item of entry.kanji || []) {
        if (item.text) {
            words.add(item.text)
        }
    }

    for (const item of entry.kana || []) {
        if (item.text) {
            words.add(item.text)
        }
    }

    return Array.from(words)
}

function getPrimaryWord(entry: JmdictEntry) {
    const commonKanji =
        entry.kanji?.find((item) => item.common)?.text

    const firstKanji = entry.kanji?.[0]?.text
    const commonKana =
        entry.kana?.find((item) => item.common)?.text

    const firstKana = entry.kana?.[0]?.text

    return commonKanji || firstKanji || commonKana || firstKana || null
}

function getGlossKey(entry: JmdictEntry) {
    const firstSense = entry.sense?.[0]
    const firstGloss = firstSense?.gloss?.[0]?.text

    if (!firstGloss) {
        return null
    }

    return firstGloss
        .toLowerCase()
        .replace(/\(.+?\)/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
}

function isGoodGlossKey(key: string) {
    if (key.length < 4) {
        return false
    }

    const badKeys = new Set([
        "thing",
        "person",
        "place",
        "time",
        "way",
        "one",
        "something",
        "someone",
        "to do",
        "to be",
        "to become",
        "to make",
        "to go",
        "to come",
        "to say",
    ])

    return !badKeys.has(key)
}

function getConfidence(entry: JmdictEntry) {
    const hasCommon =
        entry.kanji?.some((item) => item.common) ||
        entry.kana?.some((item) => item.common)

    return hasCommon ? 85 : 70
}

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
            .select("id, primary_word, primary_kana, is_common")
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

function buildRelatedRelations(
    entries: JmdictEntry[],
    vocabularyMap: Map<string, VocabularyRow>
) {
    const relations = new Map<string, VocabularyRelationInsert>()

    for (const entry of entries) {
        const words = getEntryWords(entry)
            .map((word) => vocabularyMap.get(word))
            .filter(Boolean) as VocabularyRow[]

        const uniqueWords = Array.from(
            new Map(words.map((item) => [item.id, item])).values()
        )

        if (uniqueWords.length < MIN_GROUP_SIZE) {
            continue
        }

        if (uniqueWords.length > MAX_GROUP_SIZE) {
            continue
        }

        const confidence = getConfidence(entry)

        for (const source of uniqueWords) {
            let count = 0

            for (const target of uniqueWords) {
                if (source.id === target.id) {
                    continue
                }

                if (count >= MAX_RELATIONS_PER_WORD) {
                    break
                }

                const key = `${source.id}:${target.id}:related`

                if (relations.has(key)) {
                    continue
                }

                relations.set(key, {
                    vocabulary_id: source.id,
                    related_vocabulary_id: target.id,
                    relation_type: "related",
                    note_vi: null,
                    source: "jmdict_forms",
                    status: "auto",
                    confidence,
                })

                count += 1
            }
        }
    }

    return Array.from(relations.values())
}

function buildSynonymRelations(
    entries: JmdictEntry[],
    vocabularyMap: Map<string, VocabularyRow>
) {
    const groups = new Map<string, VocabularyRow[]>()

    for (const entry of entries) {
        const glossKey = getGlossKey(entry)

        if (!glossKey || !isGoodGlossKey(glossKey)) {
            continue
        }

        const primaryWord = getPrimaryWord(entry)

        if (!primaryWord) {
            continue
        }

        const vocabulary = vocabularyMap.get(primaryWord)

        if (!vocabulary) {
            continue
        }

        const group = groups.get(glossKey) || []

        if (!group.some((item) => item.id === vocabulary.id)) {
            group.push(vocabulary)
        }

        groups.set(glossKey, group)
    }

    const relations = new Map<string, VocabularyRelationInsert>()

    for (const group of groups.values()) {
        const commonGroup = group.filter((item) => item.is_common)

        const items =
            commonGroup.length >= MIN_GROUP_SIZE
                ? commonGroup
                : group

        if (
            items.length < MIN_GROUP_SIZE ||
            items.length > MAX_GROUP_SIZE
        ) {
            continue
        }

        for (const source of items) {
            let count = 0

            for (const target of items) {
                if (source.id === target.id) {
                    continue
                }

                if (count >= MAX_RELATIONS_PER_WORD) {
                    break
                }

                const key = `${source.id}:${target.id}:synonym`

                if (relations.has(key)) {
                    continue
                }

                relations.set(key, {
                    vocabulary_id: source.id,
                    related_vocabulary_id: target.id,
                    relation_type: "synonym",
                    note_vi: null,
                    source: "jmdict_gloss",
                    status: "auto",
                    confidence:
                        source.is_common && target.is_common ? 80 : 65,
                })

                count += 1
            }
        }
    }

    return Array.from(relations.values())
}

function buildAntonymRelationsFromJmdict(
    entries: JmdictEntry[],
    vocabularyMap: Map<string, VocabularyRow>
) {
    const relations = new Map<string, VocabularyRelationInsert>()

    for (const entry of entries) {
        const primaryWord = getPrimaryWord(entry)
        if (!primaryWord) continue

        const sourceVocab = vocabularyMap.get(primaryWord)
        if (!sourceVocab) continue

        for (const sense of entry.sense || []) {
            for (const antRef of sense.antonym || []) {
                // antRef format: [word, ...senseQualifiers] — only first element is the word
                const antWord = typeof antRef[0] === "string" ? antRef[0] : null
                if (!antWord) continue

                const targetVocab = vocabularyMap.get(antWord)
                if (!targetVocab) continue
                if (targetVocab.id === sourceVocab.id) continue

                const key = `${sourceVocab.id}:${targetVocab.id}:antonym`
                if (!relations.has(key)) {
                    relations.set(key, {
                        vocabulary_id: sourceVocab.id,
                        related_vocabulary_id: targetVocab.id,
                        relation_type: "antonym",
                        note_vi: null,
                        source: "jmdict_antonym",
                        status: "auto",
                        confidence: 90,
                    })
                }

                // Bidirectional
                const reverseKey = `${targetVocab.id}:${sourceVocab.id}:antonym`
                if (!relations.has(reverseKey)) {
                    relations.set(reverseKey, {
                        vocabulary_id: targetVocab.id,
                        related_vocabulary_id: sourceVocab.id,
                        relation_type: "antonym",
                        note_vi: null,
                        source: "jmdict_antonym",
                        status: "auto",
                        confidence: 90,
                    })
                }
            }
        }
    }

    return Array.from(relations.values())
}

async function upsertRelations(
    supabase: Awaited<ReturnType<typeof getSupabaseClient>>,
    relations: VocabularyRelationInsert[]
) {
    const batchSize = 500

    for (let i = 0; i < relations.length; i += batchSize) {
        const batch = relations.slice(i, i + batchSize)

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
                relations.length
            )}/${relations.length}`
        )
    }
}

async function main() {
    const raw = fs.readFileSync(JM_DICT_PATH, "utf8")
    const json = JSON.parse(raw)

    const entries: JmdictEntry[] = Array.isArray(json)
        ? json
        : json.words || json.entries || []

    console.log("JMdict entries:", entries.length)

    const { supabase, vocabularyMap } =
        await fetchVocabularyMap()

    console.log("Vocabulary map:", vocabularyMap.size)

    const relatedRelations = buildRelatedRelations(entries, vocabularyMap)
    console.log("Related relations:", relatedRelations.length)

    const synonymRelations = buildSynonymRelations(entries, vocabularyMap)
    console.log("Synonym relations:", synonymRelations.length)

    const antonymRelations = buildAntonymRelationsFromJmdict(entries, vocabularyMap)
    console.log("Antonym relations (from JMDict):", antonymRelations.length)

    const allRelations = [
        ...relatedRelations,
        ...synonymRelations,
        ...antonymRelations,
    ]

    console.log("All relations:", allRelations.length)

    await upsertRelations(supabase, allRelations)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})