export type VerbGroup = "group_1" | "group_2" | "group_3"

export type VerbConjugation = {
    label: string
    form: string
}

const godanEndings: Record<
    string,
    {
        masu: string
        nai: string
        te: string
        ta: string
    }
> = {
    う: { masu: "い", nai: "わ", te: "って", ta: "った" },
    つ: { masu: "ち", nai: "た", te: "って", ta: "った" },
    る: { masu: "り", nai: "ら", te: "って", ta: "った" },
    む: { masu: "み", nai: "ま", te: "んで", ta: "んだ" },
    ぶ: { masu: "び", nai: "ば", te: "んで", ta: "んだ" },
    ぬ: { masu: "に", nai: "な", te: "んで", ta: "んだ" },
    く: { masu: "き", nai: "か", te: "いて", ta: "いた" },
    ぐ: { masu: "ぎ", nai: "が", te: "いで", ta: "いだ" },
    す: { masu: "し", nai: "さ", te: "して", ta: "した" },
}

function removeLastChar(text: string) {
    return text.slice(0, -1)
}

function normalizeDictionaryForm(dictionaryForm: string) {
    const normalized = dictionaryForm
        .replace(/[（）()]/g, "")
        .trim()

    if (
        normalized === "為る" ||
        normalized === "する" ||
        normalized === "為るする"
    ) {
        return "する"
    }

    return normalized.replace("為る", "")
}

export function conjugateVerb(
    dictionaryForm: string,
    verbGroup: string | null
): VerbConjugation[] {
    if (!dictionaryForm || !verbGroup) {
        return []
    }

    const normalizedForm =
        normalizeDictionaryForm(dictionaryForm)

    if (verbGroup === "group_2") {
        const stem = normalizedForm.endsWith("る")
            ? removeLastChar(normalizedForm)
            : normalizedForm

        return [
            { label: "Dạng ます", form: `${stem}ます` },
            { label: "Dạng phủ định", form: `${stem}ない` },
            { label: "Dạng て", form: `${stem}て` },
            { label: "Dạng quá khứ", form: `${stem}た` },
            { label: "Dạng khả năng", form: `${stem}られる` },
            { label: "Dạng ý chí", form: `${stem}よう` },
        ]
    }

    if (verbGroup === "group_3") {
        if (normalizedForm === "為る" || normalizedForm === "する") {
            return [
                { label: "Dạng ます", form: "します" },
                { label: "Dạng phủ định", form: "しない" },
                { label: "Dạng て", form: "して" },
                { label: "Dạng quá khứ", form: "した" },
                { label: "Dạng khả năng", form: "できる" },
                { label: "Dạng ý chí", form: "しよう" },
            ]
        }

        if (
            normalizedForm === "来る" ||
            normalizedForm === "くる"
        ) {
            return [
                { label: "Dạng ます", form: "来ます（きます）" },
                { label: "Dạng phủ định", form: "来ない（こない）" },
                { label: "Dạng て", form: "来て（きて）" },
                { label: "Dạng quá khứ", form: "来た（きた）" },
                { label: "Dạng khả năng", form: "来られる（こられる）" },
                { label: "Dạng ý chí", form: "来よう（こよう）" },
            ]
        }

        if (normalizedForm.endsWith("する")) {
            const stem = normalizedForm.slice(0, -2)

            return [
                { label: "Dạng ます", form: `${stem}します` },
                { label: "Dạng phủ định", form: `${stem}しない` },
                { label: "Dạng て", form: `${stem}して` },
                { label: "Dạng quá khứ", form: `${stem}した` },
                { label: "Dạng khả năng", form: `${stem}できる` },
                { label: "Dạng ý chí", form: `${stem}しよう` },
            ]
        }

        return []
    }

    if (verbGroup === "group_1") {
        const lastChar = normalizedForm.slice(-1)
        const stem = removeLastChar(normalizedForm)
        const ending = godanEndings[lastChar]

        if (!ending) {
            return []
        }

        const naiSuffix =
            lastChar === "う" ? "わない" : `${ending.nai}ない`

        return [
            { label: "Dạng ます", form: `${stem}${ending.masu}ます` },
            { label: "Dạng phủ định", form: `${stem}${naiSuffix}` },
            { label: "Dạng て", form: `${stem}${ending.te}` },
            { label: "Dạng quá khứ", form: `${stem}${ending.ta}` },
            { label: "Dạng khả năng", form: `${stem}${ending.nai}る` },
            {
                label: "Dạng ý chí",
                form: `${stem}${getVolitionalEnding(lastChar)}`,
            },
        ]
    }

    return []
}

function getVolitionalEnding(lastChar: string) {
    const map: Record<string, string> = {
        う: "おう",
        つ: "とう",
        る: "ろう",
        む: "もう",
        ぶ: "ぼう",
        ぬ: "のう",
        く: "こう",
        ぐ: "ごう",
        す: "そう",
    }

    return map[lastChar] || ""
}