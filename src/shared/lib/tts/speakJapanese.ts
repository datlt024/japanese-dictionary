export function speakJapanese(text: string) {
    if (typeof window === "undefined") {
        return
    }

    const synth = window.speechSynthesis

    if (!synth || !text.trim()) {
        return
    }

    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "ja-JP"
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    const voices = synth.getVoices()

    const japaneseVoice =
        voices.find((voice) => voice.lang === "ja-JP") ||
        voices.find((voice) => voice.lang.startsWith("ja"))

    if (japaneseVoice) {
        utterance.voice = japaneseVoice
    }

    synth.speak(utterance)
}