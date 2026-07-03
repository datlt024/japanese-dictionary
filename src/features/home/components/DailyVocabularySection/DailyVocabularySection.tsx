import { findVocabularyIdsByPrimaryWords } from "@/server/repositories/vocabulary/vocabulary.repository"

import DailyVocabularySectionClient from "./DailyVocabularySectionClient"

export type DailyVocabularyItem = {
    word: string
    reading: string
    meaning: string
    type: string
    jlpt: string | null
    vocabularyId: number | undefined
}

const WORD_CONFIGS = [
    { word: "情報",   reading: "じょうほう", meaning: "thông tin",              type: "Danh từ" },
    { word: "経験",   reading: "けいけん",   meaning: "kinh nghiệm",            type: "Danh từ" },
    { word: "母",     reading: "はは",       meaning: "mẹ (ngôi thứ nhất)",     type: "Danh từ" },
    { word: "父",     reading: "ちち",       meaning: "bố (ngôi thứ nhất)",     type: "Danh từ" },
    { word: "勉強",   reading: "べんきょう", meaning: "học tập",                type: "Danh từ" },
    { word: "友達",   reading: "ともだち",   meaning: "bạn bè",                 type: "Danh từ" },
    { word: "仕事",   reading: "しごと",     meaning: "công việc",              type: "Danh từ" },
    { word: "旅行",   reading: "りょこう",   meaning: "du lịch",                type: "Danh từ" },
    { word: "自然",   reading: "しぜん",     meaning: "thiên nhiên",            type: "Danh từ" },
    { word: "問題",   reading: "もんだい",   meaning: "vấn đề",                 type: "Danh từ" },
    { word: "言葉",   reading: "ことば",     meaning: "ngôn ngữ, từ ngữ",       type: "Danh từ" },
    { word: "技術",   reading: "ぎじゅつ",   meaning: "kỹ thuật, công nghệ",    type: "Danh từ" },
]

export default async function DailyVocabularySection() {
    const words = WORD_CONFIGS.map((w) => w.word)
    const { data: rows } = await findVocabularyIdsByPrimaryWords(words)

    const idMap = new Map<string, number>()
    const jlptMap = new Map<string, string | null>()

    for (const row of rows ?? []) {
        if (!idMap.has(row.primary_word)) {
            idMap.set(row.primary_word, row.id)
            jlptMap.set(row.primary_word, row.jlpt ?? null)
        }
    }

    const items: DailyVocabularyItem[] = WORD_CONFIGS.map((config) => ({
        ...config,
        jlpt: jlptMap.get(config.word) ?? null,
        vocabularyId: idMap.get(config.word),
    }))

    return <DailyVocabularySectionClient items={items} />
}
