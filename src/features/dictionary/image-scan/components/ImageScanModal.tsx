"use client"

import {
    ChangeEvent,
    useEffect,
    useRef,
    useState,
} from "react"
import { createPortal } from "react-dom"
import NextImage from "next/image"
import { ImageIcon, X } from "lucide-react"

import styles from "./ImageScanModal.module.css"

import useImageScan from "../hooks/useImageScan"

type ImageScanModalProps = {
    open: boolean
    onClose: () => void
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

export default function ImageScanModal({
    open,
    onClose,
}: ImageScanModalProps) {
    const inputRef = useRef<HTMLInputElement | null>(null)

    const [mounted, setMounted] = useState(false)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [recognizedText, setRecognizedText] = useState("")

    const {
        loading,
        progress,
        error,
        recognizeImage,
    } = useImageScan()

    useEffect(() => {
        setMounted(true)

        return () => {
            setMounted(false)
        }
    }, [])

    useEffect(() => {
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl)
            }
        }
    }, [imageUrl])

    if (
        !open ||
        !mounted ||
        typeof document === "undefined"
    ) {
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

        const text = await recognizeImage(file)

        setRecognizedText(normalizeRecognizedText(text))
    }

    function handleClose() {
        if (typeof window !== "undefined") {
            window.getSelection()?.removeAllRanges()
        }

        onClose()
    }

    const modal = (
        <div
            className={styles.overlay}
            onClick={handleClose}
            role="presentation"
        >
            <div
                className={styles.modal}
                data-quick-lookup-root="true"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Dịch ảnh"
            >
                <div
                    className={styles.header}
                    data-disable-quick-lookup="true"
                >
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
                            onClick={() => inputRef.current?.click()}
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
                            <div
                                className={styles.previewBox}
                                data-disable-quick-lookup="true"
                            >
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
                                        className={styles.loadingBox}
                                        data-disable-quick-lookup="true"
                                    >
                                        <p>Đang nhận diện chữ...</p>

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
                                                        progress * 100
                                                    )}%`,
                                                }}
                                            />
                                        </div>

                                        <span>
                                            {Math.round(progress * 100)}
                                            %
                                        </span>
                                    </div>
                                ) : recognizedText ? (
                                    <div className={styles.ocrPanel}>
                                        <p className={styles.ocrHint}>
                                            Bôi đen chữ hoặc cụm từ cần tra rồi bấm biểu tượng kính lúp
                                        </p>

                                        <div
                                            className={styles.ocrText}
                                            data-quick-lookup-root="true"
                                        >
                                            {recognizedText}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={styles.emptyText}
                                        data-disable-quick-lookup="true"
                                    >
                                        Chưa có kết quả nhận diện
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {recognizedText && (
                        <div
                            className={styles.rawTextBox}
                            data-disable-quick-lookup="true"
                        >
                            <p>
                                Bôi đen từ/cụm trong văn bản nhận diện để tra nhanh.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div
                            className={styles.error}
                            data-disable-quick-lookup="true"
                        >
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    const portalRoot =
        document.getElementById("portal-root") || document.body

    if (!portalRoot) {
        return null
    }

    return createPortal(modal, portalRoot)
}