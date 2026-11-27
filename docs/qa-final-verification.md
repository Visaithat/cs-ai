# QA Final Verification: Day 1 prototype (D001)

**Reviewer:** independent final-verification sub-agent · **Date:** 2026-11-22 · **Scope:** working tree on `master`. Checked against R1–R4 in `docs/qa-regression-review.md` and the current source.
**Mode:** report only. No application files were changed. This file is the only addition, and `git status --short` matches the snapshot taken at the start. Throwaway harnesses lived in the session scratchpad.

## Recommendation: GO ✅

All four regression findings are fixed and verified independently:

- **R1:** no false pass or false Mastery in the 6 original duplicate-definition cases (unit tests) or in 22 new ones (24 new files in all, with the reference and one control), compared against real Pydantic 2.9.0.
- **R2:** focus returns to the opener on every close path (Esc, ปิด click, ปิด Enter, backdrop, related-lesson link), at 375px and 1400px.
- **R3 and R4:** both pass in the browser.

Lint, typecheck, 72/72 unit tests, the production build and 47/47 browser checks all pass.

The limitations below do not block a Day 1 prototype. None of them can award a pass or Mastery to wrong code, and none breaks navigation or accessibility on the paths covered.

## Result matrix

| ID | Finding (from regression review) | Verified in source | Evidence | Status |
| --- | --- | --- | --- | --- |
| R1 (High) | The checker ignored "last definition wins" | `analyze.ts:673-851`: class-body bindings use a name → final-binding `Map`. Validators come from the final namespace only. A field/name clash is reported as `unsupported`. `lastTopLevelBinding()` (`:924`) picks the last `class AIQueryRequest` / `def parse_ai_request` | 12 R1 unit tests in `conservative.test.ts:205+` (c01, c02, c04, c04′, c05, c05′, c15, c16, copy-paste, field/method clash) pass. Independent differential with 23 new cases: **0 false passes, 0 false Mastery** (table below) | **FIXED ✅** |
| R2 (Medium) | Index → term, then closing with ปิด or the backdrop, dropped focus to `<body>` | `Sheet.tsx:36-40`: the ปิด button and the backdrop call `requestClose()`, which runs the native `dialog.close()`. Every path ends in one `close` event → `onClose`. `Glossary.tsx:55-66`: `restoreFocus` skips while focus is still in `dialog[open]` and keeps `openerRef` | `e2e-regression.mjs`: 16/16 R2 checks. Extra probe: 23/23 glossary checks (index-only closes, desktop index → term, related-lesson link, **exactly 1 native `close` event per close**) | **FIXED ✅** |
| R3 (Low) | Review-card prompts didn't wrap long tokens | `Dashboard.tsx:349, 360, 407`: `[overflow-wrap:anywhere]` on the prompt and answer | 140-character unbroken prompt at 320px: scrollWidth 320/320. `/` at 320px with no seeded cards: 320/320 | **FIXED ✅** |
| R4 (Low) | `StudyPanel` called `todayISO()` during render | `StudyPanel.tsx:17`: `useToday()` (null on the server and during hydration, re-read on focus/visibility) | Due count goes 0 → 1 across midnight (Asia/Bangkok 23:59 → 01:59) after a focus event. Hydration is clean in Kiritimati UTC+14 and Honolulu UTC−10 | **FIXED ✅** |
| Gates | lint / typecheck / unit / build / prod server | n/a | All exit 0. `/` 200, `/lesson/d001` 200, `/lesson/d999` 404 | **PASS ✅** |

### R1 differential: new cases (real = the 5 `test_day1.py` assertions on Pydantic 2.9.0 / Python 3.13.5; checker = `runExercise`)

Each case is a change applied to the Hint 3 reference solution.

| Case | Real | Checker | Verdict |
| --- | --- | --- | --- |
| n00 reference | 5/5 | passed 5/5 ★ | agree |
| n01 the same validator defined twice (equivalent body) | 5/5 | passed 5/5 ★ | agree |
| n02 `@classmethod`-only method with the validator's name | 3/5 | failed 3/5 | agree |
| n03 annotation-only `validate_query: int` after the validator | 5/5 | failed 3/5 | too strict (L-2) |
| n04 field `validate_query: int = 0` shadows the validator | 3/5 | failed 3/5 | agree |
| n05 `validate_query = None` | collection error | unverified | safe |
| n06 `del validate_query` in the class body | 3/5 | unverified | safe |
| n07 module-level `parse_ai_request = lambda …: model_construct(...)` | 1/5 | unverified | safe |
| n08 module-level `AIQueryRequest = _Loose` | 1/5 | unverified | safe |
| n09 identical constrained class twice | 5/5 | passed 5/5 ★ | agree |
| n10 shadowing `def` inside `if True:` in the class | 3/5 | unverified | safe |
| n11 validator method named `query` (same as the field) | 5/5 | unverified | safe |
| n12 second `parse_ai_request` under `@functools.lru_cache` | 0/5 | failed 0/5 | agree |
| n13 second `parse_ai_request` returns the dict | 0/5 | failed 0/5 | agree |
| n14 second `parse_ai_request` is `async def` | 0/5 | error (ImportError) | safe |
| n15 three validators named `check`, user_id last | 3/5 | failed 3/5 | agree |
| n16 duplicate `check`. The last one handles both fields via `info.field_name` | 5/5 | failed 2/5 | too strict (L-1) |
| n17 `@staticmethod` with the validator's name | 3/5 | failed 3/5 | agree |
| n18 `class AIQueryRequest(AIQueryRequest)` overriding the validator with a no-op | 3/5 | error (spurious PydanticUserError) | safe, misleading message (L-3) |
| n19 redefinition inside `if __name__ == "__main__":` | 5/5 | passed 5/5 ★ | agree |
| n20 loose `class AIQueryRequest` after `parse_ai_request` | 1/5 | failed 1/5 | agree |
| n21 copy-pasted user_id block on `query`, keeping the name `validate_query` | 3/5 | failed 3/5 | agree |
| n22 loose class redefined inside `try:` at module level | 1/5 | unverified | safe |
| n23 *(control, no duplicate)* one validator for both fields via `info.field_name` | 5/5 | failed 2/5 | too strict (L-1) |

**Summary:** 12 agree and 9 are safe (unverified or error, never credited). 3 are too strict (n03, n16, n23). In no case does the checker award a pass or ★ that real pytest would not.

## Unresolved limitations

These remain open. None of them is a previously fixed bug.

| # | Severity | Limitation | Where | Suggested follow-up |
| --- | --- | --- | --- | --- |
| L-1 | Low–Medium | **Correct code it can't read shows as "failed", not "unverified".** A valid multi-field validator that branches on `info.field_name` (n16, n23) passes 5/5 in real pytest. The checker shows **3 named failing tests** even though it also lists `unsupported` reasons, because the status order is `failed > unverified`. A learner with correct code sees red ✗s. Not related to duplicates, and it never gives false credit | `src/lib/exercise/d001.ts:247` | When `unsupported` is non-empty, report `unverified` (or mark those failures as "the checker can't confirm") instead of `failed` |
| L-2 | Low | An annotation-only line that reuses a validator's name (`validate_query: int`, n03) is treated as replacing the validator. Real Python keeps it (an annotation with no value binds nothing), so the checker fails code that passes 5/5. Contrived | `analyze.ts` `bind(name, {kind:"field"})` | Treat annotation-only shadowing as `unsupported` |
| L-3 | Low | `class AIQueryRequest(AIQueryRequest)` (n18) produces a fabricated collection error "no field 'query'" next to the correct "doesn't inherit BaseModel directly" note. The outcome is safe (not credited), but the message is wrong | `analyze.ts:826-842` | Skip decorator-field checks when the class is flagged as not inheriting `BaseModel` directly |
| L-4 | Info | `uv`, `pytest` and `ruff` are still not installed on this machine. The real-Python differential used a minimal `pytest.raises`/`approx` shim, not `uv run pytest -q`. `exercises/d001/uv.lock` is still not committed (original L12). Curriculum §5.1 (`docs/curriculum.md:166`) still says `SupportTicketRequest` | environment, `exercises/d001/`, `docs/curriculum.md` | Run `uv sync && uv run pytest -q && uv run ruff check` once `uv` is available, then commit `uv.lock` |
| L-5 | Info | `worked_example.py` still has no UTF-8 stdout guard (original L11): piped output on a cp1252 console can still raise `UnicodeEncodeError` | `exercises/d001/worked_example.py` | `sys.stdout.reconfigure(encoding="utf-8")` or a `PYTHONUTF8=1` setup note |
| L-6 | Info | `scripts/e2e-regression.mjs` is not part of `npm run check`. It needs a global Playwright and Chromium | `scripts/`, `package.json` | Add Playwright as a devDependency and an `npm run e2e` script when CI exists |
| L-7 | Info | Coverage gap: the original Low findings L1–L4, L6, L7, L9 and L10 were not re-audited in this pass (no axe run, no touch-target or print checks). Spot checks: L8 security headers are in place (`next.config.ts:15-17`), L13 is covered by the R4 check, and L5 star-import handling is present (`analyze.ts:957-962`) | n/a | Run a full axe/touch pass before the D002 release |

## Commands and exact results

Environment: Windows 11, Node v22.18.0, npm 10.9.3, Python 3.13.5, Pydantic 2.9.0, Playwright (global, Chromium headless).

```
$ npm run lint
> eslint .
LINT EXIT 0                                   (no findings)

$ npm run typecheck
> tsc --noEmit
TC EXIT 0

$ npm test
> vitest run   (v5.1.1)
 Test Files  4 passed (4)
      Tests  72 passed (72)
TEST EXIT 0

$ npm run build
▲ Next.js 16.4.6 (Turbopack)
✓ Compiled successfully in 494ms
✓ Generating static pages using 5 workers (4/4) in 520ms
Route (app)
┌ ○ /
├ ○ /_not-found
└   /lesson/[id]
  └ ● /lesson/d001
BUILD EXIT 0

$ npx next start -p 3137        (fresh build above)
$ curl -w '%{http_code}'  /  → 200 · /lesson/d001 → 200 · /lesson/d999 → 404

$ BASE_URL=http://localhost:3137 NODE_PATH="$(npm root -g)" node scripts/e2e-regression.mjs
PASS  R2 index -> term, close via Escape  (BUTTON:Aa ศัพท์)
PASS  R2 index -> term, close via Escape: no console errors
PASS  R2 inline term, close via Escape  (BUTTON:Pydantic v2 -> BUTTON:Pydantic v2)
PASS  R2 reopen after a close, then close via Escape  (BUTTON:Aa ศัพท์)
PASS  R2 index -> term, close via close button (click)  (BUTTON:Aa ศัพท์)
PASS  R2 index -> term, close via close button (click): no console errors
PASS  R2 inline term, close via close button (click)  (BUTTON:Pydantic v2 -> BUTTON:Pydantic v2)
PASS  R2 reopen after a close, then close via close button (click)  (BUTTON:Aa ศัพท์)
PASS  R2 index -> term, close via close button (keyboard Enter)  (BUTTON:Aa ศัพท์)
PASS  R2 index -> term, close via close button (keyboard Enter): no console errors
PASS  R2 inline term, close via close button (keyboard Enter)  (BUTTON:Pydantic v2 -> BUTTON:Pydantic v2)
PASS  R2 reopen after a close, then close via close button (keyboard Enter)  (BUTTON:Aa ศัพท์)
PASS  R2 index -> term, close via backdrop click  (BUTTON:Aa ศัพท์)
PASS  R2 index -> term, close via backdrop click: no console errors
PASS  R2 inline term, close via backdrop click  (BUTTON:Pydantic v2 -> BUTTON:Pydantic v2)
PASS  R2 reopen after a close, then close via backdrop click  (BUTTON:Aa ศัพท์)
PASS  R3 320px: long unbroken review prompt does not scroll horizontally  (320/320)
PASS  R3 no console errors
PASS  R4 before midnight: card is not due yet  (1 รายการ · ครบกำหนดแล้ว 0 · ถัดไป 23 พ.ย.)
PASS  R4 after midnight: due count refreshes on focus  (1 รายการ · ครบกำหนดแล้ว 1 · ถัดไป 23 พ.ย.)
PASS  R4 no hydration/console errors
PASS  R4 hydrates cleanly in Kiritimati UTC+14
PASS  R4 hydrates cleanly in Honolulu UTC-10
TOTAL 23 checks, 23 pass, 0 fail
E2E EXIT 0

$ node <scratchpad>/probe.mjs          (extra independent glossary/reflow probe, same server)
  375px (bottom-bar "ศัพท์") and 1400px (study panel "ดูศัพท์ทั้งหมด"),
  closers: Escape / ปิด click / backdrop
  - index-only close → focus back on opener          6/6 PASS
  - exactly one native `close` event per close       6/6 PASS
  - 1400px index → term → close → opener             3/3 PASS
  - no console/page errors                           6/6 PASS
  - index → term → related-lesson link → focus kept  PASS (BUTTON:Aa ศัพท์), no page errors PASS
  - / at 320px: 320/320, no errors                   PASS
TOTAL 24 checks, 24 pass, 0 fail
PROBE EXIT 0

$ python -X utf8 real.py exercises/d001/test_day1.py      (pytest shim; 24 cases)
$ npx vitest run --config <scratchpad>/vitest.scratch.mjs  (runExercise on the same 24 files)
  → results in the R1 differential table above; 0 false passes, 0 false Mastery

$ python -m pytest --version  → No module named pytest
$ uv --version                → command not found
$ ruff --version              → command not found

$ git status --short           → identical to the pre-review snapshot (no application changes)
```
