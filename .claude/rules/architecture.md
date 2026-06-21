---
description: Project architecture, layer structure, data flow, coding style, and UI rules
alwaysApply: true
---

## Project overview

Japanese–Vietnamese dictionary web app for Vietnamese learners.

The product focuses on:

- vocabulary lookup
- kanji lookup
- grammar lookup
- example sentences
- quick lookup
- handwriting input
- voice search
- image scan / OCR

All UI labels, helper text, empty states, error messages, and mock content must be written in Vietnamese.

Do not mix English into Vietnamese UI unless it is a technical term, code identifier, database field, route name, package name, or API name.

---

## Tech stack

- Next.js App Router
- React
- TypeScript
- CSS Modules
- Supabase / PostgreSQL

Do not introduce Tailwind CSS, styled-components, Zustand, Redux, or another UI/state library unless explicitly requested.

---

## Layer structure

```text
src/
  app/          # Next.js App Router: pages + API routes
  domain/       # Pure TypeScript types only — no framework dependencies
  features/     # UI feature modules: components, hooks, services, utils
  server/       # Server-only: Supabase repositories + server services
  shared/       # Cross-cutting: components, constants, utils, types