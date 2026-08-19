import "server-only"
import { NextResponse } from "next/server"
import { logger } from "@/server/utils/logger"

export function serverError(error: unknown, context: string): NextResponse {
    const message = error instanceof Error ? error.message : String(error)
    logger.error("api", context, { message })
    return NextResponse.json(
        { error: "Lỗi máy chủ. Vui lòng thử lại." },
        { status: 500 }
    )
}
