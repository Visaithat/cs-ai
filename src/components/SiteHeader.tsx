"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LESSON_IDS, getLessonMeta, parseLessonId } from "@/content/catalog";
import { lessonChecklist, getLesson as getLessonProgress } from "@/lib/progress";
import { assetPath } from "@/lib/assetPath";
import { useAppState, useHydrated } from "@/lib/store";
import { AccountMenu } from "./AccountMenu";
import { BookOpen, Library } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Minimal header: brand (home), library & current day, one contextual progress bar, theme toggle.
 * Tracks whichever authored lesson is currently open, or overall authored progress on home.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const state = useAppState();
  const hydrated = useHydrated();

  const onHome = pathname === "/";
  const slug = pathname.split("/")[2] ?? "";
  const lessonDay = parseLessonId(slug);
  const onLesson = pathname.startsWith("/lesson/") && lessonDay !== null;
  const activeLesson = onLesson ? getLessonMeta(slug) : undefined;

  let pct = 0;
  let progressLabel = "";
  let progressAria = "";
  let showProgress = false;

  if (activeLesson) {
    showProgress = true;
    const progress = getLessonProgress(state, activeLesson.id);
    const checklist = lessonChecklist(progress, {
      setupSteps: activeLesson.setupSteps,
      exampleSteps: activeLesson.exampleSteps,
      quizQuestions: activeLesson.quizQuestions,
    });
    pct = hydrated ? Math.round((checklist.done / checklist.total) * 100) : 0;
    progressLabel = `${hydrated ? checklist.done : 0}/${checklist.total}`;
    progressAria = `ความคืบหน้า Day ${activeLesson.day}`;
  } else if (onHome) {
    showProgress = true;
    const totalAuthored = LESSON_IDS.length;
    const completedAuthored = hydrated
      ? LESSON_IDS.filter((id) => Boolean(state.lessons[id]?.completedOn)).length
      : 0;
    pct = totalAuthored > 0 ? Math.round((completedAuthored / totalAuthored) * 100) : 0;
    progressLabel = `${completedAuthored}/${totalAuthored}`;
    progressAria = `บทเรียนเต็มที่เรียนจบแล้ว ${completedAuthored} จาก ${totalAuthored} บท`;
  }

  return (
    <header className="z-40 border-b border-hair bg-canvas/95 md:sticky md:top-0">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 sm:gap-x-4 sm:px-6">
        <Link href="/" aria-current={onHome ? "page" : undefined} className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl pr-1">
          <Image src={assetPath("/assets/neural-path-mark.svg")} alt="" width={28} height={28} priority />
          <span className="hidden text-base font-bold tracking-tight min-[400px]:inline">Neural Path</span>
          <span className="sr-only min-[400px]:hidden">Neural Path</span>
          <span className="sr-only"> — หน้าแรก</span>
        </Link>

        <nav aria-label="เมนูหลัก" className="flex items-center">
          <Link
            href="/"
            aria-current={onHome ? "page" : undefined}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm ${onHome ? "font-bold text-ink" : "font-medium text-muted hover:text-ink"}`}
          >
            <Library size={15} strokeWidth={1.75} aria-hidden="true" className="hidden min-[400px]:inline" />
            <span>ห้องสมุด</span>
          </Link>
          {onLesson ? (
            <Link href={pathname} aria-current="page" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold text-ink">
              <BookOpen size={15} strokeWidth={1.75} aria-hidden="true" className="hidden min-[400px]:inline text-brand-ink" />
              <span>Day {lessonDay}</span>
            </Link>
          ) : (
            <Link href="/lesson/d001" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-muted hover:text-ink">
              <BookOpen size={15} strokeWidth={1.75} aria-hidden="true" className="hidden min-[400px]:inline" />
              <span>Day 1</span>
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className={`items-center gap-2 ${showProgress ? "hidden min-[360px]:flex" : "hidden"}`}>
            <div
              className="progress-track w-14 sm:w-20"
              role="progressbar"
              aria-label={progressAria}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs tabular-nums text-muted" aria-hidden="true">
              {progressLabel}
            </span>
          </div>
          <AccountMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
