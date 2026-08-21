"use client"

import {
    FormEvent,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"

import { Eye, EyeOff, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { createSupabaseBrowserClient } from "@/shared/lib/supabase/auth-client"
import { useFocusTrap } from "@/shared/hooks/useFocusTrap"

import styles from "./AuthModal.module.css"

type Step = "signin" | "signup" | "forgot" | "sent"

type AuthModalProps = {
    open: boolean
    onClose: () => void
    initialError?: string
}

export default function AuthModal({ open, onClose, initialError }: AuthModalProps) {
    const router = useRouter()
    const [step, setStep] = useState<Step>("signin")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(initialError ?? null)
    const [sentContext, setSentContext] = useState<"signup" | "forgot">("forgot")

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

    function resetState() {
        setStep("signin")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setShowPassword(false)
        setShowConfirmPassword(false)
        setError(null)
        setLoading(false)
    }

    function handleClose() {
        resetState()
        onClose()
    }
    useLayoutEffect(() => { handleCloseRef.current = handleClose })

    useFocusTrap(modalRef, open, handleClose)

    function goTo(s: Step) {
        setError(null)
        setPassword("")
        setConfirmPassword("")
        setShowPassword(false)
        setShowConfirmPassword(false)
        setStep(s)
    }

    async function handleSignIn(e: FormEvent) {
        e.preventDefault()
        if (!email.trim() || !password) return
        setLoading(true)
        setError(null)

        try {
            const supabase = createSupabaseBrowserClient()
            const { error: err } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            })

            if (err) {
                const msg = err.message.toLowerCase()
                if (msg.includes("invalid") || msg.includes("credentials")) {
                    setError("Email hoặc mật khẩu không đúng.")
                } else if (msg.includes("not confirmed")) {
                    setError("Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.")
                } else {
                    setError("Đăng nhập thất bại. Vui lòng thử lại.")
                }
                return
            }

            handleClose()
            try {
                const res = await fetch("/api/me/is-admin")
                if (res.ok) {
                    const { isAdmin } = await res.json() as { isAdmin: boolean }
                    if (isAdmin) {
                        router.push("/admin/dashboard")
                        return
                    }
                }
            } catch {}
            router.refresh()
        } catch {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    async function handleSignUp(e: FormEvent) {
        e.preventDefault()
        if (!email.trim() || !password || !confirmPassword) return

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.")
            return
        }
        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const supabase = createSupabaseBrowserClient()
            const { data, error: err } = await supabase.auth.signUp({
                email: email.trim(),
                password,
            })

            if (err) {
                const msg = err.message.toLowerCase()
                if (msg.includes("already") || msg.includes("registered")) {
                    setError("Email này đã được đăng ký. Vui lòng đăng nhập.")
                } else {
                    setError("Đăng ký thất bại. Vui lòng thử lại.")
                }
                return
            }

            if (data.session) {
                handleClose()
                router.refresh()
            } else {
                setSentContext("signup")
                setStep("sent")
            }
        } catch {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    async function handleForgotPassword(e: FormEvent) {
        e.preventDefault()
        if (!email.trim()) return
        setLoading(true)
        setError(null)

        try {
            const supabase = createSupabaseBrowserClient()
            const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/auth/callback`,
            })

            if (err) {
                setError("Không thể gửi email đặt lại. Vui lòng thử lại.")
                return
            }

            setSentContext("forgot")
            setStep("sent")
        } catch {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    async function handleGoogleSignIn() {
        setLoading(true)
        setError(null)

        try {
            const supabase = createSupabaseBrowserClient()
            const { error: err } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            })

            if (err) {
                setError("Không thể đăng nhập bằng Google. Vui lòng thử lại.")
                setLoading(false)
            }
            // Don't setLoading(false) on success — page will redirect
        } catch {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.")
            setLoading(false)
        }
    }

    if (!open) return null

    const titles: Record<Step, string> = {
        signin: "Đăng nhập",
        signup: "Đăng ký",
        forgot: "Quên mật khẩu",
        sent: sentContext === "signup" ? "Xác nhận email" : "Kiểm tra email",
    }

    return (
        <div className={styles.overlay} role="presentation" onClick={handleClose}>
            <div
                className={styles.modal}
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={titles[step]}
            >
                <div className={styles.header}>
                    <h2>{titles[step]}</h2>
                    <button
                        className={styles.closeButton}
                        onClick={handleClose}
                        aria-label="Đóng"
                        type="button"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className={styles.body}>

                    {/* ── Sign In ── */}
                    {step === "signin" && (
                        <>
                            <button
                                className={styles.googleButton}
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                type="button"
                            >
                                <GoogleIcon />
                                Đăng nhập bằng Google
                            </button>

                            <div className={styles.divider}><span>hoặc</span></div>

                            <form onSubmit={handleSignIn} className={styles.form}>
                                <label className={styles.label} htmlFor="auth-email">Email</label>
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
                                    autoComplete="email"
                                />

                                <div className={styles.labelRow}>
                                    <label className={styles.label} htmlFor="auth-password">Mật khẩu</label>
                                    <button
                                        type="button"
                                        className={styles.forgotLink}
                                        onClick={() => goTo("forgot")}
                                    >
                                        Quên mật khẩu?
                                    </button>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="auth-password"
                                        className={styles.input}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setShowPassword((v) => !v)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>

                                {error && <p className={styles.error}>{error}</p>}

                                <button
                                    className={styles.primaryButton}
                                    type="submit"
                                    disabled={loading || !email.trim() || !password}
                                >
                                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                                </button>
                            </form>

                            <p className={styles.switchNote}>
                                Chưa có tài khoản?{" "}
                                <button type="button" className={styles.switchLink} onClick={() => goTo("signup")}>
                                    Đăng ký ngay
                                </button>
                            </p>
                        </>
                    )}

                    {/* ── Sign Up ── */}
                    {step === "signup" && (
                        <>
                            <button
                                className={styles.googleButton}
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                type="button"
                            >
                                <GoogleIcon />
                                Đăng ký bằng Google
                            </button>

                            <div className={styles.divider}><span>hoặc</span></div>

                            <form onSubmit={handleSignUp} className={styles.form}>
                                <label className={styles.label} htmlFor="signup-email">Email</label>
                                <input
                                    id="signup-email"
                                    className={styles.input}
                                    type="email"
                                    placeholder="ban@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                    required
                                    disabled={loading}
                                    autoComplete="email"
                                />

                                <label className={styles.label} htmlFor="signup-password">Mật khẩu</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="signup-password"
                                        className={styles.input}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Ít nhất 6 ký tự"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setShowPassword((v) => !v)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>

                                <label className={styles.label} htmlFor="signup-confirm">Xác nhận mật khẩu</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="signup-confirm"
                                        className={styles.input}
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        tabIndex={-1}
                                        aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>

                                {error && <p className={styles.error}>{error}</p>}

                                <button
                                    className={styles.primaryButton}
                                    type="submit"
                                    disabled={loading || !email.trim() || !password || !confirmPassword}
                                >
                                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                                </button>
                            </form>

                            <p className={styles.switchNote}>
                                Đã có tài khoản?{" "}
                                <button type="button" className={styles.switchLink} onClick={() => goTo("signin")}>
                                    Đăng nhập
                                </button>
                            </p>
                        </>
                    )}

                    {/* ── Forgot Password ── */}
                    {step === "forgot" && (
                        <>
                            <p className={styles.description}>
                                Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
                            </p>

                            <form onSubmit={handleForgotPassword} className={styles.form}>
                                <label className={styles.label} htmlFor="forgot-email">Email</label>
                                <input
                                    id="forgot-email"
                                    className={styles.input}
                                    type="email"
                                    placeholder="ban@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                    required
                                    disabled={loading}
                                    autoComplete="email"
                                />

                                {error && <p className={styles.error}>{error}</p>}

                                <button
                                    className={styles.primaryButton}
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                >
                                    {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                                </button>
                            </form>

                            <button type="button" className={styles.textButton} onClick={() => goTo("signin")}>
                                ← Quay lại đăng nhập
                            </button>
                        </>
                    )}

                    {/* ── Sent ── */}
                    {step === "sent" && (
                        <>
                            <div className={styles.sentBox}>
                                <p className={styles.sentTitle}>
                                    {sentContext === "signup" ? "Xác nhận tài khoản" : "Email đã được gửi"}
                                </p>
                                <p className={styles.sentDesc}>
                                    {sentContext === "signup"
                                        ? "Chúng tôi đã gửi email xác nhận đến "
                                        : "Chúng tôi đã gửi liên kết đặt lại mật khẩu đến "
                                    }
                                    <strong>{email}</strong>
                                    {". Vui lòng kiểm tra hộp thư và làm theo hướng dẫn."}
                                </p>
                            </div>

                            <button type="button" className={styles.textButton} onClick={() => goTo("signin")}>
                                ← Quay lại đăng nhập
                            </button>
                        </>
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
