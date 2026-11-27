"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { LibraryEntry } from "@/content";
import { PHASE_COVERS } from "@/content/lessons/builder";
import type { RoadmapPhase } from "@/content/types";
import { assetPath } from "@/lib/assetPath";
import type { BookState } from "@/lib/bookState";
import { useReducedMotion } from "@/lib/store";
import { ArrowLeft, ArrowRight, PhaseGlyph } from "../Icons";
import { Book } from "./Book";

/** Group a phase's entries by curriculum block (four days = one short shelf row). */
function byBlock(entries: LibraryEntry[]): Array<{ block: string; entries: LibraryEntry[] }> {
  const groups: Array<{ block: string; entries: LibraryEntry[] }> = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.block === entry.block) last.entries.push(entry);
    else groups.push({ block: entry.block, entries: [entry] });
  }
  return groups;
}

/**
 * One phase = one shelf. Default view is a single horizontally scrollable row with explicit
 * previous/next buttons; "แสดงทั้งชั้น" lays the same books out as block rows with no scrolling.
 */
export function Shelf({
  phase,
  entries,
  totalInPhase,
  stateOf,
  forceWrap = false,
}: {
  phase: RoadmapPhase;
  entries: LibraryEntry[];
  totalInPhase: number;
  stateOf: (entry: LibraryEntry) => BookState;
  forceWrap?: boolean;
}) {
  const headingId = useId();
  const rowId = useId();
  const rowRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 1;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(measure);
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure, expanded, entries.length]);

  const page = (direction: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.85, 120), behavior: reduced ? "auto" : "smooth" });
  };

  const authored = entries.filter((entry) => entry.authored).length;
  const completed = entries.filter((entry) => stateOf(entry) === "completed").length;
  const range = `Day ${phase.from}–${phase.to}`;
  const coverSrc = PHASE_COVERS[phase.index] ? assetPath(PHASE_COVERS[phase.index]) : undefined;
  const isWrapped = forceWrap || expanded;

  return (
    <section id={`phase-${phase.index}`} aria-labelledby={headingId} className="scroll-mt-24">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 items-center gap-4">
          {coverSrc ? (
            <div className="editorial-cover hidden h-16 w-28 shrink-0 sm:block">
              <Image
                src={coverSrc}
                alt={`ภาพประกอบ Phase ${phase.index}: ${phase.title}`}
                width={224}
                height={126}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="eyebrow flex items-center gap-1.5">
              <PhaseGlyph phase={phase.index} size={14} className="text-brand-ink" />
              <span>
                Phase {phase.index} · {range}
              </span>
            </p>
            <h2 id={headingId} className="mt-0.5 text-xl font-bold leading-snug">
              {phase.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {phase.focus} · บทเรียนเต็ม {authored}/{totalInPhase}
              {completed > 0 ? ` · เรียนจบ ${completed}` : ""}
            </p>
          </div>
        </div>

        {forceWrap ? null : (
          <div className="flex items-center gap-1.5">
            {isWrapped ? null : (
              <>
                <button
                  type="button"
                  className="btn btn-quiet min-w-11 px-0"
                  aria-label={`เลื่อนชั้น Phase ${phase.index} ไปทางซ้าย`}
                  aria-controls={rowId}
                  aria-disabled={edge.start}
                  onClick={() => !edge.start && page(-1)}
                >
                  <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-quiet min-w-11 px-0"
                  aria-label={`เลื่อนชั้น Phase ${phase.index} ไปทางขวา`}
                  aria-controls={rowId}
                  aria-disabled={edge.end}
                  onClick={() => !edge.end && page(1)}
                >
                  <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </>
            )}
            <button type="button" className="btn btn-quiet" aria-expanded={expanded} aria-controls={rowId} onClick={() => setExpanded((v) => !v)}>
              {expanded ? "ย่อเป็นแถวเดียว" : "แสดงทั้งชั้น"}
            </button>
          </div>
        )}
      </header>

      {forceWrap ? (
        <ul id={rowId} className="shelf-row shelf-row-wrap mt-4" aria-label={`บทเรียนเต็มใน Phase ${phase.index}: ${phase.title}`}>
          {entries.map((entry) => (
            <li key={entry.id}>
              <Book entry={entry} state={stateOf(entry)} />
            </li>
          ))}
        </ul>
      ) : expanded ? (
        <div id={rowId} className="mt-4 space-y-3">
          {byBlock(entries).map((group) => (
            <div key={group.block}>
              <p className="mono-label text-xs text-muted">
                {group.block} · Day {group.entries[0].day}–{group.entries[group.entries.length - 1].day}
              </p>
              <ul className="shelf-row shelf-row-wrap" aria-label={`${group.block} วันที่ ${group.entries[0].day}–${group.entries[group.entries.length - 1].day}`}>
                {group.entries.map((entry) => (
                  <li key={entry.id}>
                    <Book entry={entry} state={stateOf(entry)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul id={rowId} ref={rowRef} className="shelf-row mt-4" aria-label={`ชั้น Phase ${phase.index}: ${phase.title} (${range})`}>
          {entries.map((entry) => (
            <li key={entry.id}>
              <Book entry={entry} state={stateOf(entry)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
