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
        const timer = window.setTimeout(() => {
            const savedCollapsed =
                localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"

            setCollapsed(savedCollapsed)
            setMounted(true)
        }, 0)

        return () => {
            window.clearTimeout(timer)
        }
    }, [])

    function toggleSidebar() {
        setCollapsed((current) => {
            const next = !current

            localStorage.setItem(
                SIDEBAR_COLLAPSED_KEY,
                String(next)
            )

            return next
        })
    }

    const isCollapsed = mounted && collapsed

    return (
        <aside
            className={
                isCollapsed
                    ? `${styles.sidebar} ${styles.sidebarCollapsed}`
                    : mounted
                        ? styles.sidebar
                        : `${styles.sidebar} ${styles.noTransition}`
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
                            title={isCollapsed ? item.label : undefined}
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