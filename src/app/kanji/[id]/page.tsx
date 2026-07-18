import type { Metadata } from "next"
import styles from "@/features/dictionary/kanji/components/KanjiDetailContent.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import KanjiDetailContent from "@/features/dictionary/kanji/components/KanjiDetailContent"

import { uniqueArray } from "@/shared/utils/array"

import {
    getKanjiByCharacter,
    getWordsByReadingGroups,
} from "@/features/dictionary/kanji/services/kanji.service"

import { extractKanjis } from "@/features/dictionary/kanji/utils"

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ q?: string; lang?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const char = decodeURIComponent(id).replace(/\0/g, "")
    const kanji = await getKanjiByCharacter(char)
    if (!kanji) return { title: `${char} — Hán tự | Mazii` }
    const meaning = kanji.meaning_vi || kanji.meaning_en || ""
    return {
        title: `${char} ${kanji.han_viet ? `(${kanji.han_viet})` : ""} — Hán tự | Mazii`.trim(),
        description: meaning
            ? `Hán tự ${char} — ${kanji.han_viet ?? ""}: ${meaning}. Tra cứu âm On, âm Kun và từ vựng liên quan.`
            : `Tra cứu Hán tự ${char} trong từ điển tiếng Nhật.`,
    }
}

export default async function KanjiDetailPage({ params, searchParams }: Props) {
    const { id } = await params
    const { q, lang } = await searchParams

    const currentKanji = decodeURIComponent(id).replace(/\0/g, "")
    const searchKeyword = q || currentKanji
    const language: "vi" | "en" = lang === "en" ? "en" : "vi"

    const kanjis = extractKanjis(searchKeyword)
    const kanjiOptions = uniqueArray(
        kanjis.length > 0 ? kanjis : currentKanji ? [currentKanji] : []
    )

    const kanjiData = await getKanjiByCharacter(currentKanji)

    const [kunyomiGroups, onyomiGroups] = kanjiData
        ? await Promise.all([
              getWordsByReadingGroups(currentKanji, kanjiData.kunyomi, "kunyomi"),
              getWordsByReadingGroups(currentKanji, kanjiData.onyomi, "onyomi"),
          ])
        : [[], []]

    return (
        <AppLayout
            title="Hán tự"
            searchKeyword={searchKeyword}
            activeSearchTab="kanji"
        >
            <main
                className={styles.kanjiDetailPage}
                data-quick-lookup-root="true"
            >
                <KanjiDetailContent
                    kanji={kanjiData}
                    loading={false}
                    examplesLoading={false}
                    kunyomiGroups={kunyomiGroups}
                    onyomiGroups={onyomiGroups}
                    currentKanji={currentKanji}
                    kanjiOptions={kanjiOptions}
                    searchKeyword={searchKeyword}
                    language={language}
                />
            </main>
        </AppLayout>
    )
}
