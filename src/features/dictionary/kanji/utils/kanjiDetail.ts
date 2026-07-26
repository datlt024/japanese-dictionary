export function splitKanjiReadings(value: string | null) {
    if (!value) {
        return []
    }

    return value
        .split(/[、,;；\s]+/)
        .map((item) => item.trim())
        .filter(Boolean)
}

export function formatKanjiJlpt(jlpt: number | null) {
    return jlpt ? `JLPT N${jlpt}` : "JLPT N5"
}

export { speakJapanese } from "@/shared/lib/tts/speakJapanese"

export function splitMeaningText(value: string | null) {
    if (!value) {
        return []
    }

    return value
        .split(/[,;；、]/)
        .map((item) => item.trim())
        .filter(Boolean)
}