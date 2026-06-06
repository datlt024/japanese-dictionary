import { katakanaToHiragana } from "./string"

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