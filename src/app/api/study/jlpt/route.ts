import { NextRequest, NextResponse } from "next/server"

import { getJlptStudyBatch, isValidJlptLevel, shuffleItems } from "@/server/services/study/jlpt-study.service"
import { getClientIp, rateLimit } from "@/shared/utils/rate-limit"

export async function GET(request: NextRequest) {
    const rl = await rateLimit(`jlpt:${getClientIp(request)}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const level = request.nextUrl.searchParams.get("level") ?? ""
    const limitRaw = parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10)
    const limit = Math.min(Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 50, 100)

    if (!isValidJlptLevel(level)) {
        return NextResponse.json({ error: "Cấp độ không hợp lệ" }, { status: 400 })
    }

    const items = shuffleItems(await getJlptStudyBatch(level, limit))
    return NextResponse.json(items)
}
