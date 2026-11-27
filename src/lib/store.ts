"use client";

import { useSyncExternalStore } from "react";
import { todayISO } from "./dates";
import { DEFAULT_STATE, parseState, type AppState } from "./progress";

export const STORAGE_KEY = "neural-path:v1";
export const THEME_KEY = "neural-path:theme";

/* ----------------------------- progress store ----------------------------- */

let memoryRaw: string | null = null; // fallback when localStorage is blocked
let writeFailed = false; // a setItem failed: memory is newer than whatever localStorage still holds
let cachedRaw: string | null | undefined;
let cachedState: AppState = DEFAULT_STATE;
const listeners = new Set<() => void>();
const mutationListeners = new Set<(state: AppState) => void>();

export function hasMeaningfulProgress(state: AppState): boolean {
  return (
    state.activeDates.length > 0 ||
    Object.keys(state.lessons).length > 0 ||
    state.review.length > 0 ||
    state.graduated > 0
  );
}

export function getStateSnapshot(): AppState {
  return getSnapshot();
}

export function subscribeStateMutations(listener: (state: AppState) => void): () => void {
  mutationListeners.add(listener);
  return () => {
    mutationListeners.delete(listener);
  };
}

/** Replace local state (e.g. loaded from Supabase cloud) without emitting a local mutation write-back. */
export function replaceState(next: AppState): void {
  const raw = JSON.stringify(next);
  memoryRaw = raw;
  cachedRaw = raw;
  cachedState = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
    writeFailed = false;
  } catch {
    writeFailed = true;
  }
  emit();
}

function readRaw(): string | null {
  if (writeFailed) return memoryRaw;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memoryRaw;
  } catch {
    return memoryRaw;
  }
}

function getSnapshot(): AppState {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parseState(raw);
  }
  return cachedState;
}

function getServerSnapshot(): AppState {
  return DEFAULT_STATE;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Apply a pure reducer to the persisted state. Safe to call from event handlers. */
export function updateState(reducer: (state: AppState) => AppState): void {
  const next = reducer(getSnapshot());
  const raw = JSON.stringify(next);
  memoryRaw = raw;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
    writeFailed = false;
  } catch {
    /* storage full/blocked: state still lives in memory for this session */
    writeFailed = true;
  }
  emit();
  mutationListeners.forEach((listener) => listener(next));
}

export function resetState(options?: { silent?: boolean }): void {
  memoryRaw = null;
  writeFailed = false;
  cachedRaw = undefined;
  cachedState = DEFAULT_STATE;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  emit();
  if (!options?.silent) {
    mutationListeners.forEach((listener) => listener(DEFAULT_STATE));
  }
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** `false` during server render and the first client render, then `true` (avoids hydration mismatches). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Today's local date (`YYYY-MM-DD`), or `null` on the server and during hydration, so statically
 * prerendered HTML never bakes in the build date. Re-reads when the tab regains focus/visibility
 * (e.g. after midnight).
 */
export function useToday(): string | null {
  return useSyncExternalStore(subscribeToday, () => todayISO(), () => null);
}

function subscribeToday(listener: () => void) {
  const onVisible = () => {
    if (document.visibilityState === "visible") listener();
  };
  window.addEventListener("focus", listener);
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    window.removeEventListener("focus", listener);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

/* -------------------------------- theme ----------------------------------- */

export type ThemePreference = "system" | "light" | "dark";

const themeListeners = new Set<() => void>();

function readTheme(): ThemePreference {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(pref: ThemePreference): void {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function setTheme(pref: ThemePreference): void {
  try {
    if (pref === "system") window.localStorage.removeItem(THEME_KEY);
    else window.localStorage.setItem(THEME_KEY, pref);
  } catch {
    /* ignore */
  }
  applyTheme(pref);
  themeListeners.forEach((listener) => listener());
}

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (readTheme() === "system") applyTheme("system");
    listener();
  };
  media.addEventListener("change", onChange);
  return () => {
    themeListeners.delete(listener);
    media.removeEventListener("change", onChange);
  };
}

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribeTheme, readTheme, () => "system" as ThemePreference);
}

/* ---------------------------- reduced motion ------------------------------ */

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (listener) => {
      const media = window.matchMedia(REDUCED_QUERY);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    },
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

/* ------------------------- reading comfort prefs -------------------------- */

export type ReadingSize = "sm" | "md" | "lg";

const READING_SIZE_KEY = "neural-path:reading-size";
const FOCUS_MODE_KEY = "neural-path:focus-mode";
const readingListeners = new Set<() => void>();

function readReadingSize(): ReadingSize {
  try {
    const v = window.localStorage.getItem(READING_SIZE_KEY);
    return v === "sm" || v === "lg" ? v : "md";
  } catch {
    return "md";
  }
}

export function setReadingSize(size: ReadingSize): void {
  try {
    window.localStorage.setItem(READING_SIZE_KEY, size);
  } catch {
    /* ignore */
  }
  readingListeners.forEach((l) => l());
}

export function useReadingSize(): ReadingSize {
  return useSyncExternalStore(
    (l) => {
      readingListeners.add(l);
      return () => readingListeners.delete(l);
    },
    readReadingSize,
    () => "md" as ReadingSize,
  );
}

function readFocusMode(): boolean {
  try {
    return window.localStorage.getItem(FOCUS_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setFocusMode(enabled: boolean): void {
  try {
    if (enabled) window.localStorage.setItem(FOCUS_MODE_KEY, "1");
    else window.localStorage.removeItem(FOCUS_MODE_KEY);
  } catch {
    /* ignore */
  }
  readingListeners.forEach((l) => l());
}

export function useFocusMode(): boolean {
  return useSyncExternalStore(
    (l) => {
      readingListeners.add(l);
      return () => readingListeners.delete(l);
    },
    readFocusMode,
    () => false,
  );
}
