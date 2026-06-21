import fs from "fs"
import path from "path"

type HanabiraExample = {
    jp?: string
    en?: string
}

type HanabiraGrammar = {
    title?: string
    short_explanation?: string
    long_explanation?: string
    formation?: string
    examples?: HanabiraExample[]
    p_tag?: string
    s_tag?: string
}

type GrammarSeed = {
    pattern: string
    reading: string | null
    jlpt_level: "N5" | "N4" | "N3" | "N2" | "N1" | null
    source: string
    source_title: string
    source_short_explanation: string | null
    source_long_explanation: string | null
    source_formation: string | null
    source_examples: {
        japanese: string
        translation_en: string | null
    }[]
}

const INPUT_FILES = [
    "grammar_ja_JLPT_N5_0001.json",
    "grammar_ja_JLPT_N4_0001.json",
    "grammar_ja_JLPT_N3_0001.json",
    "grammar_ja_JLPT_N2_0001.json",
    "grammar_ja_JLPT_N1_0001.json",
]

const inputDir = path.join(
    process.cwd(),
    "data/external/hanabira/backend/express/json_data"
)

const outputPath = path.join(
    process.cwd(),
    "data/generated/grammar-seeds.json"
)

const MANUAL_PATTERN_MAP: Record<string, string> = {
    "Aがいちばん": "いちばん",

    "AけれどもB": "けれども",
    "AしかしB": "しかし",

    "AじゃB": "じゃ",
    "AそれじゃB": "それじゃ",
    "AそれではB": "それでは",

    "AとBとどちら": "A と B と どちら",
    "AとBとどっち": "A と B と どっち",
}

function extractPattern(title: string) {
    let value = title
        .replace(/\(.+?\)/g, "")
        .replace(/[～〜]/g, "")
        .replace(/[。．、,.]/g, "")
        .replace(/\s+/g, "")
        .trim()

    if (MANUAL_PATTERN_MAP[value]) {
        return MANUAL_PATTERN_MAP[value]
    }

    return value
}

function extractReading(_title: string) {
    return null
}

function normalizePattern(pattern: string) {
    return pattern
        .replace(/[～〜]/g, "")
        .replace(/\s+/g, " ")
        .trim()
}

function toJlptLevel(value?: string): GrammarSeed["jlpt_level"] {
    if (!value) return null
    if (value.includes("N5")) return "N5"
    if (value.includes("N4")) return "N4"
    if (value.includes("N3")) return "N3"
    if (value.includes("N2")) return "N2"
    if (value.includes("N1")) return "N1"

    return null
}

function isBadPattern(pattern: string) {
    const blacklist = new Set([
        "",
        "何",
        "何曜日",
        "どこ",
        "いつ",
        "だれ",
        "誰",
        "どう",
        "いくら",
        "どのぐらい",
        "学生",
        "先生",
        "日本語",
    ])

    return blacklist.has(pattern)
}

const map = new Map<string, GrammarSeed>()

for (const file of INPUT_FILES) {
    const fullPath = path.join(inputDir, file)

    if (!fs.existsSync(fullPath)) {
        console.warn(`Missing: ${file}`)
        continue
    }

    const rows = JSON.parse(
        fs.readFileSync(fullPath, "utf8")
    ) as HanabiraGrammar[]

    for (const row of rows) {
        if (!row.title) continue

        const rawPattern = extractPattern(row.title)
        const pattern = normalizePattern(rawPattern)

        if (isBadPattern(pattern)) continue

        const item: GrammarSeed = {
            pattern,
            reading: extractReading(row.title),
            jlpt_level: toJlptLevel(row.p_tag),
            source: "hanabira",
            source_title: row.title,
            source_short_explanation: row.short_explanation ?? null,
            source_long_explanation: row.long_explanation ?? null,
            source_formation: row.formation ?? null,
            source_examples: Array.isArray(row.examples)
                ? row.examples
                    .filter((example) => example.jp)
                    .map((example) => ({
                        japanese: example.jp!,
                        translation_en: example.en ?? null,
                    }))
                : [],
        }

        if (!map.has(pattern)) {
            map.set(pattern, item)
            continue
        }

        const old = map.get(pattern)!

        if (!old.jlpt_level && item.jlpt_level) {
            old.jlpt_level = item.jlpt_level
        }
    }
}

const result = Array.from(map.values()).sort((a, b) => {
    const order = ["N5", "N4", "N3", "N2", "N1", null]

    return (
        order.indexOf(a.jlpt_level) -
        order.indexOf(b.jlpt_level)
    )
})

fs.mkdirSync(path.dirname(outputPath), {
    recursive: true,
})

fs.writeFileSync(
    outputPath,
    JSON.stringify(result, null, 2),
    "utf8"
)

console.log(`Done: ${result.length} grammar seeds`)
console.log(`Output: ${outputPath}`)
