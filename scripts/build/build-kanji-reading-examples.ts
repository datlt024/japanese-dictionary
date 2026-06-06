import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

type KanjiRow = {
    id: number
    kanji: string
    onyomi: string | null
    kunyomi: string | null
}

type VocabularyRow = {
    id: number
    primary_word: string
    primary_kana: string | null
    is_common: boolean | null
}

type KanjiVocabularyLinkRow = {
    vocabulary_id: number | null
    priority: number | null
}

type ReadingExampleInsert = {
    kanji: string
    reading: string
    reading_type: "onyomi" | "kunyomi"
    vocabulary_id: number
    priority: number
}

function katakanaToHiragana(text: string) {
    return text.replace(
        /[\u30a1-\u30f6]/g,
        (char) =>
            String.fromCharCode(
                char.charCodeAt(0) - 0x60
            )
    )
}

function cleanReading(reading: string) {
    return katakanaToHiragana(
        reading
            .replace(/\./g, "")
            .replace(/-/g, "")
            .trim()
    )
}

function splitReadings(text: string | null) {
    if (!text) {
        return []
    }

    return text
        .split(";")
        .map(cleanReading)
        .filter(Boolean)
}

function containsReading(
    kana: string | null,
    reading: string
) {
    if (!kana || !reading) {
        return false
    }

    return katakanaToHiragana(kana).includes(reading)
}

async function getAllKanjis() {
    const allKanjis: KanjiRow[] = []
    const pageSize = 1000

    for (let from = 0; ; from += pageSize) {
        const { data, error } = await supabase
            .from("kanjis")
            .select("id, kanji, onyomi, kunyomi")
            .range(from, from + pageSize - 1)

        if (error) {
            throw error
        }

        allKanjis.push(...((data || []) as KanjiRow[]))

        if (!data || data.length < pageSize) {
            break
        }
    }

    return allKanjis
}

async function getLinkedVocabularyIds(
    kanjiId: number
) {
    const { data, error } = await supabase
        .from("kanji_vocabulary_links")
        .select("vocabulary_id, priority")
        .eq("kanji_id", kanjiId)
        .order("priority", {
            ascending: false,
        })
        .limit(200)

    if (error) {
        throw error
    }

    return (data || []) as KanjiVocabularyLinkRow[]
}

async function getVocabulariesByIds(ids: number[]) {
    if (ids.length === 0) {
        return []
    }

    const { data, error } = await supabase
        .from("vocabularies")
        .select("id, primary_word, primary_kana, is_common")
        .in("id", ids)

    if (error) {
        throw error
    }

    return (data || []) as VocabularyRow[]
}

function buildExamplesForKanji(
    kanji: KanjiRow,
    vocabularies: VocabularyRow[],
    linkPriorityMap: Map<number, number>
) {
    const examples: ReadingExampleInsert[] = []

    const onyomiReadings = splitReadings(kanji.onyomi)
    const kunyomiReadings = splitReadings(kanji.kunyomi)

    for (const vocabulary of vocabularies) {
        for (const reading of onyomiReadings) {
            if (
                containsReading(
                    vocabulary.primary_kana,
                    reading
                )
            ) {
                examples.push({
                    kanji: kanji.kanji,
                    reading,
                    reading_type: "onyomi",
                    vocabulary_id: vocabulary.id,
                    priority:
                        linkPriorityMap.get(
                            vocabulary.id
                        ) || 0,
                })
            }
        }

        for (const reading of kunyomiReadings) {
            if (
                containsReading(
                    vocabulary.primary_kana,
                    reading
                )
            ) {
                examples.push({
                    kanji: kanji.kanji,
                    reading,
                    reading_type: "kunyomi",
                    vocabulary_id: vocabulary.id,
                    priority:
                        linkPriorityMap.get(
                            vocabulary.id
                        ) || 0,
                })
            }
        }
    }

    return examples
}

async function main() {
    console.log("Bắt đầu build kanji_reading_examples...")

    const kanjis = await getAllKanjis()

    console.log(`Số kanji: ${kanjis.length}`)

    let totalInserted = 0

    for (let i = 0; i < kanjis.length; i += 1) {
        const kanji = kanjis[i]

        const links = await getLinkedVocabularyIds(
            kanji.id
        )

        const vocabularyIds = links
            .map((item) => item.vocabulary_id)
            .filter(
                (id): id is number =>
                    id !== null
            )

        if (vocabularyIds.length === 0) {
            continue
        }

        const vocabularies =
            await getVocabulariesByIds(vocabularyIds)

        const linkPriorityMap = new Map(
            links
                .filter(
                    (
                        item
                    ): item is {
                        vocabulary_id: number
                        priority: number | null
                    } =>
                        item.vocabulary_id !== null
                )
                .map((item) => [
                    item.vocabulary_id,
                    item.priority || 0,
                ])
        )

        const examples = buildExamplesForKanji(
            kanji,
            vocabularies,
            linkPriorityMap
        )

        if (examples.length > 0) {
            const { error } = await supabase
                .from("kanji_reading_examples")
                .upsert(examples, {
                    onConflict:
                        "kanji,reading,vocabulary_id,reading_type",
                })

            if (error) {
                console.error(
                    `Import lỗi kanji ${kanji.kanji}:`,
                    error
                )
            } else {
                totalInserted += examples.length
            }
        }

        if ((i + 1) % 100 === 0) {
            console.log(
                `Đã xử lý ${i + 1}/${kanjis.length}, examples=${totalInserted}`
            )
        }
    }

    console.log(
        `Hoàn tất. Tổng examples: ${totalInserted}`
    )
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})