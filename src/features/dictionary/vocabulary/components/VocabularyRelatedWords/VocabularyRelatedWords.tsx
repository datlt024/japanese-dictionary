import Link from "next/link"

import styles from "./VocabularyRelatedWords.module.css"

import {
    createVocabularyHref,
} from "@/features/dictionary/vocabulary/utils"

type RelatedVocabularyItem = {
    id: number
    word: string
    kana: string | null
    meaning: string | null
}

type RelationVocabulary = {
    id: number
    primary_word?: string | null
    primary_kana?: string | null
}

type Props = {
    language: "vi" | "en"
    embedded: boolean
    relatedVocabularies: RelatedVocabularyItem[]
    relationVocabularyList: RelationVocabulary[]
    currentVocabularyId: number
}

const FALLBACK_RELATED = [
    "学習",
    "研究",
    "宿題",
    "復習",
    "受験",
    "試験",
]

export default function VocabularyRelatedWords({
    language,
    embedded,
    relatedVocabularies,
    relationVocabularyList,
    currentVocabularyId,
}: Props) {
    const filteredRelatedVocabularies = relatedVocabularies
        .filter((item) => item.id !== currentVocabularyId)
        .slice(0, 8)

    const hasRelationWords = relationVocabularyList.length > 0
    const hasRelatedVocabularies = filteredRelatedVocabularies.length > 0
    const shouldShowFallback =
        !hasRelationWords && !hasRelatedVocabularies

    return (
        <div
            className={`${styles.detailSideCard} ${styles.vocabularyRelatedCard}`}
        >
            <h3>TỪ LIÊN QUAN</h3>

            {hasRelationWords && (
                <div className={styles.relatedChipList}>
                    {relationVocabularyList.map((item) => (
                        <Link
                            key={item.id}
                            href={createVocabularyHref(
                                item.id,
                                language,
                                embedded
                            )}
                            className={styles.relatedChip}
                        >
                            {item.primary_word ||
                                item.primary_kana ||
                                "Đang cập nhật"}
                        </Link>
                    ))}
                </div>
            )}

            {shouldShowFallback && (
                <div className={styles.relatedChipList}>
                    {FALLBACK_RELATED.map((item) => (
                        <span
                            key={item}
                            className={styles.relatedChip}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            )}

            {hasRelatedVocabularies && (
                <div className={styles.vocabularyRelatedList}>
                    {filteredRelatedVocabularies.map((item) => (
                        <Link
                            key={item.id}
                            href={createVocabularyHref(
                                item.id,
                                language,
                                embedded
                            )}
                            className={styles.vocabularyRelatedItem}
                        >
                            <strong>{item.word}</strong>
                            <span>{item.kana || "-"}</span>
                            <p>{item.meaning || "Đang cập nhật"}</p>
                        </Link>
                    ))}
                </div>
            )}

            <Link href="#" className={styles.moreRelatedLink}>
                Xem thêm →
            </Link>
        </div>
    )
}