/**
 * Visual state of one book on the shelf. This is a marker only — it never gates opening a day.
 */
import type { LibraryEntry } from "@/content/library";
import type { Lesson } from "@/content/types";
import { getLesson as getLessonProgress, lessonChecklist, type AppState } from "./progress";

export type BookState = "completed" | "in-progress" | "ready" | "preview";

export function bookState(entry: LibraryEntry, lesson: Lesson | undefined, state: AppState): BookState {
  if (!entry.authored || !lesson) return "preview";
  const progress = getLessonProgress(state, lesson.id);
  if (progress.completedOn) return "completed";
  const checklist = lessonChecklist(progress, {
    setupSteps: lesson.setup.steps.length,
    exampleSteps: lesson.workedExample.steps.length,
    quizQuestions: lesson.quiz.questions.length,
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
