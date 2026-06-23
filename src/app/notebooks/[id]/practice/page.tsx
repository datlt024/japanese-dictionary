import AppLayout from "@/shared/components/layout/AppLayout"
import PracticeClient from "@/features/notebook/components/PracticeClient/PracticeClient"

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ mode?: string }>
}

export const metadata = { title: "Luyện tập" }

export default async function PracticePage({ params, searchParams }: Props) {
    const { id } = await params
    const { mode } = await searchParams
    return (
        <AppLayout title="Luyện tập" hideSearchTabs disableQuickLookup>
            <PracticeClient notebookId={id} initialMode={mode} />
        </AppLayout>
    )
}
