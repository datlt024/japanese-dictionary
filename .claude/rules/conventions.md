---
description: Coding conventions for paths, styling, components, layouts, and Supabase usage
alwaysApply: false
---

## File scope

This rule applies to TypeScript and React files under `src/`.

Target files:

- `src/**/*.ts`
- `src/**/*.tsx`

---

## Path aliases

`@/*` maps to `./src/*`.

Always use path aliases.

Good:

```ts
import SearchBar from "@/features/dictionary/search/components/SearchBar"