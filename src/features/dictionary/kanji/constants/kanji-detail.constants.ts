export type KanjiDetailLanguage = "vi" | "en"

export type KanjiVocabularyByReadingGroup = {
    type: "ON" | "KUN"
    reading: string
    words: {
        word: string
        kana: string
        hanViet: string
        meaningVi: string
        meaningEn: string
    }[]
}

export type KanjiExample = {
    jp: string
    vi: string
    en: string
}

export const DEFAULT_HAN_VIET = ["TIẾU"]

export const DEFAULT_MEANINGS_VI = [
    "cười",
    "nụ cười",
    "làm cho cười, làm vui",
]

export const DEFAULT_MEANINGS_EN = [
    "laugh",
    "smile",
    "to make someone laugh",
]

export const DEFAULT_ONYOMI = ["ショウ"]

export const DEFAULT_KUNYOMI = ["わらう", "えむ"]

export const DEFAULT_VOCABULARY_BY_READING: KanjiVocabularyByReadingGroup[] = [
    {
        type: "ON",
        reading: "ショウ",
        words: [
            {
                word: "微笑",
                kana: "びしょう",
                hanViet: "VI TIẾU",
                meaningVi: "nụ cười nhẹ",
                meaningEn: "slight smile",
            },
            {
                word: "失笑",
                kana: "しっしょう",
                hanViet: "THẤT TIẾU",
                meaningVi: "bật cười",
                meaningEn: "bursting into laughter",
            },
            {
                word: "嘲笑",
                kana: "ちょうしょう",
                hanViet: "TRÀO TIẾU",
                meaningVi: "sự nhạo báng",
                meaningEn: "mockery; ridicule",
            },
            {
                word: "苦笑",
                kana: "くしょう",
                hanViet: "KHỔ TIẾU",
                meaningVi: "nụ cười gượng",
                meaningEn: "wry smile",
            },
        ],
    },
    {
        type: "KUN",
        reading: "わらう",
        words: [
            {
                word: "笑う",
                kana: "わらう",
                hanViet: "TIẾU",
                meaningVi: "cười",
                meaningEn: "to laugh",
            },
            {
                word: "笑った",
                kana: "わらった",
                hanViet: "TIẾU",
                meaningVi: "đã cười",
                meaningEn: "laughed",
            },
            {
                word: "笑わせる",
                kana: "わらわせる",
                hanViet: "TIẾU",
                meaningVi: "làm cho cười",
                meaningEn: "to make someone laugh",
            },
            {
                word: "笑い声",
                kana: "わらいごえ",
                hanViet: "TIẾU THANH",
                meaningVi: "tiếng cười",
                meaningEn: "sound of laughter",
            },
        ],
    },
    {
        type: "KUN",
        reading: "えむ",
        words: [
            {
                word: "笑む",
                kana: "えむ",
                hanViet: "TIẾU",
                meaningVi: "mỉm cười",
                meaningEn: "to smile",
            },
            {
                word: "微笑む",
                kana: "ほほえむ",
                hanViet: "VI TIẾU",
                meaningVi: "mỉm cười",
                meaningEn: "to smile",
            },
            {
                word: "含み笑む",
                kana: "ふくみえむ",
                hanViet: "HÀM TIẾU",
                meaningVi: "cười ẩn ý",
                meaningEn: "to smile meaningfully",
            },
            {
                word: "皮肉に笑む",
                kana: "ひにくにえむ",
                hanViet: "BÌ NHỤC TIẾU",
                meaningVi: "cười mỉa mai",
                meaningEn: "to smile sarcastically",
            },
        ],
    },
]

export const DEFAULT_EXAMPLES: KanjiExample[] = [
    {
        jp: "彼女は優しく笑いました。",
        vi: "Cô ấy đã cười một cách dịu dàng.",
        en: "She smiled gently.",
    },
    {
        jp: "子供たちの笑い声が聞こえます。",
        vi: "Tôi nghe thấy tiếng cười của bọn trẻ.",
        en: "I can hear the children laughing.",
    },
    {
        jp: "その話を聞いて、みんなが笑いました。",
        vi: "Nghe câu chuyện đó, mọi người đều cười.",
        en: "Everyone laughed after hearing that story.",
    },
]

export const DEFAULT_KANJI_ANALYSIS = {
    radical: "竹",
    structure: "竹 + 夭",
    originalMeaning: "miệng hé ra để cười, vui vẻ",
}

export const DEFAULT_MEMORY_TIP_LINES = [
    "Ở trên là bộ “竹” tượng trưng cho hai cây trúc.",
    "Phần dưới gợi hình ảnh cái miệng đang hé ra.",
    "Ghép lại thành hình ảnh một người đang cười.",
]