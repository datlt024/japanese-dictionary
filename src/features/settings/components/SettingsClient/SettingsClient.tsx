"use client"

import { useEffect, useState } from "react"
import { Card, Checkbox, Select, Switch, Typography } from "antd"

const { Text } = Typography

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

const VOICE_OPTIONS = [
    { value: "robot",  label: "Robot" },
    { value: "male",   label: "Nam" },
    { value: "female", label: "Nữ" },
]

function loadBool(key: string, fallback: boolean): boolean {
    if (typeof window === "undefined") return fallback
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === "true"
}

function saveBool(key: string, value: boolean) {
    localStorage.setItem(key, String(value))
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

function SettingRow({
    title,
    description,
    control,
}: {
    title: string
    description: string
    control: React.ReactNode
}) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "14px 0", borderBottom: "1px solid #F3F4F6" }}>
            <div>
                <Text style={{ fontWeight: 500, fontSize: 14, display: "block" }}>{title}</Text>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 2, display: "block" }}>{description}</Text>
            </div>
            <div style={{ flexShrink: 0 }}>{control}</div>
        </div>
    )
}

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

    if (!settings) return <div style={{ minHeight: 400 }} />

    const { furigana, romaji, darkMode, voice, emailNotif, emailLearn, emailDisc, emailJob, pushNotif } = settings

    const cardStyle = { borderColor: "#E5EAF2", marginBottom: 16 }
    const cardBodyStyle = { padding: "0 24px" }

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 64px" }}>

            <Card title="Hiển thị" style={cardStyle} styles={{ body: cardBodyStyle }}>
                <SettingRow
                    title="Hiện furigana (cách đọc của kanji)"
                    description="Hiển thị cách đọc từng chữ Kanji bằng Hiragana để dễ học và ghi nhớ."
                    control={<Switch checked={furigana} onChange={(v) => update("furigana", v)} />}
                />
                <SettingRow
                    title="Hiện romaji (cách đọc latin)"
                    description="Hiển thị cách đọc từng chữ Kanji bằng Romaji để dễ học và ghi nhớ."
                    control={<Switch checked={romaji} onChange={(v) => update("romaji", v)} />}
                />
                <div style={{ padding: "14px 0" }}>
                    <SettingRow
                        title="Chế độ ban đêm"
                        description="Cài đặt chế độ hiển thị để phù hợp trong lúc dùng ứng dụng."
                        control={<Switch checked={darkMode} onChange={(v) => update("darkMode", v)} />}
                    />
                </div>
            </Card>

            <Card title="Âm thanh" style={cardStyle} styles={{ body: cardBodyStyle }}>
                <div style={{ padding: "14px 0" }}>
                    <SettingRow
                        title="Giọng đọc"
                        description="Chọn giọng đọc phát âm cho từ vựng."
                        control={
                            <Select
                                value={voice}
                                onChange={(v) => update("voice", v as VoiceType)}
                                options={VOICE_OPTIONS}
                                style={{ width: 100 }}
                                size="small"
                            />
                        }
                    />
                </div>
            </Card>

            <Card title="Thông báo" style={cardStyle} styles={{ body: cardBodyStyle }}>
                <SettingRow
                    title="Thông báo mail"
                    description="Nhận thông báo mới nhất qua email về các nội dung bạn quan tâm. (Sắp ra mắt)"
                    control={<Switch checked={emailNotif} onChange={handleEmailNotif} />}
                />
                {emailNotif && (
                    <div style={{ padding: "12px 0 4px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                        <Checkbox
                            checked={emailLearn}
                            onChange={(e) => update("emailLearn", e.target.checked)}
                        >
                            <div>
                                <Text style={{ fontSize: 13, fontWeight: 500 }}>Học tập</Text>
                                <Text type="secondary" style={{ fontSize: 12, display: "block" }}>Cập nhật tài liệu, khóa học và mẹo học hiệu quả.</Text>
                            </div>
                        </Checkbox>
                        <Checkbox
                            checked={emailDisc}
                            onChange={(e) => update("emailDisc", e.target.checked)}
                        >
                            <div>
                                <Text style={{ fontSize: 13, fontWeight: 500 }}>Giảm giá</Text>
                                <Text type="secondary" style={{ fontSize: 12, display: "block" }}>Thông tin ưu đãi và mã khuyến mãi mới nhất.</Text>
                            </div>
                        </Checkbox>
                        <Checkbox
                            checked={emailJob}
                            onChange={(e) => update("emailJob", e.target.checked)}
                        >
                            <div>
                                <Text style={{ fontSize: 13, fontWeight: 500 }}>Việc làm</Text>
                                <Text type="secondary" style={{ fontSize: 12, display: "block" }}>Cơ hội nghề nghiệp phù hợp với bạn được gửi trực tiếp qua email.</Text>
                            </div>
                        </Checkbox>
                    </div>
                )}
                <div style={{ padding: "14px 0" }}>
                    <SettingRow
                        title="Thông báo"
                        description="Nhận thông báo để không bỏ lỡ thông tin quan trọng. (Sắp ra mắt)"
                        control={<Switch checked={pushNotif} onChange={(v) => update("pushNotif", v)} />}
                    />
                </div>
            </Card>

        </div>
    )
}
