"use client"

import { useEffect, useState } from "react"

import styles from "./KanjiStrokeSteps.module.css"

type StrokePath = { id: string; d: string }

function getKanjiSvgFileName(kanji: string) {
    const cp = kanji.codePointAt(0)
    return cp ? `${cp.toString(16).padStart(5, "0")}.svg` : null
}

function extractStrokePaths(svgText: string): StrokePath[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgText, "image/svg+xml")
    const inGroup = Array.from(doc.querySelectorAll('g[id*="StrokePaths"] path'))
    const paths = inGroup.length > 0 ? inGroup : Array.from(doc.querySelectorAll("path"))
    return paths
        .map((el, i) => ({ id: el.getAttribute("id") || `s-${i}`, d: el.getAttribute("d") || "" }))
        .filter((p) => p.d)
}

export default function KanjiStrokeSteps({ kanji }: { kanji: string }) {
    const [paths, setPaths] = useState<StrokePath[]>([])

    useEffect(() => {
        let cancelled = false
        const fileName = getKanjiSvgFileName(kanji)
        if (!fileName) return

        fetch(`/kanjivg/${fileName}`)
            .then((r) => r.text())
            .then((svg) => { if (!cancelled) setPaths(extractStrokePaths(svg)) })
            .catch(() => {})

        return () => { cancelled = true }
    }, [kanji])

    if (paths.length === 0) return null

    return (
        <div className={styles.grid}>
            {paths.map((_, i) => (
                <div key={i} className={styles.step}>
                    <small className={styles.num}>{i + 1}</small>
                    <svg viewBox="0 0 109 109" className={styles.svg}>
                        {paths.slice(0, i).map((p) => (
                            <path key={p.id} d={p.d} className={styles.prev} />
                        ))}
                        <path d={paths[i].d} className={styles.curr} />
                    </svg>
                </div>
            ))}
        </div>
    )
}
