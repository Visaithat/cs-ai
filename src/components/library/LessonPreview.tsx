import Link from "next/link";
import { DAILY_LOOP, KIND_LABEL, PHASES, REVIEW_LOOP, TOTAL_DAYS, getLibraryEntry, type LibraryEntry } from "@/content";
import { ArrowRight, CircleDashed, Clock } from "../Icons";
import { DayCrumb } from "./DayCrumb";

/**
 * Metadata-only page for a day without a full authored lesson. Everything shown here comes from
 * the curriculum schedule; it never pretends to be lesson content.
 */
export function LessonPreview({ entry }: { entry: LibraryEntry }) {
  const phase = PHASES.find((p) => p.index === entry.phase);
  const isReview = entry.kind !== "lesson";
  const loop = isReview ? REVIEW_LOOP : DAILY_LOOP;
  const related = entry.recommended.map((day) => getLibraryEntry(day)).filter((e): e is LibraryEntry => Boolean(e));
  const blockStart = entry.day - ((entry.day - 1) % 4);
  const missing = ["Big Picture", "ตัวอย่างพร้อมรัน", "แบบฝึกหัดแบบโต้ตอบ", "ควิซ 4 ข้อ"];

  return (
    <article className="mx-auto max-w-[42.5rem]" aria-labelledby="preview-title">
      <DayCrumb entry={entry} />

      <header>
        <p className="eyebrow">
          Day {entry.day} จาก {TOTAL_DAYS} · Phase {entry.phase} · {entry.block} · {entry.minutes} นาที
          {isReview ? ` · ${KIND_LABEL[entry.kind]}` : ""}
        </p>
        <h1 id="preview-title" className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">
          {entry.title}
        </h1>
        {entry.tools.length > 0 ? (
          <ul className="inline-list mt-3 text-sm text-muted" aria-label="เครื่องมือหลักของบล็อกนี้">
            {entry.tools.map((tool) => (
              <li key={tool} className="font-mono text-[0.8125rem]">
                {tool}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div role="status" className="mt-6 rounded-r-xl border-l-[3px] border-warning py-2.5 pl-4 pr-3">
        <p className="flex items-center gap-2 font-semibold">
          <Clock size={17} strokeWidth={1.85} aria-hidden="true" className="text-warning" />
          <span>กำลังจัดทำเนื้อหาเต็ม</span>
        </p>
        <p className="mt-1 text-[0.9375rem]">
          นี่คือ <strong>หน้าพรีวิว</strong> ที่สร้างจากแผนหลักสูตร ยังไม่ใช่บทเรียนเต็ม — ยังไม่มีเนื้อหา คำอธิบาย หรือเฉลยของวันนี้ แต่เปิดอ่านและข้ามไปวันอื่นได้ตามต้องการ
        </p>
        <p className="mt-1 text-sm text-muted">
          ยังไม่มีในหน้านี้: {missing.join(" · ")}
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <section aria-labelledby="focus-h">
          <h2 id="focus-h" className="text-lg font-bold">
            หัวข้อที่จะเรียน
          </h2>
          <dl className="mt-3 space-y-3 text-[0.9375rem]">
            <div>
              <dt className="text-sm text-muted">บล็อก</dt>
              <dd>
                {entry.block} · Day {blockStart}–{blockStart + 3}
              </dd>
            </div>
            {phase ? (
              <>
                <div>
                  <dt className="text-sm text-muted">เฟส</dt>
                  <dd>
                    <Link href={`/#phase-${phase.index}`} className="text-brand-ink underline underline-offset-4">
                      Phase {phase.index} · {phase.title}
                    </Link>{" "}
                    <span className="text-muted">({phase.days})</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">โฟกัสของเฟส</dt>
                  <dd>{phase.focus}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Portfolio milestone ของเฟส</dt>
                  <dd>{phase.milestone}</dd>
                </div>
              </>
            ) : null}
          </dl>
        </section>

        <section aria-labelledby="cadence-h">
          <h2 id="cadence-h" className="text-lg font-bold">
            จังหวะ 30 นาทีที่วางแผนไว้
          </h2>
          <p className="mt-1 text-sm text-muted">
            {isReview ? "วัน Review / Checkpoint ไม่มีเนื้อหาใหม่ — ทวนและต่อยอดจากสามวันก่อนหน้า" : "วงจรเดียวกับ Day 1: อ่านสั้น ๆ ลงมือทำ แล้วเช็กความเข้าใจ"}
          </p>
          <ol className="mt-3 divide-y divide-[color:var(--hair)]" aria-label="ตารางเวลา 30 นาที">
            {loop.map((step) => (
              <li key={step.id} className="flex gap-3 py-3">
                <span className="w-20 shrink-0 font-mono text-xs leading-6 text-muted">{step.minutes} นาที</span>
                <span>
                  <span className="block font-semibold">{step.label}</span>
                  <span className="block text-sm text-muted">{step.hint}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="related-h">
          <h2 id="related-h" className="text-lg font-bold">
            ควรรู้ก่อน / วันที่เกี่ยวข้อง
          </h2>
          <p className="mt-1 text-sm text-muted">คำแนะนำเท่านั้น ไม่ใช่เงื่อนไข — เปิดวันนี้ก่อนได้เลย</p>
          {related.length > 0 ? (
            <ul className="mt-3 divide-y divide-[color:var(--hair)]">
              {related.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="flex min-h-11 items-baseline gap-3 py-2.5 hover:text-brand-ink">
                    <span className="mono-label w-14 shrink-0 text-muted">Day {item.day}</span>
                    <span className="min-w-0 flex-1 font-medium">{item.shortTitle}</span>
                    <span className="shrink-0 text-xs text-muted">{item.authored ? "เนื้อหาเต็ม" : "พรีวิว"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[0.9375rem]">ไม่มีวันที่ต้องดูก่อน — เป็นจุดเริ่มต้นของหลักสูตร</p>
          )}
          {isReview ? <p className="mt-2 text-sm text-muted">วันนี้ทบทวนเนื้อหาจาก Day {entry.reviews.join(", ")}</p> : null}
          {phase && phase.after.length > 0 ? (
            <p className="mt-3 text-sm text-muted">
              พื้นฐานระดับเฟสที่แนะนำ:{" "}
              {phase.after.map((index, i) => (
                <span key={index}>
                  {i > 0 ? ", " : ""}
                  <Link href={`/#phase-${index}`} className="text-brand-ink underline underline-offset-4">
                    Phase {index}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </section>

        <section aria-labelledby="exercise-h">
          <h2 id="exercise-h" className="text-lg font-bold">
            แบบฝึกหัด
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-[0.9375rem]">
            <CircleDashed size={15} strokeWidth={1.75} aria-hidden="true" className="text-muted" />
            <strong>วางแผนไว้ — ยังไม่เปิดให้ทำ</strong>
          </p>
          <p className="mt-1 text-sm text-muted">
            {entry.exercise.title
              ? `โจทย์ที่วางไว้ในแผน: ${entry.exercise.title}`
              : "แผนหลักสูตรยังไม่ระบุโจทย์รายวันสำหรับวันนี้ — จะประกาศพร้อมเนื้อหาเต็ม"}
          </p>
        </section>

        <section aria-labelledby="next-h" className="border-t border-hair pt-8">
          <h2 id="next-h" className="text-lg font-bold">
            ไปต่อได้เลย
          </h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/lesson/d001" className="btn btn-primary">
              ดูตัวอย่างบทเรียนเต็ม: Day 1 <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <Link href="/#phase-shelves" className="btn">
              กลับห้องสมุด
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">ข้อมูลหน้านี้มาจาก docs/curriculum.md · วิธีเพิ่มบทเรียนเต็มอยู่ใน README</p>
        </section>
      </div>
    </article>
  );
}
