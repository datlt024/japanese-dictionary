import styles from "./KanjiVocabularyByReadingSection.module.css"

import type { KanjiReadingGroup } from "@/domain/kanji"

import type {
    KanjiDetailLanguage,
} from "@/features/dictionary/kanji/constants/kanji-detail.constants"

import { getRelatedWordMeaning } from "@/features/dictionary/kanji/utils"

type Props = {
    language: KanjiDetailLanguage
    examplesLoading: boolean
    kunyomiGroups: KanjiReadingGroup[]
    onyomiGroups: KanjiReadingGroup[]
}

export default function KanjiVocabularyByReadingSection({
    examplesLoading,
    kunyomiGroups,
    onyomiGroups,
}: Props) {
    const hasDatabaseGroups =
        onyomiGroups.length > 0 || kunyomiGroups.length > 0

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>
                Từ vựng theo cách đọc
            </h2>

            {examplesLoading ? (
                <p className={styles.mutedText}>
                    Đang tải từ vựng...
                </p>
            ) : hasDatabaseGroups ? (
                <div className={styles.vocabReadingList}>
                    {onyomiGroups.map((group) => (
                        <ReadingGroupTable
                            key={`on-${group.reading}`}
                            type="ON"
                            group={group}
                        />
                    ))}

                    {kunyomiGroups.map((group) => (
                        <ReadingGroupTable
                            key={`kun-${group.reading}`}
                            type="KUN"
                            group={group}
                        />
                    ))}
                </div>
            ) : (
                <p className={styles.mutedText}>
                    Chưa có từ vựng theo cách đọc.
                </p>
            )}
        </section>
    )
}

type ReadingGroupTableProps = {
    type: "ON" | "KUN"
    group: KanjiReadingGroup
}

function ReadingGroupTable({
    type,
    group,
}: ReadingGroupTableProps) {
    const label = type === "ON" ? "ON" : "KUN"

    return (
        <div className={styles.vocabReadingBlock}>
            <div className={styles.vocabReadingHeader}>
                <span>{label}</span>
                <strong>{group.reading}</strong>
            </div>

            {group.words.length > 0 ? (
                <table className={styles.vocabTable}>
                    <thead>
                        <tr>
                            <th>Từ vựng</th>
                            <th>Cách đọc</th>
                            <th>Âm Hán Việt</th>
                            <th>Ý nghĩa</th>
                        </tr>
                    </thead>

                    <tbody>
                        {group.words.map((word) => (
                            <tr key={word.id}>
                                <td>{word.word}</td>

                                <td>
                                    {word.kana || group.reading || "-"}
                                </td>

                                <td>-</td>

                                <td>
                                    {getRelatedWordMeaning(word)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className={styles.mutedText}>
                    Chưa có từ vựng cho cách đọc này.
                </p>
            )}
        </div>
    )
}