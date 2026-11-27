/**
 * Visual state of one book on the shelf. This is a marker only — it never gates opening a day.
 */
import type { LibraryEntry } from "@/content/library";
import type { Lesson } from "@/content/types";
import { getLesson as getLessonProgress, lessonChecklist, type AppState } from "./progress";

export type BookState = "completed" | "in-progress" | "ready" | "preview";

export interface BookChecklistMeta {
  id: string;
  setupSteps: number;
  exampleSteps: number;
  quizQuestions: number;
}

function toChecklistCounts(source: Lesson | BookChecklistMeta): {
  id: string;
  setupSteps: number;
  exampleSteps: number;
  quizQuestions: number;
} {
  if ("setupSteps" in source) return source;
  return {
    id: source.id,
    setupSteps: source.setup.steps.length,
    exampleSteps: source.workedExample.steps.length,
    quizQuestions: source.quiz.questions.length,
  };
}

export function bookState(
  entry: LibraryEntry,
  lesson: Lesson | BookChecklistMeta | undefined,
  state: AppState,
): BookState {
  if (!entry.authored || !lesson) return "preview";
  const counts = toChecklistCounts(lesson);
  const progress = getLessonProgress(state, counts.id);
  if (progress.completedOn) return "completed";
  const checklist = lessonChecklist(progress, {
    setupSteps: counts.setupSteps,
    exampleSteps: counts.exampleSteps,
    quizQuestions: counts.quizQuestions,
  });
  const started = checklist.done > 0 || progress.exercise.attempts > 0;
  return started ? "in-progress" : "ready";
}

export const BOOK_STATE_LABEL: Record<BookState, { icon: string; text: string }> = {
  completed: { icon: "✓", text: "เรียนจบ" },
  "in-progress": { icon: "◐", text: "กำลังเรียน" },
  ready: { icon: "●", text: "เนื้อหาเต็ม" },
  preview: { icon: "○", text: "พรีวิว" },
};
