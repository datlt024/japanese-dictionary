import dotenv from "dotenv"
import fs from "fs"
import path from "path"

import { supabaseAdmin } from "@/server/supabase/admin"

dotenv.config({ path: ".env.local" })

const DATA_DIR = path.join(
    process.cwd(),
    "data/external/hanabira/backend/express/json_data"
)

const LEVELS = ["N1", "N2", "N3", "N4", "N5"] as const
type JlptLevel = (typeof LEVELS)[number]

// Tanos p_tag → standard level
const TAG_TO_LEVEL: Record<string, JlptLevel> = {
    JLPT_N1: "N1", JLPT_N2: "N2", JLPT_N3: "N3", JLPT_N4: "N4", JLPT_N5: "N5",
}

type TanosEntry = {
    vocabulary_original: string
    vocabulary_simplified: string
    p_tag: string
}

// Slang misc tags to exclude
const SLANG_MISC = new Set(["sl", "net-sl", "m-sl"])

function loadAllVocabFiles(): Map<string, JlptLevel> {
    // Load all JSON files that contain JLPT_Nx p_tag entries.
    // Process N1 first so N5 overwrites (easier level wins).
    const wordMap = new Map<string, JlptLevel>()

    const allFiles = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))

    for (const fname of allFiles) {
        let entries: TanosEntry[]
        try {
            const raw = fs.readFileSync(path.join(DATA_DIR, fname), "utf-8")
            entries = JSON.parse(raw)
            if (!Array.isArray(entries)) continue
        } catch {
            continue
        }

        for (const entry of entries) {
            if (!entry.vocabulary_original || !entry.p_tag) continue
            const level = TAG_TO_LEVEL[entry.p_tag]
            if (!level) continue

            const word = entry.vocabulary_original.trim()
            const kana = entry.vocabulary_simplified?.trim() ?? ""

            if (word) wordMap.set(word, level)
            if (kana && kana !== word) wordMap.set(kana, level)
        }
    }

    // Count per level
    const counts: Record<string, number> = {}
    for (const l of wordMap.values()) counts[l] = (counts[l] ?? 0) + 1
    console.log("JLPT entries in source map:", counts)
    return wordMap
}

async function loadSlangIds(): Promise<Set<number>> {
    // Find vocabulary IDs where any sense has slang misc tags
    const slangIds = new Set<number>()
    let offset = 0
    const batchSize = 1000

    while (true) {
        const { data, error } = await supabaseAdmin
            .from("vocabulary_senses")
            .select("vocabulary_id, misc")
            .not("misc", "is", null)
            .range(offset, offset + batchSize - 1)

        if (error) { console.error("Lỗi tải slang:", error); break }
        if (!data || data.length === 0) break

        for (const row of data) {
            if (row.misc && row.vocabulary_id) {
                const misc = row.misc as string[]
                if (misc.some((m) => SLANG_MISC.has(m))) {
                    slangIds.add(row.vocabulary_id)
                }
            }
        }

        offset += batchSize
        if (data.length < batchSize) break
    }

    return slangIds
}

async function loadWritingMap(): Promise<Map<string, Set<number>>> {
    // writing → Set of vocabulary_ids
    const map = new Map<string, Set<number>>()
    let offset = 0
    const batchSize = 1000

    while (true) {
        const { data, error } = await supabaseAdmin
            .from("vocabulary_writings")
            .select("writing, vocabulary_id")
            .range(offset, offset + batchSize - 1)

        if (error) { console.error("Lỗi tải writings:", error); break }
        if (!data || data.length === 0) break

        for (const row of data) {
            if (!row.writing || !row.vocabulary_id) continue
            if (!map.has(row.writing)) map.set(row.writing, new Set())
            map.get(row.writing)!.add(row.vocabulary_id)
        }

        offset += batchSize
        process.stdout.write(`\rĐã tải ${offset} writings...`)
        if (data.length < batchSize) break
    }
    console.log("")

    return map
}

async function loadReadingMap(): Promise<Map<string, Set<number>>> {
    // reading → Set of vocabulary_ids
    const map = new Map<string, Set<number>>()
    let offset = 0
    const batchSize = 1000

    while (true) {
        const { data, error } = await supabaseAdmin
            .from("vocabulary_readings")
            .select("reading, vocabulary_id")
            .range(offset, offset + batchSize - 1)

        if (error) { console.error("Lỗi tải readings:", error); break }
        if (!data || data.length === 0) break

        for (const row of data) {
            if (!row.reading || !row.vocabulary_id) continue
            if (!map.has(row.reading)) map.set(row.reading, new Set())
            map.get(row.reading)!.add(row.vocabulary_id)
        }

        offset += batchSize
        process.stdout.write(`\rĐã tải ${offset} readings...`)
        if (data.length < batchSize) break
    }
    console.log("")

    return map
}

async function importJlptVocab() {
    console.log("=== Bước 1: Tải dữ liệu JLPT nguồn ===")
    const wordMap = loadAllVocabFiles()
    console.log(`Tổng entries trong map: ${wordMap.size}`)

    console.log("\n=== Bước 2: Tải danh sách từ lóng (để loại trừ) ===")
    const slangIds = await loadSlangIds()
    console.log(`Số vocabulary ID bị loại (lóng): ${slangIds.size}`)

    console.log("\n=== Bước 2b: Xóa JLPT cũ để re-import sạch ===")
    {
        let cleared = 0
        while (true) {
            const { data: rows, error: fetchErr } = await supabaseAdmin
                .from("vocabularies")
                .select("id")
                .not("jlpt", "is", null)
                .limit(500)
            if (fetchErr) { console.error("Lỗi lấy ID cần xóa:", fetchErr); process.exit(1) }
            if (!rows || rows.length === 0) break
            const ids = rows.map((r) => r.id)
            const { error: clearErr } = await supabaseAdmin
                .from("vocabularies")
                .update({ jlpt: null })
                .in("id", ids)
            if (clearErr) { console.error("Lỗi xóa JLPT batch:", clearErr); process.exit(1) }
            cleared += ids.length
            process.stdout.write(`\rĐã xóa ${cleared} entries...`)
        }
        console.log(`\nĐã xóa toàn bộ JLPT cũ (${cleared} entries).`)
    }

    console.log("\n=== Bước 3: Tải vocabulary_writings ===")
    const writingMap = await loadWritingMap()
    console.log(`Số writing entries: ${writingMap.size}`)

    console.log("\n=== Bước 4: Tải vocabulary_readings (kana) ===")
    const readingMap = await loadReadingMap()
    console.log(`Số reading entries: ${readingMap.size}`)

    console.log("\n=== Bước 5: Ghép từ JLPT với vocabulary ===")

    // Conflict-resolution rule: easiest level always wins.
    //
    // Tanos lists some words multiple times across levels, e.g.:
    //   奇麗 (rare kanji form) → N1   vs   きれい (kana form) → N5   → assign N5
    //   嬉しい (kanji form)    → N3   vs   うれしい (kana form) → N4  → assign N3 (N3 easier? no, N4 easier)
    //
    // The rule "easiest wins" correctly handles the 綺麗 case: N5 < N1 kanji level.
    // For kana matches, they can never raise the level (make it harder);
    // they can only lower it (make it easier). Writing matches work the same way.
    //
    // Implementation: single vocab_id → level map; update only if new match is easier.
    const LEVEL_RANK: Record<JlptLevel, number> = { N5: 5, N4: 4, N3: 3, N2: 2, N1: 1 }
    const vocabToLevel = new Map<number, JlptLevel>()

    function assignLevel(id: number, level: JlptLevel) {
        const current = vocabToLevel.get(id)
        if (!current || LEVEL_RANK[level] > LEVEL_RANK[current]) {
            vocabToLevel.set(id, level)
        }
    }

    // Writing (kanji) matches — non-kana-only words only
    let writingCount = 0
    for (const [word, level] of wordMap) {
        if (/^[぀-ゟ゠-ヿ]+$/.test(word)) continue
        const ids = writingMap.get(word)
        if (ids) {
            for (const id of ids) {
                if (!slangIds.has(id)) { assignLevel(id, level); writingCount++ }
            }
        }
    }
    console.log(`  Writing (kanji) matches: ${writingCount} hits, ${vocabToLevel.size} vocab IDs`)

    // Reading (kana) matches — kana-only words only; can lower level further
    let readingCount = 0
    for (const [word, level] of wordMap) {
        if (!/^[぀-ゟ゠-ヿ]+$/.test(word)) continue
        const ids = readingMap.get(word)
        if (ids) {
            for (const id of ids) {
                if (!slangIds.has(id)) { assignLevel(id, level); readingCount++ }
            }
        }
    }
    console.log(`  Reading (kana) matches: ${readingCount} hits, ${vocabToLevel.size} vocab IDs total`)

    // Distribute into per-level sets
    const levelIds = new Map<JlptLevel, Set<number>>()
    for (const level of LEVELS) levelIds.set(level, new Set())
    for (const [id, level] of vocabToLevel) levelIds.get(level)!.add(id)

    // Easiest-wins conflict resolution already applied via assignLevel.
    // finalLevelIds just converts sets to arrays for batch DB update.
    const finalLevelIds = new Map<JlptLevel, number[]>()
    const assigned = new Set<number>()  // kept for compatibility, all IDs are unique here

    for (const level of ["N5", "N4", "N3", "N2", "N1"] as JlptLevel[]) {
        const ids: number[] = []
        for (const id of levelIds.get(level)!) {
            if (!assigned.has(id)) {
                ids.push(id)
                assigned.add(id)
            }
        }
        finalLevelIds.set(level, ids)
    }

    console.log("\nSố từ sẽ cập nhật theo cấp độ:")
    let total = 0
    for (const level of LEVELS) {
        const count = finalLevelIds.get(level)!.length
        console.log(`  ${level}: ${count} từ`)
        total += count
    }
    console.log(`  Tổng: ${total} từ`)

    console.log("\n=== Bước 6: Cập nhật DB ===")
    const updateBatch = 500
    let updated = 0

    for (const level of LEVELS) {
        const ids = finalLevelIds.get(level)!
        if (ids.length === 0) continue

        for (let i = 0; i < ids.length; i += updateBatch) {
            const chunk = ids.slice(i, i + updateBatch)
            const { error } = await supabaseAdmin
                .from("vocabularies")
                .update({ jlpt: level })
                .in("id", chunk)

            if (error) {
                console.error(`Lỗi update ${level} batch ${i}:`, error)
                continue
            }
            updated += chunk.length
        }
        console.log(`${level}: đã cập nhật ${ids.length} từ`)
    }

    console.log(`\nHoàn tất! Đã gán cấp JLPT cho ${updated} từ vựng.`)
}

importJlptVocab().catch((error) => {
    console.error("Import thất bại:", error)
    process.exit(1)
})
