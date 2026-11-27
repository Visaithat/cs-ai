/** Local-calendar date helpers. Dates are `YYYY-MM-DD` strings in the learner's local time zone. */

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(now: Date = new Date()): string {
  return toISO(now);
}

function parse(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: string, days: number): string {
  const date = parse(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

/** Whole days from `a` to `b` (positive when b is later). */
export function diffDays(a: string, b: string): number {
  const ms = parse(b).getTime() - parse(a).getTime();
  return Math.round(ms / 86_400_000);
}

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const TH_WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function formatShortThai(iso: string): string {
  const date = parse(iso);
  return `${date.getDate()} ${TH_MONTHS[date.getMonth()]}`;
}

export function weekdayShortThai(iso: string): string {
  return TH_WEEKDAYS[parse(iso).getDay()];
}
