"use client"

import {
    FormEvent,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"

import { X } from "lucide-react"

import { createSupabaseBrowserClient } from "@/shared/lib/supabase/auth-client"

import styles from "./AuthModal.module.css"

import { useFocusTrap } from "@/shared/hooks/useFocusTrap"

const RESEND_COOLDOWN = 60

type Step = "email" | "otp"

type AuthModalProps = {
    open: boolean
    onClose: () => void
    initialError?: string
}

export default function AuthModal({ open, onClose, initialError }: AuthModalProps) {
    const [step, setStep] = useState<Step>("email")
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(initialError ?? null)
    const [sent, setSent] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    const handleCloseRef = useRef<() => void>(null!)
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") handleCloseRef.current()
        }
        document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [open])

    useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [resendCooldown])

    function resetState() {
        setStep("email")
        setEmail("")
        setOtp("")
        setError(null)
        setSent(false)
        setLoading(false)
        setResendCooldown(0)
    }

    function handleClose() {
        resetState()
        onClose()
    }
    useLayoutEffect(() => { handleCloseRef.current = handleClose })

    useFocusTrap(modalRef, open, handleClose)

    async function handleSendOtp(e: FormEvent) {
        e.preventDefault()
        const trimmed = email.trim()
        if (!trimmed) return

        setLoading(true)
        setError(null)

        const supabase = createSupabaseBrowserClient()
        const { error: err } = await supabase.auth.signInWithOtp({
            email: trimmed,
            options: { shouldCreateUser: true },
        })

        setLoading(false)

        if (err) {
            setError("Không thể gửi mã. Vui lòng thử lại.")
            return
        }

        setSent(true)
        setStep("otp")
        setResendCooldown(RESEND_COOLDOWN)
    }

    async function handleResendOtp() {
        const trimmed = email.trim()
        if (!trimmed || resendCooldown > 0) return

        setLoading(true)
        setError(null)

        const supabase = createSupabaseBrowserClient()
        const { error: err } = await supabase.auth.signInWithOtp({
            email: trimmed,
            options: { shouldCreateUser: true },
        })

        setLoading(false)

        if (err) {
            setError("Không thể gửi lại mã. Vui lòng thử lại.")
            return
        }

        setSent(true)
        setResendCooldown(RESEND_COOLDOWN)
    }

    async function handleVerifyOtp(e: FormEvent) {
        e.preventDefault()
        const trimmed = otp.trim()
        if (!trimmed) return

        setLoading(true)
        setError(null)

        const supabase = createSupabaseBrowserClient()
        const { error: err } = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: trimmed,
            type: "email",
        })

        setLoading(false)

        if (err) {
            setError("Mã không đúng hoặc đã hết hạn. Vui lòng thử lại.")
            return
        }

        handleClose()
    }

    async function handleGoogleSignIn() {
        setLoading(true)
        setError(null)

        const supabase = createSupabaseBrowserClient()
        const { error: err } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (err) {
            setLoading(false)
            setError("Không thể đăng nhập bằng Google. Vui lòng thử lại.")
        }
    }

    if (!open) return null

    return (
        <div className={styles.overlay} role="presentation" onClick={handleClose}>
            <div
                className={styles.modal}
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Đăng nhập"
            >
                <div className={styles.header}>
                    <h2>Đăng nhập</h2>
                    <button
                        className={styles.closeButton}
                        onClick={handleClose}
                        aria-label="Đóng"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className={styles.body}>
                    <p className={styles.description}>
                        Đăng nhập để lưu từ vựng, hán tự và ngữ pháp vào sổ tay cá nhân.
                    </p>

                    <button
                        className={styles.googleButton}
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        type="button"
                    >
                        <GoogleIcon />
                        Đăng nhập bằng Google
                    </button>

                    <div className={styles.divider}>
                        <span>hoặc</span>
                    </div>

                    {step === "email" ? (
                        <form onSubmit={handleSendOtp} className={styles.form}>
                            <label className={styles.label} htmlFor="auth-email">
                                Email
                            </label>
                            <input
                                id="auth-email"
                                className={styles.input}
                                type="email"
                                placeholder="ban@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                                required
                                disabled={loading}
                            />
                            {error && <p className={styles.error}>{error}</p>}
                            <button
                                className={styles.primaryButton}
                                type="submit"
                                disabled={loading || !email.trim()}
                            >
                                {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className={styles.form}>
                            {sent && (
                                <p className={styles.sentNote}>
                                    Mã xác nhận đã gửi đến <strong>{email}</strong>
                                </p>
                            )}
                            <label className={styles.label} htmlFor="auth-otp">
                                Mã xác nhận
                            </label>
                            <input
                                id="auth-otp"
                                className={styles.input}
                                type="text"
                                inputMode="numeric"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                autoFocus
                                maxLength={6}
                                required
                                disabled={loading}
                            />
                            {error && <p className={styles.error}>{error}</p>}
                            <button
                                className={styles.primaryButton}
                                type="submit"
                                disabled={loading || otp.trim().length < 6}
                            >
                                {loading ? "Đang xác nhận..." : "Xác nhận"}
                            </button>
                            <button
                                className={styles.textButton}
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading || resendCooldown > 0}
                            >
                                {resendCooldown > 0
                                    ? `Gửi lại mã (${resendCooldown}s)`
                                    : "Gửi lại mã"}
                            </button>
                            <button
                                className={styles.textButton}
                                type="button"
                                onClick={() => {
                                    setStep("email")
                                    setOtp("")
                                    setError(null)
                                }}
                            >
                                Đổi email khác
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
            />
            <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
            />
            <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
            />
            <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
            />
        </svg>
    )
}
