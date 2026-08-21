"use client"

import { useCallback, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Search, BookOpen, Languages, Settings, PanelLeft, ShieldCheck,
    Users, MessageSquare, GraduationCap, BookText, Pen, Database,
    LayoutDashboard, ArrowLeft, Notebook,
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

type AdminSection = {
    label: string
    items: { href: string; label: string; Icon: React.ElementType }[]
}

const adminSections: AdminSection[] = [
    {
        label: "Công cụ quản trị",
        items: [
            { href: "/admin/users",    label: "Người dùng",       Icon: Users           },
            { href: "/admin/comments", label: "Bình luận",         Icon: MessageSquare   },
            { href: "/study",          label: "Khu vực học tập",   Icon: GraduationCap   },
        ],
    },
    {
        label: "Quản lý dữ liệu",
        items: [
            { href: "/admin/data/vocabulary", label: "Từ vựng",   Icon: BookText  },
            { href: "/admin/data/grammar",    label: "Ngữ pháp",  Icon: Pen       },
            { href: "/admin/data/kanji",      label: "Hán tự",    Icon: Database  },
            { href: "/admin/data/notebooks",  label: "Sổ tay",    Icon: Notebook  },
        ],
    },
]

function NavLink({ href, label, Icon, collapsed, pathname, child = false }: {
    href: string; label: string; Icon: React.ElementType
    collapsed: boolean; pathname: string; child?: boolean
}) {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
    return (
        <Link
            href={href}
            className={[
                styles.sidebarLink,
                isActive ? styles.active : "",
                child ? styles.childLink : "",
            ].filter(Boolean).join(" ")}
            title={collapsed ? label : undefined}
        >
            <span className={styles.sidebarIcon} aria-hidden="true">
                <Icon size={17} strokeWidth={2} />
            </span>
            <span className={styles.sidebarLabel}>{label}</span>
        </Link>
    )
}

export default function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
    const pathname = usePathname()
    const collapsed = useSyncExternalStore(subscribeSidebar, getSnapshot, getServerSnapshot)
    const inAdmin = pathname.startsWith("/admin")

    const toggleSidebar = useCallback(() => {
        const next = !(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true")
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
        window.dispatchEvent(new StorageEvent("storage", { key: SIDEBAR_COLLAPSED_KEY }))
    }, [])

    return (
        <aside className={collapsed ? `${styles.sidebar} ${styles.sidebarCollapsed}` : styles.sidebar}>
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

            {inAdmin && isAdmin ? (
                <nav className={styles.sidebarMenu} aria-label="Menu quản trị">
                    {/* Dashboard */}
                    <NavLink href="/admin/dashboard" label="Dashboard" Icon={LayoutDashboard} collapsed={collapsed} pathname={pathname} />

                    {/* Sections */}
                    {adminSections.map(section => (
                        <div key={section.label} className={styles.navSection}>
                            {!collapsed && <span className={styles.navSectionLabel}>{section.label}</span>}
                            {section.items.map(item => (
                                <NavLink key={item.href} href={item.href} label={item.label} Icon={item.Icon} collapsed={collapsed} pathname={pathname} child />
                            ))}
                        </div>
                    ))}

                    {/* Back to app */}
                    <div className={styles.navDivider} />
                    <NavLink href="/" label="Quay lại ứng dụng" Icon={ArrowLeft} collapsed={collapsed} pathname={pathname} />
                </nav>
            ) : (
                <nav className={styles.sidebarMenu} aria-label="Menu chính">
                    {[...menuItems, ...(isAdmin ? [{ href: "/admin/dashboard", kind: "icon" as const, Icon: ShieldCheck, label: "Quản trị" }] : [])].map((item) => {
                        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={isActive ? `${styles.sidebarLink} ${styles.active}` : styles.sidebarLink}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className={styles.sidebarIcon} aria-hidden="true">
                                    {item.kind === "icon" ? (
                                        <item.Icon size={17} strokeWidth={2} />
                                    ) : (
                                        <span className={styles.sidebarChar}>{item.char}</span>
                                    )}
                                </span>
                                <span className={styles.sidebarLabel}>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            )}
        </aside>
    )
}
