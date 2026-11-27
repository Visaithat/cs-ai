"use client";

import { useRef, useState } from "react";
import { tokenize } from "@/lib/highlight";
import type { CodeSample } from "@/content/types";

export function CodeBlock({ sample, className = "" }: { sample: CodeSample; className?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const label = sample.filename ?? sample.language;

  async function copy() {
    try {
      await navigator.clipboard.writeText(sample.code);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2200);
  }

  const tokens = tokenize(sample.code.replace(/\n$/, ""), sample.language);

  return (
    <figure className={`my-4 ${className}`}>
      <div className="code-block overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-1">
          <span className="mono-label text-muted">{label}</span>
          <button type="button" className="btn btn-sm" onClick={copy} title={`คัดลอกโค้ด ${label}`}>
            <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {status === "copied" ? <path d="M3 8.5l3.2 3L13 4.5" /> : <path d="M5.5 5.5h7v8h-7zM3.5 10.5v-8h7" />}
            </svg>
            {status === "copied" ? "คัดลอกแล้ว" : status === "failed" ? "คัดลอกไม่ได้" : "คัดลอก"}
          </button>
        </div>
        <div className="scroll-x" role="group" aria-label={`โค้ด ${label} (เลื่อนแนวนอนได้)`} tabIndex={0}>
          <pre className="m-0 min-w-max px-4 py-3">
            <code>
              {tokens.map((t, i) =>
                t.kind === "plain" ? (
                  <span key={i}>{t.text}</span>
                ) : (
                  <span key={i} className={`tok-${t.kind}`}>
                    {t.text}
                  </span>
                ),
              )}
            </code>
          </pre>
        </div>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? "คัดลอกโค้ดแล้ว" : ""}
      </span>
      {sample.caption ? <figcaption className="mt-2 text-sm text-muted">{sample.caption}</figcaption> : null}
    </figure>
  );
}
