import Link from "next/link"

import type { GrammarPoint } from "@/domain/grammar"

import styles from "./RelatedGrammarSection.module.css"

type Props = {
    grammar: GrammarPoint
    relatedGrammars: GrammarPoint[]
    keyword: string
}

export default function RelatedGrammarSection({
    grammar,
    relatedGrammars,
    keyword,
}: Props) {
    const similarItems = grammar.similar_grammar || []

    if (similarItems.length === 0 && relatedGrammars.length === 0) {
        return null
    }

    return (
        <section className={styles.section}>
            <div className={styles.sectionTitleRow}>
                <span>6</span>
                <h2>Ngữ pháp liên quan</h2>
            </div>

            <div className={styles.relatedList}>
                {similarItems.map((item) => (
                    <span key={item} className={styles.relatedPill}>
                        {item}
                    </span>
                ))}

                {similarItems.length === 0 &&
                    relatedGrammars.map((item) => (
                        <Link
                            key={item.id}
                            href={`/grammar/${item.id}?q=${encodeURIComponent(
                                keyword || grammar.pattern
                            )}`}
                            className={styles.relatedPill}
                        >
                            {item.display_pattern ?? item.pattern}
                        </Link>
                    ))}
            </div>
        </section>
    )
}