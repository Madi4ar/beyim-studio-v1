---
name: Beyim Studio
description: An AI lesson-prep tool for Kazakhstani teachers, rendered in Apple's Liquid Glass material language.
colors:
  brand:
    canonical: "#18999D"
  brand-dark:
    canonical: "#127478"
  brand-soft:
    canonical: "#E6F5F5"
  ink:
    canonical: "#1C1D1F"
  muted:
    canonical: "#6C7075"
  line:
    canonical: "#E1E4E8"
  bg:
    canonical: "#F4F5F7"
  surface:
    canonical: "#FFFFFF"
typography:
  display:
    fontFamily: "-apple-system, system-ui, Inter, ui-sans-serif, sans-serif"
    letterSpacing: "-0.025em"
    lineHeight: 1.05
  headline:
    fontFamily: "-apple-system, system-ui, Inter, ui-sans-serif, sans-serif"
    letterSpacing: "-0.016em"
    lineHeight: 1.15
  title:
    fontFamily: "-apple-system, system-ui, Inter, ui-sans-serif, sans-serif"
    letterSpacing: "-0.011em"
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, system-ui, Inter, ui-sans-serif, sans-serif"
    letterSpacing: "0em"
rounded:
  control: "0.75rem"
  surface: "1rem"
  pill: "9999px"
spacing:
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-dark}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "rgba(255,255,255,0.55)"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "16px"
---

# Design System: Beyim Studio

## Overview

**Creative North Star: "The Frosted Instrument"**

Beyim Studio reads as a precise instrument a teacher trusts, built from panes of real glass rather than flat colored rectangles. Structural chrome — the side rail, the bottom tab bar, a sheet pulled up from the bottom — sits as a translucent, blurred layer above scrolling content, catching a bright highlight at its top edge the way a real pane would. Ordinary content stays plain and legible: flat white cards, shadow-only elevation, no competing borders. The system is restrained, not showy — glass is reserved for floating structural and transient chrome, never applied as decoration on static content, and the single brand teal rides through it as the one committed accent rather than a palette of its own.

Confirmed visual rejection: the pulsing cyan glow blob that previously sat behind the home hero headline is gone — it read as a generic "AI SaaS" tell (gradient + glow in the same cyan family), not as this product's own material. The teal gradient banner itself stays; it is a genuine brand commitment, not a category default.

**Key Characteristics:**
- Three-tier translucent material system (glass-surface / chrome-surface / sheet-surface), weighted by structural importance
- Elevation declares once per surface: flat cards use shadow alone, glass surfaces use their blur + inset highlight, never both a border and a shadow
- System typography (Apple's own stack) with tracking and leading tuned per size, tightening as text grows
- A single committed accent (brand teal) on an otherwise neutral, cool-toned ground
- Spring-driven, interruptible motion underneath the material (see the apple-design skill's work in `js/utils/motion.js`) — the glass is static, the gestures that move it are not

## Colors

A restrained, neutral-plus-one-accent palette: a cool near-white ground lets translucent glass read as glass, with the Beyim teal doing all of the color work.

### Primary
- **Beyim Teal** (`#18999D`): the one committed accent — icons, active states, progress fill, the brand's single color statement. Reserved for small, accent-weight surfaces; never a large filled region.
- **Beyim Teal Deep** (`#127478`): the accent darkened enough to carry white text at AA contrast (5.5:1). Used wherever the accent fills a surface that also carries text — primary buttons, the logo tile — rather than the lighter primary teal, which only clears AA for large text or graphical objects (3.45:1).

### Neutral
- **Instrument Ink** (`#1C1D1F`): primary text.
- **Instrument Mist** (`#6C7075`): secondary/muted text, at full opacity — never dimmed further with an opacity modifier, which is what broke placeholder contrast before this pass.
- **Hairline** (`#E1E4E8`): borders and dividers on opaque surfaces only, never alongside a shadow on the same element.
- **Glass Ground** (`#F4F5F7`): page background. Cooler and slightly darker than a plain gray so the glass materials sitting above it have something to differentiate from.
- **Surface White** (`#FFFFFF`): flat content cards, inputs.

### Named Rules
**The One Accent Rule.** The brand teal is the system's only hue. Status/semantic colors (amber for "needs support," a status badge) are the only confirmed exceptions, and even those use a contrast-safe shade (`amber-700`, not `amber-600`), never the lighter default.

**The Declared-Once Rule.** A surface's elevation is signaled exactly one way: a flat card uses `shadow-card` alone (no border); a glass surface uses its blur + inset highlight (no separate border-all-around or stacked drop shadow). A border and a shadow on the same element is the "ghost card" defect and is never intentional in this system.

## Typography

**Display/Body Font:** `-apple-system, system-ui, Inter, ui-sans-serif, sans-serif` — the platform's own system font first, Inter as the web fallback.

**Character:** One typeface throughout; hierarchy comes from size, weight, and tracking, not a second face. This is an Operate surface — legibility and native-feeling text outrank a designed display voice.

### Hierarchy
- **Display** (semibold, `text-display` — tracking `-0.025em`, leading `1.05`): the home hero headline only.
- **Headline** (semibold, `text-headline` — tracking `-0.016em`, leading `1.15`): reserved for a future larger section headline; not yet in use.
- **Title** (semibold, `tracking-tight` ≈ `-0.025em` via Tailwind): page titles and card headers (`text-lg` through `text-3xl`).
- **Body** (regular, `0em` tracking): all paragraph and label copy.
- **Label** (`11px` floor, `uppercase`, `tracking-wide`): field labels (ПРЕДМЕТ / КЛАСС / ЯЗЫК). Never set functional text below 11px — the floor exists because 10–10.5px labels failed legibility review on this exact build.

### Named Rules
**The No-Kicker Rule.** No small uppercase label sits above a headline as a decorative eyebrow — not even the product's own name. Two were found and removed during this pass (home hero, generation screen); the headline carries its own weight.

## Layout

Two shells: a desktop left rail (80px, `chrome-surface`) with a flexible content column, collapsing to a translucent bottom tab bar under `md`. Content columns cap at `max-w-3xl` to `max-w-6xl` depending on density, centered with `px-5 md:px-8`. Grids (quick actions, material cards) run 2-up on mobile, up to 4-up on desktop. Spacing rhythm follows Tailwind's default scale; sections separate with `gap-6` to `gap-10`, more space above a heading than below it.

## Elevation & Depth

Hybrid: flat opaque content (cards, inputs, list rows) carries a single soft ambient shadow at rest; floating structural and transient chrome (rail, tab bar, dropdown panels, the material-picker sheet) is real translucent glass instead of a shadow — its "lift" is the blur and the light-catching top edge, not a drop shadow doing the same job twice.

### Shadow Vocabulary
- **card** (`0 1px 2px rgba(20,22,25,.04), 0 1px 1px rgba(20,22,25,.03)`): resting elevation for flat content cards. No border.
- **pop** (`0 20px 40px -8px rgba(20,22,25,.16), 0 2px 8px rgba(20,22,25,.06)`): hover/active lift for an interactive card, or a fully opaque floating panel.
- **glass** (`0 1px 1px rgba(255,255,255,.6) inset, 0 8px 28px -6px rgba(20,22,25,.14)`): the standard glass material shadow — an inner highlight (the light catching the top of the pane) plus an ambient lift. Used by `chrome-surface` and `sheet-surface`.
- **glass-sm** (`0 1px 1px rgba(255,255,255,.5) inset, 0 2px 10px -2px rgba(20,22,25,.10)`): the same treatment at a lighter weight, for small floating elements (`glass-surface`: dropdown panels, the secondary button).

### Named Rules
**The Weight-Encodes-Hierarchy Rule.** Heavier, more opaque, more blurred glass (`chrome-surface`) marks structural chrome the user always has; lighter glass (`glass-surface`) marks a transient, interactive floating element. Never the reverse.

## Shapes

Two radius steps: `0.75rem` (12px) on controls — buttons, inputs, chips' rectangular cousins — and `1rem` (16px) on surfaces — cards, panels, the modal sheet. Small standalone controls (chips, nav-item pills, the drag handle) go fully round. Nothing in the system uses a radius above 16px; an earlier 24px modal corner was brought back in line with this scale during this pass.

## Components

### Buttons
- **Shape:** 12px radius (`rounded-xl`).
- **Primary:** `brand-dark` fill, white text, `10px 16px` padding. Press feedback is instant (`:active` scale-down on pointer-down, not on release); hover darkens via `brightness-90` rather than swapping to the lighter brand teal, which would drop below AA.
- **Secondary:** light glass (`glass-surface`) rather than flat white — a frosted pane, not a bordered box.
- **Ghost:** transparent, brand-soft tint on hover/press.

### Chips
- **Style:** full-round pill, 1px hairline border, white fill; active state swaps to brand-soft fill with brand-dark text.
- **State:** selected (`chip-active`) vs. unselected (`chip`); both give instant press feedback.

### Cards / Containers
- **Corner Style:** 16px (`rounded-2xl`).
- **Background:** flat `surface` white.
- **Shadow Strategy:** `card` at rest, `pop` on hover for interactive cards. No border (see The Declared-Once Rule).
- **Internal Padding:** `16px` (`p-4`) for compact grid cards, `24px` (`p-6`) for primary content cards.

### Inputs / Fields
- **Style:** 12px radius, 1px hairline border, white fill, subtle inset top shadow.
- **Focus:** border shifts to brand teal plus a soft 4px brand-tinted ring.
- **Placeholder:** full-strength `muted`, not a dimmed opacity variant — the dimmed version failed contrast review.

### Navigation
- **Style:** icon + label, 11px functional text, instant press feedback. Active state: brand-soft fill, brand-dark text/icon. Desktop rail and mobile tab bar are both `chrome-surface` glass, sticky above scrolling content.

### Glass Surfaces (signature component)
Three tiers — `glass-surface` (light, small floating elements), `chrome-surface` (heavy, structural chrome), `sheet-surface` (medium-heavy, the modal/bottom sheet) — share one mechanism: `backdrop-filter: blur()` + `backdrop-saturate` over a translucent white fill, a bright `border-top` catching light at the pane's top edge, and the `glass`/`glass-sm` shadow tokens for lift. Under `prefers-reduced-transparency` or `prefers-contrast: more`, all three fall back to solid white with no blur — the material degrades to a plain surface, never to nothing.

## Do's and Don'ts

### Do:
- **Do** use `brand-dark`, never `brand`, anywhere the accent fills a surface that also carries text.
- **Do** keep functional text at an 11px floor and body copy at 12px or above.
- **Do** reserve `glass-surface` / `chrome-surface` / `sheet-surface` for floating structural or transient chrome — never apply them to static, in-flow content as decoration.
- **Do** let a card's elevation come from exactly one source: shadow for flat content, the glass token's blur+highlight for translucent chrome.

### Don't:
- **Don't** place a small uppercase label above a page headline as a decorative kicker — not even the product name. This was found twice in the incumbent code and removed both times; it does not come back.
- **Don't** pair a border with a shadow on the same card-like element ("ghost card").
- **Don't** use `placeholder:text-muted/70` or any dimmed-opacity variant of a text color that is already at the edge of AA contrast on its own.
- **Don't** introduce a second accent hue. Status color (amber) stays the one confirmed exception, and only at a contrast-safe shade.
