"use client"

import {
    useEffect,
    useRef,
    useState,
} from "react"

import Link from "next/link"
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation"

import styles from "./Header.module.css"

import AuthModal from "@/features/auth/components/AuthModal/AuthModal"
import { useAuth } from "@/features/auth/hooks/useAuth"

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

    const [authOpen, setAuthOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [bellOpen, setBellOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const bellRef = useRef<HTMLDivElement>(null)

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

    function handleLanguageChange(value: DictionaryLanguage) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("lang", value)
        router.replace(`${pathname}?${params.toString()}`)
    }

    async function handleSignOut() {
        setDropdownOpen(false)
        await signOut()
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
                                    <div className={styles.dropdown}>
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
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <span className={styles.dropdownIcon}>👤</span>
                                            Hồ sơ & Tài khoản
                                        </Link>

                                        <div className={styles.dropdownDivider} />

                                        <button
                                            type="button"
                                            className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
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
                            <div className={styles.bellDropdown} role="dialog" aria-label="Thông báo">
                                <div className={styles.bellDropdownHeader}>
                                    <span className={styles.bellDropdownTitle}>Thông báo</span>
                                </div>
                                <div className={styles.bellEmpty}>
                                    <Bell size={32} strokeWidth={1.5} className={styles.bellEmptyIcon} />
                                    <p className={styles.bellEmptyText}>Chưa có thông báo nào</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/study?tab=so-tay" className={styles.iconButton} aria-label="Sổ tay & Chuỗi học">
                        🔥
                    </Link>
                </div>
            </header>

            <AuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
            />
        </>
    )
}
