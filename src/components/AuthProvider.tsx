"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { AppState } from "@/lib/progress";
import {
  getStateSnapshot,
  hasMeaningfulProgress,
  replaceState,
  resetState,
  subscribeStateMutations,
} from "@/lib/store";
import {
  ensureFreshSession,
  isSupabaseClientConfigured,
  loadCloudUserProgress,
  readStoredSession,
  saveCloudUserProgress,
  signInWithUsername,
  signOutSupabase,
  signUpWithUsername,
  type SupabaseAuthSession,
} from "@/lib/supabaseClient";
import { Cloud, LogIn, User, X } from "./Icons";
import { Sheet } from "./Sheet";

export interface AuthUser {
  userId: string;
  username: string;
}

export type SyncState = "idle" | "loading" | "saving" | "saved" | "error";

interface AuthContextValue {
  user: AuthUser | null;
  configured: boolean;
  loading: boolean;
  syncState: SyncState;
  syncNotice: string | null;
  dismissNotice: () => void;
  openAuthModal: (mode?: "login" | "register") => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseClientConfigured();
  const [session, setSession] = useState<SupabaseAuthSession | null>(null);
  const [loading, setLoading] = useState(configured);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const sessionRef = useRef<SupabaseAuthSession | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const pushCloudState = useCallback(async (activeSession: SupabaseAuthSession, state: AppState): Promise<boolean> => {
    setSyncState("saving");
    try {
      await saveCloudUserProgress(activeSession, state);
      setSyncState("saved");
      return true;
    } catch {
      setSyncState("error");
      return false;
    }
  }, []);

  /**
   * Synchronize local & Supabase `user_progress` right after login or session restoration:
   * - If cloud has no progress yet and browser localStorage has existing progress,
   *   automatically migrate local progress up to the user's Supabase row!
   * - If cloud already has progress, hydrate the client store with cloud progress.
   */
  const syncAfterSignIn = useCallback(
    async (activeSession: SupabaseAuthSession, { showMigrationNotice = false } = {}) => {
      setSyncState("loading");
      try {
        const data = await loadCloudUserProgress(activeSession);
        const local = getStateSnapshot();
        const cloudHasData = Boolean(data.exists && data.state && hasMeaningfulProgress(data.state));

        if (!cloudHasData && hasMeaningfulProgress(local)) {
          const ok = await pushCloudState(activeSession, local);
          if (ok && showMigrationNotice) {
            setSyncNotice(`ย้ายความคืบหน้าเดิมจากเบราว์เซอร์เข้าบัญชี ${activeSession.username} บน Supabase เรียบร้อยแล้ว`);
          }
        } else if (data.exists && data.state) {
          replaceState(data.state);
          setSyncState("saved");
        } else {
          setSyncState("saved");
        }
      } catch {
        setSyncState("error");
      }
    },
    [pushCloudState],
  );

  // Restore saved Supabase session on initial load
  useEffect(() => {
    if (!configured) return;
    let active = true;
    (async () => {
      try {
        const stored = readStoredSession();
        if (!stored) return;
        const fresh = await ensureFreshSession(stored);
        if (!active || !fresh) return;
        setSession(fresh);
        await syncAfterSignIn(fresh, { showMigrationNotice: false });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [configured, syncAfterSignIn]);

  // Debounced auto-save to Supabase whenever logged-in user mutates progress
  useEffect(() => {
    return subscribeStateMutations((nextState) => {
      const current = sessionRef.current;
      if (!current) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSyncState("saving");
      saveTimerRef.current = setTimeout(() => {
        void pushCloudState(current, nextState);
      }, 700);
    });
  }, [pushCloudState]);

  const openAuthModal = useCallback((initialMode: "login" | "register" = "login") => {
    setMode(initialMode);
    setFormError(null);
    setPassword("");
    setModalOpen(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const result =
        mode === "register"
          ? await signUpWithUsername(username, password)
          : await signInWithUsername(username, password);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setSession(result.session);
      setModalOpen(false);
      setUsername("");
      setPassword("");
      await syncAfterSignIn(result.session, { showMigrationNotice: true });
    } catch {
      setFormError("เชื่อมต่อ Supabase ไม่ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const prev = sessionRef.current;
    setSession(null);
    setSyncState("idle");
    setSyncNotice(null);
    resetState({ silent: true });
    await signOutSupabase(prev);
  }, []);

  const dismissNotice = useCallback(() => setSyncNotice(null), []);
  const user: AuthUser | null = session ? { userId: session.userId, username: session.username } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        configured,
        loading,
        syncState,
        syncNotice,
        dismissNotice,
        openAuthModal,
        logout,
      }}
    >
      {syncNotice ? (
        <div
          role="status"
          aria-live="polite"
          className="no-print border-b border-success/40 bg-[color:var(--speaking-soft)] px-4 py-2 text-sm text-[color:var(--speaking-ink)]"
        >
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-medium">
              <Cloud size={15} strokeWidth={2} aria-hidden="true" className="shrink-0 text-success" />
              <span>{syncNotice}</span>
            </span>
            <button
              type="button"
              onClick={dismissNotice}
              aria-label="ปิดการแจ้งเตือน"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink"
            >
              <X size={15} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {children}

      <Sheet
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === "login" ? "เข้าสู่ระบบ Neural Path" : "สมัครบัญชีใหม่"}
        titleId={titleId}
      >
        <div className="space-y-4">
          <div role="tablist" aria-label="เลือกเข้าสู่ระบบหรือสมัครสมาชิก" className="grid grid-cols-2 gap-1 rounded-xl border border-hair bg-surface2 p-1">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => {
                setMode("login");
                setFormError(null);
              }}
              className={`min-h-9 rounded-lg text-sm font-semibold transition-colors ${
                mode === "login" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => {
                setMode("register");
                setFormError(null);
              }}
              className={`min-h-9 rounded-lg text-sm font-semibold transition-colors ${
                mode === "register" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            {mode === "login"
              ? "เข้าสู่ระบบเพื่อซิงก์ความคืบหน้า การ์ดทบทวน และโค้ดแบบฝึกหัดข้ามอุปกรณ์ผ่าน Supabase (หากในเบราว์เซอร์นี้มีความคืบหน้าเดิมอยู่ ระบบจะย้ายเข้าบัญชีให้อัตโนมัติในครั้งแรก)"
              : "สร้างบัญชีด้วยชื่อผู้ใช้และรหัสผ่านอย่างน้อย 6 ตัวอักษร เพื่อบันทึกความคืบหน้าขึ้น Supabase"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="np-auth-username" className="block text-sm font-medium text-ink">
                ชื่อผู้ใช้ (Username)
              </label>
              <input
                id="np-auth-username"
                type="text"
                autoComplete="username"
                required
                minLength={2}
                maxLength={32}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น Timmy"
                className="mt-1 w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
              />
            </div>

            <div>
              <label htmlFor="np-auth-password" className="block text-sm font-medium text-ink">
                รหัสผ่าน (Password)
              </label>
              <input
                id="np-auth-password"
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="mt-1 w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
              />
            </div>

            {formError ? (
              <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
                {formError}
              </p>
            ) : null}

            <button type="submit" disabled={submitting} className="btn btn-primary w-full justify-center">
              {mode === "login" ? <LogIn size={16} strokeWidth={1.85} aria-hidden="true" /> : <User size={16} strokeWidth={1.85} aria-hidden="true" />}
              <span>{submitting ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชีและเข้าสู่ระบบ"}</span>
            </button>
          </form>
        </div>
      </Sheet>
    </AuthContext.Provider>
  );
}
