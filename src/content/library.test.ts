import { describe, expect, it } from "vitest";
import { GLOSSARY } from "./glossary";
import {
  LESSON_IDS,
  LESSON_ROUTE_IDS,
  LESSONS,
  LIBRARY,
  PHASES,
  TOTAL_DAYS,
  getLibraryEntry,
  lessonIdForDay,
  parseLessonId,
  resolveLessonRoute,
} from "./index";
import { buildLibrary, entriesForPhase, shortTitle } from "./library";
import { SCHEDULE_BLOCKS } from "./schedule";

const EXPECTED_AUTHORED = Array.from({ length: TOTAL_DAYS }, (_, i) => lessonIdForDay(i + 1));

function collectInlineTerms(obj: unknown, out: Set<string> = new Set()): Set<string> {
  if (typeof obj === "string") {
    const re = /\{\{([a-z0-9-]+)(?:\|[^}]+)?\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(obj)) !== null) out.add(m[1]);
  } else if (Array.isArray(obj)) {
    for (const item of obj) collectInlineTerms(item, out);
  } else if (obj && typeof obj === "object") {
    for (const val of Object.values(obj)) collectInlineTerms(val, out);
  }
  return out;
}

describe("schedule → library derivation", () => {
  it("covers every day 1–180 exactly once, in order", () => {
    expect(LIBRARY).toHaveLength(TOTAL_DAYS);
    expect(LIBRARY.map((e) => e.day)).toEqual(Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1));
  });

  it("has 45 four-day blocks, B01…B45, with a review/checkpoint/milestone on every 4th day", () => {
    expect(SCHEDULE_BLOCKS).toHaveLength(45);
    expect(SCHEDULE_BLOCKS.map((b) => b.id)).toEqual(Array.from({ length: 45 }, (_, i) => `B${String(i + 1).padStart(2, "0")}`));
    for (const entry of LIBRARY) {
      expect(entry.kind === "lesson").toBe(entry.day % 4 !== 0);
      expect(entry.block).toBe(`B${String(Math.ceil(entry.day / 4)).padStart(2, "0")}`);
    }
    expect(LIBRARY.filter((e) => e.kind !== "lesson")).toHaveLength(45);
    expect(getLibraryEntry(32)?.kind).toBe("checkpoint");
    expect(getLibraryEntry(160)?.kind).toBe("milestone");
    expect(getLibraryEntry(180)?.kind).toBe("final");
  });

  it("assigns the six phases to the documented day ranges", () => {
    expect(PHASES.map((p) => [p.from, p.to])).toEqual([
      [1, 32],
      [33, 60],
      [61, 92],
      [93, 124],
      [125, 156],
      [157, 180],
    ]);
    expect(PHASES.map((p) => entriesForPhase(LIBRARY, p.index).length)).toEqual([32, 28, 32, 32, 32, 24]);
    for (const entry of LIBRARY) {
      const phase = PHASES.find((p) => p.index === entry.phase)!;
      expect(entry.day).toBeGreaterThanOrEqual(phase.from);
      expect(entry.day).toBeLessThanOrEqual(phase.to);
    }
  });

  it("gives every day a title, a short topic, a stable href and a 30-minute budget", () => {
    for (const entry of LIBRARY) {
      expect(entry.title.trim().length).toBeGreaterThan(0);
      expect(entry.shortTitle.trim().length).toBeGreaterThan(0);
      expect(entry.shortTitle.length).toBeLessThanOrEqual(61);
      expect(entry.title).not.toMatch(/[`*]/);
      expect(entry.id).toMatch(/^d\d{3}$/);
      expect(entry.href).toBe(`/lesson/${entry.id}`);
      expect(entry.minutes).toBe(30);
      expect(entry.tools.length).toBeGreaterThan(0);
    }
    expect(new Set(LIBRARY.map((e) => e.id)).size).toBe(TOTAL_DAYS);
  });

  it("is never gated: no entry requires another day, recommendations only point at real earlier days", () => {
    for (const entry of LIBRARY) {
      expect(entry).not.toHaveProperty("locked");
      expect(entry).not.toHaveProperty("requires");
      for (const day of entry.recommended) {
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThan(entry.day);
      }
    }
    expect(getLibraryEntry(1)?.recommended).toEqual([]);
    expect(getLibraryEntry(7)?.recommended).toEqual([5, 6]);
    expect(getLibraryEntry(5)?.recommended).toEqual([4]);
    expect(getLibraryEntry(8)?.reviews).toEqual([5, 6, 7]);
  });

  it("links neighbours in both directions without dangling ends", () => {
    expect(getLibraryEntry(1)?.prev).toBeNull();
    expect(getLibraryEntry(1)?.next).toBe(2);
    expect(getLibraryEntry(180)?.prev).toBe(179);
    expect(getLibraryEntry(180)?.next).toBeNull();
  });

  it("matches the curriculum for spot-checked days", () => {
    expect(getLibraryEntry(1)?.title).toBe("Modern Python (uv) & Type-Safe Payloads (Pydantic v2)");
    expect(getLibraryEntry(2)?.title).toBe("Python Collections, Comprehensions & Type Hints");
    expect(getLibraryEntry(4)?.title).toBe("Review: Quiz + Build validated Thai Support Ticket parser");
    expect(getLibraryEntry(93)?.phase).toBe(4);
    expect(getLibraryEntry(151)?.title).toContain("PDPA");
    expect(getLibraryEntry(180)?.title).toBe("Final Defense: Capstone Rubric Evaluation & Graduation");
  });
});

describe("authored coverage (all 180 lessons: Phases 1–6 complete Days 1–180)", () => {
  it("marks all 180 registered lessons as authored", () => {
    expect(LESSON_IDS).toEqual(EXPECTED_AUTHORED);
    const authored = LIBRARY.filter((e) => e.authored).map((e) => e.id);
    expect(authored).toEqual(EXPECTED_AUTHORED);
    expect(PHASES.map((p) => entriesForPhase(LIBRARY, p.index).filter((e) => e.authored).length)).toEqual([32, 28, 32, 32, 32, 24]);
    expect(getLibraryEntry(1)?.exercise.status).toBe("available");
    expect(getLibraryEntry(158)?.exercise.status).toBe("available");
    expect(getLibraryEntry(180)?.exercise.status).toBe("available");
  });

  it("derives `authored` from the registry it is given", () => {
    const withTwo = buildLibrary(new Set(["d001", "d002"]));
    expect(withTwo.filter((e) => e.authored).map((e) => e.id)).toEqual(["d001", "d002"]);
    expect(buildLibrary(new Set()).every((e) => !e.authored)).toBe(true);
  });

  it("keeps every authored lesson consistent with its library entry", () => {
    for (const id of LESSON_IDS) {
      const lesson = LESSONS[id];
      const entry = getLibraryEntry(lesson.day)!;
      expect(entry.id, id).toBe(lesson.id);
      expect(entry.day, id).toBe(lesson.day);
      expect(entry.phase, id).toBe(lesson.phase.index);
      expect(entry.block, id).toBe(lesson.block);
      expect(entry.minutes, id).toBe(lesson.minutes);
    }
  });

  it("validates visual, icon, cover, tasks, quiz, and glossary integrity for all 180 lessons", () => {
    const seenVisuals = new Set<string>();
    for (const id of LESSON_IDS) {
      const lesson = LESSONS[id];
      expect(lesson.icon, `${id}: icon`).toBeTruthy();
      expect(lesson.coverImage, `${id}: coverImage`).toMatch(/^\/assets\/illustrations\/phase-[1-6]-.+\.jpg$/);
      expect(lesson.visual?.id, `${id}: visual`).toBeTruthy();
      seenVisuals.add(lesson.visual!.id);

      expect(lesson.bigPicture.steps.length, `${id}: bigPicture`).toBeGreaterThanOrEqual(3);
      expect(lesson.concepts.length, `${id}: concepts`).toBeGreaterThanOrEqual(2);
      for (const c of lesson.concepts) {
        expect(c.analogy?.trim().length, `${id}/${c.id}: analogy`).toBeGreaterThan(5);
      }
      expect(lesson.workedExample.steps.length, `${id}: workedExample`).toBeGreaterThanOrEqual(2);
      expect(lesson.exercise.hints, `${id}: 3-level hints`).toHaveLength(3);
      expect(lesson.mistakes.length, `${id}: mistakes`).toBeGreaterThanOrEqual(3);
      expect(lesson.quiz.questions, `${id}: 4-question quiz`).toHaveLength(4);
      for (const q of lesson.quiz.questions) {
        expect(q.options.map((o) => o.id), `${id}/${q.id}`).toContain(q.answer);
      }
      expect(lesson.reviewCards.length, `${id}: reviewCards`).toBeGreaterThanOrEqual(2);
      expect(lesson.sources.length, `${id}: sources`).toBeGreaterThanOrEqual(2);

      for (const termId of lesson.glossary) {
        expect(GLOSSARY[termId], `${id}: glossary array term "${termId}"`).toBeDefined();
      }
      for (const inlineTerm of collectInlineTerms(lesson)) {
        expect(GLOSSARY[inlineTerm], `${id}: inline term "{{${inlineTerm}}}"`).toBeDefined();
      }
    }
    expect(seenVisuals.size).toBe(94);
  });

  it("gives unauthored review days in a partial library a planned exercise title taken from the curriculum", () => {
    const partial = buildLibrary(new Set(["d001"]));
    expect(partial[167]?.exercise).toEqual({ status: "planned", title: "Milestone 3: End-to-End Core Flow Demo" });
    expect(partial[157]?.exercise.title).toBeUndefined();
  });
});

describe("lesson ids and routing", () => {
  it("formats and parses d001 … d180", () => {
    expect(lessonIdForDay(1)).toBe("d001");
    expect(lessonIdForDay(42)).toBe("d042");
    expect(lessonIdForDay(180)).toBe("d180");
    for (let day = 1; day <= TOTAL_DAYS; day++) expect(parseLessonId(lessonIdForDay(day))).toBe(day);
  });

  it("rejects ids outside the 180-day range or with the wrong shape", () => {
    for (const bad of ["", "d000", "d181", "d999", "d1", "d0001", "D001", "001", "d01a", "d-01", " d001", "d001 "]) {
      expect(parseLessonId(bad), bad).toBeNull();
      expect(resolveLessonRoute(bad), bad).toBeNull();
    }
  });

  it("generates a static route for every one of the 180 days", () => {
    expect(LESSON_ROUTE_IDS).toHaveLength(TOTAL_DAYS);
    expect(LESSON_ROUTE_IDS[0]).toBe("d001");
    expect(LESSON_ROUTE_IDS[179]).toBe("d180");
    expect(new Set(LESSON_ROUTE_IDS).size).toBe(TOTAL_DAYS);
  });

  it("routes the 101 authored days to full lessons and every other day to its own preview", () => {
    const authoredSet = new Set(EXPECTED_AUTHORED);
    for (const id of LESSON_ROUTE_IDS) {
      const route = resolveLessonRoute(id);
      expect(route, id).not.toBeNull();
      if (authoredSet.has(id)) {
        expect(route?.kind, id).toBe("authored");
        if (route?.kind === "authored") expect(route.lesson).toBe(LESSONS[id]);
      } else {
        expect(route?.kind, id).toBe("preview");
      }
      expect(route?.entry.id).toBe(id);
      expect(route?.entry.href).toBe(`/lesson/${id}`);
    }
  });

  it("every library href resolves to its own route (no day is unreachable)", () => {
    for (const entry of LIBRARY) {
      const id = entry.href.replace("/lesson/", "");
      expect(LESSON_ROUTE_IDS).toContain(id);
      expect(resolveLessonRoute(id)?.entry.day).toBe(entry.day);
    }
  });
});

describe("shortTitle", () => {
  it("drops parenthetical detail and kind prefixes", () => {
    expect(shortTitle("Modern Python (uv) & Type-Safe Payloads (Pydantic v2)")).toBe("Modern Python & Type-Safe Payloads");
    expect(shortTitle("Review: Quiz + Build validated Thai Support Ticket parser")).toBe("Build validated Thai Support Ticket parser");
    expect(shortTitle("Milestone 2: Retrieval Benchmark (Recall@5 >= 0.85)")).toBe("Retrieval Benchmark");
  });

  it("clips long titles at a word boundary with an ellipsis", () => {
    const long = "Quiz + Build multi-tool order lookup + RAG router without heavy framework";
    const short = shortTitle(long);
    expect(short.length).toBeLessThanOrEqual(61);
    expect(short.endsWith("…")).toBe(true);
    expect(short).not.toMatch(/\s…$/);
  });

  it("keeps a title whole when removing the parentheses would empty it", () => {
    expect(shortTitle("(only)")).toBe("(only)");
  });
});
