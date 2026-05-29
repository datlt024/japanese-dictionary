import { supabase } from "@/lib/supabase"
import { Kanji } from "../types/kanji.types"

export async function getKanjiByCharacter(
    character: string
): Promise<Kanji | null> {
    const { data, error } = await supabase
        .from("kanjis")
        .select("*")
        .eq("kanji", character)
        .maybeSingle()

    if (error) {
        console.error(error)
        return null
    }

    return data
}