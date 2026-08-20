"use client"

import { useEffect, useState } from "react"
import styles from "./GoogleTranslateWidget.module.css"

type Props = {
    text: string
    sourceLang?: string
    targetLang?: string
}

export default function GoogleTranslateWidget({
    text,
    sourceLang = "ja",
    targetLang = "vi",
}: Props) {
    const [translation, setTranslation] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    // Component is remounted via key={text} at usage site, so initial state is always fresh.
    useEffect(() => {
        if (!text.trim()) return
        let cancelled = false

        fetch(`/api/translate?text=${encodeURIComponent(text)}&sl=${sourceLang}&tl=${targetLang}`)
            .then((r) => {
                if (!r.ok) throw new Error()
                return r.json()
            })
            .then((data) => {
                if (!cancelled) setTranslation(data.translation || "")
            })
            .catch(() => {
                if (!cancelled) setError(true)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [text, sourceLang, targetLang])

    const googleTranslateUrl = `https://translate.google.com/?sl=${sourceLang}&tl=${targetLang}&text=${encodeURIComponent(text)}&op=translate`

    return (
        <div className={styles.widget}>
            <div className={styles.header}>
                <span className={styles.logo}>
                    <GoogleTranslateLogo />
                    Google Dịch
                </span>
                <a
                    href={googleTranslateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.openLink}
                >
                    Mở đầy đủ ↗
                </a>
            </div>

            <div className={styles.body}>
                <div className={styles.panel}>
                    <div className={styles.langLabel}>Tiếng Nhật</div>
                    <div className={styles.inputText}>
                        {text}
                        <button
                            className={styles.speakBtn}
                            onClick={() => {
                                import("@/shared/lib/tts/speakJapanese").then(({ speakJapanese }) =>
                                    speakJapanese(text)
                                )
                            }}
                            title="Nghe phát âm"
                            type="button"
                        >
                            <SpeakerIcon />
                        </button>
                    </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.panel}>
                    <div className={styles.langLabel}>Tiếng Việt</div>
                    <div className={styles.outputText}>
                        {loading && <span className={styles.loading}>Đang dịch…</span>}
                        {!loading && error && (
                            <span className={styles.errorText}>
                                Không thể tải bản dịch.{" "}
                                <a href={googleTranslateUrl} target="_blank" rel="noopener noreferrer">
                                    Thử trên Google Dịch
                                </a>
                            </span>
                        )}
                        {!loading && !error && translation}
                    </div>
                </div>
            </div>
        </div>
    )
}

function SpeakerIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
    )
}

function GoogleTranslateLogo() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4" />
            <path d="M12 2C6.48 2 2 6.48 2 12c0 2.76 1.12 5.26 2.93 7.07L16.07 7.93A9.96 9.96 0 0 0 12 2z" fill="#34A853" />
            <path d="M2 12c0 5.52 4.48 10 10 10 2.76 0 5.26-1.12 7.07-2.93L7.93 7.93A9.96 9.96 0 0 0 2 12z" fill="#FBBC05" />
            <path d="M22 12c0-5.52-4.48-10-10-10-2.76 0-5.26 1.12-7.07 2.93l11.14 11.14A9.96 9.96 0 0 0 22 12z" fill="#EA4335" />
        </svg>
    )
}
