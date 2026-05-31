"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"

import "@/styles/grammar-detail.css"

import AppLayout from "@/components/layout/AppLayout"

import {
    getGrammarPointById,
    searchGrammarPoints,
    GrammarPoint,
} from "@/features/grammar/services/grammar.service"

function getGrammarMeaning(grammar: GrammarPoint) {
    return grammar.meaning_vi || grammar.meaning_en || ""
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

    const [loading, setLoading] =
        useState(true)

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

                                {grammar.structure && (
                                    <section className="grammar-section">
                                        <h2>Cấu trúc</h2>
                                        <div className="grammar-structure">
                                            {grammar.structure}
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

                                {grammar.example_jp && (
                                    <section className="grammar-section">
                                        <h2>Ví dụ</h2>

                                        <div className="grammar-example">
                                            <p className="grammar-example-jp">
                                                {grammar.example_jp}
                                            </p>

                                            {grammar.example_vi && (
                                                <p className="grammar-example-vi">
                                                    {grammar.example_vi}
                                                </p>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {grammar.source && (
                                    <section className="grammar-section">
                                        <h2>Nguồn</h2>
                                        <p>{grammar.source}</p>
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