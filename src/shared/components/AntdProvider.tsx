"use client"

import { ConfigProvider } from "antd"
import viVN from "antd/locale/vi_VN"
import type { ReactNode } from "react"

export default function AntdProvider({ children }: { children: ReactNode }) {
    return (
        <ConfigProvider
            locale={viVN}
            theme={{
                token: {
                    colorPrimary: "#2563EB",
                    colorBgContainer: "#ffffff",
                    colorBgLayout: "#F7F8FA",
                    colorBorder: "#E5EAF2",
                    colorBorderSecondary: "#ECEEF2",
                    borderRadius: 8,
                    borderRadiusLG: 12,
                    fontFamily: "var(--loaded-font-body), 'Noto Sans JP', sans-serif",
                    fontSize: 14,
                    colorText: "#1F2937",
                    colorTextSecondary: "#6B7280",
                },
                components: {
                    Button: {
                        borderRadius: 8,
                        fontWeight: 500,
                    },
                    Card: {
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        borderRadius: 12,
                    },
                    Input: {
                        borderRadius: 8,
                    },
                    Select: {
                        borderRadius: 8,
                    },
                    Modal: {
                        borderRadius: 16,
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    )
}
