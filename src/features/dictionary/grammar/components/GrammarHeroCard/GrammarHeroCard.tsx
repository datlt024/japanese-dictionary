"use client"

import { Bookmark, MoreHorizontal, Plus, Volume2 } from "lucide-react"

import type { GrammarPoint } from "@/domain/grammar"

import { getShortMeaning } from "@/features/dictionary/grammar/utils"
import { speakJapanese } from "@/shared/lib/tts/speakJapanese"

import styles from "./GrammarHeroCard.module.css"

type Props = {
    grammar: GrammarPoint
}

export default function GrammarHeroCard({ grammar }: Props) {
    function handleSpeak() {
        if (!grammar.pattern) return

        speakJapanese(grammar.pattern)
    }

    return (
        <section className={styles.heroCard}>
            <div className={styles.heroMain}>
                <div>
                    <div className={styles.patternRow}>
                        <h1>{grammar.pattern}</h1>
                    </div>

                    <div className={styles.badgeRow}>
                        {grammar.jlpt_level && (
                            <span className={styles.jlptBadge}>
                                JLPT {grammar.jlpt_level}
                            </span>
                        )}

                        {grammar.is_common && (
                            <span className={styles.commonBadge}>
                                Thường dùng
                            </span>
                        )}
                    </div>

                    <p className={styles.heroMeaning}>
                        {getShortMeaning(grammar)}
                    </p>
                </div>

                <div className={styles.heroActions}>
                    <button
                        type="button"
                        className={styles.actionButton}
                        aria-label="Lưu ngữ pháp"
                    >
                        <Bookmark size={18} aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        className={styles.actionButton}
                        aria-label="Thêm vào danh sách"
                    >
                        <Plus size={18} aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        className={styles.actionButton}
                        aria-label="Mở thêm tuỳ chọn"
                    >
                        <MoreHorizontal size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    )
}