"use client"

import { Search } from "lucide-react"

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
        <button
            type="button"
            data-quick-lookup="true"
            className={styles.button}
            style={{ top, left }}
            onMouseDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onClick()
            }}
            aria-label="Tra từ đã chọn"
        >
            <Search size={20} />
        </button>
    )
}