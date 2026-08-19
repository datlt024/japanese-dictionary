import type { ReactNode } from "react"
import AntdAdminProvider from "./AntdAdminProvider"

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <AntdAdminProvider>{children}</AntdAdminProvider>
}
