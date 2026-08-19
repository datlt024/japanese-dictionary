"use client"

import { ConfigProvider } from "antd"
import viVN from "antd/locale/vi_VN"
import type { ReactNode } from "react"

export default function AntdAdminProvider({ children }: { children: ReactNode }) {
    return (
        <ConfigProvider
            locale={viVN}
            theme={{
                token: {
                    colorPrimary: "#2563EB",
                    colorBgContainer: "#ffffff",
                    colorBgLayout: "#F7F8FA",
                    colorBorder: "#E5EAF2",
                    colorBorderSecondary: "#E5EAF2",
                    borderRadius: 8,
                    borderRadiusLG: 12,
                    fontFamily: "var(--loaded-font-body), 'Noto Sans JP', sans-serif",
                    fontSize: 14,
                },
                components: {
                    Card: {
                        paddingLG: 24,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    },
                    Statistic: {
                        titleFontSize: 13,
                        contentFontSize: 30,
                    },
                    Tabs: {
                        inkBarColor: "#2563EB",
                        itemActiveColor: "#2563EB",
                        itemSelectedColor: "#2563EB",
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    )
}
