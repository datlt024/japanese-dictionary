"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Plus } from "lucide-react"
import useSWR from "swr"
import { useAuth } from "@/shared/hooks/useAuth"
import { useNotebooks } from "@/shared/hooks/useNotebooks"
import QuickLookupModal from "@/features/dictionary/quick-lookup/components/QuickLookupModal"
import { getQuickLookupTarget, type QuickLookupTarget } from "@/features/dictionary/quick-lookup/services/quick-lookup.service"
import { NOTEBOOK_ITEM_TYPE_LABELS } from "@/shared/constants/search-tabs"
import type { EnrichedNotebookItem, PublicNotebook } from "@/domain/notebook/notebook.type"
import { fetchPublicItems } from "./explore-utils"
import AddToNotebookModal from "./AddToNotebookModal"
import styles from "./ExploreTab.module.css"

interface Props {
    notebook: PublicNotebook
    onBack: () => void
}

export default function ExploreDetailView({ notebook, onBack }: Props) {
    const { data: items, isLoading } = useSWR<EnrichedNotebookItem[]>(
        `/explore/notebooks/${notebook.id}/items`,
        () => fetchPublicItems(notebook.id),
        { revalidateOnFocus: false, dedupingInterval: 300_000 }
    )
    const { user } = useAuth()
    const { notebooks } = useNotebooks(!!user)
    const [showModal,       setShowModal]       = useState(false)
    const [quickOpen,       setQuickOpen]       = useState(false)
    const [quickTarget,     setQuickTarget]     = useState<QuickLookupTarget | null>(null)
    const [quickLoadingWord,setQuickLoadingWord]= useState<string | null>(null)

    async function handleOpenItem(item: EnrichedNotebookItem) {
        setQuickTarget(null)
        setQuickLoadingWord(item.display.title)
        setQuickOpen(true)
        const vocabularyId = item.item_type === "vocabulary" ? parseInt(item.item_id, 10) : undefined
        const result = await getQuickLookupTarget(item.display.title, "vi", vocabularyId)
        setQuickTarget(result)
        setQuickLoadingWord(null)
    }

    function handleCloseQuick() {
        setQuickOpen(false)
        setQuickTarget(null)
        setQuickLoadingWord(null)
    }

    return (
        <div className={styles.detailView}>
            <button type="button" className={styles.backBtn} onClick={onBack}>
                <ArrowLeft size={15} />
                Quay lại
            </button>

            <div className={styles.detailHeader}>
                <div>
                    {notebook.public_category && (
                        <span className={styles.categoryBadge}>{notebook.public_category}</span>
                    )}
                    <h2 className={styles.detailTitle}>{notebook.name}</h2>
                    {notebook.public_description && (
                        <p className={styles.detailDesc}>{notebook.public_description}</p>
                    )}
                    <p className={styles.detailCount}>{notebook.item_count.toLocaleString("vi-VN")} mục</p>
                </div>
                {user && (
                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={() => setShowModal(true)}
                        disabled={!items || items.length === 0}
                    >
                        <Plus size={14} />
                        Thêm vào sổ tay của tôi
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className={styles.itemSkeleton}>
                    {[1, 2, 3, 4, 5].map((i) => <div key={i} className={styles.itemSkeletonRow} />)}
                </div>
            ) : !items || items.length === 0 ? (
                <div className={styles.emptyItems}>
                    <BookOpen size={32} />
                    <p>Sổ tay này chưa có mục nào.</p>
                </div>
            ) : (
                <ul className={styles.exploreItemGrid}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.exploreItemCard}>
                            {item.item_type === "vocabulary" ? (
                                <button type="button" className={styles.exploreItemLink} onClick={() => handleOpenItem(item)}>
                                    <span className={styles.exploreTypeBadge} data-type={item.item_type}>
                                        {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                    </span>
                                    <span className={styles.exploreItemTitle}>{item.display.title}</span>
                                    {item.display.subtitle && (
                                        <span className={styles.exploreItemSubtitle}>{item.display.subtitle}</span>
                                    )}
                                    {item.display.meaning && (
                                        <span className={styles.exploreItemMeaning}>{item.display.meaning}</span>
                                    )}
                                </button>
                            ) : (
                                <Link href={item.display.href} className={styles.exploreItemLink}>
                                    <span className={styles.exploreTypeBadge} data-type={item.item_type}>
                                        {NOTEBOOK_ITEM_TYPE_LABELS[item.item_type]}
                                    </span>
                                    <span className={styles.exploreItemTitle}>{item.display.title}</span>
                                    {item.display.subtitle && (
                                        <span className={styles.exploreItemSubtitle}>{item.display.subtitle}</span>
                                    )}
                                    {item.display.meaning && (
                                        <span className={styles.exploreItemMeaning}>{item.display.meaning}</span>
                                    )}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <QuickLookupModal
                open={quickOpen}
                target={quickTarget}
                loadingTitle={quickLoadingWord ?? undefined}
                onClose={handleCloseQuick}
            />

            {!user && (
                <div className={styles.authPrompt}>
                    <p>Đăng nhập để thêm mục vào sổ tay cá nhân của bạn.</p>
                    <Link href="/login" className={styles.btnPrimary}>Đăng nhập</Link>
                </div>
            )}

            {showModal && items && (
                <AddToNotebookModal items={items} notebooks={notebooks} onClose={() => setShowModal(false)} />
            )}
        </div>
    )
}
