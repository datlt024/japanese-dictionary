"use client"

import { useEffect, useRef, useState } from "react"
import { Alert, Avatar, Button, Input, Select, Skeleton, Space, Tag, Typography } from "antd"
import { HeartFilled, HeartOutlined, DeleteOutlined } from "@ant-design/icons"

import { useAuth } from "@/features/auth/hooks/useAuth"

import styles from "./DictionaryCommunityCard.module.css"

const { Text, Title } = Typography

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
const AVATAR_COLORS = ["#EFF6FF", "#ECFDF5", "#FFFBEB", "#F5F3FF", "#FEF2F2"]
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
        let cancelled = false

        fetch("/api/profile")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((profile: { display_name: string; jlpt_level: string | null } | null) => {
                if (cancelled) return
                if (profile?.display_name) setDisplayName(profile.display_name)
                if (profile?.jlpt_level) setJlptLevel(profile.jlpt_level)
                setProfileLoaded(true)
            })
            .catch(() => { if (!cancelled) setProfileLoaded(true) })

        return () => { cancelled = true }
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
        try {
            const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" })
            if (res.ok) {
                setComments((cur) => cur.filter((c) => c.id !== commentId))
                setTotal((t) => t - 1)
            }
        } catch {
            // network error — comment stays visible
        }
    }

    async function handleSubmit() {
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

    const { sort } = loadConfig

    return (
        <div className={`${styles.detailSideCard} ${styles.communityCard}`}>
            <Title level={5} style={{ margin: "0 0 16px", fontSize: 12, letterSpacing: "0.07em", color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" }}>
                Ý KIẾN CỘNG ĐỒNG
            </Title>

            {!showForm ? (
                <Button
                    block
                    type="dashed"
                    onClick={() => { if (user) setShowForm(true) }}
                    disabled={!user}
                    title={!user ? "Đăng nhập để bình luận" : undefined}
                    style={{ marginBottom: 16, textAlign: "left", justifyContent: "flex-start" }}
                >
                    ✏️ {user ? "Chia sẻ ý kiến của bạn..." : "Đăng nhập để bình luận"}
                </Button>
            ) : (
                <div style={{ marginBottom: 16 }}>
                    {!profileLoaded && (
                        <Space style={{ marginBottom: 8, width: "100%" }}>
                            <Input
                                size="small"
                                placeholder="Tên hiển thị"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                maxLength={30}
                                style={{ flex: 1 }}
                            />
                            <Select
                                size="small"
                                placeholder="Trình độ"
                                value={jlptLevel || undefined}
                                onChange={(v) => setJlptLevel(v ?? "")}
                                allowClear
                                style={{ width: 90 }}
                                options={JLPT_LEVELS.map(l => ({ value: l, label: l }))}
                            />
                        </Space>
                    )}
                    {profileLoaded && (
                        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                            <Text strong style={{ fontSize: 13 }}>{displayName || "Ẩn danh"}</Text>
                            {jlptLevel && <Tag color="blue" style={{ margin: 0 }}>{jlptLevel}</Tag>}
                        </div>
                    )}
                    <Input.TextArea
                        ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
                        placeholder="Chia sẻ mẹo nhớ, cách dùng, hoặc ý kiến của bạn..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={500}
                        showCount
                        rows={3}
                        style={{ marginBottom: 8 }}
                    />
                    {submitError && <Alert message={submitError} type="error" showIcon style={{ marginBottom: 8 }} />}
                    <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                        <Button size="small" onClick={() => { setShowForm(false); setSubmitError(null) }}>Hủy</Button>
                        <Button
                            size="small"
                            type="primary"
                            loading={submitting}
                            disabled={!content.trim() || (!profileLoaded && !displayName.trim())}
                            onClick={handleSubmit}
                        >
                            Gửi
                        </Button>
                    </Space>
                </div>
            )}

            {!fetching && total > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12, fontSize: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Sắp xếp:</Text>
                    <Button
                        type={sort === "likes" ? "link" : "text"}
                        size="small"
                        onClick={() => handleSortChange("likes")}
                        style={{ fontSize: 12, padding: "0 4px", height: "auto", fontWeight: sort === "likes" ? 600 : 400 }}
                    >
                        ♡ Nhiều like
                    </Button>
                    <Text type="secondary" style={{ fontSize: 12 }}>·</Text>
                    <Button
                        type={sort === "newest" ? "link" : "text"}
                        size="small"
                        onClick={() => handleSortChange("newest")}
                        style={{ fontSize: 12, padding: "0 4px", height: "auto", fontWeight: sort === "newest" ? 600 : 400 }}
                    >
                        Mới nhất
                    </Button>
                </div>
            )}

            {fetching ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Skeleton active avatar paragraph={{ rows: 1 }} />
                    <Skeleton active avatar paragraph={{ rows: 1 }} />
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {comments.map((comment) => (
                        <div key={comment.id} style={{ display: "flex", gap: 10 }}>
                            <Avatar
                                size={32}
                                style={{ background: avatarColor(comment.display_name), flexShrink: 0, fontSize: 16 }}
                            >
                                {avatarEmoji(comment.display_name)}
                            </Avatar>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Space size={6} align="center" style={{ marginBottom: 4 }}>
                                    <Text strong style={{ fontSize: 13 }}>{comment.display_name}</Text>
                                    {comment.jlpt_level && <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>{comment.jlpt_level}</Tag>}
                                    <Text type="secondary" style={{ fontSize: 11 }}>{relativeTime(comment.created_at)}</Text>
                                </Space>
                                <Text style={{ fontSize: 13, display: "block", whiteSpace: "pre-wrap", marginBottom: 6 }}>
                                    {comment.content}
                                </Text>
                                <Space size={4}>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={comment.liked_by_me ? <HeartFilled style={{ color: "#EF4444" }} /> : <HeartOutlined />}
                                        onClick={() => handleLike(comment)}
                                        style={{ fontSize: 12, color: comment.liked_by_me ? "#EF4444" : "#9CA3AF", padding: "0 4px", height: "auto" }}
                                    >
                                        {comment.likes_count}
                                    </Button>
                                    {comment.is_mine && (
                                        <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDelete(comment.id)}
                                            style={{ fontSize: 12, padding: "0 4px", height: "auto" }}
                                        >
                                            Xóa
                                        </Button>
                                    )}
                                </Space>
                            </div>
                        </div>
                    ))}

                    {comments.length === 0 && (
                        <Text type="secondary" style={{ fontSize: 13, textAlign: "center", display: "block", padding: "16px 0" }}>
                            Chưa có bình luận nào. Hãy là người đầu tiên! 🌱
                        </Text>
                    )}
                </div>
            )}

            {hasMore && !fetching && (
                <Button
                    type="link"
                    block
                    loading={loadingMore}
                    onClick={handleLoadMore}
                    style={{ marginTop: 12, fontSize: 13 }}
                >
                    {loadingMore ? "Đang tải..." : `Xem thêm (${total - comments.length} bình luận) →`}
                </Button>
            )}
        </div>
    )
}
