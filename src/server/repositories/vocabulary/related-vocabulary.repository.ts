import "server-only"
import { supabaseServer } from "@/server/supabase/server"

export function findRelatedVocabulariesByKeyword(
    keyword: string
) {
    return supabaseServer.rpc("get_related_vocabularies_rpc", {
        search_keyword: keyword,
    })
}