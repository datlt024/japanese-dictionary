"use client"

import "./Sidebar.css"

import Link from "next/link"

import { usePathname } from "next/navigation"

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="sidebar">
            <h2 className="sidebar-logo">
                日本語
            </h2>

            <nav className="sidebar-menu">
                <Link
                    href="/"
                    className={
                        pathname === "/"
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    🏠 Home
                </Link>

                <Link
                    href="/kanji"
                    className={
                        pathname.startsWith("/kanji")
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    🈶 Kanji
                </Link>

                <Link
                    href="/bookmark"
                    className={
                        pathname === "/bookmark"
                            ? "sidebar-item active"
                            : "sidebar-item"
                    }
                >
                    ⭐ Bookmark
                </Link>
            </nav>
        </aside>
    )
}