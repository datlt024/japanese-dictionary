import type { EnrichedNotebookItem, ExploreSection } from "@/domain/notebook/notebook.type"
import { Briefcase, BookOpen, Layers, Zap, Flame, CheckCircle2 } from "lucide-react"

// ── API fetchers ──────────────────────────────────

export async function fetchExploreSections(): Promise<ExploreSection[]> {
    const res = await fetch("/api/explore/notebooks")
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

export async function fetchPublicItems(notebookId: string): Promise<EnrichedNotebookItem[]> {
    const res = await fetch(`/api/explore/notebooks/${notebookId}/items`)
    if (!res.ok) throw new Error("fetch failed")
    return res.json()
}

// ── LocalStorage helpers ──────────────────────────

const LIKED_KEY          = "yomi_explore_liked"
const LIKED_SECTIONS_KEY = "yomi_explore_liked_sections"
const VIEWED_KEY         = "yomi_explore_viewed"

export function loadLiked(): Set<string> {
    try {
        const v = localStorage.getItem(LIKED_KEY)
        return new Set(v ? (JSON.parse(v) as string[]) : [])
    } catch { return new Set() }
}

export function saveLiked(ids: Set<string>) {
    try { localStorage.setItem(LIKED_KEY, JSON.stringify([...ids])) } catch {}
}

export function loadLikedSections(): Set<string> {
    try {
        const v = localStorage.getItem(LIKED_SECTIONS_KEY)
        return new Set(v ? (JSON.parse(v) as string[]) : [])
    } catch { return new Set() }
}

export function saveLikedSections(ids: Set<string>) {
    try { localStorage.setItem(LIKED_SECTIONS_KEY, JSON.stringify([...ids])) } catch {}
}

export function loadViewed(): string[] {
    try {
        const v = localStorage.getItem(VIEWED_KEY)
        return v ? (JSON.parse(v) as string[]) : []
    } catch { return [] }
}

export function saveViewed(ids: string[]) {
    try { localStorage.setItem(VIEWED_KEY, JSON.stringify(ids)) } catch {}
}

// ── Card colors / icons (uses design tokens) ──────

export const CARD_COLORS = [
    { bg: "var(--color-jlpt-n3-soft)", text: "var(--color-jlpt-n3)" },
    { bg: "var(--color-success-soft)",  text: "var(--color-success)"  },
    { bg: "var(--color-warning-soft)",  text: "var(--color-warning)"  },
    { bg: "var(--color-primary-soft)",  text: "var(--color-primary)"  },
    { bg: "var(--color-danger-soft)",   text: "var(--color-danger)"   },
    { bg: "var(--color-jlpt-n2-soft)", text: "var(--color-jlpt-n2)" },
]

export const CARD_ICONS = [Briefcase, BookOpen, Layers, Zap, Flame, CheckCircle2]

// ── Types ─────────────────────────────────────────

export type SubTab  = "explore" | "favorites" | "history"
export type ViewMode = "list" | "grid"
