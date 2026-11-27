import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getLessonAudio, LESSON_AUDIO, type LessonAudioGuide } from "./index";

const PREPARED_LESSON_IDS = Array.from({ length: 180 }, (_, i) => `d${String(i + 1).padStart(3, "0")}`);
const REGISTERED_LESSON_IDS = Object.keys(LESSON_AUDIO).sort();

const EXPECTED_SECTIONS = [
  "big-picture",
  "objectives",
  "setup",
  "visual-map",
  "concepts",
  "worked-example",
  "try-it",
  "mistakes",
  "quiz",
  "summary",
];

function loadCloudAudioSet(): Set<string> {
  const cloudPath = resolve(process.cwd(), "src/content/audio/cloud-status.json");
  if (!existsSync(cloudPath)) return new Set();
  const parsed = JSON.parse(readFileSync(cloudPath, "utf-8")) as {
    gemini128k?: string[];
    edge48k?: string[];
  };
  return new Set([...(parsed.gemini128k ?? []), ...(parsed.edge48k ?? [])]);
}

describe("AI Audio Teacher prepared scripts (Days 1–180) & Supabase/local MP3 registry", () => {
  it("registers at least d001–d008 in LESSON_AUDIO and matches prepared manifests", () => {
    for (const id of ["d001", "d002", "d003", "d004", "d005", "d006", "d007", "d008"]) {
      expect(LESSON_AUDIO[id], `Missing registered audio lesson: ${id}`).toBeDefined();
    }
    expect(REGISTERED_LESSON_IDS.length).toBeGreaterThanOrEqual(8);
  });

  it("has valid, complete 10-section Thai mentor JSON scripts prepared for all 180 lessons (d001–d180)", () => {
    for (const lessonId of PREPARED_LESSON_IDS) {
      const jsonPath = resolve(process.cwd(), "src/content/audio", `${lessonId}.json`);
      expect(existsSync(jsonPath), `Missing audio script manifest: ${jsonPath}`).toBe(true);

      const guide = JSON.parse(readFileSync(jsonPath, "utf-8")) as LessonAudioGuide;
      expect(guide.lessonId).toBe(lessonId);
      expect(guide.voiceId.trim().length).toBeGreaterThan(0);
      expect(guide.voiceStyle?.trim().length ?? 0).toBeGreaterThan(20);
      expect(guide.cues.map((c) => c.sectionId)).toEqual(EXPECTED_SECTIONS);

      const pausedSections = guide.cues.filter((c) => Boolean(c.pauseAfter)).map((c) => c.sectionId);
      expect(pausedSections, `${lessonId}: pauseAfter`).toEqual(["setup", "worked-example", "try-it", "quiz"]);

      for (const cue of guide.cues) {
        expect(cue.script.trim().length, `${lessonId}/${cue.sectionId}: script`).toBeGreaterThan(80);
        expect(cue.ttsText.trim().length, `${lessonId}/${cue.sectionId}: ttsText`).toBeGreaterThan(80);
        expect(cue.ttsText.includes("..."), `${lessonId}/${cue.sectionId}: ellipsis in ttsText`).toBe(false);
        expect(cue.stylePrompt?.trim().length ?? 0, `${lessonId}/${cue.sectionId}: stylePrompt`).toBeGreaterThan(20);
        expect(cue.src, `${lessonId}/${cue.sectionId}: src`).toMatch(
          new RegExp(`^/audio/${lessonId}/\\d{2}-[a-z-]+\\.mp3$`),
        );
      }
    }
  });

  it.each(REGISTERED_LESSON_IDS)(
    "%s: registered lesson has synthesized MP3s available in Supabase Storage or local disk",
    (lessonId) => {
      const guide = getLessonAudio(lessonId)!;
      const cloudSet = loadCloudAudioSet();
      expect(guide).toBeDefined();
      for (const cue of guide.cues) {
        const objKey = cue.src.replace(/^\/audio\//, "");
        const localPath = resolve(process.cwd(), "public", cue.src.replace(/^\//, ""));
        const onCloud = cloudSet.has(objKey);
        const onDisk = existsSync(localPath) && statSync(localPath).size > 5_000;
        expect(onCloud || onDisk, `Missing MP3 (neither Supabase nor local): ${objKey}`).toBe(true);
      }
    },
  );
});
