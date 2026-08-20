"use client"

import { Button } from "antd"
import styles from "./HandwritingButton.module.css"

type Props = {
    onClick: () => void
}

export default function HandwritingButton({ onClick }: Props) {
    return (
        <Button
            type="text"
            className={styles.button}
            onClick={onClick}
            aria-label="Viết tay"
            style={{ position: "relative", width: 38, height: 38, padding: 0, border: "1px solid var(--color-border)", borderRadius: 10, background: "var(--color-bg)", fontSize: 18 }}
        >
            ✍
            <span className={styles.tooltip}>Viết tay</span>
        </Button>
    )
}