import type { GrammarPoint } from "@/domain/grammar"

import { getExplanation } from "@/features/dictionary/grammar/utils"

import styles from "./GrammarExplanationSection.module.css"

type Props = {
    grammar: GrammarPoint
}

function splitExplanation(value: string) {
    return value
        .split(/[。\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
}

export default function GrammarExplanationSection({ grammar }: Props) {
    const explanation = getExplanation(grammar)

    if (!explanation && !grammar.nuance_vi) return null

    const explanationItems = explanation
        ? splitExplanation(explanation)
        : []

    return (
        <section className={styles.section}>
            <div className={styles.sectionTitleRow}>
                <span>3</span>
                <h2>Giải thích</h2>
            </div>

            {explanationItems.length > 0 ? (
                <ul className={styles.explanationList}>
                    {explanationItems.map((item) => (
                        <li key={item}>
                            <span>・</span>
                            <p>{item}</p>
                        </li>
                    ))}
                </ul>
            ) : null}

            {grammar.nuance_vi && (
                <div className={styles.nuanceBox}>
                    <strong>Sắc thái</strong>
                    <p>{grammar.nuance_vi}</p>
                </div>
            )}
        </section>
    )
}