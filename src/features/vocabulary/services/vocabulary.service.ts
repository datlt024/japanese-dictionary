import { supabase } from "@/shared/lib/supabase"
import { Tables } from "@/shared/types/database.generated"

export type VocabularySense = Pick<
    Tables<"vocabulary_senses">,
    | "id"
    | "sense_index"
    | "meaning_en"
    | "meaning_vi"
    | "part_of_speech"
>

export type VocabularyWriting = Pick<
    Tables<"vocabulary_writings">,
    | "id"
    | "writing"
    | "is_primary"
    | "priority"
    | "info"
>

export type VocabularyReading = Pick<
    Tables<"vocabulary_readings">,
    | "id"
    | "reading"
    | "romaji"
    | "is_primary"
    | "priority"
    | "info"
>

export type Vocabulary = {
    id: number
    jmdict_id: string | null
    word: string
    kana: string | null
    jlpt: string | null
    verb_group: string | null
    is_common: boolean | null
    senses: VocabularySense[]
    writings: VocabularyWriting[]
    readings: VocabularyReading[]
}

export async function getVocabularyById(
    id: number
): Promise<Vocabulary | null> {
    const { data: vocabulary, error: vocabularyError } =
        await supabase
            .from("vocabularies")
            .select(
                "id, jmdict_id, primary_word, primary_kana, jlpt, verb_group, is_common"
            )
            .eq("id", id)
            .maybeSingle()

    if (vocabularyError) {
        console.error("Get vocabulary error:", vocabularyError)
        return null
    }

    if (!vocabulary) {
        return null
    }

    const [
        sensesResult,
        writingsResult,
        readingsResult,
    ] = await Promise.all([
        supabase
            .from("vocabulary_senses")
            .select(
                "id, sense_index, meaning_en, meaning_vi, part_of_speech"
            )
            .eq("vocabulary_id", id)
            .order("sense_index", { ascending: true }),

        supabase
            .from("vocabulary_writings")
            .select("id, writing, is_primary, priority, info")
            .eq("vocabulary_id", id)
            .order("priority", { ascending: true }),

        supabase
            .from("vocabulary_readings")
            .select("id, reading, romaji, is_primary, priority, info")
            .eq("vocabulary_id", id)
            .order("priority", { ascending: true }),
    ])

    if (sensesResult.error) {
        console.error(
            "Get vocabulary senses error:",
            sensesResult.error
        )
        return null
    }

    if (writingsResult.error) {
        console.error(
            "Get vocabulary writings error:",
            writingsResult.error
        )
        return null
    }

    if (readingsResult.error) {
        console.error(
            "Get vocabulary readings error:",
            readingsResult.error
        )
        return null
    }

    return {
        id: vocabulary.id,
        jmdict_id: vocabulary.jmdict_id,
        word: vocabulary.primary_word,
        kana: vocabulary.primary_kana,
        jlpt: vocabulary.jlpt,
        verb_group: vocabulary.verb_group,
        is_common: vocabulary.is_common,
        senses: sensesResult.data || [],
        writings: writingsResult.data || [],
        readings: readingsResult.data || [],
    }
}

export function getVocabularyMeaning(vocabulary: Vocabulary) {
    const firstSense = vocabulary.senses[0]

    return (
        firstSense?.meaning_vi ||
        firstSense?.meaning_en ||
        ""
    )
}

export function getVocabularyPartOfSpeech(
    vocabulary: Vocabulary
) {
    const partOfSpeechList = vocabulary.senses
        .flatMap((sense) => sense.part_of_speech || [])
        .filter(Boolean)

    return Array.from(new Set(partOfSpeechList)).join(", ")
}