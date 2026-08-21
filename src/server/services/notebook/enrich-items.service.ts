import "server-only"
import { supabaseAdmin } from "@/server/supabase/server"
import type { EnrichedNotebookItem, NotebookItem } from "@/domain/notebook/notebook.type"

function isKanji(ch: string) {
    const code = ch.codePointAt(0) ?? 0
    return (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf)
}

export async function enrichItems(items: NotebookItem[]): Promise<EnrichedNotebookItem[]> {
    if (items.length === 0) return []

    const vocabItems = items.filter((i) => i.item_type === "vocabulary")
    const kanjiItems = items.filter((i) => i.item_type === "kanji")
    const grammarItems = items.filter((i) => i.item_type === "grammar")

    const [vocabResult, kanjiResult, grammarResult] = await Promise.all([
        vocabItems.length > 0
            ? supabaseAdmin
                .from("vocabularies")
                .select("id, primary_word, primary_kana, vocabulary_senses(meaning_vi, sense_index)")
                .in("id", vocabItems.map((i) => Number(i.item_id)))
            : { data: [], error: null },
        kanjiItems.length > 0
            ? supabaseAdmin
                .from("kanjis")
                .select("kanji, han_viet, meaning_vi")
                .in("kanji", kanjiItems.map((i) => i.item_id))
            : { data: [], error: null },
        grammarItems.length > 0
            ? supabaseAdmin
                .from("grammars")
                .select("id, pattern, display_pattern, short_meaning_vi, jlpt_level")
                .in("id", grammarItems.map((i) => Number(i.item_id)))
            : { data: [], error: null },
    ])

    if (vocabResult.error) throw vocabResult.error
    if (kanjiResult.error) throw kanjiResult.error
    if (grammarResult.error) throw grammarResult.error

    const vocabMap = new Map((vocabResult.data ?? []).map((v) => [String(v.id), v]))
    const kanjiMap = new Map((kanjiResult.data ?? []).map((k) => [k.kanji, k]))
    const grammarMap = new Map((grammarResult.data ?? []).map((g) => [String(g.id), g]))

    const vocabKanjiChars = [...new Set(
        (vocabResult.data ?? []).flatMap((v) => [...v.primary_word].filter(isKanji))
    )]
    const vocabKanjiResult = vocabKanjiChars.length > 0
        ? await supabaseAdmin
            .from("kanjis")
            .select("kanji, han_viet")
            .in("kanji", vocabKanjiChars)
        : { data: [], error: null }
    if (vocabKanjiResult.error) throw vocabKanjiResult.error
    const hanVietMap = new Map((vocabKanjiResult.data ?? []).map((k) => [k.kanji, k.han_viet]))

    return items.map((item): EnrichedNotebookItem => {
        if (item.item_type === "vocabulary") {
            const v = vocabMap.get(item.item_id)
            const senses = v && "vocabulary_senses" in v
                ? (v.vocabulary_senses as { meaning_vi: string | null; sense_index: number }[])
                : []
            const firstMeaning = senses
                .sort((a, b) => a.sense_index - b.sense_index)
                .find((s) => s.meaning_vi)?.meaning_vi ?? null
            const word = v?.primary_word ?? ""
            const hanViet = [...word].map((ch) => hanVietMap.get(ch)).filter(Boolean).join(" ") || null
            return {
                ...item,
                display: {
                    title: word || item.item_id,
                    subtitle: v?.primary_kana ?? null,
                    han_viet: hanViet,
                    meaning: firstMeaning,
                    href: `/vocabulary/${item.item_id}`,
                },
            }
        }
        if (item.item_type === "kanji") {
            const k = kanjiMap.get(item.item_id)
            return {
                ...item,
                display: {
                    title: item.item_id,
                    subtitle: k?.han_viet ?? null,
                    han_viet: null,
                    meaning: k?.meaning_vi ?? null,
                    href: `/kanji/${item.item_id}`,
                },
            }
        }
        const g = grammarMap.get(item.item_id)
        return {
            ...item,
            display: {
                title: g?.display_pattern ?? g?.pattern ?? item.item_id,
                subtitle: g?.jlpt_level ? `JLPT ${g.jlpt_level}` : null,
                han_viet: null,
                meaning: g?.short_meaning_vi ?? null,
                href: `/grammar/${item.item_id}`,
            },
        }
    })
}
