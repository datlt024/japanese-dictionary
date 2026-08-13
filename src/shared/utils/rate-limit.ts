import { NextResponse } from "next/server"

type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

// Periodically clean up expired entries to avoid memory leak
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now()
        for (const [key, entry] of store) {
            if (entry.resetAt < now) store.delete(key)
        }
    }, 60_000)
}

export function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): { ok: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || entry.resetAt < now) {
        const resetAt = now + windowMs
        store.set(key, { count: 1, resetAt })
        return { ok: true, remaining: limit - 1, resetAt }
    }

    entry.count++
    const remaining = Math.max(0, limit - entry.count)
    return { ok: entry.count <= limit, remaining, resetAt: entry.resetAt }
}

export function getClientIp(request: Request): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "unknown"
    )
}

/** Convenience wrapper — returns a ready-made 429 response when rate exceeded. */
export function rateLimit(
    key: string,
    limit: number,
    windowMs: number
): { ok: true } | { ok: false; response: NextResponse } {
    const result = checkRateLimit(key, limit, windowMs)
    if (result.ok) return { ok: true }
    return {
        ok: false,
        response: NextResponse.json(
            { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
                    "X-RateLimit-Limit": String(limit),
                    "X-RateLimit-Remaining": String(result.remaining),
                },
            }
        ),
    }
}
