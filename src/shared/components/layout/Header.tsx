"use client"

import React, {
    useEffect,
    useRef,
    useState,
} from "react"

import { useFocusTrap } from "@/shared/hooks/useFocusTrap"

import Link from "next/link"
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation"

import styles from "./Header.module.css"

import dynamic from "next/dynamic"
const AuthModal = dynamic(() => import("@/features/auth/components/AuthModal/AuthModal"), { ssr: false })
import { useAuth } from "@/shared/hooks/useAuth"

import { Bell } from "lucide-react"

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

    // Capture error from URL on first render so modal stays open after the param is stripped
    const [authOpen,    setAuthOpen]    = useState(() => searchParams.get("error") === "auth")
    const [authError,   setAuthError]   = useState<string | undefined>(() =>
        searchParams.get("error") === "auth" ? "Đăng nhập thất bại. Vui lòng thử lại." : undefined
    )
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [bellOpen, setBellOpen] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)
    const bellRef = useRef<HTMLDivElement>(null)
    const bellDropdownRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    const { user, loading, signOut } = useAuth()

    const language = normalizeDictionaryLanguage(
        searchParams.get("lang")
    )

    useEffect(() => {
        if (!dropdownOpen) return
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [dropdownOpen])

    useEffect(() => {
        if (!bellOpen) return
        function handleClickOutside(e: MouseEvent) {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [bellOpen])

    useEffect(() => {
        if (!bellOpen) return
        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") setBellOpen(false)
        }
        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [bellOpen])

    useFocusTrap(bellDropdownRef, bellOpen, () => setBellOpen(false))
    useFocusTrap(menuRef, dropdownOpen, () => setDropdownOpen(false))

    function handleDropdownKeyDown(e: React.KeyboardEvent) {
        const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')
        if (!items || items.length === 0) return
        const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement)

        if (e.key === "ArrowDown") {
            e.preventDefault()
            items[(currentIndex + 1) % items.length].focus()
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            items[(currentIndex - 1 + items.length) % items.length].focus()
        } else if (e.key === "Escape") {
            setDropdownOpen(false)
        }
    }

    function handleLanguageChange(value: DictionaryLanguage) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("lang", value)
        router.replace(`${pathname}?${params.toString()}`)
    }

    // Strip ?error=auth from the URL after we've captured it into state above
    useEffect(() => {
        if (searchParams.get("error") !== "auth") return
        const params = new URLSearchParams(searchParams.toString())
        params.delete("error")
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.replace(newUrl)
    }, [searchParams, pathname, router])

    async function handleSignOut() {
        setDropdownOpen(false)
        await signOut()
        router.refresh()
    }

    const userInitial = user?.email ? user.email[0].toUpperCase() : null

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
                    <select
                        className={styles.languageSelect}
                        value={language}
                        onChange={(event) =>
                            handleLanguageChange(event.target.value as DictionaryLanguage)
                        }
                    >
                        <option value="vi">{getDictionaryLanguageLabel("vi")}</option>
                        <option value="en">{getDictionaryLanguageLabel("en")}</option>
                    </select>

                    <div className={styles.bellWrap} ref={bellRef}>
                        <button
                            type="button"
                            className={`${styles.iconButton} ${bellOpen ? styles.iconButtonActive : ""}`}
                            aria-label="Thông báo"
                            aria-expanded={bellOpen}
                            onClick={() => setBellOpen((o) => !o)}
                        >
                            <Bell size={17} strokeWidth={2} />
                        </button>

                        {bellOpen && (
                            <div
                                className={styles.bellDropdown}
                                ref={bellDropdownRef}
                                role="dialog"
                                aria-label="Thông báo"
                            >
                                <div className={styles.bellDropdownHeader}>
                                    <span className={styles.bellDropdownTitle}>Thông báo</span>
                                </div>
                                <div className={styles.bellEmpty}>
                                    <Bell size={32} strokeWidth={1.5} className={styles.bellEmptyIcon} />
                                    <p className={styles.bellEmptyText}>Tính năng thông báo sắp ra mắt</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/study?tab=so-tay" className={styles.iconButton} aria-label="Sổ tay & Chuỗi học">
                        🔥
                    </Link>

                    {!loading && (
                        user ? (
                            <div className={styles.userMenu} ref={dropdownRef}>
                                <button
                                    type="button"
                                    className={styles.userAvatar}
                                    onClick={() => setDropdownOpen((o) => !o)}
                                    aria-label="Mở menu tài khoản"
                                    aria-expanded={dropdownOpen}
                                >
                                    {userInitial}
                                </button>

                                {dropdownOpen && (
                                    <div
                                        className={styles.dropdown}
                                        ref={menuRef}
                                        role="menu"
                                        onKeyDown={handleDropdownKeyDown}
                                    >
                                        <div className={styles.dropdownHeader}>
                                            <div className={styles.dropdownAvatar}>{userInitial}</div>
                                            <div className={styles.dropdownInfo}>
                                                <span className={styles.dropdownEmail}>{user.email}</span>
                                            </div>
                                        </div>

                                        <div className={styles.dropdownDivider} />

                                        <Link
                                            href="/account"
                                            className={styles.dropdownItem}
                                            role="menuitem"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <span className={styles.dropdownIcon}>👤</span>
                                            Hồ sơ & Tài khoản
                                        </Link>

                                        <div className={styles.dropdownDivider} />

                                        <button
                                            type="button"
                                            className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                                            role="menuitem"
                                            onClick={handleSignOut}
                                        >
                                            <span className={styles.dropdownIcon}>↩</span>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
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
