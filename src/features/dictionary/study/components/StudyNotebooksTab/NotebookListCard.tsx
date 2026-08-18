import { Briefcase, BookOpen, Layers, Zap, Flame, CheckCircle2, ChevronRight, FolderOpen, MoreHorizontal, Pencil, Trash2, X } from "lucide-react"
import type { NotebookGroup, NotebookWithCount } from "@/domain/notebook/notebook.type"
import styles from "./StudyNotebooksTab.module.css"

const CARD_COLORS = [
    { bg: "#f5f3ff", text: "#7c3aed" },
    { bg: "#f0fdf4", text: "#16a34a" },
    { bg: "#fff7ed", text: "#ea580c" },
    { bg: "#eff6ff", text: "#2563eb" },
    { bg: "#fdf2f8", text: "#db2777" },
    { bg: "#f0fdfa", text: "#0d9488" },
]
const CARD_ICONS = [Briefcase, BookOpen, Layers, Zap, Flame, CheckCircle2]

interface Props {
    nb: NotebookWithCount
    index: number
    groups: NotebookGroup[]
    onOpen: () => void
    onPractice: () => void
    onDelete: () => void
    onRename: () => void
    onMove: (groupId: string | null) => void
    menuOpen: boolean
    onMenuToggle: () => void
}

export default function NotebookListCard({ nb, index, groups, onOpen, onPractice, onDelete, onRename, onMove, menuOpen, onMenuToggle }: Props) {
    const color = CARD_COLORS[index % CARD_COLORS.length]
    const Icon = CARD_ICONS[index % CARD_ICONS.length]

    return (
        <div className={styles.card} data-menu={nb.id}>
            <button type="button" className={styles.cardMain} onClick={onOpen}>
                <div className={styles.cardIcon} style={{ background: color.bg }}>
                    <Icon size={20} style={{ color: color.text }} />
                </div>
                <div className={styles.cardBody}>
                    <p className={styles.cardName}>{nb.name}</p>
                    <p className={styles.cardCount}>{nb.item_count.toLocaleString("vi-VN")} mục</p>
                </div>
                <ChevronRight size={15} className={styles.cardChevron} />
            </button>

            <div className={styles.cardMenuWrap}>
                <button type="button" className={styles.cardMenuBtn} onClick={(e) => { e.stopPropagation(); onMenuToggle() }} title="Tùy chọn">
                    <MoreHorizontal size={14} />
                </button>

                {menuOpen && (
                    <div className={styles.cardMenu} onClick={(e) => e.stopPropagation()}>
                        <button type="button" className={styles.cardMenuItem} onClick={() => { onPractice(); onMenuToggle() }}>
                            <Zap size={13} /> Luyện tập
                        </button>
                        <button type="button" className={styles.cardMenuItem} onClick={() => { onRename(); onMenuToggle() }}>
                            <Pencil size={13} /> Đổi tên
                        </button>

                        {groups.length > 0 && (
                            <>
                                <div className={styles.cardMenuDivider} />
                                <p className={styles.cardMenuLabel}>Chuyển vào nhóm</p>
                                {groups.map((g) => (
                                    <button key={g.id} type="button"
                                        className={`${styles.cardMenuItem} ${nb.group_id === g.id ? styles.cardMenuItemActive : ""}`}
                                        onClick={() => onMove(nb.group_id === g.id ? null : g.id)}>
                                        <FolderOpen size={13} />
                                        {g.name}
                                        {nb.group_id === g.id && <span className={styles.cardMenuCheck}>✓</span>}
                                    </button>
                                ))}
                                {nb.group_id && (
                                    <button type="button" className={styles.cardMenuItem} onClick={() => onMove(null)}>
                                        <X size={13} /> Bỏ khỏi nhóm
                                    </button>
                                )}
                            </>
                        )}

                        <div className={styles.cardMenuDivider} />
                        <button type="button" className={`${styles.cardMenuItem} ${styles.cardMenuItemDanger}`}
                            onClick={() => { onDelete(); onMenuToggle() }}>
                            <Trash2 size={13} /> Xóa sổ tay
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
