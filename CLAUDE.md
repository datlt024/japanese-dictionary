# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server on localhost:3000
npm run build        # production build
npm run lint         # ESLint

# Data import scripts (require Supabase env vars)
npm run import:jmdict      # import JMdict vocabulary data
npm run import:kanjidic    # import KANJIDIC kanji data
npm run import:grammars    # import grammar points
npm run build:kanji-links       # build kanji cross-links
npm run build:kanji-readings    # build kanji reading examples
```

There is no test suite in this project.

## Architecture

This is a Japanese dictionary web app for Vietnamese learners. UI labels and content are in Vietnamese.

### Layer structure

```
src/
  app/          # Next.js App Router: pages + API routes
  domain/       # Pure TypeScript types only — no framework dependencies
  features/     # UI feature modules (components, hooks, services)
  server/       # Server-only: Supabase repositories + services
  shared/       # Cross-cutting: components, constants, utils, types
```

**Data flow for pages:**
`app/[route]/page.tsx` → `features/.../services/*.service.ts` → `server/repositories/...` → Supabase

**Data flow for API routes:**
`app/api/*/route.ts` → `features/.../services/*.service.ts` → `server/repositories/...` → Supabase

### Key conventions

- Path alias `@/*` maps to `./src/*`
- Domain types live in `src/domain/<entity>/` and are imported as `@/domain/<entity>`
- `src/server/` is server-only (never import into client components)
- Two Supabase clients: `@/shared/lib/supabase/client.ts` (browser) and `@/server/supabase/server.ts` (server)
- Styling: CSS Modules (`.module.css` alongside each component) + Tailwind CSS v4
- Pages use `"use client"` and fetch data client-side via feature services that call API routes
- All pages wrap content in `AppLayout` from `@/shared/components/layout/AppLayout`

### Search tabs

Defined in `src/shared/constants/search-tabs.ts`: `vocabulary | kanji | grammar | example | jpjp | all`. Default language is `"vi"` (Vietnamese).

### Feature module structure

Each feature under `src/features/dictionary/<domain>/` contains:
- `components/` — React components
- `services/` — client-callable async functions (call repositories or API routes)
- `utils/` — pure helpers
- `hooks/` — React hooks

### Supabase types

Generated types are at `src/shared/types/database.generated.ts`. Run `supabase gen types` to regenerate after schema changes.

### Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
