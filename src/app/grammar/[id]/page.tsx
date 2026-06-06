"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"

import styles from "@/features/grammar/styles/GrammarDetail.module.css"

import AppLayout from "@/shared/components/layout/AppLayout"
import { getGrammarMeaning } from "@/features/grammar/utils"

import {
    getGrammarPointById,
    searchGrammarPoints,
} from "@/features/grammar/services/grammar.service"

import type { GrammarPoint } from "@/features/grammar/types"

function RubyText({
    ruby,
    fallback,
}: {
    ruby?: {
        text: string
        reading: string | null
    }[]
    fallback: string
}) {
    if (!ruby || ruby.length === 0) {
        return <>{fallback}</>
    }

    return (
        <>
            {ruby.map((item, index) =>
                item.reading ? (
                    <ruby key={index}>
                        {item.text}
                        <rt>{item.reading}</rt>
                    </ruby>
                ) : (
                    <span key={index}>{item.text}</span>
                )
            )}
        </>
    )
}

function FormationText({
    tokens,
    fallback,
}: {
    tokens?: {
        text: string
        type: "text" | "drop"
    }[]
    fallback: string
}) {
    if (!tokens || tokens.length === 0) {
        return <>{fallback}</>
    }

    return (
        <>
            {tokens.map((token, index) =>
                token.type === "drop" ? (
                    <span
                        key={index}
                        className={styles.grammarDrop}
                    >
                        {token.text}
                    </span>
                ) : (
                    <span key={index}>{token.text}</span>
                )
            )}
        </>
    )
}

export default function GrammarDetailPage() {
    const params = useParams<{ id: string }>()
    const searchParams = useSearchParams()

    const id = params.id
    const keywordFromUrl = searchParams.get("q") || ""

    const [grammar, setGrammar] =
        useState<GrammarPoint | null>(null)

    const [relatedGrammars, setRelatedGrammars] =
        useState<GrammarPoint[]>([])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchGrammar() {
            setLoading(true)

            try {
                const data = await getGrammarPointById(id)

                if (!data) {
                    setGrammar(null)
                    setRelatedGrammars([])
                    return
                }

                setGrammar(data)

                const searchKeyword =
                    keywordFromUrl || data.pattern

                const related =
                    await searchGrammarPoints(searchKeyword)

                setRelatedGrammars(related)
            } catch (error) {
                console.error("Failed to fetch grammar:", error)
                setGrammar(null)
                setRelatedGrammars([])
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchGrammar()
        }
    }, [id, keywordFromUrl])

    return (
        <AppLayout
            title="Tra cứu"
            searchKeyword={keywordFromUrl || grammar?.pattern || ""}
            activeSearchTab="grammar"
        >
            <main className={styles.grammarDetailPage}>
                {loading ? (
                    <div className={styles.grammarPageCard}>
                        <p>Đang tải ngữ pháp...</p>
                    </div>
                ) : !grammar ? (
                    <div className={styles.grammarPageCard}>
                        <h1>Không tìm thấy ngữ pháp</h1>
                    </div>
                ) : (
                    <div className={styles.grammarPageCard}>
                        <div className={styles.grammarDetailLayout}>
                            <section className={styles.grammarMainCard}>
                                <div className={styles.grammarHeader}>
                                    <div>
                                        <h1>{grammar.pattern}</h1>

                                        <p>
                                            {getGrammarMeaning(grammar) ||
                                                "Chưa có nghĩa"}
                                        </p>
                                    </div>

                                    <button
                                        className={
                                            styles.grammarAddButton
                                        }
                                    >
                                        ＋
                                    </button>
                                </div>

                                {grammar.jlpt_level && (
                                    <div
                                        className={
                                            styles.grammarJlptBadge
                                        }
                                    >
                                        {grammar.jlpt_level}
                                    </div>
                                )}

                                {grammar.formation?.length > 0 && (
                                    <section
                                        className={
                                            styles.grammarSection
                                        }
                                    >
                                        <h2>Cấu trúc</h2>

                                        <div
                                            className={
                                                styles.grammarStructure
                                            }
                                        >
                                            {grammar.formation.map(
                                                (
                                                    group,
                                                    groupIndex
                                                ) => (
                                                    <div
                                                        key={groupIndex}
                                                    >
                                                        <h3>
                                                            {
                                                                group.label
                                                            }
                                                        </h3>

                                                        {group.patterns.map(
                                                            (
                                                                pattern,
                                                                patternIndex
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        patternIndex
                                                                    }
                                                                    className={
                                                                        styles.grammarFormationPattern
                                                                    }
                                                                >
                                                                    <p>
                                                                        <FormationText
                                                                            tokens={
                                                                                pattern.tokens
                                                                            }
                                                                            fallback={
                                                                                pattern.structure
                                                                            }
                                                                        />
                                                                    </p>

                                                                    {pattern.note_vi && (
                                                                        <small>
                                                                            {
                                                                                pattern.note_vi
                                                                            }
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </section>
                                )}

                                {(grammar.explanation_vi ||
                                    grammar.explanation_en) && (
                                        <section
                                            className={
                                                styles.grammarSection
                                            }
                                        >
                                            <h2>Nghĩa</h2>

                                            <p>
                                                {grammar.explanation_vi ||
                                                    grammar.explanation_en}
                                            </p>
                                        </section>
                                    )}

                                {grammar.nuance_vi && (
                                    <section
                                        className={
                                            styles.grammarSection
                                        }
                                    >
                                        <h2>Sắc thái</h2>
                                        <p>{grammar.nuance_vi}</p>
                                    </section>
                                )}

                                {grammar.examples?.length > 0 && (
                                    <section
                                        className={
                                            styles.grammarSection
                                        }
                                    >
                                        <h2>Ví dụ</h2>

                                        {grammar.examples.map(
                                            (example, index) => (
                                                <div
                                                    key={index}
                                                    className={
                                                        styles.grammarExample
                                                    }
                                                >
                                                    <p
                                                        className={
                                                            styles.grammarExampleJp
                                                        }
                                                    >
                                                        <RubyText
                                                            ruby={
                                                                example.ruby
                                                            }
                                                            fallback={
                                                                example.japanese
                                                            }
                                                        />
                                                    </p>

                                                    {example.meaning_vi && (
                                                        <p
                                                            className={
                                                                styles.grammarExampleVi
                                                            }
                                                        >
                                                            {
                                                                example.meaning_vi
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </section>
                                )}

                                {grammar.differences?.length > 0 && (
                                    <section
                                        className={
                                            styles.grammarSection
                                        }
                                    >
                                        <h2>Dễ nhầm lẫn</h2>

                                        {grammar.differences.map(
                                            (item, index) => (
                                                <div key={index}>
                                                    <strong>
                                                        {item.grammar}
                                                    </strong>
                                                    <p>
                                                        {
                                                            item.description_vi
                                                        }
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </section>
                                )}

                                {grammar.notes?.length > 0 && (
                                    <section
                                        className={
                                            styles.grammarSection
                                        }
                                    >
                                        <h2>Ghi chú</h2>

                                        <ul>
                                            {grammar.notes.map(
                                                (note, index) => (
                                                    <li key={index}>
                                                        {note}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </section>
                                )}
                            </section>

                            <aside className={styles.grammarSideCard}>
                                <h3>Kết quả tra cứu ngữ pháp</h3>

                                {relatedGrammars.length === 0 ? (
                                    <p className={styles.grammarEmpty}>
                                        Không có kết quả liên quan.
                                    </p>
                                ) : (
                                    <div
                                        className={
                                            styles.grammarResultList
                                        }
                                    >
                                        {relatedGrammars.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={`/grammar/${item.id}?q=${encodeURIComponent(
                                                    keywordFromUrl ||
                                                    grammar.pattern
                                                )}`}
                                                className={
                                                    item.id ===
                                                        grammar.id
                                                        ? `${styles.grammarResultItem} ${styles.active}`
                                                        : styles.grammarResultItem
                                                }
                                            >
                                                {item.jlpt_level && (
                                                    <span
                                                        className={
                                                            styles.grammarResultLevel
                                                        }
                                                    >
                                                        {item.jlpt_level}
                                                    </span>
                                                )}

                                                <strong>
                                                    {item.pattern}
                                                </strong>

                                                <p>
                                                    {getGrammarMeaning(
                                                        item
                                                    ) || "Chưa có nghĩa"}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </aside>
                        </div>
                    </div>
                )}
            </main>
        </AppLayout>
    )
}