"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

import "@/styles/detail.css"

import {
    getGrammarPointById,
    GrammarPoint,
} from "@/features/grammar/services/grammar.service"

export default function GrammarDetailPage() {
    const params = useParams()
    const id = params.id as string

    const [grammar, setGrammar] = useState<GrammarPoint | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchGrammar() {
            try {
                const data = await getGrammarPointById(id)
                setGrammar(data)
            } catch (error) {
                console.error("Failed to fetch grammar:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchGrammar()
        }
    }, [id])

    if (loading) {
        return (
            <main className="detail-page">
                <div className="detail-card">
                    <p>Đang tải...</p>
                </div>
            </main>
        )
    }

    if (!grammar) {
        return (
            <main className="detail-page">
                <div className="detail-card">
                    <h1>Không tìm thấy ngữ pháp</h1>

                    <Link href="/" className="back-button">
                        ← Quay lại
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="detail-page">
            <Link href="/" className="back-button">
                ← Quay lại
            </Link>

            <div className="detail-card">
                <h1 className="detail-word">{grammar.pattern}</h1>

                {grammar.jlpt_level && (
                    <p className="detail-kana">{grammar.jlpt_level}</p>
                )}

                {grammar.meaning_vi && (
                    <section className="detail-section">
                        <h2>Nghĩa</h2>
                        <p>{grammar.meaning_vi}</p>
                    </section>
                )}

                {grammar.structure && (
                    <section className="detail-section">
                        <h2>Cấu trúc</h2>
                        <p>{grammar.structure}</p>
                    </section>
                )}

                {grammar.explanation_vi && (
                    <section className="detail-section">
                        <h2>Giải thích</h2>
                        <p>{grammar.explanation_vi}</p>
                    </section>
                )}

                {grammar.example_jp && (
                    <section className="detail-section">
                        <h2>Ví dụ</h2>
                        <p>{grammar.example_jp}</p>

                        {grammar.example_vi && <p>{grammar.example_vi}</p>}
                    </section>
                )}
            </div>
        </main>
    )
}