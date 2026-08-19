import { NextRequest, NextResponse } from "next/server"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"

const GEMINI_MODEL = "models/gemini-flash-lite-latest"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent`

function buildPrompt(text: string, sl: string, tl: string): string {
    if (sl === "ja" && tl === "vi") {
        return `Bạn là chuyên gia dịch thuật Nhật-Việt cho người Việt đang học tiếng Nhật.

Dịch văn bản tiếng Nhật sau sang tiếng Việt:
- Nếu là từ đơn hoặc cụm từ: dịch nghĩa chính xác, tự nhiên, có thể thêm ngữ cảnh ngắn trong ngoặc nếu cần
- Nếu là câu hoàn chỉnh hoặc đoạn văn: dịch nguyên văn, giữ ý nghĩa và giọng điệu gốc
- Chỉ trả về bản dịch tiếng Việt, không giải thích ngữ pháp

Văn bản: ${text}`
    }

    if (sl === "vi" && tl === "ja") {
        return `Bạn là chuyên gia dịch thuật Việt-Nhật.

Dịch văn bản tiếng Việt sau sang tiếng Nhật:
- Sử dụng chữ Hán (kanji) và kana phù hợp
- Giữ mức độ lịch sự trung bình (丁寧語) nếu không có chỉ định rõ ràng
- Nếu là câu hoàn chỉnh, dịch nguyên văn, giữ ý nghĩa gốc
- Chỉ trả về bản dịch tiếng Nhật, không giải thích thêm, không thêm romaji

Văn bản: ${text}`
    }

    // Generic fallback
    return `Translate the following text from ${sl} to ${tl}. Return only the translation.\n\nText: ${text}`
}

export async function POST(request: NextRequest) {
    const rl = rateLimit(`gemini:${getClientIp(request)}`, 10, 60_000)
    if (!rl.ok) return rl.response

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return new NextResponse(null, { status: 503 })

    const ALLOWED_LANGS = new Set(["ja", "vi", "en", "zh", "ko", "fr", "de", "es", "th", "id"])

    let text: string
    let sl: string
    let tl: string
    try {
        const body = await request.json()
        text = String(body.text ?? "").trim().slice(0, 1000)
        const slRaw = String(body.sl ?? "ja")
        const tlRaw = String(body.tl ?? "vi")
        sl = ALLOWED_LANGS.has(slRaw) ? slRaw : "ja"
        tl = ALLOWED_LANGS.has(tlRaw) ? tlRaw : "vi"
    } catch {
        return new NextResponse(null, { status: 400 })
    }

    if (!text) return new NextResponse(null, { status: 400 })

    // Try Gemini first, fall back to Google Translate on 429/error
    try {
        const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: buildPrompt(text, sl, tl) }] }],
                generationConfig: { temperature: 0.1 },
            }),
            signal: AbortSignal.timeout(10_000),
        })

        if (res.ok) {
            const data = await res.json()
            const translation: string =
                data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ""
            if (translation) return NextResponse.json({ translation, engine: "gemini" })
        }
        // Fall through to Google Translate fallback
    } catch {
        // Fall through to fallback
    }

    // Fallback: Google Translate unofficial API
    try {
        const gtUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`
        const gtRes = await fetch(gtUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(8_000),
        })
        if (!gtRes.ok) return new NextResponse(null, { status: 502 })
        const gtData = await gtRes.json()
        const translation = (gtData[0] as [string][])
            ?.map((item) => item[0])
            .filter(Boolean)
            .join("") || ""
        return NextResponse.json({ translation, engine: "google" })
    } catch {
        return new NextResponse(null, { status: 500 })
    }
}
