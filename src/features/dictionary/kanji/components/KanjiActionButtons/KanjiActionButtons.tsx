"use client"

import { useState } from "react"

import { BookOpen, FilePenLine, Star } from "lucide-react"

import AuthModal from "@/features/auth/components/AuthModal/AuthModal"
import AddToNotebookModal from "@/features/notebook/components/AddToNotebookModal/AddToNotebookModal"
import ActionButtons from "@/shared/components/ActionButtons/ActionButtons"

type Props = {
    kanjiChar: string
}

export default function KanjiActionButtons({ kanjiChar }: Props) {
    const [notebookOpen, setNotebookOpen] = useState(false)
    const [authOpen, setAuthOpen] = useState(false)

    function handleLoginRequired() {
        setNotebookOpen(false)
        setAuthOpen(true)
    }

    return (
        <>
            <ActionButtons
                items={[
                    {
                        key: "practice",
                        label: "Luyện viết kanji",
                        icon: <BookOpen />,
                    },
                    {
                        key: "note",
                        label: "Ghi chú",
                        icon: <FilePenLine />,
                    },
                    {
                        key: "bookmark",
                        label: "Thêm vào sổ tay",
                        icon: <Star />,
                        onClick: () => setNotebookOpen(true),
                    },
                ]}
            />

            <AddToNotebookModal
                open={notebookOpen}
                onClose={() => setNotebookOpen(false)}
                itemType="kanji"
                itemId={kanjiChar}
                onLoginRequired={handleLoginRequired}
            />

            <AuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
            />
        </>
    )
}
