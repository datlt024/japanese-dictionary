import { NextRequest, NextResponse } from "next/server"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"

export async function GET(request: NextRequest) {
    const rl = rateLimit(`translate:${getClientIp(request)}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const { searchParams } = new URL(request.url)
    const text = searchParams.get("text")?.trim().slice(0, 500)
    const sl = searchParams.get("sl") || "ja"
    const tl = searchParams.get("tl") || "vi"

    if (!text) return new NextResponse(null, { status: 400 })

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        })

        if (!res.ok) return new NextResponse(null, { status: 502 })

        const data = await res.json()
        const translation = (data[0] as [string][])
            ?.map((item) => item[0])
            .filter(Boolean)
            .join("") || ""

        return NextResponse.json(
            { translation, source: sl, target: tl },
            { headers: { "Cache-Control": "public, max-age=86400" } }
        )
    } catch {
        return new NextResponse(null, { status: 500 })
    }
}
