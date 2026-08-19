"use client"

import Link from "next/link"
import { Button, Result } from "antd"

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 24 }}>
            <Result
                status="error"
                title="Đã xảy ra lỗi"
                subTitle="Có lỗi không mong muốn xảy ra. Vui lòng thử lại hoặc quay về trang chủ."
                extra={[
                    <Button key="retry" type="primary" onClick={() => reset()}>
                        Thử lại
                    </Button>,
                    <Link key="home" href="/">
                        <Button>Về trang chủ</Button>
                    </Link>,
                ]}
            />
        </div>
    )
}
