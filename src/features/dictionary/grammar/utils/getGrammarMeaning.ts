import type { GrammarPoint } from "@/domain/grammar"

export function getGrammarMeaning(
    grammar: GrammarPoint
) {
    return (
        grammar.short_meaning_vi ||
        grammar.meaning_vi ||
        grammar.meaning_en ||
        ""
    )
}