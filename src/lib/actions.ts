"use client";

import type { Lesson, QuizQuestion } from "@/content/types";
import { GLOSSARY } from "@/content/glossary";
import { todayISO } from "./dates";
import {
  addReviewItems,
  markActive,
  patchLesson,
  removeReviewItem,
  resolveReview,
  type Track,
} from "./progress";
import { updateState } from "./store";

/** Every learning action also counts toward today's streak. */
function active<T extends Parameters<typeof markActive>[0]>(state: T): T {
  return markActive(state, todayISO()) as T;
}

export function setSetupStep(lessonId: string, stepId: string, checked: boolean) {
  updateState((s) =>
    active(patchLesson(s, lessonId, (l) => ({ ...l, setup: { ...l.setup, [stepId]: checked } }))),
  );
}

export function setExampleStep(lessonId: string, step: number) {
  updateState((s) =>
    active(patchLesson(s, lessonId, (l) => ({ ...l, exampleStep: Math.max(l.exampleStep, step) }))),
  );
}

export function saveCode(lessonId: string, code: string) {
  updateState((s) => patchLesson(s, lessonId, (l) => ({ ...l, exercise: { ...l.exercise, code } })));
}

export function recordRun(lessonId: string, result: { passed: boolean; mastered: boolean }) {
  updateState((s) =>
    active(
      patchLesson(s, lessonId, (l) => ({
        ...l,
        exercise: {
          ...l.exercise,
          attempts: l.exercise.attempts + 1,
          passed: l.exercise.passed || result.passed,
          mastered: l.exercise.mastered || result.mastered,
        },
      })),
    ),
  );
}

export function toggleSelfCheck(lessonId: string, checkKey: string, checked: boolean, totalChecks: number) {
  updateState((s) =>
    active(
      patchLesson(s, lessonId, (l) => {
        const nextChecks = { ...(l.exercise.selfChecks ?? {}), [checkKey]: checked };
        const doneCount = Object.values(nextChecks).filter(Boolean).length;
        const allDone = totalChecks > 0 && doneCount >= totalChecks;
        return {
          ...l,
          exercise: {
            ...l.exercise,
            attempts: Math.max(l.exercise.attempts, 1),
            selfChecks: nextChecks,
            passed: allDone,
            mastered: allDone && l.exercise.hintsRevealed < 3,
          },
        };
      }),
    ),
  );
}

export function markPracticeTried(lessonId: string) {
  updateState((s) =>
    active(
      patchLesson(s, lessonId, (l) => ({
        ...l,
        exercise: {
          ...l.exercise,
          attempts: Math.max(l.exercise.attempts, 1),
        },
      })),
    ),
  );
}

export function revealHint(lesson: Lesson, level: number) {
  updateState((s) => {
    let next = patchLesson(s, lesson.id, (l) => ({
      ...l,
      exercise: { ...l.exercise, hintsRevealed: Math.max(l.exercise.hintsRevealed, level) },
    }));
    if (level >= 3) {
      const fallbackCard = lesson.reviewCards[0];
      const prompt =
        lesson.id === "d001"
          ? "เขียน AIQueryRequest จากความจำ: ต้องแยก Field(ge/le) กับ field_validator (strip/startswith) อย่างไร?"
          : `ทบทวนโจทย์ Day ${lesson.day} (${lesson.titleTh}): ${fallbackCard?.prompt ?? "เขียนโครงสร้างหลักของแบบฝึกหัดจากความจำ"}`;
      const answer =
        lesson.id === "d001"
          ? "ช่วงตัวเลข/ค่าคงที่ → Field(ge, le) และ Literal; ประมวลผลสตริง (strip, startswith) → @field_validator ที่ return ค่า; strip ก่อนเช็กความยาว"
          : (fallbackCard?.answer ?? lesson.summary.takeaways.join(" · "));
      next = addReviewItems(
        next,
        [
          {
            id: `${lesson.id}-ex-hint3`,
            lessonId: lesson.id,
            kind: "exercise",
            prompt,
            answer,
          },
        ],
        todayISO(),
      );
    }
    return active(next);
  });
}

export function resetExercise(lessonId: string) {
  updateState((s) => patchLesson(s, lessonId, (l) => ({ ...l, exercise: { ...l.exercise, code: undefined } })));
}

export function chooseAnswer(lessonId: string, questionId: string, optionId: string) {
  updateState((s) =>
    patchLesson(s, lessonId, (l) => ({ ...l, quiz: { ...l.quiz, answers: { ...l.quiz.answers, [questionId]: optionId } } })),
  );
}

export function checkAnswer(lessonId: string, question: QuizQuestion, optionId: string) {
  updateState((s) => {
    let next = patchLesson(s, lessonId, (l) => ({
      ...l,
      quiz: {
        answers: { ...l.quiz.answers, [question.id]: optionId },
        checked: { ...l.quiz.checked, [question.id]: true },
      },
    }));
    if (optionId !== question.answer) {
      next = addReviewItems(
        next,
        [
          {
            id: `${lessonId}-quiz-${question.id}`,
            lessonId,
            kind: "quiz",
            prompt: question.review.prompt,
            answer: question.review.answer,
          },
        ],
        todayISO(),
      );
    }
    return active(next);
  });
}

export function resetQuiz(lessonId: string) {
  updateState((s) => patchLesson(s, lessonId, (l) => ({ ...l, quiz: { answers: {}, checked: {} } })));
}

export function setLessonComplete(lesson: Lesson, complete: boolean) {
  updateState((s) => {
    const today = todayISO();
    let next = patchLesson(s, lesson.id, (l) => ({ ...l, completedOn: complete ? (l.completedOn ?? today) : undefined }));
    if (complete) {
      next = addReviewItems(
        next,
        lesson.reviewCards.map((card) => ({
          id: card.id,
          lessonId: lesson.id,
          kind: "concept" as const,
          prompt: card.prompt,
          answer: card.answer,
        })),
        today,
      );
      next = active(next);
    }
    return next;
  });
}

export function toggleGlossaryReview(termId: string, lessonId = "d001") {
  const term = GLOSSARY[termId];
  if (!term) return;
  const id = `gl-${termId}`;
  updateState((s) => {
    if (s.review.some((item) => item.id === id)) return removeReviewItem(s, id);
    return active(
      addReviewItems(
        s,
        [
          {
            id,
            lessonId,
            kind: "glossary",
            prompt: `อธิบาย "${term.term}" ด้วยคำพูดของตัวเอง แล้วยกตัวอย่างการใช้`,
            answer: `${term.plain}\n\nเปรียบเทียบ: ${term.analogy}`,
          },
        ],
        todayISO(),
      ),
    );
  });
}

export function reviewItem(id: string, remembered: boolean) {
  updateState((s) => resolveReview(s, id, remembered, todayISO()));
}

export function setTrack(track: Track) {
  updateState((s) => ({ ...s, track }));
}

export function setTabIndent(tabIndent: boolean) {
  updateState((s) => ({ ...s, tabIndent }));
}
