import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "./Icons";

type Tone = "info" | "success" | "warning" | "danger";

/** Minimal editorial callout: a coloured left rule; only result states (success / danger) keep a soft tint. */
const TONES: Record<Tone, { Icon: typeof Info; iconCls: string; label: string; box: string }> = {
  info: { Icon: Info, iconCls: "text-cyan-ink", label: "ข้อสังเกต", box: "border-[color:var(--cyan)]" },
  success: { Icon: CheckCircle2, iconCls: "text-success", label: "ผ่านแล้ว", box: "border-success bg-[color:var(--success-soft)]" },
  warning: { Icon: AlertTriangle, iconCls: "text-warning", label: "ระวัง", box: "border-warning" },
  danger: { Icon: XCircle, iconCls: "text-danger", label: "ผิดพลาด", box: "border-danger bg-[color:var(--danger-soft)]" },
};

/** Tone is always conveyed by icon + label text, never by colour alone. */
export function Callout({
  tone = "info",
  title,
  children,
  role,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  role?: "status" | "alert";
}) {
  const { Icon, iconCls, label, box } = TONES[tone];
  return (
    <div role={role} className={`my-4 rounded-r-xl border-l-[3px] py-2.5 pl-4 pr-3 ${box}`}>
      <p className="flex items-center gap-2 font-semibold">
        <Icon size={17} strokeWidth={1.85} aria-hidden="true" className={`shrink-0 ${iconCls}`} />
        <span>{title ?? label}</span>
      </p>
      <div className="mt-1 text-[0.9375rem]">{children}</div>
    </div>
  );
}
