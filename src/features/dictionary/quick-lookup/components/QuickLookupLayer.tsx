"use client"

import { useCallback, useEffect, useState } from "react"

import QuickLookupFloatingButton from "./QuickLookupFloatingButton"
import QuickLookupModal from "./QuickLookupModal"

import {
    getQuickLookupTarget,
} from "../services/quick-lookup.service"

type FloatingPosition = {
    top: number
    left: number
}

function normalizeSelectedText(text: string) {
    return text
        .replace(
            /([\u3040-\u30ff\u3400-\u9fff])[\t 　]+([\u3040-\u30ff\u3400-\u9fff])/g,
            "$1$2"
        )
        .replace(/[\n\r\t 　]+/g, "")
        .trim()
}

function shouldIgnoreSelection(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false
    }

    return Boolean(
        target.closest(
            "input, textarea, button, select, a, iframe, [data-disable-quick-lookup='true']"
        )
    )
}

export default function QuickLookupLayer() {
    const [selectedText, setSelectedText] = useState("")
    const [floatingPosition, setFloatingPosition] =
        useState<FloatingPosition | null>(null)

    const [detailOpen, setDetailOpen] = useState(false)
    const [detailTitle, setDetailTitle] = useState("")
    const [detailUrl, setDetailUrl] = useState("")

    const clearSelection = useCallback(() => {
        setSelectedText("")
        setFloatingPosition(null)
    }, [])

    const handleSelection = useCallback((event: MouseEvent | TouchEvent) => {
        if (shouldIgnoreSelection(event.target)) {
            return
        }

        const selection = window.getSelection()
        const text = normalizeSelectedText(selection?.toString() || "")

        if (!selection || !text || selection.rangeCount === 0) {
            clearSelection()
            return
        }

        const rect = selection
            .getRangeAt(0)
            .getBoundingClientRect()

        if (rect.width === 0 && rect.height === 0) {
            clearSelection()
            return
        }

        setSelectedText(text)
        setFloatingPosition({
            top: Math.max(rect.top - 46, 12),
            left: Math.max(rect.left, 12),
        })
    }, [clearSelection])

    useEffect(() => {
        document.addEventListener("mouseup", handleSelection)
        document.addEventListener("touchend", handleSelection)

        return () => {
            document.removeEventListener("mouseup", handleSelection)
            document.removeEventListener("touchend", handleSelection)
        }
    }, [handleSelection])

    async function handleOpenQuickLookup() {
        if (!selectedText) {
            return
        }

        const target = await getQuickLookupTarget(
            selectedText,
            "vi"
        )

        setDetailTitle(target.title)
        setDetailUrl(target.url)
        setDetailOpen(true)
        setFloatingPosition(null)
    }

    return (
        <>
            {floatingPosition && selectedText && (
                <QuickLookupFloatingButton
                    top={floatingPosition.top}
                    left={floatingPosition.left}
                    onClick={handleOpenQuickLookup}
                />
            )}

            <QuickLookupModal
                open={detailOpen}
                title={detailTitle}
                url={detailUrl}
                onClose={() => setDetailOpen(false)}
            />
        </>
    )
}