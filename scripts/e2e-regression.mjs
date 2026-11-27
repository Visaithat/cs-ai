/**
 * Browser regression checks for QA findings R2 (glossary focus return), R3 (320px reflow of a long
 * unbroken review prompt) and R4 (fresh date after midnight, no hydration error).
 *
 * Not part of `npm run check`: it needs Playwright and its Chromium build, which are not project
 * dependencies. Run it against a production server:
 *
 *   npm run build && npx next start -p 3125      # in one terminal
 *   npm i -g playwright && npx playwright install chromium
 *   BASE_URL=http://localhost:3125 NODE_PATH="$(npm root -g)" node scripts/e2e-regression.mjs
 *
 * Exits non-zero when any check fails.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL ?? "http://localhost:3125";
const STORAGE_KEY = "neural-path:v1";
const results = [];

/** Run one scenario; a thrown error (e.g. a locator timeout) is a failed check, not a crash. */
async function scenario(name, fn) {
  try {
    await fn();
  } catch (error) {
    check(name, false, String(error.message ?? error).split("\n")[0]);
  }
}

function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

/** Wait until every dialog is closed, then give the async native "close" event time to run. */
const settled = async (page) => {
  await page.waitForFunction(() => document.querySelectorAll("dialog[open]").length === 0);
  await page.waitForTimeout(150);
};

const activeLabel = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return "BODY";
    return `${el.tagName}:${(el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 30)}`;
  });

async function newPage(browser, { width = 375, height = 800, ...context } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, ...context });
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  return { ctx, page, errors };
}

/* ------------------------------------ R2 ------------------------------------ */

const CLOSERS = {
  Escape: (page) => page.keyboard.press("Escape"),
  "close button (click)": (page) => page.locator("dialog[open] button", { hasText: "ปิด" }).click(),
  "close button (keyboard Enter)": async (page) => {
    await page.locator("dialog[open] button", { hasText: "ปิด" }).focus();
    await page.keyboard.press("Enter");
  },
  "backdrop click": (page) => page.mouse.click(8, 40), // left of the right-hand drawer / above the bottom sheet
};

async function r2(browser) {
  for (const [label, close] of Object.entries(CLOSERS)) {
    // index -> term -> close
    await scenario(`R2 index -> term, close via ${label}`, async () => {
      const { ctx, page, errors } = await newPage(browser);
      await page.goto(`${BASE}/lesson/d001`);
      const opener = page.locator("button", { hasText: "ศัพท์" }).last();
      await opener.focus();
      await page.keyboard.press("Enter");
      await page.locator("dialog[open] ul button").first().focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => document.querySelectorAll("dialog[open]").length === 1 && document.querySelector("dialog[open] h2")?.textContent?.includes("—"));
      await close(page);
      await settled(page);
      const active = await activeLabel(page);
      check(`R2 index -> term, close via ${label}`, active.startsWith("BUTTON:") && active.includes("ศัพท์"), active);
      check(`R2 index -> term, close via ${label}: no console errors`, errors.length === 0, errors.join(" | "));
      await ctx.close();
    });
    // inline term -> close
    await scenario(`R2 inline term, close via ${label}`, async () => {
      const { ctx, page } = await newPage(browser);
      await page.goto(`${BASE}/lesson/d001`);
      const term = page.locator("button.term-btn").first();
      await term.scrollIntoViewIfNeeded();
      await term.focus();
      const before = await activeLabel(page);
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => document.querySelectorAll("dialog[open]").length === 1);
      await close(page);
      await settled(page);
      const after = await activeLabel(page);
      check(`R2 inline term, close via ${label}`, after === before && after !== "BODY", `${before} -> ${after}`);
      await ctx.close();
    });
    // open, close, open again via the index, then close: focus must go back to the opener
    await scenario(`R2 reopen after a close, then close via ${label}`, async () => {
      const { ctx, page } = await newPage(browser);
      await page.goto(`${BASE}/lesson/d001`);
      const opener = page.locator("button", { hasText: "ศัพท์" }).last();
      await opener.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("Escape");
      await settled(page);
      await opener.focus();
      await page.keyboard.press("Enter");
      await page.locator("dialog[open] ul button").first().focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => document.querySelector("dialog[open] h2")?.textContent?.includes("—"));
      await close(page);
      await settled(page);
      const active = await activeLabel(page);
      check(`R2 reopen after a close, then close via ${label}`, active.startsWith("BUTTON:") && active.includes("ศัพท์"), active);
      await ctx.close();
    });
  }
}

/* ------------------------------------ R3 ------------------------------------ */

function seededState(today, extra = {}) {
  const card = (id, prompt, due) => ({ id, lessonId: "d001", kind: "concept", prompt, answer: `${prompt} answer`, addedOn: today, due, stage: 0, lapses: 0 });
  return {
    v: 1,
    track: "builder",
    tabIndent: false,
    lessons: {},
    activeDates: [],
    graduated: 0,
    review: [
      card("c-due", "AIQueryRequest.model_validate_field_validator_str_strip_whitespace_".repeat(2), today),
      card("c-later", "AIQueryRequest.model_validate_field_validator_str_strip_whitespace_".repeat(2), "2999-01-01"),
    ],
    ...extra,
  };
}

async function r3(browser) {
  const { ctx, page, errors } = await newPage(browser, { width: 320, height: 700 });
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [STORAGE_KEY, JSON.stringify(seededState(today))]);
  await page.goto(`${BASE}/`);
  await page.getByText("นึกก่อน แล้วดูเฉลย").first().click(); // reveal the answer too
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  check("R3 320px: long unbroken review prompt does not scroll horizontally", width.scroll <= width.client, `${width.scroll}/${width.client}`);
  check("R3 no console errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

/* ------------------------------------ R4 ------------------------------------ */

async function r4(browser) {
  // The lesson page's study panel must follow the clock across midnight and hydrate cleanly on any date.
  const { ctx, page, errors } = await newPage(browser, { width: 1400, height: 900, timezoneId: "Asia/Bangkok" });
  await page.clock.install({ time: new Date("2026-11-22T23:59:00+07:00") });
  const card = { id: "c1", lessonId: "d001", kind: "concept", prompt: "p", answer: "a", addedOn: "2026-11-20", due: "2026-11-23", stage: 0, lapses: 0 };
  const state = { v: 1, track: "builder", tabIndent: false, lessons: {}, activeDates: [], graduated: 0, review: [card] };
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [STORAGE_KEY, JSON.stringify(state)]);
  await page.goto(`${BASE}/lesson/d001`);
  const panel = page.locator("aside[aria-label='แผงช่วยเรียน']");
  const summary = panel.locator("section[aria-labelledby='sp-review'] p");
  // wait for hydration: the server-rendered paragraph is the empty-queue text, not the seeded card
  await page.waitForFunction(() => /ครบกำหนดแล้ว/.test(document.querySelector("section[aria-labelledby='sp-review'] p")?.textContent ?? ""));
  const before = (await summary.textContent()) ?? "";
  check("R4 before midnight: card is not due yet", /ครบกำหนดแล้ว\s*0/.test(before), before.trim());
  await page.clock.fastForward("02:00"); // now 2026-11-23 01:59 local
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page.waitForFunction(() => /ครบกำหนดแล้ว\s*1/.test(document.querySelector("section[aria-labelledby='sp-review'] p")?.textContent ?? ""));
  const after = (await summary.textContent()) ?? "";
  check("R4 after midnight: due count refreshes on focus", /ครบกำหนดแล้ว\s*1/.test(after), after.trim());
  check("R4 no hydration/console errors", errors.length === 0, errors.join(" | "));
  await ctx.close();

  for (const [name, tz, time] of [
    ["Kiritimati UTC+14", "Pacific/Kiritimati", "2026-11-26T12:00:00Z"],
    ["Honolulu UTC-10", "Pacific/Honolulu", "2027-03-15T05:00:00Z"],
  ]) {
    const c = await newPage(browser, { width: 1400, height: 900, timezoneId: tz });
    await c.page.clock.install({ time: new Date(time) });
    await c.page.goto(`${BASE}/lesson/d001`);
    await c.page.waitForSelector("aside[aria-label='แผงช่วยเรียน']");
    check(`R4 hydrates cleanly in ${name}`, c.errors.length === 0, c.errors.join(" | "));
    await c.ctx.close();
  }
}

const browser = await chromium.launch();
try {
  await r2(browser);
  await r3(browser);
  await r4(browser);
} finally {
  await browser.close();
}
const failed = results.filter((r) => !r.ok);
console.log(`\nTOTAL ${results.length} checks, ${results.length - failed.length} pass, ${failed.length} fail`);
process.exit(failed.length === 0 ? 0 : 1);
