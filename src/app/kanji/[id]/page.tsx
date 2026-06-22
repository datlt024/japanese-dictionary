import styles from "@/features/dictionary/kanji/components/KanjiDetailContent.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import KanjiDetailContent from "@/features/dictionary/kanji/components/KanjiDetailContent"

import { uniqueArray } from "@/shared/utils/uniqueArray"

import {
    getKanjiByCharacter,
    getWordsByReadingGroups,
} from "@/features/dictionary/kanji/services/kanji.service"

import { extractKanjis } from "@/features/dictionary/kanji/utils"

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ q?: string }>
}

export default async function KanjiDetailPage({ params, searchParams }: Props) {
    const { id } = await params
    const { q } = await searchParams

    const currentKanji = decodeURIComponent(id).replace(/\0/g, "")
    const searchKeyword = q || currentKanji

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
                />
            </main>
        </AppLayout>
    )
}
