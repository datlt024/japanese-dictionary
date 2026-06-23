"use client"

import { useLayoutEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import styles from "./Sidebar.module.css"

const SIDEBAR_COLLAPSED_KEY = "sidebarCollapsed"

const menuItems = [
    { href: "/", icon: "🔎", label: "Tra cứu" },
    { href: "/study", icon: "📘", label: "Học tập" },
    { href: "/translate", icon: "🌐", label: "Dịch" },
    { href: "/kanji", icon: "漢", label: "Hán tự" },
    { href: "/notebooks", icon: "⭐", label: "Sổ tay" },
    { href: "/settings", icon: "⚙️", label: "Cài đặt" },
]

export default function Sidebar() {
    const pathname = usePathname()

    const [collapsed, setCollapsed] = useState(false)

    useLayoutEffect(() => {
        const savedCollapsed =
            localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollapsed(savedCollapsed)
    }, [])

    function toggleSidebar() {
        setCollapsed((current) => {
            const next = !current
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
            return next
        })
    }

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
                    type="button"
                    className={styles.sidebarToggle}
                    onClick={toggleSidebar}
                    aria-label={
                        collapsed
                            ? "Mở rộng menu"
                            : "Thu gọn menu"
                    }
                    aria-expanded={!collapsed}
                >
                    ☰
                </button>

                <div className={styles.sidebarLogo}>
                    m<span>あ</span>zii
                </div>
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
                            title={collapsed ? item.label : undefined}
                        >
                            <span className={styles.sidebarIcon}>
                                {item.icon}
                            </span>

                            <span className={styles.sidebarLabel}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
