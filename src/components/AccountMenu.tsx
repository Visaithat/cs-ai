"use client";

import { useAuth } from "./AuthProvider";
import { Cloud, LogIn, LogOut, User } from "./Icons";

/** Compact header account controls: Login/Register trigger or logged-in username + cloud sync + Logout. */
export function AccountMenu() {
  const { user, configured, loading, syncState, openAuthModal, logout } = useAuth();

  if (!configured || loading) {
    return null;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => openAuthModal("login")}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-hair bg-surface px-2.5 text-xs font-semibold text-ink hover:border-brand hover:text-brand-ink sm:min-h-9 sm:px-3"
        aria-label="เข้าสู่ระบบหรือสมัครสมาชิก"
      >
        <LogIn size={15} strokeWidth={1.8} aria-hidden="true" />
        <span className="hidden min-[440px]:inline">เข้าสู่ระบบ</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-hair bg-surface px-2.5 text-xs font-semibold text-ink"
        title={
          syncState === "saving"
            ? "กำลังบันทึกขึ้น Supabase..."
            : syncState === "error"
              ? "ซิงก์ Supabase ไม่สำเร็จชั่วคราว"
              : "ซิงก์กับ Supabase แล้ว"
        }
      >
        <User size={14} strokeWidth={1.85} aria-hidden="true" className="text-brand-ink" />
        <span className="max-w-24 truncate">{user.username}</span>
        <Cloud
          size={13}
          strokeWidth={1.9}
          aria-hidden="true"
          className={
            syncState === "saving"
              ? "text-warning"
              : syncState === "error"
                ? "text-danger"
                : "text-success"
          }
        />
      </span>
      <button
        type="button"
        onClick={() => void logout()}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-xl border border-hair px-2 text-xs font-medium text-muted hover:border-danger/60 hover:text-danger sm:min-h-9 sm:min-w-9 sm:px-2.5"
        title="ออกจากระบบ"
        aria-label="ออกจากระบบ"
      >
        <LogOut size={15} strokeWidth={1.8} aria-hidden="true" />
        <span className="hidden md:inline">ออก</span>
      </button>
    </div>
  );
}
