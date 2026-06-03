import type { GrammarPoint } from "../types"

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