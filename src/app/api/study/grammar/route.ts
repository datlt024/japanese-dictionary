import { NextRequest, NextResponse } from "next/server"
import { isValidJlptLevel, getJlptGrammarItems } from "@/server/services/study/jlpt-study.service"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"

export async function GET(req: NextRequest) {
    const rl = rateLimit(`grammar:${getClientIp(req)}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const params = new URL(req.url).searchParams
    const level = (params.get("level") ?? "N5").toUpperCase()
    const limit = Math.min(parseInt(params.get("limit") ?? "50", 10), 100)

    if (!isValidJlptLevel(level)) {
        return NextResponse.json({ error: "Cấp độ không hợp lệ" }, { status: 400 })
    }

    const items = await getJlptGrammarItems(level, 0, limit - 1)
    const shuffled = [...items].sort(() => Math.random() - 0.5)

    return NextResponse.json(shuffled.map(g => ({
        id: g.id,
        pattern: (g.display_pattern ?? g.pattern) as string,
        meaning: (g.short_meaning_vi || g.meaning_vi || null) as string | null,
    })), {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    })
}
