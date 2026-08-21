import type { Metadata } from "next"
import AppLayout from "@/shared/components/layout/AppLayout"
import AdminClient from "./AdminClient"

export const metadata: Metadata = {
    title: "Quản lý sổ tay | Yomi Admin",
}

export default function AdminPage() {
    return (
        <AppLayout title="Quản lý sổ tay" hideSearch>
            <AdminClient />
        </AppLayout>
    )
}
