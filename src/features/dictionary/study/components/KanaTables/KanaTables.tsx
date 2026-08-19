"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import styles from "./KanaTables.module.css"

type Cell     = [string, string] | null // [kana, romaji]
type Row      = { label: string; cells: Cell[] }
type YoonRow  = { label: string; cells: [string, string][] } // 3 cells: ya/yu/yo
type KanaSection = "seion" | "dakuten" | "yoon"

/* ── Dữ liệu 五十音 ────────────────────────────────────── */

const COL_HEADERS      = ["a",  "i",  "u",  "e",  "o"]
const YOON_COL_HEADERS = ["ya", "yu", "yo"]

const HIRA_SEION: Row[] = [
    { label: "",  cells: [["あ","a"],  ["い","i"],   ["う","u"],   ["え","e"],  ["お","o"]]  },
    { label: "k", cells: [["か","ka"], ["き","ki"],  ["く","ku"],  ["け","ke"], ["こ","ko"]] },
    { label: "s", cells: [["さ","sa"], ["し","shi"], ["す","su"],  ["せ","se"], ["そ","so"]] },
    { label: "t", cells: [["た","ta"], ["ち","chi"], ["つ","tsu"], ["て","te"], ["と","to"]] },
    { label: "n", cells: [["な","na"], ["に","ni"],  ["ぬ","nu"],  ["ね","ne"], ["の","no"]] },
    { label: "h", cells: [["は","ha"], ["ひ","hi"],  ["ふ","fu"],  ["へ","he"], ["ほ","ho"]] },
    { label: "m", cells: [["ま","ma"], ["み","mi"],  ["む","mu"],  ["め","me"], ["も","mo"]] },
    { label: "y", cells: [["や","ya"], null,         ["ゆ","yu"],  null,        ["よ","yo"]] },
    { label: "r", cells: [["ら","ra"], ["り","ri"],  ["る","ru"],  ["れ","re"], ["ろ","ro"]] },
    { label: "w", cells: [["わ","wa"], null,         null,         null,        ["を","wo"]] },
    { label: "n", cells: [["ん","n"],  null,         null,         null,        null]        },
]

const HIRA_DAKUTEN: Row[] = [
    { label: "g", cells: [["が","ga"], ["ぎ","gi"], ["ぐ","gu"], ["げ","ge"], ["ご","go"]] },
    { label: "z", cells: [["ざ","za"], ["じ","ji"], ["ず","zu"], ["ぜ","ze"], ["ぞ","zo"]] },
    { label: "d", cells: [["だ","da"], ["ぢ","di"], ["づ","du"], ["で","de"], ["ど","do"]] },
    { label: "b", cells: [["ば","ba"], ["び","bi"], ["ぶ","bu"], ["べ","be"], ["ぼ","bo"]] },
    { label: "p", cells: [["ぱ","pa"], ["ぴ","pi"], ["ぷ","pu"], ["ぺ","pe"], ["ぽ","po"]] },
]

const HIRA_YOON: YoonRow[] = [
    { label: "き", cells: [["きゃ","kya"], ["きゅ","kyu"], ["きょ","kyo"]] },
    { label: "し", cells: [["しゃ","sha"], ["しゅ","shu"], ["しょ","sho"]] },
    { label: "ち", cells: [["ちゃ","cha"], ["ちゅ","chu"], ["ちょ","cho"]] },
    { label: "に", cells: [["にゃ","nya"], ["にゅ","nyu"], ["にょ","nyo"]] },
    { label: "ひ", cells: [["ひゃ","hya"], ["ひゅ","hyu"], ["ひょ","hyo"]] },
    { label: "み", cells: [["みゃ","mya"], ["みゅ","myu"], ["みょ","myo"]] },
    { label: "り", cells: [["りゃ","rya"], ["りゅ","ryu"], ["りょ","ryo"]] },
    { label: "ぎ", cells: [["ぎゃ","gya"], ["ぎゅ","gyu"], ["ぎょ","gyo"]] },
    { label: "じ", cells: [["じゃ","ja"],  ["じゅ","ju"],  ["じょ","jo"]]  },
    { label: "び", cells: [["びゃ","bya"], ["びゅ","byu"], ["びょ","byo"]] },
    { label: "ぴ", cells: [["ぴゃ","pya"], ["ぴゅ","pyu"], ["ぴょ","pyo"]] },
]

const KATA_SEION: Row[] = [
    { label: "",  cells: [["ア","a"],  ["イ","i"],   ["ウ","u"],   ["エ","e"],  ["オ","o"]]  },
    { label: "k", cells: [["カ","ka"], ["キ","ki"],  ["ク","ku"],  ["ケ","ke"], ["コ","ko"]] },
    { label: "s", cells: [["サ","sa"], ["シ","shi"], ["ス","su"],  ["セ","se"], ["ソ","so"]] },
    { label: "t", cells: [["タ","ta"], ["チ","chi"], ["ツ","tsu"], ["テ","te"], ["ト","to"]] },
    { label: "n", cells: [["ナ","na"], ["ニ","ni"],  ["ヌ","nu"],  ["ネ","ne"], ["ノ","no"]] },
    { label: "h", cells: [["ハ","ha"], ["ヒ","hi"],  ["フ","fu"],  ["ヘ","he"], ["ホ","ho"]] },
    { label: "m", cells: [["マ","ma"], ["ミ","mi"],  ["ム","mu"],  ["メ","me"], ["モ","mo"]] },
    { label: "y", cells: [["ヤ","ya"], null,         ["ユ","yu"],  null,        ["ヨ","yo"]] },
    { label: "r", cells: [["ラ","ra"], ["リ","ri"],  ["ル","ru"],  ["レ","re"], ["ロ","ro"]] },
    { label: "w", cells: [["ワ","wa"], null,         null,         null,        ["ヲ","wo"]] },
    { label: "n", cells: [["ン","n"],  null,         null,         null,        null]        },
]

const KATA_DAKUTEN: Row[] = [
    { label: "g", cells: [["ガ","ga"], ["ギ","gi"], ["グ","gu"], ["ゲ","ge"], ["ゴ","go"]] },
    { label: "z", cells: [["ザ","za"], ["ジ","ji"], ["ズ","zu"], ["ゼ","ze"], ["ゾ","zo"]] },
    { label: "d", cells: [["ダ","da"], ["ヂ","di"], ["ヅ","du"], ["デ","de"], ["ド","do"]] },
    { label: "b", cells: [["バ","ba"], ["ビ","bi"], ["ブ","bu"], ["ベ","be"], ["ボ","bo"]] },
    { label: "p", cells: [["パ","pa"], ["ピ","pi"], ["プ","pu"], ["ペ","pe"], ["ポ","po"]] },
]

const KATA_YOON: YoonRow[] = [
    { label: "キ", cells: [["キャ","kya"], ["キュ","kyu"], ["キョ","kyo"]] },
    { label: "シ", cells: [["シャ","sha"], ["シュ","shu"], ["ショ","sho"]] },
    { label: "チ", cells: [["チャ","cha"], ["チュ","chu"], ["チョ","cho"]] },
    { label: "ニ", cells: [["ニャ","nya"], ["ニュ","nyu"], ["ニョ","nyo"]] },
    { label: "ヒ", cells: [["ヒャ","hya"], ["ヒュ","hyu"], ["ヒョ","hyo"]] },
    { label: "ミ", cells: [["ミャ","mya"], ["ミュ","myu"], ["ミョ","myo"]] },
    { label: "リ", cells: [["リャ","rya"], ["リュ","ryu"], ["リョ","ryo"]] },
    { label: "ギ", cells: [["ギャ","gya"], ["ギュ","gyu"], ["ギョ","gyo"]] },
    { label: "ジ", cells: [["ジャ","ja"],  ["ジュ","ju"],  ["ジョ","jo"]]  },
    { label: "ビ", cells: [["ビャ","bya"], ["ビュ","byu"], ["ビョ","byo"]] },
    { label: "ピ", cells: [["ピャ","pya"], ["ピュ","pyu"], ["ピョ","pyo"]] },
]

/* ── TTS ────────────────────────────────────────────────── */

function speakKana(kana: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(kana)
    utter.lang = "ja-JP"
    utter.rate = 0.85
    window.speechSynthesis.speak(utter)
}

/* ── Sub-components ────────────────────────────────────── */

function KanaTable({ rows }: { rows: Row[] }) {
    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.cornerCell} />
                        {COL_HEADERS.map((h) => (
                            <th key={h} className={styles.colHeader}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, ri) => (
                        <tr key={ri}>
                            <td className={styles.rowHeader}>{row.label}</td>
                            {row.cells.map((cell, ci) =>
                                cell ? (
                                    <td
                                        key={ci}
                                        className={styles.cell}
                                        onClick={() => speakKana(cell[0])}
                                        title={cell[1]}
                                    >
                                        <span className={styles.kana}>{cell[0]}</span>
                                        <span className={styles.romaji}>{cell[1]}</span>
                                    </td>
                                ) : (
                                    <td key={ci} className={`${styles.cell} ${styles.empty}`} />
                                )
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function YoonTable({ rows }: { rows: YoonRow[] }) {
    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.cornerCell} />
                        {YOON_COL_HEADERS.map((h) => (
                            <th key={h} className={styles.colHeader}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, ri) => (
                        <tr key={ri}>
                            <td className={styles.rowHeader}>
                                <span className={styles.yoonRowLabel}>{row.label}</span>
                            </td>
                            {row.cells.map((cell, ci) => (
                                <td
                                    key={ci}
                                    className={styles.cell}
                                    onClick={() => speakKana(cell[0])}
                                    title={cell[1]}
                                >
                                    <span className={styles.kana}>{cell[0]}</span>
                                    <span className={styles.romaji}>{cell[1]}</span>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const SECTION_TABS: { id: KanaSection; label: string; jpLabel: string }[] = [
    { id: "seion",   label: "Âm cơ bản", jpLabel: "清音"       },
    { id: "dakuten", label: "Biến âm",   jpLabel: "濁音・半濁音" },
    { id: "yoon",    label: "Âm ghép",   jpLabel: "拗音"       },
]

function KanaCard({
    title,
    subtitle,
    seion,
    dakuten,
    yoon,
    accentColor,
}: {
    title: string
    subtitle: string
    seion: Row[]
    dakuten: Row[]
    yoon: YoonRow[]
    accentColor: string
}) {
    const [section, setSection] = useState<KanaSection>("seion")

    return (
        <div className={styles.card} style={{ "--card-accent": accentColor } as React.CSSProperties}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleRow}>
                    <h2 className={styles.cardTitle}>{title}</h2>
                    <span className={styles.cardSubtitle}>{subtitle}</span>
                </div>
            </div>

            <div className={styles.tabStrip} role="tablist">
                {SECTION_TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={section === t.id}
                        className={`${styles.tabBtn} ${section === t.id ? styles.tabBtnActive : ""}`}
                        onClick={() => setSection(t.id)}
                    >
                        <span className={styles.tabJp}>{t.label}</span>
                        <span className={styles.tabVi}>{t.jpLabel}</span>
                    </button>
                ))}
            </div>

            <div key={section} className={styles.tableArea}>
                {section === "seion"   && <KanaTable rows={seion} />}
                {section === "dakuten" && <KanaTable rows={dakuten} />}
                {section === "yoon"    && <YoonTable rows={yoon} />}
            </div>
        </div>
    )
}

/* ── Main export ───────────────────────────────────────── */

const OPTIONS = [
    {
        id: "hiragana",
        label: "ひらがな",
        labelSub: "Hiragana",
        desc: "Bảng chữ cơ bản — dùng trong văn bản tiếng Nhật thông thường",
        deco: "あいうえおかきくさしすたちつなにぬはひふ",
        seion: HIRA_SEION, dakuten: HIRA_DAKUTEN, yoon: HIRA_YOON,
        accentColor: "var(--color-primary)",
    },
    {
        id: "katakana",
        label: "カタカナ",
        labelSub: "Katakana",
        desc: "Bảng chữ phiên âm — dùng cho từ ngoại lai và tên riêng",
        deco: "アイウエオカキクサシスタチツナニヌハヒフ",
        seion: KATA_SEION, dakuten: KATA_DAKUTEN, yoon: KATA_YOON,
        accentColor: "var(--color-jlpt-n3)",
    },
] as const

export default function KanaTables({ children }: { children?: React.ReactNode }) {
    const [selected, setSelected] = useState<"hiragana" | "katakana" | null>(null)
    const active = OPTIONS.find((o) => o.id === selected) ?? null

    if (active) {
        return (
            <section className={styles.section}>
                <button type="button" className={styles.backBtn} onClick={() => setSelected(null)}>
                    <ChevronLeft size={15} />
                    Bảng chữ cái
                </button>
                <KanaCard
                    title={active.label}
                    subtitle={active.labelSub}
                    seion={active.seion}
                    dakuten={active.dakuten}
                    yoon={active.yoon}
                    accentColor={active.accentColor}
                />
            </section>
        )
    }

    return (
        <>
            <section className={styles.section}>
                <p className={styles.pickerEyebrow}>Bảng chữ cái tiếng Nhật</p>

                <div className={styles.picker}>
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            className={styles.pickerBtn}
                            style={{ "--accent": opt.accentColor } as React.CSSProperties}
                            onClick={() => setSelected(opt.id)}
                        >
                            <span className={styles.pickerDeco} aria-hidden="true">{opt.deco}</span>
                            <span className={styles.pickerKana}>{opt.label}</span>
                            <span className={styles.pickerSub}>{opt.labelSub}</span>
                            <p className={styles.pickerDesc}>{opt.desc}</p>
                            <span className={styles.pickerArrow}>Xem bảng chữ →</span>
                        </button>
                    ))}
                </div>
            </section>

            {children}
        </>
    )
}
