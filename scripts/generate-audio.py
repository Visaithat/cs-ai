"""
Generate expressive Thai narration tracks (.mp3) for a Neural Path lesson audio guide.

Default provider: Google Gemini Native TTS (`gemini-2.5-flash-preview-tts`), the same
native speech generation model family behind NotebookLM — supports context-aware emotion,
intonation, pacing, and smooth Thai/English code-switching.

Usage (recommended — Gemini Native TTS):
    # Put GEMINI_API_KEY=... in .env.local (gitignored) or environment variable, then run:
    uv run --with google-genai --with lameenc python scripts/generate-audio.py d001

    # Preview a single section or try another Gemini voice (e.g. Puck, Achird, Charon, Sulafat, Kore):
    uv run --with google-genai --with lameenc python scripts/generate-audio.py d001 --only big-picture --voice Puck

Fallback provider (offline/no-key Edge Neural TTS):
    uv run --with edge-tts python scripts/generate-audio.py d001 --provider edge
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLOUD_STATUS_PATH = ROOT / "src" / "content" / "audio" / "cloud-status.json"
SUPABASE_AUDIO_BUCKET = "lesson-audio"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-preview-tts"
DEFAULT_GEMINI_VOICE = "Puck"  # NotebookLM-like upbeat, warm male host


def load_cloud_status() -> dict[str, list[str]]:
    if CLOUD_STATUS_PATH.exists():
        try:
            data = json.loads(CLOUD_STATUS_PATH.read_text(encoding="utf-8"))
            return {
                "gemini128k": sorted(set(data.get("gemini128k", []))),
                "edge48k": sorted(set(data.get("edge48k", []))),
            }
        except Exception:
            pass
    return {"gemini128k": [], "edge48k": []}


def save_cloud_status(status: dict[str, list[str]]) -> None:
    status["gemini128k"] = sorted(set(status.get("gemini128k", [])))
    status["edge48k"] = sorted(set(status.get("edge48k", [])) - set(status["gemini128k"]))
    CLOUD_STATUS_PATH.write_text(json.dumps(status, indent=2) + "\n", encoding="utf-8")


def upload_mp3_to_supabase(rel_audio_path: str, local_file: Path) -> None:
    """Upload MP3 bytes to Supabase Storage public bucket 'lesson-audio'."""
    import urllib.request

    load_local_env()
    url = (os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
    key = os.environ.get("SUPABASE_SECRET_KEY") or ""
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SECRET_KEY for --upload-supabase")

    obj_key = rel_audio_path.removeprefix("audio/").lstrip("/")
    req = urllib.request.Request(
        f"{url}/storage/v1/object/{SUPABASE_AUDIO_BUCKET}/{obj_key}",
        data=local_file.read_bytes(),
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "audio/mpeg",
            "x-upsert": "true",
            "cache-control": "public, max-age=31536000",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        if resp.status not in (200, 201):
            raise RuntimeError(f"Supabase upload failed with HTTP {resp.status} for {obj_key}")


def load_local_env() -> None:
    """Load KEY=VALUE pairs from .env.local or .env if not already set in process env."""
    for name in (".env.local", ".env"):
        env_path = ROOT / name
        if not env_path.exists():
            continue
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = val


def is_gemini_mp3(path: Path) -> bool:
    """Return True if path exists, is >5KB, and has a 128kbps MPEG2 Layer3 frame header (lameenc/Gemini)."""
    if not path.exists() or path.stat().st_size <= 5000:
        return False
    b = path.read_bytes()[:4096]
    tbl = (0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0)
    for j in range(len(b) - 3):
        if b[j] == 0xFF and (b[j + 1] & 0xE0) == 0xE0:
            ver = (b[j + 1] >> 3) & 0x03
            br_idx = (b[j + 2] >> 4) & 0x0F
            return ver in (0, 2) and tbl[br_idx] >= 128
    return False


def encode_pcm24k_to_mp3(pcm_bytes: bytes, out_path: Path, sample_rate: int = 24000) -> int:
    import lameenc

    encoder = lameenc.Encoder()
    encoder.set_bit_rate(128)
    encoder.set_in_sample_rate(sample_rate)
    encoder.set_channels(1)
    encoder.set_quality(2)  # high quality
    mp3_bytes = encoder.encode(pcm_bytes) + encoder.flush()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(mp3_bytes)
    return len(mp3_bytes)


def build_gemini_prompt(voice_style: str, cue: dict) -> str:
    section_style = cue.get("stylePrompt", "").strip()
    parts = [
        "Read aloud ONLY the Thai/English lesson transcript below verbatim. Do NOT read these instructions or add any intro/outro text.",
    ]
    if voice_style:
        parts.append(f"Speaker persona: {voice_style}")
    if section_style:
        parts.append(f"Delivery & emotion for this section: {section_style}")
    parts.append(
        "Pronunciation guidance: Speak natural, clear Bangkok Thai with smooth, confident English technical terms (such as Pydantic, uv, JSON, API, ValidationError, BaseModel, Literal). Use natural breathing pauses at paragraph breaks so the listener never feels rushed."
    )
    parts.append("\nTranscript:\n" + cue["ttsText"].strip())
    return "\n".join(parts)


def synthesize_gemini_cue(
    client,
    model: str,
    voice_name: str,
    voice_style: str,
    cue: dict,
    out_path: Path,
    max_retries: int = 5,
) -> int:
    from google.genai import types

    prompt = build_gemini_prompt(voice_style, cue)
    last_err: Exception | None = None

    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=voice_name,
                            )
                        )
                    ),
                ),
            )
            pcm_chunks: list[bytes] = []
            sample_rate = 24000
            for cand in response.candidates or []:
                for part in (cand.content.parts if cand.content else []) or []:
                    inline = getattr(part, "inline_data", None)
                    if inline and inline.data:
                        mime = getattr(inline, "mime_type", "") or ""
                        if "rate=" in mime:
                            try:
                                sample_rate = int(mime.split("rate=")[1].split(";")[0])
                            except ValueError:
                                pass
                        pcm_chunks.append(inline.data)
            if not pcm_chunks:
                raise RuntimeError(f"Gemini TTS returned no audio data for section '{cue['sectionId']}'")
            pcm_bytes = b"".join(pcm_chunks)
            duration_sec = len(pcm_bytes) / (sample_rate * 2)  # 16-bit mono = 2 bytes/sample
            min_expected_sec = max(6.0, len(cue["ttsText"]) * 0.028)
            max_expected_sec = max(120.0, len(cue["ttsText"]) * 0.22)
            if duration_sec < min_expected_sec:
                raise RuntimeError(
                    f"Truncated TTS duration ({duration_sec:.1f}s < {min_expected_sec:.0f}s) for '{cue['sectionId']}'"
                )
            if duration_sec > max_expected_sec:
                raise RuntimeError(
                    f"Runaway TTS duration ({duration_sec:.1f}s > {max_expected_sec:.0f}s) for '{cue['sectionId']}'"
                )
            return encode_pcm24k_to_mp3(pcm_bytes, out_path, sample_rate=sample_rate)
        except Exception as err:  # noqa: BLE001
            last_err = err
            msg = str(err)
            is_daily_quota = "PerDay" in msg or "per_day" in msg
            if is_daily_quota:
                raise
            is_rate_limit = "429" in msg or "RESOURCE_EXHAUSTED" in msg or "quota" in msg.lower()
            is_bad_len = "Runaway TTS duration" in msg or "Truncated TTS duration" in msg
            if attempt < max_retries and (is_rate_limit or is_bad_len or "503" in msg or "500" in msg):
                wait_sec = 22 if is_rate_limit else 5 * attempt
                print(
                    f"    ! Retry {attempt}/{max_retries} for {cue['sectionId']} after {wait_sec}s ({msg[:90]})",
                    flush=True,
                )
                time.sleep(wait_sec)
                continue
            raise

    raise RuntimeError(f"Failed to synthesize {cue['sectionId']}: {last_err}")


def run_gemini(
    data: dict,
    cues: list[dict],
    model: str,
    voice_name: str,
    delay_sec: float,
    skip_existing: bool = False,
    skip_gemini: bool = False,
    fallback_edge: bool = False,
    stop_on_daily_quota: bool = False,
    upload_supabase: bool = False,
    prune_local: bool = False,
) -> bool:
    """Returns False if stopped early due to daily quota (when stop_on_daily_quota=True)."""
    load_local_env()
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        if fallback_edge:
            print("No GEMINI_API_KEY found; falling back to Edge Neural TTS (th-TH-NiwatNeural)...")
            asyncio.run(run_edge(data, cues, "th-TH-NiwatNeural", skip_existing=skip_existing))
            return True
        raise SystemExit(
            "Missing GEMINI_API_KEY.\n"
            "1) Get a free key at https://aistudio.google.com/apikey\n"
            "2) Add GEMINI_API_KEY=your_key to .env.local (already gitignored) or set $env:GEMINI_API_KEY\n"
            "3) Re-run: uv run --with google-genai --with lameenc python scripts/generate-audio.py d001"
        )

    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key, http_options=types.HttpOptions(api_version="v1beta"))
    voice_style = data.get("voiceStyle", "")
    cloud_status = load_cloud_status()
    cloud_gemini_set = set(cloud_status["gemini128k"])
    print(f"Synthesizing {len(cues)} track(s) for {data['lessonId']} with Gemini Native TTS ({model}, voice={voice_name})...", flush=True)

    total = 0
    for idx, cue in enumerate(cues, start=1):
        rel = cue["src"].lstrip("/")
        obj_key = rel.removeprefix("audio/")
        out_file = ROOT / "public" / rel
        if skip_gemini and (obj_key in cloud_gemini_set or is_gemini_mp3(out_file)):
            size = out_file.stat().st_size if out_file.exists() else 0
            total += size
            src_label = "cloud Gemini 128k" if obj_key in cloud_gemini_set else f"local Gemini 128k, {size / 1024:.1f} KB"
            print(f"  [{idx}/{len(cues)}] SKIP ({src_label}) {obj_key}", flush=True)
            continue
        if skip_existing and out_file.exists() and out_file.stat().st_size > 5000:
            size = out_file.stat().st_size
            total += size
            print(f"  [{idx}/{len(cues)}] SKIP (exists) public/{rel}  ({size / 1024:.1f} KB)", flush=True)
            continue
        try:
            size = synthesize_gemini_cue(client, model, voice_name, voice_style, cue, out_file)
            total += size
            if upload_supabase:
                upload_mp3_to_supabase(rel, out_file)
                cloud_status["gemini128k"].append(obj_key)
                save_cloud_status(cloud_status)
                cloud_gemini_set.add(obj_key)
                if prune_local and out_file.exists():
                    out_file.unlink()
                print(f"  [{idx}/{len(cues)}] OK  supabase://{SUPABASE_AUDIO_BUCKET}/{obj_key}  ({size / 1024:.1f} KB)", flush=True)
            else:
                print(f"  [{idx}/{len(cues)}] OK  public/{rel}  ({size / 1024:.1f} KB)", flush=True)
            if idx < len(cues) and delay_sec > 0:
                time.sleep(delay_sec)
        except Exception as err:  # noqa: BLE001
            msg = str(err)
            is_daily_quota = "PerDay" in msg or "per_day" in msg
            if stop_on_daily_quota and is_daily_quota:
                print(
                    f"  ! Daily Gemini Free Tier quota reached at {data['lessonId']}/{cue['sectionId']}. Stopping cleanly until next reset.",
                    flush=True,
                )
                return False
            if fallback_edge:
                print(
                    f"  ! Gemini TTS unavailable for {cue['sectionId']} ({msg[:100]}). Falling back to Edge TTS (th-TH-NiwatNeural) for remaining cues...",
                    flush=True,
                )
                asyncio.run(run_edge(data, cues[idx - 1 :], "th-TH-NiwatNeural", skip_existing=skip_existing))
                return True
            raise

    print(f"Done ({data['lessonId']})! Total size: {total / 1024:.1f} KB", flush=True)
    return True


async def run_edge(data: dict, cues: list[dict], voice: str, skip_existing: bool = False) -> None:
    import edge_tts

    print(f"Synthesizing {len(cues)} track(s) for {data['lessonId']} with Edge TTS ({voice})...", flush=True)
    sem = asyncio.Semaphore(5)

    async def synth_one(idx: int, cue: dict) -> int:
        rel = cue["src"].lstrip("/")
        out_file = ROOT / "public" / rel
        if skip_existing and out_file.exists() and out_file.stat().st_size > 5000:
            size = out_file.stat().st_size
            print(f"  [{idx}/{len(cues)}] SKIP (exists) public/{rel}  ({size / 1024:.1f} KB)", flush=True)
            return size
        async with sem:
            out_file.parent.mkdir(parents=True, exist_ok=True)
            communicate = edge_tts.Communicate(text=cue["ttsText"], voice=voice, rate="-4%")
            await communicate.save(str(out_file))
            size = out_file.stat().st_size
            print(f"  [{idx}/{len(cues)}] OK  public/{rel}  ({size / 1024:.1f} KB)", flush=True)
            return size

    sizes = await asyncio.gather(*(synth_one(idx, cue) for idx, cue in enumerate(cues, start=1)))
    total = sum(sizes)
    print(f"Done ({data['lessonId']})! Total size: {total / 1024:.1f} KB", flush=True)


def sync_audio_registry() -> list[str]:
    """Ensure every lesson with all MP3 files present (on Supabase cloud-status or local disk) is registered in index.ts."""
    audio_dir = ROOT / "src" / "content" / "audio"
    cloud = load_cloud_status()
    cloud_all = set(cloud["gemini128k"]) | set(cloud["edge48k"])
    ready_ids: list[str] = []

    for json_path in sorted(audio_dir.glob("d[0-9][0-9][0-9].json")):
        lesson_id = json_path.stem
        data = json.loads(json_path.read_text(encoding="utf-8"))
        cues = data.get("cues", [])
        if not cues:
            continue
        all_present = all(
            (cue["src"].lstrip("/").removeprefix("audio/") in cloud_all)
            or (
                (ROOT / "public" / cue["src"].lstrip("/")).exists()
                and (ROOT / "public" / cue["src"].lstrip("/")).stat().st_size > 5000
            )
            for cue in cues
        )
        if not all_present:
            continue

        ready_ids.append(lesson_id)
        ts_path = audio_dir / f"{lesson_id}.ts"
        if not ts_path.exists():
            ts_path.write_text(
                f'import type {{ LessonAudioGuide }} from "./types";\n'
                f'import raw from "./{lesson_id}.json";\n\n'
                f"export const {lesson_id}Audio: LessonAudioGuide = raw as LessonAudioGuide;\n",
                encoding="utf-8",
            )

    imports = "\n".join(f'import {{ {lid}Audio }} from "./{lid}";' for lid in ready_ids)
    entries = "\n".join(f"  [{lid}Audio.lessonId]: {lid}Audio," for lid in ready_ids)
    index_content = (
        f"{imports}\n"
        f'import type {{ LessonAudioGuide }} from "./types";\n\n'
        f"export const LESSON_AUDIO: Record<string, LessonAudioGuide> = {{\n"
        f"{entries}\n"
        f"}};\n\n"
        f"export function getLessonAudio(lessonId: string): LessonAudioGuide | undefined {{\n"
        f"  return LESSON_AUDIO[lessonId];\n"
        f"}}\n\n"
        f'export type {{ AudioCue, AudioPauseCheckpoint, LessonAudioGuide }} from "./types";\n'
    )
    index_path = audio_dir / "index.ts"
    if not index_path.exists() or index_path.read_text(encoding="utf-8") != index_content:
        index_path.write_text(index_content, encoding="utf-8")
        print(f"Synced src/content/audio/index.ts ({len(ready_ids)} ready lessons).", flush=True)
    return ready_ids


def print_audit_summary(lesson_ids: list[str]) -> tuple[int, int, int]:
    audio_dir = ROOT / "src" / "content" / "audio"
    cloud = load_cloud_status()
    cloud_gemini = set(cloud["gemini128k"])
    cloud_edge = set(cloud["edge48k"])
    gemini_count = 0
    edge_count = 0
    missing_count = 0
    for lid in lesson_ids:
        manifest_path = audio_dir / f"{lid}.json"
        if not manifest_path.exists():
            continue
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        for cue in data.get("cues", []):
            rel = cue["src"].lstrip("/")
            obj_key = rel.removeprefix("audio/")
            p = ROOT / "public" / rel
            if obj_key in cloud_gemini or is_gemini_mp3(p):
                gemini_count += 1
            elif obj_key in cloud_edge or (p.exists() and p.stat().st_size > 5000):
                edge_count += 1
            else:
                missing_count += 1
    total = gemini_count + edge_count + missing_count
    print(
        f"AUDIT SUMMARY ({len(lesson_ids)} lessons / {total} tracks): "
        f"GEMINI_128K={gemini_count} | EDGE_48K={edge_count} | PENDING={missing_count}",
        flush=True,
    )
    return gemini_count, edge_count, missing_count


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Neural Path lesson audio tracks (.mp3)")
    parser.add_argument("lesson_ids", nargs="*", default=[], help="Lesson ID(s) (e.g. d001 d002)")
    parser.add_argument("--all", action="store_true", help="Process every dNNN.json manifest under src/content/audio/ in ascending order")
    parser.add_argument("--provider", choices=("gemini", "edge"), default="gemini", help="TTS provider (default: gemini)")
    parser.add_argument("--model", default=DEFAULT_GEMINI_MODEL, help=f"Gemini TTS model (default: {DEFAULT_GEMINI_MODEL})")
    parser.add_argument("--voice", default=None, help="Voice name override (e.g. Puck, Achird, Charon, Sulafat, Kore, th-TH-NiwatNeural)")
    parser.add_argument("--only", default=None, help="Synthesize only one sectionId (e.g. big-picture)")
    parser.add_argument("--delay", type=float, default=6.5, help="Seconds to pause between Gemini requests for free-tier RPM safety (default: 6.5)")
    parser.add_argument("--skip-existing", action="store_true", help="Skip cues whose MP3 file already exists and is > 5 KB")
    parser.add_argument("--skip-gemini", action="store_true", help="Skip cues already synthesized with Gemini 128kbps MP3 (local or Supabase)")
    parser.add_argument("--stop-on-daily-quota", action="store_true", help="Exit cleanly with code 0 when Gemini Free Tier daily quota is reached")
    parser.add_argument("--sync-registry", action="store_true", help="Automatically update src/content/audio/index.ts with every lesson that has all MP3s ready")
    parser.add_argument("--upload-supabase", action="store_true", help="Upload each synthesized MP3 to Supabase Storage bucket 'lesson-audio' and record in cloud-status.json")
    parser.add_argument("--prune-local", action="store_true", help="Delete local MP3 after uploading to Supabase Storage (keeps repo lightweight)")
    parser.add_argument("--fallback-edge", action="store_true", help="Automatically fall back to Edge Neural TTS (th-TH-NiwatNeural) if Gemini quota is exhausted")
    args = parser.parse_args()

    audio_dir = ROOT / "src" / "content" / "audio"
    cloud_gemini = set(load_cloud_status()["gemini128k"])
    if args.all:
        lesson_ids = [p.stem for p in sorted(audio_dir.glob("d[0-9][0-9][0-9].json"))]
    else:
        lesson_ids = args.lesson_ids or ["d001"]

    for lesson_id in lesson_ids:
        manifest_path = audio_dir / f"{lesson_id}.json"
        if not manifest_path.exists():
            raise SystemExit(f"Audio manifest not found: {manifest_path}")

        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        cues = data["cues"]
        if args.only:
            cues = [c for c in cues if c["sectionId"] == args.only]
            if not cues:
                raise SystemExit(f"No cue found with sectionId='{args.only}' in {lesson_id}")

        if args.provider == "gemini":
            # Fast-skip entire lesson without instantiating client when all cues are already Gemini 128k
            if args.skip_gemini and all(
                (c["src"].lstrip("/").removeprefix("audio/") in cloud_gemini)
                or is_gemini_mp3(ROOT / "public" / c["src"].lstrip("/"))
                for c in cues
            ):
                continue
            voice_name = args.voice or data.get("voiceId") or DEFAULT_GEMINI_VOICE
            keep_going = run_gemini(
                data,
                cues,
                args.model,
                voice_name,
                args.delay,
                skip_existing=args.skip_existing,
                skip_gemini=args.skip_gemini,
                fallback_edge=args.fallback_edge,
                stop_on_daily_quota=args.stop_on_daily_quota,
                upload_supabase=args.upload_supabase,
                prune_local=args.prune_local,
            )
            if not keep_going:
                break
        else:
            voice_name = args.voice or "th-TH-NiwatNeural"
            asyncio.run(run_edge(data, cues, voice_name, skip_existing=args.skip_existing))

    if args.sync_registry:
        sync_audio_registry()
    if args.all or args.skip_gemini:
        print_audit_summary(lesson_ids)


if __name__ == "__main__":
    main()
