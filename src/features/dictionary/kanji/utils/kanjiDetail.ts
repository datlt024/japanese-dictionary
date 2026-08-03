export function splitKanjiReadings(value: string | null) {
    if (!value) {
        return []
    }

    return value
        .split(/[、,;；\s]+/)
        .map((item) => item.trim())
        .filter(Boolean)
}

// KANJIDIC2 uses old 4-level system (1=hardest, 4=easiest/N5).
// Reverse-map DB integer → new JLPT label: 4→N5, 3→N4, 2→N3, 1→N2
const KANJIDIC_TO_JLPT: Record<number, string> = { 4: "N5", 3: "N4", 2: "N3", 1: "N2" }

export function kanjiJlptToLabel(jlpt: number | null): string | null {
    if (jlpt == null) return null
    return KANJIDIC_TO_JLPT[jlpt] ?? `N${jlpt}`
}

export function formatKanjiJlpt(jlpt: number | null) {
    const label = kanjiJlptToLabel(jlpt)
    return label ? `JLPT ${label}` : "JLPT không xác định"
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