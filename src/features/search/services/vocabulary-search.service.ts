import { supabase } from "@/lib/supabase"
import { Vocabulary } from "../types/vocabulary.types"

export async function searchVocabularies(
    keyword: string
): Promise<Vocabulary[]> {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword) {
        return []
    }

    const { data, error } = await supabase
        .from("vocabularies")
        .select("id, word, kana, meaning")
        .or(
            `word.ilike.%${normalizedKeyword}%,kana.ilike.%${normalizedKeyword}%,meaning.ilike.%${normalizedKeyword}%`
        )
        .limit(50)

    if (error) {
        console.error(error)
        return []
    }

    return data || []
}