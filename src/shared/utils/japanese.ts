import { katakanaToHiragana } from "./string"

// Romaji → hiragana conversion table (sorted longest-first for greedy matching).
const ROMAJI_MAP: [string, string][] = ([
    // 3-char combos
    ["sha", "しゃ"], ["shi", "し"],  ["shu", "しゅ"], ["sho", "しょ"],
    ["chi", "ち"],   ["cha", "ちゃ"], ["chu", "ちゅ"], ["cho", "ちょ"],
    ["tsu", "つ"],
    ["kya", "きゃ"], ["kyu", "きゅ"], ["kyo", "きょ"],
    ["gya", "ぎゃ"], ["gyu", "ぎゅ"], ["gyo", "ぎょ"],
    ["nya", "にゃ"], ["nyu", "にゅ"], ["nyo", "にょ"],
    ["hya", "ひゃ"], ["hyu", "ひゅ"], ["hyo", "ひょ"],
    ["mya", "みゃ"], ["myu", "みゅ"], ["myo", "みょ"],
    ["rya", "りゃ"], ["ryu", "りゅ"], ["ryo", "りょ"],
    ["bya", "びゃ"], ["byu", "びゅ"], ["byo", "びょ"],
    ["pya", "ぴゃ"], ["pyu", "ぴゅ"], ["pyo", "ぴょ"],
    // ja/ji/ju/jo
    ["ja", "じゃ"],  ["ji", "じ"],   ["ju", "じゅ"],  ["jo", "じょ"],
    // 2-char
    ["ka", "か"], ["ki", "き"], ["ku", "く"], ["ke", "け"], ["ko", "こ"],
    ["sa", "さ"], ["si", "し"], ["su", "す"], ["se", "せ"], ["so", "そ"],
    ["ta", "た"], ["ti", "ち"], ["tu", "つ"], ["te", "て"], ["to", "と"],
    ["na", "な"], ["ni", "に"], ["nu", "ぬ"], ["ne", "ね"], ["no", "の"],
    ["ha", "は"], ["hi", "ひ"], ["fu", "ふ"], ["hu", "ふ"], ["he", "へ"], ["ho", "ほ"],
    ["ma", "ま"], ["mi", "み"], ["mu", "む"], ["me", "め"], ["mo", "も"],
    ["ya", "や"],               ["yu", "ゆ"],               ["yo", "よ"],
    ["ra", "ら"], ["ri", "り"], ["ru", "る"], ["re", "れ"], ["ro", "ろ"],
    ["wa", "わ"],                                            ["wo", "を"],
    ["ga", "が"], ["gi", "ぎ"], ["gu", "ぐ"], ["ge", "げ"], ["go", "ご"],
    ["za", "ざ"], ["zi", "じ"], ["zu", "ず"], ["ze", "ぜ"], ["zo", "ぞ"],
    ["da", "だ"],               ["du", "づ"], ["de", "で"], ["do", "ど"],
    ["ba", "ば"], ["bi", "び"], ["bu", "ぶ"], ["be", "べ"], ["bo", "ぼ"],
    ["pa", "ぱ"], ["pi", "ぴ"], ["pu", "ぷ"], ["pe", "ぺ"], ["po", "ぽ"],
    // 1-char vowels
    ["a", "あ"], ["i", "い"], ["u", "う"], ["e", "え"], ["o", "お"],
] as [string, string][]).sort((a, b) => b[0].length - a[0].length)

const ROMAJI_VOWELS = new Set(["a", "i", "u", "e", "o"])
const DOUBLE_CONSONANTS = new Set([..."kgsztdhbpmrcf"])

/**
 * Converts wāpuro rōmaji to hiragana.
 * Returns the original string unchanged if any character cannot be mapped.
 */
export function romajiToHiragana(input: string): string {
    const s = input.toLowerCase()
    let result = ""
    let i = 0

    while (i < s.length) {
        const ch = s[i]

        // "n" → ん before a consonant, end of string, or double-n
        if (ch === "n") {
            const next = s[i + 1]
            if (next === "n") {
                result += "ん"
                i += 2
                continue
            }
            if (!next || (!ROMAJI_VOWELS.has(next) && next !== "y")) {
                result += "ん"
                i++
                continue
            }
            // "n" + vowel/y falls through to MAP (matches "na", "ni", etc.)
        }

        // Double consonant → っ (consume one copy, let next iteration handle the rest)
        if (ch !== "n" && DOUBLE_CONSONANTS.has(ch) && s[i + 1] === ch) {
            result += "っ"
            i++
            continue
        }

        // Greedy MAP match (longest pattern first)
        let matched = false
        for (const [pattern, kana] of ROMAJI_MAP) {
            if (s.startsWith(pattern, i)) {
                result += kana
                i += pattern.length
                matched = true
                break
            }
        }

        if (!matched) {
            result += ch
            i++
        }
    }

    return result
}

/**
 * Returns the hiragana form of a romaji string if the entire input converts
 * cleanly (no remaining ASCII), otherwise returns null.
 * Requires at least 4 input characters to avoid false positives on short
 * English words like "go", "to", "so".
 */
export function tryRomajiToHiragana(input: string): string | null {
    if (input.length < 4) return null
    const converted = romajiToHiragana(input)
    if (/[a-z]/i.test(converted)) return null   // incomplete conversion
    if (!isJapaneseKeyword(converted)) return null
    return converted
}

export function extractKanjis(text: string) {
    return Array.from(
        text.matchAll(/[\u4e00-\u9faf]/g)
    ).map((match) => match[0])
}

export function isJapaneseKeyword(keyword: string) {
    return /[\u3040-\u30ff\u4e00-\u9faf]/.test(
        keyword
    )
}

export function isSingleKanji(keyword: string) {
    return /^[\u4e00-\u9faf]$/.test(keyword)
}

export function cleanReading(reading: string) {
    return katakanaToHiragana(
        reading
            .replace(/\./g, "")
            .replace(/-/g, "")
            .trim()
    )
}