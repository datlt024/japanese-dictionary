import "@/styles/detail.css"

import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

type VocabularyDetailPageProps = {
    params: Promise<{
        id: string
    }>
}

export default async function VocabularyDetailPage({
    params,
}: VocabularyDetailPageProps) {

    const { id } = await params

    const { data: vocabulary, error } = await supabase
        .from("vocabularies")
        .select("*")
        .eq("id", Number(id))
        .single()

    if (error || !vocabulary) {
        return (
            <main className="detail-page">
                <div className="detail-card">
                    <h1>Không tìm thấy từ vựng</h1>

                    <Link
                        href="/"
                        className="back-button"
                    >
                        ← Quay lại
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="detail-page">
            <Link
                href="/"
                className="back-button"
            >
                ← Quay lại
            </Link>

            <div className="detail-card">
                <h1 className="detail-word">
                    {vocabulary.word}
                </h1>

                <p className="detail-kana">
                    {vocabulary.kana}
                </p>

                <p className="detail-meaning">
                    {vocabulary.meaning}
                </p>

                <div className="detail-section">
                    <h2>Từ loại</h2>

                    <p>
                        {vocabulary.part_of_speech || "Chưa có dữ liệu"}
                    </p>
                </div>

                <div className="detail-section">
                    <h2>Ví dụ</h2>

                    <p>Đang cập nhật...</p>
                </div>
            </div>
        </main>
    )
}