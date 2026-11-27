/**
 * Browser-safe Supabase client for static hosting (GitHub Pages + localhost).
 * Uses ONLY `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
 * (`sb_publishable_...`).
 *
 * Progress persistence uses `public.user_progress` (when RLS + GRANT are enabled)
 * and automatically falls back to Supabase Auth `user_metadata.np_progress` so
 * cross-device sync works out of the box even before SQL GRANT is applied.
 */
import { parseState, type AppState, type LessonProgress } from "./progress";

const SESSION_STORAGE_KEY = "neural-path:sb-session";

export interface SupabaseAuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
  userId: string;
  username: string;
}

function getConfig(): { url: string; key: string } | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
  if (!url || !key) return null;
  return { url, key };
}

export function isSupabaseClientConfigured(): boolean {
  return getConfig() !== null;
}

export function normalizeUsername(raw: string): string {
  return raw.trim();
}

export function usernameToEmail(username: string): string {
  const slug = username.trim().toLowerCase();
  if (slug.includes("@")) return slug;
  return `${slug}@neuralpath.local`;
}

export function validateCredentials(
  usernameRaw: string,
  passwordRaw: string,
): { ok: true; username: string; password: string } | { ok: false; error: string } {
  const username = normalizeUsername(usernameRaw);
  const password = passwordRaw ?? "";
  if (username.length < 2 || username.length > 32) {
    return { ok: false, error: "ชื่อผู้ใช้ต้องยาว 2–32 ตัวอักษรครับ" };
  }
  if (!/^[A-Za-z0-9._@-]+$/.test(username)) {
    return { ok: false, error: "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษรอังกฤษ ตัวเลข และ . _ - ครับ" };
  }
  if (password.length < 6) {
    return { ok: false, error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรครับ" };
  }
  return { ok: true, username, password };
}

export function readStoredSession(): SupabaseAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SupabaseAuthSession>;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.userId || !parsed.username) {
      return null;
    }
    return parsed as SupabaseAuthSession;
  } catch {
    return null;
  }
}

export function writeStoredSession(session: SupabaseAuthSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!session) window.localStorage.removeItem(SESSION_STORAGE_KEY);
    else window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore quota/private-mode errors */
  }
}

/** Trim oversized scratchpad code only when saving to compact auth user_metadata fallback. */
function compactForMetadata(state: AppState): AppState {
  const lessons: Record<string, LessonProgress> = {};
  for (const [id, lp] of Object.entries(state.lessons)) {
    const { code, ...restEx } = lp.exercise;
    lessons[id] = {
      ...lp,
      exercise: code && code.length <= 500 ? { ...restEx, code } : restEx,
    };
  }
  return { ...state, lessons };
}

/** Merge cloud and local progress non-destructively (union of active dates, completed lessons & review cards). */
export function mergeAppStates(cloud: AppState, local: AppState): AppState {
  const activeDates = Array.from(new Set([...cloud.activeDates, ...local.activeDates])).sort().slice(-400);
  const lessons: Record<string, LessonProgress> = { ...cloud.lessons };
  for (const [id, loc] of Object.entries(local.lessons)) {
    const prev = lessons[id];
    if (!prev) {
      lessons[id] = loc;
    } else {
      lessons[id] = {
        completedOn: prev.completedOn ?? loc.completedOn,
        setup: { ...loc.setup, ...prev.setup },
        exampleStep: Math.max(prev.exampleStep, loc.exampleStep),
        exercise: {
          ...prev.exercise,
          code: loc.exercise.code ?? prev.exercise.code,
          attempts: Math.max(prev.exercise.attempts, loc.exercise.attempts),
          passed: prev.exercise.passed || loc.exercise.passed,
          mastered: prev.exercise.mastered || loc.exercise.mastered,
          hintsRevealed: Math.max(prev.exercise.hintsRevealed, loc.exercise.hintsRevealed),
          selfChecks: { ...(loc.exercise.selfChecks ?? {}), ...(prev.exercise.selfChecks ?? {}) },
        },
        quiz: {
          answers: { ...loc.quiz.answers, ...prev.quiz.answers },
          checked: { ...loc.quiz.checked, ...prev.quiz.checked },
        },
      };
    }
  }
  const seenReview = new Set(cloud.review.map((r) => `${r.lessonId}:${r.id}`));
  const review = [...cloud.review];
  for (const item of local.review) {
    const k = `${item.lessonId}:${item.id}`;
    if (!seenReview.has(k)) {
      seenReview.add(k);
      review.push(item);
    }
  }
  return {
    ...cloud,
    activeDates,
    lessons,
    review,
    graduated: Math.max(cloud.graduated, local.graduated),
  };
}

interface RawAuthPayload {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: { username?: string; display_name?: string; np_progress?: unknown };
  };
  msg?: string;
  error_description?: string;
}

function toSession(data: RawAuthPayload, fallbackUsername: string): SupabaseAuthSession | null {
  if (!data.access_token || !data.refresh_token || !data.user?.id) return null;
  const nowSec = Math.floor(Date.now() / 1000);
  const expiresAt =
    typeof data.expires_at === "number"
      ? data.expires_at
      : nowSec + (typeof data.expires_in === "number" ? data.expires_in : 3600);
  const username =
    data.user.user_metadata?.username ||
    data.user.user_metadata?.display_name ||
    fallbackUsername;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    userId: data.user.id,
    username,
  };
}

export async function signInWithUsername(
  usernameRaw: string,
  passwordRaw: string,
): Promise<{ ok: true; session: SupabaseAuthSession } | { ok: false; error: string }> {
  const cfg = getConfig();
  if (!cfg) return { ok: false, error: "ยังไม่ได้ตั้งค่า Supabase Publishable Key" };

  const check = validateCredentials(usernameRaw, passwordRaw);
  if (!check.ok) return check;

  const res = await fetch(`${cfg.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: cfg.key, "Content-Type": "application/json" },
    body: JSON.stringify({ email: usernameToEmail(check.username), password: check.password }),
  });

  const data = (await res.json().catch(() => ({}))) as RawAuthPayload;
  if (!res.ok) {
    return { ok: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้องครับ" };
  }
  const session = toSession(data, check.username);
  if (!session) {
    return { ok: false, error: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่" };
  }
  writeStoredSession(session);
  return { ok: true, session };
}

export async function signUpWithUsername(
  usernameRaw: string,
  passwordRaw: string,
): Promise<{ ok: true; session: SupabaseAuthSession } | { ok: false; error: string }> {
  const cfg = getConfig();
  if (!cfg) return { ok: false, error: "ยังไม่ได้ตั้งค่า Supabase Publishable Key" };

  const check = validateCredentials(usernameRaw, passwordRaw);
  if (!check.ok) return check;

  const res = await fetch(`${cfg.url}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: cfg.key, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: usernameToEmail(check.username),
      password: check.password,
      data: { username: check.username, display_name: check.username },
    }),
  });

  const data = (await res.json().catch(() => ({}))) as RawAuthPayload;
  if (!res.ok) {
    const msg = (data.msg || data.error_description || "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return { ok: false, error: "ชื่อผู้ใช้นี้มีอยู่แล้ว ลองเข้าสู่ระบบหรือตั้งชื่ออื่นครับ" };
    }
    return { ok: false, error: "ไม่สามารถสมัครสมาชิกได้ในขณะนี้ กรุณาลองใหม่" };
  }

  const session = toSession(data, check.username);
  if (!session) {
    return {
      ok: false,
      error: "สมัครสมาชิกแล้ว แต่ Supabase ยังเปิด Confirm Email อยู่ — ให้ปิด Confirm email ในหน้า Auth Providers แล้วลองเข้าสู่ระบบครับ",
    };
  }
  writeStoredSession(session);
  return { ok: true, session };
}

export async function ensureFreshSession(session: SupabaseAuthSession): Promise<SupabaseAuthSession | null> {
  const cfg = getConfig();
  if (!cfg) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  if (session.expiresAt > nowSec + 60) {
    return session;
  }

  try {
    const res = await fetch(`${cfg.url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: cfg.key, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });
    if (!res.ok) {
      writeStoredSession(null);
      return null;
    }
    const data = (await res.json()) as RawAuthPayload;
    const next = toSession(data, session.username);
    writeStoredSession(next);
    return next;
  } catch {
    return session;
  }
}

export async function signOutSupabase(session: SupabaseAuthSession | null): Promise<void> {
  const cfg = getConfig();
  writeStoredSession(null);
  if (!cfg || !session) return;
  try {
    await fetch(`${cfg.url}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  } catch {
    /* ignore network error on logout */
  }
}

export async function loadCloudUserProgress(
  session: SupabaseAuthSession,
): Promise<{ exists: boolean; state: AppState | null }> {
  const cfg = getConfig();
  if (!cfg) throw new Error("Supabase not configured");

  const active = await ensureFreshSession(session);
  if (!active) throw new Error("Session expired");

  // 1) Try public.user_progress table (RLS) first
  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/user_progress?user_id=eq.${encodeURIComponent(active.userId)}&select=state`,
      {
        method: "GET",
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${active.accessToken}`,
        },
      },
    );
    if (res.ok) {
      const rows = (await res.json()) as Array<{ state?: unknown }>;
      if (rows.length && rows[0]?.state) {
        return { exists: true, state: parseState(JSON.stringify(rows[0].state)) };
      }
    }
  } catch {
    /* fall through to auth metadata */
  }

  // 2) Fallback: read Supabase Auth user_metadata.np_progress (works without extra SQL GRANT!)
  const meRes = await fetch(`${cfg.url}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${active.accessToken}`,
    },
  });
  if (!meRes.ok) {
    throw new Error(`Load progress failed (HTTP ${meRes.status})`);
  }
  const me = (await meRes.json()) as { user_metadata?: { np_progress?: unknown } };
  if (me.user_metadata?.np_progress) {
    return { exists: true, state: parseState(JSON.stringify(me.user_metadata.np_progress)) };
  }
  return { exists: false, state: null };
}

export async function saveCloudUserProgress(
  session: SupabaseAuthSession,
  state: AppState,
): Promise<void> {
  const cfg = getConfig();
  if (!cfg) throw new Error("Supabase not configured");

  const active = await ensureFreshSession(session);
  if (!active) throw new Error("Session expired");

  // 1) Try public.user_progress table first
  let tableSaved = false;
  try {
    const res = await fetch(`${cfg.url}/rest/v1/user_progress?on_conflict=user_id`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${active.accessToken}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        user_id: active.userId,
        state,
        updated_at: new Date().toISOString(),
      }),
    });
    tableSaved = res.ok;
  } catch {
    tableSaved = false;
  }

  if (tableSaved) return;

  // 2) Fallback: persist compact progress to Supabase Auth user_metadata.np_progress
  const metaRes = await fetch(`${cfg.url}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${active.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        username: active.username,
        display_name: active.username,
        np_progress: compactForMetadata(state),
      },
    }),
  });
  if (!metaRes.ok) {
    throw new Error(`Save progress failed (HTTP ${metaRes.status})`);
  }
}
