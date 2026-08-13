import { supabaseServer } from "@/server/supabase/server"

import { normalizeKeyword } from "@/shared/utils/string"
import { isSingleKanji } from "@/shared/utils/japanese"

import {
    SEARCH_KANJI_COLUMNS,
} from "@/shared/constants/search.constants"

// KANJIDIC2 uses the OLD 4-level JLPT system (1=hardest, 4=easiest/beginner).
// The new 5-level system (N1–N5) doesn't map 1:1.
// Approximate mapping: N5→4, N4→3, N3→2, N2→1, N1→1
// (N1 and N2 share old level 1; KANJIDIC2 doesn't separately identify new N1 kanji.)
const JLPT_KANJIDIC_LEVEL: Record<string, number> = {
    N1: 1, N2: 1, N3: 2, N4: 3, N5: 4,
}

function toKanjidicLevel(level: string): number {
    const upper = level.toUpperCase()
    return JLPT_KANJIDIC_LEVEL[upper] ?? parseInt(upper.replace(/^N/i, ""), 10)
}

export function searchKanjiByKeyword(keyword: string) {
    const value = normalizeKeyword(keyword)

    if (!isSingleKanji(value)) {
        return Promise.resolve({
            data: null,
            error: null,
        })
    }

    return supabaseServer
        .from("kanjis")
        .select(SEARCH_KANJI_COLUMNS)
        .eq("kanji", value)
        .maybeSingle()
}

export function getKanjisByCharacters(chars: string[]) {
    return supabaseServer
        .from("kanjis")
        .select(SEARCH_KANJI_COLUMNS)
        .in("kanji", chars)
}

export function getKanjisByJlptLevel(level: string) {
    const jlptNum = toKanjidicLevel(level)
    return supabaseServer
        .from("kanjis")
        .select(SEARCH_KANJI_COLUMNS)
        .eq("jlpt", jlptNum)
        .order("kanji", { ascending: true })
}

export function getKanjisByJlptLevelPaginated(level: string, from: number, to: number) {
    const jlptNum = toKanjidicLevel(level)
    return supabaseServer
        .from("kanjis")
        .select(SEARCH_KANJI_COLUMNS, { count: "exact" })
        .eq("jlpt", jlptNum)
        .order("kanji", { ascending: true })
        .range(from, to)
}
