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

// ── LocalStorage helpers (namespaced by userId to isolate per-account data) ──

function likedKey(userId: string | undefined)         { return userId ? `yomi_explore_liked:${userId}` : "yomi_explore_liked:guest" }
function likedSectionsKey(userId: string | undefined) { return userId ? `yomi_explore_liked_sections:${userId}` : "yomi_explore_liked_sections:guest" }
function viewedKey(userId: string | undefined)        { return userId ? `yomi_explore_viewed:${userId}` : "yomi_explore_viewed:guest" }

export function loadLiked(userId: string | undefined): Set<string> {
    try {
        const v = localStorage.getItem(likedKey(userId))
        return new Set(v ? (JSON.parse(v) as string[]) : [])
    } catch { return new Set() }
}

export function saveLiked(ids: Set<string>, userId: string | undefined) {
    try { localStorage.setItem(likedKey(userId), JSON.stringify([...ids])) } catch {}
}

export function loadLikedSections(userId: string | undefined): Set<string> {
    try {
        const v = localStorage.getItem(likedSectionsKey(userId))
        return new Set(v ? (JSON.parse(v) as string[]) : [])
    } catch { return new Set() }
}

export function saveLikedSections(ids: Set<string>, userId: string | undefined) {
    try { localStorage.setItem(likedSectionsKey(userId), JSON.stringify([...ids])) } catch {}
}

export function loadViewed(userId: string | undefined): string[] {
    try {
        const v = localStorage.getItem(viewedKey(userId))
        return v ? (JSON.parse(v) as string[]) : []
    } catch { return [] }
}

export function saveViewed(ids: string[], userId: string | undefined) {
    try { localStorage.setItem(viewedKey(userId), JSON.stringify(ids)) } catch {}
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
