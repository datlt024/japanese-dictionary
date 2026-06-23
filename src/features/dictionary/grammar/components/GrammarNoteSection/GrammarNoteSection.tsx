import type { GrammarPoint } from "@/domain/grammar"

import { hasItems, isTeShimau } from "@/features/dictionary/grammar/utils"

import styles from "./GrammarNoteSection.module.css"

type Props = {
    grammar: GrammarPoint
}

export default function GrammarNoteSection({ grammar }: Props) {
    if (!hasItems(grammar.notes) && !isTeShimau(grammar)) return null

    return (
        <section className={styles.noteSection}>
            <h2>Lưu ý</h2>

            {hasItems(grammar.notes) ? (
                <ul>
                    {grammar.notes.map((note) => (
                        <li key={note}>{note}</li>
                    ))}
                </ul>
            ) : (
                <div className={styles.noteFlow}>
                    <p>Trong hội thoại, ～てしまう thường được rút gọn.</p>

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
            )}
        </section>
    )
}