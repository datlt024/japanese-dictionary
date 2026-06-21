# CLAUDE.md

## Project

Japanese–Vietnamese dictionary web app for Vietnamese learners.

The project uses:

* Next.js
* TypeScript
* CSS Modules
* Supabase

UI content and labels are written in Vietnamese.

---

## Rule files

Project rules are organized into focused files under:

```text
.claude/rules/
```

### commands.md

Available npm scripts and validation commands.

Contains:

* `npm run dev`
* `npm run lint`
* `npm run build`
* import scripts
* grammar enrichment scripts

---

### architecture.md

Project architecture and dependency rules.

Contains:

* layer structure
* import rules
* feature module organization
* data flow

---

### conventions.md

General coding conventions.

Contains:

* path aliases
* CSS conventions
* layout rules
* component conventions
* search behavior
* Supabase client usage

---

### database.md

Database-related rules.

Contains:

* generated types
* environment variables
* Supabase usage
* grammar schema
* enrichment workflow

---

### nextjs.md

Next.js-specific rules.

Contains:

* App Router conventions
* Server Components
* page structure
* routing rules
* version awareness

---

### design.md

Visual design system and UI consistency rules.

Contains:

- colors
- spacing
- typography
- border radius
- shadows
- layout consistency
- component appearance

---

### grammar.md

Japanese grammar conventions and database content rules.

Contains:

- notation
- formation rules
- explanation style
- similar grammar rules
- common pairs
- example rules
- Vietnamese wording conventions
- non-grammar vocabulary exclusions

## Priority

When rules conflict:

1. architecture.md
2. database.md
3. nextjs.md
4. conventions.md
5. commands.md

Prefer preserving existing project structure over introducing new patterns.

Avoid unnecessary refactors.

Run validation commands after changes.
