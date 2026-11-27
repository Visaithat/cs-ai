"use client";

import Link from "next/link";
import { getLibraryEntry, lessonIdForDay } from "@/content";
import type { Lesson } from "@/content/types";
import { Callout } from "../Callout";
import { Award, ExternalLink, Repeat } from "../Icons";
import { RichText } from "../RichText";
import { CompleteButton } from "./CompleteButton";

export function Summary({ lesson }: { lesson: Lesson }) {
  const { summary, sources } = lesson;
  const nextEntry = getLibraryEntry(summary.next.day);
  const nextAvailable = nextEntry ? nextEntry.authored : summary.next.available;

  return (
    <div className="space-y-8">
      {summary.isFinalDay && summary.graduationNote ? (
        <Callout tone="success" title="ครบ 180 วัน — Neural Path Graduation">
          <p className="flex items-start gap-2">
            <Award size={18} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
            <span>
              <RichText text={summary.graduationNote} />
            </span>
          </p>
        </Callout>
      ) : null}

      <div>
        <h3 className="font-semibold">สิ่งที่ต้องจำ</h3>
        <ul className="mt-2 list-disc space-y-2 pl-6 marker:text-brand">
          {summary.takeaways.map((t, i) => (
            <li key={i}>
              <RichText text={t} />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          <Repeat size={17} strokeWidth={1.75} aria-hidden="true" className="text-brand-ink" />
          <span>การทบทวนที่จะตามมา</span>
        </h3>
        <p className="mt-1">
          <RichText text={summary.reviewNote} />
        </p>
        <div className="mt-3">
          <CompleteButton lesson={lesson} />
        </div>
      </div>

      <section aria-labelledby="next-lesson">
        <p className="eyebrow">บทถัดไป (แนะนำ — เลือกอ่านวันอื่นก่อนก็ได้)</p>
        <h3 id="next-lesson" className="mt-1 font-semibold">
          <Link href={`/lesson/${lessonIdForDay(summary.next.day)}`} className="text-brand-ink underline underline-offset-4">
            Day {summary.next.day} · {summary.next.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted">
          {nextAvailable ? "บทเรียนเต็มพร้อมอ่าน" : "หน้าพรีวิวจากแผนหลักสูตร — กำลังจัดทำเนื้อหาเต็ม"}
          {" · "}
          <Link href="/#phase-shelves" className="text-brand-ink underline underline-offset-4">
            เลือกวันอื่นที่ห้องสมุด
          </Link>
        </p>
      </section>

      <div>
        <h3 className="font-semibold">แหล่งอ้างอิงหลัก (Primary sources)</h3>
        <ul className="mt-2 space-y-1">
          {sources.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-1.5 text-brand-ink underline underline-offset-4 pointer-coarse:min-h-11"
              >
                <span>{source.label}</span>
                <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only">(เปิดในแท็บใหม่)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
