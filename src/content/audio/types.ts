export interface AudioPauseCheckpoint {
  title: string;
  prompt: string;
  continueLabel: string;
}

export interface AudioCue {
  /** Anchor ID of the Section inside LessonView (e.g. "big-picture", "concepts", "try-it") */
  sectionId: string;
  /** Short Thai label shown in the Audio Teacher bar */
  label: string;
  /** Public URL path to the synthesized MP3 file (e.g. "/audio/d001/01-big-picture.mp3") */
  src: string;
  /** Readable Thai/English transcript displayed when the learner opens the Transcript panel */
  script: string;
  /** Spoken Thai/English narration fed to Gemini Native TTS (or fallback TTS) */
  ttsText: string;
  /** Optional per-section emotion, pacing, and intonation direction for Gemini Native TTS */
  stylePrompt?: string;
  /** When present, playback pauses at the end of this section and waits until the learner clicks continue */
  pauseAfter?: AudioPauseCheckpoint;
}

export interface LessonAudioGuide {
  lessonId: string;
  voiceLabel: string;
  voiceId: string;
  /** Optional overall persona / tone direction for expressive TTS engines (e.g. Gemini Native TTS) */
  voiceStyle?: string;
  introNote: string;
  cues: AudioCue[];
}
