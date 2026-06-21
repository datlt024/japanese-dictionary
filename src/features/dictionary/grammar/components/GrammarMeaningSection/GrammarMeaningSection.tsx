import type { GrammarPoint } from "@/domain/grammar"

import {
    getMainMeaning,
    splitMeaning,
} from "@/features/dictionary/grammar/utils"

import styles from "./GrammarMeaningSection.module.css"

type Props = {
    grammar: GrammarPoint
}

export default function GrammarMeaningSection({ grammar }: Props) {
    const meanings = splitMeaning(getMainMeaning(grammar))

    if (meanings.length === 0) return null

    return (
        <section className={styles.section}>
            <div className={styles.sectionTitleRow}>
                <span>2</span>
                <h2>Ý nghĩa</h2>
            </div>

            <div className={styles.meaningLayout}>
                <div className={styles.meaningBox}>
                    <ul>
                        {meanings.map((meaning) => (
                            <li key={meaning}>
                                <span>・</span>
                                <p>{meaning}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.illustrationBox}>
                    <div className={styles.face}>🤔</div>
                    <div className={styles.light}>💡</div>
                </div>
            </div>
        </section>
    )
}