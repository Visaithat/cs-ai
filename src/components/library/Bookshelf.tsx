"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { LESSON_IDS, LESSONS, LIBRARY, PHASES, TOTAL_DAYS, lessonIdForDay } from "@/content";
import { entriesForPhase } from "@/content/library";
import { BOOK_STATE_LABEL, bookState, type BookState } from "@/lib/bookState";
import { useAppState, useHydrated } from "@/lib/store";
import { BookOpen, Check, CircleDashed, Sparkles, X } from "../Icons";
import { Shelf } from "./Shelf";

type ShelfFilter = "authored" | "all";

/** The 180-day library: quiet filter (18 full chapters vs all 180 days), phase nav, day jump, and six shelves. */
export function Bookshelf() {
  const state = useAppState();
  const hydrated = useHydrated();
  const [filter, setFilter] = useState<ShelfFilter>("authored");

  const stateOf = (entry: (typeof LIBRARY)[number]): BookState =>
    hydrated ? bookState(entry, LESSONS[entry.id], state) : entry.authored ? "ready" : "preview";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-hair pb-5">
        <div role="group" aria-label="กรองหนังสือบนชั้น" className="inline-flex rounded-xl border border-hair bg-surface p-1">
          <button
            type="button"
            aria-pressed={filter === "authored"}
            onClick={() => setFilter("authored")}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-colors ${
              filter === "authored" ? "bg-brand-soft text-brand-ink font-semibold" : "text-muted hover:text-ink"
            }`}
          >
            <Sparkles size={14} strokeWidth={1.85} aria-hidden="true" />
            <span>บทเรียนเต็ม ({LESSON_IDS.length})</span>
          </button>
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-colors ${
              filter === "all" ? "bg-brand-soft text-brand-ink font-semibold" : "text-muted hover:text-ink"
            }`}
          >
            <span>ทั้งหลักสูตร ({TOTAL_DAYS} วัน)</span>
          </button>
        </div>

        <DayJump />
      </div>

      <nav aria-label="ข้ามไปยังชั้นหนังสือ">
        <ul className="-ml-2.5 flex flex-wrap gap-x-2 gap-y-1">
          {PHASES.map((phase) => (
            <li key={phase.index}>
              <Link href={`#phase-${phase.index}`} className="inline-flex min-h-11 flex-col justify-center rounded-xl px-2.5 text-sm leading-tight hover:bg-surface2/60 hover:text-brand-ink">
                <span className="font-semibold">Phase {phase.index}</span>
                <span className="text-xs text-muted">
                  Day {phase.from}–{phase.to}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="inline-list text-sm text-muted" aria-label="สัญลักษณ์สถานะบนสันหนังสือ">
        <li className="inline-flex items-center gap-1.5">
          <Check size={13} strokeWidth={2.2} aria-hidden="true" className="text-success" />
          <span>{BOOK_STATE_LABEL.completed.text}</span>
        </li>
        <li className="inline-flex items-center gap-1.5">
          <BookOpen size={13} strokeWidth={1.9} aria-hidden="true" className="text-brand-ink" />
          <span>{BOOK_STATE_LABEL["in-progress"].text}</span>
        </li>
        <li className="inline-flex items-center gap-1.5">
          <Sparkles size={13} strokeWidth={1.9} aria-hidden="true" className="text-brand-ink" />
          <span>{BOOK_STATE_LABEL.ready.text}</span>
        </li>
        <li className="inline-flex items-center gap-1.5">
          <CircleDashed size={13} strokeWidth={1.75} aria-hidden="true" />
          <span>{BOOK_STATE_LABEL.preview.text}</span>
        </li>
        <li>เปิดอ่านได้ทุกเล่มโดยไม่ต้องเรียงลำดับ</li>
      </ul>

      <div id="phase-shelves" className="scroll-mt-24 space-y-14">
        {PHASES.map((phase) => {
          const allPhaseEntries = entriesForPhase(LIBRARY, phase.index);
          const visible = filter === "authored" ? allPhaseEntries.filter((e) => e.authored) : allPhaseEntries;
          return (
            <Shelf
              key={phase.index}
              phase={phase}
              entries={visible}
              totalInPhase={allPhaseEntries.length}
              stateOf={stateOf}
              forceWrap={filter === "authored"}
            />
          );
        })}
      </div>
    </div>
  );
}

/** "Go to day N": open any of the 180 days directly. */
function DayJump() {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const day = Number(value);
    if (!value.trim() || !Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) {
      setError(`กรอกเลขวันระหว่าง 1 ถึง ${TOTAL_DAYS}`);
      return;
    }
    setError(null);
    router.push(`/lesson/${lessonIdForDay(day)}`);
  };

  return (
    <form onSubmit={submit} noValidate aria-label="ไปที่วันที่ต้องการ" className="min-w-0">
      <div className="flex items-center gap-2">
        <label htmlFor={inputId} className="text-sm text-muted">
          ไปที่ Day
        </label>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={1}
          max={TOTAL_DAYS}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder={`1–${TOTAL_DAYS}`}
          className="min-h-11 w-24 rounded-xl border border-line-strong bg-surface px-3 text-base tabular-nums"
        />
        <button type="submit" className="btn">
          เปิด
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1 flex items-center gap-1 text-sm text-danger">
          <X size={14} strokeWidth={2.2} aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </form>
  );
}
