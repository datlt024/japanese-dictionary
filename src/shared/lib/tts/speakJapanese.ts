let currentAudio: HTMLAudioElement | null = null

export function speakJapanese(text: string) {
    if (typeof window === "undefined" || !text.trim()) return

    stopSpeaking()

    const src = `/api/tts?text=${encodeURIComponent(text.slice(0, 200))}`
    const audio = new Audio(src)
    currentAudio = audio

    audio.addEventListener("ended", () => {
        if (currentAudio === audio) currentAudio = null
    })

    audio.play().catch(() => fallbackSpeak(text))
}

export function stopSpeaking() {
    if (!currentAudio) return
    currentAudio.pause()
    currentAudio.src = ""
    currentAudio = null
}

function fallbackSpeak(text: string) {
    const synth = window.speechSynthesis
    if (!synth) return

    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "ja-JP"
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    const voices = synth.getVoices()
    const voice =
        voices.find((v) => v.lang === "ja-JP" && v.name.includes("Google")) ||
        voices.find((v) => v.lang === "ja-JP") ||
        voices.find((v) => v.lang.startsWith("ja"))

    if (voice) utterance.voice = voice

    synth.speak(utterance)
}
