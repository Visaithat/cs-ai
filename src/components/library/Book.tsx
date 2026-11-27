import Link from "next/link";
import { KIND_LABEL, LESSON_META, type LibraryEntry } from "@/content/catalog";
import { BOOK_STATE_LABEL, type BookState } from "@/lib/bookState";
import { BookOpen, Check, CircleDashed, LessonGlyph, Sparkles } from "../Icons";

function StateGlyph({ state }: { state: BookState }) {
  if (state === "completed") return <Check size={13} strokeWidth={2.2} aria-hidden="true" />;
  if (state === "in-progress") return <BookOpen size={13} strokeWidth={1.9} aria-hidden="true" />;
  if (state === "ready") return <Sparkles size={13} strokeWidth={1.9} aria-hidden="true" />;
  return <CircleDashed size={13} strokeWidth={1.75} aria-hidden="true" />;
}

/**
 * One book on the shelf. A plain link: every day opens immediately, the state is only a marker
 * (icon + text, never colour alone).
 */
export function Book({ entry, state }: { entry: LibraryEntry; state: BookState }) {
  const label = BOOK_STATE_LABEL[state];
  const lesson = LESSON_META[entry.id];

  return (
    <Link href={entry.href} prefetch={false} className="book" data-state={state} data-kind={entry.kind}>
      <span className="book-head justify-between">
        <span className="flex items-baseline gap-1.5">
          <span className="book-day-label">Day</span>
          <span className="book-day">{entry.day}</span>
        </span>
        {lesson?.icon ? (
          <LessonGlyph icon={lesson.icon} size={15} className="shrink-0 text-brand-ink/80" />
        ) : null}
      </span>
      {entry.kind !== "lesson" ? <span className="book-kind">{KIND_LABEL[entry.kind]}</span> : null}
      <span className="book-title" aria-hidden="true">
        {entry.shortTitle}
      </span>
      <span className="sr-only">{entry.title}. </span>
      <span className="book-state flex items-center gap-1.5">
        <StateGlyph state={state} />
        <span>{label.text}</span>
      </span>
    </Link>
  );
}
