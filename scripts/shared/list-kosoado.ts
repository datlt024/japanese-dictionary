/**
 * Liệt kê đại từ chỉ thị こそあど — chỉ dạng kana thuần (không kanji đồng âm)
 * Chạy: npx tsx --env-file=.env.local scripts/shared/list-kosoado.ts
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/shared/types/database.generated"

const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
)

// ─── Dãy こそあど ─────────────────────────────────────────────────
// Hàng: vật | nơi | hướng (lịch sự) | hướng (thông thường) | cách thức | loại | tính từ
const KOSOADO: Record<string, string[]> = {
    "こ": ["これ", "ここ", "こちら", "こっち", "こう",    "こんな", "こんなに"],
    "そ": ["それ", "そこ", "そちら", "そっち", "そう",    "そんな", "そんなに"],
    "あ": ["あれ", "あそこ","あちら", "あっち", "ああ",    "あんな", "あんなに"],
    "ど": ["どれ", "どこ", "どちら", "どっち", "どう",    "どんな", "どんなに"],
}

const ALL_WORDS = Object.values(KOSOADO).flat()

async function main() {
    console.log("=".repeat(70))
    console.log("DÃY こそあど — đại từ chỉ thị tiếng Nhật")
    console.log("=".repeat(70))
    console.log()

    // Fetch vocabularies WHERE primary_word = primary_kana AND primary_kana IN list
    const { data: vocabs, error: ve } = await sb
        .from("vocabularies")
        .select("id, primary_word, primary_kana, jlpt")
        .in("primary_kana", ALL_WORDS)
        .order("primary_kana")
    if (ve) throw new Error(ve.message)

    // Chỉ giữ các entry kana thuần (primary_word = primary_kana)
    const filtered = (vocabs ?? []).filter(v => v.primary_word === v.primary_kana)

    // Fetch senses
    const vocabIds = filtered.map(v => v.id)
    const { data: senses, error: se } = await sb
        .from("vocabulary_senses")
        .select("vocabulary_id, sense_index, meaning_vi, part_of_speech, is_hidden")
        .in("vocabulary_id", vocabIds)
        .eq("is_hidden", false)
        .order("vocabulary_id,sense_index")
    if (se) throw new Error(se.message)

    const senseMap = new Map<number, typeof senses>()
    for (const s of senses ?? []) {
        if (!senseMap.has(s.vocabulary_id)) senseMap.set(s.vocabulary_id, [])
        senseMap.get(s.vocabulary_id)!.push(s)
    }

    // In theo thứ tự こ→そ→あ→ど, từng hàng trong mỗi series
    const columns = ["vật", "nơi", "hướng (lịch)", "hướng", "cách thức", "loại", "bao nhiêu"]

    for (const [series, words] of Object.entries(KOSOADO)) {
        console.log("─".repeat(70))
        console.log(`【${series}系】`)
        for (let i = 0; i < words.length; i++) {
            const word = words[i]
            const col = columns[i] ?? ""
            const vocab = filtered.find(v => v.primary_kana === word)
            if (!vocab) {
                console.log(`  ${word.padEnd(8)} [${col}] — không có trong DB`)
                continue
            }
            const ss = senseMap.get(vocab.id) ?? []
            const jlpt = vocab.jlpt ?? "—"
            console.log()
            console.log(`  ${word} [${jlpt}]  ← ${col}`)
            for (const s of ss) {
                const pos = (s.part_of_speech ?? []).join(",")
                const vi = s.meaning_vi ?? "(null)"
                const shortVI = vi.length > 65 ? vi.slice(0, 64) + "…" : vi
                console.log(`    s${s.sense_index}  [${pos}]  ${shortVI}`)
            }
        }
        console.log()
    }
    console.log("=".repeat(70))
}

main().catch(e => { console.error(e); process.exit(1) })
