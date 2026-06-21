import dotenv from "dotenv"
import fs from "fs"
import path from "path"

import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

type JmdictSense = {
    gloss?: {
        text?: string
    }[]
}

type JmdictKana = {
    text: string
    common?: boolean
}

type JmdictKanji = {
    text: string
    common?: boolean
}

type JmdictEntry = {
    id?: string | number
    kanji?: JmdictKanji[]
    kana?: JmdictKana[]
    sense?: JmdictSense[]
}

type VocabularyRow = {
    id: number
    primary_word: string | null
    primary_kana: string | null
}

type CollocationCandidate = {
    vocabulary_id: number
    expression_jp: string
    reading: string | null
    meaning_vi: string | null
    meaning_en: string | null
    source: string
    confidence: number
    collocation_type:
    | "fixed_expression"
    | "special_particle"
    | "idiom"
    | "set_phrase"
}

const JM_DICT_PATH = path.join(
    process.cwd(),
    "data-import",
    "jmdict-eng-3.6.2.json"
)

const PARTICLES = ["を", "が", "に", "と"]

const COMMON_FIXED_VERBS = [
    "叶える",
    "守る",
    "取る",
    "引く",
    "付ける",
    "つける",
    "入る",
    "立つ",
    "出す",
    "貸す",
    "運ぶ",
    "覚める",
    "掛ける",
    "かける",
    "なる",
    "する",
    "持つ",
    "向かう",
    "込む",
    "受ける",
    "浴びる",
    "負う",
    "果たす",
    "尽くす",
    "抱く",
    "込める",
]

const SPECIAL_PARTICLE_PATTERNS = [
    "に入る",
    "にする",
    "に立つ",
    "になる",
    "に向かう",
    "とする",
    "となる",
    "が立つ",
    "が出る",
    "を込める",
    "を果たす",
    "を負う",
    "を浴びる",
    "を尽くす",
]

function normalizeText(value: string) {
    return value.trim()
}

function hasParticleExpression(text: string) {
    return PARTICLES.some((particle) => text.includes(particle))
}

function isReasonableLength(text: string) {
    return text.length >= 3 && text.length <= 12
}

function hasCommonFixedVerb(text: string) {
    return COMMON_FIXED_VERBS.some((verb) => text.endsWith(verb))
}

function getFirstGloss(entry: JmdictEntry) {
    return (
        entry.sense
            ?.flatMap((sense) => sense.gloss || [])
            .map((gloss) => gloss.text?.trim())
            .find((text): text is string => Boolean(text)) || null
    )
}

function getCollocationType(
    text: string
): CollocationCandidate["collocation_type"] {
    if (
        SPECIAL_PARTICLE_PATTERNS.some((pattern) =>
            text.includes(pattern)
        )
    ) {
        return "special_particle"
    }

    if (
        text.includes("気") ||
        text.includes("頭") ||
        text.includes("腹") ||
        text.includes("顔") ||
        text.includes("手") ||
        text.includes("足") ||
        text.includes("目") ||
        text.includes("耳") ||
        text.includes("口")
    ) {
        return "idiom"
    }

    if (hasCommonFixedVerb(text)) {
        return "set_phrase"
    }

    return "fixed_expression"
}

function getConfidence(text: string) {
    let score = 70

    if (
        SPECIAL_PARTICLE_PATTERNS.some((pattern) =>
            text.includes(pattern)
        )
    ) {
        score += 15
    }

    if (hasCommonFixedVerb(text)) {
        score += 10
    }

    if (
        text.includes("気") ||
        text.includes("頭") ||
        text.includes("腹") ||
        text.includes("顔") ||
        text.includes("手") ||
        text.includes("足") ||
        text.includes("目") ||
        text.includes("耳") ||
        text.includes("口")
    ) {
        score += 10
    }

    return Math.min(score, 100)
}

function getExpression(entry: JmdictEntry) {
    const commonKanji =
        entry.kanji?.find((item) => item.common)?.text

    const firstKanji = entry.kanji?.[0]?.text

    const firstKana = entry.kana?.[0]?.text

    return commonKanji || firstKanji || firstKana || null
}

function getReading(entry: JmdictEntry) {
    return entry.kana?.[0]?.text || null
}

function getHeadwordFromExpression(expression: string) {
    const particleIndex = PARTICLES
        .map((particle) => expression.indexOf(particle))
        .filter((index) => index > 0)
        .sort((a, b) => a - b)[0]

    if (!particleIndex) {
        return null
    }

    return expression.slice(0, particleIndex)
}

async function fetchVocabularyMap() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
        )
    }

    const supabase = createClient(url, serviceRoleKey)

    const rows: VocabularyRow[] = []
    const pageSize = 1000
    let from = 0

    while (true) {
        const { data, error } = await supabase
            .from("vocabularies")
            .select("id, primary_word, primary_kana")
            .range(from, from + pageSize - 1)

        if (error) {
            throw error
        }

        if (!data || data.length === 0) {
            break
        }

        rows.push(...(data as VocabularyRow[]))

        if (data.length < pageSize) {
            break
        }

        from += pageSize
    }

    const map = new Map<string, number>()

    for (const row of rows) {
        if (row.primary_word) {
            map.set(row.primary_word, row.id)
        }

        if (row.primary_kana) {
            map.set(row.primary_kana, row.id)
        }
    }

    return {
        supabase,
        vocabularyMap: map,
    }
}

function buildCandidates(
    entries: JmdictEntry[],
    vocabularyMap: Map<string, number>
) {
    const candidates = new Map<string, CollocationCandidate>()

    for (const entry of entries) {
        const expression = getExpression(entry)

        if (!expression) {
            continue
        }

        const normalizedExpression = normalizeText(expression)

        if (
            !hasParticleExpression(normalizedExpression) ||
            !isReasonableLength(normalizedExpression)
        ) {
            continue
        }

        if (!hasCommonFixedVerb(normalizedExpression)) {
            continue
        }

        const headword =
            getHeadwordFromExpression(normalizedExpression)

        if (!headword) {
            continue
        }

        const vocabularyId = vocabularyMap.get(headword)

        if (!vocabularyId) {
            continue
        }

        const key = `${vocabularyId}:${normalizedExpression}`

        if (candidates.has(key)) {
            continue
        }

        candidates.set(key, {
            vocabulary_id: vocabularyId,
            expression_jp: normalizedExpression,
            reading: getReading(entry),
            meaning_vi: null,
            meaning_en: getFirstGloss(entry),
            source: "jmdict",
            confidence: getConfidence(normalizedExpression),
            collocation_type: getCollocationType(
                normalizedExpression
            ),
        })
    }

    return Array.from(candidates.values())
}

async function main() {
    const raw = fs.readFileSync(JM_DICT_PATH, "utf8")
    const json = JSON.parse(raw)

    const entries: JmdictEntry[] = Array.isArray(json)
        ? json
        : json.words || json.entries || []

    console.log("JMdict entries:", entries.length)

    const { supabase, vocabularyMap } =
        await fetchVocabularyMap()

    console.log("Vocabulary map:", vocabularyMap.size)

    const candidates = buildCandidates(entries, vocabularyMap)

    console.log("Collocation candidates:", candidates.length)
    console.log(candidates.slice(0, 20))

    const batchSize = 500

    for (let i = 0; i < candidates.length; i += batchSize) {
        const batch = candidates.slice(i, i + batchSize)

        const { error } = await supabase
            .from("vocabulary_collocations")
            .upsert(batch, {
                onConflict:
                    "vocabulary_id,expression_jp",
            })

        if (error) {
            throw error
        }

        console.log(
            `Inserted ${Math.min(
                i + batchSize,
                candidates.length
            )}/${candidates.length}`
        )
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})