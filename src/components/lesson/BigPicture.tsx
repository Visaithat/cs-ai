"use client";

import { useState, type KeyboardEvent } from "react";
import type { Lesson } from "@/content/types";
import { assetPath } from "@/lib/assetPath";
import { useReducedMotion } from "@/lib/store";
import { ArrowLeft, ArrowRight } from "../Icons";
import { RichText } from "../RichText";

/** Geometry of the provided assets/ai-loop.svg (viewBox 0 0 720 220). */
const NODES = [
  { name: "Problem", x: 18, w: 100 },
  { name: "Data", x: 172, w: 66 },
  { name: "Model", x: 292, w: 66 },
  { name: "Evaluation", x: 412, w: 66 },
  { name: "App", x: 532, w: 66 },
  { name: "Monitor", x: 652, w: 66 },
];
const NODE_Y = 70;
const NODE_H = 80;
const ARC = "M685 145c0 55-635 55-635 0";

export function BigPicture({ lesson }: { lesson: Lesson }) {
  const { steps, alt, caption } = lesson.bigPicture;
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const current = steps[step];
  const last = steps.length - 1;
  const full = showAll || step === last;

  // Everything right of the revealed node, and the return arc, stays veiled until it is reached.
  const revealedEdge = current.node <= 5 ? NODES[current.node].x + NODES[current.node].w : 720;
  const lessonNote = current.lessonNote ?? current.day1;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setStep((s) => Math.min(last, s + 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setStep((s) => Math.max(0, s - 1));
    }
  }

  return (
    <div className="space-y-4">
      <figure className="m-0">
        <div className="scroll-x rounded-2xl border border-hair" role="region" aria-label="แผนภาพวงจรวิศวกรรม AI (เลื่อนแนวนอนได้)" tabIndex={0}>
          <div className="relative" style={{ aspectRatio: "720 / 220", minWidth: 640, background: "var(--plate)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- provided SVG asset, no optimisation needed */}
            <img src={assetPath("/assets/ai-loop.svg")} alt={alt} className="absolute inset-0 h-full w-full" />
            <svg viewBox="0 0 720 220" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
              <rect className="veil" x={revealedEdge + 2} y="0" width={720 - revealedEdge} height="220" style={{ opacity: full ? 0 : 0.94 }} />
              <rect className="veil" x="0" y="152" width={revealedEdge + 2} height="68" style={{ opacity: full ? 0 : 0.94 }} />
              {current.node <= 5 && !showAll ? (
                <>
                  <rect
                    x={NODES[current.node].x - 4}
                    y={NODE_Y - 4}
                    width={NODES[current.node].w + 8}
                    height={NODE_H + 8}
                    rx="19"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3.5"
                    className={reduced ? undefined : "svg-pulse"}
                  />
                  {current.node > 0 ? (
                    <line
                      x1={NODES[current.node - 1].x + NODES[current.node - 1].w + 4}
                      y1="110"
                      x2={NODES[current.node].x - 6}
                      y2="110"
                      stroke="#0891b2"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className={reduced ? undefined : "svg-flow-line"}
                    />
                  ) : null}
                </>
              ) : null}
              {current.node === 6 && !showAll ? (
                <path
                  d={ARC}
                  fill="none"
                  stroke="#0891b2"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.85"
                  className={reduced ? undefined : "svg-flow-line"}
                />
              ) : null}
            </svg>
          </div>
        </div>
        <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>
      </figure>

      <div role="group" aria-label="ควบคุมแผนภาพ" onKeyDown={onKeyDown} className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-quiet" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" /> ก่อนหน้า
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setStep((s) => Math.min(last, s + 1))} disabled={step === last}>
          ขั้นถัดไป <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <span className="text-sm text-muted tabular-nums" aria-hidden="true">
          ขั้น {step + 1} / {steps.length}
        </span>
        <label className="ml-auto inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} className="h-5 w-5 accent-[color:var(--brand)]" />
          แสดงวงจรทั้งหมด
        </label>
      </div>

      <ol className="flex flex-wrap gap-1.5" aria-label="ขั้นตอนของวงจร">
        {steps.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full border px-3 text-sm sm:min-h-9 sm:pointer-coarse:min-h-11 ${
                i === step ? "border-brand bg-brand-soft/40 font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <span className="tabular-nums">{i + 1}</span>
              <span className="ml-1.5">{s.title.split(" — ")[0]}</span>
            </button>
          </li>
        ))}
      </ol>

      <div role="status" aria-live="polite" className="card p-5">
        <h3 className="font-semibold">{current.title}</h3>
        <p className="mt-1.5">
          <RichText text={current.body} />
        </p>
        {lessonNote ? (
          <p className="mt-3 border-l-[3px] border-brand pl-3 text-[0.9375rem]">
            <span className="eyebrow mr-2 inline font-semibold text-brand-ink">Day {lesson.day} อยู่ตรงนี้</span>
            <RichText text={lessonNote} />
          </p>
        ) : null}
      </div>
    </div>
  );
}
