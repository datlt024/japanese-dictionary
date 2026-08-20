"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Search, UserPlus, X, Trash2, ShieldCheck, Star, User, Eye, EyeOff } from "lucide-react"
import type { AdminUserRecord } from "./page"
import styles from "./page.module.css"

const PER_PAGE = 25

const JLPT_OPTIONS = ["", "N5", "N4", "N3", "N2", "N1"]

type Role = "free" | "subscriber" | "admin"

const ROLE_META: Record<Role, { label: string; cls: string }> = {
    free:       { label: "Miễn phí",     cls: styles.roleFree },
    subscriber: { label: "Thuê bao",     cls: styles.roleSub },
    admin:      { label: "Quản trị viên", cls: styles.roleAdmin },
}

function roleMeta(r: string) {
    return ROLE_META[r as Role] ?? ROLE_META.free
}

function fmtDate(iso: string | null) {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
    const letter = name && name !== "—" ? name.trim()[0].toUpperCase() : "?"
    return (
        <div className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.42 }}>
            {letter}
        </div>
    )
}

/* ── Edit / view modal ── */
interface ModalProps {
    user: AdminUserRecord
    onClose: () => void
    onSaved: (updated: Partial<AdminUserRecord> & { id: string }) => void
    onDeleted: (id: string) => void
}

function UserModal({ user, onClose, onSaved, onDeleted }: ModalProps) {
    const [displayName, setDisplayName] = useState(user.display_name === "—" ? "" : user.display_name)
    const [jlptLevel, setJlptLevel] = useState(user.jlpt_level ?? "")
    const [role, setRole] = useState<Role>((user.role as Role) ?? "free")
    const [subUntil, setSubUntil] = useState(user.subscription_until?.slice(0, 10) ?? "")
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [onClose])

    async function save() {
        setSaving(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    display_name: displayName || undefined,
                    jlpt_level: jlptLevel || null,
                    role,
                    subscription_until: (role === "subscriber" && subUntil) ? subUntil : null,
                }),
            })
            if (!res.ok) {
                const json = await res.json().catch(() => ({}))
                throw new Error(json.error ?? "Lỗi không xác định")
            }
            onSaved({
                id: user.id,
                display_name: displayName || user.display_name,
                jlpt_level: jlptLevel || null,
                role,
                subscription_until: (role === "subscriber" && subUntil) ? `${subUntil}T00:00:00Z` : null,
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lỗi không xác định")
        } finally {
            setSaving(false)
        }
    }

    async function doDelete() {
        setDeleting(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
            if (!res.ok) {
                const json = await res.json().catch(() => ({}))
                throw new Error(json.error ?? "Lỗi không xác định")
            }
            onDeleted(user.id)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lỗi không xác định")
            setDeleting(false)
            setConfirmDelete(false)
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className={styles.modal} role="dialog" aria-modal="true">

                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.modalMeta}>
                        <Avatar name={user.display_name} size={44} />
                        <div>
                            <p className={styles.modalName}>{user.display_name}</p>
                            <p className={styles.modalEmail}>{user.email ?? "—"}</p>
                            {user.phone && (
                                <p className={styles.modalPhone}>{user.phone}</p>
                            )}
                        </div>
                    </div>
                    <button className={styles.modalClose} onClick={onClose} aria-label="Đóng">
                        <X size={16} />
                    </button>
                </div>

                {/* Info strip */}
                <div className={styles.infoStrip}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoKey}>Đăng ký</span>
                        <span className={styles.infoVal}>{fmtDate(user.created_at)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoKey}>Lần cuối đăng nhập</span>
                        <span className={styles.infoVal}>{fmtDate(user.last_sign_in_at)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoKey}>Xác nhận email</span>
                        <span className={styles.infoVal}>{user.email_confirmed_at ? "Đã xác nhận" : "Chưa xác nhận"}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoKey}>Chuỗi học</span>
                        <span className={styles.infoVal}>{user.streak_count} ngày</span>
                    </div>
                </div>

                {/* Form */}
                <div className={styles.modalForm}>
                    <div className={styles.fieldRow}>
                        <label className={styles.fieldLabel}>Tên hiển thị</label>
                        <input
                            className={styles.fieldInput}
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder="Tên hiển thị"
                        />
                    </div>

                    <div className={styles.fieldRow}>
                        <label className={styles.fieldLabel}>Cấp độ JLPT</label>
                        <select
                            className={styles.fieldSelect}
                            value={jlptLevel}
                            onChange={e => setJlptLevel(e.target.value)}
                        >
                            <option value="">— Chưa chọn —</option>
                            {JLPT_OPTIONS.filter(Boolean).map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.fieldRow}>
                        <label className={styles.fieldLabel}>Loại tài khoản</label>
                        <div className={styles.roleRadios}>
                            {(["free", "subscriber", "admin"] as Role[]).map(r => (
                                <label key={r} className={`${styles.roleRadio} ${role === r ? styles.roleRadioActive : ""}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value={r}
                                        checked={role === r}
                                        onChange={() => setRole(r)}
                                    />
                                    <span className={`${styles.roleChip} ${roleMeta(r).cls}`}>
                                        {r === "admin" && <ShieldCheck size={12} />}
                                        {r === "subscriber" && <Star size={12} />}
                                        {r === "free" && <User size={12} />}
                                        {roleMeta(r).label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {role === "subscriber" && (
                        <div className={styles.fieldRow}>
                            <label className={styles.fieldLabel}>Thuê bao đến ngày</label>
                            <input
                                type="date"
                                className={styles.fieldInput}
                                value={subUntil}
                                onChange={e => setSubUntil(e.target.value)}
                                min={new Date().toISOString().slice(0, 10)}
                            />
                        </div>
                    )}
                </div>

                {/* Delete confirm */}
                {confirmDelete && (
                    <div className={styles.deleteConfirm}>
                        <p className={styles.deleteWarn}>
                            Xóa tài khoản <strong>{user.email}</strong>? Hành động này không thể hoàn tác.
                        </p>
                        <div className={styles.deleteActions}>
                            <button className={styles.btnGhost} onClick={() => setConfirmDelete(false)} disabled={deleting}>
                                Hủy
                            </button>
                            <button className={styles.btnDanger} onClick={doDelete} disabled={deleting}>
                                {deleting ? "Đang xóa…" : "Xác nhận xóa"}
                            </button>
                        </div>
                    </div>
                )}

                {error && <p className={styles.modalError}>{error}</p>}

                {/* Footer */}
                {!confirmDelete && (
                    <div className={styles.modalFooter}>
                        <button
                            className={styles.btnDelete}
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 size={14} />
                            Xóa tài khoản
                        </button>
                        <div className={styles.modalFooterRight}>
                            <button className={styles.btnGhost} onClick={onClose}>Hủy</button>
                            <button className={styles.btnPrimary} onClick={save} disabled={saving}>
                                {saving ? "Đang lưu…" : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ── Create account modal ── */
function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (user: AdminUserRecord) => void }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPwd, setShowPwd] = useState(false)
    const [role, setRole] = useState<Role>("free")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { inputRef.current?.focus() }, [])
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [onClose])

    async function create() {
        setSaving(true)
        setError(null)
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            })
            const json = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(json.error ?? "Lỗi không xác định")
            const newUser: AdminUserRecord = {
                id: json.id ?? "",
                email,
                phone: null,
                display_name: "—",
                jlpt_level: null,
                streak_count: 0,
                created_at: new Date().toISOString(),
                last_sign_in_at: null,
                email_confirmed_at: new Date().toISOString(),
                role,
                subscription_until: null,
            }
            setDone(true)
            setTimeout(() => { onCreated(newUser); onClose() }, 1200)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lỗi không xác định")
        } finally {
            setSaving(false)
        }
    }

    const canSubmit = email.includes("@") && password.length >= 8

    return (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className={`${styles.modal} ${styles.modalSm}`} role="dialog" aria-modal="true">
                <div className={styles.modalHeader}>
                    <p className={styles.modalTitle}>Thêm tài khoản mới</p>
                    <button className={styles.modalClose} onClick={onClose}><X size={16} /></button>
                </div>
                {done ? (
                    <p className={styles.inviteDone}>Đã tạo tài khoản <strong>{email}</strong></p>
                ) : (
                    <>
                        <div className={styles.modalForm}>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>Địa chỉ email</label>
                                <input
                                    ref={inputRef}
                                    className={styles.fieldInput}
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    autoComplete="off"
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>Mật khẩu</label>
                                <div className={styles.pwdWrap}>
                                    <input
                                        className={styles.fieldInput}
                                        type={showPwd ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Tối thiểu 8 ký tự"
                                        autoComplete="new-password"
                                        onKeyDown={e => { if (e.key === "Enter" && canSubmit) create() }}
                                    />
                                    <button
                                        type="button"
                                        className={styles.pwdToggle}
                                        onClick={() => setShowPwd(v => !v)}
                                        tabIndex={-1}
                                        aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                                {password.length > 0 && password.length < 8 && (
                                    <span className={styles.fieldHint}>Cần ít nhất 8 ký tự</span>
                                )}
                            </div>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>Loại tài khoản</label>
                                <div className={styles.roleRadios}>
                                    {(["free", "subscriber", "admin"] as Role[]).map(r => (
                                        <label key={r} className={`${styles.roleRadio} ${role === r ? styles.roleRadioActive : ""}`}>
                                            <input type="radio" name="new-role" value={r} checked={role === r} onChange={() => setRole(r)} />
                                            <span className={`${styles.roleChip} ${roleMeta(r).cls}`}>
                                                {r === "admin" && <ShieldCheck size={12} />}
                                                {r === "subscriber" && <Star size={12} />}
                                                {r === "free" && <User size={12} />}
                                                {roleMeta(r).label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {error && <p className={styles.modalError}>{error}</p>}
                        </div>
                        <div className={styles.modalFooter}>
                            <div />
                            <div className={styles.modalFooterRight}>
                                <button className={styles.btnGhost} onClick={onClose}>Hủy</button>
                                <button
                                    className={styles.btnPrimary}
                                    onClick={create}
                                    disabled={saving || !canSubmit}
                                >
                                    {saving ? "Đang tạo…" : "Tạo tài khoản"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

/* ── Main client component ── */
export default function UsersClient({ initialUsers }: { initialUsers: AdminUserRecord[] }) {
    const [users, setUsers] = useState(initialUsers)
    const [query, setQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<"all" | Role>("all")
    const [page, setPage] = useState(1)
    const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null)
    const [showCreate, setShowCreate] = useState(false)

    const filtered = useMemo(() => {
        let list = users
        if (query) {
            const q = query.toLowerCase()
            list = list.filter(u =>
                u.display_name.toLowerCase().includes(q) ||
                (u.email ?? "").toLowerCase().includes(q)
            )
        }
        if (roleFilter !== "all") {
            list = list.filter(u => u.role === roleFilter)
        }
        return list
    }, [users, query, roleFilter])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    function onSearch(v: string) {
        setQuery(v)
        setPage(1)
    }

    function onRoleFilter(v: "all" | Role) {
        setRoleFilter(v)
        setPage(1)
    }

    function handleSaved(updated: Partial<AdminUserRecord> & { id: string }) {
        setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u))
        if (selectedUser?.id === updated.id) {
            setSelectedUser(prev => prev ? { ...prev, ...updated } : null)
        }
        setSelectedUser(null)
    }

    function handleDeleted(id: string) {
        setUsers(prev => prev.filter(u => u.id !== id))
        setSelectedUser(null)
    }

    // Stats
    const total = users.length
    const subscribers = users.filter(u => u.role === "subscriber").length
    const admins = users.filter(u => u.role === "admin").length
    const confirmed = users.filter(u => u.email_confirmed_at).length

    return (
        <div className={styles.page}>

            {/* ── Header ── */}
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.pageTitle}>Quản lý người dùng</h2>
                    <p className={styles.pageSubtitle}>{total.toLocaleString("vi-VN")} tài khoản</p>
                </div>
                <button className={styles.inviteBtn} onClick={() => setShowCreate(true)}>
                    <UserPlus size={14} />
                    Thêm tài khoản
                </button>
            </div>

            {/* ── Stat pills ── */}
            <div className={styles.statPills}>
                <StatPill label="Tổng" value={total} active={roleFilter === "all"} onClick={() => onRoleFilter("all")} />
                <StatPill label="Thuê bao" value={subscribers} active={roleFilter === "subscriber"} accent="sub" onClick={() => onRoleFilter("subscriber")} />
                <StatPill label="Quản trị" value={admins} active={roleFilter === "admin"} accent="admin" onClick={() => onRoleFilter("admin")} />
                <StatPill label="Đã xác nhận email" value={confirmed} accent="ok" />
            </div>

            {/* ── Filter bar ── */}
            <div className={styles.filterBar}>
                <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Tìm theo tên hoặc email…"
                        value={query}
                        onChange={e => onSearch(e.target.value)}
                    />
                    {query && (
                        <button className={styles.searchClear} onClick={() => onSearch("")}>
                            <X size={12} />
                        </button>
                    )}
                </div>
                <select
                    className={styles.roleSelect}
                    value={roleFilter}
                    onChange={e => onRoleFilter(e.target.value as "all" | Role)}
                >
                    <option value="all">Tất cả loại</option>
                    <option value="free">Miễn phí</option>
                    <option value="subscriber">Thuê bao</option>
                    <option value="admin">Quản trị viên</option>
                </select>
            </div>

            {/* ── Table ── */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Tên</th>
                            <th className={styles.th}>Email</th>
                            <th className={styles.th}>Số điện thoại</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>JLPT</th>
                            <th className={`${styles.th} ${styles.thCenter}`}>Loại</th>
                            <th className={styles.th}>Thuê bao đến</th>
                            <th className={styles.th}>Đăng ký</th>
                            <th className={styles.th}>Đăng nhập cuối</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={styles.emptyRow}>
                                    Không tìm thấy người dùng nào
                                </td>
                            </tr>
                        ) : paged.map(u => (
                            <tr
                                key={u.id}
                                className={styles.tr}
                                onClick={() => setSelectedUser(u)}
                            >
                                <td className={styles.td}>
                                    <div className={styles.nameCell}>
                                        <Avatar name={u.display_name} size={28} />
                                        <span className={styles.nameText}>{u.display_name}</span>
                                    </div>
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.emailText}>{u.email ?? "—"}</span>
                                    {!u.email_confirmed_at && u.email && (
                                        <span className={styles.unconfirmed}>chưa xác nhận</span>
                                    )}
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.emailText}>{u.phone ?? "—"}</span>
                                </td>
                                <td className={`${styles.td} ${styles.tdCenter}`}>
                                    {u.jlpt_level ? (
                                        <span className={`${styles.jlptBadge} ${styles[`jlpt${u.jlpt_level}`]}`}>
                                            {u.jlpt_level}
                                        </span>
                                    ) : "—"}
                                </td>
                                <td className={`${styles.td} ${styles.tdCenter}`}>
                                    <span className={`${styles.roleBadge} ${roleMeta(u.role).cls}`}>
                                        {roleMeta(u.role).label}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    {u.role === "subscriber" && u.subscription_until
                                        ? fmtDate(u.subscription_until)
                                        : "—"}
                                </td>
                                <td className={styles.td}>{fmtDate(u.created_at)}</td>
                                <td className={styles.td}>{fmtDate(u.last_sign_in_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        ← Trước
                    </button>
                    <span className={styles.pageInfo}>
                        Trang {page} / {totalPages}
                        <span className={styles.pageCount}>({filtered.length} kết quả)</span>
                    </span>
                    <button
                        className={styles.pageBtn}
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Tiếp →
                    </button>
                </div>
            )}

            {/* ── Modals ── */}
            {selectedUser && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                />
            )}
            {showCreate && (
                <CreateUserModal
                    onClose={() => setShowCreate(false)}
                    onCreated={(newUser) => { setUsers(prev => [newUser, ...prev]); setShowCreate(false) }}
                />
            )}
        </div>
    )
}

function StatPill({
    label, value, active = false, accent, onClick,
}: {
    label: string
    value: number
    active?: boolean
    accent?: "sub" | "admin" | "ok"
    onClick?: () => void
}) {
    return (
        <button
            type="button"
            className={`${styles.statPill} ${active ? styles.statPillActive : ""} ${accent ? styles[`pill_${accent}`] : ""}`}
            onClick={onClick}
            disabled={!onClick}
        >
            <span className={styles.statPillVal}>{value}</span>
            <span className={styles.statPillLabel}>{label}</span>
        </button>
    )
}
