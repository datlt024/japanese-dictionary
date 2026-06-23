import dotenv from "dotenv"
import fs from "node:fs"
import path from "node:path"

import { createClient } from "@supabase/supabase-js"
import { XMLParser } from "fast-xml-parser"

import type { Database } from "../../src/shared/types/database.generated"

import { RADICALS } from "./radicals"

dotenv.config({
    path: ".env.local",
})

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env")
}

const supabase = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)

const DATA_DIR = path.join(process.cwd(), "data/kanji-extra")

const UNIHAN_READINGS_PATH = path.join(
    DATA_DIR,
    "Unihan_Readings.txt"
)

const UNIHAN_VARIANTS_PATH = path.join(
    DATA_DIR,
    "Unihan_Variants.txt"
)

const KANJIDIC2_PATH = path.join(DATA_DIR, "kanjidic2.xml")
const OPENCC_ST_PATH = path.join(DATA_DIR, "STCharacters.txt")

const SHINJITAI_MAP_PATH = path.join(
    DATA_DIR,
    "shinjitai-map.json"
)

const HAN_VIET_OVERRIDE_PATH = path.join(
    DATA_DIR,
    "han-viet-override.json"
)

type KanjiRow = {
    kanji: string
    han_viet: string | null
    radical: string | null
    radical_number: number | null
    radical_name_vi: string | null
    radical_name_ja: string | null
}

type RadicalInfo = {
    radicalNumber: number
    radical: string
    radicalNameVi: string
    radicalNameJa: string
}

function codePointToChar(code: string) {
    const hex = code.replace("U+", "").replace(/^k[A-Z]+:/, "")
    return String.fromCodePoint(parseInt(hex, 16))
}

function normalizeHanViet(value: string) {
    return value
        .split(/\s+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.toUpperCase())
        .join("; ")
}

function parseJsonMap(filePath: string) {
    const map = new Map<string, string>()

    if (!fs.existsSync(filePath)) {
        return map
    }

    const content = fs.readFileSync(filePath, "utf8")
    const json = JSON.parse(content) as Record<string, string>

    for (const [key, value] of Object.entries(json)) {
        if (key.length === 1 && typeof value === "string" && value.trim()) {
            map.set(key, value.trim())
        }
    }

    return map
}

function parseHanVietOverride() {
    const rawMap = parseJsonMap(HAN_VIET_OVERRIDE_PATH)
    const map = new Map<string, string>()

    for (const [kanji, hanViet] of rawMap.entries()) {
        map.set(kanji, normalizeHanViet(hanViet))
    }

    return map
}

function parseShinjitaiMap() {
    return parseJsonMap(SHINJITAI_MAP_PATH)
}

function parseUnihanVietnamese() {
    const content = fs.readFileSync(UNIHAN_READINGS_PATH, "utf8")
    const map = new Map<string, string>()

    for (const line of content.split(/\r?\n/)) {
        if (!line || line.startsWith("#")) continue

        const [code, field, value] = line.split(/\t/)

        if (field !== "kVietnamese" || !value) continue

        const kanji = codePointToChar(code)
        map.set(kanji, normalizeHanViet(value))
    }

    return map
}

function parseUnihanTraditionalVariants() {
    const map = new Map<string, string>()

    if (!fs.existsSync(UNIHAN_VARIANTS_PATH)) {
        console.warn(
            `Missing ${UNIHAN_VARIANTS_PATH}. Fallback Unihan variants will be skipped.`
        )
        return map
    }

    const content = fs.readFileSync(UNIHAN_VARIANTS_PATH, "utf8")

    for (const line of content.split(/\r?\n/)) {
        if (!line || line.startsWith("#")) continue

        const [code, field, value] = line.split(/\t/)

        if (field !== "kTraditionalVariant" || !value) continue

        const sourceKanji = codePointToChar(code)
        const firstVariant = value.split(/\s+/)[0]

        if (!firstVariant) continue

        const normalizedVariant = firstVariant.replace(/<.*$/, "")
        const traditionalKanji = codePointToChar(normalizedVariant)

        if (sourceKanji.length === 1 && traditionalKanji.length === 1) {
            map.set(sourceKanji, traditionalKanji)
        }
    }

    return map
}

function parseOpenCcSimpleToTraditional() {
    const map = new Map<string, string>()

    if (!fs.existsSync(OPENCC_ST_PATH)) {
        console.warn(
            `Missing ${OPENCC_ST_PATH}. Fallback simple→traditional will be skipped.`
        )
        return map
    }

    const content = fs.readFileSync(OPENCC_ST_PATH, "utf8")

    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim()

        if (!trimmed || trimmed.startsWith("#")) continue

        const [simple, traditionalValue] = trimmed.split(/\s+/)

        if (!simple || !traditionalValue) continue

        const traditional = traditionalValue.split("|")[0]

        if (simple.length === 1 && traditional.length === 1) {
            map.set(simple, traditional)
        }
    }

    return map
}

function toArray<T>(value: T | T[] | undefined): T[] {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
}

type KanjidicRadValue = string | { "@_rad_type"?: string; "#text"?: string }

type KanjidicCharacterXml = {
    radical?: { rad_value?: KanjidicRadValue | KanjidicRadValue[] }
}

function getClassicalRadicalNumber(character: KanjidicCharacterXml) {
    const radicalValues = character?.radical?.rad_value
    const values = toArray(radicalValues)

    const classical = values.find((item) => {
        return typeof item !== "string" && item?.["@_rad_type"] === "classical"
    })

    if (!classical) return null

    const value =
        typeof classical === "string"
            ? classical
            : classical["#text"]

    const number = Number(value)

    return Number.isFinite(number) ? number : null
}

function parseKanjidicRadicals() {
    const xml = fs.readFileSync(KANJIDIC2_PATH, "utf8")

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text",
    })

    const data = parser.parse(xml)
    const characters = toArray(data?.kanjidic2?.character)

    const map = new Map<string, RadicalInfo>()

    for (const character of characters) {
        const kanji = character.literal
        const radicalNumber = getClassicalRadicalNumber(character)

        if (!kanji || !radicalNumber) continue

        const radical = RADICALS[radicalNumber]

        if (!radical) continue

        map.set(kanji, {
            radicalNumber,
            radical: radical.radical,
            radicalNameVi: radical.nameVi,
            radicalNameJa: radical.nameJa,
        })
    }

    return map
}

async function fetchExistingKanjis() {
    const rows: KanjiRow[] = []
    const pageSize = 1000

    for (let from = 0; ; from += pageSize) {
        const to = from + pageSize - 1

        const { data, error } = await supabase
            .from("kanjis")
            .select(
                [
                    "kanji",
                    "han_viet",
                    "radical",
                    "radical_number",
                    "radical_name_vi",
                    "radical_name_ja",
                ].join(", ")
            )
            .order("id", { ascending: true })
            .range(from, to)

        if (error) throw error

        const rawRows = (data ?? []) as unknown as Array<
            Record<string, unknown>
        >

        const pageRows: KanjiRow[] = rawRows.map((row) => ({
            kanji: String(row.kanji),
            han_viet:
                typeof row.han_viet === "string"
                    ? row.han_viet
                    : null,
            radical:
                typeof row.radical === "string"
                    ? row.radical
                    : null,
            radical_number:
                typeof row.radical_number === "number"
                    ? row.radical_number
                    : null,
            radical_name_vi:
                typeof row.radical_name_vi === "string"
                    ? row.radical_name_vi
                    : null,
            radical_name_ja:
                typeof row.radical_name_ja === "string"
                    ? row.radical_name_ja
                    : null,
        }))

        rows.push(...pageRows)

        if (pageRows.length < pageSize) break
    }

    return rows
}

function findHanVietByMappedKanji(
    sourceKanji: string,
    map: Map<string, string>,
    hanVietMap: Map<string, string>
) {
    const mappedKanji = map.get(sourceKanji)

    if (!mappedKanji) return null

    return hanVietMap.get(mappedKanji) ?? null
}

function resolveHanViet(
    kanji: string,
    overrideMap: Map<string, string>,
    hanVietMap: Map<string, string>,
    variantMap: Map<string, string>,
    simpleToTraditionalMap: Map<string, string>,
    shinjitaiMap: Map<string, string>
) {
    const override = overrideMap.get(kanji)
    if (override) return override

    const direct = hanVietMap.get(kanji)
    if (direct) return direct

    const variant = findHanVietByMappedKanji(
        kanji,
        variantMap,
        hanVietMap
    )
    if (variant) return variant

    const openCc = findHanVietByMappedKanji(
        kanji,
        simpleToTraditionalMap,
        hanVietMap
    )
    if (openCc) return openCc

    return findHanVietByMappedKanji(
        kanji,
        shinjitaiMap,
        hanVietMap
    )
}

function buildPayload(
    row: KanjiRow,
    overrideMap: Map<string, string>,
    hanVietMap: Map<string, string>,
    variantMap: Map<string, string>,
    simpleToTraditionalMap: Map<string, string>,
    shinjitaiMap: Map<string, string>,
    radicalMap: Map<string, RadicalInfo>
) {
    const payload: Record<string, unknown> = {}

    if (!row.han_viet) {
        const hanViet = resolveHanViet(
            row.kanji,
            overrideMap,
            hanVietMap,
            variantMap,
            simpleToTraditionalMap,
            shinjitaiMap
        )

        if (hanViet) {
            payload.han_viet = hanViet
        }
    }

    const missingRadical =
        !row.radical ||
        !row.radical_number ||
        !row.radical_name_vi ||
        !row.radical_name_ja

    if (missingRadical) {
        const radical = radicalMap.get(row.kanji)

        if (radical) {
            payload.radical_number = radical.radicalNumber
            payload.radical = radical.radical
            payload.radical_name_vi = radical.radicalNameVi
            payload.radical_name_ja = radical.radicalNameJa
        }
    }

    if (Object.keys(payload).length > 0) {
        payload.updated_at = new Date().toISOString()
    }

    return payload
}

type KanjiUpdate = Database["public"]["Tables"]["kanjis"]["Update"]

async function updateKanjiWithRetry(
    kanji: string,
    payload: KanjiUpdate,
    maxRetries = 3
) {
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
        const { error } = await supabase
            .from("kanjis")
            .update(payload)
            .eq("kanji", kanji)

        if (!error) return true

        console.error(
            `Update failed: ${kanji} attempt ${attempt}/${maxRetries}`,
            error
        )

        if (attempt < maxRetries) {
            await new Promise((resolve) =>
                setTimeout(resolve, attempt * 700)
            )
        }
    }

    return false
}

async function main() {
    const overrideMap = parseHanVietOverride()
    const hanVietMap = parseUnihanVietnamese()
    const radicalMap = parseKanjidicRadicals()
    const variantMap = parseUnihanTraditionalVariants()
    const simpleToTraditionalMap =
        parseOpenCcSimpleToTraditional()
    const shinjitaiMap = parseShinjitaiMap()

    const existingKanjis = await fetchExistingKanjis()

    let updated = 0
    let skipped = 0
    let failed = 0

    console.log({
        totalRows: existingKanjis.length,
        overrideSource: overrideMap.size,
        hanVietSource: hanVietMap.size,
        variantSource: variantMap.size,
        radicalSource: radicalMap.size,
        simpleToTraditionalSource: simpleToTraditionalMap.size,
        shinjitaiSource: shinjitaiMap.size,
    })

    for (const row of existingKanjis) {
        const payload = buildPayload(
            row,
            overrideMap,
            hanVietMap,
            variantMap,
            simpleToTraditionalMap,
            shinjitaiMap,
            radicalMap
        )

        if (Object.keys(payload).length === 0) {
            skipped += 1
            continue
        }

        const ok = await updateKanjiWithRetry(row.kanji, payload)

        if (!ok) {
            failed += 1
            continue
        }

        updated += 1

        if (updated % 500 === 0) {
            console.log(`Updated ${updated} kanji...`)
        }
    }

    console.log("Done")
    console.log({
        updated,
        skipped,
        failed,
    })
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})