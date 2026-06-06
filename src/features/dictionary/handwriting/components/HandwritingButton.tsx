"use client"

import styles from "./HandwritingButton.module.css"

type Props = {
    onClick: () => void
}

export default function HandwritingButton({ onClick }: Props) {
    return (
        <button
            type="button"
            className={styles.button}
            onClick={onClick}
            aria-label="Viết tay"
        >
            ✍
            <span className={styles.tooltip}>Viết tay</span>
        </button>
    )
}