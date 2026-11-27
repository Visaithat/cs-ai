# QA & Code Review — Day 1 prototype (D001)

**Reviewer:** QA / code-review sub-agent · **Date:** 2026-11-22 · **Scope:** working tree on `master` (uncommitted Day 1 build), checked against `docs/design-spec.md` and `docs/curriculum.md` §5 (D001).
**Mode:** report only. The reviewer changed no implementation files; this report is the only file added.

## Summary

The prototype builds cleanly. Lint, typecheck and the 28 unit tests pass. The reference Python solution passes the real tests, and the worked example prints exactly the expected output from the curriculum. Every chapter section, the bottom sheets, the theme and reduced-motion handling, and the quiz feedback match the design spec. axe found **no WCAG A/AA violations** in either theme.

Testing still found **3 High**, **4 Medium** and **13 Low** issues. None is Critical. The three High issues:

1. **The in-browser exercise checker gives false passes.** Wrong solutions get "5 passed" and ★ Mastery, including the exact trap the lesson teaches (checking length before strip).
2. **The spaced-review schedule can be skipped.** Cards that are not yet due can be marked "remembered" from the dashboard, so a card can graduate on day 0.
3. **The dashboard throws a React hydration error (#418) on every day after the build date.** The prerendered HTML has the build date baked in.

| Severity | Count |
| --- | --- |
| Critical | 0 |
| High | 3 |
| Medium | 4 |
| Low | 13 |

---

## Commands run and results

| Command | Result |
| --- | --- |
| `npm run lint` | ✅ exit 0, no findings |
| `npm run typecheck` | ✅ exit 0 |
| `npm test` (Vitest 5.1.1) | ✅ 3 files, **28/28 passed** |
| `npm run build` (Next 16.4.6, Turbopack) | ✅ exit 0; `/` static, `/lesson/d001` SSG, `/_not-found` |
| `next start -p 3123` + `curl` | `/` 200, `/lesson/d001` 200, `/lesson/d999` **404** (correct, `dynamicParams = false`) |
| Playwright (Chromium 149, headless) + axe-core 4.10 (wcag2a/aa, 21a/aa, 22aa, best-practice) | light/dark desktop, 375px mobile: **0 A/AA violations**; 2 *moderate* best-practice findings (see L1). Other findings are listed below |
| Exercise checker vs **real Pydantic 2.9.0** (8 crafted solutions, same 5 assertions as `test_day1.py`) | 3 disagreements: H1, L5 |
| `exercises/d001/solution` against the real assertions | ✅ 5/5 |
| `python -X utf8 exercises/d001/worked_example.py` | ✅ output matches curriculum §5.5 exactly (see L11 for non-UTF-8 consoles) |
| `uv run pytest` / `uv run ruff check` | ⚠️ **not run**: `uv` and `ruff` are not installed on this machine. Real-Pydantic checks used a small harness that runs the same assertions as `test_day1.py` |

Throwaway test scripts were kept in the session scratchpad, not in the repo.

---

## High

### H1 — The exercise checker passes wrong solutions and awards ★ Mastery

**Files:** `src/lib/exercise/analyze.ts:290-299` (prefix detection), `src/lib/exercise/analyze.ts:301-321` (length detection), `src/lib/pyschema.ts:155-166` (applies the rules after strip)

The analyzer looks for patterns in the validator code. It does not follow the code's logic:

- If `.startswith("USR-")` and `raise` both appear anywhere in a validator, it sets `prefix = "USR-"`. The direction of the condition and any extra conditions are ignored.
- Any `len(...)` bound gets applied to the **stripped** value, even when the learner checks `len(v)` before stripping.

**Reproduce** (paste into the Try It editor and press Run):

```python
# A) inverted condition: real pytest = 2/5 passed; checker = 5 passed + Mastery
    @field_validator("user_id")
    @classmethod
    def v_user(cls, v: str) -> str:
        if v.startswith("USR-"):          # wrong way round
            raise ValueError("bad")
        return v

# B) length checked BEFORE strip (the lesson's main trap): real pytest fails
#    test_reject_whitespace_only_query; checker = 5 passed + Mastery
    @field_validator("query")
    @classmethod
    def v_q(cls, v: str) -> str:
        if len(v) < 3 or len(v) > 500:
            raise ValueError("len")
        return v.strip()
```

The rest of the class is the standard one from Hint 3. A third case, `if False and not v.startswith("USR-"): raise ...`, also counts as enforcing the prefix (checker 4/5, real 3/5).

**Impact:** `recordRun` saves `passed`/`mastered` permanently (`src/lib/actions.ts:37-51`). A learner with the exact misconception D001 targets is told they have mastered it. The disclaimer to "confirm with `uv run pytest -q`" helps, but it does not cancel a green ✓ and a ★.

**Recommended fix (pick one or combine):**
1. Only set `prefix` or `postMinLength` when the code matches an accepted shape: `if not <v>.startswith(...): raise`, or `if not (a <= len(<cleaned>) <= b): raise` where `<cleaned>` is the variable assigned from `.strip()`. Anything else should produce a note like "the checker can't read this validator, confirm with real pytest", and the result should not count as `passed`.
2. Track which variable `len()` is called on. If it is the unstripped parameter, apply the bound **before** strip, which matches Python.
3. Never award `mastered` when any validator was only partly understood. Add the three snippets above to `src/lib/exercise/exercise.test.ts` as regression tests that must not pass.
4. Longer term: Pyodide, loaded lazily on the first Run, would remove this class of bug.

### H2 — Cards that are not due can be resolved, so cards graduate on day 0

**Files:** `src/components/dashboard/Dashboard.tsx:293-358` (shows every queued item with an active "นึกก่อน แล้วดูเฉลย" button), `src/lib/progress.ts:155-171` (`resolveReview` never checks `isDue`)

**Reproduce:** answer quiz Q1 with A (wrong), then open `/`. The card shows "ทวน 25 พ.ย." (not due) but can still be revealed. Press "จำได้" 3 times. **Observed in the browser:** `review.length = 0`, `graduated = 1`, all on the day the card was added.

**Impact:** the "Day 4 → +8 → +16" schedule (curriculum §5.1/§5.8, README) breaks with a few clicks. "ทวนสำเร็จแล้ว" counts go up without real retrieval practice.

**Fix:** in `resolveReview`, do nothing when `!isDue(item, today)`. In the UI, show items that are not yet due as a read-only "upcoming" list (prompt and due date only, no answer or rating buttons), or split the list into "due now" and "upcoming". Add a unit test where resolving a card that is not due changes nothing.

### H3 — Dashboard hydration error (#418) on every day after the build

**Files:** `src/components/dashboard/Dashboard.tsx:29` (`const today = todayISO()` during render), `:111` and `:264-287` (`WeekDots` keys, labels and aria-labels come from `today`). `/` is fully static (`○` in the build output), so the server HTML always holds the **build** date.

**Evidence:** `.next/server/app/index.html` contains `aria-label="จ 16 พ.ย.: ยังไม่เรียน"` … `"อา 22 พ.ย."`. Loading `/` with the browser clock set to 2026-11-26 logs `pageerror: Minified React error #418 (text mismatch)`. React then discards the server HTML and client-renders the whole page. The same happens on the build day when the build server's time zone differs from the user's (for example a UTC CI server and a user in Asia/Bangkok).

**Fix:** compute `today` only after hydration. For example, use `const today = hydrated ? todayISO() : null` and render placeholder dots until then. Alternatively, read the date through a `useSyncExternalStore` whose server snapshot is `null`. The `WeekDots` day labels must not render date-dependent text before hydration.

---

## Medium

### M1 — Malformed review data crashes the whole app with no recovery

**Files:** `src/lib/progress.ts:228` (`review: Array.isArray(data.review) ? data.review : []`, items not validated), `src/lib/progress.ts:177-179` (`a.due.localeCompare`)

**Reproduce:** in DevTools, push `{id:"x", prompt:"p"}` into `neural-path:v1`.review, then reload `/`. **Observed:** the Next.js error page "This page couldn't load" and `TypeError: Cannot read properties of undefined (reading 'localeCompare')`. The page offers no reset. Recovering requires DevTools.

**Fix:** in `parseState`, validate each review item (strings for `id/prompt/answer/due/addedOn`, valid `YYYY-MM-DD` dates, numbers for `stage/lapses`, `kind` from the allowed set) and drop bad entries. Apply the same checks to lesson entries (`setup` must be an object, `exampleStep` a number). Add an `app/error.tsx` with a "reset local progress" button that calls `resetState()`.

### M2 — Picking a term from the glossary index loses keyboard focus

**Files:** `src/components/Glossary.tsx:48-55` (`onPick` closes the index sheet and opens the term sheet in the same render), `src/components/Sheet.tsx:23-28`

**Reproduce** (375px, keyboard only): focus the bottom-bar "ศัพท์" button and press Enter, Tab to a term and press Enter, then press Esc. **Observed:** `document.activeElement === <body>`. The native dialog sends focus back to the index-list button, which is inside a closed dialog. The design spec requires focus to return to where the user was ("close with Escape"; WCAG 2.4.3).

**Fix:** keep the opener element. Store `document.activeElement` when `openIndex` is called and pass it to the term sheet as its return target. Alternatively, open the term view **inside** the index sheet (a back button returns to the list). Either way, on close call `opener.focus()` when focus has landed on `body`.

### M3 — Horizontal page scroll at 320px (WCAG 1.4.10 Reflow)

**Files:** `src/components/dashboard/Dashboard.tsx:129` (`grid gap-8 lg:grid-cols-[…]` with no base `grid-cols-1`/`minmax(0,1fr)`), `src/components/lesson/WorkedExample.tsx:119` (`mt-4 grid gap-5 lg:grid-cols-2`, Payload Lab)

**Observed:** `scrollWidth` is 328 on `/` and 336 on `/lesson/d001` at a 320px viewport (375px and wider are fine). Below `lg`, each of these grids has a single implicit `auto` column, sized to the widest child's min-content (preset buttons such as "ช่องว่าง 6 ตัว (ผ่าน min_length…)", the payload textarea, the roadmap cards). The design spec says only code and diagrams may scroll horizontally.

**Fix:** add `grid-cols-1` (which Tailwind outputs as `minmax(0,1fr)`) to both grids, or add `min-w-0` to their children. Allow long preset labels to wrap (`whitespace-normal text-left`).

### M4 — Pending autosave brings back code after "Reset"

**File:** `src/components/lesson/Exercise.tsx:48-52` (500ms debounced `saveCode`) and `:61-66` (`reset()` does not clear `saveTimer`)

**Reproduce:** type in the exercise editor, click "รีเซ็ตเป็นโค้ดเริ่มต้น" within 0.5s, wait, then reload. **Observed:** the editor shows the typed text again (`true` in the browser run). The persisted code was overwritten after the reset.

**Fix:** `if (saveTimer.current) clearTimeout(saveTimer.current)` at the start of `reset()`, `run()` and `replaceWith()`.

---

## Low

| # | Finding | File(s) | Recommended fix |
| --- | --- | --- | --- |
| L1 | axe best-practice (moderate): **`<aside>` nested in `<article>`** (`landmark-complementary-is-top-level`); **duplicate region names**: two `CodeBlock`s with the same `label` both become `region "โค้ด worked_example.py (เลื่อนแนวนอนได้)"` (`landmark-unique`) | `src/components/lesson/Concepts.tsx:61`, `src/components/CodeBlock.tsx:37` | Use `<section>`/`<div>` for the bridge card. For code blocks, drop `role="region"` (keep `tabIndex` plus `aria-label`), or make each label unique (include the step title) |
| L2 | **Touch targets under 44px** on touch tablets and wider phones: `lg:min-h-9` ToC links (1024–1279px touch layouts), `sm:min-h-9` theme toggle and Big Picture step chips, `min-h-9` study-panel rows and term chips. `.btn-sm` handles this with `(pointer: coarse)`, but these Tailwind classes don't | `src/components/lesson/Toc.tsx:67`, `src/components/ThemeToggle.tsx:26`, `src/components/lesson/BigPicture.tsx:93`, `src/components/lesson/StudyPanel.tsx:39,58,76` | Use a `pointer-coarse:min-h-11` variant (Tailwind 4 supports `pointer-coarse:`) instead of size breakpoints |
| L3 | **localStorage write failure loses updates silently**: when `setItem` throws (quota), `readRaw()` still returns the old value from `getItem`, so `?? memoryRaw` never runs and the UI reverts | `src/lib/store.ts:16-22`, `:54-64` | Track a `writeFailed` flag and read `memoryRaw` first when it is set. Show a small "progress can't be saved" notice |
| L4 | **A version bump wipes all progress**: `data.v !== STATE_VERSION → DEFAULT_STATE`, and the next write overwrites the stored data | `src/lib/progress.ts:211` | Add a `migrate(data)` step before going live, or at least keep the old payload under a backup key |
| L5 | **False collection error** for `from pydantic import *`: names are skipped, so `BaseModel`/`Field` are reported as `NameError`. Real Python passes 5/5; real ruff would report F403/F405, not F821 | `src/lib/exercise/analyze.ts:242` | Treat a star import from `pydantic`/`typing` as defining the known names, and add a lint F403 note |
| L6 | **Glossary popover can't be hovered** (`pointer-events: none`, hides on `mouseleave`), so it doesn't fully meet WCAG 1.4.13. Click → sheet gives the full content, so the impact is small. The popover also stays put while the page scrolls under it | `src/app/globals.css:289-303`, `src/components/Glossary.tsx:92-95` | Add a short hide delay and allow pointer events on the popover, or document the sheet as the main path. Hide it on `scroll` |
| L7 | **Print stylesheet hides every `<header>`**, including the lesson header with the `<h1>` title and progress | `src/app/globals.css:528-532` | Target the site header only (`body > header` or a `.site-header` class) |
| L8 | **No security headers**, and `X-Powered-By: Next.js` is sent. Risk is low (no auth, no inputs sent anywhere) | `next.config.ts` | `poweredByHeader: false`. Add `headers()` with `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors 'none'`/`X-Frame-Options`, and a CSP that allows the inline theme script by hash |
| L9 | **Without JS the dark theme is ignored**: the theme only comes from `data-theme` set by the inline script | `src/app/layout.tsx:27`, `src/app/globals.css:46` | Also add `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` |
| L10 | **"Complete" toggle uses `aria-pressed` and also changes its label** ("ทำเครื่องหมายว่าเรียนจบ" ↔ "เรียนจบแล้ว … — กดเพื่อยกเลิก"), so screen readers announce a state twice. Glossary "mark for review" has the same pattern | `src/components/lesson/CompleteButton.tsx:31-38`, `src/components/Glossary.tsx:142-150` | Keep a fixed label with `aria-pressed`, or drop `aria-pressed` and keep the changing label |
| L11 | **`worked_example.py` crashes when stdout isn't UTF-8** (output piped or redirected on English-locale Windows: `UnicodeEncodeError … cp1252`). The interactive Windows console is fine | `exercises/d001/worked_example.py:28` | Add `sys.stdout.reconfigure(encoding="utf-8")` at the top, or a setup note: `set PYTHONUTF8=1` |
| L12 | **Doc and repo consistency:** curriculum §5.1 says the exercise is `SupportTicketRequest`, but §5.6, the app and the tests use `AIQueryRequest` (the implementation follows §5.6, correctly). `exercises/d001/` has no committed `uv.lock`, although the lesson teaches committing it | `docs/curriculum.md:166`, `exercises/d001/` | Fix the curriculum wording. Generate and commit `uv.lock` once `uv` is available |
| L13 | **Dashboard "today" never updates** after midnight while the tab stays open (streak, due counts, week dots), and the inline review prompt from `revealHint` is hard-coded to D001 | `src/components/dashboard/Dashboard.tsx:29`, `src/lib/actions.ts:53-77` | Re-read the date on `visibilitychange`/focus. Move the hint-3 review card text into lesson content when D002 arrives |

---

## Areas checked with no issue found

- **Lesson routes:** `generateStaticParams` plus `dynamicParams = false`. `/lesson/d001` is prerendered, unknown ids return a real 404 with the custom page, and metadata comes from the lesson. ✅
- **Quiz:** one question at a time. Each option has its own rationale, and wrong answers show icon, text, the correct answer and the explanation. Focus moves to the feedback (`role="status"`, checked in the browser). Wrong answers are queued with id `d001-quiz-q1`, due today+3 (= Day 4). Re-queuing is de-duplicated. Answer key matches curriculum §5.8 (B, B, C, A). ✅
- **Progress persistence:** a defensive JSON parse with a fallback on malformed JSON, `useSyncExternalStore` with a server snapshot (no hydration mismatch apart from H3), cross-tab sync through the `storage` event, in-memory fallback when storage is blocked. Streak and interval logic are unit-tested. ✅ (except M1, L3, L4)
- **Glossary:** terms are real `<button>`s with `aria-describedby`. Focus or hover shows the popover, Esc dismisses it without moving focus, and Enter or Space opens the sheet. Esc closes the sheet and focus returns to the term (checked). The sheet has the plain explanation, analogy, example, related lessons and "mark for review". Index search has a live count. ✅ (except M2, L6)
- **Theme:** a pre-paint script (no flash), the light/dark/system toggle persists across reload (checked: `dark` after reload), and system changes are tracked. Palette tokens match the design spec. axe found no contrast failures in either theme. ✅
- **Reduced motion:** `.btn` transition-duration is `1e-05s` under `prefers-reduced-motion: reduce`. JS scrolling uses `behavior: "auto"`. The Big Picture never autoplays. ✅
- **Mobile shell:** bottom bar with Contents and Glossary sheets (native `<dialog>`, focus trap, Esc). ToC navigation from the sheet moves focus to the section heading and updates the hash (checked: `quiz-heading`, `#quiz`). No overflow at 375, 768, 1024 or 1280px. ✅ (except M3 at 320px)
- **Security:** no `eval`, `new Function`, `fetch` or network calls. The only `dangerouslySetInnerHTML` is the static theme script. Lesson markup (`RichText`) and stored progress render as React text nodes, so a tampered localStorage cannot inject HTML. External source links use `rel="noopener noreferrer"`. The exercise checker never runs learner code. The only learner-controlled regex is `Field(pattern=…)`, which can at worst freeze the learner's own tab. No secrets are in the repo, and `.gitignore` covers `.env*`, `.venv`, caches and `.next`. ✅
- **Python exercise assets:** starter raises `NotImplementedError` (5 failures by design), the reference solution passes all 5 real assertions, starter and solution tests are identical, and `pyproject.toml` excludes `solution/` from pytest and ruff. ✅

## Known limits of the exercise checker (documented, accepted)

The README and the UI both say the checker is a heuristic simulation and point learners to `uv run pytest -q`. Beyond H1 and L5, valid but unusual code may still be misread: validators shared across several fields, helper functions, `model_validator`, `Annotated` with `AfterValidator`, `typing.Optional`, bool→int coercion, and so on. The fixes in H1 make sure unsupported shapes are **flagged** rather than **silently passed**.

## Test coverage gaps

- No component or E2E tests. Every browser finding above (H2, H3, M2, M3, M4) would have been caught by a short Playwright suite: hydration on a fixed future clock, keyboard paths through the glossary, reflow at 320px, review resolution before the due date, and an axe pass.
- `exercise.test.ts` only checks that correct solutions pass and common mistakes fail. It has no wrong-but-similar solutions (H1).
