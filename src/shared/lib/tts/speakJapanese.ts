let currentAudio: HTMLAudioElement | null = null

function getVoiceSetting(): "robot" | "male" | "female" {
    if (typeof window === "undefined") return "robot"
    return (localStorage.getItem("yomi_setting_voice") as "robot" | "male" | "female" | null) ?? "robot"
}

export function speakJapanese(text: string) {
    if (typeof window === "undefined" || !text.trim()) return

    stopSpeaking()

    const voice = getVoiceSetting()

    if (voice === "robot") {
        const src = `/api/tts?text=${encodeURIComponent(text.slice(0, 200))}`
        const audio = new Audio(src)
        currentAudio = audio

        audio.addEventListener("ended", () => {
            if (currentAudio === audio) currentAudio = null
        })

        audio.play().catch(() => fallbackSpeak(text, voice))
    } else {
        fallbackSpeak(text, voice)
    }
}

export function stopSpeaking() {
    if (!currentAudio) return
    currentAudio.pause()
    currentAudio.src = ""
    currentAudio = null
}

function fallbackSpeak(text: string, voicePref: "robot" | "male" | "female" = "robot") {
    const synth = window.speechSynthesis
    if (!synth) return

    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "ja-JP"
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    const voices = synth.getVoices()
    const jaVoices = voices.filter((v) => v.lang === "ja-JP" || v.lang.startsWith("ja"))

    let selected = null

    if (voicePref === "female") {
        // Prefer voices with female indicators
        selected =
            jaVoices.find((v) => /female|woman|kyoko|haruka|mizuki/i.test(v.name)) ||
            jaVoices.find((v) => v.lang === "ja-JP" && /google/i.test(v.name)) ||
            jaVoices.find((v) => v.lang === "ja-JP") ||
            jaVoices[0]
    } else if (voicePref === "male") {
        // Prefer voices with male indicators
        selected =
            jaVoices.find((v) => /male|man|otoya|ichiro/i.test(v.name)) ||
            jaVoices.find((v) => v.lang === "ja-JP" && /google/i.test(v.name)) ||
            jaVoices.find((v) => v.lang === "ja-JP") ||
            jaVoices[0]
    } else {
        // "robot" fallback — prefer Google voice (closest to robot)
        selected =
            jaVoices.find((v) => v.lang === "ja-JP" && /google/i.test(v.name)) ||
            jaVoices.find((v) => v.lang === "ja-JP") ||
            jaVoices[0]
    }

    if (selected) utterance.voice = selected

    synth.speak(utterance)
}
