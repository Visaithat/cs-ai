/**
 * Browser-safe Supabase client for static hosting (GitHub Pages + localhost).
 * Uses ONLY `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
 * (`sb_publishable_...`), relying on Supabase Auth + Postgres Row-Level Security (RLS)
 * on `public.user_progress`.
 */
import { parseState, type AppState } from "./progress";

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

interface RawAuthPayload {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: { username?: string; display_name?: string };
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
  if (!res.ok) {
    throw new Error(`Load progress failed (HTTP ${res.status})`);
  }
  const rows = (await res.json()) as Array<{ state?: unknown }>;
  if (!rows.length || !rows[0]?.state) {
    return { exists: false, state: null };
  }
  return { exists: true, state: parseState(JSON.stringify(rows[0].state)) };
}

export async function saveCloudUserProgress(
  session: SupabaseAuthSession,
  state: AppState,
): Promise<void> {
  const cfg = getConfig();
  if (!cfg) throw new Error("Supabase not configured");

  const active = await ensureFreshSession(session);
  if (!active) throw new Error("Session expired");

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
  if (!res.ok) {
    throw new Error(`Save progress failed (HTTP ${res.status})`);
  }
}
