export function splitKanjiReadings(value: string | null) {
    if (!value) {
        return []
    }

    return value
        .split(/[、,;；\s]+/)
        .map((item) => item.trim())
        .filter(Boolean)
}

export function formatKanjiJlpt(jlpt: number | null) {
    return jlpt ? `JLPT N${jlpt}` : "JLPT N5"
}

export function speakJapanese(text: string) {
    if (typeof window === "undefined") {
        return
    }

    if (!("speechSynthesis" in window)) {
        return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "ja-JP"
    utterance.rate = 0.9

    window.speechSynthesis.speak(utterance)
}

export function splitMeaningText(value: string | null) {
    if (!value) {
        return []
    }

    return value
        .split(/[,;；、]/)
        .map((item) => item.trim())
        .filter(Boolean)
}