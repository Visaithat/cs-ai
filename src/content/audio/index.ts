import { d001Audio } from "./d001";
import { d002Audio } from "./d002";
import { d003Audio } from "./d003";
import { d004Audio } from "./d004";
import { d005Audio } from "./d005";
import { d006Audio } from "./d006";
import { d007Audio } from "./d007";
import { d008Audio } from "./d008";
import type { LessonAudioGuide } from "./types";

export const LESSON_AUDIO: Record<string, LessonAudioGuide> = {
  [d001Audio.lessonId]: d001Audio,
  [d002Audio.lessonId]: d002Audio,
  [d003Audio.lessonId]: d003Audio,
  [d004Audio.lessonId]: d004Audio,
  [d005Audio.lessonId]: d005Audio,
  [d006Audio.lessonId]: d006Audio,
  [d007Audio.lessonId]: d007Audio,
  [d008Audio.lessonId]: d008Audio,
};

export function getLessonAudio(lessonId: string): LessonAudioGuide | undefined {
  return LESSON_AUDIO[lessonId];
}

export type { AudioCue, AudioPauseCheckpoint, LessonAudioGuide } from "./types";
