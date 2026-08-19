import { NextResponse } from "next/server"

/**
 * Rate limiting store — currently in-memory (process-local, not shared across serverless instances).
 *
 * To enable shared rate limiting in production, install Upstash:
 *   npm install @upstash/ratelimit @upstash/redis
 * Then set environment variables:
 *   UPSTASH_REDIS_REST_URL=...
 *   UPSTASH_REDIS_REST_TOKEN=...
 * And replace the in-memory store below with the Upstash Ratelimit client.
 * See: https://github.com/upstash/ratelimit
 */

type Entry = { count: number; resetAt: number }

// NOTE: process-local store — each serverless Lambda instance has its own Map;
// rate limits are not enforced across instances. For production-grade limiting,
// replace this with an external store such as Upstash Redis (see comment above).
const store = new Map<string, Entry>()

// Cleanup timer only runs in long-lived Node.js processes; setInterval
// callbacks never fire between serverless invocations (each is stateless).
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

    // Cap at limit + 1 to avoid integer overflow on sustained hammering
    entry.count = Math.min(entry.count + 1, limit + 1)
    const remaining = Math.max(0, limit - entry.count)
    return { ok: entry.count <= limit, remaining, resetAt: entry.resetAt }
}

export function getClientIp(request: Request): string {
    // x-real-ip is set by Vercel's edge network and cannot be spoofed by clients.
    // Fall back to the last x-forwarded-for entry (appended by the trusted proxy),
    // not the first entry which clients can freely prepend arbitrary IPs to.
    return (
        request.headers.get("x-real-ip") ??
        request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ??
        "unknown"
    )
}

/** Convenience wrapper — returns a ready-made 429 response when rate exceeded.
 *  Async to allow swapping the in-memory store for an external store (e.g. Upstash)
 *  without changing call sites. Callers must `await` this function.
 */
export async function rateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
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
