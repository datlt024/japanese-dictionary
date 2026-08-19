import { Briefcase, BookOpen, Layers, Zap, Flame, CheckCircle2, ChevronRight, FolderOpen, Pencil, Trash2, X } from "lucide-react"
import type { NotebookGroup, NotebookWithCount } from "@/domain/notebook/notebook.type"
import { Button, Dropdown, Typography } from "antd"
import { MoreOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"

const { Text } = Typography

const CARD_COLORS = [
    { bg: "var(--color-jlpt-n3-soft)", text: "var(--color-jlpt-n3)" },
    { bg: "var(--color-success-soft)",  text: "var(--color-success)"  },
    { bg: "var(--color-warning-soft)",  text: "var(--color-warning)"  },
    { bg: "var(--color-primary-soft)",  text: "var(--color-primary)"  },
    { bg: "var(--color-danger-soft)",   text: "var(--color-danger)"   },
    { bg: "var(--color-jlpt-n2-soft)", text: "var(--color-jlpt-n2)" },
]
const CARD_ICONS = [Briefcase, BookOpen, Layers, Zap, Flame, CheckCircle2]

interface Props {
    nb: NotebookWithCount
    index: number
    groups: NotebookGroup[]
    onOpen: () => void
    onPractice: () => void
    onDelete: () => void
    onRename: () => void
    onMove: (groupId: string | null) => void
    menuOpen: boolean
    onMenuToggle: () => void
}

export default function NotebookListCard({ nb, index, groups, onOpen, onPractice, onDelete, onRename, onMove, onMenuToggle }: Props) {
    const color = CARD_COLORS[index % CARD_COLORS.length]
    const Icon = CARD_ICONS[index % CARD_ICONS.length]

    const menuItems: MenuProps["items"] = [
        {
            key: "practice",
            icon: <Zap size={13} />,
            label: "Luyện tập",
            onClick: () => { onPractice(); onMenuToggle() },
        },
        {
            key: "rename",
            icon: <Pencil size={13} />,
            label: "Đổi tên",
            onClick: () => { onRename(); onMenuToggle() },
        },
        ...(groups.length > 0 ? [
            { type: "divider" as const },
            {
                key: "move-group",
                label: "Chuyển vào nhóm",
                type: "group" as const,
                children: [
                    ...groups.map((g) => ({
                        key: `group-${g.id}`,
                        icon: <FolderOpen size={13} />,
                        label: (
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                {g.name}
                                {nb.group_id === g.id && <span style={{ color: "#2563EB", marginLeft: 8 }}>✓</span>}
                            </span>
                        ),
                        onClick: () => { onMove(nb.group_id === g.id ? null : g.id); onMenuToggle() },
                    })),
                    ...(nb.group_id ? [{
                        key: "remove-group",
                        icon: <X size={13} />,
                        label: "Bỏ khỏi nhóm",
                        onClick: () => { onMove(null); onMenuToggle() },
                    }] : []),
                ],
            },
        ] : []),
        { type: "divider" as const },
        {
            key: "delete",
            icon: <Trash2 size={13} />,
            label: "Xóa sổ tay",
            danger: true,
            onClick: () => { onDelete(); onMenuToggle() },
        },
    ]

    return (
        <div style={{
            display: "flex", alignItems: "center",
            border: "1px solid #E5EAF2", borderRadius: 12,
            overflow: "hidden", background: "#fff",
            marginBottom: 6,
        }}>
            <button
                type="button"
                onClick={onOpen}
                style={{
                    display: "flex", alignItems: "center", gap: 12,
                    flex: 1, padding: "12px 14px", cursor: "pointer",
                    border: "none", background: "transparent",
                    textAlign: "left",
                }}
            >
                <div style={{
                    width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: color.bg,
                }}>
                    <Icon size={18} style={{ color: color.text }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ display: "block", fontSize: 13, color: "#1F2937" }}>{nb.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{nb.item_count.toLocaleString("vi-VN")} mục</Text>
                </div>
                <ChevronRight size={14} style={{ color: "#D1D5DB", flexShrink: 0 }} />
            </button>

            <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
                <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    style={{ margin: "0 8px", flexShrink: 0, color: "#9CA3AF" }}
                />
            </Dropdown>
        </div>
    )
}
