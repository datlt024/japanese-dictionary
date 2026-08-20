"use client"

import { useEffect } from "react"
import { Button } from "antd"
import AppLayout from "@/shared/components/layout/AppLayout"

export default function GrammarDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") {
            console.error(error)
        }
    }, [error])

    return (
        <AppLayout title="Ngữ pháp">
            <div style={{
                padding: "48px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                textAlign: "center",
            }}>
                <p style={{ fontSize: 32 }}>⚠️</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    Không thể tải ngữ pháp
                </p>
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
                    Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.
                </p>
                <Button type="primary" onClick={reset} style={{ marginTop: 8 }}>
                    Thử lại
                </Button>
            </div>
        </AppLayout>
    )
}
