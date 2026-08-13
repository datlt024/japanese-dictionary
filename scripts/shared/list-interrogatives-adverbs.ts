/**
 * Liệt kê nghi vấn từ và trạng từ N5–N3 từ DB
 * Chạy: npx tsx --env-file=.env.local scripts/shared/list-interrogatives-adverbs.ts
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/shared/types/database.generated"

const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
)

// ── Nghi vấn từ: mỗi entry = [primary_word, primary_kana] ──
// primary_word = primary_kana nghĩa là kana-only entry
const INTERROGATIVES: [string, string][] = [
    ["だれ",   "だれ"],   // ai  (kana-only)
    ["何",     "なに"],   // cái gì
    ["いつ",   "いつ"],   // khi nào (kana-only)
    ["何故",   "なぜ"],   // tại sao
    ["如何して","どうして"], // tại sao / bằng cách nào
    ["如何",   "いかが"], // như thế nào (lịch sự)
    ["いくら", "いくら"], // bao nhiêu (tiền)
    ["幾つ",   "いくつ"], // bao nhiêu (cái/tuổi)
    ["どれくらい","どれくらい"], // bao lâu / bao nhiêu
    ["どれほど","どれほど"], // đến mức nào
    ["何で",   "なんで"], // tại sao (thân mật)
    ["何と",   "なんと"], // thật ra; ôi
    ["何だか", "なんだか"], // không biết tại sao
]

const PAGE_SIZE = 1000

async function fetchAllSenses() {
    const all: Array<{
        vocabulary_id: number
        sense_index: number
        meaning_vi: string | null
        part_of_speech: string[] | null
        is_hidden: boolean | null
    }> = []
    let from = 0
    while (true) {
        const { data, error } = await sb
            .from("vocabulary_senses")
            .select("vocabulary_id, sense_index, meaning_vi, part_of_speech, is_hidden")
            .eq("is_hidden", false)
            .range(from, from + PAGE_SIZE - 1)
        if (error) throw new Error(error.message)
        if (!data || data.length === 0) break
        all.push(...data)
        if (data.length < PAGE_SIZE) break
        from += PAGE_SIZE
    }
    return all
}

async function fetchAllVocabsNJLPT(levels: string[]) {
    // Tải theo từng JLPT level để tránh request quá lớn
    const all: Array<{
        id: number
        primary_word: string
        primary_kana: string | null
        jlpt: string | null
    }> = []
    for (const lvl of levels) {
        let from = 0
        while (true) {
            const { data, error } = await sb
                .from("vocabularies")
                .select("id, primary_word, primary_kana, jlpt")
                .eq("jlpt", lvl)
                .range(from, from + PAGE_SIZE - 1)
            if (error) throw new Error(`${lvl}: ${error.message}`)
            if (!data || data.length === 0) break
            all.push(...data)
            if (data.length < PAGE_SIZE) break
            from += PAGE_SIZE
        }
    }
    return all
}

async function main() {
    console.log("Đang tải tất cả senses…")
    const allSenses = await fetchAllSenses()
    console.log(`Đã tải ${allSenses.length.toLocaleString()} senses.\n`)

    // Index senses theo vocabulary_id
    const senseMap = new Map<number, typeof allSenses>()
    for (const s of allSenses) {
        if (!senseMap.has(s.vocabulary_id)) senseMap.set(s.vocabulary_id, [])
        senseMap.get(s.vocabulary_id)!.push(s)
    }

    // Set vocab_id có pos adv/adv-to
    const advVocabIds = new Set<number>()
    for (const s of allSenses) {
        if (s.part_of_speech?.some(p => p === "adv" || p === "adv-to")) {
            advVocabIds.add(s.vocabulary_id)
        }
    }

    // ── 1. Nghi vấn từ ─────────────────────────────────────
    console.log("=".repeat(70))
    console.log("NGHI VẤN TỪ")
    console.log("=".repeat(70))

    for (const [word, kana] of INTERROGATIVES) {
        // Tìm chính xác theo (primary_word, primary_kana)
        const { data: vocabs } = await sb
            .from("vocabularies")
            .select("id, primary_word, primary_kana, jlpt")
            .eq("primary_word", word)
            .eq("primary_kana", kana)
            .order("id")
            .limit(1)

        const v = vocabs?.[0]
        if (!v) {
            console.log(`\n  ${word} (${kana}) — không tìm thấy trong DB`)
            continue
        }
        const senses = senseMap.get(v.id) ?? []
        const jlpt = v.jlpt ?? "—"
        const pos = [...new Set(senses.flatMap(s => s.part_of_speech ?? []))].join(", ")
        console.log()
        console.log(`  ${v.primary_word} (${v.primary_kana})  [${jlpt}]  pos: ${pos}`)
        for (const s of senses.slice(0, 3)) {
            const vi = (s.meaning_vi ?? "(null)").slice(0, 72)
            console.log(`    s${s.sense_index}: ${vi}`)
        }
    }

    // ── 2. Trạng từ N5–N3 ──────────────────────────────────
    console.log("\n" + "=".repeat(70))
    console.log("TRẠNG TỪ (adv/adv-to) — N5, N4, N3")
    console.log("=".repeat(70))

    console.log("\nĐang tải vocab N5/N4/N3…")
    const allVocabs = await fetchAllVocabsNJLPT(["N5", "N4", "N3"])
    console.log(`Tổng vocab N5-N3: ${allVocabs.length.toLocaleString()}`)

    // Lọc chỉ giữ vocab có pos adv/adv-to
    const advVocabs = allVocabs.filter(v => advVocabIds.has(v.id))
    console.log(`Trong đó có adv/adv-to: ${advVocabs.length}`)

    // Nhóm theo JLPT
    const byLevel: Record<string, typeof advVocabs> = { N5: [], N4: [], N3: [] }
    for (const v of advVocabs) {
        if (v.jlpt && byLevel[v.jlpt]) byLevel[v.jlpt].push(v)
    }

    for (const [lvl, vocabs] of Object.entries(byLevel)) {
        console.log(`\n── ${lvl} (${vocabs.length} từ) ──`)
        const sorted = [...vocabs].sort((a, b) => (a.primary_kana ?? "").localeCompare(b.primary_kana ?? ""))
        for (const v of sorted) {
            const senses = senseMap.get(v.id) ?? []
            const s1 = senses[0]
            if (!s1) continue
            const vi = (s1.meaning_vi ?? "").slice(0, 55)
            const pos = (s1.part_of_speech ?? []).join(",")
            const word = v.primary_word.padEnd(10)
            const kana = (v.primary_kana ?? "").padEnd(12)
            console.log(`  ${word} ${kana}  [${pos}]  ${vi}`)
        }
    }
}

main().catch(e => { console.error(e); process.exit(1) })
