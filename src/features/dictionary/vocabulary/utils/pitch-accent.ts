// Small kana that attach to the preceding kana and don't form their own mora
const SMALL_KANA = new Set("ぁぃぅぇぉゃゅょゎァィゥェォャュョヮ")

/**
 * Split a kana string into individual morae.
 * Small kana (ゃ, ょ, etc.) are attached to the preceding mora.
 * Long vowel mark (ー) counts as its own mora.
 */
export function getKanaMorae(kana: string): string[] {
    const morae: string[] = []

    for (let i = 0; i < kana.length; i++) {
        const char = kana[i]

        if (SMALL_KANA.has(char) && morae.length > 0) {
            morae[morae.length - 1] += char
        } else {
            morae.push(char)
        }
    }

    return morae
}

export type PitchAccentType = "heiban" | "atamadaka" | "nakadaka" | "odaka"

/**
 * Determine pitch accent type from pitch number and mora count.
 *
 * pitch = 0           → Heiban  (平板型): LH̄H̄H̄...
 * pitch = 1           → Atamadaka (頭高型): H̄LL...
 * pitch = moraeCount  → Odaka (尾高型): LH̄H̄...H̄ (drops on particle)
 * pitch = 2..N-1      → Nakadaka (中高型): LH̄...H̄LL
 */
export function getPitchAccentType(pitch: number, moraeCount: number): PitchAccentType {
    if (pitch === 0) return "heiban"
    if (pitch === 1) return "atamadaka"
    if (pitch >= moraeCount) return "odaka"
    return "nakadaka"
}

/**
 * Returns a boolean array (one entry per mora): true = high pitch, false = low.
 * This does not include the particle drop for Odaka — the graph shows the word in isolation.
 */
export function getPitchPattern(pitch: number, moraeCount: number): boolean[] {
    return Array.from({ length: moraeCount }, (_, i) => {
        if (pitch === 0) {
            // Heiban: first mora low, rest high — no drop
            return i > 0
        }

        if (pitch === 1) {
            // Atamadaka: first mora high, rest low
            return i === 0
        }

        // Nakadaka / Odaka: first mora low, high from 2nd until the drop point
        return i >= 1 && i < pitch
    })
}

export function getPitchAccentLabel(type: PitchAccentType): string {
    switch (type) {
        case "heiban":    return "Bằng phẳng（平板型）"
        case "atamadaka": return "Đầu cao（頭高型）"
        case "nakadaka":  return "Giữa cao（中高型）"
        case "odaka":     return "Đuôi cao（尾高型）"
    }
}
