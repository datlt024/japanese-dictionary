"use client"

import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation"

import styles from "./Header.module.css"

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

    return (
        <header className={styles.appHeader}>
            <div className={styles.appHeaderLeft}>
                <span className={styles.headerLogo}>
                    m<span>あ</span>zii
                </span>

                <h1>{title}</h1>
            </div>

            <div className={styles.appHeaderActions}>
                <button className={styles.loginButton}>
                    Đăng nhập
                </button>

                <button className={styles.registerButton}>
                    Đăng ký
                </button>

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

                <button className={styles.iconButton}>
                    🔔
                </button>

                <button className={styles.iconButton}>
                    🔥
                </button>
            </div>
        </header>
    )
}