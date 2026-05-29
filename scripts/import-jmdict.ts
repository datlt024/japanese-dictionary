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

const filePath = path.join(
    process.cwd(),
    "data-import",
    "jmdict-all-3.6.2.json"
)

const rawData = fs.readFileSync(filePath, "utf-8")
const jsonData = JSON.parse(rawData)

type VocabularyInsert = {
    word: string
    kana: string
    meaning: string
    part_of_speech?: string
    jlpt?: string
}

const words = jsonData.words

const vocabularies: VocabularyInsert[] = words.map((item: any) => {
    const word =
        item.kanji?.[0]?.text ||
        item.kana?.[0]?.text ||
        ""

    const kana =
        item.kana?.[0]?.text ||
        ""

    const meaning =
        item.sense
            ?.flatMap((sense: any) => {
                const viGlosses =
                    sense.gloss?.filter((gloss: any) => gloss.lang === "vie") || []

                const engGlosses =
                    sense.gloss?.filter((gloss: any) => gloss.lang === "eng") || []

                const selectedGlosses =
                    viGlosses.length > 0 ? viGlosses : engGlosses

                return selectedGlosses.map((gloss: any) => gloss.text)
            })
            .slice(0, 5)
            .join("; ") || ""

    const partOfSpeech =
        item.sense?.[0]?.partOfSpeech?.join(", ") || ""

    return {
        word,
        kana,
        meaning,
        part_of_speech: partOfSpeech,
        jlpt: "",
    }
})

const filteredVocabularies = vocabularies.filter((item) => {
    return item.word && item.kana && item.meaning
})

console.log("Dữ liệu mẫu:")
console.log(filteredVocabularies.slice(0, 5))

async function importData() {
    console.log(`Chuẩn bị import ${filteredVocabularies.length} từ...`)

    const chunkSize = 100

    for (let i = 0; i < filteredVocabularies.length; i += chunkSize) {
        const chunk = filteredVocabularies.slice(i, i + chunkSize)

        const { error } = await supabase
            .from("vocabularies")
            .insert(chunk)

        if (error) {
            console.error("Import lỗi:", error)
            return
        }

        console.log(
            `Đã import ${i + chunk.length}/${filteredVocabularies.length}`
        )
    }

    console.log("Import xong!")
}

importData()