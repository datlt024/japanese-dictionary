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
        >
            ✍
            <span className={styles.tooltip}>Viết tay</span>
        </Button>
    )
}