import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { XMLParser } from "fast-xml-parser"

import {
    TablesInsert,
} from "../../src/shared/types/database.generated"
import { supabaseAdmin } from "../../src/shared/lib/supabase/admin"

dotenv.config({
    path: ".env.local",
})

type KanjiInsert = TablesInsert<"kanjis">

type KanjidicXml = {
    kanjidic2?: {
        character?: KanjidicCharacter | KanjidicCharacter[]
    }
}

type KanjidicCharacter = {
    literal?: string
    misc?: {
        stroke_count?: string | number
        jlpt?: string | number
        grade?: string | number
        freq?: string | number
    }
    reading_meaning?: {
        rmgroup?: {
            reading?: KanjidicReading | KanjidicReading[]
            meaning?: KanjidicMeaning | KanjidicMeaning[]
        }
    }
}

type KanjidicReading = {
    r_type?: string
    text?: string
}

type KanjidicMeaning =
    | string
    | {
        m_lang?: string
        text?: string
    }

const filePath = path.join(
    process.cwd(),
    "data-import",
    "kanjidic2.xml"
)

function toArray<T>(value: T | T[] | undefined): T[] {
    if (!value) {
        return []
    }

    return Array.isArray(value) ? value : [value]
}

function toNumber(value: unknown): number | null {
    if (!value) {
        return null
    }

    const numberValue = Number(value)

    return Number.isNaN(numberValue)
        ? null
        : numberValue
}

function getEnglishMeanings(meanings: KanjidicMeaning[]) {
    return meanings
        .filter((meaningItem): meaningItem is string => {
            return typeof meaningItem === "string"
        })
        .join("; ")
}

function parseKanji(item: KanjidicCharacter): KanjiInsert | null {
    const kanji = item.literal || ""

    if (!kanji) {
        return null
    }

    const readingMeaning = item.reading_meaning?.rmgroup
    const readings = toArray(readingMeaning?.reading)
    const meanings = toArray(readingMeaning?.meaning)

    const onyomi = readings
        .filter((reading) => reading.r_type === "ja_on")
        .map((reading) => reading.text)
        .filter((text): text is string => Boolean(text))
        .join("; ")

    const kunyomi = readings
        .filter((reading) => reading.r_type === "ja_kun")
        .map((reading) => reading.text)
        .filter((text): text is string => Boolean(text))
        .join("; ")

    return {
        kanji,
        meaning_en: getEnglishMeanings(meanings),
        meaning_vi: null,
        onyomi: onyomi || null,
        kunyomi: kunyomi || null,
        stroke_count: toNumber(item.misc?.stroke_count),
        jlpt: toNumber(item.misc?.jlpt),
        grade: toNumber(item.misc?.grade),
        frequency: toNumber(item.misc?.freq),
        radical_id: null,
        unicode: kanji
            .codePointAt(0)
            ?.toString(16)
            .toUpperCase() || null,
    }
}

async function importData() {
    console.log("Bắt đầu import KANJIDIC2...")
    console.log("Đang đọc file:", filePath)

    const xml = fs.readFileSync(filePath, "utf-8")

    console.log("Đã đọc file XML")

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
        textNodeName: "text",
    })

    const jsonData = parser.parse(xml) as KanjidicXml

    console.log("Đã parse XML")

    const characters = toArray(jsonData.kanjidic2?.character)

    console.log("Số kanji đọc được:", characters.length)

    const filteredKanjis = characters
        .map(parseKanji)
        .filter((item): item is KanjiInsert => Boolean(item))

    console.log("Dữ liệu mẫu:")
    console.log(filteredKanjis.slice(0, 5))

    console.log(`Chuẩn bị import ${filteredKanjis.length} kanji...`)

    const chunkSize = 500

    for (let i = 0; i < filteredKanjis.length; i += chunkSize) {
        const chunk = filteredKanjis.slice(i, i + chunkSize)

        const { error } = await supabaseAdmin
            .from("kanjis")
            .upsert(chunk, {
                onConflict: "kanji",
            })

        if (error) {
            console.error("Import lỗi:", error)
            process.exit(1)
        }

        console.log(
            `Đã import ${i + chunk.length}/${filteredKanjis.length}`
        )
    }

    console.log("Import KANJIDIC2 xong!")
}

importData().catch((error) => {
    console.error("Import thất bại:", error)
    process.exit(1)
})