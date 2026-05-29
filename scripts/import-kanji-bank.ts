import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({
    path: ".env.local",
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

type KanjiBankItem = [
    string,
    string,
    string,
    string,
    string[],
    {
        Strokes?: string
        Radical?: string
        PenStrokes?: string
        Shape?: string
        Unicode?: string
    }
]

type KanjiInsert = {
    kanji: string
    onyomi: string
    kunyomi: string
    meaning: string
    tags: string
}

function readKanjiBank(fileName: string): KanjiBankItem[] {
    const filePath = path.join(
        process.cwd(),
        "data-import",
        fileName
    )

    const rawData = fs.readFileSync(filePath, "utf-8")

    return JSON.parse(rawData)
}

function parseKanjiItem(item: KanjiBankItem): KanjiInsert {
    const kanji = item[0]

    const readings = item[1] || ""

    const meanings = item[4] || []

    const meta = item[5] || {}

    return {
        kanji,
        onyomi: readings,
        kunyomi: "",
        meaning: meanings.join("; "),
        tags: JSON.stringify(meta),
    }
}

const bank1 = readKanjiBank("kanji_bank_1.json")
const bank2 = readKanjiBank("kanji_bank_2.json")

const kanjis = [...bank1, ...bank2]
    .map(parseKanjiItem)
    .filter((item) => {
        return item.kanji && item.meaning
    })

console.log("Dữ liệu mẫu:")
console.log(kanjis.slice(0, 5))

async function importData() {
    console.log(`Chuẩn bị import ${kanjis.length} kanji...`)

    const chunkSize = 500

    for (let i = 0; i < kanjis.length; i += chunkSize) {
        const chunk = kanjis.slice(i, i + chunkSize)

        const { error } = await supabase
            .from("kanjis")
            .upsert(chunk, {
                onConflict: "kanji",
            })

        if (error) {
            console.error("Import lỗi:", error)
            return
        }

        console.log(`Đã import ${i + chunk.length}/${kanjis.length}`)
    }

    console.log("Import kanji xong!")
}

importData()