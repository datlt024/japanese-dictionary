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

// Map<kanji_char, sorted_readings[]> — loaded once from kanjis table at startup.
type KanjiDB = Map<string, string[]>

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

// Words whose readings cannot be resolved even by KANJIDIC lookup
// (jukujikun, heavy rendaku, or unusual splits).
const MANUAL_RUBY: Record<string, RubyItem[]> = {
    "子供":   [{ text: "子", reading: "こ" },     { text: "供", reading: "ども" }],
    "言葉":   [{ text: "言", reading: "こと" },   { text: "葉", reading: "ば" }],
    "花火":   [{ text: "花", reading: "はな" },   { text: "火", reading: "び" }],
    "手紙":   [{ text: "手", reading: "て" },     { text: "紙", reading: "がみ" }],
    "金持ち":  [{ text: "金", reading: "かね" },   { text: "持", reading: "も" },   { text: "ち", reading: null }],
    "力持ち":  [{ text: "力", reading: "ちから" }, { text: "持", reading: "も" },   { text: "ち", reading: null }],
    "木曜日":  [{ text: "木", reading: "もく" },   { text: "曜", reading: "よう" }, { text: "日", reading: "び" }],
    "月曜日":  [{ text: "月", reading: "げつ" },   { text: "曜", reading: "よう" }, { text: "日", reading: "び" }],
    "日曜日":  [{ text: "日", reading: "にち" },   { text: "曜", reading: "よう" }, { text: "日", reading: "び" }],
    "火曜日":  [{ text: "火", reading: "か" },     { text: "曜", reading: "よう" }, { text: "日", reading: "び" }],
    "何曜日":  [{ text: "何", reading: "なん" },   { text: "曜", reading: "よう" }, { text: "日", reading: "び" }],
}

const SMALL_KANA_PATTERN = /[ゃゅょぁぃぅぇぉっー]/

function isKanji(char: string) {
    return /[一-龯]/.test(char)
}

function isKana(char: string) {
    return /[぀-ヿー]/.test(char)
}

function isSmallKana(char: string) {
    return SMALL_KANA_PATTERN.test(char)
}

function toHiragana(text: string) {
    return text.replace(/[ァ-ヶ]/g, (char) =>
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
        if (smallTsuIndex === -1) break
        chunks[smallTsuIndex] += chunks[smallTsuIndex + 1]
        chunks.splice(smallTsuIndex + 1, 1)
    }

    while (chunks.length > kanjiCount) {
        const nIndex = chunks.findIndex(
            (chunk, index) => index > 0 && chunk === "ん"
        )
        if (nIndex === -1) break
        chunks[nIndex - 1] += chunks[nIndex]
        chunks.splice(nIndex, 1)
    }

    // When mora count divides evenly into kanji count AND the original mora
    // contains at least one standalone vowel (あいうえおー), use even split on
    // the original mora array. This fixes words like 一応 (いちおう → 一=いち
    // 応=おう) without incorrectly splitting words like 力持ち (ちからも) whose
    // reading has no standalone vowel mora.
    if (
        chunks.length > kanjiCount &&
        mora.length % kanjiCount === 0 &&
        mora.some((m) => /^[あいうえおー]$/.test(m))
    ) {
        const perKanji = mora.length / kanjiCount
        return Array.from({ length: kanjiCount }, (_, i) =>
            mora.slice(i * perKanji, (i + 1) * perKanji).join("")
        )
    }

    while (chunks.length > kanjiCount) {
        const longVowelIndex = chunks.findIndex((chunk, index) => {
            return index > 0 && /^[あいうえおー]$/.test(chunk)
        })
        if (longVowelIndex === -1) break
        chunks[longVowelIndex - 1] += chunks[longVowelIndex]
        chunks.splice(longVowelIndex, 1)
    }

    return chunks
}

// Rendaku voicing map: initial consonant of the second morpheme may be voiced.
const RENDAKU_MAP: Record<string, string> = {
    か: "が", き: "ぎ", く: "ぐ", け: "げ", こ: "ご",
    さ: "ざ", し: "じ", す: "ず", せ: "ぜ", そ: "ぞ",
    た: "だ", ち: "ぢ", つ: "づ", て: "で", と: "ど",
    は: "ば", ひ: "び", ふ: "ぶ", へ: "べ", ほ: "ぼ",
}

// Handakuten (semi-voicing) map: は-row can become ぱ-row in some compounds.
const HANDAKUTEN_MAP: Record<string, string> = {
    は: "ぱ", ひ: "ぴ", ふ: "ぷ", へ: "ぺ", ほ: "ぽ",
}

// Parse onyomi / kunyomi strings from KANJIDIC into hiragana reading stems,
// then expand with rendaku (voicing), handakuten (semi-voicing), and gemination
// (っ) variants so that compound readings resolve correctly.
//
// Kunyomi format: "も.つ" → stem "も" + full form "もつ" both added.
// Trailing "-" (compound-only marker) and leading "-" are both stripped.
// Onyomi format: "アク" → converted to hiragana "あく".
function parseKanjiReadings(
    onyomi: string | null,
    kunyomi: string | null
): string[] {
    const base: string[] = []

    if (onyomi) {
        for (const r of onyomi.split("; ")) {
            const clean = r.trim().replace(/^-/, "").replace(/-$/, "")
            const stem = clean.split(".")[0]
            if (stem) base.push(toHiragana(stem))
        }
    }

    if (kunyomi) {
        for (const r of kunyomi.split("; ")) {
            // Strip leading "-" (compound-only marker) and trailing "-" (compound form)
            const clean = r.trim().replace(/^-/, "").replace(/-$/, "")
            const dotIndex = clean.indexOf(".")
            if (dotIndex >= 0) {
                const stem = clean.slice(0, dotIndex)
                const okurigana = clean.slice(dotIndex + 1)
                if (stem) base.push(stem)
                // Also add full form (stem + okurigana) since some compounds use it.
                // E.g. 独(ひと.り) → stem=ひと, full=ひとり; 独枕 needs ひとり.
                if (stem && okurigana) base.push(stem + okurigana)
            } else {
                if (clean) base.push(clean)
            }
        }
    }

    const expanded = new Set(base)

    for (const r of base) {
        if (!r) continue

        // Rendaku: voice the initial kana of a reading (e.g. ひと → びと).
        const voiced = RENDAKU_MAP[r[0]]
        if (voiced) expanded.add(voiced + r.slice(1))

        // Handakuten: semi-voice the initial kana (e.g. は → ぱ).
        const semiVoiced = HANDAKUTEN_MAP[r[0]]
        if (semiVoiced) expanded.add(semiVoiced + r.slice(1))

        // Gemination: final く or つ becomes っ in tight compounds
        // (e.g. やく → やっ before きょく in 薬局).
        if (r.endsWith("く") || r.endsWith("つ")) {
            expanded.add(r.slice(0, -1) + "っ")
        }
    }

    return [...expanded].filter(Boolean)
}

// Backtracking search: try all combinations of KANJIDIC readings for each
// kanji in order, returning the first assignment whose concatenation equals
// the compound reading exactly.  Longer readings are tried first to avoid
// greedy short-circuit on ambiguous prefixes.
function splitByKanjiReadings(
    chars: string[],
    reading: string,
    kanjiDB: KanjiDB
): RubyItem[] | null {
    function search(i: number, remaining: string): RubyItem[] | null {
        if (i === chars.length) return remaining === "" ? [] : null
        const char = chars[i]
        const candidates = kanjiDB.get(char) || []
        for (const r of candidates) {
            if (r && remaining.startsWith(r)) {
                const rest = search(i + 1, remaining.slice(r.length))
                if (rest !== null) return [{ text: char, reading: r }, ...rest]
            }
        }
        return null
    }
    return search(0, reading)
}

function splitReadingByKanjiCount(
    kanjiBlock: string,
    reading: string,
    kanjiDB?: KanjiDB
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

    if (chunks.length === kanjis.length) {
        return kanjis.map((kanji, index) => ({
            text: kanji,
            reading: chunks[index] || null,
        }))
    }

    // Mora-based splitting failed — try KANJIDIC backtracking lookup.
    if (kanjiDB) {
        const byKanji = splitByKanjiReadings(kanjis, reading, kanjiDB)
        if (byKanji) return byKanji
    }

    return null
}

// Handles words where kana appears inside the middle block (e.g. 乗り物, 思い出).
// Splits middle chars into alternating kanji/kana segments, then aligns each
// segment's portion of the kana reading using the next kana segment as a
// boundary marker.
function splitMiddleByKana(
    chars: string[],
    reading: string,
    kanjiDB?: KanjiDB
): RubyItem[] {
    type Seg = { isKanji: boolean; text: string }
    const segments: Seg[] = []

    for (const char of chars) {
        const charIsKanji = isKanji(char)
        const prev = segments[segments.length - 1]
        if (prev && prev.isKanji === charIsKanji) {
            prev.text += char
        } else {
            segments.push({ isKanji: charIsKanji, text: char })
        }
    }

    let remaining = reading
    const result: RubyItem[] = []

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]

        if (!seg.isKanji) {
            const normalized = toHiragana(seg.text)
            const pos = remaining.indexOf(normalized)
            if (pos !== -1) {
                remaining = remaining.slice(pos + normalized.length)
            }
            for (const char of Array.from(seg.text)) {
                result.push({ text: char, reading: null })
            }
            continue
        }

        const nextKanaSeg = segments.slice(i + 1).find((s) => !s.isKanji)
        let kanjiReading: string

        if (nextKanaSeg) {
            const boundary = toHiragana(nextKanaSeg.text)
            const pos = remaining.indexOf(boundary)
            kanjiReading = pos !== -1 ? remaining.slice(0, pos) : remaining
        } else {
            kanjiReading = remaining
            remaining = ""
        }

        const segChars = Array.from(seg.text)
        if (segChars.length === 1) {
            result.push({ text: seg.text, reading: kanjiReading || null })
        } else {
            const split = splitReadingByKanjiCount(seg.text, kanjiReading, kanjiDB)
            if (split) {
                result.push(...split)
            } else {
                result.push({ text: seg.text, reading: kanjiReading || null })
            }
        }
    }

    return result
}

function generateRuby(
    word: string,
    kana: string | null,
    kanjiDB: KanjiDB
): RubyItem[] {
    if (!word || !kana) {
        return []
    }

    if (!hasKanji(word)) {
        return [{ text: word, reading: null }]
    }

    const normalizedKana = toHiragana(kana)
    const wordChars = Array.from(word)

    if (SPECIAL_WHOLE_WORDS.has(word)) {
        return [{ text: word, reading: normalizedKana }]
    }

    if (MANUAL_RUBY[word]) {
        return MANUAL_RUBY[word]
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

    const middleChars = wordChars.slice(prefixLength, wordChars.length - suffixLength)
    const middle = middleChars.join("")

    const result: RubyItem[] = []

    if (prefix) {
        result.push({ text: prefix, reading: null })
    }

    if (middle) {
        if (middleChars.some(isKana)) {
            // Kana inside the middle block (e.g. 乗り物, 思い出): split by
            // kana boundaries so kana chars get reading=null and kanji chars
            // get the correct portion of the kana reading.
            result.push(...splitMiddleByKana(middleChars, kanjiReading, kanjiDB))
        } else {
            const splitRuby = splitReadingByKanjiCount(middle, kanjiReading, kanjiDB)
            if (splitRuby) {
                result.push(...splitRuby)
            } else {
                result.push({ text: middle, reading: kanjiReading || null })
            }
        }
    }

    if (suffix) {
        result.push({ text: suffix, reading: null })
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

async function loadKanjiDB(
    supabase: ReturnType<typeof createClient>
): Promise<KanjiDB> {
    const map: KanjiDB = new Map()
    let from = 0
    const PAGE = 1000

    while (true) {
        const { data, error } = await supabase
            .from("kanjis")
            .select("kanji, onyomi, kunyomi")
            .range(from, from + PAGE - 1)

        if (error) throw new Error(error.message)
        if (!data || data.length === 0) break

        for (const row of data as {
            kanji: string
            onyomi: string | null
            kunyomi: string | null
        }[]) {
            const readings = parseKanjiReadings(row.onyomi, row.kunyomi)
            // Sort longest first so backtracking avoids greedy short-circuit.
            readings.sort((a, b) => b.length - a.length)
            map.set(row.kanji, readings)
        }

        from += PAGE
        if (data.length < PAGE) break
    }

    console.log(`Loaded ${map.size} kanji readings`)
    return map
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

    const kanjiDB = await loadKanjiDB(supabase)

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
                ruby: generateRuby(row.primary_word, row.primary_kana, kanjiDB),
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
