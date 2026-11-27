import { describe, expect, it } from "vitest";
import {
  DEFAULT_STATE,
  addReviewItems,
  computeStreak,
  isDue,
  isISODate,
  markActive,
  parseReviewItem,
  parseState,
  resolveReview,
  sortReview,
  type AppState,
} from "./progress";

const item = { id: "d001-q1", lessonId: "d001", kind: "quiz" as const, prompt: "p", answer: "a" };

describe("streak", () => {
  it("counts consecutive days ending today", () => {
    const s = computeStreak(["2026-03-01", "2026-03-02", "2026-03-03"], "2026-03-03");
    expect(s).toMatchObject({ current: 3, best: 3, activeToday: true, atRisk: false });
  });
  it("keeps the streak alive (at risk) if yesterday was active but today is not yet", () => {
    const s = computeStreak(["2026-03-01", "2026-03-02"], "2026-03-03");
    expect(s).toMatchObject({ current: 2, activeToday: false, atRisk: true });
  });
  it("resets after a gap but remembers the best run", () => {
    const s = computeStreak(["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-10"], "2026-03-12");
    expect(s).toMatchObject({ current: 0, best: 3 });
  });
  it("markActive is idempotent per day", () => {
    const once = markActive(DEFAULT_STATE, "2026-03-01");
    expect(markActive(once, "2026-03-01")).toBe(once);
  });
});

describe("spaced review queue", () => {
  it("schedules new items for the Day 4 review (+3 days) and dedupes by id", () => {
    const state = addReviewItems(DEFAULT_STATE, [item], "2026-03-01");
    expect(state.review[0].due).toBe("2026-03-04");
    expect(addReviewItems(state, [item], "2026-03-02")).toBe(state);
    expect(isDue(state.review[0], "2026-03-03")).toBe(false);
    expect(isDue(state.review[0], "2026-03-04")).toBe(true);
  });
  it("advances +8 then +16 when remembered, then graduates", () => {
    let s: AppState = addReviewItems(DEFAULT_STATE, [item], "2026-03-01");
    s = resolveReview(s, item.id, true, "2026-03-04");
    expect(s.review[0]).toMatchObject({ stage: 1, due: "2026-03-12" });
    s = resolveReview(s, item.id, true, "2026-03-12");
    expect(s.review[0]).toMatchObject({ stage: 2, due: "2026-03-28" });
    s = resolveReview(s, item.id, true, "2026-03-28");
    expect(s.review).toHaveLength(0);
    expect(s.graduated).toBe(1);
  });
  it("resets to tomorrow when forgotten", () => {
    let s: AppState = addReviewItems(DEFAULT_STATE, [item], "2026-03-01");
    s = resolveReview(s, item.id, true, "2026-03-04");
    s = resolveReview(s, item.id, false, "2026-03-12");
    expect(s.review[0]).toMatchObject({ stage: 0, due: "2026-03-13", lapses: 1 });
  });
});

describe("review cards that are not due (QA H2)", () => {
  it("resolving a card before its due date changes nothing (no graduation on day 0)", () => {
    const start = addReviewItems(DEFAULT_STATE, [item], "2026-03-01"); // due 2026-03-04
    for (const remembered of [true, false]) {
      expect(resolveReview(start, item.id, remembered, "2026-03-01")).toBe(start);
      expect(resolveReview(start, item.id, remembered, "2026-03-03")).toBe(start);
    }
    let s = start;
    for (let i = 0; i < 5; i += 1) s = resolveReview(s, item.id, true, "2026-03-01");
    expect(s.review).toHaveLength(1);
    expect(s.graduated).toBe(0);
    expect(s.activeDates).toEqual([]); // a rejected rating must not count as study activity
  });
  it("resolves normally on the due day and when overdue", () => {
    const start = addReviewItems(DEFAULT_STATE, [item], "2026-03-01");
    expect(resolveReview(start, item.id, true, "2026-03-04").review[0]).toMatchObject({ stage: 1 });
    expect(resolveReview(start, item.id, true, "2026-03-20").review[0]).toMatchObject({ stage: 1, due: "2026-03-28" });
  });
  it("ignores unknown ids", () => {
    expect(resolveReview(DEFAULT_STATE, "nope", true, "2026-03-01")).toBe(DEFAULT_STATE);
  });
});

describe("parseState hardening (QA M1)", () => {
  const good = { id: "x", lessonId: "d001", kind: "quiz", prompt: "p", answer: "a", addedOn: "2026-03-01", due: "2026-03-04", stage: 0, lapses: 0 };
  const parse = (value: unknown) => parseState(JSON.stringify({ v: 1, ...(value as object) }));

  it("drops malformed review cards instead of crashing sortReview", () => {
    const state = parse({
      review: [
        good,
        { id: "x2", prompt: "p" }, // the QA reproduction: no due/addedOn
        { ...good, id: "bad-date", due: "2026-02-31" },
        { ...good, id: "bad-kind", kind: "other" },
        { ...good, id: "bad-stage", stage: 7 },
        { ...good, id: "neg-lapses", lapses: -1 },
        { ...good, id: "str-stage", stage: "1" },
        "text",
        null,
        42,
        [],
        { ...good }, // duplicate id
      ],
    });
    expect(state.review.map((r) => r.id)).toEqual(["x"]);
    expect(() => sortReview(state.review)).not.toThrow();
  });
  it("review that is not an array becomes empty", () => {
    expect(parse({ review: { a: 1 } }).review).toEqual([]);
    expect(parse({ review: "x" }).review).toEqual([]);
  });
  it("keeps valid cards untouched", () => {
    expect(parse({ review: [good] }).review).toEqual([good]);
  });
  it("validates lesson entries (setup must be an object, exampleStep a number, ...)", () => {
    const state = parse({
      lessons: {
        d001: { setup: "yes", exampleStep: "3", completedOn: "yesterday", exercise: { attempts: -2, code: 5, passed: "true", hintsRevealed: 99 }, quiz: { answers: [], checked: { q1: "true", q2: true } } },
        d002: null,
        d003: 7,
      },
    });
    expect(state.lessons.d001).toEqual({
      completedOn: undefined,
      setup: {},
      exampleStep: 0,
      exercise: { code: undefined, attempts: 0, passed: false, mastered: false, hintsRevealed: 3 },
      quiz: { answers: {}, checked: { q2: true } },
    });
    expect(state.lessons.d002.exampleStep).toBe(0);
    expect(state.lessons.d003.setup).toEqual({});
  });
  it("cleans activeDates, graduated, track and tabIndent", () => {
    const state = parse({ activeDates: ["2026-03-02", 5, "nope", "2026-03-01", "2026-03-02", "2026-13-01"], graduated: -4, track: "x", tabIndent: "yes" });
    expect(state.activeDates).toEqual(["2026-03-01", "2026-03-02"]);
    expect(state.graduated).toBe(0);
    expect(state.track).toBe("web");
    expect(state.tabIndent).toBe(false);
  });
  it("treats non-object payloads as defaults", () => {
    for (const raw of ["null", "[]", "42", '"x"', "true", "{"]) expect(parseState(raw)).toBe(DEFAULT_STATE);
  });
  it("parseReviewItem / isISODate edge cases", () => {
    expect(parseReviewItem({ ...good, id: "" })).toBeNull();
    expect(isISODate("2026-02-28")).toBe(true);
    expect(isISODate("2028-02-29")).toBe(true);
    expect(isISODate("2026-02-29")).toBe(false);
    expect(isISODate("2026-2-9")).toBe(false);
    expect(isISODate(20260301)).toBe(false);
  });
});

describe("parseState", () => {
  it("falls back to defaults for corrupt or foreign storage", () => {
    expect(parseState("not json")).toBe(DEFAULT_STATE);
    expect(parseState('{"v":99}')).toBe(DEFAULT_STATE);
    expect(parseState(null)).toBe(DEFAULT_STATE);
  });
  it("round-trips valid state and fills missing lesson fields", () => {
    const raw = JSON.stringify({
      v: 1,
      track: "student",
      lessons: { d001: { exampleStep: 2 }, d017: { exercise: { passed: true, selfChecks: { "c-0": true, bad: "no" } } } },
      activeDates: ["2026-03-01"],
    });
    const state = parseState(raw);
    expect(state.track).toBe("student");
    expect(state.lessons.d001.exercise.attempts).toBe(0);
    expect(state.lessons.d001.exampleStep).toBe(2);
    expect(state.lessons.d017.exercise.passed).toBe(true);
    expect(state.lessons.d017.exercise.selfChecks).toEqual({ "c-0": true });
  });
});
