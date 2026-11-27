"use client";

import { setTheme, useHydrated, useThemePreference, type ThemePreference } from "@/lib/store";
import { Monitor, Moon, Sun } from "./Icons";

const OPTIONS: Array<{ value: ThemePreference; label: string; Icon: typeof Sun }> = [
  { value: "system", label: "ตามระบบ", Icon: Monitor },
  { value: "light", label: "สว่าง", Icon: Sun },
  { value: "dark", label: "มืด", Icon: Moon },
];

/** Icon-only segmented control: the label is announced (and shown as a tooltip), not painted. */
export function ThemeToggle() {
  const preference = useThemePreference();
  const hydrated = useHydrated();
  const current = hydrated ? preference : "system";

  return (
    <div role="group" aria-label="ธีมสี" className="inline-flex rounded-xl border border-hair p-0.5">
      {OPTIONS.map(({ value, label, Icon }) => {
        const pressed = current === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={pressed}
            title={label}
            onClick={() => setTheme(value)}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-[10px] px-2 sm:min-h-9 sm:min-w-9 sm:pointer-coarse:min-h-11 sm:pointer-coarse:min-w-11 ${
              pressed ? "bg-surface2 text-ink ring-1 ring-line-strong" : "text-muted hover:text-ink"
            }`}
          >
            <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
