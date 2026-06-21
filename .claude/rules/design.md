---

description: Design system, visual style, spacing, and UI consistency rules
alwaysApply: true
-----------------

## Design philosophy

The application should feel:

* clean
* modern
* lightweight
* highly readable
* consistent

The visual style should resemble:

* Notion
* Linear
* GitHub
* modern dictionary apps

Avoid heavy, flashy, or overly colorful interfaces.

---

## General appearance

Prefer:

* white cards
* soft borders
* subtle shadows
* generous spacing
* rounded corners
* clear typography

Avoid:

* strong shadows
* bright gradients
* excessive colors
* glassmorphism
* neumorphism

---

## Background colors

Page background:

```text id="0aqg3g"
#F7F8FA
```

Card background:

```text id="zg6f8l"
#FFFFFF
```

Border color:

```text id="bb9j61"
#E5EAF2
```

Secondary border:

```text id="mo8ylh"
#ECEEF2
```

---

## Text colors

Primary text:

```text id="6frrlz"
#1F2937
```

Secondary text:

```text id="rnzyxv"
#6B7280
```

Avoid pure black:

```text id="rj4k7z"
#000000
```

---

## Accent colors

Primary:

```text id="4k5jcv"
#2563EB
```

Success:

```text id="1vk4cs"
#16A34A
```

Success background:

```text id="ob4t1d"
#ECFDF3
```

Danger:

```text id="b5mdks"
#EF4444
```

---

## Border radius

Cards:

```text id="h4kdn8"
14px–20px
```

Buttons:

```text id="n60jv8"
12px–14px
```

Small tags:

```text id="n4um6g"
999px
```

---

## Shadows

Use subtle shadows only.

Good:

```text id="h4d7jp"
0 2px 8px rgba(0,0,0,0.04)
```

Avoid:

```text id="5u7x4m"
0 20px 60px rgba(0,0,0,0.25)
```

---

## Spacing

Prefer generous whitespace.

Typical spacing:

* 8px
* 12px
* 16px
* 20px
* 24px
* 32px

Avoid cramped layouts.

---

## Components

Prefer:

* small reusable components
* section cards
* consistent spacing

Avoid:

* giant components
* duplicated UI
* inconsistent paddings

---

## Layout consistency

New pages should visually match existing pages.

Do not redesign unrelated pages.

Preserve:

* header style
* sidebar style
* search bar style
* card appearance

---

## Typography

Prioritize readability.

Japanese text should remain clear and properly aligned.

Avoid:

* overly small fonts
* excessive font weights
* inconsistent font sizes

---

## Animations

Animations should be subtle.

Avoid:

* excessive transitions
* bouncing effects
* unnecessary motion

---

## Icons

Icons should be:

* simple
* consistent
* unobtrusive

Avoid mixing multiple icon styles.

---

## Responsive behavior

Layouts should remain usable on smaller screens.

Avoid fixed widths unless necessary.

---

## Modification rules

When adding new UI:

* follow existing visual patterns;
* reuse existing components whenever possible;
* preserve consistency with the rest of the application;
* avoid introducing a completely different design language.
