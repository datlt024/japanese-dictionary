"use client"

import { Button, Select, Space } from "antd"
import { FolderOpenOutlined, PlusOutlined, SortAscendingOutlined } from "@ant-design/icons"

type SortOrder = "newest" | "oldest" | "az" | "za"

interface Props {
    sortOrder: SortOrder
    onSortChange: (order: SortOrder) => void
    creatingGroup: boolean
    creating: boolean
    onCreateGroup: () => void
    onCreate: () => void
}

export default function NotebookToolbar({
    sortOrder,
    onSortChange,
    creatingGroup,
    creating,
    onCreateGroup,
    onCreate,
}: Props) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 8 }}>
            <Select
                value={sortOrder}
                onChange={onSortChange}
                size="small"
                style={{ width: 130 }}
                suffixIcon={<SortAscendingOutlined />}
                options={[
                    { value: "newest", label: "Mới nhất" },
                    { value: "oldest", label: "Cũ nhất" },
                    { value: "az",     label: "A → Z" },
                    { value: "za",     label: "Z → A" },
                ]}
            />
            <Space size={6}>
                {!creatingGroup && (
                    <Button size="small" icon={<FolderOpenOutlined />} onClick={onCreateGroup}>
                        Tạo nhóm
                    </Button>
                )}
                {!creating && (
                    <Button size="small" type="primary" icon={<PlusOutlined />} onClick={onCreate}>
                        Tạo sổ tay
                    </Button>
                )}
            </Space>
        </div>
    )
}
