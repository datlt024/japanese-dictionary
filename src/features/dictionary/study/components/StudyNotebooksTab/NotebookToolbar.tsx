"use client"

import { ArrowUpDown, FolderOpen, Plus } from "lucide-react"
import styles from "./StudyNotebooksTab.module.css"

type SortOrder = "newest" | "oldest" | "az" | "za"

interface Props {
    sortOrder: SortOrder
    onSortChange: (order: SortOrder) => void
    creatingGroup: boolean
    creating: boolean
    onCreateGroup: () => void
    onCreate: () => void
}

export default function NotebookToolbar({
    sortOrder,
    onSortChange,
    creatingGroup,
    creating,
    onCreateGroup,
    onCreate,
}: Props) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.sortWrap}>
                <ArrowUpDown size={13} className={styles.sortIcon} />
                <select
                    className={styles.sortSelect}
                    value={sortOrder}
                    onChange={e => onSortChange(e.target.value as SortOrder)}
                >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="az">A → Z</option>
                    <option value="za">Z → A</option>
                </select>
            </div>
            <div className={styles.toolbarRight}>
                {!creatingGroup && (
                    <button type="button" className={styles.toolbarBtn} onClick={onCreateGroup}>
                        <FolderOpen size={13} /> Tạo nhóm
                    </button>
                )}
                {!creating && (
                    <button type="button" className={styles.toolbarBtnPrimary} onClick={onCreate}>
                        <Plus size={13} /> Tạo sổ tay
                    </button>
                )}
            </div>
        </div>
    )
}
