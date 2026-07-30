"use client"

import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"

import styles from "./SettingsClient.module.css"

// ── Storage keys ──────────────────────────────────────────────────────
const KEY_FURIGANA     = "yomi_setting_furigana"
const KEY_ROMAJI       = "yomi_setting_romaji"
const KEY_DARK_MODE    = "yomi_setting_dark_mode"
const KEY_VOICE        = "yomi_setting_voice"
const KEY_EMAIL_NOTIF  = "yomi_setting_email_notif"
const KEY_EMAIL_LEARN  = "yomi_setting_email_learning"
const KEY_EMAIL_DISC   = "yomi_setting_email_discount"
const KEY_EMAIL_JOB    = "yomi_setting_email_jobs"
const KEY_PUSH_NOTIF   = "yomi_setting_push_notif"

type VoiceType = "robot" | "male" | "female"

const VOICE_LABELS: Record<VoiceType, string> = {
    robot:  "Robot",
    male:   "Nam",
    female: "Nữ",
}

function loadBool(key: string, fallback: boolean): boolean {
    if (typeof window === "undefined") return fallback
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === "true"
}

function saveBool(key: string, value: boolean) {
    localStorage.setItem(key, String(value))
}

// ── Toggle component ──────────────────────────────────────────────────
function Toggle({
    checked,
    onChange,
    id,
}: {
    checked: boolean
    onChange: (v: boolean) => void
    id: string
}) {
    return (
        <label htmlFor={id} className={styles.toggle}>
            <input
                id={id}
                type="checkbox"
                role="switch"
                aria-checked={checked}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className={styles.toggleInput}
            />
            <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb} />
            </span>
        </label>
    )
}

// ── Checkbox component ─────────────────────────────────────────────────
function Checkbox({
    checked,
    onChange,
    id,
    label,
    description,
}: {
    checked: boolean
    onChange: (v: boolean) => void
    id: string
    label: string
    description: string
}) {
    return (
        <label htmlFor={id} className={styles.checkboxRow}>
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className={styles.checkboxInput}
            />
            <span className={styles.checkboxBox} aria-hidden="true" />
            <span className={styles.checkboxText}>
                <span className={styles.checkboxLabel}>{label}</span>
                <span className={styles.checkboxDesc}>{description}</span>
            </span>
        </label>
    )
}

// ── Setting card ───────────────────────────────────────────────────────
function SettingCard({
    title,
    description,
    control,
    children,
}: {
    title: string
    description: string
    control: React.ReactNode
    children?: React.ReactNode
}) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardText}>
                    <p className={styles.cardTitle}>{title}</p>
                    <p className={styles.cardDesc}>{description}</p>
                </div>
                <div className={styles.cardControl}>{control}</div>
            </div>
            {children && <div className={styles.cardBody}>{children}</div>}
        </div>
    )
}

// ── Voice picker modal ─────────────────────────────────────────────────
function VoicePicker({
    value,
    onChange,
}: {
    value: VoiceType
    onChange: (v: VoiceType) => void
}) {
    const [open, setOpen] = useState(false)

    return (
        <div className={styles.voicePickerWrap}>
            <button
                type="button"
                className={styles.voiceBtn}
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
            >
                <span>{VOICE_LABELS[value]}</span>
                <ChevronRight size={16} strokeWidth={2} className={open ? styles.chevronOpen : ""} />
            </button>
            {open && (
                <div className={styles.voiceMenu} role="listbox">
                    {(Object.keys(VOICE_LABELS) as VoiceType[]).map((v) => (
                        <button
                            key={v}
                            type="button"
                            role="option"
                            aria-selected={value === v}
                            className={`${styles.voiceOption} ${value === v ? styles.voiceOptionActive : ""}`}
                            onClick={() => {
                                onChange(v)
                                setOpen(false)
                            }}
                        >
                            {VOICE_LABELS[v]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

type Settings = {
    furigana:    boolean
    romaji:      boolean
    darkMode:    boolean
    voice:       VoiceType
    emailNotif:  boolean
    emailLearn:  boolean
    emailDisc:   boolean
    emailJob:    boolean
    pushNotif:   boolean
}

function loadSettings(): Settings {
    return {
        furigana:   loadBool(KEY_FURIGANA,    true),
        romaji:     loadBool(KEY_ROMAJI,      false),
        darkMode:   loadBool(KEY_DARK_MODE,   false),
        voice:      (localStorage.getItem(KEY_VOICE) as VoiceType | null) ?? "robot",
        emailNotif: loadBool(KEY_EMAIL_NOTIF, false),
        emailLearn: loadBool(KEY_EMAIL_LEARN, false),
        emailDisc:  loadBool(KEY_EMAIL_DISC,  false),
        emailJob:   loadBool(KEY_EMAIL_JOB,   false),
        pushNotif:  loadBool(KEY_PUSH_NOTIF,  false),
    }
}

// ── Main component ─────────────────────────────────────────────────────
export default function SettingsClient() {
    const [settings, setSettings] = useState<Settings | null>(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings(loadSettings())
    }, [])

    const BOOL_KEYS: Record<string, string> = {
        furigana:   KEY_FURIGANA,
        romaji:     KEY_ROMAJI,
        darkMode:   KEY_DARK_MODE,
        emailNotif: KEY_EMAIL_NOTIF,
        emailLearn: KEY_EMAIL_LEARN,
        emailDisc:  KEY_EMAIL_DISC,
        emailJob:   KEY_EMAIL_JOB,
        pushNotif:  KEY_PUSH_NOTIF,
    }

    function applyDomAttribute(key: keyof Settings, value: Settings[keyof Settings]) {
        const el = document.documentElement
        if (key === "darkMode") {
            el.setAttribute("data-theme", value ? "dark" : "light")
        } else if (key === "furigana") {
            if (value) el.removeAttribute("data-furigana")
            else el.setAttribute("data-furigana", "false")
        } else if (key === "romaji") {
            if (value) el.setAttribute("data-romaji", "true")
            else el.removeAttribute("data-romaji")
        }
    }

    function update<K extends keyof Settings>(key: K, value: Settings[K]) {
        setSettings((prev) => prev ? { ...prev, [key]: value } : prev)
        if (typeof value === "boolean") {
            const storageKey = BOOL_KEYS[key as string]
            if (storageKey) saveBool(storageKey, value)
        } else {
            localStorage.setItem(KEY_VOICE, String(value))
        }
        applyDomAttribute(key, value)
    }

    function handleDarkMode(v: boolean) {
        update("darkMode", v)
    }

    function handleEmailNotif(v: boolean) {
        setSettings((prev) => prev ? {
            ...prev,
            emailNotif: v,
            emailLearn: v ? prev.emailLearn : false,
            emailDisc:  v ? prev.emailDisc  : false,
            emailJob:   v ? prev.emailJob   : false,
        } : prev)
        saveBool(KEY_EMAIL_NOTIF, v)
        if (!v) {
            saveBool(KEY_EMAIL_LEARN, false)
            saveBool(KEY_EMAIL_DISC,  false)
            saveBool(KEY_EMAIL_JOB,   false)
        }
    }

    // Prevent hydration mismatch — show placeholder until localStorage is read
    if (!settings) {
        return <div className={styles.grid} />
    }

    const { furigana, romaji, darkMode, voice, emailNotif, emailLearn, emailDisc, emailJob, pushNotif } = settings

    return (
        <div className={styles.grid}>
            {/* Row 1 */}
            <SettingCard
                title="Hiện furigana (cách đọc của kanji)"
                description="Hiển thị cách đọc từng chữ Kanji bằng Hiragana để dễ học và ghi nhớ."
                control={
                    <Toggle
                        id="setting-furigana"
                        checked={furigana}
                        onChange={(v) => update("furigana", v)}
                    />
                }
            />
            <SettingCard
                title="Hiện romaji (cách đọc latin)"
                description="Hiển thị cách đọc từng chữ Kanji bằng Romaji để dễ học và ghi nhớ."
                control={
                    <Toggle
                        id="setting-romaji"
                        checked={romaji}
                        onChange={(v) => update("romaji", v)}
                    />
                }
            />

            {/* Row 2 */}
            <SettingCard
                title="Chế độ ban đêm"
                description="Cài đặt chế độ hiển thị để phù hợp trong lúc dùng ứng dụng."
                control={
                    <Toggle
                        id="setting-dark-mode"
                        checked={darkMode}
                        onChange={handleDarkMode}
                    />
                }
            />
            <SettingCard
                title="Giọng đọc"
                description="Chọn giọng đọc phát âm cho từ vựng."
                control={
                    <VoicePicker
                        value={voice}
                        onChange={(v) => update("voice", v)}
                    />
                }
            />

            {/* Row 3 */}
            <SettingCard
                title="Thông báo mail"
                description="Nhận thông báo mới nhất qua email về các nội dung bạn quan tâm. (Sắp ra mắt)"
                control={
                    <Toggle
                        id="setting-email-notif"
                        checked={emailNotif}
                        onChange={handleEmailNotif}
                    />
                }
            >
                {emailNotif && (
                    <div className={styles.checkboxGroup}>
                        <Checkbox
                            id="setting-email-learn"
                            label="Học tập"
                            description="Cập nhật tài liệu, khóa học và mẹo học hiệu quả."
                            checked={emailLearn}
                            onChange={(v) => update("emailLearn", v)}
                        />
                        <Checkbox
                            id="setting-email-disc"
                            label="Giảm giá"
                            description="Thông tin ưu đãi và mã khuyến mãi mới nhất."
                            checked={emailDisc}
                            onChange={(v) => update("emailDisc", v)}
                        />
                        <Checkbox
                            id="setting-email-job"
                            label="Việc làm"
                            description="Cơ hội nghề nghiệp phù hợp với bạn được gửi trực tiếp qua email."
                            checked={emailJob}
                            onChange={(v) => update("emailJob", v)}
                        />
                    </div>
                )}
            </SettingCard>

            <SettingCard
                title="Thông báo"
                description="Nhận thông báo để không bỏ lỡ thông tin quan trọng. (Sắp ra mắt)"
                control={
                    <Toggle
                        id="setting-push-notif"
                        checked={pushNotif}
                        onChange={(v) => update("pushNotif", v)}
                    />
                }
            />
        </div>
    )
}
