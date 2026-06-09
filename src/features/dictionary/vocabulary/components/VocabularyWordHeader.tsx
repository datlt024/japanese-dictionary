import styles from "./VocabularyWordHeader.module.css"

import type { Vocabulary } from "@/domain/vocabulary/vocabulary.type"

type Props = {
    vocabulary: Vocabulary
    meaning: string
    hasSuruVerb: boolean
    verbGroupLabel: string | null
}

export default function VocabularyWordHeader({
    vocabulary,
    meaning,
    hasSuruVerb,
    verbGroupLabel,
}: Props) {
    return (
        <div className={styles.detailHeader}>
            <div className={styles.headerContent}>
                <div className={styles.wordBlock}>
                    <p className={styles.detailKana}>
                        {vocabulary.kana || "-"}
                    </p>

                    <div className={styles.wordRow}>
                        <h1 className={styles.detailWord}>
                            {vocabulary.word}
                        </h1>

                        <button
                            type="button"
                            className={styles.soundButton}
                            aria-label="Phát âm"
                        >
                            🔊
                        </button>
                    </div>

                    <div className={styles.badgeRow}>
                        {vocabulary.jlpt && (
                            <span className={styles.levelBadge}>
                                {vocabulary.jlpt}
                            </span>
                        )}

                        {vocabulary.is_common && (
                            <span className={styles.commonBadge}>
                                Từ thông dụng
                            </span>
                        )}

                        {hasSuruVerb && (
                            <span className={styles.verbBadge}>
                                vs
                            </span>
                        )}

                        {verbGroupLabel && (
                            <span className={styles.neutralBadge}>
                                {verbGroupLabel}
                            </span>
                        )}
                    </div>

                    <p className={styles.detailMeaning}>
                        {meaning}
                    </p>
                </div>

                <div className={styles.headerAside}>
                    <div className={styles.detailActions}>
                        <button type="button" aria-label="Lưu">
                            ☆
                        </button>
                        <button type="button" aria-label="Thêm">
                            ＋
                        </button>
                        <button type="button" aria-label="Menu">
                            ☷
                        </button>
                    </div>

                    <div className={styles.pitchBox}>
                        <span className={styles.pitchLabel}>
                            Heiban（平板型）
                        </span>

                        <div className={styles.pitchGraph}>
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>

                        <button
                            type="button"
                            className={styles.pitchPlayButton}
                            aria-label="Phát âm pitch accent"
                        >
                            ▶
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
