"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import "./Header.css"

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

    function handleLanguageChange(
        value: DictionaryLanguage
    ) {
        const params = new URLSearchParams(
            searchParams.toString()
        )

        params.set("lang", value)

        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <header className="app-header">
            <div className="app-header-left">
                <span className="header-logo">
                    m<span>あ</span>zii
                </span>

                <h1>{title}</h1>
            </div>

            <div className="app-header-actions">
                <button className="login-button">
                    Đăng nhập
                </button>

                <button className="register-button">
                    Đăng ký
                </button>

                <select
                    className="language-select"
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

                <button className="icon-button">
                    🔔
                </button>

                <button className="icon-button">
                    🔥
                </button>
            </div>
        </header>
    )
}