import { Button, Tooltip } from "antd"
import type { ReactNode } from "react"

export type DetailActionItem = {
    key: string
    label: string
    icon: ReactNode
    onClick?: () => void
}

type Props = {
    items: DetailActionItem[]
    align?: "start" | "end" | "center"
}

export default function ActionButtons({ items, align = "end" }: Props) {
    return (
        <div style={{
            display: "flex",
            gap: 6,
            justifyContent: align === "start" ? "flex-start" : align === "center" ? "center" : "flex-end",
            flexWrap: "wrap",
        }}>
            {items.map((item) => (
                <Tooltip key={item.key} title={item.label}>
                    <Button
                        type="text"
                        size="small"
                        icon={item.icon}
                        onClick={item.onClick}
                        aria-label={item.label}
                        style={{ color: "#6B7280", padding: "0 8px", height: 32 }}
                    />
                </Tooltip>
            ))}
        </div>
    )
}
