import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

import fs from "node:fs/promises"
import path from "node:path"

import { createClient } from "@supabase/supabase-js"

type RubyItem = {
    text: string
    reading: string | null
}

type Entry = {
    vocabulary_id: number
    word: string
    kana: string
    ruby?: RubyItem[]
}

const ENTRY_BATCH_DIR =
    "data/vocabulary-vi/entry-batches"

const CHUNK_SIZE = 500

function getArgValue(name: string) {
    const index = process.argv.indexOf(name)

    if (index === -1) {
        return null
    }

    return process.argv[index + 1] || null
}

function hasFlag(name: string) {
    return process.argv.includes(name)
}

function isValidRubyItem(value: unknown): value is RubyItem {
    if (
        typeof value !== "object" ||
        value === null ||
        !("text" in value) ||
        !("reading" in value)
    ) {
        return false
    }

    const item = value as {
        text: unknown
        reading: unknown
    }

    return (
        typeof item.text === "string" &&
        item.text.length > 0 &&
        (typeof item.reading === "string" ||
            item.reading === null)
    )
}

function hasValidRuby(entry: Entry) {
    return (
        Array.isArray(entry.ruby) &&
        entry.ruby.length > 0 &&
        entry.ruby.every(isValidRubyItem)
    )
}

function chunkArray<T>(items: T[], size: number) {
    const chunks: T[][] = []

    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size))
    }

    return chunks
}

async function getBatchFiles() {
    const singleFile = getArgValue("--file")

    if (singleFile) {
        return [singleFile]
    }

    const dirents = await fs.readdir(ENTRY_BATCH_DIR)

    return dirents
        .filter(
            (fileName) =>
                fileName.startsWith("entry-batch-") &&
                fileName.endsWith(".json")
        )
        .sort()
        .map((fileName) =>
            path.join(ENTRY_BATCH_DIR, fileName)
        )
}

async function readEntries(filePath: string): Promise<Entry[]> {
    const content = await fs.readFile(filePath, "utf-8")
    const json = JSON.parse(content)

    if (!Array.isArray(json)) {
        throw new Error(`${filePath} không phải JSON array`)
    }

    return json
}

async function main() {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL

    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local"
        )
    }

    const dryRun = hasFlag("--dry-run")

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
        },
    })

    const files = await getBatchFiles()

    let totalEntries = 0
    let totalRubyEntries = 0
    let totalUpdated = 0

    for (const filePath of files) {
        const entries = await readEntries(filePath)

        const rubyRows = entries
            .filter(hasValidRuby)
            .map((entry) => ({
                vocabulary_id: entry.vocabulary_id,
                ruby: entry.ruby,
            }))

        totalEntries += entries.length
        totalRubyEntries += rubyRows.length

        console.log(
            `\n${filePath}: ${rubyRows.length}/${entries.length} entries có ruby`
        )

        if (dryRun || rubyRows.length === 0) {
            continue
        }

        const chunks = chunkArray(rubyRows, CHUNK_SIZE)

        for (const [chunkIndex, chunk] of chunks.entries()) {
            const { data, error } = await supabase.rpc(
                "update_vocabulary_ruby_missing",
                {
                    payload: chunk,
                }
            )

            if (error) {
                throw new Error(
                    `Lỗi update ${filePath}, chunk ${chunkIndex + 1
                    }: ${error.message}`
                )
            }

            const updatedCount =
                typeof data === "number" ? data : 0

            totalUpdated += updatedCount

            console.log(
                `  chunk ${chunkIndex + 1}/${chunks.length
                }: updated ${updatedCount}`
            )
        }
    }

    console.log("\nDone")
    console.log(`Total entries: ${totalEntries}`)
    console.log(`Entries có ruby: ${totalRubyEntries}`)
    console.log(`Updated rows: ${totalUpdated}`)

    if (dryRun) {
        console.log("Dry run: chưa update database")
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})