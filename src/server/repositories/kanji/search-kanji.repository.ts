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