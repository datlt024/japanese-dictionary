import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { XMLParser } from "fast-xml-parser"
import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const filePath = path.join(
    process.cwd(),
    "data-import",
    "kanjidic2.xml"
)

console.log("Bắt đầu import KANJIDIC2...")
console.log("Đang đọc file:", filePath)

const xml = fs.readFileSync(filePath, "utf-8")

console.log("Đã đọc file XML")

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "text",
})

const jsonData = parser.parse(xml)

console.log("Đã parse XML")

type KanjiInsert = {
    kanji: string
    meaning: string
    onyomi: string
    kunyomi: string
    stroke_count: number | null
    jlpt: number | null
    grade: number | null
    frequency: number | null
}

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

const characters = toArray(jsonData.kanjidic2?.character)

console.log("Số kanji đọc được:", characters.length)

const kanjis: KanjiInsert[] = characters.map((item: any) => {
    const readingMeaning = item.reading_meaning?.rmgroup

    const readings = toArray(readingMeaning?.reading)

    const meanings = toArray(readingMeaning?.meaning)

    const onyomi = readings
        .filter((reading: any) => reading.r_type === "ja_on")
        .map((reading: any) => reading.text)
        .filter(Boolean)
        .join("; ")

    const kunyomi = readings
        .filter((reading: any) => reading.r_type === "ja_kun")
        .map((reading: any) => reading.text)
        .filter(Boolean)
        .join("; ")

    const meaning = meanings
        .filter((item: any) => {
            return typeof item === "string"
        })
        .join("; ")

    return {
        kanji: item.literal,
        meaning,
        onyomi,
        kunyomi,
        stroke_count: toNumber(item.misc?.stroke_count),
        jlpt: toNumber(item.misc?.jlpt),
        grade: toNumber(item.misc?.grade),
        frequency: toNumber(item.misc?.freq),
    }
})

const filteredKanjis = kanjis.filter((item) => {
    return item.kanji
})

console.log("Dữ liệu mẫu:")
console.log(filteredKanjis.slice(0, 5))

async function importData() {
    console.log(`Chuẩn bị import ${filteredKanjis.length} kanji...`)

    const chunkSize = 500

    for (let i = 0; i < filteredKanjis.length; i += chunkSize) {
        const chunk = filteredKanjis.slice(i, i + chunkSize)

        const { error } = await supabase
            .from("kanjis")
            .upsert(chunk, {
                onConflict: "kanji",
            })

        if (error) {
            console.error("Import lỗi:", error)
            return
        }

        console.log(`Đã import ${i + chunk.length}/${filteredKanjis.length}`)
    }

    console.log("Import KANJIDIC2 xong!")
}

importData()