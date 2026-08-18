import DailyVocabularySectionClient from "./DailyVocabularySectionClient"

export type DailyVocabularyItem = {
    word: string
    reading: string
    meaning: string
    type: string
    jlpt: string | null
    vocabularyId: number | undefined
}

type VocabRow = { primary_word: string; id: number; jlpt: string | null }

const WORD_POOL = [
    // ── Nhóm 1 ──
    { word: "情報",   reading: "じょうほう", meaning: "thông tin",              type: "Danh từ" },
    { word: "経験",   reading: "けいけん",   meaning: "kinh nghiệm",            type: "Danh từ" },
    { word: "勉強",   reading: "べんきょう", meaning: "học tập",                type: "Danh từ" },
    { word: "友達",   reading: "ともだち",   meaning: "bạn bè",                 type: "Danh từ" },
    { word: "仕事",   reading: "しごと",     meaning: "công việc",              type: "Danh từ" },
    { word: "旅行",   reading: "りょこう",   meaning: "du lịch",                type: "Danh từ" },
    { word: "自然",   reading: "しぜん",     meaning: "thiên nhiên",            type: "Danh từ" },
    { word: "問題",   reading: "もんだい",   meaning: "vấn đề",                 type: "Danh từ" },
    { word: "言葉",   reading: "ことば",     meaning: "ngôn ngữ, từ ngữ",       type: "Danh từ" },
    { word: "技術",   reading: "ぎじゅつ",   meaning: "kỹ thuật, công nghệ",    type: "Danh từ" },
    { word: "社会",   reading: "しゃかい",   meaning: "xã hội",                 type: "Danh từ" },
    { word: "文化",   reading: "ぶんか",     meaning: "văn hoá",                type: "Danh từ" },
    // ── Nhóm 2 ──
    { word: "時間",   reading: "じかん",     meaning: "thời gian",              type: "Danh từ" },
    { word: "場所",   reading: "ばしょ",     meaning: "địa điểm, nơi chốn",     type: "Danh từ" },
    { word: "気持ち", reading: "きもち",     meaning: "cảm giác, tâm trạng",    type: "Danh từ" },
    { word: "笑顔",   reading: "えがお",     meaning: "khuôn mặt tươi cười",    type: "Danh từ" },
    { word: "夢",     reading: "ゆめ",       meaning: "giấc mơ",                type: "Danh từ" },
    { word: "記念",   reading: "きねん",     meaning: "kỷ niệm",                type: "Danh từ" },
    { word: "約束",   reading: "やくそく",   meaning: "lời hứa, hẹn ước",       type: "Danh từ" },
    { word: "感謝",   reading: "かんしゃ",   meaning: "lòng biết ơn",           type: "Danh từ" },
    { word: "成功",   reading: "せいこう",   meaning: "thành công",             type: "Danh từ" },
    { word: "失敗",   reading: "しっぱい",   meaning: "thất bại",               type: "Danh từ" },
    { word: "準備",   reading: "じゅんび",   meaning: "chuẩn bị",               type: "Danh từ" },
    { word: "計画",   reading: "けいかく",   meaning: "kế hoạch",               type: "Danh từ" },
    // ── Nhóm 3 ──
    { word: "理由",   reading: "りゆう",     meaning: "lý do",                  type: "Danh từ" },
    { word: "意味",   reading: "いみ",       meaning: "ý nghĩa",                type: "Danh từ" },
    { word: "目標",   reading: "もくひょう", meaning: "mục tiêu",               type: "Danh từ" },
    { word: "方法",   reading: "ほうほう",   meaning: "phương pháp, cách",      type: "Danh từ" },
    { word: "会議",   reading: "かいぎ",     meaning: "cuộc họp",               type: "Danh từ" },
    { word: "電車",   reading: "でんしゃ",   meaning: "xe điện",                type: "Danh từ" },
    { word: "道",     reading: "みち",       meaning: "con đường",              type: "Danh từ" },
    { word: "橋",     reading: "はし",       meaning: "cây cầu",                type: "Danh từ" },
    { word: "空港",   reading: "くうこう",   meaning: "sân bay",                type: "Danh từ" },
    { word: "病院",   reading: "びょういん", meaning: "bệnh viện",              type: "Danh từ" },
    { word: "薬",     reading: "くすり",     meaning: "thuốc",                  type: "Danh từ" },
    { word: "料理",   reading: "りょうり",   meaning: "nấu ăn, món ăn",         type: "Danh từ" },
    // ── Nhóm 4 ──
    { word: "音楽",   reading: "おんがく",   meaning: "âm nhạc",                type: "Danh từ" },
    { word: "映画",   reading: "えいが",     meaning: "phim điện ảnh",          type: "Danh từ" },
    { word: "読書",   reading: "どくしょ",   meaning: "việc đọc sách",          type: "Danh từ" },
    { word: "運動",   reading: "うんどう",   meaning: "vận động, tập thể dục",   type: "Danh từ" },
    { word: "散歩",   reading: "さんぽ",     meaning: "đi dạo",                 type: "Danh từ" },
    { word: "買い物", reading: "かいもの",   meaning: "mua sắm",                type: "Danh từ" },
    { word: "掃除",   reading: "そうじ",     meaning: "dọn dẹp",                type: "Danh từ" },
    { word: "洗濯",   reading: "せんたく",   meaning: "giặt đồ",                type: "Danh từ" },
    { word: "料金",   reading: "りょうきん", meaning: "phí, tiền phí",          type: "Danh từ" },
    { word: "値段",   reading: "ねだん",     meaning: "giá cả",                 type: "Danh từ" },
    { word: "給料",   reading: "きゅうりょう", meaning: "lương",               type: "Danh từ" },
    { word: "貯金",   reading: "ちょきん",   meaning: "tiết kiệm tiền",         type: "Danh từ" },
    // ── Nhóm 5 ──
    { word: "嬉しい", reading: "うれしい",   meaning: "vui mừng, hạnh phúc",    type: "Tính từ" },
    { word: "悲しい", reading: "かなしい",   meaning: "buồn bã",                type: "Tính từ" },
    { word: "恥ずかしい", reading: "はずかしい", meaning: "xấu hổ, ngại ngùng", type: "Tính từ" },
    { word: "眠い",   reading: "ねむい",     meaning: "buồn ngủ",               type: "Tính từ" },
    { word: "忙しい", reading: "いそがしい", meaning: "bận rộn",                type: "Tính từ" },
    { word: "正しい", reading: "ただしい",   meaning: "đúng, chính xác",        type: "Tính từ" },
    // ── Nhóm 6 ──
    { word: "頑張る", reading: "がんばる",   meaning: "cố gắng, nỗ lực",        type: "Động từ" },
    { word: "諦める", reading: "あきらめる", meaning: "từ bỏ",                  type: "Động từ" },
    { word: "覚える", reading: "おぼえる",   meaning: "ghi nhớ, học thuộc",     type: "Động từ" },
    { word: "忘れる", reading: "わすれる",   meaning: "quên",                   type: "Động từ" },
    { word: "伝える", reading: "つたえる",   meaning: "truyền đạt, thông báo",  type: "Động từ" },
    { word: "笑う",   reading: "わらう",     meaning: "cười",                   type: "Động từ" },
    { word: "泣く",   reading: "なく",       meaning: "khóc",                   type: "Động từ" },
    { word: "急ぐ",   reading: "いそぐ",     meaning: "vội vàng, hối hả",       type: "Động từ" },
    { word: "続ける", reading: "つづける",   meaning: "tiếp tục",               type: "Động từ" },
    { word: "変わる", reading: "かわる",     meaning: "thay đổi",               type: "Động từ" },
    { word: "決める", reading: "きめる",     meaning: "quyết định",             type: "Động từ" },
    { word: "諦めない", reading: "あきらめない", meaning: "không bỏ cuộc",      type: "Động từ" },
]

const DAILY_COUNT = 12

function getDailyWords() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
    const offset = (dayOfYear * DAILY_COUNT) % WORD_POOL.length
    const result = []
    for (let i = 0; i < DAILY_COUNT; i++) {
        result.push(WORD_POOL[(offset + i) % WORD_POOL.length])
    }
    return result
}

export function buildDailyItems(rows: VocabRow[] | null | undefined): DailyVocabularyItem[] {
    const WORD_CONFIGS = getDailyWords()
    const idMap = new Map<string, number>()
    const jlptMap = new Map<string, string | null>()

    for (const row of rows ?? []) {
        if (!idMap.has(row.primary_word)) {
            idMap.set(row.primary_word, row.id)
            jlptMap.set(row.primary_word, row.jlpt ?? null)
        }
    }

    return WORD_CONFIGS.map((config) => ({
        ...config,
        jlpt: jlptMap.get(config.word) ?? null,
        vocabularyId: idMap.get(config.word),
    }))
}

export function getDailyWordList(): string[] {
    return getDailyWords().map((w) => w.word)
}

export default function DailyVocabularySection({ items }: { items: DailyVocabularyItem[] }) {
    return <DailyVocabularySectionClient items={items} />
}
