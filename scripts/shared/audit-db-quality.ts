/**
 * Audit chất lượng DB vocabulary_senses — đọc trực tiếp Supabase.
 * Dùng targeted queries theo từng pattern để tránh timeout.
 *
 * Chạy: npx tsx --env-file=.env.local scripts/shared/audit-db-quality.ts
 */

import { supabaseAdmin } from "@/server/supabase/admin"

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 1000
const MAX_SHOW = 50

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type SenseRow = {
    id: number
    vocabulary_id: number
    sense_index: number
    meaning_vi: string
    meaning_en: string | null
    part_of_speech: string[] | null
}

type VocabInfo = { word: string; kana: string; jlpt: string | null }

type Issue = {
    id: number
    word: string
    kana: string
    jlpt: string | null
    sense_index: number
    meaning_vi: string
    meaning_en: string | null
    note: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Whitelist — từ hợp lệ sau "để" và "một"
// ─────────────────────────────────────────────────────────────────────────────
const DE_WHITELIST = new Set([
    "lại","ý","dành","tang","mặc","trống","nguyên","yên",
    "không","bụng","răng","chân","đó","riêng","nên","mà",
    "thì","cho","cạnh","trong","ngoài","gần","xa",
    "trước","sau","trên","dưới","giữa","cùng","với",
    "lộ","ngỏ","cử","đặt","sẵn","một","phòng","giải",
    "đảm","tránh","tự","bảo","hỗ","kỷ","quyết","chứng",
    "trình","phát","xác","kiểm","chế","vận","quản","thực",
    "ngăn","tạo","đạt","hoàn","thúc","thu","tiếp","đưa",
    "khắc","phục","ý","lại","nhường","kệ","mặc","yên",
])

const MOT_WHITELIST = new Set([
    "lần","mình","chút","số","ít","vài","cách","phần",
    "loạt","thứ","khi","lúc","ai","điều","việc","ngày",
    "năm","giờ","phút","giây","tháng","tuần","mặt","bên",
    "loại","tập","bộ","nhóm","dạng","hướng","chiều",
    "trăm","nghìn","triệu","kiểu","đoạn","bài","cuốn","quyển",
    "mình","thứ","dạng","cách","đơn","lần","chút","ít",
])

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function stripTrailingPunct(s: string): string {
    return s.replace(/[;,.\s()（）「」【】]+$/, "").toLowerCase()
}

function firstTokenOf(str: string): string {
    return stripTrailingPunct(str.split(/\s+/)[0] ?? "")
}

function hasDedup(meaning: string): string[] {
    const segs = meaning.split(";").map(s => s.trim().toLowerCase()).filter(Boolean)
    const seen = new Set<string>()
    const dups: string[] = []
    for (const s of segs) {
        if (seen.has(s)) dups.push(s)
        else seen.add(s)
    }
    return dups
}

// ─────────────────────────────────────────────────────────────────────────────
// Vocab map
// ─────────────────────────────────────────────────────────────────────────────
async function loadVocabMap(): Promise<Map<number, VocabInfo>> {
    const map = new Map<number, VocabInfo>()
    let from = 0
    process.stdout.write("Loading vocabs")
    while (true) {
        const { data, error } = await supabaseAdmin
            .from("vocabularies")
            .select("id, primary_word, primary_kana, jlpt")
            .range(from, from + PAGE_SIZE - 1)
            .order("id")
        if (error) throw new Error(`vocab: ${error.message}`)
        if (!data || data.length === 0) break
        for (const v of data) {
            map.set(v.id, { word: v.primary_word, kana: v.primary_kana, jlpt: v.jlpt })
        }
        process.stdout.write(".")
        from += PAGE_SIZE
        if (data.length < PAGE_SIZE) break
    }
    console.log(` ${map.size.toLocaleString()} từ`)
    return map
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch helper — paginate a filtered query
// ─────────────────────────────────────────────────────────────────────────────
async function fetchFiltered(
    vocabMap: Map<number, VocabInfo>,
    filter: (q: ReturnType<typeof supabaseAdmin.from>) => ReturnType<typeof supabaseAdmin.from>,
    label: string,
): Promise<SenseRow[]> {
    const rows: SenseRow[] = []
    let from = 0
    process.stdout.write(`  Querying ${label}`)
    while (true) {
        const base = supabaseAdmin
            .from("vocabulary_senses")
            .select("id, vocabulary_id, sense_index, meaning_vi, meaning_en, part_of_speech")
            .eq("is_hidden", false)
        const q = filter(base as any) as any
        const { data, error } = await q.range(from, from + PAGE_SIZE - 1).order("id")
        if (error) throw new Error(`${label}: ${error.message}`)
        if (!data || data.length === 0) break
        rows.push(...data)
        process.stdout.write(".")
        from += PAGE_SIZE
        if (data.length < PAGE_SIZE) break
    }
    console.log(` → ${rows.length}`)
    return rows
}

function toIssue(row: SenseRow, vocabMap: Map<number, VocabInfo>, note: string): Issue {
    const v = vocabMap.get(row.vocabulary_id)
    return {
        id: row.id,
        word: v?.word ?? "?",
        kana: v?.kana ?? "?",
        jlpt: v?.jlpt ?? null,
        sense_index: row.sense_index,
        meaning_vi: row.meaning_vi,
        meaning_en: row.meaning_en,
        note,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Print
// ─────────────────────────────────────────────────────────────────────────────
function printSection(title: string, issues: Issue[]) {
    const icon = issues.length === 0 ? "✓" : issues.length < 10 ? "⚠" : "✗"
    console.log(`\n${icon} ${title}: ${issues.length}`)
    if (issues.length === 0) { console.log("    Không có lỗi"); return }
    const show = issues.slice(0, MAX_SHOW)
    for (const i of show) {
        const w = `${i.word}(${i.kana})`.padEnd(20)
        const idx = `[s${i.sense_index}]`.padEnd(5)
        const vi = i.meaning_vi.length > 90 ? i.meaning_vi.slice(0, 87) + "…" : i.meaning_vi
        console.log(`    [${i.id}] ${w} ${idx} ${vi}`)
        if (i.note && i.note !== "de_prefix" && i.note !== "mot_prefix" && i.note !== "dedup" && i.note !== "too_long") {
            console.log(`          EN: ${(i.meaning_en ?? "").slice(0, 80)}`)
        }
        if (i.note.startsWith("dup:")) {
            console.log(`          ${i.note}`)
        }
    }
    if (issues.length > MAX_SHOW) console.log(`    … và ${issues.length - MAX_SHOW} trường hợp nữa`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
    console.log("=".repeat(70))
    console.log("AUDIT CHẤT LƯỢNG DB — vocabulary_senses (visible only)")
    console.log("=".repeat(70))

    const vocabMap = await loadVocabMap()

    // ── 1. Tổng quan ─────────────────────────────────────────────────────────
    console.log("\n[0] TỔNG QUAN")
    const { count: totalVisible } = await supabaseAdmin
        .from("vocabulary_senses")
        .select("*", { count: "exact", head: true })
        .eq("is_hidden", false)
    const { count: totalHidden } = await supabaseAdmin
        .from("vocabulary_senses")
        .select("*", { count: "exact", head: true })
        .eq("is_hidden", true)
    const { count: visibleNoVi } = await supabaseAdmin
        .from("vocabulary_senses")
        .select("*", { count: "exact", head: true })
        .eq("is_hidden", false)
        .is("meaning_vi", null)
    console.log(`  Visible senses: ${(totalVisible ?? 0).toLocaleString()}`)
    console.log(`  Hidden senses:  ${(totalHidden ?? 0).toLocaleString()}`)
    console.log(`  Visible thiếu meaning_vi: ${(visibleNoVi ?? 0).toLocaleString()}`)

    // JLPT distribution
    for (const lvl of ["N5","N4","N3","N2","N1"]) {
        const { count } = await supabaseAdmin
            .from("vocabulary_senses")
            .select("vocabularies!inner(jlpt)", { count: "exact", head: true })
            .eq("is_hidden", false)
            .eq("vocabularies.jlpt", lvl)
        if (count) console.log(`  ${lvl}: ${count.toLocaleString()} visible senses`)
    }

    // ── 2. Targeted checks ───────────────────────────────────────────────────

    // Check 1: "để X" tiền tố sai
    console.log("\n[1] Kiểm tra tiền tố 'để X' sai")
    const deRows = await fetchFiltered(vocabMap, q => q.ilike("meaning_vi", "để %"), "để%")
    const deIssues: Issue[] = []
    for (const r of deRows) {
        const rest = r.meaning_vi.slice(3)
        const fw = firstTokenOf(rest)
        if (!DE_WHITELIST.has(fw)) {
            deIssues.push(toIssue(r, vocabMap, "de_prefix"))
        }
    }
    printSection("Tiền tố 'để X' sai", deIssues)

    // Check 2: "một X" tiền tố sai
    console.log("\n[2] Kiểm tra tiền tố 'một X' sai")
    const motRows = await fetchFiltered(vocabMap, q => q.ilike("meaning_vi", "một %"), "một%")
    const motIssues: Issue[] = []
    for (const r of motRows) {
        const rest = r.meaning_vi.slice(4)
        const fw = firstTokenOf(rest)
        if (!MOT_WHITELIST.has(fw)) {
            motIssues.push(toIssue(r, vocabMap, "mot_prefix"))
        }
    }
    printSection("Tiền tố 'một X' sai", motIssues)

    // Check 3: Dedup trong segments
    console.log("\n[3] Kiểm tra dedup trong segments")
    const dedupRows = await fetchFiltered(vocabMap, q => q.like("meaning_vi", "%;%"), "%;%")
    const dedupIssues: Issue[] = []
    for (const r of dedupRows) {
        const dups = hasDedup(r.meaning_vi)
        if (dups.length > 0) {
            dedupIssues.push(toIssue(r, vocabMap, `dup: ${dups.join(", ")}`))
        }
    }
    printSection("Dedup segments (A; A)", dedupIssues)

    // Check 4: MT artifacts còn sót
    console.log("\n[4] Kiểm tra MT artifacts còn sót")
    const mtPatterns = [
        "được sử dụng hết",
        "được tiêu thụ",
        "được giảm xuống bằng",
        "trở nên ít hơn",
        "để tấn công ưa thích",
        "chỉ ra rằng điều gì đó",
        "biểu thị việc",
    ]
    const mtIssues: Issue[] = []
    for (const pat of mtPatterns) {
        const rows = await fetchFiltered(vocabMap, q => q.ilike("meaning_vi", `%${pat}%`), `"${pat}"`)
        for (const r of rows) {
            mtIssues.push(toIssue(r, vocabMap, `MT: "${pat}"`))
        }
    }
    printSection("MT artifacts còn sót", mtIssues)

    // Check 5: Tiếng Anh còn sót — scan bằng ILIKE các pattern tiếng Anh điển hình
    // Logic: các cụm tiếng Anh này không bao giờ xuất hiện ở đầu meaning_vi tiếng Việt tự nhiên
    // vì mọi từ tiếng Việt thực đều dùng ký tự có dấu (à á â đ ơ ư...) → dùng ILIKE ASCII pattern là an toàn
    console.log("\n[5] Kiểm tra tiếng Anh còn sót (ILIKE targeted patterns)")
    const EN_PATTERNS = [
        // JMdict description starters
        "used to ", "used for ", "used in ", "used as ", "used when ", "used with ", "used at ",
        "indicates ", "indicating that ", "to indicate ",
        "expressing ", "expresses ", "to express ",
        "denotes ", "denoting ",
        "represents ", "representing ",
        "refers to ", "reference to ", "referring to ",
        "describes ", "describing ",
        // JMdict part-of-speech descriptions
        "the act of ", "the state of ", "the condition of ",
        "a word ", "a term ", "a suffix ", "a prefix ", "a particle ",
        "a counter ", "a conjunction ",
        "colloquial ", "slang for ", "informal ",
        "abbreviation for ", "abbr. ",
        // Typical English explanation starters
        "an expression", "expression used", "expression for",
        "short for ", "short form of ",
        "variant of ", "alternate form",
        "see also ", "see ",
        // MT artifacts không bắt đầu bằng "để"
        "to go ", "to come ", "to do ", "to make ", "to get ", "to put ",
        "to take ", "to give ", "to say ", "to see ", "to know ",
        "to have ", "to be ", "to become ", "to feel ", "to think ",
        "to want ", "to need ", "to like ", "to love ", "to hate ",
        "to show ", "to tell ", "to bring ", "to find ", "to turn ",
        "to move ", "to write ", "to read ", "to speak ", "to hear ",
    ]
    const enIssuesSeen = new Set<number>()
    const enIssues: Issue[] = []
    console.log(`  Scanning ${EN_PATTERNS.length} English patterns...`)
    for (const pat of EN_PATTERNS) {
        const rows = await fetchFiltered(
            vocabMap,
            q => q.ilike("meaning_vi", `${pat}%`),
            `"${pat.trim()}"`
        )
        for (const r of rows) {
            if (enIssuesSeen.has(r.id)) continue
            // Confirm: meaning_vi bắt đầu bằng pattern tiếng Anh (case-insensitive)
            if (!r.meaning_vi.toLowerCase().startsWith(pat.toLowerCase())) continue
            enIssuesSeen.add(r.id)
            enIssues.push(toIssue(r, vocabMap, `EN start: "${pat.trim()}"`))
        }
    }
    // Thêm check: meaning_vi khớp hoàn toàn với meaning_en (chưa dịch)
    // Dùng ilike với chính pattern của meaning_en — thực tế dùng sampling
    // (không cần thiết nếu các check trên đã đủ)
    printSection("Tiếng Anh còn sót", enIssues)

    // Check 5b: Batch scan toàn bộ senses — dùng vocabMap đã load, không join
    // Chỉ scan nếu check 5a tìm thấy ít (để verify)
    if (enIssues.length < 5) {
        console.log("  [5b] Batch scan toàn bộ visible senses (không filter)...")
        const VI_DIACRITICS_RE = /[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềệểễỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐƠƯ]/
        const JAPANESE_RE = /[぀-ヿ一-鿿]/
        let batchFrom = 0
        let batchTotal = 0
        while (true) {
            const { data: batchData, error: batchErr, count } = await supabaseAdmin
                .from("vocabulary_senses")
                .select("id, vocabulary_id, sense_index, meaning_vi, meaning_en, part_of_speech", { count: batchFrom === 0 ? "exact" : undefined })
                .eq("is_hidden", false)
                .not("meaning_vi", "is", null)
                .range(batchFrom, batchFrom + PAGE_SIZE - 1)
                .order("id")
            if (batchErr) { console.log(`  batch error: ${batchErr.message}`); break }
            if (!batchData || batchData.length === 0) break
            if (batchFrom === 0 && count) batchTotal = count
            for (const r of batchData as SenseRow[]) {
                const vi = r.meaning_vi
                if (!vi || vi.length <= 8) continue
                if (VI_DIACRITICS_RE.test(vi) || JAPANESE_RE.test(vi)) continue
                if (enIssuesSeen.has(r.id)) continue
                // Có ít nhất 2 từ ASCII liên tiếp 3+ ký tự
                if (!/[a-z][a-z][a-z]+ [a-z][a-z][a-z]+/i.test(vi)) continue
                // Bỏ qua abbreviation ngắn thuần kỹ thuật
                if (vi.length <= 12 && /^[A-Z0-9\s\-\.\/°]+$/.test(vi)) continue
                enIssuesSeen.add(r.id)
                enIssues.push(toIssue(r, vocabMap, `batch: no-VI-diacritics ${vi.length}c`))
            }
            process.stdout.write(".")
            batchFrom += PAGE_SIZE
            if (batchData.length < PAGE_SIZE) break
        }
        if (batchTotal > 0) console.log(`\n  Đã scan ${batchTotal.toLocaleString()} senses`)
        if (enIssues.length > 0) {
            printSection("Tiếng Anh còn sót (batch scan)", enIssues.filter(i => i.note.startsWith("batch")))
        }
    }

    // Check 6: "chỉ ra rằng" trong từ vựng nội dung (không phải trợ từ)
    console.log("\n[6] Kiểm tra meta-linguistic trong từ nội dung")
    const metaPatterns = [
        "chỉ ra rằng",
        "biểu thị rằng",
        "dùng để chỉ",
    ]
    const metaIssues: Issue[] = []
    for (const pat of metaPatterns) {
        const rows = await fetchFiltered(vocabMap, q => q.ilike("meaning_vi", `%${pat}%`), `"${pat}"`)
        for (const r of rows) {
            const isParticle = (r.part_of_speech ?? []).includes("prt")
            if (!isParticle) {
                metaIssues.push(toIssue(r, vocabMap, `meta: "${pat}"`))
            }
        }
    }
    printSection("Meta-linguistic trong từ nội dung (non-particle)", metaIssues)

    // Check 7: Meaning_vi quá dài (>150 ký tự) — dùng 5+ semicolons làm proxy
    console.log("\n[7] Kiểm tra meaning_vi quá dài (>150 ký tự)")
    const longRows = await fetchFiltered(
        vocabMap,
        q => q.like("meaning_vi", "%;%;%;%;%;%"),
        "5-semicolons"
    )
    const longIssues: Issue[] = longRows
        .filter(r => r.meaning_vi.length > 150)
        .map(r => toIssue(r, vocabMap, `len=${r.meaning_vi.length}`))
    printSection("Meaning_vi quá dài (>150c) — cần review thủ công", longIssues)

    // ── Tổng kết ─────────────────────────────────────────────────────────────
    const allIssues = [deIssues, motIssues, dedupIssues, mtIssues, enIssues, metaIssues]
    const trueErrors = allIssues.reduce((s, a) => s + a.length, 0)

    console.log("\n" + "=".repeat(70))
    console.log(`TỔNG LỖI CẦN FIX:       ${trueErrors}`)
    console.log(`Review thủ công (dài):  ${longIssues.length}`)
    if (trueErrors === 0 && longIssues.length === 0) {
        console.log("✓ DB SẠCH HOÀN TOÀN")
    } else if (trueErrors === 0) {
        console.log("✓ Không có lỗi hệ thống — chỉ có một số nghĩa dài cần review")
    } else if (trueErrors < 20) {
        console.log("⚠ DB cơ bản sạch — Chỉ còn edge case nhỏ, xem xét từng cái")
    } else {
        console.log("✗ Còn vấn đề cần xử lý")
    }
    console.log("=".repeat(70))
}

main().catch(err => {
    console.error("Fatal:", err)
    process.exit(1)
})
