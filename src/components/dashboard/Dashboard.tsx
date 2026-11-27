"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { DAILY_LOOP, LESSON_IDS, LESSON_META, PHASES, TOTAL_DAYS, getLibraryEntry } from "@/content/catalog";
import { Bookshelf } from "@/components/library/Bookshelf";
import { assetPath } from "@/lib/assetPath";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  LessonGlyph,
  RotateCcw,
} from "@/components/Icons";
import { reviewItem } from "@/lib/actions";
import { addDays, formatShortThai, weekdayShortThai } from "@/lib/dates";
import {
  computeStreak,
  getLesson as getLessonProgress,
  isDue,
  lessonChecklist,
  sortReview,
  type ReviewItem,
} from "@/lib/progress";
import { useAppState, useToday } from "@/lib/store";

const KIND_LABEL: Record<ReviewItem["kind"], string> = {
  quiz: "Quiz",
  concept: "Concept",
  exercise: "Exercise",
  glossary: "Glossary",
};

export function Dashboard() {
  const state = useAppState();
  const todayNow = useToday();
  const hydrated = todayNow !== null;
  const today = todayNow ?? "";

  // Pick the most relevant authored lesson: first in-progress, else first uncompleted, else Day 1.
  const authoredLessons = LESSON_IDS.map((id) => LESSON_META[id]).sort((a, b) => a.day - b.day);
  const activeLesson = hydrated
    ? authoredLessons.find((l) => {
        const p = getLessonProgress(state, l.id);
        const c = lessonChecklist(p, {
          setupSteps: l.setupSteps,
          exampleSteps: l.exampleSteps,
          quizQuestions: l.quizQuestions,
        });
        return !p.completedOn && (c.done > 0 || p.exercise.attempts > 0);
      }) ??
      authoredLessons.find((l) => !getLessonProgress(state, l.id).completedOn) ??
      LESSON_META.d001
    : LESSON_META.d001;

  const activeEntry = getLibraryEntry(activeLesson.day);
  const progress = getLessonProgress(state, activeLesson.id);
  const checklist = lessonChecklist(progress, {
    setupSteps: activeLesson.setupSteps,
    exampleSteps: activeLesson.exampleSteps,
    quizQuestions: activeLesson.quizQuestions,
  });
  const completed = Object.values(state.lessons).filter((l) => l.completedOn).length;
  const streak = hydrated ? computeStreak(state.activeDates, today) : { current: 0, best: 0, activeToday: false, atRisk: false };
  const queue = sortReview(state.review);
  const due = hydrated ? queue.filter((item) => isDue(item, today)) : [];
  const started = hydrated && (checklist.done > 0 || progress.exercise.attempts > 0 || Boolean(progress.completedOn));
  const lessonDone = hydrated && Boolean(progress.completedOn);

  const cta = lessonDone ? `ทบทวน Day ${activeLesson.day}` : started ? `อ่านต่อ Day ${activeLesson.day}` : `เริ่มอ่าน Day ${activeLesson.day}`;
  const pct = hydrated ? Math.round((checklist.done / checklist.total) * 100) : 0;
  const exerciseLabel = hydrated ? (progress.exercise.passed ? "ผ่านแล้ว" : "ยังไม่เสร็จ") : "—";

  return (
    <div className="mx-auto max-w-[72rem] space-y-14 pt-2">
      {/* ---------------- serene editorial hero ---------------- */}
      <section aria-labelledby="library-title" className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        <div>
          <p className="eyebrow">
            ห้องสมุดตำราดิจิทัล · {LESSON_IDS.length} บทเรียนเต็ม · {TOTAL_DAYS} วัน · {PHASES.length} เฟส
          </p>
          <h1 id="library-title" className="mt-2.5 text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
            อ่านและลงมือสร้าง AI Engineer วันละ 30 นาที
          </h1>
          <p className="mt-3 max-w-[38rem] text-[1.03125rem] leading-relaxed text-muted">
            หยิบเล่มไหนมาอ่านก่อนก็ได้แบบชิว ๆ ไม่มีการล็อกลำดับ — ทุกบทเรียนเต็มมีภาพเคลื่อนไหวอธิบายแนวคิด ตัวอย่างโค้ดพร้อมรัน ภารกิจลงมือทำ และควิซทบทวนครบในหน้าเดียว
          </p>

          <div className="mt-6 rounded-2xl border border-hair bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1 basis-64">
                <p className="eyebrow flex items-center gap-1.5">
                  <LessonGlyph icon={activeLesson.icon} size={14} className="text-brand-ink" />
                  <span>
                    Day {activeLesson.day} · Phase {activeEntry?.phase ?? 1} · {activeEntry?.minutes ?? 30} นาที
                  </span>
                </p>
                <p className="mt-1 font-semibold leading-snug">{activeLesson.titleTh}</p>
                <div className="mt-2.5 flex items-center gap-3">
                  <div
                    className="progress-track flex-1"
                    role="progressbar"
                    aria-label={`ความคืบหน้า Day ${activeLesson.day}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                  >
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="whitespace-nowrap text-xs tabular-nums text-muted">
                    {hydrated ? checklist.done : 0}/{checklist.total} ส่วน
                  </span>
                </div>
              </div>
              <Link href={`/lesson/${activeLesson.id}`} className="btn btn-primary btn-lg">
                <span>{cta}</span>
                <ArrowRight size={17} strokeWidth={1.85} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Flame size={15} strokeWidth={1.85} aria-hidden="true" className="text-warning" />
              <span>
                Streak <strong className="tabular-nums text-ink">{hydrated ? streak.current : 0}</strong> วัน
              </span>
            </span>
            <Sep />
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={15} strokeWidth={1.85} aria-hidden="true" className="text-success" />
              <span>
                เรียนจบ <strong className="tabular-nums text-ink">{hydrated ? completed : 0}</strong>/{LESSON_IDS.length} บทเต็ม
              </span>
            </span>
            <Sep />
            <span className="inline-flex items-center gap-1.5">
              <Clock size={15} strokeWidth={1.85} aria-hidden="true" className="text-brand-ink" />
              <span>
                ถึงเวลาทบทวน <strong className="tabular-nums text-ink">{hydrated ? due.length : 0}</strong>
              </span>
            </span>
            <Sep />
            <a href="#progress" className="text-brand-ink underline underline-offset-4">
              ดูความคืบหน้า
            </a>
          </p>
        </div>

        <figure className="editorial-cover m-0">
          <Image
            src={assetPath("/assets/illustrations/hero-library.jpg")}
            alt="ภาพประกอบหนังสือเปิดพร้อมเส้นทางโครงข่ายประสาทแบบมินิมอล"
            width={1200}
            height={675}
            priority
            className="h-auto w-full object-cover"
          />
        </figure>
      </section>

      <Bookshelf />

      {/* ---------------- progress: secondary, compact, collapsed by default ---------------- */}
      <section id="progress" aria-labelledby="progress-title" className="mx-auto max-w-[44rem] scroll-mt-24">
        <h2 id="progress-title" className="eyebrow mb-2">
          ความคืบหน้าของฉัน
        </h2>
        <div className="disclosure-list">
          <Disclosure
            id="stats-title"
            title="สรุปความคืบหน้า"
            line={
              <span className="inline-flex flex-wrap items-center gap-y-1">
                <Flame size={14} strokeWidth={1.85} aria-hidden="true" className="mr-1 text-warning" />
                Streak <strong className="mx-1 tabular-nums">{hydrated ? streak.current : 0}</strong> วัน
                <Sep />
                เรียนจบ <strong className="mx-1 tabular-nums">{hydrated ? completed : 0}</strong>/{LESSON_IDS.length}
                <Sep />
                ถึงเวลาทบทวน <strong className="mx-1 tabular-nums">{hydrated ? due.length : 0}</strong>
                <Sep />
                ภารกิจ Day {activeLesson.day} {exerciseLabel}
                {hydrated && streak.atRisk ? (
                  <>
                    <Sep />
                    ยังไม่ได้เรียนวันนี้
                  </>
                ) : null}
              </span>
            }
          >
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              <Stat label="Streak" value={hydrated ? `${streak.current} วัน` : "0 วัน"} note={hydrated ? `ดีที่สุด ${streak.best} วัน${streak.atRisk ? " · เรียนวันนี้เพื่อรักษา streak" : ""}` : "—"} />
              <Stat label="บทที่เรียนจบ" value={`${hydrated ? completed : 0} / ${LESSON_IDS.length}`} note={`จากหลักสูตรทั้งหมด ${TOTAL_DAYS} วัน`} />
              <Stat
                label="ถึงเวลาทบทวน"
                value={`${hydrated ? due.length : 0} รายการ`}
                note={hydrated ? `ในคิวทั้งหมด ${queue.length} · ทวนสำเร็จแล้ว ${state.graduated}` : "—"}
              />
              <Stat
                label={`ภารกิจ Day ${activeLesson.day}`}
                value={exerciseLabel}
                note={hydrated ? `ลองแล้ว ${progress.exercise.attempts} ครั้ง · hint ${progress.exercise.hintsRevealed}/3` : "—"}
              />
            </dl>
            <WeekDots dates={state.activeDates} today={todayNow} />
          </Disclosure>

          <ReviewQueue queue={queue} today={todayNow} />

          <Disclosure id="loop-title" title={`วงจร 30 นาที · Day ${activeLesson.day}`} meta={hydrated ? `${checklist.done}/${checklist.total} ส่วน` : undefined}>
            <h3 className="flex items-center gap-2 font-semibold">
              <BookOpen size={16} strokeWidth={1.75} aria-hidden="true" className="text-brand-ink" />
              <span>{activeLesson.titleTh}</span>
            </h3>
            <p className="mt-1 text-sm text-muted">{activeEntry?.title ?? activeLesson.titleTh}</p>

            <ol className="mt-5 divide-y divide-[color:var(--hair)]">
              {DAILY_LOOP.map((step, index) => {
                const done =
                  hydrated &&
                  (step.id === "warmup"
                    ? checklist.setup
                    : step.id === "concept"
                      ? checklist.example
                      : step.id === "exercise"
                        ? checklist.exercise
                        : checklist.quiz);
                return (
                  <li key={step.id} className="flex items-start gap-3 py-3">
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                        done ? "border-success bg-success text-canvas" : "border-line-strong text-muted"
                      }`}
                    >
                      {done ? <Check size={13} strokeWidth={2.5} aria-hidden="true" /> : <span aria-hidden="true">{index + 1}</span>}
                    </span>
                    <span>
                      <span className="block font-semibold">
                        {step.label} <span className="font-mono text-xs font-normal text-muted">({step.minutes} นาที)</span>
                      </span>
                      <span className="block text-sm text-muted">{step.hint}</span>
                      <span className="sr-only">{done ? "สถานะ: เสร็จแล้ว" : "สถานะ: ยังไม่เสร็จ"}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Disclosure>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------ building blocks ----------------------------- */

function Sep() {
  return (
    <span aria-hidden="true" className="mx-2 text-muted">
      ·
    </span>
  );
}

function Disclosure({
  id,
  title,
  meta,
  line,
  defaultOpen = false,
  children,
}: {
  id: string;
  title: string;
  meta?: ReactNode;
  line?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? defaultOpen;

  return (
    <section aria-labelledby={id}>
      <details className="disclosure" open={open} onToggle={(event) => setUserOpen(event.currentTarget.open)}>
        <summary>
          <h2 id={id} className={line ? "sr-only" : "disc-title text-base font-semibold"}>
            {title}
          </h2>
          {line ? <span className="min-w-0 flex-1 text-sm leading-relaxed">{line}</span> : null}
          {meta ? <span className="ml-auto text-sm text-muted">{meta}</span> : line ? null : <span className="ml-auto" />}
          <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" className="chev shrink-0" />
        </summary>
        <div className="disclosure-body">{children}</div>
      </details>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd>
        <span className="text-lg font-semibold tabular-nums">{value}</span>
        <span className="block text-sm text-muted">{note}</span>
      </dd>
    </div>
  );
}

function WeekDots({ dates, today }: { dates: string[]; today: string | null }) {
  if (today === null) {
    return (
      <ul className="mt-5 flex gap-2" aria-label="กิจกรรม 7 วันล่าสุด">
        {Array.from({ length: 7 }, (_, i) => (
          <li key={i} className="flex flex-col items-center gap-0.5 text-[0.6875rem] text-muted">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-line" aria-hidden="true" />
            <span aria-hidden="true">&nbsp;</span>
          </li>
        ))}
      </ul>
    );
  }
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const set = new Set(dates);
  return (
    <ul className="mt-5 flex gap-2" aria-label="กิจกรรม 7 วันล่าสุด">
      {days.map((day) => {
        const on = set.has(day);
        return (
          <li key={day} className="flex flex-col items-center gap-0.5 text-[0.6875rem] text-muted">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                on ? "border-brand bg-brand-solid text-white" : "border-line"
              }`}
              role="img"
              aria-label={`${weekdayShortThai(day)} ${formatShortThai(day)}: ${on ? "เรียนแล้ว" : "ยังไม่เรียน"}`}
            >
              {on ? <Check size={12} strokeWidth={2.5} aria-hidden="true" /> : ""}
            </span>
            {weekdayShortThai(day)}
          </li>
        );
      })}
    </ul>
  );
}

function ReviewQueue({ queue, today }: { queue: ReviewItem[]; today: string | null }) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const headingId = useId();
  const items = today === null ? [] : queue;
  const dueItems = today === null ? [] : items.filter((item) => isDue(item, today));
  const upcoming = today === null ? [] : items.filter((item) => !isDue(item, today));

  const meta =
    today === null
      ? undefined
      : items.length === 0
        ? "ว่าง"
        : `ถึงเวลา ${dueItems.length}${upcoming.length > 0 ? ` · รอ ${upcoming.length}` : ""}`;

  return (
    <Disclosure id={headingId} title="คิวทบทวน" meta={meta} defaultOpen={dueItems.length > 0}>
      <p className="text-sm text-muted">Spaced review: ทวนครั้งแรก +3 วัน → +8 → +16 วัน</p>

      {items.length === 0 ? (
        <p className="mt-3 text-muted">
          ยังไม่มีรายการ — ทำควิซ ใช้ hint ระดับ 3 กดทำเครื่องหมายศัพท์ หรือกดเสร็จสิ้นบทใดก็ได้เพื่อเพิ่มการ์ดทบทวนเข้าคิวอัตโนมัติ
        </p>
      ) : (
        <>
          <h3 className="mt-4 font-semibold">
            ถึงเวลาทบทวน <span className="font-normal text-muted tabular-nums">({dueItems.length})</span>
          </h3>
          {dueItems.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              วันนี้ยังไม่มีการ์ดที่ถึงกำหนด — spaced repetition ได้ผลเมื่อทวนตรงเวลา จึงยังดูเฉลยหรือประเมินการ์ดที่ยังไม่ถึงกำหนดไม่ได้
            </p>
          ) : (
            <ul className="mt-1 divide-y divide-[color:var(--hair)]">
              {dueItems.map((item) => {
                const isOpen = revealed === item.id;
                const panelId = `${headingId}-${item.id}`;
                return (
                  <li key={item.id} className="py-4">
                    <p className="flex flex-wrap items-center text-xs text-muted">
                      <span>{KIND_LABEL[item.kind]}</span>
                      <Sep />
                      <Clock size={12} strokeWidth={1.85} aria-hidden="true" className="mr-1" />
                      <span>ถึงเวลาทบทวน</span>
                      <Sep />
                      <span>รอบที่ {item.stage + 1}/3</span>
                    </p>
                    <p className="mt-1 font-semibold [overflow-wrap:anywhere]">{item.prompt}</p>
                    <button
                      type="button"
                      className="btn btn-sm mt-2"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setRevealed(isOpen ? null : item.id)}
                    >
                      {isOpen ? "ซ่อนเฉลย" : "นึกก่อน แล้วดูเฉลย"}
                    </button>
                    <div id={panelId} hidden={!isOpen} className="mt-3">
                      <p className="whitespace-pre-line border-l-2 border-line pl-3 text-sm [overflow-wrap:anywhere]">{item.answer}</p>
                      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="ประเมินความจำของคุณ">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            reviewItem(item.id, true);
                            setRevealed(null);
                          }}
                        >
                          <Check size={14} strokeWidth={2.2} aria-hidden="true" /> จำได้
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            reviewItem(item.id, false);
                            setRevealed(null);
                          }}
                        >
                          <RotateCcw size={14} strokeWidth={1.85} aria-hidden="true" /> ยังลืม — ทวนพรุ่งนี้
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {upcoming.length > 0 ? (
            <>
              <h3 className="mt-6 font-semibold">
                รอถึงกำหนด <span className="font-normal text-muted tabular-nums">({upcoming.length})</span>
              </h3>
              <p className="mt-1 text-sm text-muted">ยังไม่ถึงวันทวน — ดูได้เฉพาะโจทย์ เฉลยและปุ่มประเมินจะเปิดเมื่อถึงกำหนด</p>
              <ul className="mt-1 divide-y divide-[color:var(--hair)]">
                {upcoming.map((item) => (
                  <li key={item.id} className="py-3">
                    <p className="text-xs text-muted">
                      {KIND_LABEL[item.kind]} <Sep />
                      ทวน {formatShortThai(item.due)} <Sep />
                      รอบที่ {item.stage + 1}/3
                    </p>
                    <p className="mt-1 font-semibold [overflow-wrap:anywhere]">{item.prompt}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </Disclosure>
  );
}
