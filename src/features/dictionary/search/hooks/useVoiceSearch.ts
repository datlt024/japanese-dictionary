import { useCallback, useEffect, useRef, useState } from "react"

type SpeechRecognitionAlternativeLike = {
    transcript: string
}

type SpeechRecognitionResultLike = {
    0: SpeechRecognitionAlternativeLike
    isFinal: boolean
}

type SpeechRecognitionResultListLike = {
    length: number
    item: (index: number) => SpeechRecognitionResultLike
    [index: number]: SpeechRecognitionResultLike
}

type SpeechRecognitionEventLike = {
    results: SpeechRecognitionResultListLike
}

type SpeechRecognitionErrorEventLike = {
    error: string
}

type SpeechRecognitionLike = {
    lang: string
    interimResults: boolean
    continuous: boolean
    start: () => void
    stop: () => void
    abort: () => void
    onstart: (() => void) | null
    onend: (() => void) | null
    onresult: ((event: SpeechRecognitionEventLike) => void) | null
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
}

type SpeechRecognitionConstructor =
    new () => SpeechRecognitionLike

type WindowWithSpeechRecognition = Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
}

export type VoiceSearchLanguage = "ja-JP" | "vi-VN"

function getSpeechRecognitionConstructor() {
    if (typeof window === "undefined") {
        return null
    }

    const speechWindow =
        window as WindowWithSpeechRecognition

    return (
        speechWindow.SpeechRecognition ||
        speechWindow.webkitSpeechRecognition ||
        null
    )
}

function getResultsArray(
    results: SpeechRecognitionResultListLike
) {
    return Array.from(
        { length: results.length },
        (_, index) => results[index] || results.item(index)
    )
}

export default function useVoiceSearch(
    language: VoiceSearchLanguage,
    onResult: (text: string) => void
) {
    const recognitionRef =
        useRef<SpeechRecognitionLike | null>(null)

    const [listening, setListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [supported, setSupported] = useState(() =>
        Boolean(getSpeechRecognitionConstructor())
    )

    const stop = useCallback(() => {
        recognitionRef.current?.stop()
        setListening(false)
    }, [])

    const start = useCallback(() => {
        const SpeechRecognitionConstructor =
            getSpeechRecognitionConstructor()

        if (!SpeechRecognitionConstructor) {
            setSupported(false)
            setError("Trình duyệt không hỗ trợ nhận diện giọng nói.")
            return
        }

        const recognition = new SpeechRecognitionConstructor()

        recognition.lang = language
        recognition.interimResults = true
        recognition.continuous = false

        recognition.onstart = () => {
            setListening(true)
            setError(null)
            setTranscript("")
        }

        recognition.onend = () => {
            setListening(false)
        }

        recognition.onerror = () => {
            setListening(false)
            setError("Không thể nhận diện giọng nói.")
        }

        recognition.onresult = (event) => {
            const results = getResultsArray(event.results)

            const text = results
                .map((result) => result[0]?.transcript || "")
                .join("")
                .trim()

            setTranscript(text)

            const lastResult = results[results.length - 1]

            if (lastResult?.isFinal && text) {
                onResult(text)
                recognition.stop()
            }
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [language, onResult])

    useEffect(() => {
        return () => {
            recognitionRef.current?.abort()
        }
    }, [])

    return {
        supported,
        listening,
        transcript,
        error,
        start,
        stop,
    }
}