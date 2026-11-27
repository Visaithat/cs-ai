<img src="assets/icon.svg" width="64" height="64" alt="">

# CS&AI — Neural Path

A Thai/English digital textbook for the **180-day practical AI Engineer curriculum** (30 min/day).
The app is a **non-linear library**: all 180 days sit on a bookshelf and any day opens at any time. **Day 1** (chapter **D001: Modern Python Setup (uv) & Type-Safe AI Payloads with Pydantic v2**) is the one fully authored lesson; every other day opens an honest *lesson preview* built from the curriculum schedule. Built with Next.js 16, TypeScript and Tailwind CSS 4.

Planning docs (source of truth): [`docs/research-brief.md`](docs/research-brief.md) · [`docs/curriculum.md`](docs/curriculum.md) (§5 = D001) · [`docs/design-spec.md`](docs/design-spec.md).

## Quick start

Requires Node.js ≥ 20.9. No API keys, no accounts, no network calls at runtime.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (Next + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest: library data & routing, exercise checker, Pydantic simulation, streak/review logic |
| `npm run check` | lint + typecheck + test + build |

## What's in the prototype

- **Library** (`/`): the home page is a bookshelf. Six shelves (one per curriculum phase) hold 180 books, each showing **Day number, short topic, state** (`✓ เรียนจบ`, `◐ กำลังเรียน`, `● เนื้อหาเต็ม`, `○ พรีวิว`; review/checkpoint/milestone days carry a kind tag). Nothing is locked: no sequence, no prerequisites, state is a visual marker only. Each shelf is one horizontally scrollable row with labelled ←/→ buttons (keyboard operable; only the row scrolls, never the page); "แสดงทั้งชั้น" lays the same books out as 4-day block rows. A phase jump bar and a "ไปที่ Day N" box open any day directly. Below the shelves a compact, collapsed **My progress** area keeps the streak, completed count, spaced-review queue (open only when a card is due) and Day 1's 30-minute loop.
- **Lesson shell** (`/lesson/d001`): chapter anatomy from the design spec — Big Picture → Objectives → Setup check → Concept cards (collapsed *Why this matters*) → Worked-example timeline + Payload Lab → Try It → Mistakes → 4-question quiz → Summary / spaced-review badge / next lesson.
  - Layout: ≥1280px three columns (ToC 240 / reading ≤760 / study panel 280); 1024–1279px ToC + reading; <1024px single column with **Contents** and **Glossary** bottom sheets.
  - **Big Picture** uses the provided `assets/ai-loop.svg`; advance one stage at a time (never autoplays), each stage says where Day 1 sits in the loop.
  - **Try It**: a Python editor with an in-browser checker (see below), pytest-style results with icon + text + next action, a ruff-style (F401/F821) lint pass, edge-case probes, and **3-level progressive hints** (level 3 is gated behind at least one run and queues the lesson for review).
  - **Quiz**: one question at a time; every option has its own rationale; wrong answers join the review queue.
  - **Glossary**: technical terms are buttons. Hover/focus → compact popover (Esc dismisses); Enter/Space/click → sheet with plain-Thai explanation, analogy, example, related lessons and *mark for review*.
- **Light/dark/system theme** (pre-paint script, no flash), **`prefers-reduced-motion`** honoured in CSS and JS (no transitions, instant scrolling).
- **Persistence** (`localStorage`, key `neural-path:v1`, theme in `neural-path:theme`): checklist, worked-example progress, exercise code/attempts/hints, quiz answers, completion, streak days, review queue and its spaced schedule (Day 4 → +8 → +16 days). Nothing leaves the browser.
- **Accessibility**: skip link, landmarks, real headings, labelled controls, native `<dialog>` modals (focus trap, Esc, focus return), roving-tabindex tabs, visible focus ring, 44px touch targets, no colour-only feedback. Verified with axe-core (WCAG 2 A/AA) in light, dark and mobile.

### How the exercise is checked (and its limits)

Running Python in the browser would need a ~10 MB runtime, so `src/lib/exercise/` does this instead:

1. `analyze.ts` lightly parses the learner's `AIQueryRequest` (Field constraints, `Literal`, `ConfigDict(str_strip_whitespace=True)`, `Annotated[...]`, `@field_validator` bodies) into a schema.
2. `pyschema.ts` re-implements the Pydantic v2 (lax mode) behaviours used in Day 1, including its error messages.
3. `d001.ts` runs the same five assertions as `exercises/d001/test_day1.py` plus extra edge-case probes.

It is a teaching simulation, not Python: unusual-but-valid code may be mis-read. The UI says so and tells learners to confirm with real `uv run pytest -q`. The real exercise lives in [`exercises/d001/`](exercises/d001/) (starter, tests, reference solution, worked example); unit tests assert the simulation agrees with real Pydantic output for the documented cases.

```bash
# real run of the reference solution (needs uv)
cd exercises/d001 && uv run pytest -q test_day1.py                       # starter: 5 fail by design
cd solution && uv run --with pydantic --with pytest pytest -q            # reference solution: 5 pass
```

## Content layout & extending

```
src/content/
  types.ts          # Lesson / Concept / QuizQuestion / GlossaryTerm schemas
  glossary.ts       # shared glossary (id -> term)
  schedule.ts       # raw 180-day schedule (45 blocks, from docs/curriculum.md §4) + phases
  library.ts        # pure: derives the 180 LibraryEntry records (no UI, no React)
  index.ts          # lesson registry (LESSONS), LIBRARY, route resolution, phases
  lessons/d001.ts   # all Day 1 copy, code samples, hints, quiz, sources (authored lesson)
src/lib/            # pure logic: progress/streak/review (progress.ts), store, pyschema, exercise
src/components/     # UI; no lesson copy hard-coded here (library/ = shelf, book, preview page)
exercises/d001/     # runnable Python files for the real pytest/ruff workflow
public/assets/      # copies of assets/*.svg served by Next (originals untouched)
```

Prose strings support inline markup: `**bold**`, `*italic*`, `` `code` ``, `{{glossary-id}}` and `{{glossary-id|custom label}}`.

### Adding a glossary term

Add an entry to `GLOSSARY` in `src/content/glossary.ts` (`short` for the popover; `plain`, `analogy`, optional `example`, `related` for the sheet), then use `{{your-id}}` in any lesson text and list the id in the lesson's `glossary` array.

### Authored vs preview lessons

Every day **d001 … d180** has a stable route, `/lesson/dNNN`, generated by `generateStaticParams` from the library (ids outside that range 404). What the route renders depends on whether a full lesson is registered:

| | Authored lesson | Preview lesson |
| --- | --- | --- |
| Days | only **Day 1** today | the other 179 |
| Source | `src/content/lessons/dNNN.ts` (a `Lesson`) | `src/content/schedule.ts` only — no per-day file |
| Page | full chapter: Big Picture, setup, concepts, worked example, Try It, quiz, summary | `LessonPreview`: day / phase / block, learning focus, planned 30-minute cadence, recommended (never required) earlier days, planned exercise status, prev/next day |
| Shelf marker | `● เนื้อหาเต็ม` (then `◐` / `✓` from progress) | `○ พรีวิว` |
| Honesty | — | always labelled **กำลังจัดทำเนื้อหาเต็ม**; it lists what is not there yet (Big Picture, runnable example, interactive exercise, quiz) and never invents lesson content |

A day is "authored" exactly when its id is a key of `LESSONS` in `src/content/index.ts`; `buildLibrary()` derives `LibraryEntry.authored` from that registry, so there is no second flag to keep in sync. Titles, blocks, tools, review kinds, phase and "recommended" days all derive from the schedule. Day 1's lesson file stays separate from the schedule metadata.

### Adding a full lesson (e.g. D002)

1. Create `src/content/lessons/d002.ts` exporting a `Lesson` (copy `d001.ts` as a template — the type checker tells you what is missing). Use `id: "d002"`, `day: 2`, and the same `phase`/`block` as the schedule says.
2. Register it in `src/content/index.ts` (`LESSONS`). That is the only wiring step: `/lesson/d002` switches from preview to the full lesson, its book flips to `● เนื้อหาเต็ม`, and the library/route tests (`npm test`) check the entry still matches the lesson. If the title in the schedule needs a fix, edit `schedule.ts`.
3. On D001, set `summary.next.available` to `true` once D002 is published (D001's "next" link already points at `/lesson/d002`, preview or not).
4. Interactive exercise: today the runner is D001-specific (`src/lib/exercise/d001.ts`). For a new exercise add a sibling runner that returns a `RunReport` and swap it into `Exercise.tsx` (or generalise by adding a `runner` id to `Lesson.exercise`). Put the real starter/tests under `exercises/dNNN/`. Until then keep the exercise as "planned" in the preview.
5. Quiz questions need per-option `why`, an `explanation` and a `review` card; they flow into the review queue automatically.
6. `bookState` (shelf markers) already works for any authored lesson, but the dashboard's "Day 1" strip/stats and the header progress bar are still wired to Day 1 specifically — generalise them when a second lesson ships.

Design tokens (palette, 8px spacing, 12/16px radii, 160–220ms motion via `--dur`) are CSS variables in `src/app/globals.css` and follow `docs/design-spec.md`; both themes are defined there.

## Known limitations

- Only Day 1 is authored; the other 179 days are metadata previews (clearly labelled) until their lessons are written.
- Progress is per-browser (no accounts/sync). Clear it by removing the `neural-path:v1` key.
- The in-browser checker is heuristic (see above).
- Fonts are bundled via `@fontsource` (Noto Sans Thai, IBM Plex Mono) so the build works offline.

---

Created in [T3 Code](https://t3.codes).
