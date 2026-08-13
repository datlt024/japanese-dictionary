# Design — Yomi

Hệ thống thiết kế cố định cho app Yomi (Từ điển Nhật–Việt). Mọi trang đều đọc file này trước khi emit code. Không tái tạo theo từng trang — chỉ mở rộng hoặc sửa đổi file này khi hệ thống cần phát triển thêm.

<!-- Hallmark · genre: modern-minimal · macrostructure: workbench · theme: custom (indigo-cool)
     nav: N3 side-rail · paper: oklch(97.8% 0.006 264) · accent: oklch(55% 0.224 268)
     display: Space Grotesk 500–700 · body: Noto Sans JP 400/500
     designed-as-app · date: 2026-07-18 -->

## Genre

modern-minimal

## Macrostructure family

Tất cả pages là app pages (không có marketing pages).

- App pages: Workbench — functional tool-first, không có hero marketing, nội dung là sản phẩm.

## Theme

Indigo-cool custom: cool violet-tinted paper, brand indigo accent, Space Grotesk display.

```css
/* Paper / surfaces */
--color-bg:             oklch(97.8% 0.006 264);   /* page background */
--color-surface:        oklch(100% 0 0);            /* white card/panel */
--color-surface-muted:  oklch(95.5% 0.010 264);    /* hover / subtle tint */
--color-surface-soft:   oklch(97.2% 0.007 264);    /* very subtle */

/* Borders */
--color-border:         oklch(91.5% 0.014 264);
--color-border-strong:  oklch(85% 0.018 264);

/* Ink */
--color-text-primary:   oklch(12% 0.025 264);
--color-text-secondary: oklch(42% 0.015 264);
--color-text-muted:     oklch(64% 0.010 264);

/* Accent — brand indigo */
--color-primary:        oklch(55% 0.224 268);
--color-primary-hover:  oklch(48% 0.224 268);
--color-primary-soft:   oklch(95.8% 0.040 268);
--color-primary-dark:   oklch(28% 0.185 268);

/* Focus */
--color-focus:          oklch(55% 0.224 268);
```

## Typography

- **Display / UI**: Space Grotesk 500–700, tracking `-0.02em` đến `-0.035em`. Dùng cho headings, labels, nav, buttons.
- **Body / Japanese**: Noto Sans JP 400–500. Dùng cho body text và tất cả nội dung tiếng Nhật.
- **Mono**: JetBrains Mono (optional, cho readings / kana trong context mono cần thiết).

```css
--font-display: "Space Grotesk", "Noto Sans JP", system-ui, sans-serif;
--font-body:    "Noto Sans JP", system-ui, sans-serif;
--font-mono:    "JetBrains Mono", "Fira Code", monospace;
```

## Spacing

4-point named scale. Dùng named tokens (`var(--space-md)`), không dùng raw values.

```css
--space-3xs: 0.25rem;   /* 4px */
--space-2xs: 0.5rem;    /* 8px */
--space-xs:  0.75rem;   /* 12px */
--space-sm:  1rem;      /* 16px */
--space-md:  1.5rem;    /* 24px */
--space-lg:  2rem;      /* 32px */
--space-xl:  3rem;      /* 48px */
--space-2xl: 4.5rem;    /* 72px */
--space-3xl: 7rem;      /* 112px */
```

## Border radius

```css
--radius-xs:   4px;
--radius-sm:   6px;
--radius-md:   10px;
--radius-lg:   14px;
--radius-xl:   18px;
--radius-pill: 999px;
```

Cards: `--radius-lg` (14px) hoặc `--radius-xl` (18px). Buttons: `--radius-sm` (6px). Tags/badges: `--radius-pill`.

## Motion

Minimal — motion-cut project (không có framer-motion / GSAP).

```css
--dur-fast:    150ms;
--dur-med:     220ms;
--dur-slow:    380ms;
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

- Reveals: off (pages composed, not revealed)
- Hover: border/color transitions `var(--dur-fast) var(--ease-in-out)`
- Dropdown: fade + translate-y `-6px → 0` at `var(--dur-fast) var(--ease-out)`
- prefers-reduced-motion: tất cả animations phải gate

## Microinteractions stance

- **Silent success** over celebratory toasts
- **Hover delay**: 0ms (app pages, not marketing)
- **Focus delay**: 0ms — `:focus-visible` outline xuất hiện ngay lập tức, không animate
- **Dropdown**: animation `var(--dur-fast)` chỉ, không bounce

## CTA voice

- **Primary**: filled indigo `var(--color-primary)`, `--radius-sm` (6px), white text, `--font-display` 600
- **Secondary**: outlined `border: 1px solid var(--color-border-strong)`, transparent background, ink text
- **Ghost**: transparent, no border, ink-2 text, hover shows `--color-surface-muted`

## JLPT colors

Semantic — không đổi theo theme:

```css
--color-jlpt-n5: oklch(51% 0.170 152);   /* green */
--color-jlpt-n4: oklch(52% 0.218 252);   /* blue */
--color-jlpt-n3: oklch(48% 0.245 292);   /* purple */
--color-jlpt-n2: oklch(67% 0.175 67);    /* amber */
--color-jlpt-n1: oklch(57% 0.220 28);    /* red */
```

## Per-page allowances

- App pages: không dùng enrichment (hero illustrations, marketing animation)
- Nội dung (vocabulary/kanji/grammar detail): typography only, cards với hairline borders
- Navigation: sidebar (N3 side-rail), không floating pill

## What pages MUST share

- Logo: `読` mark + "Yomi" wordmark (Space Grotesk 700)
- Accent: `var(--color-primary)` — indigo, ≤ 5% per viewport
- Display + body fonts: Space Grotesk + Noto Sans JP
- Sidebar layout: N3 side-rail, collapsible
- Button shape: 6px radius, Space Grotesk 600
- Card appearance: white surface, `--radius-lg` border-radius, `1px solid var(--color-border)`, `var(--shadow-sm)` shadow

## What pages MAY differ on

- Page-specific grid layout (vocabulary detail: 2-col, search: single-col, etc.)
- Section-specific heading hierarchy
- Specific content component arrangement

## Exports

### tokens.css

```css
:root {
    --color-bg:             oklch(97.8% 0.006 264);
    --color-surface:        oklch(100% 0 0);
    --color-surface-muted:  oklch(95.5% 0.010 264);
    --color-surface-soft:   oklch(97.2% 0.007 264);
    --color-border:         oklch(91.5% 0.014 264);
    --color-border-strong:  oklch(85% 0.018 264);
    --color-text-primary:   oklch(12% 0.025 264);
    --color-text-secondary: oklch(42% 0.015 264);
    --color-text-muted:     oklch(64% 0.010 264);
    --color-primary:        oklch(55% 0.224 268);
    --color-primary-hover:  oklch(48% 0.224 268);
    --color-primary-soft:   oklch(95.8% 0.040 268);
    --color-primary-dark:   oklch(28% 0.185 268);
    --font-display: "Space Grotesk", "Noto Sans JP", system-ui, sans-serif;
    --font-body:    "Noto Sans JP", system-ui, sans-serif;
    --space-sm:  1rem;   --space-md: 1.5rem;   --space-lg: 2rem;
    --radius-sm: 6px;    --radius-md: 10px;    --radius-lg: 14px;
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --dur-med: 220ms;
}
```
