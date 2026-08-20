"use client"

import { useState } from "react"

import { Bookmark, MoreHorizontal, Plus, Volume2 } from "lucide-react"
import { Button, Tooltip } from "antd"

import type { GrammarPoint } from "@/domain/grammar"

import { getShortMeaning } from "@/features/dictionary/grammar/utils"
import { speakJapanese } from "@/shared/lib/tts/speakJapanese"
import AuthModal from "@/shared/components/AuthModal"
import AddToNotebookModal from "@/shared/components/AddToNotebookModal"

import styles from "./GrammarHeroCard.module.css"

type Props = {
    grammar: GrammarPoint
}

export default function GrammarHeroCard({ grammar }: Props) {
    const [notebookOpen, setNotebookOpen] = useState(false)
    const [authOpen, setAuthOpen] = useState(false)

    function handleSpeak() {
        if (!grammar.pattern) return

        speakJapanese(grammar.pattern)
    }

    function handleLoginRequired() {
        setNotebookOpen(false)
        setAuthOpen(true)
    }

    const displayPattern = grammar.display_pattern ?? grammar.pattern

    return (
        <>
        <section className={styles.heroCard}>
            <div className={styles.heroMain}>
                <div>
                    <div className={styles.patternRow}>
                        <h1>{displayPattern}</h1>
                    </div>

                    <div className={styles.badgeRow}>
                        {grammar.jlpt_level && (
                            <span className={styles.jlptBadge} data-level={grammar.jlpt_level}>
                                {grammar.jlpt_level}
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
                    <Tooltip title="Phát âm">
                        <Button type="text" icon={<Volume2 size={18} />} onClick={handleSpeak} className={styles.actionButton} />
                    </Tooltip>
                    <Tooltip title="Lưu ngữ pháp">
                        <Button type="text" icon={<Bookmark size={18} />} className={styles.actionButton} />
                    </Tooltip>
                    <Tooltip title="Thêm vào sổ tay">
                        <Button type="text" icon={<Plus size={18} />} onClick={() => setNotebookOpen(true)} className={styles.actionButton} />
                    </Tooltip>
                    <Tooltip title="Mở thêm tuỳ chọn">
                        <Button type="text" icon={<MoreHorizontal size={18} />} className={styles.actionButton} />
                    </Tooltip>
                </div>
            </div>
        </section>

        <AddToNotebookModal
            open={notebookOpen}
            onClose={() => setNotebookOpen(false)}
            itemType="grammar"
            itemId={String(grammar.id)}
            onLoginRequired={handleLoginRequired}
        />

        <AuthModal
            open={authOpen}
            onClose={() => setAuthOpen(false)}
        />
        </>
    )
}