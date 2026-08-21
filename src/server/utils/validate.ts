import { NextResponse } from "next/server"

type FieldSpec =
    | { type: "string"; min?: number; max?: number; optional?: boolean }
    | { type: "number"; min?: number; max?: number; optional?: boolean }
    | { type: "integer"; min?: number; max?: number; optional?: boolean }
    | { type: "boolean"; optional?: boolean }
    | { type: "enum"; values: readonly string[]; optional?: boolean }

type InferType<F extends FieldSpec> =
    F extends { type: "string" } ? string :
    F extends { type: "number" } ? number :
    F extends { type: "integer" } ? number :
    F extends { type: "boolean" } ? boolean :
    F extends { type: "enum"; values: infer V extends readonly string[] } ? V[number] :
    never

type Schema = Record<string, FieldSpec>

type InferShape<S extends Schema> = {
    [K in keyof S]: S[K] extends { optional: true }
        ? InferType<S[K]> | undefined
        : InferType<S[K]>
}

export function parseBody<S extends Schema>(
    body: unknown,
    schema: S
): { ok: true; data: InferShape<S> } | { ok: false; response: NextResponse } {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { ok: false, response: NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 }) }
    }

    const record = body as Record<string, unknown>
    const out: Record<string, unknown> = {}

    for (const [key, spec] of Object.entries(schema)) {
        const val = record[key]
        if (val === undefined || val === null) {
            if (!spec.optional) {
                return { ok: false, response: NextResponse.json({ error: `Thiếu trường: ${key}` }, { status: 400 }) }
            }
            continue
        }

        if (spec.type === "string") {
            if (typeof val !== "string") {
                return { ok: false, response: NextResponse.json({ error: `${key} phải là chuỗi` }, { status: 400 }) }
            }
            const trimmed = val.trim()
            if (spec.min !== undefined && trimmed.length < spec.min) {
                return { ok: false, response: NextResponse.json({ error: `${key} tối thiểu ${spec.min} ký tự` }, { status: 400 }) }
            }
            if (spec.max !== undefined && trimmed.length > spec.max) {
                return { ok: false, response: NextResponse.json({ error: `${key} tối đa ${spec.max} ký tự` }, { status: 400 }) }
            }
            out[key] = trimmed
        } else if (spec.type === "number") {
            if (typeof val !== "number" || !Number.isFinite(val)) {
                return { ok: false, response: NextResponse.json({ error: `${key} phải là số` }, { status: 400 }) }
            }
            if (spec.min !== undefined && val < spec.min) {
                return { ok: false, response: NextResponse.json({ error: `${key} tối thiểu ${spec.min}` }, { status: 400 }) }
            }
            if (spec.max !== undefined && val > spec.max) {
                return { ok: false, response: NextResponse.json({ error: `${key} tối đa ${spec.max}` }, { status: 400 }) }
            }
            out[key] = val
        } else if (spec.type === "integer") {
            if (typeof val !== "number" || !Number.isInteger(val)) {
                return { ok: false, response: NextResponse.json({ error: `${key} phải là số nguyên` }, { status: 400 }) }
            }
            if (spec.min !== undefined && val < spec.min) {
                return { ok: false, response: NextResponse.json({ error: `${key} tối thiểu ${spec.min}` }, { status: 400 }) }
            }
            if (spec.max !== undefined && val > spec.max) {
                return { ok: false, response: NextResponse.json({ error: `${key} tối đa ${spec.max}` }, { status: 400 }) }
            }
            out[key] = val
        } else if (spec.type === "boolean") {
            if (typeof val !== "boolean") {
                return { ok: false, response: NextResponse.json({ error: `${key} phải là boolean` }, { status: 400 }) }
            }
            out[key] = val
        } else if (spec.type === "enum") {
            if (typeof val !== "string" || !spec.values.includes(val)) {
                return { ok: false, response: NextResponse.json({ error: `${key} không hợp lệ` }, { status: 400 }) }
            }
            out[key] = val
        }
    }

    return { ok: true, data: out as InferShape<S> }
}
