import dotenv from "dotenv"
import fs from "fs"
import path from "path"

import { supabaseAdmin } from "@/server/supabase/admin"

dotenv.config({
    path: ".env.local",
})

type JmdictWord = {
    id: string
    kanji: {
        text: string
        common?: boolean
    }[]
    kana: {
        text: string
        common?: boolean
    }[]
    sense: {
        partOfSpeech?: string[]
        gloss?: {
            lang: string
            text: string
            type?: string | null
        }[]
    }[]
}

type VocabularyInsert = {
    jmdict_id: string
    primary_word: string
    primary_kana: string
    is_common: boolean
}

const filePath = path.join(
    process.cwd(),
    "data-import",
    "jmdict-eng-3.6.2.json"
)

function getMainWord(item: JmdictWord) {
    const commonKanji =
        item.kanji.find((kanji) => kanji.common)

    const firstKanji = item.kanji[0]

    const commonKana =
        item.kana.find((kana) => kana.common)

    const firstKana = item.kana[0]

    return (
        commonKanji?.text ||
        firstKanji?.text ||
        commonKana?.text ||
        firstKana?.text ||
        ""
    )
}

function getMainKana(item: JmdictWord) {
    const commonKana =
        item.kana.find((kana) => kana.common)

    const firstKana = item.kana[0]

    return commonKana?.text || firstKana?.text || ""
}

function getEnglishMeaning(item: JmdictWord) {
    const meanings = item.sense.flatMap((sense) => {
        return (
            sense.gloss
                ?.filter((gloss) => gloss.lang === "eng")
                .map((gloss) => gloss.text) || []
        )
    })

    const uniqueMeanings = Array.from(new Set(meanings))

    return uniqueMeanings
        .slice(0, 8)
        .join("; ")
}

//function getPartOfSpeech(item: JmdictWord) {
//    const parts = item.sense.flatMap((sense) => {
//       return sense.partOfSpeech || []
// })

// const uniqueParts = Array.from(new Set(parts))

//   return uniqueParts.join(", ")
//}

function getIsCommon(item: JmdictWord) {
    return (
        item.kanji.some((kanji) => kanji.common) ||
        item.kana.some((kana) => kana.common)
    )
}

function parseVocabulary(
    item: JmdictWord
): VocabularyInsert | null {
    const word = getMainWord(item)
    const kana = getMainKana(item)
    const meaningEn = getEnglishMeaning(item)
    const isCommon = getIsCommon(item)

    if (!word || !meaningEn) {
        return null
    }

    return {
        jmdict_id: item.id,
        primary_word: word,
        primary_kana: kana,
        is_common: isCommon,
    }
}

async function importData() {
    console.log("Đang đọc file JMdict...")

    const rawData = fs.readFileSync(filePath, "utf-8")
    const jsonData = JSON.parse(rawData)

    const words = jsonData.words as JmdictWord[]

    console.log(`Tổng số entries: ${words.length}`)

    const vocabularies = words
        .map(parseVocabulary)
        .filter(Boolean) as VocabularyInsert[]

    console.log(`Số dòng hợp lệ: ${vocabularies.length}`)
    console.log("Dữ liệu mẫu:")
    console.log(vocabularies.slice(0, 5))

    const chunkSize = 500
    let totalImported = 0

    for (let i = 0; i < vocabularies.length; i += chunkSize) {
        const chunk = vocabularies.slice(i, i + chunkSize)

        const { error } = await supabaseAdmin
            .from("vocabularies")
            .insert(chunk)

        if (error) {
            console.error("Import lỗi:", error)
            process.exit(1)
        }

        totalImported += chunk.length

        console.log(
            `Đã import ${totalImported}/${vocabularies.length}`
        )
    }

    console.log("Import JMdict English xong!")
}

importData().catch((error) => {
    console.error("Import thất bại:", error)
    process.exit(1)
})