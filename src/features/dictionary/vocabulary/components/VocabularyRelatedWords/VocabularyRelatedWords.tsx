import Link from "next/link"

import styles from "./VocabularyRelatedWords.module.css"

import {
    createVocabularyHref,
} from "@/features/dictionary/vocabulary/utils"

type RelationVocabulary = {
    id: number
    primary_word?: string | null
    primary_kana?: string | null
}

type Props = {
    language: "vi" | "en"
    embedded: boolean
    synonymList: RelationVocabulary[]
    antonymList: RelationVocabulary[]
}

export default function VocabularyRelatedWords({
    language,
    embedded,
    synonymList,
    antonymList,
}: Props) {
    if (synonymList.length === 0 && antonymList.length === 0) {
        return null
    }

    return (
        <div
            className={`${styles.detailSideCard} ${styles.vocabularyRelatedCard}`}
        >
            {synonymList.length > 0 && (
                <div className={styles.wordGroup}>
                    <h3 className={styles.titleSynonym}>TỪ ĐỒNG NGHĨA</h3>
                    <div className={styles.relatedChipList}>
                        {synonymList.map((item) => (
                            <Link
                                key={item.id}
                                href={createVocabularyHref(item.id, language, embedded)}
                                className={styles.relatedChip}
                            >
                                {item.primary_word || item.primary_kana || "Đang cập nhật"}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {antonymList.length > 0 && (
                <div className={styles.wordGroup}>
                    <h3 className={styles.titleAntonym}>TỪ TRÁI NGHĨA</h3>
                    <div className={styles.relatedChipList}>
                        {antonymList.map((item) => (
                            <Link
                                key={item.id}
                                href={createVocabularyHref(item.id, language, embedded)}
                                className={styles.relatedChip}
                            >
                                {item.primary_word || item.primary_kana || "Đang cập nhật"}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}