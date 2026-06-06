export type HandwritingPoint = {
    x: number
    y: number
}

export type HandwritingStroke = HandwritingPoint[]

export type HandwritingRecognizeRequest = {
    strokes: HandwritingStroke[]
}

export type HandwritingRecognizeResult = {
    candidates: string[]
    error: string | null
}