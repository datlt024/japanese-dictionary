"use client"

import React, {
    useEffect,
    useState,
} from "react"

import Link from "next/link"
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation"

import { Avatar, Button, Dropdown, Select, Typography } from "antd"
import { BellOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"

import dynamic from "next/dynamic"
const AuthModal = dynamic(() => import("@/features/auth/components/AuthModal/AuthModal"), { ssr: false })
import { useAuth } from "@/features/auth/hooks/useAuth"

import {
    DictionaryLanguage,
    getDictionaryLanguageLabel,
    normalizeDictionaryLanguage,
} from "@/shared/types/dictionaryLanguage"

import styles from "./Header.module.css"

type HeaderProps = {
    title?: string
}

export default function Header({
    title = "Tra cứu",
}: HeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [authOpen,  setAuthOpen]  = useState(() => searchParams.get("error") === "auth")
    const [authError, setAuthError] = useState<string | undefined>(() =>
        searchParams.get("error") === "auth" ? "Đăng nhập thất bại. Vui lòng thử lại." : undefined
    )

    const { user, loading, signOut } = useAuth()

    const language = normalizeDictionaryLanguage(searchParams.get("lang"))

    function handleLanguageChange(value: DictionaryLanguage) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("lang", value)
        router.replace(`${pathname}?${params.toString()}`)
    }

    useEffect(() => {
        if (searchParams.get("error") !== "auth") return
        const params = new URLSearchParams(searchParams.toString())
        params.delete("error")
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.replace(newUrl)
    }, [searchParams, pathname, router])

    async function handleSignOut() {
        await signOut()
    }

    const userInitial = user?.email ? user.email[0].toUpperCase() : null

    const bellItems: MenuProps["items"] = [
        {
            key: "empty",
            label: (
                <div style={{ padding: "20px 16px", textAlign: "center", width: 260 }}>
                    <BellOutlined style={{ fontSize: 28, color: "#D1D5DB", display: "block", margin: "0 auto 10px" }} />
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                        Tính năng thông báo sắp ra mắt
                    </Typography.Text>
                </div>
            ),
            disabled: true,
        },
    ]

    const userMenuItems: MenuProps["items"] = [
        {
            key: "user-info",
            label: (
                <div style={{ padding: "4px 0 8px", pointerEvents: "none" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#1F2937" }}>{user?.email}</div>
                </div>
            ),
            disabled: true,
        },
        { type: "divider" },
        {
            key: "account",
            icon: <UserOutlined />,
            label: <Link href="/account" style={{ color: "inherit" }}>Hồ sơ &amp; Tài khoản</Link>,
        },
        { type: "divider" },
        {
            key: "signout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            danger: true,
            onClick: handleSignOut,
        },
    ]

    return (
        <>
            <header className={styles.appHeader}>
                <div className={styles.appHeaderLeft}>
                    <span className={styles.headerLogo}>
                        <span className={styles.headerLogoMark}>読</span>
                        Yomi
                    </span>
                    <h1>{title}</h1>
                </div>

                <div className={styles.appHeaderActions}>
                    <Select
                        value={language}
                        onChange={handleLanguageChange}
                        size="small"
                        style={{ width: 90 }}
                        options={[
                            { value: "vi", label: getDictionaryLanguageLabel("vi") },
                            { value: "en", label: getDictionaryLanguageLabel("en") },
                        ]}
                    />

                    <Dropdown
                        menu={{ items: bellItems }}
                        trigger={["click"]}
                        placement="bottomRight"
                        overlayStyle={{ minWidth: 280 }}
                    >
                        <Button
                            type="text"
                            icon={<BellOutlined />}
                            aria-label="Thông báo"
                            className={styles.iconButton}
                        />
                    </Dropdown>

                    <Link href="/study?tab=so-tay" className={styles.iconButton} aria-label="Sổ tay & Chuỗi học">
                        🔥
                    </Link>

                    {!loading && (
                        user ? (
                            <Dropdown
                                menu={{ items: userMenuItems }}
                                trigger={["click"]}
                                placement="bottomRight"
                            >
                                <Avatar
                                    style={{
                                        backgroundColor: "#2563EB",
                                        cursor: "pointer",
                                        fontSize: 14,
                                        fontWeight: 700,
                                    }}
                                    size={32}
                                >
                                    {userInitial}
                                </Avatar>
                            </Dropdown>
                        ) : (
                            <>
                                <Button
                                    type="text"
                                    onClick={() => setAuthOpen(true)}
                                    style={{ fontWeight: 500, color: "#6B7280" }}
                                >
                                    Đăng nhập
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => setAuthOpen(true)}
                                    style={{ fontWeight: 600 }}
                                >
                                    Đăng ký
                                </Button>
                            </>
                        )
                    )}
                </div>
            </header>

            {(authOpen || !!authError) && (
                <AuthModal
                    open={authOpen || !!authError}
                    onClose={() => { setAuthOpen(false); setAuthError(undefined) }}
                    initialError={authError}
                />
            )}
        </>
    )
}
