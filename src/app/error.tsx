"use client";

import { resetState } from "@/lib/store";

/** Last-resort boundary: lets the learner recover from unexpected errors without opening DevTools. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="card p-6" role="alert">
        <h1 className="text-xl font-bold">หน้านี้โหลดไม่สำเร็จ</h1>
        <p className="mt-2 text-muted">
          เกิดข้อผิดพลาดที่ไม่คาดคิด อาจเกิดจากข้อมูลความคืบหน้าในเบราว์เซอร์ที่เสียหาย ลองโหลดใหม่ก่อน
          ถ้ายังไม่หายค่อยรีเซ็ตข้อมูลความคืบหน้า (ข้อมูลที่เก็บไว้ในเครื่องนี้จะถูกลบ)
        </p>
        <p className="mt-2 break-words font-mono text-xs text-muted">{error.message}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            ลองโหลดใหม่
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              resetState();
              reset();
            }}
          >
            รีเซ็ตความคืบหน้าในเครื่อง
          </button>
        </div>
      </div>
    </div>
  );
}
