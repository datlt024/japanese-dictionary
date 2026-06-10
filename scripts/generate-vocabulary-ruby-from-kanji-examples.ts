import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"

type RubyItem = {
    text: string
    reading: string | null
}

type VocabularyRow = {
    id: number
    primary_word: string
    primary_kana: string | null
    ruby: unknown
}

type KanjiReadingExampleRow = {
    kanji: string
    reading: string
    reading_type: string
    priority: number | null
}

type KanjiReadingExampleDbRow = KanjiReadingExampleRow & {
    vocabulary_id: number
}

type RubyUpdateRow = {
    id: number
    ruby: RubyItem[]
}

const BATCH_SIZE = 500
const UPDATE_CHUNK_SIZE = 500
const RETRY_COUNT = 3
const RETRY_DELAY_MS = 1500

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetry<T>(
    task: () => Promise<T>,
    retries = RETRY_COUNT
): Promise<T> {
    try {
        return await task()
    } catch (error) {
        if (retries <= 0) {
            throw error
        }

        console.warn(
            `Request failed, retrying... remaining=${retries}`
        )

        await sleep(RETRY_DELAY_MS)

        return withRetry(task, retries - 1)
    }
}

function hasFlag(name: string) {
    return process.argv.includes(name)
}

function getArgValue(name: string) {
    const index = process.argv.indexOf(name)

    if (index === -1) {
        return null
    }

    return process.argv[index + 1] || null
}

function isKanji(char: string) {
    return /[\u4e00-\u9faf]/.test(char)
}

function isKana(char: string) {
    return /[\u3040-\u30ffー]/.test(char)
}

function toHiragana(text: string) {
    return text.replace(/[\u30a1-\u30f6]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0x60)
    )
}

function normalizeReading(text: string) {
    return toHiragana(text).trim()
}

function hasRuby(value: unknown) {
    return normalizeRuby(value).length > 0
}

function isRubyItem(value: unknown): value is RubyItem {
    if (
        typeof value !== "object" ||
        value === null ||
        !("text" in value) ||
        !("reading" in value)
    ) {
        return false
    }

    const item = value as {
        text: unknown
        reading: unknown
    }

    return (
        typeof item.text === "string" &&
        item.text.length > 0 &&
        (typeof item.reading === "string" ||
            item.reading === null)
    )
}

function normalizeRuby(value: unknown): RubyItem[] {
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value)

            if (Array.isArray(parsed)) {
                return parsed.filter(isRubyItem)
            }
        } catch {
            return []
        }

        return []
    }

    if (!Array.isArray(value)) {
        return []
    }

    return value.filter(isRubyItem)
}

function compactRuby(items: RubyItem[]) {
    const compacted: RubyItem[] = []

    for (const item of items) {
        const previous = compacted[compacted.length - 1]

        if (
            previous &&
            previous.reading === null &&
            item.reading === null
        ) {
            previous.text += item.text
            continue
        }

        compacted.push({ ...item })
    }

    return compacted
}

function getTrailingKana(
    wordChars: string[],
    kanjiIndex: number
) {
    let trailingKana = ""

    for (
        let index = kanjiIndex + 1;
        index < wordChars.length;
        index += 1
    ) {
        const char = wordChars[index]

        if (isKanji(char)) {
            break
        }

        if (!isKana(char)) {
            break
        }

        trailingKana += char
    }

    return trailingKana
}

function hasLaterKanji(
    wordChars: string[],
    kanjiIndex: number
) {
    return wordChars
        .slice(kanjiIndex + 1)
        .some((char) => isKanji(char))
}

function removeTrailingOkuriganaFromReading({
    reading,
    wordChars,
    kanjiIndex,
}: {
    reading: string
    wordChars: string[]
    kanjiIndex: number
}) {
    const trailingKana = getTrailingKana(wordChars, kanjiIndex)

    if (!trailingKana) {
        return reading
    }

    /**
     * Chỉ tự cắt okurigana khi phía sau không còn kanji nữa.
     * Ví dụ:
     * - 低い: cắt い khỏi ひくい => ひく
     * - 勉強に励む: không xử lý tùy tiện ở giữa chuỗi phức tạp
     */
    if (hasLaterKanji(wordChars, kanjiIndex)) {
        return reading
    }

    const normalizedReading = normalizeReading(reading)
    const normalizedTrailingKana = normalizeReading(trailingKana)

    if (!normalizedReading.endsWith(normalizedTrailingKana)) {
        return reading
    }

    const trimmed = normalizedReading.slice(
        0,
        normalizedReading.length - normalizedTrailingKana.length
    )

    return trimmed || reading
}

function buildRubyFromExamples(
    word: string,
    examples: KanjiReadingExampleRow[]
): RubyItem[] {
    if (!word) {
        return []
    }

    const readingsByKanji = new Map<string, string>()

    const sortedExamples = [...examples].sort((a, b) => {
        return (b.priority || 0) - (a.priority || 0)
    })

    for (const example of sortedExamples) {
        if (!readingsByKanji.has(example.kanji)) {
            readingsByKanji.set(
                example.kanji,
                normalizeReading(example.reading)
            )
        }
    }

    const wordChars = Array.from(word)

    const ruby = wordChars.map((char, index) => {
        if (!isKanji(char)) {
            return {
                text: char,
                reading: null,
            }
        }

        const reading = readingsByKanji.get(char)

        return {
            text: char,
            reading: reading
                ? removeTrailingOkuriganaFromReading({
                    reading,
                    wordChars,
                    kanjiIndex: index,
                })
                : null,
        }
    })

    const compacted = compactRuby(ruby)

    const hasAtLeastOneReading = compacted.some(
        (item) => item.reading
    )

    return hasAtLeastOneReading ? compacted : []
}

function repairOkuriganaRubyForWord(
    word: string,
    ruby: RubyItem[]
) {
    const wordChars = Array.from(word)

    let changed = false
    let currentWordIndex = 0

    const repaired = ruby.map((item) => {
        if (!item.reading) {
            currentWordIndex += Array.from(item.text).length
            return item
        }

        const itemChars = Array.from(item.text)
        const isSingleKanjiRuby =
            itemChars.length === 1 && isKanji(itemChars[0])

        if (!isSingleKanjiRuby) {
            currentWordIndex += itemChars.length
            return item
        }

        const fixedReading = removeTrailingOkuriganaFromReading({
            reading: item.reading,
            wordChars,
            kanjiIndex: currentWordIndex,
        })

        currentWordIndex += itemChars.length

        if (fixedReading !== item.reading) {
            changed = true

            return {
                ...item,
                reading: fixedReading,
            }
        }

        return item
    })

    return {
        ruby: compactRuby(repaired),
        changed,
    }
}

function chunkArray<T>(items: T[], size: number) {
    const chunks: T[][] = []

    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size))
    }

    return chunks
}

async function main() {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL

    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local"
        )
    }

    const dryRun = hasFlag("--dry-run")
    const repairOkurigana = hasFlag("--repair-okurigana")
    const onlyId = getArgValue("--id")
    const limitArg = getArgValue("--limit")
    const maxRows = limitArg ? Number(limitArg) : null

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
        },
    })

    let processed = 0
    let generated = 0
    let updated = 0
    let skipped = 0
    let offset = 0

    while (true) {
        let query = supabase
            .from("vocabularies")
            .select("id, primary_word, primary_kana, ruby")
            .order("id", { ascending: true })
            .range(offset, offset + BATCH_SIZE - 1)

        if (!repairOkurigana) {
            query = query.or("ruby.is.null,ruby.eq.[]")
        }

        if (onlyId) {
            query = supabase
                .from("vocabularies")
                .select("id, primary_word, primary_kana, ruby")
                .eq("id", Number(onlyId))
        }

        const { data: vocabularies, error } = await withRetry(
            async () => await query
        )

        if (error) {
            throw new Error(error.message)
        }

        if (!vocabularies || vocabularies.length === 0) {
            break
        }

        const vocabularyRows = vocabularies as VocabularyRow[]
        let updates: RubyUpdateRow[] = []

        if (repairOkurigana) {
            updates = vocabularyRows
                .map((vocabulary) => {
                    const currentRuby = normalizeRuby(
                        vocabulary.ruby
                    )

                    if (currentRuby.length === 0) {
                        return null
                    }

                    const result = repairOkuriganaRubyForWord(
                        vocabulary.primary_word,
                        currentRuby
                    )

                    if (!result.changed) {
                        return null
                    }

                    return {
                        id: vocabulary.id,
                        ruby: result.ruby,
                    }
                })
                .filter(
                    (item): item is RubyUpdateRow =>
                        item !== null
                )
        } else {
            const vocabularyIds = vocabularyRows.map(
                (item) => item.id
            )

            const { data: examples, error: examplesError } =
                await withRetry(async () => {
                    return await supabase
                        .from("kanji_reading_examples")
                        .select(
                            "kanji, reading, reading_type, priority, vocabulary_id"
                        )
                        .in("vocabulary_id", vocabularyIds)
                })

            if (examplesError) {
                throw new Error(examplesError.message)
            }

            const examplesByVocabularyId = new Map<
                number,
                KanjiReadingExampleRow[]
            >()

            for (const example of examples || []) {
                const row = example as KanjiReadingExampleDbRow

                const current =
                    examplesByVocabularyId.get(
                        row.vocabulary_id
                    ) || []

                current.push(row)
                examplesByVocabularyId.set(
                    row.vocabulary_id,
                    current
                )
            }

            updates = vocabularyRows
                .filter((vocabulary) => !hasRuby(vocabulary.ruby))
                .map((vocabulary) => {
                    const ruby = buildRubyFromExamples(
                        vocabulary.primary_word,
                        examplesByVocabularyId.get(
                            vocabulary.id
                        ) || []
                    )

                    return {
                        id: vocabulary.id,
                        ruby,
                    }
                })
                .filter((item) => item.ruby.length > 0)
        }

        processed += vocabularyRows.length
        generated += updates.length
        skipped += vocabularyRows.length - updates.length

        console.log(
            `batch offset=${offset}: processed=${vocabularyRows.length}, generated=${updates.length}`
        )

        if (!dryRun && updates.length > 0) {
            const chunks = chunkArray(
                updates,
                UPDATE_CHUNK_SIZE
            )

            for (const [chunkIndex, chunk] of chunks.entries()) {
                const { data, error: updateError } =
                    await withRetry(async () => {
                        return await supabase.rpc(
                            "update_vocabulary_ruby_bulk",
                            {
                                payload: chunk,
                                force_update: repairOkurigana,
                            }
                        )
                    })

                if (updateError) {
                    throw new Error(updateError.message)
                }

                const updatedCount =
                    typeof data === "number" ? data : 0

                updated += updatedCount

                console.log(
                    `  updated chunk ${chunkIndex + 1}/${chunks.length
                    }: ${updatedCount}`
                )
            }
        }

        if (onlyId) {
            break
        }

        offset += BATCH_SIZE

        if (maxRows && processed >= maxRows) {
            break
        }
    }

    console.log("\nDone")
    console.log(`Processed: ${processed}`)
    console.log(`Generated ruby: ${generated}`)
    console.log(`Updated: ${updated}`)
    console.log(`Skipped: ${skipped}`)

    if (dryRun) {
        console.log("Dry run: chưa update database")
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})