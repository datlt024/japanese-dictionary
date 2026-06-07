"use client"

import {
    ChangeEvent,
    useEffect,
    useRef,
    useState,
} from "react"
import NextImage from "next/image"
import { ImageIcon, X } from "lucide-react"

import styles from "./ImageScanModal.module.css"

import QuickLookupFloatingButton from "@/features/dictionary/quick-lookup/components/QuickLookupFloatingButton"
import QuickLookupModal from "@/features/dictionary/quick-lookup/components/QuickLookupModal"
import {
    getQuickLookupTarget,
} from "@/features/dictionary/quick-lookup/services/quick-lookup.service"

import useImageScan from "../hooks/useImageScan"

type ImageScanModalProps = {
    open: boolean
    onClose: () => void
}

type FloatingPosition = {
    top: number
    left: number
}

function removeJapaneseInnerSpaces(text: string) {
    return text
        .replace(
            /([\u3040-\u30ff\u3400-\u9fff])[\t 　]+([\u3040-\u30ff\u3400-\u9fff])/g,
            "$1$2"
        )
        .replace(
            /([\u3040-\u30ff\u3400-\u9fff])[\t 　]+([0-9])/g,
            "$1$2"
        )
        .replace(
            /([0-9])[\t 　]+([\u3040-\u30ff\u3400-\u9fff])/g,
            "$1$2"
        )
}

function normalizeRecognizedText(text: string) {
    return removeJapaneseInnerSpaces(text)
        .replace(/[|｜]/g, "")
        .replace(/[＿_]{2,}/g, "")
        .replace(/[ \t　]+\n/g, "\n")
        .replace(/\n[ \t　]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
}

function normalizeSelectedText(text: string) {
    return removeJapaneseInnerSpaces(text)
        .replace(/[\n\r\t 　]+/g, "")
        .trim()
}

function getSelectionText() {
    if (typeof window === "undefined") {
        return ""
    }

    return window.getSelection()?.toString().trim() || ""
}

export default function ImageScanModal({
    open,
    onClose,
}: ImageScanModalProps) {
    const inputRef = useRef<HTMLInputElement | null>(null)

    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [recognizedText, setRecognizedText] = useState("")
    const [selectedText, setSelectedText] = useState("")
    const [floatingPosition, setFloatingPosition] =
        useState<FloatingPosition | null>(null)

    const [detailOpen, setDetailOpen] = useState(false)
    const [detailTitle, setDetailTitle] = useState("")
    const [detailUrl, setDetailUrl] = useState("")

    const {
        loading,
        progress,
        error,
        recognizeImage,
    } = useImageScan()

    useEffect(() => {
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl)
            }
        }
    }, [imageUrl])

    if (!open) {
        return null
    }

    async function handleFileChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0]

        event.target.value = ""

        if (!file) {
            return
        }

        if (imageUrl) {
            URL.revokeObjectURL(imageUrl)
        }

        setImageUrl(URL.createObjectURL(file))
        setRecognizedText("")
        setSelectedText("")
        setFloatingPosition(null)
        setDetailOpen(false)
        setDetailTitle("")
        setDetailUrl("")

        const text = await recognizeImage(file)

        setRecognizedText(normalizeRecognizedText(text))
    }

    function handleTextSelection() {
        if (typeof window === "undefined") {
            return
        }

        const selection = window.getSelection()
        const text = normalizeSelectedText(getSelectionText())

        if (
            !selection ||
            !text ||
            selection.rangeCount === 0
        ) {
            setSelectedText("")
            setFloatingPosition(null)
            return
        }

        const rect = selection
            .getRangeAt(0)
            .getBoundingClientRect()

        setSelectedText(text)
        setFloatingPosition({
            top: Math.max(rect.top - 48, 12),
            left: Math.max(rect.left, 12),
        })
    }

    function handleClose() {
        setSelectedText("")
        setFloatingPosition(null)
        setDetailOpen(false)

        if (typeof window !== "undefined") {
            window.getSelection()?.removeAllRanges()
        }

        onClose()
    }

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
    }

    return (
        <>
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <h2>Dịch ảnh</h2>

                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={handleClose}
                            aria-label="Đóng"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.body}>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className={styles.fileInput}
                            onChange={handleFileChange}
                        />

                        {!imageUrl && (
                            <button
                                type="button"
                                className={styles.uploadBox}
                                onClick={() =>
                                    inputRef.current?.click()
                                }
                            >
                                <ImageIcon size={34} />
                                <span>
                                    Chọn ảnh có chữ tiếng Nhật
                                </span>
                                <small>
                                    Nên chọn ảnh rõ chữ hoặc crop gần vùng cần tra
                                </small>
                            </button>
                        )}

                        {imageUrl && (
                            <div className={styles.previewGrid}>
                                <div className={styles.previewBox}>
                                    <NextImage
                                        src={imageUrl}
                                        alt="Ảnh cần dịch"
                                        fill
                                        unoptimized
                                        className={styles.previewImage}
                                    />

                                    <button
                                        type="button"
                                        className={
                                            styles.changeImageButton
                                        }
                                        onClick={() =>
                                            inputRef.current?.click()
                                        }
                                    >
                                        Chọn ảnh khác
                                    </button>
                                </div>

                                <div className={styles.resultBox}>
                                    {loading ? (
                                        <div
                                            className={
                                                styles.loadingBox
                                            }
                                        >
                                            <p>
                                                Đang nhận diện chữ...
                                            </p>

                                            <div
                                                className={
                                                    styles.progressTrack
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.progressBar
                                                    }
                                                    style={{
                                                        width: `${Math.round(
                                                            progress *
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>

                                            <span>
                                                {Math.round(
                                                    progress * 100
                                                )}
                                                %
                                            </span>
                                        </div>
                                    ) : recognizedText ? (
                                        <div
                                            className={
                                                styles.ocrPanel
                                            }
                                        >
                                            <p
                                                className={
                                                    styles.ocrHint
                                                }
                                            >
                                                Bôi đen chữ hoặc cụm từ cần tra
                                            </p>

                                            <div
                                                className={
                                                    styles.ocrText
                                                }
                                                onMouseUp={
                                                    handleTextSelection
                                                }
                                                onTouchEnd={
                                                    handleTextSelection
                                                }
                                            >
                                                {recognizedText}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={
                                                styles.emptyText
                                            }
                                        >
                                            Chưa có kết quả nhận diện
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {recognizedText && (
                            <div className={styles.rawTextBox}>
                                <p>Muốn tra cả đoạn?</p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedText(
                                            normalizeSelectedText(
                                                recognizedText
                                            )
                                        )
                                        setFloatingPosition(null)
                                    }}
                                >
                                    Chọn toàn bộ đoạn này
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>

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