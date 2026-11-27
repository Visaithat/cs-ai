"use client";

import { useEffect, useState } from "react";

export interface TocItem {
  id: string;
  label: string;
}

/** Highlights the section currently in the reading band. */
export function useScrollSpy(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = ids.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/** Jump to a section: respects reduced motion, moves focus to the heading, keeps the hash in sync. */
export function goToSection(id: string, { focusHeading = true }: { focusHeading?: boolean } = {}) {
  const section = document.getElementById(id);
  if (!section) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  if (focusHeading) {
    const heading = section.querySelector<HTMLElement>("h2");
    heading?.focus({ preventScroll: true });
  }
  try {
    window.history.replaceState(null, "", `#${id}`);
  } catch {
    /* ignore */
  }
}

export function TocList({
  items,
  active,
  speakingId,
  onNavigate,
}: {
  items: TocItem[];
  active: string;
  speakingId?: string | null;
  onNavigate?: () => void;
}) {
  return (
    <ol>
      {items.map((item, index) => {
        const isSpeaking = Boolean(speakingId && item.id === speakingId);
        const current = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={current ? "location" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onNavigate?.();
                requestAnimationFrame(() => goToSection(item.id));
              }}
              className={`flex min-h-11 items-center gap-2 border-l-2 py-1 pl-3 pr-2 text-sm leading-snug lg:min-h-9 lg:text-[0.8125rem] lg:pointer-coarse:min-h-11 ${
                isSpeaking
                  ? "border-success font-semibold text-success"
                  : current
                    ? "border-brand font-semibold text-ink"
                    : "border-hair text-muted hover:text-ink"
              }`}
            >
              <span className="mono-label w-4 shrink-0 text-xs tabular-nums opacity-60">{index + 1}</span>
              <span className="flex-1">{item.label}</span>
              {isSpeaking ? (
                <span
                  aria-label="กำลังอธิบายส่วนนี้"
                  className="h-2 w-2 shrink-0 rounded-full bg-success"
                />
              ) : null}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
