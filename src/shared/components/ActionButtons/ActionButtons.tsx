import styles from "./ActionButtons.module.css"

import type { ReactNode } from "react"

export type DetailActionItem = {
    key: string
    label: string
    icon: ReactNode
    onClick?: () => void
}

type Props = {
    items: DetailActionItem[]
    align?: "start" | "end" | "center"
}

export default function ActionButtons({
    items,
    align = "end",
}: Props) {
    return (
        <div
            className={`${styles.actionButtons} ${styles[align]}`}
        >
            {items.map((item) => (
                <button
                    key={item.key}
                    type="button"
                    className={styles.actionButton}
                    onClick={item.onClick}
                    aria-label={item.label}
                    title={item.label}
                >
                    <span className={styles.icon}>
                        {item.icon}
                    </span>
                </button>
            ))}
        </div>
    )
}