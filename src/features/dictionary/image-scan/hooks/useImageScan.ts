import { useState } from "react"
import { createWorker } from "tesseract.js"

export default function useImageScan() {
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    async function recognizeImage(file: File) {
        setLoading(true)
        setProgress(0)
        setError(null)

        let worker: Awaited<ReturnType<typeof createWorker>> | null = null
        try {
            worker = await createWorker("jpn", 1, {
                logger: (message) => {
                    if (message.status === "recognizing text") {
                        setProgress(message.progress)
                    }
                },
            })

            const result = await worker.recognize(file)
            return result.data.text.trim()
        } catch {
            setError("Không thể nhận diện chữ trong ảnh.")
            return ""
        } finally {
            setLoading(false)
            await worker?.terminate()
        }
    }

    return {
        loading,
        progress,
        error,
        recognizeImage,
    }
}