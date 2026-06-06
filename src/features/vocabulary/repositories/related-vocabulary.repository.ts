import { supabaseServer as supabase } from "@/shared/lib/supabase/server"

export function findRelatedVocabulariesByKeyword(
    keyword: string
) {
    return supabase.rpc("get_related_vocabularies_rpc", {
        search_keyword: keyword,
    })
}