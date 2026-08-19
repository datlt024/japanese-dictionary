import "server-only"
import type {
    HandwritingRecognizeRequest,
    HandwritingRecognizeResult,
    HandwritingStroke,
} from "@/domain/handwriting/handwriting.type"

type Direction =
    | "horizontal"
    | "vertical"
    | "down-right"
    | "down-left"
    | "up-right"
    | "up-left"
    | "dot"
    | "unknown"

type StrokeFeature = {
    direction: Direction
    startX: number
    startY: number
    endX: number
    endY: number
    width: number
    height: number
}

type KanjiTemplate = {
    char: string
    strokeCount: number
    directions: Direction[]
}

const KANJI_TEMPLATES: KanjiTemplate[] = [
    {
        char: "大",
        strokeCount: 3,
        directions: ["horizontal", "down-left", "down-right"],
    },
    {
        char: "人",
        strokeCount: 2,
        directions: ["down-left", "down-right"],
    },
    {
        char: "入",
        strokeCount: 2,
        directions: ["down-right", "down-left"],
    },
    {
        char: "犬",
        strokeCount: 4,
        directions: ["horizontal", "down-left", "down-right", "dot"],
    },
    {
        char: "十",
        strokeCount: 2,
        directions: ["horizontal", "vertical"],
    },
    {
        char: "土",
        strokeCount: 3,
        directions: ["horizontal", "vertical", "horizontal"],
    },
    {
        char: "王",
        strokeCount: 4,
        directions: ["horizontal", "horizontal", "vertical", "horizontal"],
    },
    {
        char: "口",
        strokeCount: 3,
        directions: ["vertical", "horizontal", "horizontal"],
    },
    {
        char: "日",
        strokeCount: 4,
        directions: ["vertical", "horizontal", "horizontal", "horizontal"],
    },
]

function isValidStrokes(
    strokes: HandwritingRecognizeRequest["strokes"]
) {
    return (
        Array.isArray(strokes) &&
        strokes.length > 0 &&
        strokes.every(
            (stroke) =>
                Array.isArray(stroke) &&
                stroke.length > 0 &&
                stroke.every(
                    (point) =>
                        Number.isFinite(point.x) &&
                        Number.isFinite(point.y)
                )
        )
    )
}

function getStrokeFeature(stroke: HandwritingStroke): StrokeFeature {
    const first = stroke[0]
    const last = stroke[stroke.length - 1]

    const xs = stroke.map((point) => point.x)
    const ys = stroke.map((point) => point.y)

    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)

    const width = maxX - minX
    const height = maxY - minY

    const dx = last.x - first.x
    const dy = last.y - first.y

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    let direction: Direction = "unknown"

    if (width < 18 && height < 18) {
        direction = "dot"
    } else if (absDx > absDy * 1.8) {
        direction = "horizontal"
    } else if (absDy > absDx * 1.8) {
        direction = "vertical"
    } else if (dx > 0 && dy > 0) {
        direction = "down-right"
    } else if (dx < 0 && dy > 0) {
        direction = "down-left"
    } else if (dx > 0 && dy < 0) {
        direction = "up-right"
    } else if (dx < 0 && dy < 0) {
        direction = "up-left"
    }

    return {
        direction,
        startX: first.x,
        startY: first.y,
        endX: last.x,
        endY: last.y,
        width,
        height,
    }
}

function scoreDirection(
    actual: Direction,
    expected: Direction
) {
    if (actual === expected) {
        return 0
    }

    const compatiblePairs = new Set([
        "vertical:down-left",
        "vertical:down-right",
        "down-left:vertical",
        "down-right:vertical",
        "horizontal:dot",
        "dot:horizontal",
    ])

    if (compatiblePairs.has(`${actual}:${expected}`)) {
        return 0.35
    }

    return 1
}

function scoreTemplate(
    features: StrokeFeature[],
    template: KanjiTemplate
) {
    let score = 0

    score += Math.abs(features.length - template.strokeCount) * 2

    const count = Math.min(
        features.length,
        template.directions.length
    )

    for (let index = 0; index < count; index++) {
        score += scoreDirection(
            features[index].direction,
            template.directions[index]
        )
    }

    return score
}

export async function recognizeHandwriting(
    input: HandwritingRecognizeRequest
): Promise<HandwritingRecognizeResult> {
    if (!isValidStrokes(input.strokes)) {
        return {
            candidates: [],
            error: "Invalid strokes",
        }
    }

    const features = input.strokes.map(getStrokeFeature)

    const candidates = KANJI_TEMPLATES.map((template) => ({
        char: template.char,
        score: scoreTemplate(features, template),
    }))
        .sort((a, b) => a.score - b.score)
        .map((item) => item.char)
        .slice(0, 8)

    return {
        candidates,
        error: null,
    }
}