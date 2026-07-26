import { NextRequest, NextResponse } from "next/server"

import { getJlptStudyBatch, isValidJlptLevel, shuffleItems } from "@/server/services/study/jlpt-study.service"

export async function GET(request: NextRequest) {
    const level = request.nextUrl.searchParams.get("level") ?? ""
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? "50"), 100)

    if (!isValidJlptLevel(level)) {
        return NextResponse.json({ error: "Cấp độ không hợp lệ" }, { status: 400 })
    }

    const items = shuffleItems(await getJlptStudyBatch(level, limit))
    return NextResponse.json(items)
}
