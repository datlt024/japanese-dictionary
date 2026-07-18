"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen } from "lucide-react"

import { useNotebookItems } from "@/features/notebook/hooks/useNotebookItems"

import type { PracticeMode, SummaryData } from "./practice.types"
import { toValidMode } from "./practice.utils"
import FlashCardMode from "./FlashCardMode"
import QuizMode from "./QuizMode"
import WritingMode from "./WritingMode"
import MiniTestMode from "./MiniTestMode"
import Summary from "./Summary"
import styles from "./PracticeClient.module.css"

type Props = { notebookId: string; initialMode?: string }

export default function PracticeClient({ notebookId, initialMode }: Props) {
    const router = useRouter()
    const { items, loading } = useNotebookItems(notebookId)
    const [phase, setPhase] = useState<"practice" | "summary">("practice")
    const [mode] = useState<PracticeMode>(toValidMode(initialMode) ?? "flashcard")
    const [summary, setSummary] = useState<SummaryData>({ known: [], unknown: [] })

    function finishPractice(known: string[], unknown: string[], timeTaken?: number) {
        setSummary({ known, unknown, timeTaken })
        setPhase("summary")
    }

    if (loading) return <div className={styles.centered}>Đang tải...</div>

    if (items.length === 0) {
        return (
            <div className={styles.centered}>
                <div className={styles.emptyState}>
                    <BookOpen size={40} className={styles.emptyIcon} />
                    <p>Sổ tay này chưa có mục nào để luyện tập.</p>
                    <Link href="/notebooks" className={styles.backLink}>
                        <ArrowLeft size={15} />
                        Quay lại sổ tay
                    </Link>
                </div>
            </div>
        )
    }

    if (phase === "summary") {
        return (
            <Summary
                items={items}
                summary={summary}
                mode={mode}
                notebookId={notebookId}
                onRestart={() => setPhase("practice")}
                onChangeMode={() => router.push("/notebooks")}
            />
        )
    }

    const modeProps = {
        items,
        onFinish: finishPractice,
        onBack: () => router.push("/notebooks"),
    }

    if (mode === "flashcard") return <FlashCardMode {...modeProps} notebookId={notebookId} />
    if (mode === "quiz") return <QuizMode {...modeProps} />
    if (mode === "writing") return <WritingMode {...modeProps} />
    if (mode === "minitest") return <MiniTestMode {...modeProps} />
    return null
}
