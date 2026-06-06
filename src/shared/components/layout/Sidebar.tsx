"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import styles from "./Sidebar.module.css"

const menuItems = [
    {
        href: "/",
        icon: "🔎",
        label: "Tra cứu",
    },
    {
        href: "/study",
        icon: "📘",
        label: "Học tập",
    },
    {
        href: "/translate",
        icon: "🌐",
        label: "Dịch",
    },
    {
        href: "/kanji",
        icon: "漢",
        label: "Hán tự",
    },
    {
        href: "/bookmark",
        icon: "⭐",
        label: "Sổ tay",
    },
    {
        href: "/settings",
        icon: "⚙️",
        label: "Cài đặt",
    },
]

export default function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside
            className={
                collapsed
                    ? `${styles.sidebar} ${styles.sidebarCollapsed}`
                    : styles.sidebar
            }
        >
            <div className={styles.sidebarHeader}>
                <button
                    className={styles.sidebarToggle}
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label="Toggle menu"
                >
                    ☰
                </button>

                {!collapsed && (
                    <div className={styles.sidebarLogo}>
                        m<span>あ</span>zii
                    </div>
                )}
            </div>

            <nav className={styles.sidebarMenu}>
                {menuItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                isActive
                                    ? `${styles.sidebarLink} ${styles.active}`
                                    : styles.sidebarLink
                            }
                            title={
                                collapsed
                                    ? item.label
                                    : undefined
                            }
                        >
                            <span className={styles.sidebarIcon}>
                                {item.icon}
                            </span>

                            {!collapsed && (
                                <span className={styles.sidebarLabel}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}