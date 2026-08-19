"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Alert, Avatar, Button, Card, Form, Input, Select, Typography } from "antd"

import { createSupabaseBrowserClient } from "@/shared/lib/supabase/auth-client"
import { useAuth } from "@/features/auth/hooks/useAuth"

const { Title, Text } = Typography

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"]

type Props = {
    email: string
    initialDisplayName: string
    initialJlptLevel: string | null
    hasPassword: boolean
}

type SectionStatus = { ok: string } | { err: string } | null

export default function AccountClient({ email, initialDisplayName, initialJlptLevel, hasPassword }: Props) {
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading && !user) router.replace("/")
    }, [loading, user, router])

    const [profileStatus, setProfileStatus] = useState<SectionStatus>(null)
    const [profileSaving, setProfileSaving] = useState(false)
    const [emailStatus, setEmailStatus] = useState<SectionStatus>(null)
    const [emailSaving, setEmailSaving] = useState(false)
    const [passwordStatus, setPasswordStatus] = useState<SectionStatus>(null)
    const [passwordSaving, setPasswordSaving] = useState(false)

    const [profileForm] = Form.useForm()
    const [emailForm] = Form.useForm()
    const [passwordForm] = Form.useForm()

    async function handleProfileSave(values: { displayName: string; jlptLevel?: string }) {
        if (profileSaving) return
        setProfileSaving(true)
        setProfileStatus(null)
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    display_name: values.displayName.trim(),
                    jlpt_level: values.jlptLevel || null,
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

    async function handleEmailChange(values: { newEmail: string }) {
        if (emailSaving) return
        const trimmed = values.newEmail.trim()
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
                emailForm.resetFields(["newEmail"])
            }
        } catch {
            setEmailStatus({ err: "Có lỗi xảy ra, thử lại sau" })
        } finally {
            setEmailSaving(false)
        }
    }

    async function handlePasswordChange(values: { newPassword: string; confirmPassword: string }) {
        if (passwordSaving) return
        if (values.newPassword !== values.confirmPassword) {
            setPasswordStatus({ err: "Mật khẩu xác nhận không khớp" })
            return
        }
        setPasswordSaving(true)
        setPasswordStatus(null)
        try {
            const supabase = createSupabaseBrowserClient()
            const { error } = await supabase.auth.updateUser({ password: values.newPassword })
            if (error) {
                setPasswordStatus({ err: error.message })
            } else {
                setPasswordStatus({ ok: "Mật khẩu đã được cập nhật thành công" })
                passwordForm.resetFields()
            }
        } catch {
            setPasswordStatus({ err: "Có lỗi xảy ra, thử lại sau" })
        } finally {
            setPasswordSaving(false)
        }
    }

    const initial = initialDisplayName ? initialDisplayName[0].toUpperCase() : email[0].toUpperCase()

    return (
        <div style={{ maxWidth: 720, margin: "32px auto", padding: "0 24px 64px" }}>
            <div style={{ marginBottom: 32 }}>
                <Title level={3} style={{ margin: "0 0 4px" }}>Hồ sơ &amp; Tài khoản</Title>
                <Text type="secondary">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn</Text>
            </div>

            {/* ── Hồ sơ công khai ── */}
            <Card
                title="Hồ sơ công khai"
                style={{ marginBottom: 20, borderColor: "#E5EAF2" }}
                styles={{ header: { borderBottomColor: "#E5EAF2" } }}
            >
                <Text type="secondary" style={{ display: "block", marginBottom: 20, fontSize: 13 }}>
                    Tên và trình độ hiển thị khi bạn bình luận trong cộng đồng
                </Text>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    <Avatar size={48} style={{ background: "#2563EB", fontSize: 18, fontWeight: 700 }}>
                        {initial}
                    </Avatar>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Ảnh đại diện được tạo tự động từ tên hiển thị
                    </Text>
                </div>

                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleProfileSave}
                    initialValues={{
                        displayName: initialDisplayName,
                        jlptLevel: initialJlptLevel ?? undefined,
                    }}
                    requiredMark={false}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <Form.Item
                            label="Tên hiển thị"
                            name="displayName"
                            rules={[{ required: true, message: "Vui lòng nhập tên hiển thị" }]}
                        >
                            <Input placeholder="Nhập tên hiển thị" maxLength={30} showCount />
                        </Form.Item>

                        <Form.Item label="Trình độ JLPT" name="jlptLevel">
                            <Select
                                placeholder="Chưa xác định"
                                allowClear
                                options={JLPT_LEVELS.map(l => ({ value: l, label: l }))}
                            />
                        </Form.Item>
                    </div>

                    {profileStatus && (
                        <Alert
                            message={"ok" in profileStatus ? profileStatus.ok : profileStatus.err}
                            type={"ok" in profileStatus ? "success" : "error"}
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={profileSaving}>
                            Lưu hồ sơ
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/* ── Địa chỉ email ── */}
            <Card
                title="Địa chỉ email"
                style={{ marginBottom: 20, borderColor: "#E5EAF2" }}
                styles={{ header: { borderBottomColor: "#E5EAF2" } }}
            >
                <Text type="secondary" style={{ display: "block", marginBottom: 20, fontSize: 13 }}>
                    Đổi email đăng nhập — Supabase sẽ gửi xác nhận đến địa chỉ mới
                </Text>

                <Form
                    form={emailForm}
                    layout="vertical"
                    onFinish={handleEmailChange}
                    requiredMark={false}
                >
                    <Form.Item label="Email hiện tại">
                        <Input value={email} readOnly disabled style={{ color: "#9CA3AF" }} />
                    </Form.Item>

                    <Form.Item
                        label="Email mới"
                        name="newEmail"
                        rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}
                    >
                        <Input placeholder="email-moi@example.com" disabled={emailSaving} />
                    </Form.Item>

                    {emailStatus && (
                        <Alert
                            message={"ok" in emailStatus ? emailStatus.ok : emailStatus.err}
                            type={"ok" in emailStatus ? "success" : "error"}
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={emailSaving}>
                            Gửi xác nhận đổi email
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/* ── Mật khẩu ── */}
            <Card
                title="Mật khẩu"
                style={{ borderColor: "#E5EAF2" }}
                styles={{ header: { borderBottomColor: "#E5EAF2" } }}
            >
                <Text type="secondary" style={{ display: "block", marginBottom: 20, fontSize: 13 }}>
                    {hasPassword
                        ? "Đổi mật khẩu đăng nhập hiện tại của bạn"
                        : "Đặt mật khẩu để có thêm phương thức đăng nhập"}
                </Text>

                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                    requiredMark={false}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <Form.Item
                            label={hasPassword ? "Mật khẩu mới" : "Đặt mật khẩu"}
                            name="newPassword"
                            rules={[{ required: true, min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" }]}
                        >
                            <Input.Password
                                placeholder="Ít nhất 8 ký tự"
                                disabled={passwordSaving}
                                autoComplete="new-password"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
                        >
                            <Input.Password
                                placeholder="Nhập lại mật khẩu"
                                disabled={passwordSaving}
                                autoComplete="new-password"
                            />
                        </Form.Item>
                    </div>

                    {passwordStatus && (
                        <Alert
                            message={"ok" in passwordStatus ? passwordStatus.ok : passwordStatus.err}
                            type={"ok" in passwordStatus ? "success" : "error"}
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={passwordSaving}>
                            {hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}
