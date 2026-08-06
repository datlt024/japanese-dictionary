"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, RotateCcw, ChevronRight, X, Play, Pause } from "lucide-react"
import styles from "./MockExamClient.module.css"
import { N5_QUESTIONS } from "@/features/dictionary/study/data/n5-exam"
import { N5_2021_QUESTIONS } from "@/features/dictionary/study/data/n5-2021-exam"

// ── Types ──────────────────────────────────────────────────────────────

type QType = "kanji_reading" | "kanji_writing" | "context_vocab" | "grammar_blank" | "listening_pic" | "listening_text" | "listening_scene"
type Phase = "info" | "loading" | "error" | "question" | "break" | "listening" | "summary"

type VocabItem  = { id: number; word: string; kana: string | null; meaning: string | null }
type GrammarItem = { id: number; pattern: string; meaning: string | null }

interface Group {
    id: string
    label: string      // 問題1
    sublabel: string   // 漢字の読み方
    type: QType
    count: number
    skipped?: boolean  // true for 聴解 groups (no audio available)
}

interface Section {
    id: string
    title: string   // 言語知識（文字・語彙）
    titleVi: string // Ngôn ngữ — Từ vựng
    allocMin: number // minutes allocated (for reference display)
    groups: Group[]
}

interface Question {
    groupId: string
    sectionId: string
    type: QType
    display: string
    reading?: string
    sentence?: string   // Japanese sentence with [target] marker for highlighted word
    context?: string    // passage shown above the question (e.g. 問題7 reading)
    options: string[]
    correctIndex: number
    audioSrc?: string
    imageSrc?: string   // full 2×2 grid image for listening_pic questions
    audioStart?: number // seconds into cfg.listeningAudio where this question starts
    audioEnd?: number   // seconds where this question ends (auto-pause)
    explanation?: string
}

// ── JLPT structure ─────────────────────────────────────────────────────
// Source: Official JLPT syllabus

interface InfoRow { title: string; count: number; skipped?: boolean; sectionId?: string }

const EXAM: Record<string, {
    duration: number
    passingDisplay: string
    passing: { secMin: number; total: number }
    subtitle?: string
    listeningAudio?: string
    infoRows: InfoRow[]
    sections: Section[]
}> = {
    N5: {
        duration: 90 * 60,  // 20 + 40 min tested + 30 min 聴解
        passingDisplay: "80",
        passing: { secMin: 19, total: 80 },
        infoRows: [
            { title: "文字・語彙", count: 35 },
            { title: "文法・読解", count: 32 },
            { title: "聴解",       count: 24, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 20,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "＿＿の　ことばは　ひらがなで　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_reading", count: 12 },
                    { id: "q2", label: "問題2", sublabel: "もんだい＿＿＿の　ことばは　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_writing", count: 8  },
                    { id: "q3", label: "問題3", sublabel: "もんだい（　　　）に　なにを　いれますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 10 },
                    { id: "q4", label: "問題4", sublabel: "もんだい４　＿＿の　ぶんと　だいたい　おなじ　いみの　ぶんが　あります。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 40,
                groups: [
                    { id: "q5",  label: "問題1", sublabel: "もんだい（　　　）に何を入れますか。１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 16 },
                    { id: "q6",  label: "問題2", sublabel: "もんだい（★）に入るものはどれですか。１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 5  },
                    { id: "q7",  label: "問題3", sublabel: "もんだい３　つぎの（１）と（２）のぶんしょうを読んで、ぶんしょうのいみを考えて、（　）の中に入るものを、１・２・３・４から一つえらんでください。", type: "grammar_blank", count: 5  },
                    { id: "q8",  label: "問題4", sublabel: "もんだい４　つぎの（１）から（３）のぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 3  },
                    { id: "q9",  label: "問題5", sublabel: "もんだい５　つぎのぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 2  },
                    { id: "q10", label: "問題6", sublabel: "もんだい６　右のページを見て、下のしつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 1  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 30,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "もんだいでは、はじめに　しつもんを　きいて　ください。　それから　はなしを　きいて、もんだいようしの　１から４の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "grammar_blank", count: 7, skipped: true },
                    { id: "lq2", label: "問題2", sublabel: "もんだい２では、まず しつもんを きいて ください。それから はなしを きいて、もんだいようしの １から４の なかから、いちばん いいものを ひとつ えらんで ください。", type: "grammar_blank", count: 6, skipped: true },
                    { id: "lq3", label: "問題3", sublabel: "１から３の　ながから、いちばん　いい　ものを　ひとつ　えらんでください。", type: "grammar_blank", count: 5, skipped: true },
                    { id: "lq4", label: "問題4", sublabel: "もんだい は、えなどが　ありません。ふんを　きいて、１から３の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "grammar_blank", count: 6, skipped: true },
                ],
            },
        ],
    },
    "N5-2021": {
        duration: 90 * 60,  // 60 min language + 30 min listening
        subtitle: "2021年12月",
        passingDisplay: "80",
        passing: { secMin: 19, total: 80 },
        listeningAudio: "/exams/n5-2021/audio/listening.m4a",
        infoRows: [
            { title: "文字・語彙", count: 21 },
            { title: "文法・読解", count: 22 },
            { title: "聴解",       count: 24 },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 20,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "＿＿の　ことばは　ひらがなで　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_reading", count: 7 },
                    { id: "q2", label: "問題2", sublabel: "もんだい２　＿＿の　ことばは　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_writing", count: 5 },
                    { id: "q3", label: "問題3", sublabel: "もんだい３　（　　　）に　なにを　いれますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 6 },
                    { id: "q4", label: "問題4", sublabel: "もんだい４　＿＿の　ぶんと　だいたい　おなじ　いみの　ぶんが　あります。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 3 },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 40,
                groups: [
                    { id: "q5",  label: "問題1", sublabel: "もんだい１　（　　　）に　なにを　いれますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "grammar_blank", count: 9  },
                    { id: "q6",  label: "問題2", sublabel: "もんだい２　★に　入る　ものは　どれですか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "grammar_blank", count: 4  },
                    { id: "q7",  label: "問題3", sublabel: "もんだい３　つぎの（１）と（２）のぶんしょうを読んで、ぶんしょうのいみを考えて、（　）の中に入るものを、１・２・３・４から一つえらんでください。", type: "grammar_blank", count: 4  },
                    { id: "q8",  label: "問題4", sublabel: "もんだい４　つぎの（１）から（２）のぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 2  },
                    { id: "q9",  label: "問題5", sublabel: "もんだい５　つぎのぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 2  },
                    { id: "q10", label: "問題6", sublabel: "もんだい６　右のページを見て、下のしつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 1  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 30,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "もんだい１　まず　しつもんを　きいて　ください。それから　はなしを　きいて、もんだいようしの　１から４の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_pic",   count: 7 },
                    { id: "lq2", label: "問題2", sublabel: "もんだい２　では、まず　しつもんを　きいて　ください。それから　はなしを　きいて、もんだいようしの　１から４の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_pic",   count: 6 },
                    { id: "lq3", label: "問題3", sublabel: "もんだい３　では、えを　みながら　しつもんを　きいて　ください。やじるし（→）のひとは　なんと　いいますか。１から３の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_scene", count: 5 },
                    { id: "lq4", label: "問題4", sublabel: "もんだい４　では、えなどが　ありません。まず　ぶんを　きいて　ください。それから、その　へんじを　きいて、１から３の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_text",  count: 6 },
                ],
            },
        ],
    },
    N4: {
        duration: 115 * 60,  // 25 + 55 min tested + 35 min 聴解
        passingDisplay: "90",
        passing: { secMin: 19, total: 90 },
        infoRows: [
            { title: "文字・語彙",  count: 25 },
            { title: "文法・読解",  count: 35 },
            { title: "聴解",        count: 28, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 25,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方",  type: "kanji_reading", count: 7  },
                    { id: "q2", label: "問題2", sublabel: "漢字の書き方",  type: "kanji_writing",   count: 6  },
                    { id: "q3", label: "問題3", sublabel: "（　　）に入れるのに最もよいものを選んでください", type: "context_vocab", count: 7  },
                    { id: "q4", label: "問題4", sublabel: "____に意味が最も近いものを選んでください",          type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 55,
                groups: [
                    { id: "q5", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 20 },
                    { id: "q6", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 9  },
                    { id: "q7", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 6  },
                ],
            },
        ],
    },
    N3: {
        duration: 140 * 60,  // 30 + 70 min tested + 40 min 聴解
        passingDisplay: "95",
        passing: { secMin: 19, total: 95 },
        infoRows: [
            { title: "語彙",      count: 35 },
            { title: "文法・読解", count: 39 },
            { title: "聴解",      count: 28, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 30,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方",   type: "kanji_reading", count: 10 },
                    { id: "q2", label: "問題2", sublabel: "漢字の書き方",   type: "kanji_writing",   count: 8  },
                    { id: "q3", label: "問題3", sublabel: "語彙形成",        type: "context_vocab", count: 5  },
                    { id: "q4", label: "問題4", sublabel: "文脈規定",        type: "context_vocab", count: 7  },
                    { id: "q5", label: "問題5", sublabel: "言い換え類義",    type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q6", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 20 },
                    { id: "q7", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 10 },
                    { id: "q8", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 9  },
                ],
            },
        ],
    },
    N2: {
        duration: 155 * 60,  // 105 min tested (gộp) + 50 min 聴解
        passingDisplay: "90",
        passing: { secMin: 19, total: 90 },
        infoRows: [
            { title: "語彙",       count: 27 },
            { title: "文法・読解",  count: 48 },
            { title: "聴解",        count: 30, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 40,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方", type: "kanji_reading", count: 5 },
                    { id: "q2", label: "問題2", sublabel: "語彙形成",      type: "context_vocab", count: 5 },
                    { id: "q3", label: "問題3", sublabel: "文脈規定",      type: "context_vocab", count: 7 },
                    { id: "q4", label: "問題4", sublabel: "言い換え類義",  type: "context_vocab", count: 5 },
                    { id: "q5", label: "問題5", sublabel: "用法",          type: "context_vocab", count: 5 },
                ],
            },
            {
                id: "grammar", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 65,
                groups: [
                    { id: "q6", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 25 },
                    { id: "q7", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 15 },
                    { id: "q8", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 8  },
                ],
            },
        ],
    },
    N1: {
        duration: 165 * 60,  // 110 min tested (gộp) + 55 min 聴解
        passingDisplay: "100",
        passing: { secMin: 19, total: 100 },
        infoRows: [
            { title: "語彙",       count: 24 },
            { title: "文法・読解",  count: 46 },
            { title: "聴解",        count: 35, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 40,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方", type: "kanji_reading", count: 6 },
                    { id: "q2", label: "問題2", sublabel: "文脈規定",      type: "context_vocab", count: 7 },
                    { id: "q3", label: "問題3", sublabel: "言い換え類義",  type: "context_vocab", count: 6 },
                    { id: "q4", label: "問題4", sublabel: "用法",          type: "context_vocab", count: 5 },
                ],
            },
            {
                id: "grammar", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q5", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 25 },
                    { id: "q6", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 15 },
                    { id: "q7", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 6  },
                ],
            },
        ],
    },
}


const SENTENCE_TEMPLATES: ((w: string) => string)[] = [
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

function parseSentence(sentence: string): React.ReactNode {
    const parts = sentence.split(/(\[[^\]]+\]|<u>[^<]*<\/u>)/)
    if (parts.length === 1) return <>{sentence}</>
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith("[") && part.endsWith("]"))
                    return <mark key={i} className={styles.qSentenceMark}>{part.slice(1, -1)}</mark>
                if (part.startsWith("<u>"))
                    return <u key={i}>{part.slice(3, -4)}</u>
                return part
            })}
        </>
    )
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatTime(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
}

function fisher<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function pickOthers(pool: string[], correct: string, n = 3): string[] {
    const seen = new Set([correct])
    const result: string[] = []
    for (const item of fisher(pool)) {
        if (!seen.has(item) && item) { seen.add(item); result.push(item) }
        if (result.length >= n) break
    }
    while (result.length < n) result.push("—")
    return result
}

function buildQuestions(vocab: VocabItem[], grammar: GrammarItem[], sections: Section[]): Question[] {
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

function score60(correct: number, total: number) {
    return total > 0 ? Math.round((correct / total) * 60) : 0
}

// ── Component ──────────────────────────────────────────────────────────

export default function MockExamClient({ level, year }: { level: string; year?: string }) {
    const router = useRouter()
    const examKey = level === "N5" && year === "2021" ? "N5-2021" : level
    const cfg = EXAM[examKey] ?? EXAM["N5"]
    const allGroups = cfg.sections.flatMap(s => s.groups)

    const [phase,              setPhase]              = useState<Phase>("info")
    const [questions,          setQuestions]          = useState<Question[]>([])
    const [answers,            setAnswers]            = useState<(number | null)[]>([])
    const [idx,                setIdx]                = useState(0)
    const [timeLeft,           setTimeLeft]           = useState(0)
    const [timeTaken,          setTimeTaken]          = useState(0)
    const [languageTimeTaken,  setLanguageTimeTaken]  = useState(0)

    const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
    const startRef      = useRef(0)
    const endTimeRef    = useRef(0)
    const questionRefs  = useRef<(HTMLDivElement | null)[]>([])
    const audioRef      = useRef<HTMLAudioElement>(null)
    const [audioStarted,  setAudioStarted]  = useState(false)
    const [audioEnded,    setAudioEnded]    = useState(false)
    const [audioTime,     setAudioTime]     = useState(0)
    const [audioDuration, setAudioDuration] = useState(0)
    const [showReview,      setShowReview]      = useState(false)
    const [reviewPlayingGi, setReviewPlayingGi] = useState<number | null>(null)
    const reviewPlayingGiRef = useRef<number | null>(null)

    const startAudio = useCallback(() => {
        audioRef.current?.play()
    }, [])

    // ── Data loading ──────────────────────────────────────────────────

    const startTimer = useCallback((totalMin: number) => {
        startRef.current = Date.now()
        endTimeRef.current = Date.now() + totalMin * 60 * 1000
        setTimeLeft(totalMin * 60)
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setTimeLeft(Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000)))
        }, 500)
    }, [])

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const load = useCallback((mounted: { v: boolean }) => {
        if (examKey === "N5") {
            if (!mounted.v) return
            const totalMin = cfg.sections.reduce((acc, s) => acc + s.allocMin, 0)
            questionRefs.current = new Array(N5_QUESTIONS.length).fill(null)
            setQuestions(N5_QUESTIONS as Question[])
            setAnswers(new Array(N5_QUESTIONS.length).fill(null))
            setIdx(0)
            startTimer(totalMin)
            setPhase("question")
            return
        }

        if (examKey === "N5-2021") {
            if (!mounted.v) return
            // Start with 60-min language timer; listening gets its own 30-min timer later
            const languageMin = cfg.sections.filter(s => s.id !== "listening").reduce((acc, s) => acc + s.allocMin, 0)
            questionRefs.current = new Array(N5_2021_QUESTIONS.length).fill(null)
            setQuestions(N5_2021_QUESTIONS as Question[])
            setAnswers(new Array(N5_2021_QUESTIONS.length).fill(null))
            setIdx(0)
            setLanguageTimeTaken(0)
            startTimer(languageMin)
            setPhase("question")
            return
        }

        const totalMin = cfg.sections.reduce((acc, s) => acc + s.allocMin, 0)
        const grammarCount = cfg.sections.flatMap(s => s.groups).filter(g => g.type === "grammar_blank").reduce((a, g) => a + g.count, 0)
        Promise.all([
            fetch(`/api/study/jlpt?level=${level}&limit=100`).then(r => r.json()),
            fetch(`/api/study/grammar?level=${level}&limit=${Math.min(grammarCount * 4, 100)}`).then(r => r.json()),
        ]).then(([vocab, grammar]) => {
            if (!mounted.v) return
            const qs = buildQuestions(vocab as VocabItem[], grammar as GrammarItem[], cfg.sections)
            if (qs.length < 5) { setPhase("error"); return }
            questionRefs.current = new Array(qs.length).fill(null)
            setQuestions(qs)
            setAnswers(new Array(qs.length).fill(null))
            setIdx(0)
            startTimer(totalMin)
            setPhase("question")
        }).catch(() => { if (mounted.v) setPhase("error") })
    }, [examKey, level, cfg, startTimer])

    // ── Timer ────────────────────────────────────────────────────────

    const stopTimer = useCallback(() => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }, [])

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const finish = useCallback(() => {
        stopTimer()
        if (cfg.listeningAudio && phase === "question") {
            setLanguageTimeTaken(Math.round((Date.now() - startRef.current) / 1000))
            setPhase("break")
        } else {
            setTimeTaken(Math.round((Date.now() - startRef.current) / 1000))
            setPhase("summary")
        }
    }, [stopTimer, cfg.listeningAudio, phase])

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const startListening = useCallback(() => {
        const listeningMin = cfg.sections.find(s => s.id === "listening")?.allocMin ?? 30
        startRef.current = Date.now()
        startTimer(listeningMin)
        const firstIdx = questions.findIndex(q => q.sectionId === "listening")
        setIdx(Math.max(0, firstIdx))
        setPhase("listening")
    }, [cfg.sections, startTimer, questions])

    useEffect(() => {
        if ((phase !== "question" && phase !== "listening") || timeLeft !== 0) return
        finish()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, phase])

    useEffect(() => () => stopTimer(), [stopTimer])

    // Force-load review audio so seeks are accurate on first click
    useEffect(() => {
        if (!showReview || !cfg.listeningAudio) return
        audioRef.current?.load()
    }, [showReview, cfg.listeningAudio])

    // Block copy, screenshot, right-click during exam
    useEffect(() => {
        if (phase !== "question" && phase !== "listening") return
        const block = (e: Event) => e.preventDefault()
        const blockKey = (e: KeyboardEvent) => {
            if (e.key === "PrintScreen") {
                e.preventDefault()
                navigator.clipboard?.writeText("").catch(() => {})
                return
            }
            if ((e.ctrlKey || e.metaKey) && ["c", "x", "a", "p"].includes(e.key.toLowerCase()))
                e.preventDefault()
        }
        document.addEventListener("copy", block)
        document.addEventListener("cut", block)
        document.addEventListener("contextmenu", block)
        document.addEventListener("keydown", blockKey)
        return () => {
            document.removeEventListener("copy", block)
            document.removeEventListener("cut", block)
            document.removeEventListener("contextmenu", block)
            document.removeEventListener("keydown", blockKey)
        }
    }, [phase])

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const startExam = useCallback(() => {
        stopTimer()
        setAudioStarted(false)
        setAudioEnded(false)
        setAudioTime(0)
        setAudioDuration(0)
        setLanguageTimeTaken(0)
        setShowReview(false)
        setReviewPlayingGi(null)
        setTimeTaken(0)
        const mounted = { v: true }
        setPhase("loading")
        load(mounted)
    }, [load, stopTimer])

    // ── Answer handler ────────────────────────────────────────────────

    const handleSelect = useCallback((qIdx: number, optIdx: number) => {
        setAnswers(prev => { const n = [...prev]; n[qIdx] = optIdx; return n })
        setIdx(qIdx)
    }, [])

    const scrollToQuestion = useCallback((qIdx: number) => {
        setIdx(qIdx)
        questionRefs.current[qIdx]?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, [])

    // ── Keyboard (1-4 / A-D for currently focused question) ──────────

    useEffect(() => {
        if (phase !== "question" && phase !== "listening") return
        const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 }
        const fn = (e: KeyboardEvent) => {
            const i = map[e.key.toLowerCase()]
            if (i !== undefined) setAnswers(prev => { const n = [...prev]; n[idx] = i; return n })
        }
        window.addEventListener("keydown", fn)
        return () => window.removeEventListener("keydown", fn)
    }, [phase, idx])

    // ── Computed results ──────────────────────────────────────────────

    function getResults() {
        const correctIn = (qs: Question[]) => qs.filter(q => answers[questions.indexOf(q)] === q.correctIndex).length

        const vocabQs      = questions.filter(q => q.sectionId === "vocab")
        const grammarQs    = questions.filter(q => q.sectionId === "grammar")
        const listeningQs  = questions.filter(q => q.sectionId === "listening")

        const vocabCorrect     = correctIn(vocabQs)
        const grammarCorrect   = correctIn(grammarQs)
        const listeningCorrect = correctIn(listeningQs)

        const vocabScore     = score60(vocabCorrect,     vocabQs.length)
        const grammarScore   = score60(grammarCorrect,   grammarQs.length)
        const listeningScore = score60(listeningCorrect, listeningQs.length)

        const total = vocabScore + grammarScore + listeningScore

        const vocabPassed     = vocabQs.length     === 0 || vocabScore     >= cfg.passing.secMin
        const grammarPassed   = grammarQs.length   === 0 || grammarScore   >= cfg.passing.secMin
        const listeningPassed = listeningQs.length === 0 || listeningScore >= cfg.passing.secMin
        const passed = total >= cfg.passing.total && vocabPassed && grammarPassed && listeningPassed

        const totalCorrect = vocabCorrect + grammarCorrect + listeningCorrect
        const totalQ       = questions.length

        // per-group results
        const groupResults = allGroups.map(grp => {
            const grpQs = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.groupId === grp.id)
            const correct = grpQs.filter(({ q, i }) => answers[i] === q.correctIndex).length
            return { ...grp, correct, total: grpQs.length }
        })

        return { vocabCorrect, grammarCorrect, listeningCorrect, vocabQs, grammarQs, listeningQs,
                 vocabScore, grammarScore, listeningScore, total, vocabPassed, grammarPassed,
                 listeningPassed, passed, totalCorrect, totalQ, groupResults }
    }

    // ── Render: info ─────────────────────────────────────────────────

    if (phase === "info") {
        const durationMin = Math.round(cfg.duration / 60)

        return (
            <div className={styles.introWrap}>
                <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                    <ArrowLeft size={14} /> Danh sách đề thi
                </Link>

                <div className={styles.infoCard}>
                    <div className={styles.infoHeader}>
                        <h2 className={styles.infoTitle}>Đề thi thử JLPT</h2>
                        <span className={styles.introBadge} data-level={level}>{level}</span>
                    </div>
                    {cfg.subtitle && (
                        <p className={styles.infoSubtitle}>{cfg.subtitle}</p>
                    )}

                    <div className={styles.infoMeta}>
                        <span className={styles.infoMetaLabel}>Trình độ đề thi</span>
                        <span className={styles.infoMetaVal} data-level={level}>{level}</span>
                    </div>

                    <table className={styles.infoTable}>
                        <thead>
                            <tr>
                                <th>Nội dung</th>
                                <th>Số câu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cfg.infoRows.map(row => (
                                <tr key={row.title} data-skipped={row.skipped || undefined}>
                                    <td>{row.title}</td>
                                    <td>{row.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className={styles.infoStats}>
                        <div className={styles.infoStat}>
                            <span className={styles.infoStatLabel}>Thời gian làm bài</span>
                            <span className={styles.infoStatVal} data-accent>{durationMin} Phút</span>
                        </div>
                        <div className={styles.infoStat}>
                            <span className={styles.infoStatLabel}>Điểm đạt</span>
                            <span className={styles.infoStatVal} data-pass>{cfg.passingDisplay} điểm</span>
                        </div>
                    </div>

                    <button className={styles.btnStart} onClick={startExam}>
                        Bắt đầu <ChevronRight size={16} />
                    </button>

                    {cfg.listeningAudio ? (
                        <p className={styles.infoNote}>
                            * Đề thi gồm 2 giai đoạn: <strong>Ngôn ngữ</strong> (60 phút) → <strong>Nghe hiểu</strong> (30 phút). Audio sẽ phát sau khi bắt đầu phần nghe.
                        </p>
                    ) : (
                        <p className={styles.infoNote}>
                            * Đề thi thử bao gồm phần <strong>Ngôn ngữ</strong> (từ vựng + ngữ pháp). Không bao gồm phần 聴解.
                        </p>
                    )}
                </div>
            </div>
        )
    }

    // ── Render: loading ───────────────────────────────────────────────

    if (phase === "loading") {
        return (
            <div className={styles.center}>
                <div className={styles.spinner} />
                <p className={styles.hint}>Đang chuẩn bị đề thi...</p>
            </div>
        )
    }

    if (phase === "error") {
        return (
            <div className={styles.center}>
                <p className={styles.hint}>Không thể tải đề thi. Vui lòng thử lại.</p>
                <button className={styles.btnPrimary} onClick={startExam}>Thử lại</button>
            </div>
        )
    }

    // ── Render: question / listening (two-column scroll layout) ─────────

    if (phase === "question" || phase === "listening") {
        const isListeningPhase = phase === "listening"

        const phaseSections = cfg.listeningAudio
            ? cfg.sections.filter(s => isListeningPhase ? s.id === "listening" : s.id !== "listening")
            : cfg.sections

        const phaseQsWithIdx = questions
            .map((q, gi) => ({ q, gi }))
            .filter(({ q }) => !cfg.listeningAudio || (isListeningPhase === (q.sectionId === "listening")))

        const answeredCount = phaseQsWithIdx.filter(({ gi }) => answers[gi] !== null).length
        const unanswered = phaseQsWithIdx.length - answeredCount
        const progress = phaseQsWithIdx.length > 0 ? (answeredCount / phaseQsWithIdx.length) * 100 : 0
        const warn = timeLeft < 60

        const handleExit = () => {
            if (!window.confirm("Thoát khỏi bài thi? Tiến trình sẽ không được lưu.")) return
            router.push("/study?tab=thi-thu")
        }

        const handleFinish = () => {
            if (unanswered > 0 && !window.confirm(`Còn ${unanswered} câu chưa trả lời. Xác nhận nộp bài?`)) return
            finish()
        }

        return (
            <div className={styles.examPage}>
                {/* Top bar */}
                <div className={styles.examTopBar}>
                    <button className={styles.examExitBtn} onClick={handleExit}>
                        <X size={14} /> Thoát
                    </button>
                    <div className={styles.examBarCenter}>
                        <span className={styles.examBarTitle}>
                            JLPT {level}{cfg.subtitle ? ` · ${cfg.subtitle}` : ""}
                            {isListeningPhase && " — 聴解"}
                        </span>
                        <span className={styles.examBarTimer} data-warn={warn || undefined}>
                            <Clock size={12} /> {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button className={styles.examSubmitBtn} onClick={handleFinish}>
                        {cfg.listeningAudio && !isListeningPhase ? "Sang phần Nghe →" : "Nộp bài"}
                    </button>
                </div>

                {/* Answered progress */}
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} data-level={level} style={{ width: `${progress}%` }} />
                </div>

                {/* Body: left questions + right navigator */}
                <div className={styles.examBody}>

                    {/* ── Left: scrollable question list ── */}
                    <div className={styles.questionsPanel}>
                        {phaseSections.map(sec => {
                            const isSkippedSec = sec.groups.every(g => g.skipped)
                            const secQs = questions
                                .map((q, gi) => ({ q, gi }))
                                .filter(({ q }) => q.sectionId === sec.id)
                            if (!isSkippedSec && secQs.length === 0) return null

                            let secOffset = 0
                            return (
                                <div key={sec.id} className={styles.qSectionBlock}>
                                    <div className={styles.qSectionHeader} data-skipped={isSkippedSec || undefined}>
                                        <span className={styles.qSectionTitle}>{sec.title}</span>
                                        <span className={styles.qSectionCount}>
                                            {isSkippedSec ? "Không thi" : `${secQs.length} câu`}
                                        </span>
                                    </div>

                                    {/* ── Section-level audio player for listening ── */}
                                    {sec.id === "listening" && cfg.listeningAudio && (
                                        <div className={styles.audioPlayer}>
                                            <audio
                                                ref={audioRef}
                                                src={cfg.listeningAudio}
                                                onTimeUpdate={() => setAudioTime(audioRef.current?.currentTime ?? 0)}
                                                onDurationChange={() => setAudioDuration(audioRef.current?.duration ?? 0)}
                                                onPlay={() => setAudioStarted(true)}
                                                onEnded={() => setAudioEnded(true)}
                                            />
                                            {!audioStarted ? (
                                                <button className={styles.audioPlayBtn} onClick={startAudio}>
                                                    <Play size={15} fill="currentColor" />
                                                </button>
                                            ) : (
                                                <span className={styles.audioStatusDot} data-ended={audioEnded || undefined} />
                                            )}
                                            <span className={styles.audioTimestamp}>
                                                {audioEnded ? "Đã kết thúc" : audioStarted ? "Đang phát..." : "Bắt đầu nghe"}
                                            </span>
                                            <div className={styles.audioSeekTrack}>
                                                <div
                                                    className={styles.audioSeekFill}
                                                    style={{ width: audioDuration > 0 ? `${(audioTime / audioDuration) * 100}%` : "0%" }}
                                                />
                                            </div>
                                            <span className={styles.audioTimestamp}>
                                                {formatTime(Math.floor(audioTime))} / {formatTime(Math.floor(audioDuration))}
                                            </span>
                                        </div>
                                    )}

                                    {sec.groups.map(grp => {
                                        if (grp.skipped) {
                                            return (
                                                <div key={grp.id} className={styles.qGroupBlock}>
                                                    <div className={styles.qGroupHeader}>
                                                        <span className={styles.qGroupLabel}>{grp.label}</span>
                                                        <span className={styles.qGroupSub}>{grp.sublabel}</span>
                                                    </div>
                                                    <div className={styles.qGroupSkipped}>
                                                        <span>🔇</span>
                                                        <span>Phần này yêu cầu audio — không có trong bài thi thử</span>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        const grpQs = secQs.filter(({ q }) => q.groupId === grp.id)
                                        if (grpQs.length === 0) return null
                                        const grpOffset = secOffset
                                        secOffset += grpQs.length

                                        return (
                                            <div key={grp.id} className={styles.qGroupBlock}>
                                                <div className={styles.qGroupHeader}>
                                                    <span className={styles.qGroupLabel}>{grp.label}</span>
                                                    <span className={styles.qGroupSub}>{grp.sublabel}</span>
                                                </div>

                                                {grpQs.map(({ q, gi }, pos) => {
                                                    const isKanjiType = q.type === "kanji_reading" || q.type === "kanji_writing"
                                                    const isListeningQ = q.type === "listening_pic" || q.type === "listening_text" || q.type === "listening_scene"
                                                    const prevContext = pos > 0 ? grpQs[pos - 1].q.context : undefined
                                                    const showContext = q.context != null && q.context !== prevContext
                                                    return (
                                                        <React.Fragment key={gi}>
                                                            {/* ── Context passage — shown only once per unique passage ── */}
                                                            {showContext && (
                                                                <div className={styles.qContext} dangerouslySetInnerHTML={{ __html: q.context! }} />
                                                            )}
                                                        <div
                                                            id={`q-${gi}`}
                                                            ref={el => { questionRefs.current[gi] = el }}
                                                            className={styles.qItem}
                                                            data-active={idx === gi || undefined}
                                                            data-type={q.type}
                                                            onClick={() => setIdx(gi)}
                                                        >

                                                            {/* ── Header + question inline ── */}
                                                            <div className={styles.qItemHead}>
                                                                <span className={styles.qNum}>{grpOffset + pos + 1}</span>
                                                                <div className={styles.qWordInline}>
                                                                    {isListeningQ ? (
                                                                        cfg.listeningAudio ? (
                                                                            <span className={styles.qListenLabel}>{q.display}</span>
                                                                        ) : (
                                                                            <button
                                                                                className={styles.qListenPlayBtn}
                                                                                data-ready={!!q.audioSrc || undefined}
                                                                                disabled={!q.audioSrc}
                                                                                onClick={e => e.stopPropagation()}
                                                                            >
                                                                                <Play size={13} fill="currentColor" />
                                                                                {q.audioSrc ? "Phát âm thanh" : "Chưa có âm thanh"}
                                                                            </button>
                                                                        )
                                                                    ) : (q.type === "kanji_reading" || q.type === "kanji_writing") ? (
                                                                        <p className={styles.qSentence}>
                                                                            {q.sentence ? parseSentence(q.sentence) : q.display}
                                                                        </p>
                                                                    ) : q.type === "context_vocab" ? (
                                                                        q.sentence ? (
                                                                            <p className={styles.qSentence}>{parseSentence(q.sentence)}</p>
                                                                        ) : (
                                                                            <>
                                                                                <span className={styles.qVocabWord}>{q.display}</span>
                                                                                {q.reading && <span className={styles.qVocabReading}>{q.reading}</span>}
                                                                            </>
                                                                        )
                                                                    ) : (
                                                                        q.sentence ? (
                                                                            <p className={styles.qSentence}>{parseSentence(q.sentence)}</p>
                                                                        ) : (
                                                                            <span className={styles.qGrammarWord}>{q.display}</span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* ── Scene / reference image placeholder ── */}
                                                            {q.type === "listening_scene" && (
                                                                q.imageSrc ? (
                                                                    <div className={styles.qPicThumb}>
                                                                        <Image
                                                                            src={q.imageSrc}
                                                                            alt={`Hình câu ${q.display}`}
                                                                            width={800}
                                                                            height={600}
                                                                            className={styles.qPic4ImgFull}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className={styles.qSceneImg}>
                                                                        <span className={styles.qSceneLabel}>Hình minh họa</span>
                                                                    </div>
                                                                )
                                                            )}

                                                            {/* ── Options ── */}
                                                            {q.type === "listening_pic" ? (
                                                                <>
                                                                    {q.imageSrc ? (
                                                                        <div className={styles.qPicThumb}>
                                                                            <Image
                                                                                src={q.imageSrc}
                                                                                alt={`Hình câu ${q.display}`}
                                                                                width={800}
                                                                                height={600}
                                                                                className={styles.qPic4ImgFull}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className={styles.qPic4Grid}>
                                                                            {[0,1,2,3].map(oi => (
                                                                                <div key={oi} className={styles.qPic4Placeholder} />
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    <div className={styles.qOptions}>
                                                                        {[1,2,3,4].map((num, oi) => {
                                                                            const isSel = answers[gi] === oi
                                                                            return (
                                                                                <label
                                                                                    key={oi}
                                                                                    className={styles.qOption}
                                                                                    data-selected={isSel || undefined}
                                                                                    onClick={e => { e.stopPropagation(); handleSelect(gi, oi) }}
                                                                                >
                                                                                    <span className={styles.qRadio} data-selected={isSel || undefined} />
                                                                                    <span className={styles.qOptText}>{num}</span>
                                                                                </label>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className={styles.qOptions} data-grid={isKanjiType || undefined}>
                                                                    {q.options.map((opt, oi) => {
                                                                        const isSel = answers[gi] === oi
                                                                        return (
                                                                            <label
                                                                                key={oi}
                                                                                className={styles.qOption}
                                                                                data-selected={isSel || undefined}
                                                                                onClick={e => { e.stopPropagation(); handleSelect(gi, oi) }}
                                                                            >
                                                                                <span className={styles.qRadio} data-selected={isSel || undefined} />
                                                                                <span className={styles.qOptNum}>{oi + 1}</span>
                                                                                <span className={styles.qOptText}>{opt}</span>
                                                                            </label>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                        </React.Fragment>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                        <div style={{ height: 80 }} />
                    </div>

                    {/* ── Right: navigator panel ── */}
                    <div className={styles.navPanel}>
                        <p className={styles.navStat}>
                            <span data-done>{answeredCount}</span>/{phaseQsWithIdx.length} đã trả lời
                        </p>
                        {phaseSections.map(sec => {
                            const secQs = phaseQsWithIdx.filter(({ q }) => q.sectionId === sec.id)
                            if (secQs.length === 0) return null
                            return (
                                <div key={sec.id} className={styles.navSection}>
                                    <p className={styles.navSectionTitle}>{sec.title}</p>
                                    <div className={styles.navGrid}>
                                        {secQs.map(({ gi }, localIdx) => (
                                            <button
                                                key={gi}
                                                className={styles.navBtn}
                                                data-answered={answers[gi] !== null || undefined}
                                                data-current={idx === gi || undefined}
                                                data-level={answers[gi] !== null ? level : undefined}
                                                onClick={() => scrollToQuestion(gi)}
                                            >
                                                {localIdx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                        <p className={styles.navHint}>Nhấn 1 2 3 4 để chọn câu đang xem</p>
                    </div>

                </div>
            </div>
        )
    }

    // ── Render: break (transition between language and listening) ───────

    if (phase === "break") {
        if (cfg.listeningAudio) {
            return (
                <div className={styles.introWrap}>
                    <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                        <ArrowLeft size={14} /> Danh sách đề thi
                    </Link>

                    <div className={styles.breakCard}>
                        <div className={styles.breakIcon}>👂</div>
                        <h2 className={styles.breakTitle}>Phần Ngôn ngữ hoàn thành</h2>
                        <p className={styles.breakDesc}>
                            Tiếp theo là phần <strong>聴解 (Nghe hiểu)</strong> với 24 câu hỏi, thời gian <strong>30 phút</strong>.
                        </p>
                        <p className={styles.breakNote}>
                            Audio sẽ phát sau khi bạn bắt đầu. Bạn không thể tạm dừng hoặc tua lại — giống kỳ thi thật.
                        </p>
                        <button className={styles.btnStart} onClick={startListening}>
                            Bắt đầu phần Nghe <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )
        }

        return (
            <div className={styles.introWrap}>
                <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                    <ArrowLeft size={14} /> Danh sách đề thi
                </Link>

                <div className={styles.breakCard}>
                    <div className={styles.breakIcon}>☕</div>
                    <h2 className={styles.breakTitle}>Giải lao</h2>
                    <p className={styles.breakDesc}>
                        Trong kỳ thi JLPT thực tế, đây là thời gian nghỉ giữa phần <strong>言語知識・読解</strong> và phần <strong>聴解</strong> (Nghe hiểu).
                    </p>
                    <p className={styles.breakNote}>
                        Bài thi thử này không bao gồm phần nghe. Nhấn <strong>Nộp bài</strong> khi bạn sẵn sàng để xem kết quả.
                    </p>
                    <button className={styles.btnStart} onClick={() => setPhase("summary")}>
                        Nộp bài <ChevronRight size={16} />
                    </button>
                </div>

                <p className={styles.introNote}>
                    * Bài thi bao gồm phần <strong>Ngôn ngữ</strong> (từ vựng + ngữ pháp). Không có phần nghe và đọc hiểu.
                </p>
            </div>
        )
    }

    // ── Render: summary + review ──────────────────────────────────────

    const { vocabCorrect, grammarCorrect, listeningCorrect,
            vocabQs, grammarQs, listeningQs,
            vocabScore, grammarScore, listeningScore, total,
            vocabPassed, grammarPassed, listeningPassed,
            passed, totalCorrect, totalQ } = getResults()

    const maxScore = (vocabQs.length > 0 ? 60 : 0) + (grammarQs.length > 0 ? 60 : 0) + (listeningQs.length > 0 ? 60 : 0)
    const scoreLabel = listeningQs.length > 0 && vocabQs.length > 0
        ? "Tổng điểm"
        : listeningQs.length > 0
        ? "Điểm nghe hiểu"
        : "Điểm từ vựng + ngữ pháp"
    const totalTimeTaken = languageTimeTaken + timeTaken

    // ── Review: full exam read-only with answer highlighting ────────────

    if (showReview) {
        const handleReviewPlay = (gi: number, q: Question) => {
            const el = audioRef.current
            if (!el || !cfg.listeningAudio) return
            if (reviewPlayingGiRef.current === gi) {
                el.pause()
                reviewPlayingGiRef.current = null
                setReviewPlayingGi(null)
                return
            }
            el.pause()
            reviewPlayingGiRef.current = gi
            setReviewPlayingGi(gi)
            const start = q.audioStart ?? 0
            // Register listener BEFORE setting currentTime — seeked can fire immediately
            el.addEventListener('seeked', () => {
                if (reviewPlayingGiRef.current === gi) el.play().catch(() => {})
            }, { once: true })
            el.currentTime = start
        }

        return (
            <div className={styles.examPage}>
                {/* Top bar — same structure as exam */}
                <div className={styles.examTopBar}>
                    <button className={styles.examExitBtn} onClick={() => {
                        audioRef.current?.pause()
                        reviewPlayingGiRef.current = null
                        setReviewPlayingGi(null)
                        setShowReview(false)
                    }}>
                        <ArrowLeft size={14} /> Quay lại kết quả
                    </button>
                    <span className={styles.examBarTitle}>
                        JLPT {level}{cfg.subtitle ? ` · ${cfg.subtitle}` : ""} — Xem đáp án
                    </span>
                    <div style={{ width: 90 }} />
                </div>

                {/* Body: left questions + right navigator */}
                <div className={styles.examBody}>

                    {/* Left: scrollable question list */}
                    <div className={styles.questionsPanel}>
                        {/* Hidden audio element for per-question playback */}
                        {cfg.listeningAudio && (
                            <audio
                                ref={audioRef}
                                src={cfg.listeningAudio}
                                preload="auto"
                                onTimeUpdate={() => {
                                    const gi = reviewPlayingGiRef.current
                                    if (gi === null || !audioRef.current) return
                                    const pq = questions[gi]
                                    const el = audioRef.current
                                    if (pq?.audioStart !== undefined && el.currentTime < pq.audioStart) {
                                        el.currentTime = pq.audioStart
                                        return
                                    }
                                    if (pq?.audioEnd !== undefined && el.currentTime >= pq.audioEnd) {
                                        el.pause()
                                        reviewPlayingGiRef.current = null
                                        setReviewPlayingGi(null)
                                    }
                                }}
                                onEnded={() => { reviewPlayingGiRef.current = null; setReviewPlayingGi(null) }}
                            />
                        )}
                        {cfg.sections.map(sec => {
                            const secQsWithIdx = questions
                                .map((q, gi) => ({ q, gi }))
                                .filter(({ q }) => q.sectionId === sec.id)
                            if (secQsWithIdx.length === 0) return null

                            let secOffset = 0
                            return (
                                <div key={sec.id} className={styles.qSectionBlock}>
                                    <div className={styles.qSectionHeader}>
                                        <span className={styles.qSectionTitle}>{sec.title}</span>
                                        <span className={styles.qSectionCount}>{secQsWithIdx.length} câu</span>
                                    </div>

                                    {sec.groups.map(grp => {
                                        const grpQs = secQsWithIdx.filter(({ q }) => q.groupId === grp.id)
                                        if (grpQs.length === 0) return null
                                        const grpOffset = secOffset
                                        secOffset += grpQs.length

                                        return (
                                            <div key={grp.id} className={styles.qGroupBlock}>
                                                <div className={styles.qGroupHeader}>
                                                    <span className={styles.qGroupLabel}>{grp.label}</span>
                                                    <span className={styles.qGroupSub}>{grp.sublabel}</span>
                                                </div>

                                                {grpQs.map(({ q, gi }, pos) => {
                                                    const ans = answers[gi]
                                                    const isCorrect = ans === q.correctIndex
                                                    const isSkipped = ans === null
                                                    const isKanjiType = q.type === "kanji_reading" || q.type === "kanji_writing"
                                                    const prevContext = pos > 0 ? grpQs[pos - 1].q.context : undefined
                                                    const showContext = q.context != null && q.context !== prevContext

                                                    return (
                                                        <React.Fragment key={gi}>
                                                            {showContext && (
                                                                <div className={styles.qContext} dangerouslySetInnerHTML={{ __html: q.context! }} />
                                                            )}
                                                            <div
                                                                id={`rev-${gi}`}
                                                                ref={el => { questionRefs.current[gi] = el }}
                                                                className={styles.qItem}
                                                                data-readonly
                                                            >
                                                                <div className={styles.qItemHead}>
                                                                    <span className={styles.qNum}>{grpOffset + pos + 1}</span>
                                                                    <div className={styles.qWordInline}>
                                                                        {(q.type === "listening_pic" || q.type === "listening_text" || q.type === "listening_scene") ? (
                                                                            <span className={styles.qListenLabel}>{q.display}</span>
                                                                        ) : (q.type === "kanji_reading" || q.type === "kanji_writing") ? (
                                                                            <p className={styles.qSentence}>
                                                                                {q.sentence ? parseSentence(q.sentence) : q.display}
                                                                            </p>
                                                                        ) : q.type === "context_vocab" ? (
                                                                            q.sentence ? (
                                                                                <p className={styles.qSentence}>{parseSentence(q.sentence)}</p>
                                                                            ) : (
                                                                                <>
                                                                                    <span className={styles.qVocabWord}>{q.display}</span>
                                                                                    {q.reading && <span className={styles.qVocabReading}>{q.reading}</span>}
                                                                                </>
                                                                            )
                                                                        ) : (
                                                                            q.sentence ? (
                                                                                <p className={styles.qSentence}>{parseSentence(q.sentence)}</p>
                                                                            ) : (
                                                                                <span className={styles.qGrammarWord}>{q.display}</span>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                    <span
                                                                        className={styles.reviewResultTag}
                                                                        data-correct={isSkipped ? undefined : String(isCorrect)}
                                                                        data-skipped={isSkipped || undefined}
                                                                    >
                                                                        {isSkipped ? "Bỏ trống" : isCorrect ? "✓ Đúng" : "✗ Sai"}
                                                                    </span>
                                                                </div>

                                                                {/* Per-question audio replay (review only) */}
                                                                {cfg.listeningAudio && q.audioStart !== undefined && q.audioEnd !== undefined && (
                                                                    <button
                                                                        className={styles.reviewPlayBtn}
                                                                        data-playing={reviewPlayingGi === gi || undefined}
                                                                        onClick={() => handleReviewPlay(gi, q)}
                                                                    >
                                                                        {reviewPlayingGi === gi
                                                                            ? <><Pause size={12} fill="currentColor" /> Đang phát</>
                                                                            : <><Play  size={12} fill="currentColor" /> Nghe lại</>
                                                                        }
                                                                    </button>
                                                                )}

                                                                {q.type === "listening_scene" && q.imageSrc && (
                                                                    <div className={styles.qPicThumb}>
                                                                        <Image src={q.imageSrc} alt={`Hình câu ${q.display}`} width={800} height={600} className={styles.qPic4ImgFull} />
                                                                    </div>
                                                                )}

                                                                {q.type === "listening_pic" ? (
                                                                    <>
                                                                        {q.imageSrc && (
                                                                            <div className={styles.qPicThumb}>
                                                                                <Image src={q.imageSrc} alt={`Hình câu ${q.display}`} width={800} height={600} className={styles.qPic4ImgFull} />
                                                                            </div>
                                                                        )}
                                                                        <div className={styles.qOptions}>
                                                                            {[1,2,3,4].map((num, oi) => {
                                                                                const isCor   = oi === q.correctIndex
                                                                                const isWrong = ans !== null && ans !== q.correctIndex && oi === ans
                                                                                return (
                                                                                    <div key={oi} className={styles.qOption}
                                                                                        data-review-correct={isCor || undefined}
                                                                                        data-review-wrong={isWrong || undefined}>
                                                                                        <span className={styles.reviewRadio} data-correct={isCor || undefined} data-wrong={isWrong || undefined} />
                                                                                        <span className={styles.qOptText}>{num}</span>
                                                                                        {isCor   && <span className={styles.reviewOptMark} data-correct>✓</span>}
                                                                                        {isWrong && <span className={styles.reviewOptMark} data-wrong>✗</span>}
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className={styles.qOptions} data-grid={isKanjiType || undefined}>
                                                                        {q.options.map((opt, oi) => {
                                                                            const isCor   = oi === q.correctIndex
                                                                            const isWrong = ans !== null && ans !== q.correctIndex && oi === ans
                                                                            return (
                                                                                <div key={oi} className={styles.qOption}
                                                                                    data-review-correct={isCor || undefined}
                                                                                    data-review-wrong={isWrong || undefined}>
                                                                                    <span className={styles.reviewRadio} data-correct={isCor || undefined} data-wrong={isWrong || undefined} />
                                                                                    <span className={styles.qOptNum}>{oi + 1}</span>
                                                                                    <span className={styles.qOptText}>{opt}</span>
                                                                                    {isCor   && <span className={styles.reviewOptMark} data-correct>✓</span>}
                                                                                    {isWrong && <span className={styles.reviewOptMark} data-wrong>✗</span>}
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {q.explanation && (
                                                                    <p className={styles.reviewExplanation}>{q.explanation}</p>
                                                                )}
                                                            </div>
                                                        </React.Fragment>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                        <div style={{ height: 80 }} />
                    </div>

                    {/* Right: navigator panel */}
                    <div className={styles.navPanel}>
                        <p className={styles.navStat}>
                            <span data-done>{totalCorrect}</span>/{totalQ} câu đúng
                        </p>
                        {cfg.sections.map(sec => {
                            const secQs = questions
                                .map((q, i) => ({ q, i }))
                                .filter(({ q }) => q.sectionId === sec.id)
                            if (secQs.length === 0) return null
                            return (
                                <div key={sec.id} className={styles.navSection}>
                                    <p className={styles.navSectionTitle}>{sec.title}</p>
                                    <div className={styles.navGrid}>
                                        {secQs.map(({ q, i }, localIdx) => {
                                            const ans = answers[i]
                                            const isCor = ans === q.correctIndex
                                            return (
                                                <button
                                                    key={i}
                                                    className={styles.navBtn}
                                                    data-nav-correct={ans !== null && isCor  || undefined}
                                                    data-nav-wrong={ans !== null && !isCor || undefined}
                                                    onClick={() => questionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                                                >
                                                    {localIdx + 1}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                        <div className={styles.reviewNavLegend}>
                            <span data-correct>✓ Đúng</span>
                            <span data-wrong>✗ Sai</span>
                            <span>Bỏ trống</span>
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    // ── Summary ──────────────────────────────────────────────────────────

    return (
        <div className={styles.summary}>
            <Link href="/study?tab=thi-thu" className={styles.backBtn}>
                <ArrowLeft size={14} /> Danh sách đề thi
            </Link>

            {/* Main score card */}
            <div className={styles.scoreCard}>
                <div className={styles.scoreTop}>
                    <span className={styles.resultBadge} data-passed={String(passed)}>
                        {passed ? "ĐẠT" : "CHƯA ĐẠT"}
                    </span>
                    <span className={styles.levelBadge} data-level={level}>{level}</span>
                </div>

                <div className={styles.scoreMain}>
                    <span className={styles.scoreNum}>{total}</span>
                    <span className={styles.scoreMax}>/{maxScore}</span>
                </div>
                <p className={styles.scoreNote}>{scoreLabel} · Ngưỡng đạt {cfg.passingDisplay} điểm (mỗi phần ≥ {cfg.passing.secMin})</p>

                {/* Per-section scores */}
                <div className={styles.sectionScores}>
                    {cfg.infoRows.map((row, rowIdx) => {
                        const skipped   = !!row.skipped
                        const testedIdx = cfg.infoRows.slice(0, rowIdx).filter(r => !r.skipped).length
                        const secId = row.sectionId
                        const scoreMap  = [vocabScore,   grammarScore,   listeningScore]
                        const correctMap= [vocabCorrect, grammarCorrect, listeningCorrect]
                        const totalMap  = [vocabQs.length, grammarQs.length, listeningQs.length]
                        const passedMap = [vocabPassed,  grammarPassed,  listeningPassed]
                        const mapIdx = secId === "listening" ? 2 : testedIdx
                        const score   = skipped ? null : scoreMap[mapIdx]  ?? 0
                        const correct = skipped ? null : correctMap[mapIdx] ?? 0
                        const total   = skipped ? null : totalMap[mapIdx]   ?? 0
                        const passed  = skipped ? null : passedMap[mapIdx]  ?? true
                        return (
                            <div key={row.title} className={styles.sectionScoreRow}
                                data-skipped={skipped || undefined}
                                data-passed={passed !== null ? String(passed) : undefined}>
                                <div className={styles.sectionScoreInfo}>
                                    <span className={styles.sectionScoreTitle}>{row.title}</span>
                                    {!skipped && correct !== null && (
                                        <span className={styles.sectionScoreDetail}>{correct}/{total} câu đúng</span>
                                    )}
                                    {passed === false && <span className={styles.sectionFail}>Điểm liệt</span>}
                                </div>
                                <div className={styles.sectionScoreVal}>
                                    {skipped ? (
                                        <span className={styles.sectionScoreSkipped}>Không thi</span>
                                    ) : (
                                        <><span>{score}</span><small>/60</small></>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Stats row */}
                <div className={styles.statsRow}>
                    <div className={styles.stat}>
                        <span className={styles.statV}>{totalCorrect}</span>
                        <span className={styles.statL}>Câu đúng</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statV} data-red>{totalQ - totalCorrect}</span>
                        <span className={styles.statL}>Câu sai</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statV}>{totalQ > 0 ? Math.round(totalCorrect / totalQ * 100) : 0}%</span>
                        <span className={styles.statL}>Chính xác</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statV}>{formatTime(totalTimeTaken)}</span>
                        <span className={styles.statL}>Thời gian</span>
                    </div>
                </div>

                <div className={styles.scoreActions}>
                    <button className={styles.btnPrimary} onClick={() => setPhase("info")}>
                        <RotateCcw size={14} /> Thi lại
                    </button>
                    <button className={styles.btnReview} onClick={() => setShowReview(true)}>
                        Xem đáp án
                    </button>
                    <Link href="/study?tab=thi-thu" className={styles.btnOutline}>Đề khác</Link>
                </div>
            </div>

        </div>
    )
}
