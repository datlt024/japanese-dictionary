"use client"

import { Search } from "lucide-react"
import { Button } from "antd"
import styles from "./QuickLookupFloatingButton.module.css"

type QuickLookupFloatingButtonProps = {
    top: number
    left: number
    onClick: () => void
}

export default function QuickLookupFloatingButton({
    top,
    left,
    onClick,
}: QuickLookupFloatingButtonProps) {
    return (
        <Button
            type="text"
            data-quick-lookup="true"
            className={styles.button}
            style={{ top, left, width: 38, height: 38, borderRadius: 999 }}
            onMouseDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onClick()
            }}
            aria-label="Tra từ đã chọn"
            icon={<Search size={20} />}
        />
    )
}
