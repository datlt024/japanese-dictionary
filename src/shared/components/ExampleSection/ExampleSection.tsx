"use client"

import { useState } from "react"

import { Volume2 } from "lucide-react"

import type { GrammarExample, GrammarRubyItem } from "@/domain/grammar"

import ActionButtons from "@/shared/components/ActionButtons/ActionButtons"
import { speakJapanese } from "@/shared/lib/tts/speakJapanese"

import styles from "./ExampleSection.module.css"

type Props = {
    examples?: GrammarExample[]
}

function renderWithRuby(text: string, ruby: GrammarRubyItem[]) {
    if (!ruby || ruby.length === 0) {
        return text
    }

    const result: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
        const match = ruby.find((item) => remaining.startsWith(item.base))

        if (match) {
            result.push(
                <ruby key={key++}>
                    {match.base}
                    <rt>{match.reading}</rt>
                </ruby>
            )
            remaining = remaining.slice(match.base.length)
        } else {
            result.push(remaining[0])
            remaining = remaining.slice(1)
            key++
        }
    }

    return result
}

export default function ExampleSection({ examples = [] }: Props) {
    const [showTranslation, setShowTranslation] = useState(true)

    if (examples.length === 0) return null

    return (
        <div className={styles.detailSection}>
            <div className={styles.sectionHeaderRow}>
                <h2>Ví dụ</h2>

                <label
                    className={`${styles.translationToggle}${showTranslation ? "" : ` ${styles.translationToggleOff}`}`}
                >
                    <span>Hiện dịch nghĩa</span>
                    <input
                        type="checkbox"
                        checked={showTranslation}
                        onChange={(e) => setShowTranslation(e.target.checked)}
                    />
                    <i />
                </label>
            </div>

            <div className={styles.exampleList}>
                {examples.map((example, index) => (
                    <div
                        key={index}
                        className={styles.exampleRow}
                    >
                        <span className={styles.exampleIndex}>
                            {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className={styles.exampleContent}>
                            <p className={styles.exampleJp}>
                                {renderWithRuby(example.jp, example.ruby)}
                            </p>

                            {showTranslation && (
                                <p className={styles.exampleVi}>
                                    {example.vi}
                                </p>
                            )}
                        </div>

                        <div className={styles.exampleActions}>
                            <ActionButtons
                                items={[
                                    {
                                        key: "speak",
                                        label: "Phát âm ví dụ",
                                        icon: <Volume2 />,
                                        onClick: () =>
                                            speakJapanese(example.jp),
                                    },
                                ]}
                                align="end"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
