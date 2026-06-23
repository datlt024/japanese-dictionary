import type { GrammarPoint } from "@/domain/grammar"

import { hasItems } from "@/features/dictionary/grammar/utils"

import styles from "./ConfusableGrammarSection.module.css"

type Props = {
    grammar: GrammarPoint
}

export default function ConfusableGrammarSection({ grammar }: Props) {
    if (!hasItems(grammar.differences)) return null

    return (
        <section className={styles.section}>
            <div className={styles.sectionTitleRow}>
                <span>5</span>
                <h2>Dễ nhầm với</h2>
            </div>

            <div className={styles.differenceList}>
                {grammar.differences.map((item) => (
                    <div key={item.grammar} className={styles.differenceItem}>
                        <strong>{item.grammar}</strong>
                        <p>{item.description_vi}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}