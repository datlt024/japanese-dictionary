import { supabaseServer } from "@/server/supabase/server"

import { normalizeKeyword } from "@/shared/utils/string"
import { isSingleKanji } from "@/shared/utils/japanese"

import {
    SEARCH_KANJI_COLUMNS,
} from "@/shared/constants/search.constants"

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
    // kanjis.jlpt is integer: N5→5, N4→4, N3→3, N2→2, N1→1
    const jlptNum = parseInt(level.replace(/^N/i, ""), 10)
    return supabaseServer
        .from("kanjis")
        .select(SEARCH_KANJI_COLUMNS)
        .eq("jlpt", jlptNum)
        .order("kanji", { ascending: true })
        .limit(200)
}