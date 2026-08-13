import { NextResponse } from "next/server"

export function serverError(error: unknown, context: string): NextResponse {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[API] ${context}:`, message)
    return NextResponse.json(
        { error: "Lỗi máy chủ. Vui lòng thử lại." },
        { status: 500 }
    )
}
