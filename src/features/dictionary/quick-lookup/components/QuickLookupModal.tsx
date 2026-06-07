"use client"

import { useState } from "react"
import { X } from "lucide-react"

import styles from "./QuickLookupModal.module.css"

import VocabularyDetailContent from "@/features/dictionary/vocabulary/components/VocabularyDetailContent"

import type {
    QuickLookupTarget,
} from "../services/quick-lookup.service"

type QuickLookupModalProps = {
    open: boolean
    target: QuickLookupTarget | null
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
        { key: "vocabulary", label: "Từ vựng" },
        { key: "kanji", label: "Hán tự" },
        { key: "example", label: "Mẫu câu" },
        { key: "grammar", label: "Ngữ pháp" },
        { key: "jpjp", label: "Nhật - Nhật" },
    ]

export default function QuickLookupModal({
    open,
    target,
    onClose,
}: QuickLookupModalProps) {
    const [activeTab, setActiveTab] =
        useState<QuickLookupTab>("vocabulary")

    if (!open || !target) {
        return null
    }

    const currentTarget = target

    function renderContent() {
        if (currentTarget.type === "not_found") {
            return (
                <div
                    className={styles.emptyTab}
                    data-disable-quick-lookup="true"
                >
                    <h3>Không tìm thấy kết quả</h3>
                    <p>
                        Không tìm thấy dữ liệu cho{" "}
                        <strong>{currentTarget.title}</strong>.
                    </p>
                </div>
            )
        }

        if (activeTab === "vocabulary") {
            return (
                <div
                    className={styles.contentScroll}
                    data-quick-lookup-root="true"
                >
                    <VocabularyDetailContent
                        vocabulary={currentTarget.vocabulary}
                        language="vi"
                        relatedVocabularies={
                            currentTarget.relatedVocabularies
                        }
                        kanjiDetails={currentTarget.kanjiDetails}
                        embedded
                    />
                </div>
            )
        }

        return (
            <div
                className={styles.emptyTab}
                data-disable-quick-lookup="true"
            >
                <h3>Đang phát triển</h3>
                <p>
                    Tab này sẽ được kết nối với dữ liệu{" "}
                    <strong>{currentTarget.title}</strong> ở bước sau.
                </p>
            </div>
        )
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div
                    className={styles.header}
                    data-disable-quick-lookup="true"
                >
                    <h2>
                        Chi tiết từ{" "}
                        <span>{currentTarget.title}</span>
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

                <div
                    className={styles.tabs}
                    data-disable-quick-lookup="true"
                >
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