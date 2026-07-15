# UI/UX Design Brief

**Primary visual reference:** the uploaded Dribbble fitness dashboard shot (Dribbble ID 19377958). This brief was built by directly inspecting the uploaded image, not by scraping the Dribbble page. Values below (colors especially) are sampled by eye from that image — treat them as a strong starting point, not final hex values, and confirm/adjust precisely inside Stitch during the design pass.

## Design Style

Light, warm, "premium fitness lifestyle" — not clinical, not gym-bro-aggressive. Soft rounded cards on a warm off-white canvas, one confident coral accent, an illustrated hero moment, and big, chunky, confident numerals for the data that matters most. The reference reads as three vertical zones: a slim icon-only navigation rail, a wide main content area, and a tinted insight panel on the right holding two secondary cards.

## Theme

Light mode only for v1. (A dark variant can be a Phase 5 polish item, not a v1 requirement.)

## Typography

Font pairing as specified: **Comico Regular + Zodiak Regular.**

- **Comico** is a bold, heavy, rounded/comic-adjacent display face. Use it for the large stat numbers (the "78", "36.8°", "1260" style values) and primary dashboard headings ("OVERVIEW", card values) — this is the closest match to the chunky numeral style in the reference.
- **Zodiak** is a serif display face with sturdy bracketed serifs and a tall x-height, better suited to editorial-feeling moments than to the reference's rounded numerals. Use it for the wordmark/brand name, section labels, or the hero banner headline ("Set goals and motivate yourself") to give the interface a slightly more premium, less generic feel than an all-sans layout.
- Pair both with a plain system sans (e.g. Inter) for body copy, labels, and UI chrome — neither Comico nor Zodiak should carry small text or long strings.
- **Licensing flag — do not forget:** the specific "Comico" font matching this name/weight is distributed as **free for personal use only**, with a separate commercial license required for any public/commercial release. Since this project is headed for a public GitHub/Vercel release, this needs a resolution before Phase 6 (Testing & Deployment) — either purchase the commercial license, or swap in a comparable open-licensed rounded display face for the public build while keeping Comico for the personal instance if you own a personal-use copy.

## Color Palette (sampled from reference — verify in Stitch)

| Token | Approx. hex | Usage |
|---|---|---|
| `bg-canvas` | `#F7F3EE` | Main dashboard background |
| `bg-sidebar` | `#FFFFFF` | Icon nav rail |
| `bg-panel-accent` | `#C3DEDD` | Right-hand insight panel background |
| `accent-primary` | `#EF5B4B` | CTA buttons, logo mark, active-nav pill, chart line |
| `text-primary` | `#17181C` | Headlines, big stat numbers |
| `text-secondary` | `#9B9B9B` | Labels, muted captions |
| `status-positive` | `#3FAE71` | "Good" status tags |
| `status-warning` | `#E0A020` *(proposed — not in reference)* | Low/attention states, e.g. "LOW hydration" |
| `illustration-warm` | `#F5DCC0` | Hero banner background |
| `card-bg` | `#FFFFFF` | All stat/insight cards |

## Spacing & Layout

- Three-zone dashboard skeleton: narrow icon-only sidebar (~80px), fluid main column, fixed-width tinted insight column on large screens (~360–400px), collapsing to a single stacked column on mobile.
- Card grid: 3-across on the main stat tiles at desktop width, collapsing to 2-across then 1-across as the viewport narrows.
- Generous internal card padding (~24px), large card corner radius (~20–24px), soft low-opacity drop shadow instead of visible borders.
- Consistent 16–24px gutter between cards and sections.

## Component Styling

- **Stat card pattern:** icon top-left, small status tag top-right (colored per status token), large bold value, muted label beneath. Reused across the dashboard for whatever real metrics replace the reference's sensor-style tiles (see PRD note).
- **Hero banner:** illustration + short motivational headline (Zodiak) + one pill-shaped primary CTA button (`accent-primary` fill, white text, fully rounded).
- **Nav rail:** icon-only, current section shown as a soft rounded highlight pill behind the icon, not a color change alone (for clarity at a glance).
- **Insight panel cards:** same card language as the main stat cards, but sit on the tinted `bg-panel-accent` background rather than `bg-canvas`, which is what visually separates "at a glance" data (main column) from "trend / this week" data (side column).

## Animations & Transitions

Per the framework's motion requirement — premium, restrained micro-interactions, not generic fade-ins everywhere:

- Stat values count up from 0 on first render/data change, rather than snapping to the final number.
- Chart lines/bars draw in on load rather than appearing instantly.
- Cards use a subtle staggered entrance (short fade + slight upward slide) on route change.
- Buttons and nav icons get a small scale/opacity response on press for tactile feedback.
- **Open item:** exact wiring (Framer Motion vs. a framework-provided motion MCP tool) depends on what's actually registered in `fullcontext_framework.md`, which wasn't included in this handoff. Implement with Framer Motion conventions in the interim and reconcile against the framework file once available — do not invent a specific MCP tool name that hasn't been confirmed.
