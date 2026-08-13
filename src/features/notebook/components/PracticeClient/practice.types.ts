import type { EnrichedNotebookItem } from "@/domain/notebook/notebook.type"

export type PracticeMode = "flashcard" | "quiz" | "writing" | "minitest"

export type ModeProps = {
    items: EnrichedNotebookItem[]
    onFinish: (known: string[], unknown: string[], timeTaken?: number) => void
    onBack: () => void
}

export type SummaryData = {
    known: string[]
    unknown: string[]
    timeTaken?: number
}
