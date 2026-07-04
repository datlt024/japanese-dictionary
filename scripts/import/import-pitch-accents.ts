/**
 * Import pitch accent data from Kanjium (mifunetoshiro/kanjium).
 *
 * Source file format (tab-separated):
 *   word\treading\tsource\tpitch
 *   e.g. "母\tはは\tNHK\t2"
 *
 * When a word has multiple pitch values (e.g. "0;2"), we use the first one.
 *
 * Matching strategy:
 *   1. Join vocabularies.primary_word == kanjium.word
 *      AND vocabulary_readings.reading  == kanjium.reading
 *   2. Fallback: vocabularies.primary_kana == kanjium.reading
 *      (for kana-only words with no kanji form)
 */

import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: ".env.local" })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FILE_PATH = path.join(process.cwd(), "data-import", "pitch-accents.txt")
const BATCH_SIZE = 500

type KanjiumEntry = {
    word: string
    reading: string
    pitch: number
}

// ── 1. Parse Kanjium file ────────────────────────────────────────────────────

function parseKanjiumFile(filePath: string): KanjiumEntry[] {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n")
    const entries: KanjiumEntry[] = []

    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue

        const cols = trimmed.split("\t")
        if (cols.length < 3) continue

        const [word, reading, pitchRaw] = cols

        // Take only the first pitch value when multiple are given (e.g. "0,2")
        const pitchStr = pitchRaw.split(",")[0].trim()
        const pitch = parseInt(pitchStr, 10)

        if (!word || !reading || isNaN(pitch)) continue

        entries.push({ word, reading, pitch })
    }

    return entries
}

// ── 2. Fetch all vocabulary_readings with vocabulary join ────────────────────

type ReadingRow = {
    id: number
    reading: string
    vocabulary_id: number
    primary_word: string
    primary_kana: string | null
}

async function fetchAllReadings(): Promise<ReadingRow[]> {
    const rows: ReadingRow[] = []
    let from = 0
    const pageSize = 1000

    while (true) {
        const { data, error } = await supabaseAdmin
            .from("vocabulary_readings")
            .select("id, reading, vocabulary_id, vocabularies!inner(primary_word, primary_kana)")
            .range(from, from + pageSize - 1)

        if (error) throw new Error(`Fetch readings error: ${error.message}`)
        if (!data || data.length === 0) break

        for (const row of data) {
            const voc = (row as unknown as {
                vocabularies: { primary_word: string; primary_kana: string | null }
            }).vocabularies

            rows.push({
                id: row.id,
                reading: row.reading,
                vocabulary_id: row.vocabulary_id!,
                primary_word: voc.primary_word,
                primary_kana: voc.primary_kana,
            })
        }

        from += pageSize
        if (data.length < pageSize) break
    }

    return rows
}

// ── 3. Build lookup map from Kanjium entries ─────────────────────────────────

function buildKanjiumMap(entries: KanjiumEntry[]): Map<string, number> {
    // Key: "word::reading" — prefer last entry if duplicate (later entries may be more specific)
    const map = new Map<string, number>()
    for (const entry of entries) {
        map.set(`${entry.word}::${entry.reading}`, entry.pitch)
    }
    return map
}

// ── 4. Match and prepare updates ─────────────────────────────────────────────

type UpdateRow = { id: number; reading: string; pitch: number }

function matchReadings(
    readings: ReadingRow[],
    kanjiumMap: Map<string, number>
): UpdateRow[] {
    const updates: UpdateRow[] = []

    for (const row of readings) {
        // Strategy 1: exact word + reading match
        let pitch = kanjiumMap.get(`${row.primary_word}::${row.reading}`)

        // Strategy 2: kana-only word (primary_word is kana, matches kanjium word field)
        if (pitch === undefined && row.primary_kana) {
            pitch = kanjiumMap.get(`${row.primary_kana}::${row.reading}`)
        }

        // Strategy 3: kana-only entry in kanjium (word == reading)
        if (pitch === undefined) {
            pitch = kanjiumMap.get(`${row.reading}::${row.reading}`)
        }

        if (pitch !== undefined) {
            updates.push({ id: row.id, reading: row.reading, pitch })
        }
    }

    return updates
}

// ── 5. Batch upsert ──────────────────────────────────────────────────────────

async function applyUpdates(updates: UpdateRow[]): Promise<void> {
    let applied = 0
    let failed = 0

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE)

        const { error } = await supabaseAdmin
            .from("vocabulary_readings")
            .upsert(
                batch.map((u) => ({ id: u.id, reading: u.reading, pitch: u.pitch })),
                { onConflict: "id" }
            )

        if (error) {
            console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error.message)
            failed += batch.length
        } else {
            applied += batch.length
            process.stdout.write(`\r  Applied: ${applied} / ${updates.length}`)
        }
    }

    console.log(`\n  Done. Applied: ${applied}, Failed: ${failed}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log("=== Import Pitch Accents (Kanjium) ===\n")

    if (!fs.existsSync(FILE_PATH)) {
        console.error(`File not found: ${FILE_PATH}`)
        console.error("Run: curl -L https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/source_files/raw/accents.txt -o data-import/pitch-accents.txt")
        process.exit(1)
    }

    // Step 1 — parse
    console.log("1. Parsing Kanjium file...")
    const entries = parseKanjiumFile(FILE_PATH)
    console.log(`   Loaded ${entries.length.toLocaleString()} entries.\n`)

    // Step 2 — fetch DB readings
    console.log("2. Fetching vocabulary_readings from DB...")
    const readings = await fetchAllReadings()
    console.log(`   Found ${readings.length.toLocaleString()} reading rows.\n`)

    // Step 3 — match
    console.log("3. Matching...")
    const kanjiumMap = buildKanjiumMap(entries)
    const updates = matchReadings(readings, kanjiumMap)
    const pct = ((updates.length / readings.length) * 100).toFixed(1)
    console.log(`   Matched ${updates.length.toLocaleString()} / ${readings.length.toLocaleString()} rows (${pct}%).\n`)

    if (updates.length === 0) {
        console.log("Nothing to update.")
        return
    }

    // Step 4 — apply
    console.log("4. Applying updates to DB...")
    await applyUpdates(updates)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
