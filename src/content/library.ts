/**
 * Library catalogue: one entry per curriculum day (1–180), derived from `schedule.ts`.
 *
 * Pure data + pure functions, no UI and no React. Nothing here gates access: every entry has a
 * stable `/lesson/dNNN` href and is openable in any order. `authored` only says whether a full
 * lesson exists in `LESSONS`; otherwise the route renders a metadata-based preview.
 */
import { PHASES, SCHEDULE_BLOCKS, TOTAL_DAYS, type ReviewKind } from "./schedule";

export type DayKind = "lesson" | ReviewKind;

export interface LibraryEntry {
  day: number;
  /** stable lesson id, `d001` … `d180` */
  id: string;
  /** stable route, `/lesson/d001` … `/lesson/d180` */
  href: string;
  phase: number;
  /** curriculum block, `B01` … `B45` */
  block: string;
  kind: DayKind;
  /** full English curriculum title (review days carry their kind prefix) */
  title: string;
  /** short topic used on the book spine */
  shortTitle: string;
  tools: string[];
  minutes: number;
  /** true when a full authored lesson exists for this day */
  authored: boolean;
  /** days it is recommended (never required) to look at first */
  recommended: number[];
  /** review days only: the study days of the block it revisits */
  reviews: number[];
  exercise: { status: "available" | "planned"; title?: string };
  prev: number | null;
  next: number | null;
}

export const KIND_LABEL: Record<DayKind, string> = {
  lesson: "บทเรียน",
  review: "Review",
  checkpoint: "Checkpoint",
  milestone: "Milestone",
  final: "Final Defense",
};

const ID_RE = /^d(\d{3})$/;

export function lessonIdForDay(day: number): string {
  return `d${String(day).padStart(3, "0")}`;
}

/** `d007` → 7; anything else (wrong shape, 0, > 180) → null. */
export function parseLessonId(id: string): number | null {
  const match = ID_RE.exec(id);
  if (!match) return null;
  const day = Number(match[1]);
  return day >= 1 && day <= TOTAL_DAYS ? day : null;
}

/** Short topic for a spine: kind prefix, "Quiz +" and parenthetical detail removed, then clipped at a word. */
export function shortTitle(title: string, max = 60): string {
  let t = title.replace(/^(Review|Checkpoint|Final Defense|Milestone \d+):\s*/, "").replace(/^Quiz \+\s*/, "");
  const plain = t.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  if (plain.length >= 8) t = plain;
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 20 ? space : max).replace(/[\s,&+:/-]+$/, "")}…`;
}

function fullTitle(kind: DayKind, title: string): string {
  if (kind === "review") return `Review: ${title}`;
  if (kind === "checkpoint") return `Checkpoint: ${title}`;
  return title;
}

function phaseOf(day: number): number {
  const phase = PHASES.find((p) => day >= p.from && day <= p.to);
  if (!phase) throw new Error(`Day ${day} is outside every phase`);
  return phase.index;
}

/** Build the 180-entry catalogue. `authoredIds` is the set of lesson ids that have full content. */
export function buildLibrary(authoredIds: ReadonlySet<string>): LibraryEntry[] {
  const entries: LibraryEntry[] = [];

  for (const block of SCHEDULE_BLOCKS) {
    const studyDays = [block.from, block.from + 1, block.from + 2];
    const reviewDay = block.from + 3;

    const add = (day: number, kind: DayKind, title: string, extra: Pick<LibraryEntry, "recommended" | "reviews" | "exercise">) => {
      const id = lessonIdForDay(day);
      const authored = authoredIds.has(id);
      entries.push({
        day,
        id,
        href: `/lesson/${id}`,
        phase: phaseOf(day),
        block: block.id,
        kind,
        title: fullTitle(kind, title),
        shortTitle: shortTitle(title),
        tools: block.tools,
        minutes: 30,
        authored,
        recommended: extra.recommended,
        reviews: extra.reviews,
        exercise: authored ? { status: "available", title: extra.exercise.title } : extra.exercise,
        prev: day > 1 ? day - 1 : null,
        next: day < TOTAL_DAYS ? day + 1 : null,
      });
    };

    studyDays.forEach((day, index) => {
      // Recommended (never required): earlier days of the block, or the previous block's closing day.
      const recommended = index > 0 ? studyDays.slice(0, index) : day > 1 ? [day - 1] : [];
      add(day, "lesson", block.days[index], { recommended, reviews: [], exercise: { status: "planned" } });
    });

    add(reviewDay, block.review.kind, block.review.title, {
      recommended: studyDays,
      reviews: studyDays,
      exercise: { status: "planned", title: block.review.title.replace(/^Quiz \+\s*/, "") },
    });
  }

  return entries.sort((a, b) => a.day - b.day);
}

/** Entries of one phase, in day order (a "shelf"). */
export function entriesForPhase(library: readonly LibraryEntry[], phase: number): LibraryEntry[] {
  return library.filter((entry) => entry.phase === phase);
}
