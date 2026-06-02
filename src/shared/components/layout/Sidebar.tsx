"use client"

import "./Sidebar.css"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
                    ? "sidebar sidebar-collapsed"
                    : "sidebar"
            }
        >
            <div className="sidebar-header">
                <button
                    className="sidebar-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label="Toggle menu"
                >
                    ☰
                </button>

                {!collapsed && (
                    <div className="sidebar-logo">
                        m<span>あ</span>zii
                    </div>
                )}
            </div>

            <nav className="sidebar-menu">
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
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                            title={collapsed ? item.label : undefined}
                        >
                            <span className="sidebar-icon">
                                {item.icon}
                            </span>

                            {!collapsed && (
                                <span className="sidebar-label">
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