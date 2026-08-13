import { redirect } from "next/navigation"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import AppLayout from "@/shared/components/layout/AppLayout"
import PracticeClient from "@/features/notebook/components/PracticeClient/PracticeClient"

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ mode?: string }>
}

export const metadata = {
    title: "Luyện tập — Yomi",
    description: "Ôn luyện từ vựng trong sổ tay bằng flashcard, trắc nghiệm hoặc luyện viết.",
}

export default async function PracticePage({ params, searchParams }: Props) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/")

    const { id } = await params
    const { mode } = await searchParams
    return (
        <AppLayout title="Luyện tập" hideSearchTabs disableQuickLookup>
            <PracticeClient notebookId={id} initialMode={mode} />
        </AppLayout>
    )
}
