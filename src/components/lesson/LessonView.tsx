"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { KIND_LABEL, getLibraryEntry } from "@/content/catalog";
import { getLessonAudio } from "@/content/audio";
import type { Lesson } from "@/content/types";
import { assetPath } from "@/lib/assetPath";
import {
  setFocusMode,
  setReadingSize,
  useFocusMode,
  useHydrated,
  useReadingSize,
  type ReadingSize,
} from "@/lib/store";
import { DayCrumb } from "../library/DayCrumb";
import { AlertTriangle, BookOpen, Check, Circle, Eye, EyeOff, LessonGlyph, ListTree, Volume2 } from "../Icons";
import { RichText } from "../RichText";
import { Sheet } from "../Sheet";
import { useGlossary } from "../Glossary";
import { AudioTeacherDock, AudioTeacherIntro, useAudioTeacher } from "./AudioTeacherBar";
import { BigPicture } from "./BigPicture";
import { useLessonStatus } from "./CompleteButton";
import { Concepts } from "./Concepts";
import { ConceptVisual } from "./ConceptVisual";
import { Exercise } from "./Exercise";
import { Quiz } from "./Quiz";
import { SetupCheck } from "./SetupCheck";
import { StudyPanel } from "./StudyPanel";
import { Summary } from "./Summary";
import { TocList, goToSection, useScrollSpy, type TocItem } from "./Toc";
import { PayloadLab, WorkedExample } from "./WorkedExample";

function Section({
  id,
  eyebrow,
  title,
  speaking = false,
  hasAudio = false,
  onListen,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  speaking?: boolean;
  hasAudio?: boolean;
  onListen?: () => void;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-speaking={speaking ? "true" : undefined}
      className={`scroll-mt-24 border-t border-hair pt-12 first:border-t-0 first:pt-0 ${speaking ? "lesson-section-speaking" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : <span />}
        <div className="no-print flex items-center gap-2">
          {speaking ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-[color:var(--speaking-soft)] px-2.5 py-0.5 text-xs font-semibold text-success">
              <Volume2 size={13} strokeWidth={2} aria-hidden="true" />
              <span>กำลังอธิบาย</span>
            </span>
          ) : hasAudio && onListen ? (
            <button
              type="button"
              onClick={onListen}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-hair bg-surface px-2.5 py-0.5 text-xs font-medium text-muted hover:border-success hover:text-success pointer-coarse:min-h-11"
              aria-label={`เปิดเสียงอธิบายส่วน ${title}`}
            >
              <Volume2 size={13} strokeWidth={1.75} aria-hidden="true" />
              <span>ฟังส่วนนี้</span>
            </button>
          ) : null}
        </div>
      </div>
      <h2 id={headingId} tabIndex={-1} className="mt-1 text-xl font-bold leading-snug outline-none sm:text-2xl">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const SIZE_LABELS: Array<{ value: ReadingSize; label: string; aria: string }> = [
  { value: "sm", label: "A-", aria: "ขนาดตัวอักษรเล็ก" },
  { value: "md", label: "A", aria: "ขนาดตัวอักษรปกติ" },
  { value: "lg", label: "A+", aria: "ขนาดตัวอักษรใหญ่" },
];

export function LessonView({ lesson }: { lesson: Lesson }) {
  const { openIndex } = useGlossary();
  const [tocOpen, setTocOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const tocTitleId = useId();
  const libraryEntry = getLibraryEntry(lesson.day);
  const audioGuide = getLessonAudio(lesson.id);
  const audio = useAudioTeacher(audioGuide);
  const speakingId = audio?.activeSectionId ?? null;

  const hydrated = useHydrated();
  const readingSize = useReadingSize();
  const focusMode = useFocusMode();
  const activeSize: ReadingSize = hydrated ? readingSize : "md";
  const activeFocus = hydrated ? focusMode : false;

  const toc: TocItem[] = useMemo(() => {
    const items: TocItem[] = [
      { id: "big-picture", label: "Big Picture" },
      { id: "objectives", label: "เป้าหมาย & พื้นฐาน" },
      { id: "setup", label: "ติดตั้ง & เช็กเครื่อง" },
    ];
    if (lesson.visual) items.push({ id: "visual-map", label: "เห็นภาพการทำงาน" });
    items.push(
      { id: "concepts", label: "แนวคิดหลัก" },
      { id: "worked-example", label: "ตัวอย่างพร้อมรัน" },
      { id: "try-it", label: "ภารกิจลงมือทำ" },
      { id: "mistakes", label: "ข้อผิดพลาดที่พบบ่อย" },
      { id: "quiz", label: `Micro-Quiz (${lesson.quiz.questions.length} ข้อ)` },
      { id: "summary", label: "สรุป & บทถัดไป" },
    );
    return items;
  }, [lesson.visual, lesson.quiz.questions.length]);

  const ids = useMemo(() => toc.map((t) => t.id), [toc]);
  const active = useScrollSpy(ids);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && ids.includes(hash)) requestAnimationFrame(() => goToSection(hash));
  }, [ids]);

  useEffect(() => {
    const updateScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScrollPct(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  const showPayloadLab = lesson.id === "d001" && lesson.interactive?.payloadLab !== false;
  const kindTag = lesson.kind && lesson.kind !== "lesson" ? KIND_LABEL[lesson.kind] : null;
  const tryItTitle =
    lesson.id === "d001"
      ? "Try It — เขียน schema ให้ผ่านเทสต์"
      : kindTag
        ? `ภารกิจลงมือทำ (${kindTag})`
        : "Try It — ภารกิจลงมือทำ";

  const audioSectionProps = (sectionId: string) => ({
    speaking: speakingId === sectionId,
    hasAudio: Boolean(audio),
    onListen: audio ? () => audio.playSection(sectionId) : undefined,
  });

  return (
    <div>
      {/* subtle hairline book-reading progress ribbon */}
      <div className="reading-progress no-print" aria-hidden="true">
        <div className="reading-progress-bar" style={{ width: `${scrollPct}%` }} />
      </div>

      <div
        className="lesson-grid"
        data-focus-mode={activeFocus ? "true" : undefined}
        data-audio-open={audio?.open ? "true" : undefined}
      >
        {/* ---------------- table of contents: narrow rail (≥1024px) ---------------- */}
        {activeFocus ? null : (
          <nav aria-label="สารบัญบทเรียน" className="sticky-rail hidden lg:block">
            <TocList items={toc} active={active} speakingId={speakingId} />
          </nav>
        )}

        <div className="lesson-main min-w-0">
          {/* ---------------- non-linear navigation: back to the shelf, neighbouring days ---------------- */}
          {libraryEntry ? <DayCrumb entry={libraryEntry} /> : null}

          {/* ---------------- calm book chapter opener ---------------- */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="eyebrow flex flex-wrap items-center gap-1.5">
                <LessonGlyph icon={lesson.icon} size={15} className="text-brand-ink" />
                <span>
                  Day {lesson.day} · Phase {lesson.phase.index} · {lesson.block} · {lesson.minutes} นาที
                  {kindTag ? ` · ${kindTag}` : ""}
                </span>
              </p>

              {/* quiet reading comfort controls (font size & calm focus reading mode) */}
              <div className="no-print flex items-center gap-1.5">
                <div role="group" aria-label="ปรับขนาดตัวอักษร" className="inline-flex rounded-lg border border-hair bg-surface p-0.5">
                  {SIZE_LABELS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={activeSize === item.value}
                      aria-label={item.aria}
                      onClick={() => setReadingSize(item.value)}
                      className={`inline-flex min-h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium pointer-coarse:min-h-11 pointer-coarse:min-w-11 ${
                        activeSize === item.value ? "bg-brand-soft text-brand-ink font-semibold" : "text-muted hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  aria-pressed={activeFocus}
                  onClick={() => setFocusMode(!activeFocus)}
                  className={`hidden min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium lg:inline-flex ${
                    activeFocus
                      ? "border-brand bg-brand-soft text-brand-ink"
                      : "border-hair bg-surface text-muted hover:text-ink"
                  }`}
                  title="ซ่อนสารบัญด้านข้างเพื่ออ่านสบายตา"
                >
                  {activeFocus ? <EyeOff size={14} strokeWidth={1.75} aria-hidden="true" /> : <Eye size={14} strokeWidth={1.75} aria-hidden="true" />}
                  <span>{activeFocus ? "ออกจากโหมดอ่านชิว" : "โหมดอ่านชิว"}</span>
                </button>
              </div>
            </div>

            <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">{lesson.titleTh}</h1>
            <p className="mt-1.5 font-mono text-sm text-muted">{lesson.titleEn}</p>
            <p className="mt-2.5 text-[0.96875rem] text-muted">{lesson.tagline}</p>

            <ul className="inline-list mt-3 text-sm text-muted" aria-label="เครื่องมือในบทนี้">
              {lesson.tools.map((tool) => (
                <li key={tool} className="font-mono text-[0.8125rem]">
                  {tool}
                </li>
              ))}
              <li>{lesson.apiKeyNote ?? "รันบนเครื่องคุณได้ 100% ไม่ต้องใช้ API key"}</li>
            </ul>

            {audio ? <AudioTeacherIntro controller={audio} /> : null}

            {lesson.coverImage ? (
              <figure className="editorial-cover mt-6">
                <Image
                  src={assetPath(lesson.coverImage)}
                  alt={`ภาพประกอบประจำ Phase ${lesson.phase.index}: ${lesson.phase.title}`}
                  width={1200}
                  height={675}
                  className="h-40 w-full object-cover sm:h-52"
                />
              </figure>
            ) : null}
          </header>

          {/* ---------------- compact study summary (progress · review · time & terms) ---------------- */}
          <StudyPanel lesson={lesson} />

          {/* ---------------- reading column ---------------- */}
          <article
            className="reading space-y-14"
            data-reading-size={activeSize}
            aria-label={`เนื้อหาบทเรียน Day ${lesson.day}`}
          >
            <Section id="big-picture" eyebrow="1 · Big Picture" title="ภาพรวม: วงจรวิศวกรรม AI" {...audioSectionProps("big-picture")}>
              <BigPicture lesson={lesson} />
            </Section>

            <Section id="objectives" eyebrow="2 · Objectives" title="เมื่อจบบทนี้ คุณจะ…" {...audioSectionProps("objectives")}>
              <ol className="list-decimal space-y-2.5 pl-6 marker:font-semibold marker:text-brand-ink">
                {lesson.objectives.map((objective, i) => (
                  <li key={i} className="pl-1">
                    <RichText text={objective} />
                  </li>
                ))}
              </ol>
              <h3 className="mt-8 text-base font-semibold">ความรู้ที่ควรมีก่อนเริ่ม</h3>
              <ul className="inline-list mt-2 text-[0.9375rem] text-muted" aria-label="Prerequisites">
                {lesson.prerequisites.map((p) => (
                  <li key={p} className="inline-flex items-center gap-1">
                    <Check size={14} strokeWidth={2.2} aria-hidden="true" className="text-success" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="setup" eyebrow="3 · Orientation · 0–5 นาที" title="ติดตั้ง & เช็กเครื่อง" {...audioSectionProps("setup")}>
              <SetupCheck lesson={lesson} />
            </Section>

            {lesson.visual ? (
              <Section id="visual-map" eyebrow="Visual Intuition" title="เห็นภาพกลไกการทำงาน" {...audioSectionProps("visual-map")}>
                <ConceptVisual visual={lesson.visual} />
              </Section>
            ) : null}

            <Section id="concepts" eyebrow="4 · Core concepts · 5–13 นาที" title="แนวคิดหลัก" {...audioSectionProps("concepts")}>
              <Concepts lesson={lesson} />
            </Section>

            <Section id="worked-example" eyebrow="5 · Worked example" title="ตัวอย่างพร้อมรัน" {...audioSectionProps("worked-example")}>
              <WorkedExample lesson={lesson} />
              {showPayloadLab ? (
                <>
                  <h3 className="mt-10 text-lg font-semibold">Payload Lab — ลองเองได้ทันที</h3>
                  <div className="mt-3">
                    <PayloadLab lesson={lesson} />
                  </div>
                </>
              ) : null}
            </Section>

            <Section id="try-it" eyebrow="6 · Try It · 13–25 นาที" title={tryItTitle} {...audioSectionProps("try-it")}>
              <Exercise lesson={lesson} />
            </Section>

            <Section id="mistakes" eyebrow="7 · Mistakes" title="ข้อผิดพลาดที่พบบ่อย" {...audioSectionProps("mistakes")}>
              <ul className="divide-y divide-[color:var(--hair)]">
                {lesson.mistakes.map((mistake) => (
                  <li key={mistake.title} className="py-5 first:pt-0 last:pb-0">
                    <h3 className="flex items-center gap-2 font-semibold leading-snug">
                      <AlertTriangle size={17} strokeWidth={1.85} aria-hidden="true" className="shrink-0 text-warning" />
                      <span>{mistake.title}</span>
                    </h3>
                    <p className="mt-2 text-[0.9375rem]">
                      <strong>อาการ:</strong> <RichText text={mistake.symptom} />
                    </p>
                    <p className="mt-1 text-[0.9375rem]">
                      <strong>วิธีแก้:</strong> <RichText text={mistake.fix} />
                    </p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="quiz" eyebrow="8 · Quiz · 25–30 นาที" title={`Micro-Quiz ${lesson.quiz.questions.length} ข้อ`} {...audioSectionProps("quiz")}>
              <Quiz lesson={lesson} />
            </Section>

            <Section id="summary" eyebrow="9 · Summary" title="สรุป & บทถัดไป" {...audioSectionProps("summary")}>
              <Summary lesson={lesson} />
            </Section>
          </article>
        </div>

        {/* ---------------- non-overlapping AI Audio Teacher side-rail (≥1280px) / sticky top strip (<1280px) ---------------- */}
        {audio ? <AudioTeacherDock controller={audio} /> : null}
      </div>

      {/* ---------------- mobile / tablet bottom bar: just Contents + Terms ---------------- */}
      <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-hair bg-canvas lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto flex max-w-xl items-center gap-2 px-4 py-2">
          <button type="button" className="btn btn-quiet flex-1" onClick={() => setTocOpen(true)} aria-haspopup="dialog">
            <ListTree size={16} strokeWidth={1.75} aria-hidden="true" /> สารบัญ
          </button>
          <button type="button" className="btn btn-quiet flex-1" onClick={() => openIndex(lesson.glossary)} aria-haspopup="dialog">
            <BookOpen size={16} strokeWidth={1.75} aria-hidden="true" /> ศัพท์
          </button>
        </div>
      </div>

      <Sheet open={tocOpen} onClose={() => setTocOpen(false)} title="สารบัญบทเรียน" titleId={tocTitleId}>
        <nav aria-label="สารบัญบทเรียน (มือถือ)">
          <TocList items={toc} active={active} speakingId={speakingId} onNavigate={() => setTocOpen(false)} />
        </nav>
        <div className="mt-4 border-t border-hair pt-4">
          <StudyPanelInline lesson={lesson} />
        </div>
      </Sheet>
    </div>
  );
}

/** Compact progress summary used inside the mobile contents sheet. */
function StudyPanelInline({ lesson }: { lesson: Lesson }) {
  const { hydrated, checklist } = useLessonStatus(lesson);
  const rows = [
    ["ติดตั้ง & เช็กเครื่อง", checklist.setup],
    ["ตัวอย่างพร้อมรัน", checklist.example],
    ["ภารกิจฝึกทำ", checklist.exercise],
    [`ควิซ ${lesson.quiz.questions.length} ข้อ`, checklist.quiz],
  ] as const;
  return (
    <section aria-label="ความคืบหน้า">
      <h3 className="eyebrow">ความคืบหน้า</h3>
      <ul className="mt-2 space-y-1.5 text-sm">
        {rows.map(([label, done]) => (
          <li key={label} className="flex items-center gap-2">
            {hydrated && done ? (
              <Check size={14} strokeWidth={2.2} aria-hidden="true" className="text-success" />
            ) : (
              <Circle size={13} strokeWidth={1.75} aria-hidden="true" className="text-muted" />
            )}
            <span>{label}</span>
            <span className="sr-only">{hydrated && done ? " (เสร็จแล้ว)" : " (ยังไม่เสร็จ)"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
