import { describe, expect, it } from "vitest";
import { LESSONS, getLibraryEntry } from "@/content";
import { buildLibrary } from "@/content/library";
import { bookState } from "./bookState";
import { DEFAULT_STATE, emptyLesson, type AppState } from "./progress";

const lesson = LESSONS.d001;
const day1 = getLibraryEntry(1)!;
const previewDay = buildLibrary(new Set(["d001"]))[157]!;

const withLesson = (patch: Partial<ReturnType<typeof emptyLesson>>): AppState => ({
  ...DEFAULT_STATE,
  lessons: { d001: { ...emptyLesson(), ...patch } },
});

describe("bookState (a visual marker, never a gate)", () => {
  it("shows non-authored days as previews whatever the progress state", () => {
    expect(bookState(previewDay, undefined, DEFAULT_STATE)).toBe("preview");
    expect(bookState(previewDay, lesson, withLesson({ completedOn: "2026-01-01" }))).toBe("preview");
  });

  it("walks Day 1 through ready → in-progress → completed", () => {
    expect(bookState(day1, lesson, DEFAULT_STATE)).toBe("ready");
    expect(bookState(day1, lesson, withLesson({ exercise: { ...emptyLesson().exercise, attempts: 1 } }))).toBe("in-progress");
    expect(bookState(day1, lesson, withLesson({ exampleStep: lesson.workedExample.steps.length - 1 }))).toBe("in-progress");
    expect(bookState(day1, lesson, withLesson({ completedOn: "2026-01-01" }))).toBe("completed");
  });
});
