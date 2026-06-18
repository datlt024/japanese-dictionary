import styles from "./KanjiDetailContent.module.css"

import type {
    Kanji,
    KanjiReadingGroup,
} from "@/domain/kanji"

import KanjiHeroCard from "./KanjiHeroCard/KanjiHeroCard"

import KanjiMeaningSection from "./KanjiMeaningSection/KanjiMeaningSection"
import KanjiReadingSection from "./KanjiReadingSection/KanjiReadingSection"
import KanjiStrokeOrderSection from "./KanjiStrokeOrderSection/KanjiStrokeOrderSection"
import KanjiVocabularyByReadingSection from "./KanjiVocabularyByReadingSection/KanjiVocabularyByReadingSection"
import KanjiExampleSection from "./KanjiExampleSection/KanjiExampleSection"

import KanjiAnalysisCard from "./sidebar/KanjiAnalysisCard"
import KanjiMemoryTipCard from "./sidebar/KanjiMemoryTipCard"
import DictionaryCommunityCard
    from "@/shared/components/DictionaryCommunityCard/DictionaryCommunityCard"

type Props = {
    kanji: Kanji | null
    loading: boolean
    examplesLoading: boolean
    kunyomiGroups: KanjiReadingGroup[]
    onyomiGroups: KanjiReadingGroup[]
    currentKanji: string
    kanjiOptions: string[]
    searchKeyword: string
    embedded?: boolean
}

export default function KanjiDetailContent({
    kanji,
    loading,
    examplesLoading,
    kunyomiGroups,
    onyomiGroups,
    currentKanji,
    kanjiOptions,
    searchKeyword,
    embedded = false,
}: Props) {
    const language: "vi" | "en" = "vi"

    if (loading) {
        return (
            <div className={styles.detailLayout}>
                <section className={styles.loadingCard}>
                    Đang tải...
                </section>
            </div>
        )
    }

    if (!kanji) {
        return (
            <section className={styles.emptyCard}>
                Không tìm thấy Hán tự
            </section>
        )
    }

    return (
        <div
            className={
                embedded
                    ? `${styles.detailLayout} ${styles.embeddedKanjiDetail}`
                    : styles.detailLayout
            }
        >
            <main className={styles.detailMain}>
                <KanjiHeroCard kanji={kanji} />

                <KanjiMeaningSection
                    kanji={kanji}
                    language={language}
                />

                <KanjiReadingSection kanji={kanji} />

                <KanjiStrokeOrderSection kanji={kanji} />

                <KanjiVocabularyByReadingSection
                    language={language}
                    examplesLoading={examplesLoading}
                    kunyomiGroups={kunyomiGroups}
                    onyomiGroups={onyomiGroups}
                />

                <KanjiExampleSection language={language} />
            </main>

            {!embedded && (
                <aside className={styles.detailSidebar}>
                    <KanjiAnalysisCard
                        kanji={kanji}
                        currentKanji={currentKanji}
                        kanjiOptions={kanjiOptions}
                        searchKeyword={searchKeyword}
                        embedded={embedded}
                    />

                    <KanjiMemoryTipCard kanji={kanji} />

                    <DictionaryCommunityCard />
                </aside>
            )}
        </div>
    )
}