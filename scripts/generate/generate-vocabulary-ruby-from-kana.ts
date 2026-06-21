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
}

type RubyUpdateRow = {
    id: number
    ruby: RubyItem[]
}

const BATCH_SIZE = 1000
const UPDATE_CHUNK_SIZE = 500

const SPECIAL_WHOLE_WORDS = new Set([
    "今日",
    "昨日",
    "明日",
    "一昨日",
    "明後日",
    "大人",
    "一人",
    "二人",
    "二十歳",
    "大変",
])

const SMALL_KANA_PATTERN = /[ゃゅょぁぃぅぇぉっー]/

function isKanji(char: string) {
    return /[\u4e00-\u9faf]/.test(char)
}

function isKana(char: string) {
    return /[\u3040-\u30ffー]/.test(char)
}

function isSmallKana(char: string) {
    return SMALL_KANA_PATTERN.test(char)
}

function toHiragana(text: string) {
    return text.replace(/[\u30a1-\u30f6]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0x60)
    )
}

function hasKanji(text: string) {
    return Array.from(text).some(isKanji)
}

function compactRuby(items: RubyItem[]) {
    const compacted: RubyItem[] = []

    for (const item of items) {
        const prev = compacted[compacted.length - 1]

        if (prev && prev.reading === null && item.reading === null) {
            prev.text += item.text
            continue
        }

        compacted.push({ ...item })
    }

    return compacted
}

function commonPrefixLength(a: string, b: string) {
    const aChars = Array.from(a)
    const bChars = Array.from(b)
    let index = 0

    while (
        index < aChars.length &&
        index < bChars.length &&
        aChars[index] === bChars[index]
    ) {
        index += 1
    }

    return index
}

function commonSuffixLength(a: string, b: string) {
    const aChars = Array.from(a)
    const bChars = Array.from(b)
    let index = 0

    while (
        index < aChars.length &&
        index < bChars.length &&
        aChars[aChars.length - 1 - index] ===
        bChars[bChars.length - 1 - index]
    ) {
        index += 1
    }

    return index
}

function splitReadingToMora(reading: string) {
    const mora: string[] = []

    for (const char of Array.from(reading)) {
        const prevIndex = mora.length - 1

        if (prevIndex >= 0 && isSmallKana(char)) {
            mora[prevIndex] += char
            continue
        }

        mora.push(char)
    }

    return mora
}

function mergeMoraToMatchKanjiCount(
    mora: string[],
    kanjiCount: number
) {
    const chunks = [...mora]

    while (chunks.length > kanjiCount) {
        const smallTsuIndex = chunks.findIndex(
            (chunk, index) => index < chunks.length - 1 && chunk === "っ"
        )

        if (smallTsuIndex !== -1) {
            chunks[smallTsuIndex] += chunks[smallTsuIndex + 1]
            chunks.splice(smallTsuIndex + 1, 1)
            continue
        }

        const nIndex = chunks.findIndex(
            (chunk, index) => index > 0 && chunk === "ん"
        )

        if (nIndex !== -1) {
            chunks[nIndex - 1] += chunks[nIndex]
            chunks.splice(nIndex, 1)
            continue
        }

        const longVowelIndex = chunks.findIndex((chunk, index) => {
            return index > 0 && /^[あいうえおー]$/.test(chunk)
        })

        if (longVowelIndex !== -1) {
            chunks[longVowelIndex - 1] += chunks[longVowelIndex]
            chunks.splice(longVowelIndex, 1)
            continue
        }

        break
    }

    return chunks
}

function splitReadingByKanjiCount(
    kanjiBlock: string,
    reading: string
): RubyItem[] | null {
    const kanjis = Array.from(kanjiBlock)

    if (kanjis.length <= 1) {
        return [
            {
                text: kanjiBlock,
                reading: reading || null,
            },
        ]
    }

    const mora = splitReadingToMora(reading)
    const chunks = mergeMoraToMatchKanjiCount(
        mora,
        kanjis.length
    )

    if (chunks.length !== kanjis.length) {
        return null
    }

    return kanjis.map((kanji, index) => ({
        text: kanji,
        reading: chunks[index] || null,
    }))
}

function generateRuby(word: string, kana: string | null): RubyItem[] {
    if (!word || !kana) {
        return []
    }

    if (!hasKanji(word)) {
        return [{ text: word, reading: null }]
    }

    const normalizedKana = toHiragana(kana)
    const wordChars = Array.from(word)

    if (SPECIAL_WHOLE_WORDS.has(word)) {
        return [
            {
                text: word,
                reading: normalizedKana,
            },
        ]
    }

    let prefixLength = 0
    while (
        prefixLength < wordChars.length &&
        isKana(wordChars[prefixLength])
    ) {
        prefixLength += 1
    }

    let suffixLength = 0
    while (
        suffixLength < wordChars.length - prefixLength &&
        isKana(wordChars[wordChars.length - 1 - suffixLength])
    ) {
        suffixLength += 1
    }

    const prefix = wordChars.slice(0, prefixLength).join("")
    const suffix = wordChars
        .slice(wordChars.length - suffixLength)
        .join("")

    const kanaPrefixLength = commonPrefixLength(
        toHiragana(prefix),
        normalizedKana
    )

    const kanaWithoutPrefix = normalizedKana.slice(kanaPrefixLength)

    const kanaSuffixLength = commonSuffixLength(
        toHiragana(suffix),
        kanaWithoutPrefix
    )

    const kanjiReading = kanaWithoutPrefix.slice(
        0,
        kanaWithoutPrefix.length - kanaSuffixLength
    )

    const middle = wordChars
        .slice(prefixLength, wordChars.length - suffixLength)
        .join("")

    const result: RubyItem[] = []

    if (prefix) {
        result.push({
            text: prefix,
            reading: null,
        })
    }

    if (middle) {
        const splitRuby = splitReadingByKanjiCount(
            middle,
            kanjiReading
        )

        if (splitRuby) {
            result.push(...splitRuby)
        } else {
            result.push({
                text: middle,
                reading: kanjiReading || null,
            })
        }
    }

    if (suffix) {
        result.push({
            text: suffix,
            reading: null,
        })
    }

    return compactRuby(result)
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
        throw new Error("Thiếu Supabase env")
    }

    const dryRun = process.argv.includes("--dry-run")
    const onlyIdIndex = process.argv.indexOf("--id")
    const onlyId =
        onlyIdIndex >= 0 ? Number(process.argv[onlyIdIndex + 1]) : null

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
        },
    })

    let lastId = 0
    let processed = 0
    let generated = 0
    let updated = 0

    while (true) {
        let query = supabase
            .from("vocabularies")
            .select("id, primary_word, primary_kana")
            .gt("id", lastId)
            .order("id", { ascending: true })
            .limit(BATCH_SIZE)

        if (onlyId) {
            query = supabase
                .from("vocabularies")
                .select("id, primary_word, primary_kana")
                .eq("id", onlyId)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            break
        }

        const rows = data as VocabularyRow[]

        const updates: RubyUpdateRow[] = rows
            .map((row) => ({
                id: row.id,
                ruby: generateRuby(row.primary_word, row.primary_kana),
            }))
            .filter((row) => row.ruby.length > 0)

        processed += rows.length
        generated += updates.length

        console.log(
            `lastId=${lastId}, processed=${rows.length}, generated=${updates.length}`
        )

        if (!dryRun && updates.length > 0) {
            for (const chunk of chunkArray(updates, UPDATE_CHUNK_SIZE)) {
                const { data: count, error: updateError } =
                    await supabase.rpc("update_vocabulary_ruby_bulk", {
                        payload: chunk,
                        force_update: true,
                    })

                if (updateError) {
                    throw new Error(updateError.message)
                }

                updated += typeof count === "number" ? count : 0
            }
        }

        if (onlyId) {
            break
        }

        lastId = rows[rows.length - 1].id
    }

    console.log("\nDone")
    console.log(`Processed: ${processed}`)
    console.log(`Generated: ${generated}`)
    console.log(`Updated: ${updated}`)

    if (dryRun) {
        console.log("Dry run: chưa update database")
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})