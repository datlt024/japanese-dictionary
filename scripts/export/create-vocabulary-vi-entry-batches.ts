import fs from "fs"
import path from "path"

const INPUT_FILE = path.join(
    process.cwd(),
    "data",
    "vocabulary-vi",
    "pending-vocabulary-entries.jsonl"
)

const OUTPUT_DIR = path.join(
    process.cwd(),
    "data",
    "vocabulary-vi",
    "entry-batches"
)

const BATCH_SIZE = 20

function readJsonl(filePath: string) {
    return fs
        .readFileSync(filePath, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line))
}

function createBatches() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })

    const entries = readJsonl(INPUT_FILE)

    let batchIndex = 1

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE)

        const fileName = `entry-batch-${String(
            batchIndex
        ).padStart(5, "0")}.json`

        fs.writeFileSync(
            path.join(OUTPUT_DIR, fileName),
            JSON.stringify(batch, null, 2),
            "utf8"
        )

        batchIndex += 1
    }

    console.log(`Total entries: ${entries.length}`)
    console.log(`Batch size: ${BATCH_SIZE}`)
    console.log(`Total batches: ${batchIndex - 1}`)
    console.log(`Output: ${OUTPUT_DIR}`)
}

createBatches()