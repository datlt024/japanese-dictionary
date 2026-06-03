import fs from "fs"
import path from "path"

const INPUT_FILE = path.join(
    process.cwd(),
    "data",
    "vocabulary-vi",
    "pending-vocabulary-senses.jsonl"
)

const OUTPUT_DIR = path.join(
    process.cwd(),
    "data",
    "vocabulary-vi",
    "batches"
)

const BATCH_SIZE = 100

type PendingVocabularySense = {
    sense_id: number
    vocabulary_id: number | null
    word: string
    kana: string | null
    sense_index: number
    meaning_en: string | null
    part_of_speech: string[] | null
    field: string[] | null
    misc: string[] | null
    info: string[] | null
}

function readJsonl(filePath: string) {
    return fs
        .readFileSync(filePath, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as PendingVocabularySense)
}

function createBatches() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })

    const items = readJsonl(INPUT_FILE)

    let batchIndex = 1

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE)

        const fileName = `batch-${String(batchIndex).padStart(
            5,
            "0"
        )}.json`

        const outputPath = path.join(OUTPUT_DIR, fileName)

        fs.writeFileSync(
            outputPath,
            JSON.stringify(batch, null, 2),
            "utf8"
        )

        batchIndex += 1
    }

    console.log(`Total items: ${items.length}`)
    console.log(`Batch size: ${BATCH_SIZE}`)
    console.log(`Total batches: ${batchIndex - 1}`)
    console.log(`Output: ${OUTPUT_DIR}`)
}

createBatches()