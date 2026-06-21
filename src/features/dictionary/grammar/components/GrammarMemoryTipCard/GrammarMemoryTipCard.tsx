import type { GrammarPoint } from "@/domain/grammar"

import {
    getShortMeaning,
    isTeShimau,
} from "@/features/dictionary/grammar/utils"

import styles from "./GrammarMemoryTipCard.module.css"

type Props = {
    grammar: GrammarPoint
}

export default function GrammarMemoryTipCard({ grammar }: Props) {
    if (isTeShimau(grammar)) {
        return (
            <div className={styles.memoryCard}>
                <h3>💡 MẸO GHI NHỚ</h3>

                <div className={styles.rememberBox}>
                    <span>Hãy nhớ:</span>
                    <strong>
                        しまう ≈ “xong mất rồi / lỡ mất rồi”
                    </strong>
                </div>

                <div className={styles.memoryExample}>
                    <div>
                        <p>食べてしまう</p>
                        <span>→ ăn hết mất rồi</span>
                    </div>

                    <div className={styles.emojiIllustration}>
                        🍜😋
                    </div>
                </div>

                <div className={styles.memoryExample}>
                    <div>
                        <p>忘れてしまう</p>
                        <span>→ lỡ quên mất rồi</span>
                    </div>

                    <div className={styles.emojiIllustration}>
                        😵💭
                    </div>
                </div>

                <div className={styles.shortenBox}>
                    <p>Rút gọn thường gặp:</p>

                    <div>
                        <span>～てしまう</span>
                        <strong>→</strong>
                        <span>～ちゃう</span>
                    </div>

                    <div>
                        <span>～でしまう</span>
                        <strong>→</strong>
                        <span>～じゃう</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.memoryCard}>
            <h3>💡 MẸO GHI NHỚ</h3>

            <div className={styles.rememberBox}>
                <span>Hãy nhớ:</span>
                <strong>{grammar.pattern}</strong>
            </div>

            <div className={styles.memoryExample}>
                <div>
                    <p>{grammar.pattern}</p>
                    <span>→ {getShortMeaning(grammar)}</span>
                </div>

                <div className={styles.emojiIllustration}>📘💡</div>
            </div>

            {grammar.notes?.[0] && (
                <div className={styles.shortenBox}>
                    <p>Lưu ý:</p>
                    <span>{grammar.notes[0]}</span>
                </div>
            )}
        </div>
    )
}