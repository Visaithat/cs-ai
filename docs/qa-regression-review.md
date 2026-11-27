# QA Regression Review — Day 1 prototype (D001), after remediation

**Reviewer:** independent regression QA sub-agent · **Date:** 2026-11-22 · **Scope:** working tree on `master`, checked against the 3 High and 4 Medium findings in `docs/qa-review.md`.
**Mode:** report only. No application files were changed; this file is the only addition. Throwaway harnesses lived in the session scratchpad.

## Verdict

**5 of 7 findings are fixed. 2 are only partly fixed.** All the reproductions from the original report now behave correctly. Two new paths still fail:

- **H1 (partly fixed):** the documented traps are rejected now. But wrong solutions that rely on Python's *last definition wins* rule still get **5 passed + ★ Mastery** (R1, High).
- **M2 (partly fixed):** Esc now returns focus correctly. Closing the term sheet with its **ปิด button** or the **backdrop** still drops focus to `<body>` (R2, Medium).

Lint, typecheck, 60/60 unit tests and the build all pass.

## Pass/fail matrix

| ID | Finding | Original repro | Extra regression probes | Status |
| --- | --- | --- | --- | --- |
| H1 | Checker false passes / false Mastery | ✅ A (inverted prefix) fails 3/5, B (len before strip) fails 4/5, C (`if False and …`) is "unverified". None get Mastery | ⚠️ 17 crafted solutions compared against real Pydantic 2.9.0: **6 false passes with Mastery** (R1) | **PARTIAL ❌** |
| H2 | Cards resolvable before they are due | ✅ Wrong Q1 queues `d001-quiz-q1` due 2026-11-25. On day 0 there are no reveal or rate buttons, and the answer is not in the DOM | ✅ The card becomes resolvable on 2026-11-25. "จำได้" → stage 1, due +8 (2026-11-30), then read-only. `resolveReview` guards `isDue` (`progress.ts:158`) and has unit tests | **PASS ✅** |
| H3 | Hydration #418 on dates after the build | ✅ No `pageerror` or console error on `/` with the clock at 2026-11-26 | ✅ Also clean on 2027-03-15, Kiritimati (UTC+14, local 11-23) and Honolulu (UTC−10, local 11-21), for `/` and `/lesson/d001`. The prerendered HTML holds no `พ.ย.` or `2026-11-xx` strings. The week dots show the client's local date | **PASS ✅** |
| M1 | Malformed localStorage crashes the app | ✅ `{id:"x",prompt:"p"}` card: both routes render with no errors | ✅ 11 corrupt payloads × 2 routes (null/number/array entries, impossible dates, stage 99, negative lapses, unknown kind, duplicate ids, wrong-typed lesson fields, raw `null`/`[]`/`42`/invalid JSON/`__proto__`): **22/22 clean**. The bad card is dropped from storage on the next write. `app/error.tsx` has a reset button | **PASS ✅** |
| M2 | Glossary index → term loses focus | ✅ Esc returns focus to the bottom-bar "ศัพท์" button | ❌ Clicking **ปิด**, pressing Enter on **ปิด**, or clicking the **backdrop** leaves `activeElement = BODY` (R2). The inline term → sheet path is fine for both Esc and ปิด | **PARTIAL ❌** |
| M3 | Horizontal scroll at 320px | ✅ `/` 320, `/lesson/d001` 320, also after Run plus all 5 Payload Lab presets. Cards created through the UI also stay at 320 | ⚠️ A synthetic 66-character unbroken token in a review prompt → 585px (R3, not reachable with D001 content) | **PASS ✅** |
| M4 | Reset brought back the pending autosave | ✅ Type, click Reset within 0.5s, wait 1.2s, reload: editor and storage both hold the starter code | ✅ Control: normal edits still autosave after the 500ms debounce. `cancelPendingSave()` runs in `reset`, `run` and `replaceWith`, and on unmount | **PASS ✅** |

---

## Remaining issues, by severity

### R1 — High — The checker ignores Python's "last definition wins", so wrong code gets ★ Mastery

**Files:** `src/lib/exercise/analyze.ts` (`parseClass` ~673-815, `analyzeParseFunction` ~823, `analyzeSource` ~882). The analyzer applies **every** decorated validator and reads the **first** `class AIQueryRequest` and the **first** `def parse_ai_request`. Python keeps only the **last** binding of each name. Pydantic itself warns about this: `UserWarning: 'check' overrides an existing Pydantic '@field_validator' decorator`.

**Differential results** (real = same 5 assertions as `test_day1.py`, run on Pydantic 2.9.0; sim = `runExercise`):

| Case (change applied to the reference solution) | Real | Checker |
| --- | --- | --- |
| c01: both validators renamed `check` (user_id one first) | 4/5 (prefix not enforced) | **passed 5/5, mastered** |
| c02: both named `check`, query validator first | 3/5 (no strip or length check) | **passed 5/5, mastered** |
| c15: a second `validate_query` (`return v`) on `query` with the same name | 3/5 | **passed 5/5, mastered** |
| c16: a plain `def validate_query(self)` after the validator | 3/5 | **passed 5/5, mastered** |
| c04: a second `parse_ai_request` that returns `model_construct(**payload)` | 1/5 | **passed 5/5, mastered** |
| c05: a second, unconstrained `class AIQueryRequest(BaseModel)` | 1/5 | **passed 5/5, mastered** |

The other 11 cases agree, or the checker errs on the safe side ("unverified" / "error"): reference ✅, unknown field in decorator → collection error on both sides, `Field(min_length)` + after-strip trap ✅ 4/5, `ConfigDict(str_strip_whitespace)` ✅, `cleaned = v` alias ✅, lower-case prefix ✅, invalid Literal default ✅, `validate_query = None` (real: collection error; checker: unverified, no Mastery), `"USR\x2d"` ✅, `frozen=True` (checker: unverified), prefix checked on a stripped copy ✅.

**Why High:** c01/c15 are the copy-paste mistake learners make most often. They duplicate the `validate_user_id` block, change the decorator to `"query"` and keep the method name. The result is the same as the original H1: a green ✓ and a permanent ★ for code that real pytest fails.

**Reproduce:** in the Try It editor, paste the Hint 3 solution and rename both `def validate_user_id` and `def validate_query` to `def check`. Press Run. **Observed:** "5 passed", ★ Mastery. **Expected:** `test_reject_invalid_user_id_prefix` fails (real pytest 4/5).

**Fix:** model Python binding semantics. In the class body, when a method name repeats, the last definition replaces the earlier one, together with its decorators. A plain attribute or method with the same name removes the validator. At file level, use the last `class AIQueryRequest` / `def parse_ai_request`. The conservative alternative: report any repeated name as `unsupported`, which is never passed and never mastered. Add c01, c02, c04, c05, c15 and c16 to `conservative.test.ts`.

### R2 — Medium — After index → term, closing the sheet with ปิด or the backdrop drops focus to `<body>` (M2 not fully fixed)

**Files:** `src/components/Glossary.tsx:55-62, 87-90`, `src/components/Sheet.tsx:23-28, 36-44`

**Reproduce (375px):** focus the bottom-bar "ศัพท์" button and press Enter. Focus the first term and press Enter. Then do one of these: click **ปิด**, focus **ปิด** and press Enter, or click the backdrop. **Observed:** `document.activeElement === <body>` in all 3 cases. Esc works.

**Cause:** for button and backdrop closes, `onClose` → `restoreFocus()` runs while the `<dialog>` is still open. `activeElement` is then the ปิด button inside an *open* dialog, so the check at line 61 does nothing. Line 58 still clears `openerRef`. Then the `Sheet` effect calls `dialog.close()`, and the browser sends focus back to the index-list button inside the closed index dialog, which lands on `<body>`. The native `close` event calls `onClose` a second time, but `openerRef` is already `null`. (Esc works because the dialog closes natively *before* `onClose`.)

**Fix:** restore focus only from the dialog's native `close` event, which fires after the browser's own focus restore. For example, have `Sheet`'s button and backdrop handlers call `ref.current.close()` and route all paths through `onClose={…}` on the `<dialog>`. Alternatively, defer `restoreFocus` (for example with `requestAnimationFrame`) and clear `openerRef` only after focus has moved. That also stops `onClose` from firing twice per close.

### R3 — Low — Review-card prompts don't wrap long unbroken tokens

**Files:** `src/components/dashboard/Dashboard.tsx:349` and `:407` (`<p className="mt-2 font-semibold">{item.prompt}</p>`)

**Reproduce:** store a review card whose `prompt` is `AIQueryRequest.model_validate_field_validator_str_strip_whitespace`, then open `/` at 320px. **Observed:** `scrollWidth` 585. **Today's impact:** none. No Latin token in the D001 or glossary content is ≥28 characters, Thai text breaks normally, and cards created through the UI measure 320. This becomes a risk once later lessons add long identifiers.

**Fix:** add `[overflow-wrap:anywhere]` (or `break-words`) to both prompt paragraphs, matching `.eyebrow` and `.inline-code`.

### R4 — Low (note) — `StudyPanel` still calls `todayISO()` during render

**File:** `src/components/lesson/StudyPanel.tsx:14`. This does **not** cause a hydration mismatch now. The value is only used when `hydrated` is true, and the browser checks on `/lesson/d001` were clean on every date and in every time zone. It does not refresh after midnight the way the dashboard's `useToday()` does (L13). Switch it to `useToday()` for consistency.

---

## Commands and outputs

```
$ npm run lint        → eslint .            LINT EXIT 0 (no findings)
$ npm run typecheck   → tsc --noEmit        TC EXIT 0
$ npm test            → vitest run (v5.1.1)
   Test Files  4 passed (4)
        Tests  60 passed (60)              TEST EXIT 0
$ npm run build       → Next.js 16.4.6 (Turbopack)
   ✓ Compiled successfully · ✓ Generating static pages (4/4)
   ┌ ○ /   ├ ○ /_not-found   └ ● /lesson/d001     BUILD EXIT 0
$ next start -p 3124 + curl → / 200 · /lesson/d001 200 · /lesson/d999 404
$ grep "พ.ย." / "2026-11-xx" in .next/server/app/index.html, lesson/d001.html → 0 matches
```

**Browser** (Playwright 1.63, Chromium headless, `page.clock` and `timezoneId` per context, console errors and `pageerror` captured):

```
TOTAL 49 checks, 44 pass, 5 fail
  FAIL M2 … close via close button (click)          active=BODY
  FAIL M2 … close via close button (keyboard Enter) active=BODY
  FAIL M2 … close via backdrop click                active=BODY
  FAIL M3 / @320px (seeded review cards)            scrollWidth 696   → R3 (synthetic 80-char token)
  FAIL M1 corrupt card dropped on next write        → test artefact: the first checkbox the
       script clicked made no write; re-run on the setup checkbox → card dropped ✅
```

**H1 differential:** `python -X utf8 real.py` (Pydantic 2.9.0, Python 3.13.5, with a minimal `pytest.raises`/`approx` shim because `pytest` and `uv` are not installed) against `runExercise` through a scratch Vitest config. The 17 cases and results are in the R1 table above.

## Not covered

- `uv run pytest -q` / `uv run ruff check`: `uv`, `ruff` and `pytest` are still not installed on this machine.
- No new axe pass. M2/M3 were checked directly. Low findings L1–L13 were outside the scope of this regression check.
