import { NextRequest, NextResponse } from "next/server"

import { recognizeHandwriting } from "@/server/services/handwriting/handwriting-recognition.service"

import type {
    HandwritingRecognizeRequest,
} from "@/domain/handwriting/handwriting.type"

export async function POST(request: NextRequest) {
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