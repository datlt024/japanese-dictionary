import { supabaseServer as supabase } from "@/shared/lib/supabase/server"

import { normalizeKeyword } from "@/shared/utils/string"
import { isSingleKanji } from "@/shared/utils/japanese"
import {
    SEARCH_KANJI_COLUMNS,
} from "../constants/search.constants"

export function searchKanjiByKeyword(keyword: string) {
    const value = normalizeKeyword(keyword)

    if (!isSingleKanji(value)) {
        return Promise.resolve({
            data: null,
            error: null,
        })
    }

    return supabase
        .from("kanjis")
        .select(SEARCH_KANJI_COLUMNS)
        .eq("kanji", value)
        .maybeSingle()
}