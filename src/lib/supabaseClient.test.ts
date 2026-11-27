import { describe, expect, it } from "vitest";
import { assetPath } from "./assetPath";
import { DEFAULT_STATE } from "./progress";
import { hasMeaningfulProgress } from "./store";
import { usernameToEmail, validateCredentials } from "./supabaseClient";

describe("supabaseClient & static asset helpers", () => {
  it("maps usernames deterministically and validates Timmy / 115599", () => {
    expect(usernameToEmail("Timmy")).toBe("timmy@neuralpath.local");
    expect(usernameToEmail("alice@example.com")).toBe("alice@example.com");
    expect(validateCredentials("Timmy", "115599")).toEqual({ ok: true, username: "Timmy", password: "115599" });
    expect(validateCredentials("a", "115599").ok).toBe(false);
    expect(validateCredentials("Timmy", "12345").ok).toBe(false);
  });

  it("detects meaningful local progress accurately for first-login migration", () => {
    expect(hasMeaningfulProgress(DEFAULT_STATE)).toBe(false);
    expect(hasMeaningfulProgress({ ...DEFAULT_STATE, activeDates: ["2026-11-27"] })).toBe(true);
    expect(hasMeaningfulProgress({ ...DEFAULT_STATE, graduated: 1 })).toBe(true);
  });

  it("preserves external/non-root paths cleanly in assetPath", () => {
    expect(assetPath("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(assetPath("/assets/neural-path-mark.svg")).toContain("/assets/neural-path-mark.svg");
  });
});
