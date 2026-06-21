---

description: Next.js conventions and version-specific rules for app files
alwaysApply: false
------------------

## File scope

This rule mainly applies to:

* `src/app/**`
* `next.config.*`

---

## Next.js version awareness

Do not assume old Next.js behavior.

Always check the version defined in:

```text
package.json
```

Follow the conventions of the installed version instead of relying on outdated patterns.

---

## App Router only

This project uses the App Router.

Do not introduce:

* `getServerSideProps`
* `getStaticProps`
* `getInitialProps`

These APIs are not used in this project.

---

## Server Components by default

Server Components are preferred.

Do not add:

```ts
"use client"
```

unless browser APIs or interactivity are required.

Use Client Components only for:

* state
* effects
* event handlers
* browser APIs
* DOM access

---

## Route params

Depending on the installed Next.js version, `params` and `searchParams` may be asynchronous.

Always follow the current version requirements.

Avoid assuming older synchronous behavior.

---

## Page styles

Page styles should live beside the page:

```text
page.tsx
page.module.css
```

Do not create separate:

```text
styles/
```

folders for page-specific styles.

---

## Layout hierarchy

Prefer existing layouts.

Avoid duplicating:

* headers
* sidebars
* wrappers

Use shared layout components whenever possible.

---

## Data fetching

Prefer:

* Server Components
* server services
* repositories

Avoid unnecessary client-side fetching.

Use API routes only when they provide real value.

---

## Routing rules

Keep existing route structures.

Avoid renaming:

* route folders
* dynamic params
* URL patterns

unless explicitly requested.

---

## Validation

After changes involving:

* app routes
* layouts
* server components
* configuration

run:

```bash
npm run lint
npm run build
```

Fix build errors before finishing.
