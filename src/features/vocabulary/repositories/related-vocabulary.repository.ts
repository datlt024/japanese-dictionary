import { supabase } from "@/shared/lib/supabase"

export function findRelatedVocabulariesByKeyword(
    keyword: string
) {
    return supabase.rpc("get_related_vocabularies_rpc", {
        search_keyword: keyword,
    })
}