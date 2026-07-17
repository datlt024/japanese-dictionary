import { NextRequest, NextResponse } from "next/server"

import { recognizeHandwriting } from "@/server/services/handwriting/handwriting-recognition.service"
import { checkRateLimit, getClientIp } from "@/shared/utils/rate-limit"

import type {
    HandwritingRecognizeRequest,
} from "@/domain/handwriting/handwriting.type"

export async function POST(request: NextRequest) {
    const ip = getClientIp(request)
    const { ok, resetAt } = checkRateLimit(`hw:${ip}`, 20, 60_000)

    if (!ok) {
        return NextResponse.json(
            { candidates: [], error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
            {
                status: 429,
                headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
            }
        )
    }

    try {
        const body =
            (await request.json()) as HandwritingRecognizeRequest

        const result = await recognizeHandwriting(body)

        if (result.error) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result)
    } catch {
        return NextResponse.json(
            {
                candidates: [],
                error: "Không thể nhận diện chữ viết tay",
            },
            { status: 500 }
        )
    }
}