---

description: Available npm scripts, validation commands, and data pipelines
alwaysApply: true
-----------------

## General commands

```bash
npm run dev
```

Start the development server.

Default URL:

```text
http://localhost:3000
```

---

```bash
npm run build
```

Create a production build.

Run this after changes that affect:

* routing
* server code
* shared types
* API routes
* build configuration

---

```bash
npm run lint
```

Run ESLint.

Always run this after code changes.

---

## Data import scripts

These scripts require valid Supabase environment variables.

```bash
npm run import:jmdict
```

Import JMdict vocabulary data.

---

```bash
npm run import:kanjidic
```

Import KANJIDIC kanji data.

---

```bash
npm run import:grammars
```

Import grammar records.

---

```bash
npm run build:kanji-links
```

Build kanji → vocabulary relationships.

---

```bash
npm run build:kanji-readings
```

Build kanji reading example data.

---

## Grammar enrichment pipeline

```bash
npm run grammar:enrich [limit]
```

Use Claude API to enrich pending grammar records.

Default:

```text
20 records
```

Example:

```bash
npm run grammar:enrich 50
```

---

```bash
npm run grammar:apply
```

Apply enriched grammar JSON data to the database.

---

## Validation rules

After normal UI changes:

```bash
npm run lint
```

After changes involving:

* routes
* server code
* API handlers
* shared types
* configuration

Run:

```bash
npm run lint
npm run build
```

---

## Test rules

There is currently no automated test suite.

Do not run:

* npm test
* jest
* vitest
* playwright

unless they are added explicitly in the future.

---

## Script safety rules

Do not invent commands that do not exist.

Before suggesting a command, prefer commands already defined by this project.

Avoid introducing additional tools or build systems unless explicitly requested.
