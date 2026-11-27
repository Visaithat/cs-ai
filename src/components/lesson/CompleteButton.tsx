"use client";

import type { Lesson } from "@/content/types";
import { setLessonComplete } from "@/lib/actions";
import { formatShortThai } from "@/lib/dates";
import { getLesson as getProgress, lessonChecklist } from "@/lib/progress";
import { useAppState, useHydrated } from "@/lib/store";
import { Check, Circle } from "../Icons";

export function useLessonStatus(lesson: Lesson) {
  const state = useAppState();
  const hydrated = useHydrated();
  const progress = getProgress(state, lesson.id);
  const checklist = lessonChecklist(progress, {
    setupSteps: lesson.setup.steps.length,
    exampleSteps: lesson.workedExample.steps.length,
    quizQuestions: lesson.quiz.questions.length,
  });
  return { state, hydrated, progress, checklist, complete: hydrated && Boolean(progress.completedOn) };
}

export function CompleteButton({ lesson, compact = false }: { lesson: Lesson; compact?: boolean }) {
  const { hydrated, progress, checklist, complete } = useLessonStatus(lesson);
  const remaining: string[] = [];
  if (!checklist.setup) remaining.push("เช็กลิสต์ติดตั้ง");
  if (!checklist.example) remaining.push("ตัวอย่างพร้อมรัน");
  if (!checklist.exercise) remaining.push("ภารกิจฝึกทำ");
  if (!checklist.quiz) remaining.push("ควิซ");

  return (
    <div>
      <button
        type="button"
        className={compact ? "btn btn-sm btn-quiet" : `btn ${complete ? "" : "btn-primary"}`}
        onClick={() => setLessonComplete(lesson, !complete)}
      >
        {complete ? (
          <Check size={15} strokeWidth={2.2} aria-hidden="true" className="text-success" />
        ) : (
          <Circle size={14} strokeWidth={1.75} aria-hidden="true" />
        )}
        <span>
          {complete
            ? `เรียนจบแล้ว${progress.completedOn ? ` (${formatShortThai(progress.completedOn)})` : ""} — กดเพื่อยกเลิก`
            : "ทำเครื่องหมายว่าเรียนจบ"}
        </span>
      </button>
      {!compact && hydrated && !complete && remaining.length > 0 ? (
        <p className="mt-2 text-sm text-muted">ยังเหลือ: {remaining.join(", ")} (กดเสร็จสิ้นได้เลยถ้าพร้อม)</p>
      ) : null}
      {!compact && complete ? <p className="mt-2 text-sm text-success">เพิ่มการ์ดทบทวนเข้าคิวแล้ว — ดูที่หน้าหลัก</p> : null}
    </div>
  );
}
