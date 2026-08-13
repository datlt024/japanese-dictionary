import type { EnrichedNotebookItem } from "@/domain/notebook/notebook.type"
import type { PracticeMode } from "./practice.types"

const VALID_MODES = new Set<string>(["flashcard", "quiz", "writing", "minitest"])

export function toValidMode(m?: string): PracticeMode | undefined {
    return m && VALID_MODES.has(m) ? (m as PracticeMode) : undefined
}

export function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
}

export function getAnswerText(item: EnrichedNotebookItem): string {
    return item.display.meaning ?? item.display.subtitle ?? item.display.title
}
