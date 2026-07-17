import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { supabaseServer } from "@/server/supabase/server"
import { serverError } from "@/server/utils/api-error"
import { rateLimit } from "@/shared/utils/rate-limit"
import {
    addNotebookItem,
    listNotebookItems,
    removeNotebookItem,
} from "@/server/repositories/notebook/notebook-items.repository"
import type {
    EnrichedNotebookItem,
    NotebookItem,
    NotebookItemType,
} from "@/domain/notebook/notebook.type"

const VALID_ITEM_TYPES: NotebookItemType[] = ["vocabulary", "kanji", "grammar"]

function isValidItemType(value: unknown): value is NotebookItemType {
    return VALID_ITEM_TYPES.includes(value as NotebookItemType)
}

type Params = { params: Promise<{ id: string }> }

function isKanji(ch: string) {
    const code = ch.codePointAt(0) ?? 0
    return (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf)
}

async function enrichItems(items: NotebookItem[]): Promise<EnrichedNotebookItem[]> {
    const vocabItems = items.filter((i) => i.item_type === "vocabulary")
    const kanjiItems = items.filter((i) => i.item_type === "kanji")
    const grammarItems = items.filter((i) => i.item_type === "grammar")

    const [vocabResult, kanjiResult, grammarResult] = await Promise.all([
        vocabItems.length > 0
            ? supabaseServer
                .from("vocabularies")
                .select("id, primary_word, primary_kana, vocabulary_senses(meaning_vi, sense_index)")
                .in("id", vocabItems.map((i) => Number(i.item_id)))
            : { data: [] },
        kanjiItems.length > 0
            ? supabaseServer
                .from("kanjis")
                .select("kanji, han_viet, meaning_vi")
                .in("kanji", kanjiItems.map((i) => i.item_id))
            : { data: [] },
        grammarItems.length > 0
            ? supabaseServer
                .from("grammars")
                .select("id, pattern, display_pattern, short_meaning_vi, jlpt_level")
                .in("id", grammarItems.map((i) => Number(i.item_id)))
            : { data: [] },
    ])

    const vocabMap = new Map((vocabResult.data ?? []).map((v) => [String(v.id), v]))
    const kanjiMap = new Map((kanjiResult.data ?? []).map((k) => [k.kanji, k]))
    const grammarMap = new Map((grammarResult.data ?? []).map((g) => [String(g.id), g]))

    // Build han_viet lookup for kanji chars found in vocab words
    const vocabKanjiChars = [...new Set(
        (vocabResult.data ?? []).flatMap((v) => [...v.primary_word].filter(isKanji))
    )]
    const vocabKanjiResult = vocabKanjiChars.length > 0
        ? await supabaseServer
            .from("kanjis")
            .select("kanji, han_viet")
            .in("kanji", vocabKanjiChars)
        : { data: [] }
    const hanVietMap = new Map((vocabKanjiResult.data ?? []).map((k) => [k.kanji, k.han_viet]))

    return items.map((item): EnrichedNotebookItem => {
        if (item.item_type === "vocabulary") {
            const v = vocabMap.get(item.item_id)
            const senses = v && "vocabulary_senses" in v
                ? (v.vocabulary_senses as { meaning_vi: string | null; sense_index: number }[])
                : []
            const firstMeaning = senses
                .sort((a, b) => a.sense_index - b.sense_index)
                .find((s) => s.meaning_vi)?.meaning_vi ?? null
            const word = v?.primary_word ?? ""
            const hanViet = [...word]
                .map((ch) => hanVietMap.get(ch))
                .filter(Boolean)
                .join(" ") || null
            return {
                ...item,
                display: {
                    title: word || item.item_id,
                    subtitle: v?.primary_kana ?? null,
                    han_viet: hanViet,
                    meaning: firstMeaning,
                    href: `/vocabulary/${item.item_id}`,
                },
            }
        }
        if (item.item_type === "kanji") {
            const k = kanjiMap.get(item.item_id)
            return {
                ...item,
                display: {
                    title: item.item_id,
                    subtitle: k?.han_viet ?? null,
                    han_viet: null,
                    meaning: k?.meaning_vi ?? null,
                    href: `/kanji/${item.item_id}`,
                },
            }
        }
        // grammar
        const g = grammarMap.get(item.item_id)
        return {
            ...item,
            display: {
                title: g?.display_pattern ?? g?.pattern ?? item.item_id,
                subtitle: g?.jlpt_level ? `JLPT ${g.jlpt_level}` : null,
                han_viet: null,
                meaning: g?.short_meaning_vi ?? null,
                href: `/grammar/${item.item_id}`,
            },
        }
    })
}

export async function GET(_request: NextRequest, { params }: Params) {
    const { id } = await params

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = rateLimit(`nb-items-get:${user.id}`, 60, 60_000)
    if (!rl.ok) return rl.response

    const { data, error } = await listNotebookItems(supabase, id, user.id)

    if (error) {
        return serverError(error, "GET /api/notebooks/[id]/items")
    }

    const enriched = await enrichItems((data ?? []) as NotebookItem[])

    return NextResponse.json(enriched)
}

export async function POST(request: NextRequest, { params }: Params) {
    const { id } = await params

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = rateLimit(`nb-items-write:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)
    const itemType = body?.item_type
    const itemId = typeof body?.item_id === "string" ? body.item_id.trim() : ""

    if (!isValidItemType(itemType)) {
        return NextResponse.json({ error: "item_type không hợp lệ" }, { status: 400 })
    }

    if (!itemId) {
        return NextResponse.json({ error: "item_id không được để trống" }, { status: 400 })
    }

    const { data, error } = await addNotebookItem(supabase, id, user.id, itemType, itemId)

    if (error) {
        // Unique constraint violation = item đã tồn tại
        if (error.code === "23505") {
            return NextResponse.json({ error: "Mục này đã có trong sổ tay" }, { status: 409 })
        }
        return serverError(error, "POST /api/notebooks/[id]/items")
    }

    return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const { id } = await params

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const rl = rateLimit(`nb-items-write:${user.id}`, 30, 60_000)
    if (!rl.ok) return rl.response

    const body = await request.json().catch(() => null)
    const itemType = body?.item_type
    const itemId = typeof body?.item_id === "string" ? body.item_id.trim() : ""

    if (!isValidItemType(itemType)) {
        return NextResponse.json({ error: "item_type không hợp lệ" }, { status: 400 })
    }

    if (!itemId) {
        return NextResponse.json({ error: "item_id không được để trống" }, { status: 400 })
    }

    const { error } = await removeNotebookItem(supabase, id, user.id, itemType, itemId)

    if (error) {
        return serverError(error, "DELETE /api/notebooks/[id]/items")
    }

    return new NextResponse(null, { status: 204 })
}
