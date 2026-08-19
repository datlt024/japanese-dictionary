import { NextRequest, NextResponse } from "next/server"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"

export async function GET(request: NextRequest) {
    const rl = await rateLimit(`tts:${getClientIp(request)}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const { searchParams } = new URL(request.url)
    const text = searchParams.get("text")?.trim().slice(0, 200)

    if (!text) {
        return new NextResponse(null, { status: 400 })
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=ja`

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://translate.google.com/",
            },
        })

        if (!res.ok) {
            return new NextResponse(null, { status: 502 })
        }

        const buffer = await res.arrayBuffer()

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=604800, immutable",
            },
        })
    } catch {
        return new NextResponse(null, { status: 500 })
    }
}
