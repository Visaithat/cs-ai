"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { GLOSSARY } from "@/content/glossary";
import { LESSON_META } from "@/content/catalog";
import { toggleGlossaryReview } from "@/lib/actions";
import { useAppState } from "@/lib/store";
import { CodeBlock } from "./CodeBlock";
import { Sheet } from "./Sheet";

interface GlossaryContextValue {
  open: (termId: string) => void;
  openIndex: (termIds: string[]) => void;
}

const GlossaryContext = createContext<GlossaryContextValue | null>(null);

export function useGlossary(): GlossaryContextValue {
  const ctx = useContext(GlossaryContext);
  if (!ctx) throw new Error("useGlossary must be used inside <GlossaryProvider>");
  return ctx;
}

/** Renders the glossary sheets once for the whole app. */
export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [termId, setTermIdState] = useState<string | null>(null);
  const [indexIds, setIndexIdsState] = useState<string[] | null>(null);
  // Mirrors of the state above for event callbacks that must not see a stale render.
  const termRef = useRef<string | null>(null);
  const indexRef = useRef<string[] | null>(null);
  // The control that opened the first sheet; focus returns here when the last sheet closes.
  const openerRef = useRef<HTMLElement | null>(null);

  const setTermId = useCallback((id: string | null) => {
    termRef.current = id;
    setTermIdState(id);
  }, []);
  const setIndexIds = useCallback((ids: string[] | null) => {
    indexRef.current = ids;
    setIndexIdsState(ids);
  }, []);

  const rememberOpener = useCallback(() => {
    if (termRef.current !== null || indexRef.current !== null) return; // already open: keep the original opener
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
  }, []);

  /**
   * The native dialog sends focus back to the element focused before `showModal()`. When the index
   * sheet hands over to the term sheet, that element lives inside a now-closed dialog, so focus
   * would fall to <body>. Put it back on the original opener once no sheet remains open.
   */
  const restoreFocus = useCallback(() => {
    if (termRef.current !== null || indexRef.current !== null) return;
    const opener = openerRef.current;
    if (!opener) return;
    const active = document.activeElement;
    // Focus is still inside a dialog that is open (a close handler ran before the dialog actually
    // closed). Keep the opener: the dialog's native `close` event calls this again afterwards.
    if (active?.closest("dialog[open]")) return;
    openerRef.current = null;
    if (!opener.isConnected) return;
    if (!active || active === document.body || !active.isConnected || active.closest("dialog:not([open])")) opener.focus();
  }, []);

  const open = useCallback(
    (id: string) => {
      rememberOpener();
      setTermId(id);
    },
    [rememberOpener, setTermId],
  );
  const openIndex = useCallback(
    (ids: string[]) => {
      rememberOpener();
      setIndexIds(ids);
    },
    [rememberOpener, setIndexIds],
  );

  const value = useMemo(() => ({ open, openIndex }), [open, openIndex]);
  const term = termId ? GLOSSARY[termId] : undefined;

  return (
    <GlossaryContext.Provider value={value}>
      {children}
      <TermSheet
        termId={term ? termId : null}
        onClose={() => {
          setTermId(null);
          restoreFocus();
        }}
      />
      <IndexSheet
        ids={indexIds}
        onClose={() => {
          setIndexIds(null);
          restoreFocus();
        }}
        onPick={(id) => {
          // hand over to the term sheet; `termRef` is set first so the index close does not restore focus
          setTermId(id);
          setIndexIds(null);
        }}
      />
    </GlossaryContext.Provider>
  );
}

/* ------------------------------ inline term ------------------------------ */

export function GlossaryTerm({ id, children }: { id: string; children?: ReactNode }) {
  const term = GLOSSARY[id];
  const { open } = useGlossary();
  const ref = useRef<HTMLButtonElement>(null);
  const popoverId = useId();
  const descId = useId();
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const show = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    const below = rect.bottom + 8;
    const top = below + 110 > window.innerHeight ? Math.max(12, rect.top - 8 - 110) : below;
    setPos({ left, top });
  }, []);
  const hide = useCallback(() => setPos(null), []);

  if (!term) return <>{children ?? id}</>;

  return (
    <>
      <button
        ref={ref}
        type="button"
        className="term-btn"
        aria-haspopup="dialog"
        aria-describedby={descId}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(event) => {
          if (event.key === "Escape" && pos) {
            // dismiss the popover without leaving the control (WCAG 1.4.13)
            event.stopPropagation();
            hide();
          }
        }}
        onClick={() => {
          hide();
          open(id);
        }}
      >
        {children ?? term.term}
      </button>
      <span id={descId} className="sr-only">
        {`${term.thai}: ${term.short} กด Enter เพื่อเปิดคำอธิบายเต็ม`}
      </span>
      {pos ? (
        <span id={popoverId} aria-hidden="true" className="popover" style={{ left: pos.left, top: pos.top }}>
          <strong className="block text-[0.8125rem]">
            {term.term} <span className="font-normal text-muted">· {term.thai}</span>
          </strong>
          {term.short}
        </span>
      ) : null}
    </>
  );
}

/* ------------------------------- term sheet ------------------------------ */

function TermSheet({ termId, onClose }: { termId: string | null; onClose: () => void }) {
  const state = useAppState();
  const titleId = useId();
  const term = termId ? GLOSSARY[termId] : null;
  const marked = term ? state.review.some((item) => item.id === `gl-${term.id}`) : false;

  return (
    <Sheet
      open={Boolean(term)}
      onClose={onClose}
      side
      titleId={titleId}
      title={term ? `${term.term} — ${term.thai}` : "Glossary"}
      footer={
        term ? (
          <button
            type="button"
            className={`btn w-full ${marked ? "btn-primary" : ""}`}
            onClick={() => toggleGlossaryReview(term.id)}
          >
            <span aria-hidden="true">{marked ? "✓" : "＋"}</span>
            {marked ? "อยู่ในคิวทบทวนแล้ว (กดเพื่อนำออก)" : "ทำเครื่องหมายเพื่อทบทวน"}
          </button>
        ) : null
      }
    >
      {term ? (
        <div className="space-y-5">
          <section aria-labelledby={`${titleId}-plain`}>
            <h3 id={`${titleId}-plain`} className="eyebrow">
              อธิบายแบบเข้าใจง่าย
            </h3>
            <p className="mt-1">{term.plain}</p>
          </section>
          <section aria-labelledby={`${titleId}-analogy`} className="rounded-xl border border-line bg-surface2 p-3">
            <h3 id={`${titleId}-analogy`} className="eyebrow">
              เปรียบเทียบ
            </h3>
            <p className="mt-1">{term.analogy}</p>
          </section>
          {term.example ? (
            <section aria-labelledby={`${titleId}-example`}>
              <h3 id={`${titleId}-example`} className="eyebrow">
                ตัวอย่าง
              </h3>
              <CodeBlock sample={{ language: term.example.language, code: term.example.code }} />
            </section>
          ) : null}
          <section aria-labelledby={`${titleId}-related`}>
            <h3 id={`${titleId}-related`} className="eyebrow">
              บทที่เกี่ยวข้อง
            </h3>
            <ul className="mt-1 space-y-1">
              {term.related.map((rel) => {
                const available = rel.lessonId && LESSON_META[rel.lessonId];
                return (
                  <li key={rel.label}>
                    {available ? (
                      <Link href={`/lesson/${rel.lessonId}`} className="text-brand-ink underline underline-offset-4" onClick={onClose}>
                        {rel.label}
                      </Link>
                    ) : (
                      <span>
                        {rel.label} <span className="chip ml-1">เร็ว ๆ นี้</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      ) : null}
    </Sheet>
  );
}

/* ------------------------------ glossary index --------------------------- */

function IndexSheet({ ids, onClose, onPick }: { ids: string[] | null; onClose: () => void; onPick: (id: string) => void }) {
  const titleId = useId();
  const inputId = useId();
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (ids ?? [])
      .map((id) => GLOSSARY[id])
      .filter(Boolean)
      .filter((t) => !q || `${t.term} ${t.thai} ${t.short}`.toLowerCase().includes(q))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [ids, query]);

  return (
    <Sheet open={ids !== null} onClose={onClose} side titleId={titleId} title="คลังศัพท์ (Glossary)">
      <label htmlFor={inputId} className="eyebrow block">
        ค้นหาศัพท์
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="เช่น pydantic, lock, top_k"
        className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
        autoComplete="off"
      />
      <p className="mt-2 text-sm text-muted" role="status" aria-live="polite">
        พบ {list.length} คำ
      </p>
      <ul className="mt-2 space-y-2">
        {list.map((t) => (
          <li key={t.id}>
            <button type="button" className="card-link w-full p-3 text-left" onClick={() => onPick(t.id)}>
              <span className="block font-semibold">
                {t.term} <span className="font-normal text-muted">· {t.thai}</span>
              </span>
              <span className="block text-sm text-muted">{t.short}</span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
