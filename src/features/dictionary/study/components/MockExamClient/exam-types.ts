export type QType = "kanji_reading" | "kanji_writing" | "context_vocab" | "grammar_blank" | "listening_pic" | "listening_text" | "listening_scene"
export type Phase = "info" | "loading" | "error" | "question" | "break" | "listening" | "summary"

export type VocabItem   = { id: number; word: string; kana: string | null; meaning: string | null }
export type GrammarItem = { id: number; pattern: string; meaning: string | null }

export interface Group {
    id: string
    label: string
    sublabel: string
    type: QType
    count: number
    skipped?: boolean
}

export interface Section {
    id: string
    title: string
    titleVi: string
    allocMin: number
    groups: Group[]
}

export interface Question {
    groupId: string
    sectionId: string
    type: QType
    display: string
    reading?: string
    sentence?: string
    context?: string
    options: string[]
    correctIndex: number
    audioSrc?: string
    imageSrc?: string
    audioStart?: number
    audioEnd?: number
    script?: string
    explanation?: string
}

export interface InfoRow { title: string; count: number; skipped?: boolean; sectionId?: string }

export interface ExamConfig {
    duration: number
    passingDisplay: string
    passing: { secMin: number; total: number }
    subtitle?: string
    listeningAudio?: string
    infoRows: InfoRow[]
    sections: Section[]
}
