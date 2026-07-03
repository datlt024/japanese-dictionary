"use client"

import {
    useMemo,
    useState,
} from "react"
import { X } from "lucide-react"

import styles from "./QuickLookupModal.module.css"

import KanjiDetailContent from "@/features/dictionary/kanji/components/KanjiDetailContent"
import VocabularyDetailContent from "@/features/dictionary/vocabulary/components/VocabularyDetailContent"

import type {
    QuickLookupKanjiTarget,
    QuickLookupTarget,
} from "../services/quick-lookup.service"

type QuickLookupModalProps = {
    open: boolean
    target: QuickLookupTarget | null
    loadingTitle?: string
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

function getInitialTab(
    target: QuickLookupTarget | null
): QuickLookupTab {
    if (target?.type === "kanji") {
        return "kanji"
    }

    return "vocabulary"
}

function getTargetKey(target: QuickLookupTarget | null) {
    if (!target) {
        return "empty"
    }

    return `${target.type}:${target.title}`
}

function getKanjiTargets(
    target: QuickLookupTarget
): QuickLookupKanjiTarget[] {
    if (target.type === "kanji") {
        return [target]
    }

    if (target.type === "vocabulary") {
        return target.kanjiTargets
    }

    return []
}

export default function QuickLookupModal({
    open,
    target,
    loadingTitle,
    onClose,
}: QuickLookupModalProps) {
    const targetKey = useMemo(
        () => getTargetKey(target),
        [target]
    )

    if (!open) return null

    if (!target) {
        return (
            <div className={styles.overlay} onClick={onClose} role="presentation">
                <div
                    className={styles.modal}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className={styles.header} data-disable-quick-lookup="true">
                        <h2>
                            Chi tiết từ{" "}
                            {loadingTitle && <span>{loadingTitle}</span>}
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
                    <div className={styles.loadingContent}>
                        <div className={`${styles.skeleton} ${styles.skeletonHeading}`} />
                        <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                        <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "70%" }} />
                        <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "85%" }} />
                        <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "55%" }} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <QuickLookupModalInner
            key={targetKey}
            open={open}
            target={target}
            onClose={onClose}
        />
    )
}

function QuickLookupModalInner({
    open,
    target,
    onClose,
}: QuickLookupModalProps) {
    const initialTab = useMemo(
        () => getInitialTab(target),
        [target]
    )

    const [activeTab, setActiveTab] =
        useState<QuickLookupTab>(initialTab)

    const [activeKanjiIndex, setActiveKanjiIndex] =
        useState(0)

    if (!open || !target) {
        return null
    }

    const currentTarget = target

    function renderNotFound() {
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

    function renderComingSoon() {
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

    function renderNoKanji() {
        return (
            <div
                className={styles.emptyTab}
                data-disable-quick-lookup="true"
            >
                <h3>Không có Hán tự</h3>
                <p>
                    Từ <strong>{currentTarget.title}</strong> không có
                    dữ liệu Hán tự để hiển thị.
                </p>
            </div>
        )
    }

    function renderVocabularyContent() {
        if (currentTarget.type !== "vocabulary") {
            return renderComingSoon()
        }

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

    function renderKanjiContent() {
        const kanjiTargets = getKanjiTargets(currentTarget)
        const kanjiTarget =
            kanjiTargets[activeKanjiIndex] || kanjiTargets[0]

        if (!kanjiTarget) {
            return renderNoKanji()
        }

        return (
            <div
                className={`${styles.contentScroll} ${styles.kanjiContentScroll}`}
                data-quick-lookup-root="true"
            >
                {kanjiTargets.length > 1 && (
                    <div
                        className={styles.kanjiTabs}
                        data-disable-quick-lookup="true"
                    >
                        {kanjiTargets.map((item, index) => (
                            <button
                                key={item.currentKanji}
                                type="button"
                                className={
                                    index === activeKanjiIndex
                                        ? `${styles.kanjiTabButton} ${styles.activeKanjiTab}`
                                        : styles.kanjiTabButton
                                }
                                onClick={() =>
                                    setActiveKanjiIndex(index)
                                }
                            >
                                {item.currentKanji}
                            </button>
                        ))}
                    </div>
                )}

                <div className={styles.embeddedContentInner}>
                    <KanjiDetailContent
                        kanji={kanjiTarget.kanji}
                        loading={false}
                        examplesLoading={false}
                        kunyomiGroups={kanjiTarget.kunyomiGroups}
                        onyomiGroups={kanjiTarget.onyomiGroups}
                        currentKanji={kanjiTarget.currentKanji}
                        kanjiOptions={kanjiTarget.kanjiOptions}
                        searchKeyword={kanjiTarget.searchKeyword}
                        embedded
                    />
                </div>
            </div>
        )
    }

    function renderContent() {
        if (currentTarget.type === "not_found") {
            return renderNotFound()
        }

        if (activeTab === "vocabulary") {
            return renderVocabularyContent()
        }

        if (activeTab === "kanji") {
            return renderKanjiContent()
        }

        return renderComingSoon()
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
