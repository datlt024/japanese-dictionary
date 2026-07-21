"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import QuickLookupFloatingButton from "./QuickLookupFloatingButton"
import QuickLookupModal from "./QuickLookupModal"

import {
    getQuickLookupTarget,
    type QuickLookupTarget,
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
        .replace(/[\n\r\t　]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
}

function isValidLookupText(text: string) {
    const normalized = text.trim()

    if (!normalized) {
        return false
    }

    if (normalized.length > 80) {
        return false
    }

    if (/https?:\/\//i.test(normalized)) {
        return false
    }

    if (/localhost/i.test(normalized)) {
        return false
    }

    if (/\.(com|net|jp|vn|org|io)$/i.test(normalized)) {
        return false
    }

    if ((normalized.match(/\n/g) || []).length > 2) {
        return false
    }

    if (normalized.split(/\s+/).length > 5) {
        return false
    }

    if (
        normalized.length === 1 &&
        /^[a-zA-Z0-9]$/.test(normalized)
    ) {
        return false
    }

    // Only trigger for text containing Japanese characters
    if (!/[぀-ヿ㐀-鿿一-龯]/.test(normalized)) {
        return false
    }

    return true
}

function isQuickLookupElement(target: EventTarget | null) {
    return (
        target instanceof HTMLElement &&
        Boolean(target.closest("[data-quick-lookup='true']"))
    )
}

function shouldIgnoreSelection(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false
    }

    return Boolean(
        target.closest(
            [
                "input",
                "textarea",
                "select",
                "a",
                "iframe",
                "[contenteditable='true']",
                "[data-disable-quick-lookup='true']",
            ].join(", ")
        )
    )
}

function isInsideQuickLookupRoot(target: EventTarget | null) {
    return (
        target instanceof HTMLElement &&
        Boolean(
            target.closest("[data-quick-lookup-root='true']")
        )
    )
}

export default function QuickLookupLayer() {
    const [selectedText, setSelectedText] = useState("")
    const [floatingPosition, setFloatingPosition] =
        useState<FloatingPosition | null>(null)

    const [detailOpen, setDetailOpen] = useState(false)
    const [target, setTarget] =
        useState<QuickLookupTarget | null>(null)
    const [loadingWord, setLoadingWord] = useState<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    const clearSelection = useCallback(() => {
        setSelectedText("")
        setFloatingPosition(null)
    }, [])

    const handleSelection = useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (isQuickLookupElement(event.target)) {
                return
            }

            if (!isInsideQuickLookupRoot(event.target)) {
                clearSelection()
                return
            }

            if (shouldIgnoreSelection(event.target)) {
                clearSelection()
                return
            }

            const selection = window.getSelection()
            const text = normalizeSelectedText(
                selection?.toString() || ""
            )

            if (
                !selection ||
                !isValidLookupText(text) ||
                selection.rangeCount === 0
            ) {
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
        },
        [clearSelection]
    )

    useEffect(() => {
        document.addEventListener("mouseup", handleSelection)
        document.addEventListener("touchend", handleSelection)

        return () => {
            document.removeEventListener("mouseup", handleSelection)
            document.removeEventListener(
                "touchend",
                handleSelection
            )
        }
    }, [handleSelection])

    async function handleOpenQuickLookup() {
        if (!selectedText) return

        // Cancel any in-flight previous request
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        // Open modal immediately with skeleton, don't wait for data
        setTarget(null)
        setLoadingWord(selectedText)
        setDetailOpen(true)
        setFloatingPosition(null)

        try {
            const lookupTarget = await getQuickLookupTarget(selectedText, "vi")

            if (!controller.signal.aborted) {
                setTarget(lookupTarget)
                setLoadingWord(null)
            }
        } catch {
            if (!controller.signal.aborted) {
                setDetailOpen(false)
                setLoadingWord(null)
            }
        }
    }

    function handleClose() {
        abortRef.current?.abort()
        abortRef.current = null
        setDetailOpen(false)
        setTarget(null)
        setLoadingWord(null)
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
                target={target}
                loadingTitle={loadingWord ?? undefined}
                onClose={handleClose}
            />
        </>
    )
}