import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

type KanjiRow = {
    id: number
    kanji: string
}

type VocabularyRow = {
    id: number
    primary_word: string | null
    is_common: boolean | null
}

type KanjiVocabularyLink = {
    kanji_id: number
    vocabulary_id: number
    priority: number
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    )
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function extractKanjis(text: string) {
    return Array.from(text.matchAll(/[\u4e00-\u9faf]/g)).map(
        (match) => match[0]
    )
}

function unique<T>(items: T[]) {
    return Array.from(new Set(items))
}

async function fetchAllKanjis() {
    const pageSize = 1000
    let from = 0
    const allKanjis: KanjiRow[] = []

    while (true) {
        const to = from + pageSize - 1

        const { data, error } = await supabase
            .from("kanjis")
            .select("id, kanji")
            .order("id", { ascending: true })
            .range(from, to)

        if (error) {
            throw error
        }

        const rows = (data || []) as KanjiRow[]

        if (rows.length === 0) {
            break
        }

        allKanjis.push(...rows)

        if (rows.length < pageSize) {
            break
        }

        from += pageSize
    }

    return allKanjis
}

async function fetchVocabularyBatch(
    from: number,
    to: number
) {
    const { data, error } = await supabase
        .from("vocabularies")
        .select("id, primary_word, is_common")
        .order("id", { ascending: true })
        .range(from, to)

    if (error) {
        throw error
    }

    return (data || []) as VocabularyRow[]
}

async function insertLinks(links: KanjiVocabularyLink[]) {
    if (links.length === 0) return

    const { error } = await supabase
        .from("kanji_vocabulary_links")
        .upsert(links, {
            onConflict: "kanji_id,vocabulary_id",
            ignoreDuplicates: true,
        })

    if (error) {
        throw error
    }
}

async function main() {
    console.log("Loading kanjis...")

    const kanjis = await fetchAllKanjis()

    const kanjiIdMap = new Map(
        kanjis.map((item) => [item.kanji, item.id])
    )

    console.log(`Loaded ${kanjis.length} kanjis.`)

    const pageSize = 1000
    let from = 0
    let totalLinks = 0

    while (true) {
        const to = from + pageSize - 1

        console.log(`Loading vocabularies ${from} - ${to}...`)

        const vocabularies = await fetchVocabularyBatch(from, to)

        if (vocabularies.length === 0) {
            break
        }

        const links: KanjiVocabularyLink[] = []

        for (const vocabulary of vocabularies) {
            if (!vocabulary.primary_word) continue

            const chars = unique(
                extractKanjis(vocabulary.primary_word)
            )

            for (const char of chars) {
                const kanjiId = kanjiIdMap.get(char)

                if (!kanjiId) continue

                links.push({
                    kanji_id: kanjiId,
                    vocabulary_id: vocabulary.id,
                    priority: vocabulary.is_common ? 100 : 0,
                })
            }
        }

        await insertLinks(links)

        totalLinks += links.length

        console.log(
            `Inserted/ignored ${links.length} links. Total processed links: ${totalLinks}`
        )

        from += pageSize
    }

    console.log("Done.")
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})