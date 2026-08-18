import React from "react"
import type { VocabItem, GrammarItem, Section, Question } from "./exam-types"
import styles from "./MockExamClient.module.css"

export function formatTime(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
}

export function fisher<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export function pickOthers(pool: string[], correct: string, n = 3): string[] {
    const seen = new Set([correct])
    const result: string[] = []
    for (const item of fisher(pool)) {
        if (!seen.has(item) && item) { seen.add(item); result.push(item) }
        if (result.length >= n) break
    }
    while (result.length < n) result.push("—")
    return result
}

export const SENTENCE_TEMPLATES: ((w: string) => string)[] = [
    w => `毎日[${w}]を使います。`,
    w => `あの[${w}]を見ました。`,
    w => `[${w}]に行きましょう。`,
    w => `これは[${w}]です。`,
    w => `[${w}]が好きです。`,
    w => `[${w}]をください。`,
    w => `[${w}]はどこですか。`,
    w => `[${w}]があります。`,
    w => `[${w}]を勉強します。`,
    w => `[${w}]は大切です。`,
    w => `[${w}]で遊びます。`,
    w => `あの[${w}]はきれいです。`,
    w => `[${w}]はいくらですか。`,
    w => `[${w}]を買いました。`,
    w => `[${w}]を食べます。`,
    w => `[${w}]が来ます。`,
]

export function parseSentence(sentence: string): React.ReactNode {
    const parts = sentence.split(/(\[[^\]]+\]|<u>[^<]*<\/u>)/)
    if (parts.length === 1) return React.createElement(React.Fragment, null, sentence)
    return React.createElement(
        React.Fragment,
        null,
        ...parts.map((part, i) => {
            if (part.startsWith("[") && part.endsWith("]"))
                return React.createElement("mark", { key: i, className: styles.qSentenceMark }, part.slice(1, -1))
            if (part.startsWith("<u>"))
                return React.createElement("u", { key: i }, part.slice(3, -4))
            return part
        })
    )
}

export function buildQuestions(vocab: VocabItem[], grammar: GrammarItem[], sections: Section[]): Question[] {
    const kanjiItems   = fisher(vocab.filter(v => v.kana !== null && v.word !== v.kana))
    const meaningItems = fisher(vocab.filter(v => v.meaning))

    const allKana     = vocab.filter(v => v.kana).map(v => v.kana!)
    const allWords    = vocab.map(v => v.word)
    const allMeanings = vocab.filter(v => v.meaning).map(v => v.meaning!)
    const allGrammar  = grammar.filter(g => g.meaning).map(g => g.meaning!)

    let ki = 0, vi = 0, gi = 0
    const questions: Question[] = []

    for (const sec of sections) {
        for (const grp of sec.groups) {
            for (let q = 0; q < grp.count; q++) {
                if (grp.type === "kanji_reading") {
                    const item = kanjiItems[ki % Math.max(kanjiItems.length, 1)]
                    const tmpl = SENTENCE_TEMPLATES[ki % SENTENCE_TEMPLATES.length]
                    ki++
                    if (!item) continue
                    const correct = item.kana!
                    const options = fisher([correct, ...pickOthers(allKana, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type,
                        display: item.word, sentence: tmpl(item.word), options, correctIndex: options.indexOf(correct) })

                } else if (grp.type === "kanji_writing") {
                    const item = kanjiItems[ki % Math.max(kanjiItems.length, 1)]
                    const tmpl = SENTENCE_TEMPLATES[ki % SENTENCE_TEMPLATES.length]
                    ki++
                    if (!item) continue
                    const correct = item.word
                    const options = fisher([correct, ...pickOthers(allWords, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type,
                        display: item.kana!, sentence: tmpl(item.kana!), options, correctIndex: options.indexOf(correct) })

                } else if (grp.type === "context_vocab") {
                    const item = meaningItems[vi % Math.max(meaningItems.length, 1)]
                    vi++
                    if (!item || !item.meaning) continue
                    const correct = item.meaning
                    const options = fisher([correct, ...pickOthers(allMeanings, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type,
                        display: item.word, reading: item.kana ?? undefined, options, correctIndex: options.indexOf(correct) })

                } else {
                    const item = grammar[gi % Math.max(grammar.length, 1)]
                    gi++
                    if (!item || !item.meaning) continue
                    const correct = item.meaning
                    const options = fisher([correct, ...pickOthers(allGrammar, correct)])
                    questions.push({ groupId: grp.id, sectionId: sec.id, type: grp.type,
                        display: item.pattern, options, correctIndex: options.indexOf(correct) })
                }
            }
        }
    }
    return questions
}

export function score60(correct: number, total: number) {
    return total > 0 ? Math.round((correct / total) * 60) : 0
}
