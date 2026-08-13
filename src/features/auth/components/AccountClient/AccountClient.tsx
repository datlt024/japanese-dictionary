"use client"

import {
    FormEvent,
    useState,
} from "react"

import { createSupabaseBrowserClient } from "@/shared/lib/supabase/auth-client"

import styles from "./AccountClient.module.css"

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"]

type Props = {
    email: string
    initialDisplayName: string
    initialJlptLevel: string | null
    hasPassword: boolean
}

type SectionStatus = { ok: string } | { err: string } | null

export default function AccountClient({ email, initialDisplayName, initialJlptLevel, hasPassword }: Props) {
    // ── Profile section ──
    const [displayName, setDisplayName] = useState(initialDisplayName)
    const [jlptLevel, setJlptLevel] = useState(initialJlptLevel ?? "")
    const [profileStatus, setProfileStatus] = useState<SectionStatus>(null)
    const [profileSaving, setProfileSaving] = useState(false)

    // ── Email section ──
    const [newEmail, setNewEmail] = useState("")
    const [emailStatus, setEmailStatus] = useState<SectionStatus>(null)
    const [emailSaving, setEmailSaving] = useState(false)

    // ── Password section ──
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordStatus, setPasswordStatus] = useState<SectionStatus>(null)
    const [passwordSaving, setPasswordSaving] = useState(false)

    async function handleProfileSave(e: FormEvent) {
        e.preventDefault()
        if (profileSaving) return
        setProfileSaving(true)
        setProfileStatus(null)

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    display_name: displayName.trim(),
                    jlpt_level: jlptLevel || null,
                }),
            })
            const json = await res.json()
            if (!res.ok) {
                setProfileStatus({ err: json.error ?? "Lưu thất bại" })
            } else {
                setProfileStatus({ ok: "Đã lưu hồ sơ thành công" })
            }
        } catch {
            setProfileStatus({ err: "Có lỗi xảy ra, thử lại sau" })
        } finally {
            setProfileSaving(false)
        }
    }

    async function handleEmailChange(e: FormEvent) {
        e.preventDefault()
        if (emailSaving) return
        const trimmed = newEmail.trim()
        if (!trimmed) return
        if (trimmed === email) {
            setEmailStatus({ err: "Email mới phải khác email hiện tại" })
            return
        }
        setEmailSaving(true)
        setEmailStatus(null)

        try {
            const supabase = createSupabaseBrowserClient()
            const { error } = await supabase.auth.updateUser({ email: trimmed })
            if (error) {
                setEmailStatus({ err: error.message })
            } else {
                setEmailStatus({ ok: `Email xác nhận đã gửi đến ${trimmed}. Kiểm tra hộp thư để hoàn tất.` })
                setNewEmail("")
            }
        } catch {
            setEmailStatus({ err: "Có lỗi xảy ra, thử lại sau" })
        } finally {
            setEmailSaving(false)
        }
    }

    async function handlePasswordChange(e: FormEvent) {
        e.preventDefault()
        if (passwordSaving) return
        if (newPassword.length < 8) {
            setPasswordStatus({ err: "Mật khẩu phải có ít nhất 8 ký tự" })
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordStatus({ err: "Mật khẩu xác nhận không khớp" })
            return
        }
        setPasswordSaving(true)
        setPasswordStatus(null)

        try {
            const supabase = createSupabaseBrowserClient()
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) {
                setPasswordStatus({ err: error.message })
            } else {
                setPasswordStatus({ ok: "Mật khẩu đã được cập nhật thành công" })
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch {
            setPasswordStatus({ err: "Có lỗi xảy ra, thử lại sau" })
        } finally {
            setPasswordSaving(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Hồ sơ &amp; Tài khoản</h2>
                <p className={styles.pageDesc}>Quản lý thông tin cá nhân và bảo mật tài khoản của bạn</p>
            </div>

            <div className={styles.sections}>
                {/* ── Hồ sơ công khai ── */}
                <section className={styles.section}>
                    <div className={styles.sectionHead}>
                        <h3 className={styles.sectionTitle}>Hồ sơ công khai</h3>
                        <p className={styles.sectionDesc}>
                            Tên và trình độ hiển thị khi bạn bình luận trong cộng đồng
                        </p>
                    </div>

                    <form className={styles.form} onSubmit={handleProfileSave}>
                        <div className={styles.avatarRow}>
                            <div className={styles.avatarCircle}>
                                {displayName ? displayName[0].toUpperCase() : email[0].toUpperCase()}
                            </div>
                            <div>
                                <p className={styles.avatarHint}>Ảnh đại diện được tạo tự động từ tên hiển thị</p>
                            </div>
                        </div>

                        <div className={styles.fieldRow}>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="display-name">
                                    Tên hiển thị
                                </label>
                                <input
                                    id="display-name"
                                    className={styles.input}
                                    type="text"
                                    placeholder="Nhập tên hiển thị"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    maxLength={30}
                                    required
                                />
                                <span className={styles.fieldHint}>{displayName.length}/30 ký tự</span>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="jlpt-level">
                                    Trình độ JLPT
                                </label>
                                <select
                                    id="jlpt-level"
                                    className={styles.select}
                                    value={jlptLevel}
                                    onChange={(e) => setJlptLevel(e.target.value)}
                                >
                                    <option value="">Chưa xác định</option>
                                    {JLPT_LEVELS.map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <StatusMessage status={profileStatus} />

                        <div className={styles.formFooter}>
                            <button
                                type="submit"
                                className={styles.saveButton}
                                disabled={profileSaving || !displayName.trim()}
                            >
                                {profileSaving ? "Đang lưu..." : "Lưu hồ sơ"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* ── Thông tin tài khoản ── */}
                <section className={styles.section}>
                    <div className={styles.sectionHead}>
                        <h3 className={styles.sectionTitle}>Địa chỉ email</h3>
                        <p className={styles.sectionDesc}>
                            Đổi email đăng nhập — Supabase sẽ gửi xác nhận đến địa chỉ mới
                        </p>
                    </div>

                    <form className={styles.form} onSubmit={handleEmailChange}>
                        <div className={styles.field}>
                            <label className={styles.label}>Email hiện tại</label>
                            <input
                                className={`${styles.input} ${styles.inputReadonly}`}
                                type="email"
                                value={email}
                                readOnly
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="new-email">
                                Email mới
                            </label>
                            <input
                                id="new-email"
                                className={styles.input}
                                type="email"
                                placeholder="email-moi@example.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                                disabled={emailSaving}
                            />
                        </div>

                        <StatusMessage status={emailStatus} />

                        <div className={styles.formFooter}>
                            <button
                                type="submit"
                                className={styles.saveButton}
                                disabled={emailSaving || !newEmail.trim()}
                            >
                                {emailSaving ? "Đang gửi..." : "Gửi xác nhận đổi email"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* ── Bảo mật ── */}
                <section className={styles.section}>
                    <div className={styles.sectionHead}>
                        <h3 className={styles.sectionTitle}>Mật khẩu</h3>
                        <p className={styles.sectionDesc}>
                            {hasPassword
                                ? "Đổi mật khẩu đăng nhập hiện tại của bạn"
                                : "Đặt mật khẩu để có thêm phương thức đăng nhập"}
                        </p>
                    </div>

                    <form className={styles.form} onSubmit={handlePasswordChange}>
                        <div className={styles.fieldRow}>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="new-password">
                                    {hasPassword ? "Mật khẩu mới" : "Đặt mật khẩu"}
                                </label>
                                <input
                                    id="new-password"
                                    className={styles.input}
                                    type="password"
                                    placeholder="Ít nhất 8 ký tự"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={8}
                                    required
                                    disabled={passwordSaving}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="confirm-password">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirm-password"
                                    className={styles.input}
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={passwordSaving}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <StatusMessage status={passwordStatus} />

                        <div className={styles.formFooter}>
                            <button
                                type="submit"
                                className={styles.saveButton}
                                disabled={passwordSaving || !newPassword || !confirmPassword}
                            >
                                {passwordSaving ? "Đang cập nhật..." : hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    )
}

function StatusMessage({ status }: { status: SectionStatus }) {
    if (!status) return null
    if ("ok" in status) {
        return <p className={styles.statusOk}>{status.ok}</p>
    }
    return <p className={styles.statusErr}>{status.err}</p>
}
