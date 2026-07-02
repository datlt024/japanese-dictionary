"use client"

import {
    useState,
} from "react"

import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation"

import styles from "./Header.module.css"

import AuthModal from "@/features/auth/components/AuthModal/AuthModal"
import { useAuth } from "@/features/auth/hooks/useAuth"

import {
    DictionaryLanguage,
    getDictionaryLanguageLabel,
    normalizeDictionaryLanguage,
} from "@/shared/types/dictionaryLanguage"

type HeaderProps = {
    title?: string
}

export default function Header({
    title = "Tra cứu",
}: HeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [authOpen, setAuthOpen] = useState(false)

    const { user, loading, signOut } = useAuth()

    const language = normalizeDictionaryLanguage(
        searchParams.get("lang")
    )

    function handleLanguageChange(value: DictionaryLanguage) {
        const params = new URLSearchParams(
            searchParams.toString()
        )

        params.set("lang", value)

        router.replace(`${pathname}?${params.toString()}`)
    }

    const userInitial = user?.email
        ? user.email[0].toUpperCase()
        : null

    return (
        <>
            <header className={styles.appHeader}>
                <div className={styles.appHeaderLeft}>
                    <span className={styles.headerLogo}>
                        m<span>あ</span>zii
                    </span>

                    <h1>{title}</h1>
                </div>

                <div className={styles.appHeaderActions}>
                    {!loading && (
                        user ? (
                            <>
                                <div
                                    className={styles.userAvatar}
                                    title={user.email ?? ""}
                                >
                                    {userInitial}
                                </div>
                                <button
                                    type="button"
                                    className={styles.registerButton}
                                    onClick={signOut}
                                >
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className={styles.loginButton}
                                    onClick={() => setAuthOpen(true)}
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    type="button"
                                    className={styles.registerButton}
                                    onClick={() => setAuthOpen(true)}
                                >
                                    Đăng ký
                                </button>
                            </>
                        )
                    )}

                    <select
                        className={styles.languageSelect}
                        value={language}
                        onChange={(event) =>
                            handleLanguageChange(
                                event.target
                                    .value as DictionaryLanguage
                            )
                        }
                    >
                        <option value="vi">
                            {getDictionaryLanguageLabel("vi")}
                        </option>

                        <option value="en">
                            {getDictionaryLanguageLabel("en")}
                        </option>
                    </select>

                    <button type="button" className={styles.iconButton} aria-label="Thông báo">
                        🔔
                    </button>

                    <button type="button" className={styles.iconButton} aria-label="Chuỗi học">
                        🔥
                    </button>
                </div>
            </header>

            <AuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
            />
        </>
    )
}