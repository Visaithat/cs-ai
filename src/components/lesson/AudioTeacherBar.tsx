"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioCue, LessonAudioGuide } from "@/content/audio";
import {
  ArrowRight,
  Headphones,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  ScrollText,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from "../Icons";
import { goToSection } from "./Toc";

export type AudioStatus = "idle" | "playing" | "paused" | "waiting" | "finished" | "error";

const SPEEDS = [0.85, 1.0, 1.15, 1.25] as const;

const SUPABASE_AUDIO_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/lesson-audio`
  : null;

function resolveAudioSrc(src: string): string {
  if (SUPABASE_AUDIO_BASE && src.startsWith("/audio/")) {
    return `${SUPABASE_AUDIO_BASE}/${src.slice("/audio/".length)}`;
  }
  return src;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export interface AudioTeacherController {
  guide: LessonAudioGuide;
  open: boolean;
  status: AudioStatus;
  cueIndex: number;
  currentCue: AudioCue;
  /** Non-null whenever Audio Teacher is active (playing, paused mid-section, or waiting for user) */
  activeSectionId: string | null;
  currentTime: number;
  duration: number;
  speed: (typeof SPEEDS)[number];
  autoScroll: boolean;
  showTranscript: boolean;
  errorMsg: string | null;
  startGuide: () => void;
  playSection: (sectionId: string) => void;
  togglePlay: () => void;
  replayCurrent: () => void;
  prevSection: () => void;
  nextSection: () => void;
  continueAfterPause: () => void;
  seek: (time: number) => void;
  cycleSpeed: () => void;
  setAutoScroll: (v: boolean) => void;
  setShowTranscript: (v: boolean) => void;
  closeGuide: () => void;
}

/**
 * Coordinates HTMLAudioElement playback across all section MP3 cues, smooth auto-scrolling,
 * green active-section highlighting, and wait-until-ready practice pauses.
 */
export function useAudioTeacher(guide: LessonAudioGuide | undefined): AudioTeacherController | null {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoScrollRef = useRef(true);
  const speedRef = useRef<(typeof SPEEDS)[number]>(1.0);
  const guideRef = useRef(guide);
  const cueIndexRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [cueIndex, setCueIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1.0);
  const [autoScroll, setAutoScrollState] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    guideRef.current = guide;
  }, [guide]);

  const setAutoScroll = useCallback((v: boolean) => {
    autoScrollRef.current = v;
    setAutoScrollState(v);
  }, []);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
    return audioRef.current;
  }, []);

  const loadAndPlay = useCallback(
    (index: number, { scroll = true }: { scroll?: boolean } = {}) => {
      const g = guideRef.current;
      if (!g) return;
      const clamped = Math.max(0, Math.min(g.cues.length - 1, index));
      const cue = g.cues[clamped];
      if (!cue) return;

      cueIndexRef.current = clamped;
      setCueIndex(clamped);
      setOpen(true);
      setErrorMsg(null);
      setCurrentTime(0);
      setDuration(0);

      if (scroll && autoScrollRef.current) {
        requestAnimationFrame(() => goToSection(cue.sectionId, { focusHeading: false }));
      }

      const audio = ensureAudio();
      audio.pause();
      audio.src = resolveAudioSrc(cue.src);
      audio.playbackRate = speedRef.current;
      audio.currentTime = 0;

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        setStatus("playing");
        playPromise.catch(() => {
          setStatus("paused");
        });
      } else {
        setStatus("playing");
      }
    },
    [ensureAudio],
  );

  // Attach audio lifecycle events once
  useEffect(() => {
    if (!guide) return;
    const audio = ensureAudio();

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => setStatus("playing");
    const onError = () => {
      setStatus("error");
      setErrorMsg("ไม่สามารถโหลดไฟล์เสียงส่วนนี้ได้ — ลองกดฟังซ้ำอีกครั้งครับ");
    };
    const onEnded = () => {
      const g = guideRef.current;
      if (!g) return;
      const idx = cueIndexRef.current;
      const cue = g.cues[idx];
      if (cue?.pauseAfter) {
        // Wait-until-ready checkpoint: stay paused on this section until learner clicks continue!
        setStatus("waiting");
        return;
      }
      if (idx + 1 < g.cues.length) {
        loadAndPlay(idx + 1, { scroll: true });
      } else {
        setStatus("finished");
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
    };
  }, [guide, ensureAudio, loadAndPlay]);

  const startGuide = useCallback(() => {
    loadAndPlay(0, { scroll: true });
  }, [loadAndPlay]);

  const playSection = useCallback(
    (sectionId: string) => {
      const g = guideRef.current;
      if (!g) return;
      const idx = g.cues.findIndex((c) => c.sectionId === sectionId);
      if (idx >= 0) loadAndPlay(idx, { scroll: true });
    },
    [loadAndPlay],
  );

  const togglePlay = useCallback(() => {
    const audio = ensureAudio();
    if (status === "playing") {
      audio.pause();
      setStatus("paused");
    } else if (status === "paused" && audio.src) {
      audio.playbackRate = speedRef.current;
      audio
        .play()
        .then(() => setStatus("playing"))
        .catch(() => setStatus("paused"));
    } else if (status === "waiting") {
      // Pressing play while waiting replays current section or continues via explicit continue button
      loadAndPlay(cueIndexRef.current, { scroll: false });
    } else if (status === "finished") {
      loadAndPlay(0, { scroll: true });
    } else {
      loadAndPlay(cueIndexRef.current, { scroll: true });
    }
  }, [ensureAudio, loadAndPlay, status]);

  const replayCurrent = useCallback(() => {
    loadAndPlay(cueIndexRef.current, { scroll: false });
  }, [loadAndPlay]);

  const prevSection = useCallback(() => {
    loadAndPlay(Math.max(0, cueIndexRef.current - 1), { scroll: true });
  }, [loadAndPlay]);

  const nextSection = useCallback(() => {
    const g = guideRef.current;
    if (!g) return;
    loadAndPlay(Math.min(g.cues.length - 1, cueIndexRef.current + 1), { scroll: true });
  }, [loadAndPlay]);

  const continueAfterPause = useCallback(() => {
    const g = guideRef.current;
    if (!g) return;
    if (cueIndexRef.current + 1 < g.cues.length) {
      loadAndPlay(cueIndexRef.current + 1, { scroll: true });
    } else {
      setStatus("finished");
    }
  }, [loadAndPlay]);

  const seek = useCallback(
    (time: number) => {
      const audio = ensureAudio();
      if (Number.isFinite(time)) {
        audio.currentTime = Math.max(0, Math.min(audio.duration || time, time));
        setCurrentTime(audio.currentTime);
      }
    },
    [ensureAudio],
  );

  const cycleSpeed = useCallback(() => {
    const nextIdx = (SPEEDS.indexOf(speedRef.current) + 1) % SPEEDS.length;
    const nextSpeed = SPEEDS[nextIdx];
    speedRef.current = nextSpeed;
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  }, []);

  const closeGuide = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setStatus("idle");
    setOpen(false);
  }, []);

  if (!guide) return null;

  const currentCue = guide.cues[cueIndex] ?? guide.cues[0];
  const activeSectionId = open && status !== "idle" ? currentCue.sectionId : null;

  return {
    guide,
    open,
    status,
    cueIndex,
    currentCue,
    activeSectionId,
    currentTime,
    duration,
    speed,
    autoScroll,
    showTranscript,
    errorMsg,
    startGuide,
    playSection,
    togglePlay,
    replayCurrent,
    prevSection,
    nextSection,
    continueAfterPause,
    seek,
    cycleSpeed,
    setAutoScroll,
    setShowTranscript,
    closeGuide,
  };
}

/* ---------------------- Chapter Opener Starter Strip ---------------------- */

export function AudioTeacherIntro({ controller }: { controller: AudioTeacherController }) {
  const isPlaying = controller.status === "playing";
  const isWaiting = controller.status === "waiting";

  return (
    <div className="no-print mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hair bg-surface px-4 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
            controller.open ? "border-success bg-[color:var(--speaking-soft)] text-success" : "border-hair bg-brand-soft/60 text-brand-ink"
          }`}
        >
          <Headphones size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">
            โหมดฟังรุ่นพี่เล่าให้ฟัง · <span className="font-normal text-muted">{controller.guide.voiceLabel}</span>
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{controller.guide.introNote}</p>
        </div>
      </div>

      <button
        type="button"
        className={controller.open ? "btn btn-sm" : "btn btn-sm btn-primary"}
        onClick={controller.open ? controller.togglePlay : controller.startGuide}
      >
        {isPlaying ? (
          <>
            <Pause size={15} strokeWidth={2} aria-hidden="true" /> หยุดชั่วคราว
          </>
        ) : isWaiting ? (
          <>
            <Play size={15} strokeWidth={2} aria-hidden="true" /> ฟังซ้ำส่วนนี้
          </>
        ) : controller.open ? (
          <>
            <Play size={15} strokeWidth={2} aria-hidden="true" /> ฟังต่อ
          </>
        ) : (
          <>
            <Headphones size={15} strokeWidth={1.85} aria-hidden="true" /> เริ่มฟังบทนี้
          </>
        )}
      </button>
    </div>
  );
}

/* ---------------------- Non-Overlapping Side-Rail / Sticky Audio Bar ---------------------- */

export function AudioTeacherDock({ controller }: { controller: AudioTeacherController }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!controller.open) return null;

  const { currentCue, cueIndex, guide, status, currentTime, duration, speed, autoScroll, showTranscript, errorMsg } = controller;
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : status === "waiting" || status === "finished" ? 100 : 0;
  const isWaiting = status === "waiting" && Boolean(currentCue.pauseAfter);
  const statusLabel =
    status === "playing" ? "กำลังอธิบาย" : status === "waiting" ? "พักรอคุณลงมือทำ" : status === "finished" ? "จบแล้ว" : "หยุดชั่วคราว";

  return (
    <aside aria-label="แถบควบคุมเสียงครู AI" className="audio-rail no-print">
      <div className="audio-dock p-3 sm:p-3.5">
        {/* Top status & title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden="true" />
              <span className="text-xs font-semibold text-success">{statusLabel}</span>
              <span className="mono-label ml-auto text-xs tabular-nums text-muted">
                {cueIndex + 1}/{guide.cues.length}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink xl:whitespace-normal xl:leading-snug">
              {currentCue.label}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-lg px-2 text-xs font-medium text-muted hover:bg-surface2 hover:text-ink xl:hidden"
              onClick={() => setCollapsed((v) => !v)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "ขยายแถบเสียงครู AI" : "ย่อแถบเสียงครู AI"}
            >
              {collapsed ? "ขยาย" : "ย่อ"}
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"
              aria-label="ปิดแถบเสียงครู AI"
              onClick={controller.closeGuide}
            >
              <X size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Wait-until-ready practice pause banner (always visible on xl, toggleable on small screens) */}
        {isWaiting && currentCue.pauseAfter && !collapsed ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-2.5 rounded-xl border border-success/50 bg-[color:var(--speaking-soft)] px-3 py-2.5"
          >
            <p className="text-sm font-semibold leading-snug text-success">{currentCue.pauseAfter.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[color:var(--speaking-ink)]">{currentCue.pauseAfter.prompt}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <button type="button" className="btn btn-sm btn-primary w-full justify-center sm:w-auto xl:w-full" onClick={controller.continueAfterPause}>
                <span>{currentCue.pauseAfter.continueLabel}</span>
                <ArrowRight size={15} strokeWidth={1.85} aria-hidden="true" />
              </button>
              <button type="button" className="btn btn-sm btn-quiet w-full justify-center sm:w-auto xl:w-full" onClick={controller.replayCurrent}>
                <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" /> ฟังซ้ำส่วนนี้
              </button>
            </div>
          </div>
        ) : null}

        {/* Finished chapter banner */}
        {status === "finished" && !collapsed ? (
          <div role="status" aria-live="polite" className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-success/50 bg-[color:var(--speaking-soft)] px-3 py-2">
            <p className="text-xs font-semibold text-success">
              ฟังจบครบทั้งบท Day {Number(guide.lessonId.replace(/\D+/g, "")) || 1} แล้วครับ!
            </p>
            <button type="button" className="btn btn-sm btn-quiet" onClick={controller.startGuide}>
              <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" /> ฟังใหม่ตั้งแต่ต้น
            </button>
          </div>
        ) : null}

        {errorMsg ? (
          <p role="alert" className="mt-2 text-xs text-danger">
            {errorMsg}
          </p>
        ) : null}

        {/* Hairline seekable progress bar */}
        {!collapsed ? (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="mono-label w-9 shrink-0 text-xs tabular-nums text-muted">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 100}
              step={0.25}
              value={duration > 0 ? currentTime : pct}
              onChange={(e) => controller.seek(Number(e.target.value))}
              aria-label="เลื่อนเวลาเสียงบรรยาย"
              className="h-1.5 flex-1 cursor-pointer accent-[color:var(--success)]"
            />
            <span className="mono-label w-9 shrink-0 text-right text-xs tabular-nums text-muted">{formatTime(duration)}</span>
          </div>
        ) : null}

        {/* Transport controls row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className="btn btn-sm btn-quiet min-w-9 px-2"
            onClick={controller.prevSection}
            disabled={cueIndex === 0}
            aria-label="ส่วนก่อนหน้า"
            title="ส่วนก่อนหน้า"
          >
            <SkipBack size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="btn btn-sm btn-primary min-w-22 flex-1 xl:flex-1"
            onClick={isWaiting ? controller.continueAfterPause : controller.togglePlay}
          >
            {isWaiting ? (
              <>
                <span>ไปต่อ</span>
                <ArrowRight size={15} strokeWidth={1.85} aria-hidden="true" />
              </>
            ) : status === "playing" ? (
              <>
                <Pause size={15} strokeWidth={2} aria-hidden="true" /> หยุด
              </>
            ) : (
              <>
                <Play size={15} strokeWidth={2} aria-hidden="true" /> เล่น
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-sm btn-quiet min-w-9 px-2"
            onClick={controller.nextSection}
            disabled={cueIndex >= guide.cues.length - 1}
            aria-label="ส่วนถัดไป"
            title="ส่วนถัดไป"
          >
            <SkipForward size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="btn btn-sm btn-quiet min-w-9 px-2"
            onClick={controller.replayCurrent}
            title="ฟังซ้ำส่วนนี้"
            aria-label="ฟังซ้ำส่วนนี้"
          >
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Secondary options row (speed, auto-scroll, transcript) */}
        {!collapsed ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-hair pt-2">
            <button
              type="button"
              className="btn btn-sm btn-quiet mono-label px-2.5"
              onClick={controller.cycleSpeed}
              title="ปรับความเร็วเสียง"
              aria-label={`ความเร็วเสียง ${speed}x (กดเพื่อเปลี่ยน)`}
            >
              {speed}x
            </button>

            <button
              type="button"
              aria-pressed={autoScroll}
              className={`btn btn-sm flex-1 px-2 ${autoScroll ? "border-success/60 text-success" : "btn-quiet text-muted"}`}
              onClick={() => controller.setAutoScroll(!autoScroll)}
              title="เลื่อนหน้าตาม Section อัตโนมัติ"
            >
              <Navigation size={13} strokeWidth={1.75} aria-hidden="true" />
              <span>เลื่อนตาม</span>
            </button>

            <button
              type="button"
              aria-expanded={showTranscript}
              className={`btn btn-sm flex-1 px-2 ${showTranscript ? "border-brand text-brand-ink" : "btn-quiet text-muted"}`}
              onClick={() => controller.setShowTranscript(!showTranscript)}
              title="ดูข้อความที่ครูอธิบาย (Transcript)"
            >
              <ScrollText size={13} strokeWidth={1.75} aria-hidden="true" />
              <span>สคริปต์</span>
            </button>
          </div>
        ) : null}

        {/* Collapsible readable Thai Transcript */}
        {showTranscript && !collapsed ? (
          <div className="mt-2.5 max-h-48 overflow-y-auto rounded-xl border border-hair bg-surface2/60 p-3 text-xs leading-relaxed text-ink xl:max-h-64 xl:text-[0.8125rem]">
            <p className="mb-1.5 flex items-center gap-1.5 text-[0.75rem] font-semibold text-muted">
              <Volume2 size={13} strokeWidth={1.85} aria-hidden="true" />
              <span>สคริปต์ · {currentCue.label}</span>
            </p>
            <p className="m-0 whitespace-pre-line">{currentCue.script}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
