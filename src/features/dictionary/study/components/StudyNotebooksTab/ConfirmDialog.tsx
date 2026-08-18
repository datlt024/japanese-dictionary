import React, { useEffect } from "react"
import styles from "./StudyNotebooksTab.module.css"

interface Props {
    icon: React.ReactNode
    iconStyle?: React.CSSProperties
    title: string
    desc: React.ReactNode
    okLabel: string
    okStyle?: React.CSSProperties
    loading?: boolean
    onCancel: () => void
    onOk: () => void
}

export default function ConfirmDialog({ icon, iconStyle, title, desc, okLabel, okStyle, loading, onCancel, onOk }: Props) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onCancel])

    return (
        <div className={styles.confirmOverlay} onClick={onCancel} role="presentation">
            <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
                <div className={styles.confirmIcon} style={iconStyle}>{icon}</div>
                <h3 className={styles.confirmTitle}>{title}</h3>
                <p className={styles.confirmDesc}>{desc}</p>
                <div className={styles.confirmActions}>
                    <button type="button" className={styles.confirmCancel} onClick={onCancel}>Hủy</button>
                    <button type="button" className={styles.confirmOk} style={okStyle} onClick={onOk} disabled={loading}>
                        {loading ? "Đang xử lý..." : okLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
