"use client"

import { useState } from "react"
import { X } from "lucide-react"

import styles from "./QuickLookupModal.module.css"

type QuickLookupModalProps = {
    open: boolean
    title: string
    url: string
    onClose: () => void
}

type QuickLookupTab =
    | "vocabulary"
    | "kanji"
    | "example"
    | "grammar"
    | "jpjp"

const TABS: {
    key: QuickLookupTab
    label: string
}[] = [
        {
            key: "vocabulary",
            label: "Từ vựng",
        },
        {
            key: "kanji",
            label: "Hán tự",
        },
        {
            key: "example",
            label: "Mẫu câu",
        },
        {
            key: "grammar",
            label: "Ngữ pháp",
        },
        {
            key: "jpjp",
            label: "Nhật - Nhật",
        },
    ]

export default function QuickLookupModal({
    open,
    title,
    url,
    onClose,
}: QuickLookupModalProps) {
    const [activeTab, setActiveTab] =
        useState<QuickLookupTab>("vocabulary")

    if (!open) {
        return null
    }

    function renderContent() {
        if (activeTab === "vocabulary") {
            return (
                <iframe
                    src={url}
                    title={`Chi tiết ${title}`}
                    className={styles.frame}
                />
            )
        }

        return (
            <div className={styles.emptyTab}>
                <h3>Đang phát triển</h3>
                <p>
                    Tab này sẽ được kết nối với dữ liệu{" "}
                    <strong>{title}</strong> ở bước sau.
                </p>
            </div>
        )
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>
                        Chi tiết từ <span>{title}</span>
                    </h2>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.tabs}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={
                                activeTab === tab.key
                                    ? `${styles.tabButton} ${styles.activeTab}`
                                    : styles.tabButton
                            }
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {renderContent()}
            </div>
        </div>
    )
}