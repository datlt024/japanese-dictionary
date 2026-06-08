"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import styles from "./Sidebar.module.css"

const SIDEBAR_COLLAPSED_KEY = "sidebarCollapsed"

const menuItems = [
    { href: "/", icon: "🔎", label: "Tra cứu" },
    { href: "/study", icon: "📘", label: "Học tập" },
    { href: "/translate", icon: "🌐", label: "Dịch" },
    { href: "/kanji", icon: "漢", label: "Hán tự" },
    { href: "/bookmark", icon: "⭐", label: "Sổ tay" },
    { href: "/settings", icon: "⚙️", label: "Cài đặt" },
]

export default function Sidebar() {
    const pathname = usePathname()

    const [mounted, setMounted] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        const savedCollapsed =
            localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"

        setCollapsed(savedCollapsed)
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) {
            return
        }

        localStorage.setItem(
            SIDEBAR_COLLAPSED_KEY,
            String(collapsed)
        )
    }, [collapsed, mounted])

    function toggleSidebar() {
        setCollapsed((current) => !current)
    }

    const isCollapsed = mounted ? collapsed : false

    return (
        <aside
            className={
                isCollapsed
                    ? `${styles.sidebar} ${styles.sidebarCollapsed}`
                    : styles.sidebar
            }
        >
            <div className={styles.sidebarHeader}>
                <button
                    type="button"
                    className={styles.sidebarToggle}
                    onClick={toggleSidebar}
                    aria-label={
                        isCollapsed
                            ? "Mở rộng menu"
                            : "Thu gọn menu"
                    }
                    aria-expanded={!isCollapsed}
                >
                    ☰
                </button>

                {!isCollapsed && (
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
                                isCollapsed
                                    ? item.label
                                    : undefined
                            }
                        >
                            <span className={styles.sidebarIcon}>
                                {item.icon}
                            </span>

                            {!isCollapsed && (
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