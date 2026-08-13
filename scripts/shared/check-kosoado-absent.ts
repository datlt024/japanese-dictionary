/**
 * Kiểm tra DB cho các từ こそあど còn thiếu entry kana thuần
 * npx tsx --env-file=.env.local scripts/shared/check-kosoado-absent.ts
 */
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/shared/types/database.generated"

const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
)

const TARGETS = ["こっち", "こう", "そっち", "あっち", "どれ", "どっち", "どう"]

async function main() {
    for (const kana of TARGETS) {
        const { data } = await sb
            .from("vocabularies")
            .select("id, primary_word, primary_kana, jlpt")
            .eq("primary_kana", kana)
            .order("id")
        console.log(`\n【${kana}】`)
        for (const v of data ?? []) {
            const { data: senses } = await sb
                .from("vocabulary_senses")
                .select("sense_index, meaning_vi, part_of_speech, is_hidden")
                .eq("vocabulary_id", v.id)
                .order("sense_index")
            const kanaOnly = v.primary_word === v.primary_kana ? "✓ kana-only" : `  kanji: ${v.primary_word}`
            console.log(`  id=${v.id}  [${v.jlpt ?? "—"}]  ${kanaOnly}`)
            for (const s of senses ?? []) {
                const hidden = s.is_hidden ? "[hidden]" : ""
                const pos = (s.part_of_speech ?? []).join(",")
                console.log(`    s${s.sense_index} ${hidden} [${pos}] ${s.meaning_vi?.slice(0,60)}`)
            }
        }
    }
}

main().catch(e => { console.error(e); process.exit(1) })
