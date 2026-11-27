"use client";

import { useId, useMemo, useState } from "react";
import type { Lesson } from "@/content/types";
import { setExampleStep } from "@/lib/actions";
import { getLesson as getProgress } from "@/lib/progress";
import { formatErrors, TICKET_CLASSIFICATION, validatePayload } from "@/lib/pyschema";
import { useAppState, useHydrated } from "@/lib/store";
import { Callout } from "../Callout";
import { CodeBlock } from "../CodeBlock";
import { ArrowRight, Check, Play } from "../Icons";
import { RichText } from "../RichText";

export function WorkedExample({ lesson }: { lesson: Lesson }) {
  const state = useAppState();
  const hydrated = useHydrated();
  const progress = getProgress(state, lesson.id);
  const steps = lesson.workedExample.steps;
  const reached = hydrated ? Math.min(progress.exampleStep, steps.length - 1) : 0;
  const finished = reached >= steps.length - 1;

  return (
    <div>
      <p>
        <RichText text={lesson.workedExample.intro} />
      </p>

      <ol className="mt-5 space-y-0" aria-label="ไทม์ไลน์ตัวอย่าง">
        {steps.slice(0, reached + 1).map((step, index) => (
          <li key={step.title} className="relative border-l border-line pb-6 pl-6 last:pb-0" aria-current={index === reached && !finished ? "step" : undefined}>
            <span
              className="absolute -left-[11px] top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand bg-surface text-[0.625rem] font-bold text-brand-ink"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <h3 className="text-base font-semibold leading-snug">{step.title}</h3>
            <p className="mt-1">
              <RichText text={step.explain} />
            </p>
            <CodeBlock sample={step.code} />
            {step.output ? (
              <figure className="m-0">
                <figcaption className="eyebrow">Expected output</figcaption>
                <pre className="code-block mt-1 overflow-x-auto px-4 py-3" tabIndex={0} aria-label="ผลลัพธ์ที่คาดหวัง">
                  <code>{step.output}</code>
                </pre>
              </figure>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!finished ? (
          <>
            <button type="button" className="btn btn-primary" onClick={() => setExampleStep(lesson.id, reached + 1)}>
              ขั้นต่อไป <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setExampleStep(lesson.id, steps.length - 1)}>
              แสดงทั้งหมด
            </button>
          </>
        ) : (
          <p className="inline-flex items-center gap-1.5 text-sm text-success" role="status">
            <Check size={15} strokeWidth={2.2} aria-hidden="true" /> ดูครบทุกขั้นแล้ว
          </p>
        )}
        <span className="text-sm text-muted tabular-nums">
          ขั้น {reached + 1} / {steps.length}
        </span>
      </div>

      {finished ? (
        <Callout tone="warning" title="จุดสังเกตสำคัญ">
          <RichText text={lesson.workedExample.gotcha} />
        </Callout>
      ) : null}
    </div>
  );
}

/* ------------------------------- payload lab ------------------------------ */

export function PayloadLab({ lesson }: { lesson: Lesson }) {
  const { presets, intro } = lesson.payloadLab;
  const [presetId, setPresetId] = useState(presets[0].id);
  const [text, setText] = useState(() => JSON.stringify(presets[0].payload, null, 2));
  const [checked, setChecked] = useState<string | null>(null);
  const textId = useId();
  const noteId = useId();
  const preset = presets.find((p) => p.id === presetId) ?? presets[0];

  const outcome = useMemo(() => {
    if (checked === null) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(checked);
    } catch (error) {
      return { kind: "json" as const, message: error instanceof Error ? error.message : "Invalid JSON" };
    }
    const result = validatePayload(TICKET_CLASSIFICATION, parsed);
    return result.ok ? { kind: "ok" as const, json: result.json } : { kind: "errors" as const, text: formatErrors(result.errors), count: result.errors.length };
  }, [checked]);

  function choose(id: string) {
    const next = presets.find((p) => p.id === id);
    if (!next) return;
    setPresetId(id);
    setText(JSON.stringify(next.payload, null, 2));
    setChecked(JSON.stringify(next.payload));
  }

  return (
    <div className="card p-5">
      <p>
        <RichText text={intro} />
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6">
        <div>
          <fieldset>
            <legend className="eyebrow">ตัวอย่าง payload</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button key={p.id} type="button" className="btn btn-sm h-auto max-w-full whitespace-normal text-left" aria-pressed={p.id === presetId} onClick={() => choose(p.id)} style={p.id === presetId ? { borderColor: "var(--brand)", background: "var(--surface-2)", fontWeight: 700 } : undefined}>
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>
          <p id={noteId} className="mt-2 text-sm text-muted">
            {preset.note}
          </p>

          <label htmlFor={textId} className="eyebrow mt-4 block">
            payload (JSON — แก้ไขได้)
          </label>
          <textarea
            id={textId}
            className="editor mt-1"
            style={{ minHeight: "11rem" }}
            value={text}
            onChange={(event) => setText(event.target.value)}
            spellCheck={false}
            aria-describedby={noteId}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") setChecked(text);
            }}
          />
          <button type="button" className="btn btn-primary mt-3" onClick={() => setChecked(text)}>
            ตรวจ payload <Play size={15} strokeWidth={1.85} aria-hidden="true" />
          </button>
        </div>

        <div role="status" aria-live="polite" aria-atomic="true">
          <h3 className="eyebrow">ผลจาก TicketClassification.model_validate(...)</h3>
          {outcome === null ? (
            <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-muted">กด “ตรวจ payload” หรือเลือกตัวอย่างเพื่อดูผล</p>
          ) : outcome.kind === "json" ? (
            <Callout tone="danger" title="JSON ไม่ถูกต้อง">
              <code className="inline-code">{outcome.message}</code> — ตรวจเครื่องหมาย {'"'} และ , ให้ครบ
            </Callout>
          ) : outcome.kind === "ok" ? (
            <div>
              <Callout tone="success" title="VALID — ผ่านการตรวจ">
                payload ผ่านทุกกฎ และถูกแปลง/ทำความสะอาดเป็นผลลัพธ์ด้านล่าง
              </Callout>
              <pre className="code-block overflow-x-auto px-4 py-3" tabIndex={0} aria-label="JSON ที่ผ่านการตรวจ">
                <code>{`VALID: ${outcome.json}`}</code>
              </pre>
            </div>
          ) : (
            <div>
              <Callout tone="danger" title={`INVALID — พบ ${outcome.count} ข้อผิดพลาด`}>
                โค้ดฝั่งเราจับ <code className="inline-code">ValidationError</code> แล้วทำ retry/fallback ได้
              </Callout>
              <pre className="code-block overflow-x-auto px-4 py-3" tabIndex={0} aria-label="รายการข้อผิดพลาด">
                <code>{outcome.text}</code>
              </pre>
            </div>
          )}
          <p className="mt-3 text-xs text-muted">
            <RichText text="จำลองพฤติกรรม Pydantic v2 (lax mode) ในเบราว์เซอร์ — ตรวจเทียบกับผลจริงของ `exercises/d001/worked_example.py` แล้ว" allowTerms={false} />
          </p>
        </div>
      </div>
    </div>
  );
}
