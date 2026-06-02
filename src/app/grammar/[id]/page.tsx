"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"

import "@/styles/grammar-detail.css"

import AppLayout from "@/shared/components/layout/AppLayout"

import {
    getGrammarPointById,
    searchGrammarPoints,
    GrammarPoint,
} from "@/features/grammar/services/grammar.service"

function getGrammarMeaning(grammar: GrammarPoint) {
    return (
        grammar.short_meaning_vi ||
        grammar.meaning_vi ||
        grammar.meaning_en ||
        ""
    )
}

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
                        className="grammar-drop"
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
            <main className="grammar-detail-page">
                {loading ? (
                    <div className="grammar-page-card">
                        <p>Đang tải ngữ pháp...</p>
                    </div>
                ) : !grammar ? (
                    <div className="grammar-page-card">
                        <h1>Không tìm thấy ngữ pháp</h1>
                    </div>
                ) : (
                    <div className="grammar-page-card">
                        <div className="grammar-detail-layout">
                            <section className="grammar-main-card">
                                <div className="grammar-header">
                                    <div>
                                        <h1>{grammar.pattern}</h1>

                                        <p>
                                            {getGrammarMeaning(grammar) ||
                                                "Chưa có nghĩa"}
                                        </p>
                                    </div>

                                    <button className="grammar-add-button">
                                        ＋
                                    </button>
                                </div>

                                {grammar.jlpt_level && (
                                    <div className="grammar-jlpt-badge">
                                        {grammar.jlpt_level}
                                    </div>
                                )}

                                {grammar.formation?.length > 0 && (
                                    <section className="grammar-section">
                                        <h2>Cấu trúc</h2>

                                        <div className="grammar-structure">
                                            {grammar.formation.map(
                                                (group, groupIndex) => (
                                                    <div key={groupIndex}>
                                                        <h3>
                                                            {group.label}
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
                                                                    className="grammar-formation-pattern"
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
                                        <section className="grammar-section">
                                            <h2>Nghĩa</h2>

                                            <p>
                                                {grammar.explanation_vi ||
                                                    grammar.explanation_en}
                                            </p>
                                        </section>
                                    )}

                                {grammar.nuance_vi && (
                                    <section className="grammar-section">
                                        <h2>Sắc thái</h2>
                                        <p>{grammar.nuance_vi}</p>
                                    </section>
                                )}

                                {grammar.examples?.length > 0 && (
                                    <section className="grammar-section">
                                        <h2>Ví dụ</h2>

                                        {grammar.examples.map(
                                            (example, index) => (
                                                <div
                                                    key={index}
                                                    className="grammar-example"
                                                >
                                                    <p className="grammar-example-jp">
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
                                                        <p className="grammar-example-vi">
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
                                    <section className="grammar-section">
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
                                    <section className="grammar-section">
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

                            <aside className="grammar-side-card">
                                <h3>Kết quả tra cứu ngữ pháp</h3>

                                {relatedGrammars.length === 0 ? (
                                    <p className="grammar-empty">
                                        Không có kết quả liên quan.
                                    </p>
                                ) : (
                                    <div className="grammar-result-list">
                                        {relatedGrammars.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={`/grammar/${item.id}?q=${encodeURIComponent(
                                                    keywordFromUrl ||
                                                    grammar.pattern
                                                )}`}
                                                className={
                                                    item.id === grammar.id
                                                        ? "grammar-result-item active"
                                                        : "grammar-result-item"
                                                }
                                            >
                                                {item.jlpt_level && (
                                                    <span className="grammar-result-level">
                                                        {item.jlpt_level}
                                                    </span>
                                                )}

                                                <strong>{item.pattern}</strong>

                                                <p>
                                                    {getGrammarMeaning(item) ||
                                                        "Chưa có nghĩa"}
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