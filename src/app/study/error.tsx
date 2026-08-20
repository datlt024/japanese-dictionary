"use client"

import { useEffect } from "react"
import { Button } from "antd"
import AppLayout from "@/shared/components/layout/AppLayout"

export default function StudyError({
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
        <AppLayout title="Học tập">
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
                    Không thể tải trang học tập
                </p>
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
                    Đã xảy ra lỗi. Vui lòng thử lại.
                </p>
                <Button type="primary" onClick={reset} style={{ marginTop: 8 }}>
                    Thử lại
                </Button>
            </div>
        </AppLayout>
    )
}
