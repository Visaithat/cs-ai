# Neural Path — Design specification

## Product promise

Turn a 30-minute study session into a small, complete learning loop: see the system, understand one idea, make a decision or run an experiment, receive a useful explanation, and know what to revisit.

## Visual direction

- **Character:** an editorial digital textbook: calm paper-like surfaces with a technical blue/indigo signal layer.
- **Typography:** `Noto Sans Thai` for Thai reading and `IBM Plex Mono` only for code, commands, and tensor/data labels.
- **Light palette:** canvas `#F8FAFC`, ink `#122033`, muted `#526176`, surface `#FFFFFF`, line `#DCE3ED`, brand `#4F46E5`, cyan `#0891B2`, success `#15803D`, warning `#B45309`, danger `#BE123C`.
- **Dark palette:** canvas `#0B1020`, ink `#E6EDF8`, muted `#A7B3C8`, surface `#131B2E`, line `#293552`; retain accessible brand and semantic colours.
- **Shape and spacing:** 8px spacing scale; 12px card radius; 16px on interactive cards; thin, high-contrast borders rather than heavy shadows.

## Layout

Desktop uses a three-column learning shell: table of contents (240px), reading column (max 760px), contextual study panel (280px). Tablet collapses the study panel. Mobile exposes contents and glossary as bottom sheets; code and diagrams scroll horizontally within their own containers only.

## Chapter anatomy

1. Day marker, duration and completion control
2. `Big Picture` visual map
3. Objectives and prerequisite chips
4. Short concept cards, with collapsed `Why this matters` depth sections
5. Worked example timeline
6. Try It interactive card
7. Mistakes / hints / quiz
8. Summary, spaced-review badge and next lesson

## Interaction and motion

- System diagrams reveal one edge/node at a time when the learner advances an explanation. Never autoplay essential meaning.
- A 160–220ms opacity/transform transition is used for cards, buttons, progress state, and glossary popovers.
- `prefers-reduced-motion: reduce` disables path drawing, parallax, and continuous animation; state changes remain explicit.
- Interactive feedback never relies only on colour: use an icon, a short text label, and a clear next action.

## Glossary behavior

Technical terms render as semantic buttons with an accessible description. Hover/focus displays a compact definition; click opens a larger sheet with plain-Thai explanation, analogy, example, related lessons, and a "mark for review" action. Keyboard users open with Enter/Space and close with Escape.

## Accessibility acceptance criteria

- WCAG AA contrast in both themes.
- Visible focus indicator; all dialog, quiz, glossary, and playground controls keyboard operable.
- Semantic landmarks, real headings, labelled form controls, alt text, and no colour-only feedback.
- Minimum target size 44px on touch layouts.


## Minimal UI pass (addendum)

Goal: easier to use, less visual noise. No content or capability was removed; secondary material moved behind progressive disclosure. Where this section differs from "Layout" and "Chapter anatomy" above, this section wins.

- **One dominant action per page.** Dashboard: "continue today's lesson" (title, tagline, one primary button, slim progress). Everything else is a quiet list of hairline `<details>` rows: one-line stats (streak · completed · due · exercise; week dots and notes inside), spaced-review queue (opens by default only when a card is due), 30-minute plan + goal, 180-day roadmap and phases.
- **Header:** brand (home), current day, one progress indicator, icon-only theme control (labels are announced and shown as tooltips). Streak moved to the dashboard summary line.
- **Lesson:** single reading column, max 680px (17px Thai text, line-height 1.85). The 240px contents column became a narrow 168px rail (≥1024px, muted, active item bold with a brand rule). The 280px study panel became a compact inline strip under the title (progress + jump links, one-line review status, complete toggle, and time budget / glossary behind one disclosure). Below 1024px the rail becomes the existing Contents sheet; the bottom bar has only Contents and Terms.
- **Surfaces:** a bordered card is reserved for interactive blocks (Big Picture step panel, Payload Lab, Try It, Quiz). Objectives, concepts, mistakes, summary, setup checklist and next lesson are plain text with hairlines. Callouts use a coloured left rule; only success/danger keep a soft tint. Chips are replaced by middle-dot lists.
- **Tokens:** new `--hair` divider colour (lighter than `--line`); progress track 4px; secondary buttons use `.btn-quiet`; primary buttons keep the only filled colour on a screen.
- **Motion and depth:** removed hover lift and press translate, backdrop blur, and the popover slide; popover shadow reduced; sheet slide 24px→12px. `prefers-reduced-motion` handling unchanged.
- **Unchanged contracts:** WCAG AA contrast in both themes, 44px touch targets, visible focus, keyboard behaviour (disclosures via Enter/Space, TOC, Big Picture arrows, tabs, quiz, editor shortcuts), glossary focus return, 320px reflow of long review prompts, and the `aside[aria-label="แผงช่วยเรียน"]` / `#sp-review` hooks used by `scripts/e2e-regression.mjs`.


## Library / bookshelf (addendum)

The home page is the 180-day library; the earlier "continue today's lesson" dashboard became a slim Day 1 strip plus a collapsed progress area below the shelves. Where this section differs from the dashboard notes above, this section wins.

- **Shelves:** one per curriculum phase (6). Books are plain links in a list: a 6px spine rule, `DAY n` in mono, a short topic (clamped to 4 lines; full title is in the accessible name), and a state line. No gradients, no shadows, no skeuomorphic wood or 3D: the "shelf" is a single 2px board line under each row.
- **State is a marker, never a gate.** `✓ เรียนจบ` (success spine), `◐ กำลังเรียน` / `● เนื้อหาเต็ม` (brand spine), `○ พรีวิว` (neutral spine, transparent fill). Every state is icon + text. Review / checkpoint / milestone days add a kind tag.
- **Density control:** each shelf is one scrollable row (9.25rem books) with labelled previous/next buttons (`aria-disabled` at the ends so focus is not lost) and a "แสดงทั้งชั้น" toggle that lays the same books out as 4-day block rows. Only the row scrolls; `documentElement.scrollWidth` must equal the viewport (checked at 320, 768 and 1280).
- **Navigation:** header has `ห้องสมุด` and the current day; lesson and preview pages share a `DayCrumb` (back to shelf, previous/next day). Neighbouring days are suggestions, never a required order.
- **Preview pages** (`/lesson/dNNN` without an authored lesson) are plain reading pages with a warning-ruled `กำลังจัดทำเนื้อหาเต็ม` notice, never styled as a finished lesson.
