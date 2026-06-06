"use client"

import { useEffect, useMemo, useState } from "react"

import styles from "./KanjiStrokeOrder.module.css"

type Props = {
    kanji: string
    className?: string
}

type StrokePath = {
    id: string
    d: string
    numberX: string
    numberY: string
}

const STROKE_COLORS = [
    "#2563eb",
    "#ef4444",
    "#111827",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#2563eb",
    "#ef4444",
    "#111827",
    "#22c55e",
    "#ef4444",
    "#8b5cf6",
    "#22c55e",
    "#f59e0b",
]

const FALLBACK_NUMBER_POSITIONS = [
    ["14", "22"],
    ["14", "38"],
    ["26", "35"],
    ["27", "49"],
    ["38", "33"],
    ["55", "34"],
    ["13", "67"],
    ["15", "82"],
    ["31", "82"],
    ["48", "77"],
    ["76", "76"],
    ["86", "33"],
    ["62", "60"],
    ["70", "50"],
    ["50", "50"],
]

function getKanjiSvgFileName(kanji: string) {
    const codePoint = kanji.codePointAt(0)

    if (!codePoint) {
        return null
    }

    return `${codePoint.toString(16).padStart(5, "0")}.svg`
}

function getStrokeNumberTexts(document: Document) {
    const strokeNumberTexts = Array.from(
        document.querySelectorAll('text[id*="StrokeNumbers"]')
    )

    if (strokeNumberTexts.length > 0) {
        return strokeNumberTexts
    }

    return Array.from(document.querySelectorAll("text")).filter(
        (text) => {
            const content = text.textContent?.trim() || ""

            return /^\d+$/.test(content)
        }
    )
}

function moveNumberAwayFromCenter(x: number, y: number) {
    const centerX = 54.5
    const centerY = 54.5

    const dx = x - centerX
    const dy = y - centerY

    const distance = Math.sqrt(dx * dx + dy * dy) || 1
    const offset = 7

    const movedX = x + (dx / distance) * offset
    const movedY = y + (dy / distance) * offset

    return {
        x: String(Math.round(movedX * 10) / 10),
        y: String(Math.round(movedY * 10) / 10),
    }
}

function normalizeNumberPosition(
    number: SVGTextElement | undefined,
    fallbackPosition: string[]
) {
    const rawX = number?.getAttribute("x") || fallbackPosition[0]
    const rawY = number?.getAttribute("y") || fallbackPosition[1]

    const x = Number(rawX)
    const y = Number(rawY)

    if (Number.isNaN(x) || Number.isNaN(y)) {
        return {
            x: rawX,
            y: rawY,
        }
    }

    return moveNumberAwayFromCenter(x, y)
}

function extractStrokePaths(svgText: string): StrokePath[] {
    const parser = new DOMParser()
    const document = parser.parseFromString(
        svgText,
        "image/svg+xml"
    )

    const strokePaths = Array.from(
        document.querySelectorAll('g[id*="StrokePaths"] path')
    )

    const paths =
        strokePaths.length > 0
            ? strokePaths
            : Array.from(document.querySelectorAll("path"))

    const numbers = getStrokeNumberTexts(document)

    return paths
        .map((path, index) => {
            const number = numbers[index] as
                | SVGTextElement
                | undefined

            const fallbackPosition =
                FALLBACK_NUMBER_POSITIONS[
                index %
                FALLBACK_NUMBER_POSITIONS.length
                ]

            const numberPosition = normalizeNumberPosition(
                number,
                fallbackPosition
            )

            return {
                id:
                    path.getAttribute("id") ||
                    `stroke-${index}`,
                d: path.getAttribute("d") || "",
                numberX: numberPosition.x,
                numberY: numberPosition.y,
            }
        })
        .filter((path) => path.d)
}

function getRootClassName(className?: string) {
    return className
        ? `${styles.strokeOrder} ${className}`
        : styles.strokeOrder
}

export default function KanjiStrokeOrder({
    kanji,
    className,
}: Props) {
    const [paths, setPaths] = useState<StrokePath[]>([])
    const [loading, setLoading] = useState(true)
    const [replayKey, setReplayKey] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function loadSvg() {
            const fileName = getKanjiSvgFileName(kanji)

            if (!fileName) {
                setPaths([])
                setLoading(false)
                return
            }

            setLoading(true)

            try {
                const response = await fetch(
                    `/kanjivg/${fileName}`
                )

                if (!response.ok) {
                    throw new Error("SVG not found")
                }

                const svgText = await response.text()
                const strokePaths =
                    extractStrokePaths(svgText)

                if (!cancelled) {
                    setPaths(strokePaths)
                    setReplayKey((value) => value + 1)
                }
            } catch (error) {
                console.error(error)

                if (!cancelled) {
                    setPaths([])
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadSvg()

        return () => {
            cancelled = true
        }
    }, [kanji])

    const totalDuration = useMemo(() => {
        return paths.length * 0.45 + 1
    }, [paths.length])

    function replay() {
        setReplayKey((value) => value + 1)
    }

    if (loading) {
        return (
            <div className={getRootClassName(className)}>
                <span className={styles.loading}>
                    Đang tải...
                </span>
            </div>
        )
    }

    if (paths.length === 0) {
        return (
            <div className={getRootClassName(className)}>
                <span className={styles.fallback}>
                    {kanji}
                </span>
            </div>
        )
    }

    return (
        <div className={getRootClassName(className)}>
            <button
                type="button"
                className={styles.replayButton}
                onClick={replay}
                aria-label="Phát lại thứ tự nét"
                title="Phát lại"
            >
                ↻
            </button>

            <svg
                className={styles.svg}
                viewBox="0 0 109 109"
                role="img"
                aria-label={`Thứ tự nét chữ ${kanji}`}
                style={{
                    ["--total-duration" as string]: `${totalDuration}s`,
                }}
            >
                <line
                    x1="54.5"
                    y1="0"
                    x2="54.5"
                    y2="109"
                    className={styles.guide}
                />

                <line
                    x1="0"
                    y1="54.5"
                    x2="109"
                    y2="54.5"
                    className={styles.guide}
                />

                <g key={replayKey}>
                    {paths.map((path, index) => (
                        <path
                            key={path.id}
                            d={path.d}
                            className={styles.path}
                            style={{
                                stroke:
                                    STROKE_COLORS[
                                    index %
                                    STROKE_COLORS.length
                                    ],
                                animationDelay: `${index * 0.45}s`,
                            }}
                        />
                    ))}

                    {paths.map((path, index) => (
                        <text
                            key={`${path.id}-number`}
                            x={path.numberX}
                            y={path.numberY}
                            className={styles.number}
                            style={{
                                fill:
                                    STROKE_COLORS[
                                    index %
                                    STROKE_COLORS.length
                                    ],
                                animationDelay: `${index * 0.45}s`,
                            }}
                        >
                            {index + 1}
                        </text>
                    ))}
                </g>
            </svg>
        </div>
    )
}