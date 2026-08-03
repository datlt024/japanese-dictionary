/**
 * Audit: nghi vấn từ, trạng từ, đại từ chỉ thị
 *
 * Load toàn bộ visible senses theo batch → filter client-side
 * (tránh timeout do PostgREST không dùng GIN index trên mảng)
 *
 * Chạy:
 *   npx tsx --env-file=.env.local scripts/shared/audit-pos-categories.ts
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/shared/types/database.generated"

const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
)

const PAGE_SIZE = 1000

// ─── Kosoado series ───────────────────────────────────────────────
const KOSOADO_WORDS = new Set([
    "これ", "それ", "あれ", "どれ",
    "ここ", "そこ", "あそこ", "どこ",
    "こちら", "そちら", "あちら", "どちら",
    "こっち", "そっち", "あっち", "どっち",
    "こう", "そう", "ああ", "どう",
    "こんな", "そんな", "あんな", "どんな",
    "この", "その", "あの", "どの",
    "こういう", "そういう", "ああいう", "どういう",
    "こんなに", "そんなに", "あんなに", "どんなに",
])

// Nghi vấn từ độc lập
const INTERROGATIVE_WORDS = new Set([
    "何", "なに", "なん",
    "誰", "だれ", "どなた",
    "いつ", "なぜ", "なんで",
    "いくら", "いくつ",
    "どれ", "どこ", "どちら", "どっち", "どんな", "どの",
    "どれほど", "どれくらい", "どれだけ",
    "どのくらい", "どのぐらい",
    "何時", "何日", "何月", "何年", "何曜日",
    "何番", "何号", "何本", "何枚", "何冊",
    "何人", "何名",
    "何故",
])

const ALL_TARGET_WORDS = new Set([...KOSOADO_WORDS, ...INTERROGATIVE_WORDS])

// JLPT levels to keep for adverbs (too many to show all)
const ADV_JLPT_FILTER = new Set(["N5", "N4", "N3"])

interface SenseRow {
    id: number
    vocabulary_id: number
    sense_index: number
    meaning_vi: string | null
    meaning_en: string | null
    part_of_speech: string[] | null
}

interface VocabInfo {
    primary_word: string
    primary_kana: string
    jlpt: string | null
}

function padEnd(s: string, n: number) {
    return s.length >= n ? s : s + " ".repeat(n - s.length)
}
function truncate(s: string | null, n: number): string {
    if (!s) return "(null)"
    return s.length > n ? s.slice(0, n - 1) + "…" : s
}

// ── Load vocab map ─────────────────────────────────────────────────
async function loadVocabMap(): Promise<Map<number, VocabInfo>> {
    const map = new Map<number, VocabInfo>()
    let from = 0
    let pages = 0
    process.stdout.write("Loading vocab")
    while (true) {
        const { data, error } = await supabaseAdmin
            .from("vocabularies")
            .select("id, primary_word, primary_kana, jlpt")
            .range(from, from + PAGE_SIZE - 1)
            .order("id")
        if (error) throw new Error(`vocab: ${error.message}`)
        if (!data || data.length === 0) break
        for (const v of data) map.set(v.id, { primary_word: v.primary_word, primary_kana: v.primary_kana ?? "", jlpt: v.jlpt })
        from += PAGE_SIZE
        pages++
        if (pages % 50 === 0) process.stdout.write(".")
        if (data.length < PAGE_SIZE) break
    }
    console.log(` ${map.size.toLocaleString()} từ`)
    return map
}

// ── Load ALL visible senses (batch) ───────────────────────────────
async function loadAllSenses(): Promise<SenseRow[]> {
    const all: SenseRow[] = []
    let from = 0
    let pages = 0
    process.stdout.write("Loading senses")
    while (true) {
        const { data, error } = await supabaseAdmin
            .from("vocabulary_senses")
            .select("id, vocabulary_id, sense_index, meaning_vi, meaning_en, part_of_speech")
            .eq("is_hidden", false)
            .range(from, from + PAGE_SIZE - 1)
            .order("vocabulary_id")
        if (error) throw new Error(`senses: ${error.message}`)
        if (!data || data.length === 0) break
        all.push(...(data as SenseRow[]))
        from += PAGE_SIZE
        pages++
        if (pages % 50 === 0) process.stdout.write(".")
        if (data.length < PAGE_SIZE) break
    }
    console.log(` ${all.length.toLocaleString()} senses`)
    return all
}

// ── Print grouped entries ─────────────────────────────────────────
function printEntries(entries: Array<{ vocab: VocabInfo; senses: SenseRow[] }>) {
    if (entries.length === 0) {
        console.log("  Không có dữ liệu\n")
        return
    }
    for (const { vocab, senses } of entries) {
        const word = `${vocab.primary_word}(${vocab.primary_kana})`
        const jlpt = vocab.jlpt ?? "—"
        for (const s of senses) {
            const pos = (s.part_of_speech ?? []).join(",")
            console.log(
                `  ${padEnd(word, 30)} [${jlpt}] [s${s.sense_index}] ${padEnd(pos, 20)} | ${truncate(s.meaning_vi, 55)}`
            )
        }
    }
    console.log()
}

// ─────────────────────────────────────────────────────────────────
async function main() {
    console.log("=".repeat(72))
    console.log("AUDIT: nghi vấn từ / đại từ / trạng từ")
    console.log("=".repeat(72))

    const vocabMap = await loadVocabMap()
    const allSenses = await loadAllSenses()
    console.log()

    // Group senses by vocab_id
    const sensesByVocab = new Map<number, SenseRow[]>()
    for (const s of allSenses) {
        if (!sensesByVocab.has(s.vocabulary_id)) sensesByVocab.set(s.vocabulary_id, [])
        sensesByVocab.get(s.vocabulary_id)!.push(s)
    }

    // Helper: build sorted entries from a set of vocab IDs
    function buildEntries(vocabIds: Iterable<number>): Array<{ vocab: VocabInfo; senses: SenseRow[] }> {
        const entries: Array<{ vocab: VocabInfo; senses: SenseRow[] }> = []
        for (const vid of vocabIds) {
            const vocab = vocabMap.get(vid)
            const senses = sensesByVocab.get(vid)
            if (vocab && senses) {
                entries.push({ vocab, senses: senses.sort((a, b) => a.sense_index - b.sense_index) })
            }
        }
        entries.sort((a, b) => a.vocab.primary_word.localeCompare(b.vocab.primary_word))
        return entries
    }

    // ── Section 1: Đại từ (pn) ─────────────────────────────────
    console.log("─".repeat(72))
    console.log("[1] ĐẠI TỪ — part_of_speech chứa 'pn'")
    console.log()

    const pnVocabIds = new Set<number>()
    for (const s of allSenses) {
        if (s.part_of_speech?.includes("pn")) pnVocabIds.add(s.vocabulary_id)
    }
    const pnEntries = buildEntries(pnVocabIds)
    console.log(`  Tổng: ${pnVocabIds.size} từ\n`)
    printEntries(pnEntries)

    // ── Section 2: Đại từ chỉ thị + nghi vấn từ (kosoado) ────
    console.log("─".repeat(72))
    console.log("[2] ĐẠI TỪ CHỈ THỊ & NGHI VẤN TỪ (danh sách cứng)")
    console.log()

    // Build lookup: word/kana → vocab_ids
    const wordToIds = new Map<string, number[]>()
    for (const [id, v] of vocabMap) {
        for (const key of [v.primary_word, v.primary_kana]) {
            if (!wordToIds.has(key)) wordToIds.set(key, [])
            wordToIds.get(key)!.push(id)
        }
    }

    const targetIds = new Set<number>()
    for (const word of ALL_TARGET_WORDS) {
        for (const id of wordToIds.get(word) ?? []) targetIds.add(id)
    }

    const targetEntries = buildEntries(targetIds)
    console.log(`  Tổng: ${targetIds.size} từ trong DB (từ ${ALL_TARGET_WORDS.size} từ tìm kiếm)\n`)
    printEntries(targetEntries)

    // ── Section 3: Trạng từ (adv / adv-to) — chỉ N5/N4/N3 ───
    console.log("─".repeat(72))
    console.log(`[3] TRẠNG TỪ — part_of_speech chứa 'adv' hoặc 'adv-to' (chỉ JLPT N5–N3)`)
    console.log()

    const advVocabIds = new Set<number>()
    for (const s of allSenses) {
        if (s.part_of_speech?.includes("adv") || s.part_of_speech?.includes("adv-to")) {
            const vocab = vocabMap.get(s.vocabulary_id)
            if (vocab && ADV_JLPT_FILTER.has(vocab.jlpt ?? "")) {
                advVocabIds.add(s.vocabulary_id)
            }
        }
    }
    const advEntries = buildEntries(advVocabIds)

    // Count all adverbs (not just filtered)
    const advAllCount = new Set(
        allSenses.filter(s => s.part_of_speech?.includes("adv") || s.part_of_speech?.includes("adv-to"))
            .map(s => s.vocabulary_id)
    ).size
    console.log(`  Tổng adv trong DB: ${advAllCount} từ (hiển thị N5/N4/N3: ${advVocabIds.size} từ)\n`)
    printEntries(advEntries)

    // ── Summary ────────────────────────────────────────────────
    console.log("=".repeat(72))
    console.log("TỔNG KẾT")
    console.log(`  [1] Đại từ (pn):                 ${pnVocabIds.size} từ trong DB`)
    console.log(`  [2] Đại từ chỉ thị + nghi vấn:   ${targetIds.size} từ trong DB`)
    console.log(`  [3] Trạng từ (toàn bộ):          ${advAllCount} từ  (đang hiển thị N5–N3: ${advVocabIds.size} từ)`)
    console.log("=".repeat(72))
}

main().catch(e => { console.error(e); process.exit(1) })
