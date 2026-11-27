"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { Hint, Lesson } from "@/content/types";
import { markPracticeTried, recordRun, resetExercise, revealHint, saveCode, setTabIndent, toggleSelfCheck } from "@/lib/actions";
import { runExercise, type RunReport } from "@/lib/exercise/d001";
import { getLesson as getProgress } from "@/lib/progress";
import { useAppState, useHydrated } from "@/lib/store";
import { Callout } from "../Callout";
import { CodeBlock } from "../CodeBlock";
import {
  AlertTriangle,
  ArrowDown,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Lightbulb,
  Play,
  RotateCcw,
  Terminal,
  Unlock,
  X,
} from "../Icons";
import { RichText } from "../RichText";

function insertText(el: HTMLTextAreaElement, text: string) {
  el.focus();
  const ok = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
  if (!ok) {
    el.setRangeText(text, el.selectionStart, el.selectionEnd, "end");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

export function Exercise({ lesson }: { lesson: Lesson }) {
  const isSimulatedD001 = lesson.id === "d001" && lesson.interactive?.browserChecker !== false;
  if (isSimulatedD001) return <SimulatedExercise lesson={lesson} />;
  return <OfflineTaskWorkspace lesson={lesson} />;
}

/* --------------------- Offline / Local Task Workspace (D002–D180) --------------------- */

function OfflineTaskWorkspace({ lesson }: { lesson: Lesson }) {
  const { exercise } = lesson;
  const state = useAppState();
  const hydrated = useHydrated();
  const progress = getProgress(state, lesson.id);

  const [draft, setDraft] = useState<string | null>(null);
  const [undoCode, setUndoCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const code = draft ?? (hydrated ? progress.exercise.code : undefined) ?? exercise.starter.code;
  const dirtyFromStarter = code !== exercise.starter.code;
  const selfChecks = exercise.selfCheck ?? [];
  const savedChecks = hydrated ? (progress.exercise.selfChecks ?? {}) : {};
  const checkedCount = selfChecks.filter((_, idx) => Boolean(savedChecks[`c-${idx}`])).length;
  const allChecked = selfChecks.length > 0 && checkedCount >= selfChecks.length;

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const escaped = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorId = useId();
  const helpId = useId();

  function cancelPendingSave() {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
  }

  useEffect(() => cancelPendingSave, []);

  function update(next: string) {
    setDraft(next);
    cancelPendingSave();
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      saveCode(lesson.id, next);
      if (progress.exercise.attempts < 1) markPracticeTried(lesson.id);
    }, 500);
  }

  function reset() {
    cancelPendingSave();
    setUndoCode(code);
    setDraft(exercise.starter.code);
    resetExercise(lesson.id);
  }

  function replaceWith(next: string) {
    cancelPendingSave();
    setUndoCode(code);
    update(next);
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const el = event.currentTarget;
    if (event.key === "Escape") {
      escaped.current = true;
      return;
    }
    if (event.key === "Tab" && state.tabIndent && !event.shiftKey) {
      if (escaped.current) {
        escaped.current = false;
        return;
      }
      event.preventDefault();
      insertText(el, "    ");
      return;
    }
    escaped.current = false;

    if (event.key === "Enter" && !event.shiftKey && !event.altKey && el.selectionStart === el.selectionEnd) {
      const before = el.value.slice(0, el.selectionStart);
      const line = before.slice(before.lastIndexOf("\n") + 1);
      const indent = /^ */.exec(line)?.[0] ?? "";
      const extra = line.trimEnd().endsWith(":") ? "    " : "";
      event.preventDefault();
      insertText(el, `\n${indent}${extra}`);
    }
  }

  return (
    <div className="card p-5 sm:p-6">
      <p>
        <RichText text={exercise.intro} />
      </p>

      <h3 className="mt-5 font-semibold">ภารกิจ (Requirements)</h3>
      <ol className="mt-2 list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-brand">
        {exercise.requirements.map((req, i) => (
          <li key={i}>
            <RichText text={req} />
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <label htmlFor={editorId} className="font-semibold">
            กระดานร่างโค้ด <span className="mono-label text-muted">{exercise.starter.filename ?? "practice.py"}</span>
          </label>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-muted">
            <input type="checkbox" className="h-5 w-5 accent-[color:var(--brand)]" checked={state.tabIndent} onChange={(e) => setTabIndent(e.target.checked)} />
            ให้ปุ่ม Tab เยื้องโค้ด
          </label>
        </div>
        <textarea
          id={editorId}
          ref={editorRef}
          className="editor mt-2"
          style={{ minHeight: "17rem" }}
          value={code}
          onChange={(event) => update(event.target.value)}
          onBlur={() => saveCode(lesson.id, code)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          aria-describedby={helpId}
        />
        <p id={helpId} className="mt-1.5 text-sm text-muted">
          โค้ดที่คุณพิมพ์ถูกบันทึกอัตโนมัติในเบราว์เซอร์ — คัดลอกไปรันบนเครื่องด้วยคำสั่งด้านล่าง แล้วติ๊กเช็กลิสต์เพื่อบันทึกว่าผ่านภารกิจ
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={copyDraft}>
            {copied ? <Check size={16} strokeWidth={1.85} aria-hidden="true" /> : <Copy size={16} strokeWidth={1.75} aria-hidden="true" />}
            {copied ? "คัดลอกโค้ดแล้ว" : "คัดลอกโค้ดไปรันบนเครื่อง"}
          </button>
          <button type="button" className="btn btn-quiet" onClick={reset} disabled={!dirtyFromStarter}>
            <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" /> รีเซ็ตเป็นโค้ดเริ่มต้น
          </button>
          {undoCode !== null ? (
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => {
                update(undoCode);
                setUndoCode(null);
              }}
            >
              ย้อนกลับโค้ดก่อนหน้า
            </button>
          ) : null}
        </div>
      </div>

      {selfChecks.length > 0 ? (
        <fieldset className="mt-6 border-t border-hair pt-5">
          <legend className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={17} strokeWidth={1.75} aria-hidden="true" className={allChecked ? "text-success" : "text-brand-ink"} />
            <span>
              เช็กลิสต์ตรวจงานด้วยตัวเอง{" "}
              <span className="font-normal text-muted tabular-nums">
                ({checkedCount}/{selfChecks.length})
              </span>
            </span>
          </legend>
          <p className="mt-1 text-sm text-muted">เมื่อรันโค้ดและเทสต์บนเครื่องผ่านแล้ว ติ๊กทีละข้อเพื่อบันทึกความคืบหน้าของบทนี้</p>
          <ul className="mt-2 space-y-1">
            {selfChecks.map((item, idx) => {
              const key = `c-${idx}`;
              const checked = Boolean(savedChecks[key]);
              return (
                <li key={key}>
                  <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-2 py-2 hover:bg-surface2/70">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleSelfCheck(lesson.id, key, e.target.checked, selfChecks.length)}
                      className="mt-1 h-5 w-5 shrink-0 accent-[color:var(--brand)]"
                    />
                    <span className={checked ? "text-muted line-through decoration-1" : ""}>
                      <RichText text={item} allowTerms={false} />
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : null}

      {allChecked ? (
        <Callout tone="success" title="เยี่ยมมาก! ผ่านเช็กลิสต์ภารกิจครบแล้ว">
          <p>ไปต่อที่ควิซด้านล่างเพื่อย้ำความเข้าใจ และเก็บการ์ดทบทวนเข้าคิว Spaced Review</p>
          <p className="mt-2">
            <a href="#quiz" className="btn btn-primary">
              ไปที่ Micro-Quiz <ArrowDown size={16} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </p>
        </Callout>
      ) : null}

      <details className="why mt-5 border-l-2 border-hair pl-4">
        <summary className="font-medium text-muted hover:text-ink">
          <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" className="chev shrink-0" />
          <Terminal size={15} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <span>ดูชุดทดสอบ ({exercise.tests.filename ?? "verification"}) และคำสั่งรันบนเครื่อง</span>
        </summary>
        <div className="pb-4">
          <CodeBlock sample={exercise.tests} />
          <CodeBlock sample={exercise.localRun} />
          <p className="text-sm text-muted">
            <RichText text={`เกณฑ์ผ่าน: ${exercise.acceptance}`} />
          </p>
        </div>
      </details>

      <HintLadder
        hints={exercise.hints}
        revealed={hydrated ? progress.exercise.hintsRevealed : 0}
        attempts={hydrated ? progress.exercise.attempts : 0}
        gatePrompt="ลองพิมพ์โค้ดในกระดานร่าง หรือติ๊กเช็กลิสต์อย่างน้อย 1 ข้อก่อนเปิดคำใบ้ระดับ 3"
        onUnlockAttempt={() => markPracticeTried(lesson.id)}
        onReveal={(level) => revealHint(lesson, level)}
        onInsert={(snippet) => {
          replaceWith(snippet);
          editorRef.current?.focus();
        }}
      />
    </div>
  );
}

/* --------------------- Simulated In-Browser Exercise (D001) --------------------- */

function SimulatedExercise({ lesson }: { lesson: Lesson }) {
  const { exercise } = lesson;
  const state = useAppState();
  const hydrated = useHydrated();
  const progress = getProgress(state, lesson.id);

  const [draft, setDraft] = useState<string | null>(null);
  const [report, setReport] = useState<RunReport | null>(null);
  const [undoCode, setUndoCode] = useState<string | null>(null);
  const code = draft ?? (hydrated ? progress.exercise.code : undefined) ?? exercise.starter.code;
  const dirtyFromStarter = code !== exercise.starter.code;

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const escaped = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorId = useId();
  const helpId = useId();
  const resultsId = useId();

  function cancelPendingSave() {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
  }

  useEffect(() => cancelPendingSave, []);

  function update(next: string) {
    setDraft(next);
    cancelPendingSave();
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      saveCode(lesson.id, next);
    }, 500);
  }

  function run() {
    cancelPendingSave();
    const result = runExercise(code);
    setReport(result);
    saveCode(lesson.id, code);
    recordRun(lesson.id, { passed: result.status === "passed", mastered: result.mastered });
  }

  function reset() {
    cancelPendingSave();
    setUndoCode(code);
    setDraft(exercise.starter.code);
    setReport(null);
    resetExercise(lesson.id);
  }

  function replaceWith(next: string) {
    cancelPendingSave();
    setUndoCode(code);
    update(next);
    setReport(null);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const el = event.currentTarget;
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      run();
      return;
    }
    if (event.key === "Escape") {
      escaped.current = true;
      return;
    }
    if (event.key === "Tab" && state.tabIndent && !event.shiftKey) {
      if (escaped.current) {
        escaped.current = false;
        return;
      }
      event.preventDefault();
      insertText(el, "    ");
      return;
    }
    escaped.current = false;

    if (event.key === "Enter" && !event.shiftKey && !event.altKey && el.selectionStart === el.selectionEnd) {
      const before = el.value.slice(0, el.selectionStart);
      const line = before.slice(before.lastIndexOf("\n") + 1);
      const indent = /^ */.exec(line)?.[0] ?? "";
      const extra = line.trimEnd().endsWith(":") ? "    " : "";
      event.preventDefault();
      insertText(el, `\n${indent}${extra}`);
    }
  }

  const passed = report?.status === "passed";

  return (
    <div className="card p-5 sm:p-6">
      <p>
        <RichText text={exercise.intro} />
      </p>

      <h3 className="mt-5 font-semibold">Requirements</h3>
      <ol className="mt-2 list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-brand">
        {exercise.requirements.map((req, i) => (
          <li key={i}>
            <RichText text={req} />
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <label htmlFor={editorId} className="font-semibold">
            แก้ไฟล์ <span className="mono-label">{exercise.starter.filename}</span>
          </label>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="h-5 w-5 accent-[color:var(--brand)]" checked={state.tabIndent} onChange={(e) => setTabIndent(e.target.checked)} />
            ให้ปุ่ม Tab เยื้องโค้ด
          </label>
        </div>
        <textarea
          id={editorId}
          ref={editorRef}
          className="editor mt-2"
          value={code}
          onChange={(event) => update(event.target.value)}
          onBlur={() => saveCode(lesson.id, code)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          aria-describedby={helpId}
        />
        <p id={helpId} className="mt-1 text-sm text-muted">
          <kbd className="inline-code">Ctrl/⌘ + Enter</kbd> รันเทสต์ · Enter เยื้องบรรทัดให้อัตโนมัติ · ปุ่ม Tab ย้ายโฟกัสตามปกติ
          (เปิดตัวเลือกด้านบนเพื่อใช้ Tab เยื้องโค้ด แล้วกด <kbd className="inline-code">Esc</kbd> ตามด้วย <kbd className="inline-code">Tab</kbd> เพื่อออกจากกล่อง)
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={run}>
            <Play size={15} strokeWidth={1.85} aria-hidden="true" /> รันเทสต์ (pytest จำลอง)
          </button>
          <button type="button" className="btn btn-quiet" onClick={reset} disabled={!dirtyFromStarter}>
            <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" /> รีเซ็ตเป็นโค้ดเริ่มต้น
          </button>
          {undoCode !== null ? (
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => {
                update(undoCode);
                setUndoCode(null);
              }}
            >
              ย้อนกลับโค้ดก่อนหน้า
            </button>
          ) : null}
        </div>
      </div>

      <div id={resultsId} className="mt-5" role="status" aria-live="polite" aria-atomic="false">
        {report ? <Results report={report} /> : <p className="text-muted">ยังไม่ได้รัน — ผลเทสต์จะแสดงที่นี่ พร้อมคำแนะนำสิ่งที่ต้องแก้ต่อ</p>}
      </div>

      {passed ? (
        <Callout tone="success" title="Exercise ผ่านในตัวจำลองแล้ว!">
          <p>
            <RichText text="ไปต่อที่ควิซ 4 ข้อ เพื่อเช็กว่าเข้าใจ “ทำไม” ด้วย — แล้วอย่าลืมรัน `uv run pytest -q` บนเครื่องจริงเพื่อยืนยัน" allowTerms={false} />
          </p>
          <p className="mt-2">
            <a href="#quiz" className="btn btn-primary">
              ไปที่ Micro-Quiz <ArrowDown size={16} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </p>
        </Callout>
      ) : null}

      <details className="why mt-5 border-l-2 border-hair pl-4">
        <summary className="font-medium text-muted hover:text-ink">
          <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" className="chev shrink-0" />
          ดูไฟล์ทดสอบจริง (test_day1.py) และวิธีรันบนเครื่อง
        </summary>
        <div className="pb-4">
          <CodeBlock sample={exercise.tests} />
          <CodeBlock sample={exercise.localRun} />
          <p className="text-sm text-muted">
            <RichText text={`เกณฑ์ผ่าน: ${exercise.acceptance}`} />
          </p>
        </div>
      </details>

      <HintLadder
        hints={exercise.hints}
        revealed={hydrated ? progress.exercise.hintsRevealed : 0}
        attempts={hydrated ? progress.exercise.attempts : 0}
        gatePrompt="ลองกด “รันเทสต์” อย่างน้อย 1 ครั้ง (หรือใช้ Hint 1–2) ก่อนเปิดระดับ 3 — การดูผลที่ล้มเหลวช่วยให้จำได้ดีกว่า"
        onReveal={(level) => revealHint(lesson, level)}
        onInsert={(snippet) => {
          replaceWith(snippet);
          editorRef.current?.focus();
        }}
      />
    </div>
  );
}

/* --------------------------------- results -------------------------------- */

function Results({ report }: { report: RunReport }) {
  const passedCount = report.tests.filter((t) => t.passed).length;
  const headline =
    report.status === "passed"
      ? { Icon: CheckCircle2, label: "ผ่านในตัวจำลอง", cls: "text-success" }
      : report.status === "failed"
        ? { Icon: X, label: "ยังไม่ผ่าน", cls: "text-danger" }
        : report.status === "unverified"
          ? { Icon: AlertTriangle, label: "ยืนยันไม่ได้ — ตัวตรวจอ่านโค้ดไม่ครบ", cls: "text-warning" }
          : { Icon: AlertTriangle, label: "รันเทสต์ไม่ได้ (collection error)", cls: "text-warning" };
  const HeadIcon = headline.Icon;

  return (
    <div>
      <p className={`flex flex-wrap items-center gap-2 text-lg font-bold ${headline.cls}`}>
        <HeadIcon size={20} strokeWidth={2} aria-hidden="true" />
        <span>{headline.label}</span>
        <span className="font-mono text-sm font-normal text-muted">{report.summary}</span>
      </p>

      {report.collectionErrors.length > 0 ? (
        <div className="mt-3">
          <pre className="code-block overflow-x-auto px-4 py-3 text-danger" tabIndex={0} aria-label="ข้อผิดพลาดก่อนรันเทสต์">
            <code>{report.collectionErrors.map((e) => `E   ${e}`).join("\n")}</code>
          </pre>
          <p className="mt-2 text-sm">
            <strong>ทำต่อ:</strong> แก้ข้อผิดพลาดด้านบนก่อน (ตรวจ import และเครื่องหมาย <code className="inline-code">:</code> หลัง class/def) แล้วกดรันอีกครั้ง
          </p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-[color:var(--hair)]" aria-label={`ผลเทสต์ ผ่าน ${passedCount} จาก ${report.tests.length}`}>
          {report.tests.map((test) => (
            <li key={test.name} className="py-3">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {test.passed ? (
                  <Check size={16} strokeWidth={2.2} aria-hidden="true" className="text-success" />
                ) : (
                  <X size={16} strokeWidth={2.2} aria-hidden="true" className="text-danger" />
                )}
                <span className={test.passed ? "text-success" : "text-danger"}>{test.passed ? "ผ่าน" : "ไม่ผ่าน"}</span>
                <span className="mono-label font-normal">{test.name}</span>
              </p>
              {test.message ? (
                <pre className="code-block mt-2 overflow-x-auto px-3 py-2" tabIndex={0} aria-label={`รายละเอียดข้อผิดพลาด ${test.name}`}>
                  <code>{`E   ${test.message.replace(/\n/g, "\nE   ")}`}</code>
                </pre>
              ) : null}
              {test.tip ? (
                <p className="mt-2 text-[0.9375rem]">
                  <strong>ทำต่อ:</strong> <RichText text={test.tip} allowTerms={false} />
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {report.unsupported.length > 0 ? (
        <Callout tone="warning" title="ตัวตรวจอ่านโค้ดบางส่วนไม่ได้ จึงไม่นับว่าผ่าน">
          <p>
            <RichText
              text={
                report.status === "failed"
                  ? "ผลด้านบนอาจคลาดเคลื่อนเพราะโค้ดบางส่วนอยู่นอกรูปแบบที่ตัวจำลองเข้าใจ — ยืนยันด้วย `uv run pytest -q` บนเครื่องจริง"
                  : "ตัวจำลองไม่พบข้อผิดพลาด แต่เพื่อไม่ให้ให้คะแนนผิด จะไม่นับว่า “ผ่าน” หรือ ★ Mastery จนกว่าจะเขียนในรูปแบบที่อ่านได้ (เหมือน Hint 3) — หรือยืนยันด้วย `uv run pytest -q` บนเครื่องจริง"
              }
              allowTerms={false}
            />
          </p>
          <ul className="mt-2 list-disc pl-5">
            {report.unsupported.map((item, i) => (
              <li key={i}>
                <RichText text={item} allowTerms={false} />
              </li>
            ))}
          </ul>
        </Callout>
      ) : null}

      {report.notes.length > 0 ? (
        <Callout tone="warning" title="ข้อสังเกตจากโค้ดของคุณ">
          <ul className="list-disc pl-5">
            {report.notes.map((note, i) => (
              <li key={i}>
                <RichText text={note} allowTerms={false} />
              </li>
            ))}
          </ul>
        </Callout>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-4">
        <div>
          <h4 className="flex items-center gap-1.5 font-semibold">
            {report.lint.length === 0 ? (
              <Check size={16} strokeWidth={2} aria-hidden="true" className="text-success" />
            ) : (
              <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" className="text-warning" />
            )}
            <span>ruff check (จำลอง)</span>
          </h4>
          {report.lint.length === 0 ? (
            <p className="text-sm text-muted">All checks passed — ไม่มี lint error</p>
          ) : (
            <ul className="mt-1 space-y-1 text-sm">
              {report.lint.map((issue, i) => (
                <li key={i}>
                  <span className="mono-label font-semibold">{issue.code}</span> {issue.message}
                  {issue.line ? <span className="text-muted"> (บรรทัด {issue.line})</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        {report.probes.length > 0 ? (
          <details className="why border-l-2 border-hair pl-4" open={report.status === "passed" && !report.mastered}>
            <summary className="font-medium">
              <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" className="chev shrink-0" />
              Edge-case check ({report.probes.filter((p) => p.passed).length}/{report.probes.length})
            </summary>
            <ul className="space-y-1 pb-3 text-sm">
              {report.probes.map((probe) => (
                <li key={probe.label}>
                  <span aria-hidden="true" className={probe.passed ? "text-success" : "text-danger"}>
                    {probe.passed ? "✓" : "✕"}
                  </span>{" "}
                  <span className="sr-only">{probe.passed ? "ผ่าน" : "ไม่ผ่าน"}: </span>
                  {probe.label}
                  {probe.detail ? <span className="block pl-5 text-muted">{probe.detail}</span> : null}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>

      {report.status === "passed" ? (
        <p className="mt-3 text-sm">
          {report.mastered ? (
            <strong className="text-success">
              <span aria-hidden="true">★</span> Mastery (จากตัวจำลอง): ผ่านเทสต์ + edge cases + lint สะอาด
            </strong>
          ) : (
            <span className="text-muted">เทสต์ผ่านแล้ว — เพื่อ ★ Mastery ให้แก้ lint/edge case ที่เหลือด้านบน</span>
          )}
        </p>
      ) : null}
      <p className="mt-3 border-l-2 border-hair pl-4 text-sm text-muted">
        <strong className="text-ink">ข้อจำกัดของตัวตรวจ:</strong>{" "}
        <RichText
          text="ตัวตรวจนี้ไม่ได้รัน Python — เพียงอ่านโค้ดของคุณเป็นรูปแบบที่รู้จักแล้วจำลอง `test_day1.py` ในเบราว์เซอร์ โค้ดที่เขียนต่างจากรูปแบบปกติอาจอ่านผิดหรือถูกปฏิเสธว่า “ยืนยันไม่ได้” ผลจริงต้องยืนยันด้วย `uv run pytest -q` บนเครื่อง"
          allowTerms={false}
        />
      </p>
    </div>
  );
}

/* ---------------------------------- hints --------------------------------- */

function HintLadder({
  hints,
  revealed,
  attempts,
  gatePrompt,
  onUnlockAttempt,
  onReveal,
  onInsert,
}: {
  hints: Hint[];
  revealed: number;
  attempts: number;
  gatePrompt: string;
  onUnlockAttempt?: () => void;
  onReveal: (level: number) => void;
  onInsert: (code: string) => void;
}) {
  const next = hints.find((h) => h.level === revealed + 1);
  const gated = next?.level === 3 && attempts < 1;
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="mt-6 border-t border-hair pt-5">
      <h3 id={headingId} className="font-semibold">
        คำใบ้ 3 ระดับ{" "}
        <span className="font-normal text-muted tabular-nums">
          (เปิดแล้ว {revealed}/{hints.length})
        </span>
      </h3>
      <p className="text-sm text-muted">เปิดทีละระดับ — พยายามเองก่อนทุกครั้ง; ระดับ 3 จะเพิ่มบทเรียนนี้เข้าคิวทบทวน</p>

      <ol className="mt-3 space-y-3">
        {hints
          .filter((h) => h.level <= revealed)
          .map((hint) => (
            <li key={hint.level} className="border-l-2 border-line pl-4">
              <h4 className="flex items-center gap-1.5 font-semibold">
                <Lightbulb size={16} strokeWidth={1.75} aria-hidden="true" className="text-brand-ink" />
                <span>{hint.title}</span>
              </h4>
              <p className="mt-1">
                <RichText text={hint.body} />
              </p>
              {hint.code ? (
                <>
                  <CodeBlock sample={hint.code} />
                  <button type="button" className="btn btn-sm" onClick={() => onInsert(hint.code!.code)}>
                    วางโค้ดนี้ในตัวแก้ไข (ย้อนกลับได้)
                  </button>
                </>
              ) : null}
            </li>
          ))}
      </ol>

      {next ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-quiet" disabled={gated} aria-describedby={gated ? `${headingId}-gate` : undefined} onClick={() => onReveal(next.level)}>
            <Unlock size={15} strokeWidth={1.75} aria-hidden="true" /> เปิดคำใบ้ระดับ {next.level}
          </button>
          {gated && onUnlockAttempt ? (
            <button type="button" className="btn btn-sm btn-quiet" onClick={onUnlockAttempt}>
              ลองคิดเองแล้ว — ปลดล็อกระดับ 3
            </button>
          ) : null}
          {gated ? (
            <p id={`${headingId}-gate`} className="mt-1 w-full text-sm text-muted">
              {gatePrompt}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">เปิดคำใบ้ครบแล้ว — ลองเติมขั้นสุดท้ายด้วยตัวเอง</p>
      )}
    </section>
  );
}
