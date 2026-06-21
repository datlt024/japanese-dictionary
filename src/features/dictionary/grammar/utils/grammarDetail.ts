import type { GrammarPoint } from "@/domain/grammar"

export function hasItems<T>(items: T[] | null | undefined) {
    return Array.isArray(items) && items.length > 0
}

export function splitMeaning(value: string | null | undefined) {
    if (!value) return []

    return value
        .split(/[;；]/)
        .map((item) => item.trim())
        .filter(Boolean)
}

export function getShortMeaning(grammar: GrammarPoint) {
    return (
        grammar.short_meaning_vi ||
        grammar.meaning_vi ||
        grammar.meaning_en ||
        "Chưa có nghĩa"
    )
}

export function getMainMeaning(grammar: GrammarPoint) {
    return grammar.meaning_vi || grammar.meaning_en || grammar.short_meaning_vi
}

export function getExplanation(grammar: GrammarPoint) {
    return grammar.explanation_vi || grammar.explanation_en || null
}

export function isTeShimau(grammar: GrammarPoint) {
    return grammar.pattern.includes("てしまう")
}