"use client"

import {
    useEffect,
    useRef,
    useState,
} from "react"

import { useAuth } from "@/features/auth/hooks/useAuth"

import styles from "./DictionaryCommunityCard.module.css"

type EntryType = "vocabulary" | "kanji" | "grammar"
type SortOrder = "likes" | "newest"

type Comment = {
    id: string
    user_id: string
    content: string
    likes_count: number
    created_at: string
    display_name: string
    jlpt_level: string | null
    liked_by_me: boolean
    is_mine: boolean
}

type Props = {
    entryType: EntryType
    entryId: number
}

type LoadConfig = {
    sort: SortOrder
    page: number
    mode: "replace" | "append"
    seq: number
}

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"]
const AVATAR_COLORS = ["#e8f3ff", "#f0fdf4", "#fff7ed", "#fdf4ff", "#fef2f2"]
const AVATAR_EMOJIS = ["🌸", "🧑‍🎓", "🧑‍💻", "🎌", "📚", "✏️", "🗾", "⛩️"]

function avatarEmoji(name: string) {
    const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
    return AVATAR_EMOJIS[code % AVATAR_EMOJIS.length]
}
function avatarColor(name: string) {
    const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
    return AVATAR_COLORS[code % AVATAR_COLORS.length]
}
function relativeTime(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return "vừa xong"
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ngày trước`
    if (diff < 86400 * 30) return `${Math.floor(diff / 86400 / 7)} tuần trước`
    return `${Math.floor(diff / 86400 / 30)} tháng trước`
}

export default function DictionaryCommunityCard({ entryType, entryId }: Props) {
    const { user, loading: authLoading } = useAuth()

    const [comments, setComments] = useState<Comment[]>([])
    const [total, setTotal] = useState(0)
    const [hasMore, setHasMore] = useState(false)

    // Derive loading from whether the last completed seq matches the requested seq
    const [loadConfig, setLoadConfig] = useState<LoadConfig>({ sort: "likes", page: 0, mode: "replace", seq: 0 })
    const [loadedSeq, setLoadedSeq] = useState(-1)
    const fetching = loadConfig.mode === "replace" && loadedSeq < loadConfig.seq
    const loadingMore = loadConfig.mode === "append" && loadedSeq < loadConfig.seq

    const [showForm, setShowForm] = useState(false)
    const [content, setContent] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [jlptLevel, setJlptLevel] = useState<string>("")
    const [profileLoaded, setProfileLoaded] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const profileFetched = useRef(false)

    useEffect(() => {
        let cancelled = false
        const { sort, page, mode, seq } = loadConfig

        fetch(`/api/comments?type=${entryType}&id=${entryId}&sort=${sort}&page=${page}`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((json: { comments: Comment[]; total: number; has_more: boolean }) => {
                if (cancelled) return
                if (mode === "replace") {
                    setComments(json.comments)
                } else {
                    setComments((prev) => [...prev, ...json.comments])
                }
                setTotal(json.total)
                setHasMore(json.has_more)
                setLoadedSeq(seq)
            })
            .catch(() => {
                if (!cancelled) setLoadedSeq(seq)
            })

        return () => { cancelled = true }
    }, [entryType, entryId, loadConfig])

    useEffect(() => {
        if (!user || authLoading || profileFetched.current) return
        profileFetched.current = true

        fetch("/api/profile")
            .then((r) => r.json())
            .then((profile: { display_name: string; jlpt_level: string | null } | null) => {
                if (profile?.display_name) setDisplayName(profile.display_name)
                if (profile?.jlpt_level) setJlptLevel(profile.jlpt_level)
                setProfileLoaded(true)
            })
            .catch(() => setProfileLoaded(true))
    }, [user, authLoading])

    function handleSortChange(sort: SortOrder) {
        setLoadConfig((prev) => ({ sort, page: 0, mode: "replace", seq: prev.seq + 1 }))
    }

    function handleLoadMore() {
        setLoadConfig((prev) => ({ ...prev, page: prev.page + 1, mode: "append", seq: prev.seq + 1 }))
    }

    async function handleLike(comment: Comment) {
        if (!user) { setShowForm(true); return }

        const prev = comments
        setComments(comments.map((c) =>
            c.id !== comment.id ? c : {
                ...c,
                liked_by_me: !c.liked_by_me,
                likes_count: c.liked_by_me ? c.likes_count - 1 : c.likes_count + 1,
            }
        ))

        try {
            const res = await fetch(`/api/comments/${comment.id}/like`, { method: "POST" })
            if (res.ok) {
                const json = await res.json()
                setComments((cur) => cur.map((c) =>
                    c.id !== comment.id ? c : { ...c, liked_by_me: json.liked, likes_count: json.likes_count }
                ))
            } else {
                setComments(prev)
            }
        } catch {
            setComments(prev)
        }
    }

    async function handleDelete(commentId: string) {
        if (!confirm("Xóa bình luận này?")) return
        const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" })
        if (res.ok) {
            setComments((cur) => cur.filter((c) => c.id !== commentId))
            setTotal((t) => t - 1)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user || submitting) return
        setSubmitError(null)
        setSubmitting(true)

        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entry_type: entryType,
                    entry_id: entryId,
                    content: content.trim(),
                    display_name: displayName.trim(),
                    jlpt_level: jlptLevel || null,
                }),
            })
            const json = await res.json()
            if (!res.ok) {
                setSubmitError(json.error ?? "Có lỗi xảy ra")
                return
            }
            setComments((cur) => [{ ...json, is_mine: true }, ...cur])
            setTotal((t) => t + 1)
            setContent("")
            setShowForm(false)
        } catch {
            setSubmitError("Có lỗi xảy ra, thử lại sau")
        } finally {
            setSubmitting(false)
        }
    }

    function handleInputClick() {
        if (!user) return
        setShowForm(true)
        setTimeout(() => textareaRef.current?.focus(), 50)
    }

    const { sort } = loadConfig

    return (
        <div className={`${styles.detailSideCard} ${styles.communityCard}`}>
            <h3>Ý KIẾN CỘNG ĐỒNG</h3>

            {!showForm ? (
                <button
                    type="button"
                    className={styles.communityInput}
                    onClick={handleInputClick}
                    disabled={!user}
                    title={!user ? "Đăng nhập để bình luận" : undefined}
                >
                    ✏️ {user ? "Chia sẻ ý kiến của bạn..." : "Đăng nhập để bình luận"}
                </button>
            ) : (
                <form className={styles.commentForm} onSubmit={handleSubmit}>
                    {!profileLoaded ? (
                        <div className={styles.profileFields}>
                            <input
                                className={styles.nameInput}
                                type="text"
                                placeholder="Tên hiển thị"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                maxLength={30}
                                required
                            />
                            <select
                                className={styles.levelSelect}
                                value={jlptLevel}
                                onChange={(e) => setJlptLevel(e.target.value)}
                            >
                                <option value="">Trình độ</option>
                                {JLPT_LEVELS.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className={styles.profileHint}>
                            <span className={styles.profileName}>{displayName || "Ẩn danh"}</span>
                            {jlptLevel && <span className={styles.profileBadge}>{jlptLevel}</span>}
                        </div>
                    )}
                    <textarea
                        ref={textareaRef}
                        className={styles.commentTextarea}
                        placeholder="Chia sẻ mẹo nhớ, cách dùng, hoặc ý kiến của bạn..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={500}
                        rows={3}
                        required
                    />
                    <div className={styles.formMeta}>
                        <span className={styles.charCount}>{content.length}/500</span>
                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => { setShowForm(false); setSubmitError(null) }}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={submitting || !content.trim() || (!profileLoaded && !displayName.trim())}
                            >
                                {submitting ? "Đang gửi..." : "Gửi"}
                            </button>
                        </div>
                    </div>
                    {submitError && <p className={styles.formError}>{submitError}</p>}
                </form>
            )}

            {!fetching && total > 0 && (
                <div className={styles.commentSort}>
                    Sắp xếp:{" "}
                    <button
                        type="button"
                        className={sort === "likes" ? styles.sortActive : styles.sortBtn}
                        onClick={() => handleSortChange("likes")}
                    >
                        ♡ Nhiều like
                    </button>
                    {" · "}
                    <button
                        type="button"
                        className={sort === "newest" ? styles.sortActive : styles.sortBtn}
                        onClick={() => handleSortChange("newest")}
                    >
                        Mới nhất
                    </button>
                </div>
            )}

            {fetching ? (
                <div className={styles.skeleton}>
                    <div className={styles.skeletonItem} />
                    <div className={styles.skeletonItem} />
                </div>
            ) : (
                <div className={styles.commentList}>
                    {comments.map((comment) => (
                        <div key={comment.id} className={styles.commentItem}>
                            <div
                                className={styles.commentAvatar}
                                style={{ background: avatarColor(comment.display_name) }}
                            >
                                {avatarEmoji(comment.display_name)}
                            </div>

                            <div className={styles.commentBody}>
                                <div className={styles.commentMeta}>
                                    <strong>{comment.display_name}</strong>
                                    {comment.jlpt_level && (
                                        <span className={styles.jlptBadge}>{comment.jlpt_level}</span>
                                    )}
                                    <small>{relativeTime(comment.created_at)}</small>
                                </div>

                                <p>{comment.content}</p>

                                <div className={styles.commentActions}>
                                    <button
                                        type="button"
                                        className={comment.liked_by_me ? styles.likeActive : styles.likeBtn}
                                        onClick={() => handleLike(comment)}
                                    >
                                        {comment.liked_by_me ? "♥" : "♡"} {comment.likes_count}
                                    </button>
                                    {comment.is_mine && (
                                        <button
                                            type="button"
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(comment.id)}
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {comments.length === 0 && (
                        <p className={styles.emptyState}>
                            Chưa có bình luận nào. Hãy là người đầu tiên! 🌱
                        </p>
                    )}
                </div>
            )}

            {hasMore && !fetching && (
                <button
                    type="button"
                    className={styles.allCommentButton}
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                >
                    {loadingMore ? "Đang tải..." : `Xem thêm (${total - comments.length} bình luận) →`}
                </button>
            )}
        </div>
    )
}
