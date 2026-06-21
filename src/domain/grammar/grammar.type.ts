export type FormationToken = {
    text: string
    type: "text" | "drop"
}

export type GrammarFormationPattern = {
    structure: string
    tokens: FormationToken[]
    note_vi?: string
}

export type GrammarFormation = {
    label: string
    patterns: GrammarFormationPattern[]
}

export type GrammarRubyItem = {
    base: string
    reading: string
}

export type GrammarExample = {
    jp: string
    vi: string
    ruby: GrammarRubyItem[]
}

export type GrammarSense = {
    sense_index: number
    meaning_vi: string
    explanation_vi: string | null
    nuance_vi: string | null
}

export type GrammarSpecialCase = {
    from: string
    to: string
    note?: string | null
}

export type GrammarDifference = {
    grammar: string
    description_vi: string
}

export type GrammarPoint = {
    id: number

    pattern: string
    display_pattern: string | null
    reading: string | null

    jlpt_level: "N5" | "N4" | "N3" | "N2" | "N1" | null

    meaning_vi: string | null
    meaning_en: string | null
    short_meaning_vi: string | null

    explanation_vi: string | null
    explanation_en: string | null
    nuance_vi: string | null

    register: string | null

    formation: GrammarFormation[]
    examples: GrammarExample[]
    senses: GrammarSense[]
    special_cases: GrammarSpecialCase[]

    similar_grammar: string[]
    differences: GrammarDifference[]

    notes: string[]
    tags: string[]

    frequency: "high" | "medium" | "low" | null
    is_common: boolean | null

    created_at?: string
    updated_at?: string
}
