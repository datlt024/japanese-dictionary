import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { formatTime, score60, fisher, pickOthers, parseSentence, buildQuestions } from "./exam-utils"
import type { VocabItem, GrammarItem, Section } from "./exam-types"

// ── formatTime ────────────────────────────────────────────────────────────────

describe("formatTime", () => {
    it("formats 0 seconds as 00:00", () => {
        expect(formatTime(0)).toBe("00:00")
    })

    it("formats 65 seconds as 01:05", () => {
        expect(formatTime(65)).toBe("01:05")
    })

    it("formats exactly 60 minutes as 60:00", () => {
        expect(formatTime(3600)).toBe("60:00")
    })

    it("zero-pads single-digit seconds", () => {
        expect(formatTime(9)).toBe("00:09")
    })

    it("zero-pads single-digit minutes", () => {
        expect(formatTime(60)).toBe("01:00")
    })

    it("handles large values", () => {
        expect(formatTime(5940)).toBe("99:00")
    })
})

// ── score60 ───────────────────────────────────────────────────────────────────

describe("score60", () => {
    it("returns 60 for perfect score", () => {
        expect(score60(20, 20)).toBe(60)
    })

    it("returns 0 for zero correct", () => {
        expect(score60(0, 20)).toBe(0)
    })

    it("returns 0 when total is 0 (avoid division by zero)", () => {
        expect(score60(0, 0)).toBe(0)
    })

    it("rounds to nearest integer", () => {
        // 7/20 × 60 = 21.0 exactly
        expect(score60(7, 20)).toBe(21)
    })

    it("returns 30 for half correct", () => {
        expect(score60(10, 20)).toBe(30)
    })

    it("rounds 0.5 up", () => {
        // 1/40 × 60 = 1.5 → rounds to 2
        expect(score60(1, 40)).toBe(2)
    })
})

// ── fisher ────────────────────────────────────────────────────────────────────

describe("fisher", () => {
    it("returns an array of the same length", () => {
        const input = [1, 2, 3, 4, 5]
        expect(fisher(input)).toHaveLength(5)
    })

    it("contains the same elements as the input", () => {
        const input = ["a", "b", "c", "d"]
        const result = fisher(input)
        expect([...result].sort()).toEqual([...input].sort())
    })

    it("does not mutate the original array", () => {
        const input = [1, 2, 3]
        const original = [...input]
        fisher(input)
        expect(input).toEqual(original)
    })

    it("handles an empty array", () => {
        expect(fisher([])).toEqual([])
    })

    it("handles a single-element array", () => {
        expect(fisher([42])).toEqual([42])
    })
})

// ── pickOthers ────────────────────────────────────────────────────────────────

describe("pickOthers", () => {
    const pool = ["apple", "banana", "cherry", "date", "elderberry"]

    it("returns n items by default (3)", () => {
        const result = pickOthers(pool, "apple")
        expect(result).toHaveLength(3)
    })

    it("never includes the correct answer", () => {
        const result = pickOthers(pool, "apple")
        expect(result).not.toContain("apple")
    })

    it("does not contain duplicates", () => {
        const result = pickOthers(pool, "apple")
        expect(new Set(result).size).toBe(result.length)
    })

    it("fills with '—' when pool is too small", () => {
        const small = ["only"]
        const result = pickOthers(small, "something", 3)
        // pool has 1 item, correct is different — 1 real + 2 fillers
        expect(result.filter(x => x === "—")).toHaveLength(2)
    })

    it("respects custom n parameter", () => {
        const result = pickOthers(pool, "apple", 2)
        expect(result).toHaveLength(2)
    })

    it("excludes correct even when it appears in pool", () => {
        const result = pickOthers(["apple", "banana", "cherry"], "apple", 2)
        expect(result).not.toContain("apple")
        expect(result).toHaveLength(2)
    })
})

// ── parseSentence ─────────────────────────────────────────────────────────────

describe("parseSentence", () => {
    it("renders plain text without markup unchanged", () => {
        const node = parseSentence("日本語")
        const html = renderToStaticMarkup(node as React.ReactElement)
        expect(html).toBe("日本語")
    })

    it("wraps [word] in a <mark> element", () => {
        const node = parseSentence("これは[テスト]です")
        const html = renderToStaticMarkup(node as React.ReactElement)
        expect(html).toContain("<mark")
        expect(html).toContain("テスト")
    })

    it("renders <u>text</u> as an underline element", () => {
        const node = parseSentence("これは<u>重要</u>です")
        const html = renderToStaticMarkup(node as React.ReactElement)
        expect(html).toContain("<u>重要</u>")
    })

    it("handles multiple marked sections", () => {
        const node = parseSentence("[A]と[B]")
        const html = renderToStaticMarkup(node as React.ReactElement)
        const markCount = (html.match(/<mark/g) ?? []).length
        expect(markCount).toBe(2)
    })

    it("preserves surrounding text alongside markup", () => {
        const node = parseSentence("前[単語]後")
        const html = renderToStaticMarkup(node as React.ReactElement)
        expect(html).toContain("前")
        expect(html).toContain("後")
        expect(html).toContain("単語")
    })
})

// ── buildQuestions ────────────────────────────────────────────────────────────

const mockVocab: VocabItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    word: `単語${i}`,
    kana: `かな${i}`,
    meaning: `nghĩa ${i}`,
}))

const mockGrammar: GrammarItem[] = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    pattern: `パターン${i}`,
    meaning: `ý nghĩa ${i}`,
}))

const mockSections: Section[] = [
    {
        id: "vocab",
        title: "Từ vựng",
        titleVi: "Từ vựng",
        allocMin: 35,
        groups: [
            { id: "g1", label: "問題1", sublabel: "漢字読み", type: "kanji_reading", count: 3 },
            { id: "g2", label: "問題2", sublabel: "意味", type: "context_vocab", count: 2 },
        ],
    },
]

describe("buildQuestions", () => {
    it("generates the correct total question count", () => {
        const questions = buildQuestions(mockVocab, mockGrammar, mockSections)
        // 3 kanji_reading + 2 context_vocab = 5
        expect(questions).toHaveLength(5)
    })

    it("assigns the correct sectionId to each question", () => {
        const questions = buildQuestions(mockVocab, mockGrammar, mockSections)
        expect(questions.every(q => q.sectionId === "vocab")).toBe(true)
    })

    it("assigns the correct groupId", () => {
        const questions = buildQuestions(mockVocab, mockGrammar, mockSections)
        const g1Qs = questions.filter(q => q.groupId === "g1")
        const g2Qs = questions.filter(q => q.groupId === "g2")
        expect(g1Qs).toHaveLength(3)
        expect(g2Qs).toHaveLength(2)
    })

    it("each question has exactly 4 options", () => {
        const questions = buildQuestions(mockVocab, mockGrammar, mockSections)
        expect(questions.every(q => q.options.length === 4)).toBe(true)
    })

    it("correctIndex points to the correct answer in options", () => {
        const questions = buildQuestions(mockVocab, mockGrammar, mockSections)
        for (const q of questions) {
            expect(q.correctIndex).toBeGreaterThanOrEqual(0)
            expect(q.correctIndex).toBeLessThan(4)
        }
    })

    it("grammar_blank type uses grammar items", () => {
        const grammarSections: Section[] = [
            {
                id: "grammar",
                title: "文法",
                titleVi: "Ngữ pháp",
                allocMin: 35,
                groups: [
                    { id: "g3", label: "問題", sublabel: "文法", type: "grammar_blank", count: 2 },
                ],
            },
        ]
        const questions = buildQuestions(mockVocab, mockGrammar, grammarSections)
        expect(questions).toHaveLength(2)
        expect(questions[0].type).toBe("grammar_blank")
    })

    it("returns empty array when sections have no groups", () => {
        const empty: Section[] = [
            { id: "s", title: "T", titleVi: "T", allocMin: 0, groups: [] },
        ]
        expect(buildQuestions(mockVocab, mockGrammar, empty)).toHaveLength(0)
    })
})
