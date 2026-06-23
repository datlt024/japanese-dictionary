import type {
    FormationToken,
    GrammarFormationPattern,
    GrammarPoint,
} from "@/domain/grammar"

import {
    hasItems,
    isTeShimau,
    splitMeaning,
} from "@/features/dictionary/grammar/utils"

import styles from "./GrammarStructureSection.module.css"

type Props = {
    grammar: GrammarPoint
}

type SplitStructureResult = {
    left: string
    right: string
    isLinear: boolean
}


type FlatPattern = {
    left: string
    right: string
    leftTokens: FormationToken[]
    rightTokens: FormationToken[]
    note?: string
    isLinear: boolean
}

type LeftItem = {
    text: string
    tokens: FormationToken[]
}

type GroupedPattern = {
    right: string
    rightTokens: FormationToken[]
    leftItems: LeftItem[]
    notes: string[]
    isLinear: boolean
}

function normalizeText(value: unknown) {
    if (typeof value !== "string") return ""

    return value.trim()
}

function splitStructure(structure?: string | null): SplitStructureResult {
    const safeStructure = normalizeText(structure)

    if (!safeStructure) {
        return {
            left: "",
            right: "",
            isLinear: true,
        }
    }

    const parts = safeStructure
        .split("+")
        .map((item) => item.trim())
        .filter(Boolean)

    if (parts.length !== 2) {
        return {
            left: safeStructure,
            right: "",
            isLinear: true,
        }
    }

    return {
        left: parts[0],
        right: parts[1],
        isLinear: false,
    }
}

function splitTokensByPlus(tokens: FormationToken[] | undefined) {
    if (!tokens || tokens.length === 0) {
        return {
            leftTokens: [],
            rightTokens: [],
        }
    }

    const plusIndex = tokens.findIndex((token) =>
        token.text.includes("+")
    )

    if (plusIndex === -1) {
        return {
            leftTokens: tokens,
            rightTokens: [],
        }
    }

    const leftTokens = tokens.slice(0, plusIndex)

    const plusToken = tokens[plusIndex]
    const afterPlusText = plusToken.text
        .split("+")
        .slice(1)
        .join("+")
        .trim()

    const rightTokens: FormationToken[] = [
        ...(afterPlusText
            ? [
                {
                    text: afterPlusText,
                    type: plusToken.type,
                },
            ]
            : []),
        ...tokens.slice(plusIndex + 1),
    ]

    return {
        leftTokens,
        rightTokens,
    }
}

function createDropAwareTokens(
    left: string,
    remove: string,
    right: string
) {
    const leftTokens: FormationToken[] = []

    if (left && remove && left.includes(remove)) {
        const removeIndex = left.lastIndexOf(remove)
        const beforeRemove = left.slice(0, removeIndex)
        const removeText = left.slice(removeIndex)
        const afterRemove = left.slice(removeIndex + remove.length)

        if (beforeRemove) {
            leftTokens.push({
                text: beforeRemove,
                type: "text",
            })
        }

        leftTokens.push({
            text: removeText,
            type: "drop",
        })

        if (afterRemove) {
            leftTokens.push({
                text: afterRemove,
                type: "text",
            })
        }
    } else if (left) {
        leftTokens.push({
            text: left,
            type: "text",
        })
    }

    const rightTokens: FormationToken[] = right
        ? [
            {
                text: right,
                type: "text",
            },
        ]
        : []

    return {
        leftTokens,
        rightTokens,
    }
}

function parsePattern(pattern: GrammarFormationPattern): FlatPattern | null {
    const newLeft = normalizeText(pattern.left)
    const newRemove = normalizeText(pattern.remove)
    const newRight = normalizeText(pattern.right)

    if (newLeft || newRemove || newRight) {
        const { leftTokens, rightTokens } = createDropAwareTokens(
            newLeft,
            newRemove,
            newRight
        )

        return {
            left: newLeft,
            right: newRight,
            leftTokens,
            rightTokens,
            note: pattern.note_vi ?? undefined,
            isLinear: !newRight,
        }
    }

    const { left, right, isLinear } = splitStructure(
        pattern.structure
    )

    if (!left && !right) return null

    const { leftTokens, rightTokens } = splitTokensByPlus(
        pattern.tokens
    )

    return {
        left,
        right,
        leftTokens,
        rightTokens,
        note: pattern.note_vi ?? undefined,
        isLinear,
    }
}

function normalizePatternText(value: string) {
    return value
        .replace(/[～〜]/g, "")
        .replace(/\s+/g, "")
        .replace(/[（(].*?[）)]/g, "")
        .trim()
}

function normalizeGroupKey(value: string) {
    return normalizePatternText(value)
}

function getStructureResultMeaning(grammar: GrammarPoint) {
    const meanings = splitMeaning(
        grammar.meaning_vi ||
        grammar.meaning_en ||
        grammar.short_meaning_vi
    )

    const joinedMeaning = meanings.slice(0, 3).join(" / ")
    const shortMeaning = grammar.short_meaning_vi || ""

    const normalizedPattern = normalizePatternText(grammar.pattern)
    const normalizedShortMeaning = normalizePatternText(shortMeaning)
    const normalizedJoinedMeaning = normalizePatternText(joinedMeaning)

    if (
        joinedMeaning &&
        normalizedJoinedMeaning !== normalizedPattern
    ) {
        return joinedMeaning
    }

    if (
        shortMeaning &&
        normalizedShortMeaning !== normalizedPattern
    ) {
        return shortMeaning
    }

    return ""
}

function groupAllPatterns(grammar: GrammarPoint) {
    const formation = grammar.formation ?? []

    const flatPatterns = formation.flatMap((group) =>
        (group.patterns ?? [])
            .map((pattern) =>
                parsePattern(pattern)
            )
            .filter((pattern): pattern is FlatPattern =>
                Boolean(pattern)
            )
    )

    const groupedMap = new Map<string, GroupedPattern>()

    flatPatterns.forEach((pattern) => {
        const key = pattern.isLinear
            ? `linear:${pattern.left}`
            : normalizeGroupKey(pattern.right || pattern.left)

        const leftItem: LeftItem = {
            text: pattern.left,
            tokens: pattern.leftTokens,
        }

        const current = groupedMap.get(key)

        if (!current) {
            groupedMap.set(key, {
                right: pattern.isLinear ? "" : pattern.right,
                rightTokens: pattern.isLinear
                    ? []
                    : pattern.rightTokens,
                leftItems: [leftItem],
                notes: pattern.note ? [pattern.note] : [],
                isLinear: pattern.isLinear,
            })

            return
        }

        if (
            !current.leftItems.some(
                (item) => item.text === leftItem.text
            )
        ) {
            current.leftItems.push(leftItem)
        }

        if (
            !current.isLinear &&
            current.rightTokens.length === 0 &&
            pattern.rightTokens.length > 0
        ) {
            current.rightTokens = pattern.rightTokens
        }

        if (pattern.note && !current.notes.includes(pattern.note)) {
            current.notes.push(pattern.note)
        }
    })

    return Array.from(groupedMap.values())
}

function renderTokens(tokens: FormationToken[], fallback: string) {
    if (!tokens || tokens.length === 0) {
        return fallback
    }

    return (
        <>
            {tokens.map((token, index) =>
                token.type === "drop" ? (
                    <span
                        key={`${token.text}-${index}`}
                        className={styles.dropText}
                    >
                        {token.text}
                    </span>
                ) : (
                    <span key={`${token.text}-${index}`}>
                        {token.text}
                    </span>
                )
            )}
        </>
    )
}

function getReadingNote(grammar: GrammarPoint) {
    if (!grammar.pattern.includes("通り")) return null

    return "N + 通り thường đọc là どおり, còn V / Nの + 通り đọc là とおり."
}

export default function GrammarStructureSection({ grammar }: Props) {
    if (!hasItems(grammar.formation)) return null

    const groupedPatterns = groupAllPatterns(grammar)
    const readingNote = getReadingNote(grammar)
    const resultMeaning = getStructureResultMeaning(grammar)

    if (groupedPatterns.length === 0) return null

    return (
        <section className={styles.section}>
            <div className={styles.sectionTitleRow}>
                <span>1</span>
                <h2>Cấu trúc</h2>
            </div>

            <div className={styles.groupedFormulaList}>
                {groupedPatterns.map((item) => (
                    <div
                        key={`${item.right}-${item.leftItems
                            .map((left) => left.text)
                            .join("-")}`}
                        className={styles.groupedFormula}
                    >
                        <div className={styles.leftStack}>
                            {item.leftItems.map((left) => (
                                <span
                                    key={left.text}
                                    className={styles.leftPill}
                                >
                                    {renderTokens(
                                        left.tokens,
                                        left.text
                                    )}
                                </span>
                            ))}
                        </div>

                        {!item.isLinear && item.right && (
                            <>
                                <span className={styles.plus}>＋</span>

                                <span className={styles.mainPill}>
                                    {renderTokens(
                                        item.rightTokens,
                                        item.right
                                    )}
                                </span>
                            </>
                        )}

                        {resultMeaning && (
                            <>
                                <span className={styles.arrow}>→</span>

                                <span className={styles.resultPill}>
                                    {resultMeaning}
                                </span>
                            </>
                        )}

                        {item.notes.length > 0 && (
                            <div className={styles.formulaNotes}>
                                {item.notes.map((note) => (
                                    <p key={note}>{note}</p>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {readingNote && (
                <div className={styles.readingNote}>
                    ※ {readingNote}
                </div>
            )}

            {isTeShimau(grammar) && (
                <div className={styles.shortenBox}>
                    <p>Trong hội thoại thường rút gọn:</p>

                    <div className={styles.shortenGrid}>
                        <span>～てしまう</span>
                        <strong>→</strong>
                        <span>～ちゃう</span>

                        <span>～でしまう</span>
                        <strong>→</strong>
                        <span>～じゃう</span>
                    </div>
                </div>
            )}
        </section>
    )
}