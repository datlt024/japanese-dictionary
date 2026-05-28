import { supabase } from "./supabase"

export async function getVocabularies() {
    const { data, error } =
        await supabase
            .from("vocabularies")
            .select("*")

    console.log("DATA:", data)
    console.log("ERROR:", error)

    if (error) {
        throw error
    }

    return data
}