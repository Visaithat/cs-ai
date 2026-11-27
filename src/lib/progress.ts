/**
 * Pure learner-progress model: no browser APIs here, so every rule is unit-testable.
 * `store.ts` persists this shape to localStorage.
 */
import { addDays, diffDays } from "./dates";

export const STATE_VERSION = 1;

/** Spaced-review intervals in days: Day 4 review (+3), then +8, then +16. */
export const REVIEW_INTERVALS = [3, 8, 16] as const;

export type Track = "web" | "student";

export interface ReviewItem {
  id: string;
  lessonId: string;
  kind: "quiz" | "concept" | "exercise" | "glossary";
  prompt: string;
  answer: string;
  addedOn: string;
  due: string;
  stage: number;
  lapses: number;
}

export interface ExerciseProgress {
  code?: string;
  attempts: number;
  passed: boolean;
  mastered: boolean;
  hintsRevealed: number;
  /** offline-practice self-check completion map (optional, backward-compatible with v1) */
  selfChecks?: Record<string, boolean>;
}

export interface QuizProgress {
  /** question id -> chosen option id */
  answers: Record<string, string>;
  /** question ids the learner has checked (feedback shown) */
  checked: Record<string, boolean>;
}

export interface LessonProgress {
  completedOn?: string;
  setup: Record<string, boolean>;
  exampleStep: number;
  exercise: ExerciseProgress;
  quiz: QuizProgress;
}

export interface AppState {
  v: number;
  track: Track;
  tabIndent: boolean;
  lessons: Record<string, LessonProgress>;
  /** sorted unique YYYY-MM-DD dates with learning activity */
  activeDates: string[];
  review: ReviewItem[];
  graduated: number;
}

export function emptyLesson(): LessonProgress {
  return {
    setup: {},
    exampleStep: 0,
    exercise: { attempts: 0, passed: false, mastered: false, hintsRevealed: 0 },
    quiz: { answers: {}, checked: {} },
  };
}

export const DEFAULT_STATE: AppState = Object.freeze({
  v: STATE_VERSION,
  track: "web",
  tabIndent: false,
  lessons: {},
  activeDates: [],
  review: [],
  graduated: 0,
}) as AppState;

export function getLesson(state: AppState, lessonId: string): LessonProgress {
  return state.lessons[lessonId] ?? emptyLesson();
}

export function patchLesson(
  state: AppState,
  lessonId: string,
  patch: (lesson: LessonProgress) => LessonProgress,
): AppState {
  return { ...state, lessons: { ...state.lessons, [lessonId]: patch(getLesson(state, lessonId)) } };
}

/* ---------------------------------- streak --------------------------------- */

export interface StreakInfo {
  current: number;
  best: number;
  activeToday: boolean;
  /** true when the streak is alive but today's activity is still missing */
  atRisk: boolean;
}

export function markActive(state: AppState, today: string): AppState {
  if (state.activeDates.includes(today)) return state;
  const dates = [...state.activeDates, today].sort().slice(-400);
  return { ...state, activeDates: dates };
}

export function computeStreak(activeDates: string[], today: string): StreakInfo {
  const set = new Set(activeDates);
  const sorted = [...set].sort();

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const date of sorted) {
    run = prev !== null && diffDays(prev, date) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = date;
  }

  const activeToday = set.has(today);
  let cursor = activeToday ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, best, activeToday, atRisk: !activeToday && current > 0 };
}

/* ------------------------------ review queue ------------------------------- */

export function addReviewItems(
  state: AppState,
  items: Array<Pick<ReviewItem, "id" | "lessonId" | "kind" | "prompt" | "answer">>,
  today: string,
): AppState {
  const existing = new Set(state.review.map((item) => item.id));
  const fresh: ReviewItem[] = items
    .filter((item) => !existing.has(item.id))
    .map((item) => ({
      ...item,
      addedOn: today,
      due: addDays(today, REVIEW_INTERVALS[0]),
      stage: 0,
      lapses: 0,
    }));
  if (fresh.length === 0) return state;
  return { ...state, review: [...state.review, ...fresh] };
}

export function removeReviewItem(state: AppState, id: string): AppState {
  return { ...state, review: state.review.filter((item) => item.id !== id) };
}

export function resolveReview(state: AppState, id: string, remembered: boolean, today: string): AppState {
  const item = state.review.find((entry) => entry.id === id);
  // Spaced repetition only works if retrieval happens when due: ignore cards that are not due yet.
  if (!item || !isDue(item, today)) return state;
  const rest = state.review.filter((entry) => entry.id !== id);

  if (!remembered) {
    const retry: ReviewItem = { ...item, stage: 0, lapses: item.lapses + 1, due: addDays(today, 1) };
    return markActive({ ...state, review: [...rest, retry] }, today);
  }

  const nextStage = item.stage + 1;
  if (nextStage >= REVIEW_INTERVALS.length) {
    return markActive({ ...state, review: rest, graduated: state.graduated + 1 }, today);
  }
  const advanced: ReviewItem = { ...item, stage: nextStage, due: addDays(today, REVIEW_INTERVALS[nextStage]) };
  return markActive({ ...state, review: [...rest, advanced] }, today);
}

export function isDue(item: ReviewItem, today: string): boolean {
  return item.due <= today;
}

export function sortReview(items: ReviewItem[]): ReviewItem[] {
  return [...items].sort((a, b) => (a.due === b.due ? a.addedOn.localeCompare(b.addedOn) : a.due.localeCompare(b.due)));
}

/* ------------------------------ lesson progress ----------------------------- */

export interface LessonChecklist {
  setup: boolean;
  example: boolean;
  exercise: boolean;
  quiz: boolean;
  done: number;
  total: number;
}

export function lessonChecklist(
  progress: LessonProgress,
  opts: { setupSteps: number; exampleSteps: number; quizQuestions: number },
): LessonChecklist {
  const setupDone = Object.values(progress.setup).filter(Boolean).length >= opts.setupSteps;
  const example = progress.exampleStep >= opts.exampleSteps - 1;
  const exercise = progress.exercise.passed;
  const quiz = Object.values(progress.quiz.checked).filter(Boolean).length >= opts.quizQuestions;
  const flags = [setupDone, example, exercise, quiz];
  return { setup: setupDone, example, exercise, quiz, done: flags.filter(Boolean).length, total: flags.length };
}

/* ------------------------------ persistence --------------------------------- */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const REVIEW_KINDS: ReadonlyArray<ReviewItem["kind"]> = ["quiz", "concept", "exercise", "glossary"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Strict `YYYY-MM-DD` check that also rejects impossible dates such as 2026-02-31. */
export function isISODate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function nonNegativeInt(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : fallback;
}

function stringRecord<T>(value: unknown, accept: (v: unknown) => v is T): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isRecord(value)) return out;
  for (const [key, entry] of Object.entries(value)) if (accept(entry)) out[key] = entry;
  return out;
}

const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const isString = (v: unknown): v is string => typeof v === "string";

/** Validate one stored review card; returns `null` when it is unusable so it can be dropped. */
export function parseReviewItem(value: unknown): ReviewItem | null {
  if (!isRecord(value)) return null;
  const { id, lessonId, kind, prompt, answer, addedOn, due, stage, lapses } = value;
  if (!isString(id) || !id || !isString(lessonId) || !isString(prompt) || !isString(answer)) return null;
  if (!isString(kind) || !REVIEW_KINDS.includes(kind as ReviewItem["kind"])) return null;
  if (!isISODate(addedOn) || !isISODate(due)) return null;
  if (typeof stage !== "number" || !Number.isInteger(stage) || stage < 0 || stage >= REVIEW_INTERVALS.length) return null;
  if (typeof lapses !== "number" || !Number.isInteger(lapses) || lapses < 0) return null;
  return { id, lessonId, kind: kind as ReviewItem["kind"], prompt, answer, addedOn, due, stage, lapses };
}

function parseLesson(value: unknown): LessonProgress {
  const base = emptyLesson();
  if (!isRecord(value)) return base;
  const exercise = isRecord(value.exercise) ? value.exercise : {};
  const quiz = isRecord(value.quiz) ? value.quiz : {};
  const selfChecks = isRecord(exercise.selfChecks) ? stringRecord(exercise.selfChecks, isBool) : undefined;
  return {
    completedOn: isISODate(value.completedOn) ? value.completedOn : undefined,
    setup: stringRecord(value.setup, isBool),
    exampleStep: nonNegativeInt(value.exampleStep),
    exercise: {
      code: isString(exercise.code) ? exercise.code : undefined,
      attempts: nonNegativeInt(exercise.attempts),
      passed: exercise.passed === true,
      mastered: exercise.mastered === true,
      hintsRevealed: Math.min(3, nonNegativeInt(exercise.hintsRevealed)),
      ...(selfChecks && Object.keys(selfChecks).length > 0 ? { selfChecks } : {}),
    },
    quiz: {
      answers: stringRecord(quiz.answers, isString),
      checked: stringRecord(quiz.checked, isBool),
    },
  };
}

/**
 * Defensive parse: unknown/corrupt storage falls back to defaults instead of crashing the UI.
 * Every field is validated; unusable entries (e.g. review cards with missing dates) are dropped.
 */
export function parseState(raw: string | null): AppState {
  if (!raw) return DEFAULT_STATE;
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.v !== STATE_VERSION) return DEFAULT_STATE;

    const lessons: Record<string, LessonProgress> = {};
    if (isRecord(data.lessons)) {
      for (const [id, value] of Object.entries(data.lessons)) lessons[id] = parseLesson(value);
    }

    const seen = new Set<string>();
    const review: ReviewItem[] = [];
    if (Array.isArray(data.review)) {
      for (const entry of data.review) {
        const item = parseReviewItem(entry);
        if (item && !seen.has(item.id)) {
          seen.add(item.id);
          review.push(item);
        }
      }
    }

    const activeDates = Array.isArray(data.activeDates)
      ? [...new Set(data.activeDates.filter(isISODate))].sort()
      : [];

    return {
      v: STATE_VERSION,
      track: data.track === "student" ? "student" : "web",
      tabIndent: data.tabIndent === true,
      lessons,
      activeDates,
      review,
      graduated: nonNegativeInt(data.graduated),
    };
  } catch {
    return DEFAULT_STATE;
  }
}
