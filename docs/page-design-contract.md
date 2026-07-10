# Page Design Contract

This is the visual contract for modern You Owe Me content pages such as `/tools/`, answer pages, solution pages, and `/privacy-and-data/`.

Use `/tools/` as the reference page when a new content page needs the standard full-width shell, hero, cards, and CTAs.

## Required Shell

Modern content pages must not render as the old centered white sheet over the dark background.

- Hide `#header`.
- Hide `#wrapper > .bg`.
- Make `#nav`, `#main`, and `#copyright` full width with no max-width.
- Use the modern page background:

```css
background:
  radial-gradient(circle at top left, rgba(175, 230, 126, 0.16), transparent 30%),
  linear-gradient(180deg, #fbfdff 0%, #f4f6f8 76%);
```

## Core Tokens

Use these values unless there is a deliberate page-specific exception.

| Element | Token |
| --- | --- |
| Page background | `#f4f6f8` |
| Body text | `#212931` or `rgba(33, 41, 49, 0.88)` |
| Main heading | `#18212b`, `font-weight: 900`, `letter-spacing: -0.02em` |
| Eyebrow | `rgba(33, 41, 49, 0.88)`, uppercase, `font-weight: 700`, `letter-spacing: 0.08em` |
| Hero border | `1px solid rgba(15, 23, 42, 0.08)` |
| Hero radius | `24px` desktop, `20px` mobile |
| Hero shadow | `0 18px 42px rgba(15, 23, 42, 0.08)` |
| Card border | `1px solid rgba(15, 23, 42, 0.08)` |
| Card radius | `20px` |
| Card shadow | `0 14px 36px rgba(15, 23, 42, 0.08)` |
| Primary CTA background | `#afe67e` |
| Primary CTA hover | `#bcf18c` |
| Primary CTA text | `#18212b` |
| Focus outline | `3px solid rgba(53, 84, 40, 0.32)` |

Hero gradient:

```css
background:
  linear-gradient(135deg, rgba(175, 230, 126, 0.22), rgba(255, 255, 255, 0.98) 48%, rgba(228, 238, 248, 0.92));
```

Hero image/visual card:

```css
border: 1px solid rgba(15, 23, 42, 0.08);
border-radius: 22px;
background: rgba(255, 255, 255, 0.74);
box-shadow: 0 18px 38px rgba(15, 23, 42, 0.1);
```

## Avoid

Do not use these legacy/off-system treatments on new modern pages:

- Old brown/orange accents such as `#6f4a25`, `#fff7ef`, or `rgba(255, 248, 240, ...)`.
- Dark green filled primary buttons such as `#355428` or `#273f1d` for the main CTA.
- The old visible `#header` logo or `#wrapper > .bg` background.
- Card radii of `8px` for major hero/content cards.
- A centered page sheet when the page should be full-width.

## Content Alignment

Modern full-width content pages should use a left-aligned reading flow by
default. Do not apply broad `margin-left: auto` and `margin-right: auto` rules
to every paragraph, list, CTA row, or card inside a blog article: those rules
can make otherwise full-width sections look narrow and visually centered.

Use a narrower measure only for a deliberate, self-contained reading module.
When a page uses a wide hero, its primary sections, cards, tables, metadata,
and closing actions should share that same content row unless the module has a
documented reason to be narrower.

## Check

After styling a modern page, run:

```sh
node scripts/audit-page-design.mjs /page-route/
```

The audit checks the page-specific CSS for shell rules, canonical gradients, canonical CTA/card tokens, and common legacy color drift.
