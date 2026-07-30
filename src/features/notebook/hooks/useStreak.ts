"use client"

import { startTransition, useEffect, useState } from "react"

export const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

export type StreakData = {
    count: number
    lastDate: string
    activeDays: number[]
}

const EMPTY: StreakData = { count: 0, lastDate: "", activeDays: [] }

function isoWeekdayIndex(date: Date): number {
    return (date.getDay() + 6) % 7
}

function toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10)
}

function loadStreak(): StreakData {
    try {
        const raw = localStorage.getItem("yomi_streak") ?? localStorage.getItem("mazii_streak")
        if (raw) return JSON.parse(raw) as StreakData
    } catch {}
    return { ...EMPTY }
}

function saveStreak(data: StreakData) {
    try {
        localStorage.setItem("yomi_streak", JSON.stringify(data))
        localStorage.removeItem("mazii_streak")
    } catch {}
}

function updateStreak(prev: StreakData): StreakData {
    const today = new Date()
    const todayKey = toDateKey(today)

    if (prev.lastDate === todayKey) return prev

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = toDateKey(yesterday)

    const todayWeekday = isoWeekdayIndex(today)
    const prevDate = prev.lastDate ? new Date(prev.lastDate) : null
    const prevWeekday = prevDate ? isoWeekdayIndex(prevDate) : -1

    let activeDays = [...prev.activeDays]
    if (!prevDate || (todayWeekday <= prevWeekday && todayKey !== prev.lastDate)) {
        activeDays = []
    }
    if (!activeDays.includes(todayWeekday)) activeDays.push(todayWeekday)

    const count = prev.lastDate === yesterdayKey ? prev.count + 1 : 1

    return { count, lastDate: todayKey, activeDays }
}

async function syncStreakToDb(data: StreakData) {
    try {
        await fetch("/api/profile/streak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                streak_count: data.count,
                streak_last_date: data.lastDate || null,
                streak_active_days: data.activeDays,
            }),
        })
    } catch {
        // fire-and-forget
    }
}

// userId: string khi đã đăng nhập, null khi chưa
export function useStreak(userId: string | null): StreakData {
    const [streak, setStreak] = useState<StreakData>(EMPTY)

    useEffect(() => {
        if (!userId) return
        const prev = loadStreak()
        const next = updateStreak(prev)
        saveStreak(next)
        startTransition(() => setStreak(next))

        // Sync lên DB nếu streak thay đổi hôm nay
        if (next.lastDate !== prev.lastDate || next.count !== prev.count) {
            syncStreakToDb(next)
        }
    }, [userId])

    return streak
}
