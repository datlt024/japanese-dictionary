"use client"

import { useState } from "react"
import { Alert, Button, Divider, Form, Input, Modal, Typography } from "antd"
import { GoogleOutlined } from "@ant-design/icons"

import { createSupabaseBrowserClient } from "@/shared/lib/supabase/auth-client"

const { Text, Link } = Typography

type Step = "signin" | "signup" | "forgot" | "sent"

type AuthModalProps = {
    open: boolean
    onClose: () => void
    initialError?: string
}

export default function AuthModal({ open, onClose, initialError }: AuthModalProps) {
    const [step, setStep] = useState<Step>("signin")
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(initialError ?? null)
    const [sentContext, setSentContext] = useState<"signup" | "forgot">("forgot")
    const [signinForm] = Form.useForm()
    const [signupForm] = Form.useForm()
    const [forgotForm] = Form.useForm()

    function resetState() {
        setStep("signin")
        setEmail("")
        setError(null)
        setLoading(false)
        signinForm.resetFields()
        signupForm.resetFields()
        forgotForm.resetFields()
    }

    function goTo(s: Step) {
        setError(null)
        setStep(s)
    }

    async function handleSignIn(values: { email: string; password: string }) {
        setLoading(true)
        setError(null)
        try {
            const supabase = createSupabaseBrowserClient()
            const { error: err } = await supabase.auth.signInWithPassword({
                email: values.email.trim(),
                password: values.password,
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
            onClose()
        } catch {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    async function handleSignUp(values: { email: string; password: string; confirmPassword: string }) {
        if (values.password !== values.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.")
            return
        }
        setLoading(true)
        setError(null)
        try {
            const supabase = createSupabaseBrowserClient()
            const { data, error: err } = await supabase.auth.signUp({
                email: values.email.trim(),
                password: values.password,
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
                onClose()
            } else {
                setEmail(values.email.trim())
                setSentContext("signup")
                setStep("sent")
            }
        } catch {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    async function handleForgotPassword(values: { email: string }) {
        setLoading(true)
        setError(null)
        try {
            const supabase = createSupabaseBrowserClient()
            const { error: err } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
                redirectTo: `${window.location.origin}/auth/callback`,
            })
            if (err) {
                setError("Không thể gửi email đặt lại. Vui lòng thử lại.")
                return
            }
            setEmail(values.email.trim())
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
        } catch {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.")
            setLoading(false)
        }
    }

    const titles: Record<Step, string> = {
        signin: "Đăng nhập",
        signup: "Đăng ký",
        forgot: "Quên mật khẩu",
        sent: sentContext === "signup" ? "Xác nhận email" : "Kiểm tra email",
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={titles[step]}
            footer={null}
            width={400}
            destroyOnHidden
            afterClose={resetState}
            styles={{
                header: { paddingBottom: 12, borderBottom: "1px solid #E5EAF2" },
                body: { paddingTop: 20 },
            }}
        >
            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                    closable
                    onClose={() => setError(null)}
                />
            )}

            {/* ── Sign In ── */}
            {step === "signin" && (
                <>
                    <Button
                        block
                        size="large"
                        icon={<GoogleOutlined />}
                        onClick={handleGoogleSignIn}
                        loading={loading}
                        style={{ marginBottom: 16, height: 42 }}
                    >
                        Đăng nhập bằng Google
                    </Button>

                    <Divider style={{ margin: "0 0 16px" }}>hoặc</Divider>

                    <Form form={signinForm} layout="vertical" onFinish={handleSignIn} requiredMark={false}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}
                        >
                            <Input
                                size="large"
                                placeholder="ban@example.com"
                                autoComplete="email"
                                autoFocus
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    Mật khẩu
                                    <Link onClick={() => goTo("forgot")} style={{ fontSize: 12 }}>
                                        Quên mật khẩu?
                                    </Link>
                                </span>
                            }
                            name="password"
                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 8 }}>
                            <Button
                                block
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={loading}
                                style={{ height: 42, fontWeight: 600 }}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ textAlign: "center", marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Chưa có tài khoản?{" "}
                            <Link onClick={() => goTo("signup")}>Đăng ký ngay</Link>
                        </Text>
                    </div>
                </>
            )}

            {/* ── Sign Up ── */}
            {step === "signup" && (
                <>
                    <Button
                        block
                        size="large"
                        icon={<GoogleOutlined />}
                        onClick={handleGoogleSignIn}
                        loading={loading}
                        style={{ marginBottom: 16, height: 42 }}
                    >
                        Đăng ký bằng Google
                    </Button>

                    <Divider style={{ margin: "0 0 16px" }}>hoặc</Divider>

                    <Form form={signupForm} layout="vertical" onFinish={handleSignUp} requiredMark={false}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}
                        >
                            <Input
                                size="large"
                                placeholder="ban@example.com"
                                autoComplete="email"
                                autoFocus
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="Ít nhất 6 ký tự"
                                autoComplete="new-password"
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
                        >
                            <Input.Password
                                size="large"
                                placeholder="Nhập lại mật khẩu"
                                autoComplete="new-password"
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 8 }}>
                            <Button
                                block
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={loading}
                                style={{ height: 42, fontWeight: 600 }}
                            >
                                Đăng ký
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ textAlign: "center", marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Đã có tài khoản?{" "}
                            <Link onClick={() => goTo("signin")}>Đăng nhập</Link>
                        </Text>
                    </div>
                </>
            )}

            {/* ── Forgot Password ── */}
            {step === "forgot" && (
                <>
                    <Text type="secondary" style={{ display: "block", marginBottom: 16, fontSize: 13 }}>
                        Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
                    </Text>

                    <Form form={forgotForm} layout="vertical" onFinish={handleForgotPassword} requiredMark={false}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}
                        >
                            <Input
                                size="large"
                                placeholder="ban@example.com"
                                autoComplete="email"
                                autoFocus
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 8 }}>
                            <Button
                                block
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={loading}
                                style={{ height: 42, fontWeight: 600 }}
                            >
                                Gửi liên kết đặt lại
                            </Button>
                        </Form.Item>
                    </Form>

                    <Button type="link" onClick={() => goTo("signin")} style={{ padding: 0 }}>
                        ← Quay lại đăng nhập
                    </Button>
                </>
            )}

            {/* ── Sent ── */}
            {step === "sent" && (
                <>
                    <div style={{
                        background: "#ECFDF3",
                        border: "1px solid #BBF7D0",
                        borderRadius: 10,
                        padding: "20px 20px",
                        marginBottom: 20,
                        textAlign: "center",
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#166534", marginBottom: 8 }}>
                            {sentContext === "signup" ? "Xác nhận tài khoản" : "Email đã được gửi"}
                        </div>
                        <div style={{ fontSize: 13, color: "#15803D", lineHeight: 1.6 }}>
                            {sentContext === "signup"
                                ? "Chúng tôi đã gửi email xác nhận đến "
                                : "Chúng tôi đã gửi liên kết đặt lại mật khẩu đến "
                            }
                            <strong>{email}</strong>
                            {". Vui lòng kiểm tra hộp thư và làm theo hướng dẫn."}
                        </div>
                    </div>

                    <Button type="link" onClick={() => goTo("signin")} style={{ padding: 0 }}>
                        ← Quay lại đăng nhập
                    </Button>
                </>
            )}
        </Modal>
    )
}
