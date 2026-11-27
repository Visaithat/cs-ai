import Link from "next/link";
import { getLibraryEntry, type LibraryEntry } from "@/content";
import { ArrowLeft, ArrowRight, Library } from "../Icons";

const LINK = "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-muted hover:text-ink";

/**
 * Non-linear lesson navigation shared by full lessons and previews: back to the shelf, plus the
 * neighbouring days. Neighbours are suggestions, never a required order.
 */
export function DayCrumb({ entry }: { entry: LibraryEntry }) {
  const prev = entry.prev ? getLibraryEntry(entry.prev) : undefined;
  const next = entry.next ? getLibraryEntry(entry.next) : undefined;
  return (
    <nav aria-label="นำทางระหว่างวัน" className="-mx-2 mb-5 flex flex-wrap items-center gap-x-1 gap-y-0">
      <Link href="/#phase-shelves" className={LINK}>
        <Library size={15} strokeWidth={1.75} aria-hidden="true" />
        <span>ห้องสมุด</span>
      </Link>
      <span className="ml-auto flex items-center gap-1">
        {prev ? (
          <Link href={prev.href} className={LINK} aria-label={`Day ${prev.day} ก่อนหน้า: ${prev.shortTitle}`}>
            <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" />
            <span>Day {prev.day}</span>
          </Link>
        ) : null}
        {next ? (
          <Link href={next.href} className={LINK} aria-label={`Day ${next.day} ถัดไป: ${next.shortTitle}`}>
            <span>Day {next.day}</span>
            <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        ) : null}
      </span>
    </nav>
  );
}
