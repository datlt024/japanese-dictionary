import type { PracticeMode } from "./practice.types"

export type Rating = "forget" | "hard" | "normal" | "easy"

export const RATINGS = [
    {
        id: "forget" as Rating,
        label: "Không nhớ",
        sublabel: "Ôn lại ngay",
        emoji: "😟",
        color: "#ef4444",
        bg: "#fef2f2",
        border: "#fca5a5",
    },
    {
        id: "hard" as Rating,
        label: "Khó nhớ",
        sublabel: "Ôn lại sau",
        emoji: "😕",
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fcd34d",
    },
    {
        id: "normal" as Rating,
        label: "Bình thường",
        sublabel: "Ôn lại sau 3 ngày",
        emoji: "😊",
        color: "#16a34a",
        bg: "#f0fdf4",
        border: "#86efac",
    },
    {
        id: "easy" as Rating,
        label: "Dễ nhớ",
        sublabel: "Ôn lại sau 7 ngày",
        emoji: "😄",
        color: "#2563eb",
        bg: "#eff6ff",
        border: "#93c5fd",
    },
] as const

export const RATING_MAP = Object.fromEntries(RATINGS.map((r) => [r.id, r])) as Record<
    Rating,
    (typeof RATINGS)[number]
>

export const MODE_LABEL: Record<PracticeMode, string> = {
    flashcard: "FlashCard",
    quiz: "Trắc nghiệm",
    writing: "Luyện viết",
    minitest: "Mini Test",
}

export const MINI_TEST_TIME = 300
export const MINI_TEST_COUNT = 10
