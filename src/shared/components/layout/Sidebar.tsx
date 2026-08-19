"use client"

import { useCallback, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Search,
    BookOpen,
    Languages,
    Settings,
    PanelLeft,
    ShieldCheck,
} from "lucide-react"

import styles from "./Sidebar.module.css"

const SIDEBAR_COLLAPSED_KEY = "sidebarCollapsed"

function subscribeSidebar(cb: () => void) {
    window.addEventListener("storage", cb)
    return () => window.removeEventListener("storage", cb)
}
const getSnapshot = () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
const getServerSnapshot = () => false

type MenuItem = {
    href: string
    label: string
} & (
    | { kind: "icon"; Icon: React.ElementType }
    | { kind: "char"; char: string }
)

const menuItems: MenuItem[] = [
    { href: "/",          kind: "icon", Icon: Search,     label: "Tra cứu"  },
    { href: "/study",     kind: "icon", Icon: BookOpen,   label: "Học tập"  },
    { href: "/translate", kind: "icon", Icon: Languages,  label: "Dịch"     },
    { href: "/kanji",     kind: "char", char: "字",        label: "Hán tự"   },
    { href: "/settings",  kind: "icon", Icon: Settings,   label: "Cài đặt"  },
]

export default function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
    const pathname = usePathname()
    const collapsed = useSyncExternalStore(subscribeSidebar, getSnapshot, getServerSnapshot)

    const toggleSidebar = useCallback(() => {
        const next = !(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true")
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
        window.dispatchEvent(new StorageEvent("storage", { key: SIDEBAR_COLLAPSED_KEY }))
    }, [])

    return (
        <aside
            className={
                collapsed
                    ? `${styles.sidebar} ${styles.sidebarCollapsed}`
                    : styles.sidebar
            }
        >
            <div className={styles.sidebarHeader}>
                <Link href="/" className={styles.sidebarLogo} aria-label="Yomi — trang chủ">
                    <span className={styles.logoMark}>読</span>
                    <span className={styles.logoName}>Yomi</span>
                </Link>

                <button
                    type="button"
                    className={styles.sidebarToggle}
                    onClick={toggleSidebar}
                    aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
                    aria-expanded={!collapsed}
                >
                    <PanelLeft size={16} strokeWidth={2} />
                </button>
            </div>

            <nav className={styles.sidebarMenu} aria-label="Menu chính">
                {[...menuItems, ...(isAdmin ? [{ href: "/admin/dashboard", kind: "icon" as const, Icon: ShieldCheck, label: "Quản trị" }] : [])].map((item) => {
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
                            <span className={styles.sidebarIcon} aria-hidden="true">
                                {item.kind === "icon" ? (
                                    <item.Icon size={17} strokeWidth={2} />
                                ) : (
                                    <span className={styles.sidebarChar}>{item.char}</span>
                                )}
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
