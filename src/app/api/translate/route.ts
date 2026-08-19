import { unstable_cache } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"

const ALLOWED_LANGS = new Set(["ja", "vi", "en", "zh", "ko", "fr", "de", "es", "th", "id"])

const cachedTranslate = unstable_cache(
    async (text: string, sl: string, tl: string): Promise<string | null> => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`
        try {
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
            })
            if (!res.ok) return null
            const data = await res.json()
            return (data[0] as [string][])?.map((item) => item[0]).filter(Boolean).join("") || ""
        } catch {
            return null
        }
    },
    ["google-translate"],
    { revalidate: 86400 }
)

export async function GET(request: NextRequest) {
    const rl = rateLimit(`translate:${getClientIp(request)}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const { searchParams } = new URL(request.url)
    const text = searchParams.get("text")?.trim().slice(0, 500)
    const slRaw = searchParams.get("sl") ?? "ja"
    const tlRaw = searchParams.get("tl") ?? "vi"
    const sl = ALLOWED_LANGS.has(slRaw) ? slRaw : "ja"
    const tl = ALLOWED_LANGS.has(tlRaw) ? tlRaw : "vi"

    if (!text) return new NextResponse(null, { status: 400 })

    const translation = await cachedTranslate(text, sl, tl)

    if (translation === null) return new NextResponse(null, { status: 502 })

    return NextResponse.json(
        { translation, source: sl, target: tl },
        { headers: { "Cache-Control": "public, max-age=86400" } }
    )
}
