import { supabase } from "@/shared/lib/supabase"

export type VocabularySense = {
    id: number
    sense_index: number
    meaning_en: string | null
    meaning_vi: string | null
    part_of_speech: string[] | null
}

export type VocabularyWriting = {
    id: number
    writing: string
    is_primary: boolean | null
    priority: number | null
    info: string[] | null
}

export type VocabularyReading = {
    id: number
    reading: string
    romaji: string | null
    is_primary: boolean | null
    priority: number | null
    info: string[] | null
}

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

type VocabularyRow = {
    id: number
    jmdict_id: string | null
    primary_word: string
    primary_kana: string | null
    jlpt: string | null
    verb_group: string | null
    is_common: boolean | null
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

    const row = vocabulary as VocabularyRow

    return {
        id: row.id,
        jmdict_id: row.jmdict_id,
        word: row.primary_word,
        kana: row.primary_kana,
        jlpt: row.jlpt,
        verb_group: row.verb_group,
        is_common: row.is_common,
        senses: (sensesResult.data || []) as VocabularySense[],
        writings:
            (writingsResult.data || []) as VocabularyWriting[],
        readings:
            (readingsResult.data || []) as VocabularyReading[],
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