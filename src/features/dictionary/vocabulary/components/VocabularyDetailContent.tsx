import styles from "./VocabularyDetailContent.module.css"

import { conjugateVerb } from "@/features/dictionary/vocabulary/utils/verbConjugation"

import {
    getHeaderMeaning,
    getRelationVocabularyList,
    getRelationsByType,
    getVerbGroupLabel,
    hasPartOfSpeech,
} from "@/features/dictionary/vocabulary/utils"

import VocabularyCommunityCard from "./VocabularyCommunityCard"
import VocabularyExampleSection from "./VocabularyExampleSection"
import VocabularyKanjiAnalysis from "./VocabularyKanjiAnalysis"
import VocabularyMeaningCards from "./VocabularyMeaningCards"
import VocabularyRelatedWords from "./VocabularyRelatedWords"
import VocabularyWordHeader from "./VocabularyWordHeader"

import type { Vocabulary } from "@/domain/vocabulary/vocabulary.type"
import type {
    VocabularyKanjiDetail,
} from "@/server/services/vocabulary/vocabulary.service"

type RelatedVocabularyItem = {
    id: number
    word: string
    kana: string | null
    meaning: string | null
}

type VocabularyDetailContentProps = {
    vocabulary: Vocabulary
    language: "vi" | "en"
    relatedVocabularies: RelatedVocabularyItem[]
    kanjiDetails: VocabularyKanjiDetail[]
    embedded?: boolean
}

export default function VocabularyDetailContent({
    vocabulary,
    language,
    relatedVocabularies,
    kanjiDetails,
    embedded = false,
}: VocabularyDetailContentProps) {
    const conjugations = conjugateVerb(
        vocabulary.word,
        vocabulary.verb_group
    )

    const verbGroupLabel = getVerbGroupLabel(vocabulary.verb_group)

    const synonyms = getRelationsByType(vocabulary.relations, "synonym")
    const antonyms = getRelationsByType(vocabulary.relations, "antonym")

    const relationVocabularyList = [
        ...getRelationVocabularyList(synonyms),
        ...getRelationVocabularyList(antonyms),
    ]

    const nounSenses = vocabulary.senses.filter(
        (sense) => !hasPartOfSpeech(sense, "vs")
    )

    const suruVerbSenses = vocabulary.senses.filter((sense) =>
        hasPartOfSpeech(sense, "vs")
    )

    const hasSuruVerb = suruVerbSenses.length > 0

    return (
        <div className={styles.detailLayout}>
            <section className={styles.detailMain}>
                <VocabularyWordHeader
                    vocabulary={vocabulary}
                    meaning={getHeaderMeaning(vocabulary, language)}
                    hasSuruVerb={hasSuruVerb}
                    verbGroupLabel={verbGroupLabel}
                />

                <VocabularyMeaningCards
                    vocabulary={vocabulary}
                    language={language}
                    nounSenses={
                        hasSuruVerb
                            ? nounSenses
                            : vocabulary.senses
                    }
                    suruVerbSenses={suruVerbSenses}
                    hasSuruVerb={hasSuruVerb}
                />

                {vocabulary.writings.length > 1 && (
                    <div className={styles.detailSection}>
                        <h2>Cách viết khác</h2>

                        <div className={styles.tagList}>
                            {vocabulary.writings
                                .filter(
                                    (item) =>
                                        item.writing !== vocabulary.word
                                )
                                .map((item) => (
                                    <span
                                        key={item.id}
                                        className={styles.detailTag}
                                    >
                                        {item.writing}
                                    </span>
                                ))}
                        </div>
                    </div>
                )}

                {conjugations.length > 0 && (
                    <div className={styles.detailSection}>
                        <h2>Chia động từ</h2>

                        <div className={styles.conjugationTable}>
                            {conjugations.map((item) => (
                                <div
                                    key={item.label}
                                    className={
                                        styles.conjugationRow
                                    }
                                >
                                    <span>{item.label}</span>
                                    <strong>{item.form}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {vocabulary.collocations.length > 0 && (
                    <div className={styles.detailSection}>
                        <h2>Cụm từ thường dùng</h2>

                        <div className={styles.collocationList}>
                            {vocabulary.collocations.map((item) => (
                                <div
                                    key={item.id}
                                    className={
                                        styles.collocationItem
                                    }
                                >
                                    <p
                                        className={
                                            styles.collocationExpression
                                        }
                                    >
                                        {item.expression_jp}
                                    </p>

                                    <p
                                        className={
                                            styles.collocationMeaning
                                        }
                                    >
                                        {language === "en"
                                            ? item.meaning_en ||
                                            item.meaning_vi ||
                                            "Updating..."
                                            : item.meaning_vi ||
                                            item.meaning_en ||
                                            "Đang cập nhật nghĩa tiếng Việt"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <VocabularyExampleSection />
            </section>

            <aside className={styles.detailSidebar}>
                {kanjiDetails.length > 0 && (
                    <VocabularyKanjiAnalysis
                        vocabularyWord={vocabulary.word}
                        kanjiDetails={kanjiDetails}
                        language={language}
                        embedded={embedded}
                    />
                )}

                <VocabularyCommunityCard />

                <VocabularyRelatedWords
                    language={language}
                    embedded={embedded}
                    relatedVocabularies={relatedVocabularies}
                    relationVocabularyList={relationVocabularyList}
                    currentVocabularyId={vocabulary.id}
                />
            </aside>
        </div>
    )
}