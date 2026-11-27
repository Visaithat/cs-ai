"use client";

import type { Lesson } from "@/content/types";
import { GLOSSARY } from "@/content/glossary";
import { formatShortThai } from "@/lib/dates";
import { isDue, sortReview } from "@/lib/progress";
import { useToday } from "@/lib/store";
import { useGlossary } from "../Glossary";
import { Check, ChevronRight, Circle } from "../Icons";
import { goToSection } from "./Toc";
import { CompleteButton, useLessonStatus } from "./CompleteButton";

/**
 * Compact inline study summary: progress with jump links, a one-line review status,
 * and the time budget + glossary tucked behind a single disclosure.
 * Preserves `aside[aria-label="แผงช่วยเรียน"]` and `#sp-review` hooks used by E2E regression tests.
 */
export function StudyPanel({ lesson }: { lesson: Lesson }) {
  const { state, hydrated, checklist } = useLessonStatus(lesson);
  const { open, openIndex } = useGlossary();
  const today = useToday();
  const mine = hydrated ? sortReview(state.review.filter((item) => item.lessonId === lesson.id)) : [];
  const dueNow = today ? mine.filter((item) => isDue(item, today)).length : 0;

  const items: Array<{ id: string; label: string; done: boolean; anchor: string }> = [
    { id: "setup", label: "ติดตั้ง & เช็กเครื่อง", done: checklist.setup, anchor: "setup" },
    { id: "example", label: "ตัวอย่างพร้อมรัน", done: checklist.example, anchor: "worked-example" },
    { id: "exercise", label: "ภารกิจฝึกทำ", done: checklist.exercise, anchor: "try-it" },
    { id: "quiz", label: `ควิซ ${lesson.quiz.questions.length} ข้อ`, done: checklist.quiz, anchor: "quiz" },
  ];
  const pct = hydrated ? Math.round((checklist.done / checklist.total) * 100) : 0;
  const quick = lesson.glossary.slice(0, 8);

  return (
    <aside aria-label="แผงช่วยเรียน" className="mb-10 border-y border-hair py-4">
      <section aria-labelledby="sp-progress">
        <h2 id="sp-progress" className="sr-only">
          ความคืบหน้าบทนี้
        </h2>
        <div className="flex items-center gap-3">
          <div className="progress-track flex-1" role="progressbar" aria-labelledby="sp-progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="whitespace-nowrap text-sm tabular-nums text-muted" aria-hidden="true">
            {hydrated ? checklist.done : 0}/{checklist.total} ส่วน
          </span>
        </div>
        <ul className="mt-1.5 flex flex-wrap gap-x-4">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex min-h-9 w-full items-center gap-1.5 text-left text-sm hover:text-brand-ink pointer-coarse:min-h-11"
                onClick={() => goToSection(item.anchor)}
              >
                {item.done ? (
                  <Check size={14} strokeWidth={2.2} aria-hidden="true" className="text-success" />
                ) : (
                  <Circle size={13} strokeWidth={1.75} aria-hidden="true" className="text-muted" />
                )}
                <span className={item.done ? "text-muted" : ""}>{item.label}</span>
                <span className="sr-only">{item.done ? "(เสร็จแล้ว)" : "(ยังไม่เสร็จ)"}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <section aria-labelledby="sp-review" className="min-w-0 flex-1 basis-56">
          <h2 id="sp-review" className="sr-only">
            คิวทบทวนจากบทนี้
          </h2>
          {mine.length === 0 ? (
            <p className="text-sm text-muted">ยังว่าง — ข้อที่พลาดและศัพท์ที่คุณทำเครื่องหมายจะมาอยู่ที่นี่</p>
          ) : (
            <p className="text-sm">
              <strong className="tabular-nums">{mine.length}</strong> รายการ · ครบกำหนดแล้ว <strong className="tabular-nums">{dueNow}</strong> · ถัดไป {formatShortThai(mine[0].due)}
            </p>
          )}
        </section>
        <CompleteButton lesson={lesson} compact />
      </div>

      <details className="why mt-2">
        <summary className="text-sm text-muted hover:text-ink">
          <ChevronRight size={15} strokeWidth={1.75} aria-hidden="true" className="chev shrink-0" />
          <span>เวลาและศัพท์ ({lesson.glossary.length})</span>
        </summary>
        <div className="space-y-5 pb-2 pt-2">
          <section aria-labelledby="sp-time">
            <h3 id="sp-time" className="text-sm font-semibold">
              งบเวลา {lesson.minutes} นาที
            </h3>
            <ol className="mt-1 text-sm">
              {lesson.schedule.map((slot) => (
                <li key={slot.anchor}>
                  <button type="button" className="min-h-9 w-full text-left hover:text-brand-ink pointer-coarse:min-h-11" onClick={() => goToSection(slot.anchor)}>
                    <span className="mono-label mr-2 text-xs text-muted">
                      {slot.from}–{slot.to}′
                    </span>
                    {slot.label}
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="sp-terms">
            <h3 id="sp-terms" className="text-sm font-semibold">
              ศัพท์ที่ควรรู้
            </h3>
            <ul className="mt-1 flex flex-wrap gap-x-4">
              {quick.map((id) => (
                <li key={id}>
                  <button type="button" className="min-h-9 text-sm text-brand-ink underline decoration-dotted underline-offset-4 pointer-coarse:min-h-11 pointer-coarse:min-w-11" onClick={() => open(id)}>
                    {GLOSSARY[id]?.term}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-sm btn-quiet mt-2" onClick={() => openIndex(lesson.glossary)}>
              ดูศัพท์ทั้งหมด ({lesson.glossary.length})
            </button>
          </section>
        </div>
      </details>
    </aside>
  );
}
