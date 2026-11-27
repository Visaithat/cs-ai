"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** right-hand drawer from md up (bottom sheet below md) */
  side?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  titleId: string;
}

/**
 * Modal sheet on the native <dialog>: focus is trapped, the page behind is inert,
 * Escape closes, and focus returns to the control that opened it.
 */
export function Sheet({ open, onClose, title, side = false, children, footer, titleId }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  /**
   * Button and backdrop closes go through the native `dialog.close()`, so every path (Escape, ปิด,
   * backdrop) ends in the same `close` event. That event fires after the browser has restored focus,
   * the only moment a parent can safely correct it. Calling `onClose` directly here would run it
   * while the dialog is still open and focus is still inside it.
   */
  const requestClose = () => {
    const dialog = ref.current;
    if (dialog?.open) dialog.close();
    else onClose();
  };

  return (
    <dialog
      ref={ref}
      className={`sheet ${side ? "sheet-side" : ""}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <h2 id={titleId} className="text-lg font-semibold leading-snug">
          {title}
        </h2>
        <button type="button" className="btn btn-sm shrink-0" onClick={requestClose} aria-label="ปิด">
          <span aria-hidden="true">✕</span> ปิด
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{open ? children : null}</div>
      {footer ? <div className="border-t border-line px-4 py-3">{footer}</div> : null}
    </dialog>
  );
}
