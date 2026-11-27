"use client";

import { useId, useState, type CSSProperties } from "react";

interface VisualProps {
  reduced?: boolean;
}

const ACTIVE_BTN_STYLE: CSSProperties = {
  borderColor: "var(--brand)",
  background: "var(--brand-soft)",
  color: "var(--brand-ink)",
};

/* ========================================================================== */
/* 1. DataLeakageSplitVisual (data-leakage-split)                             */
/* ========================================================================== */

type SplitMode = "leaky" | "safe";

export function DataLeakageSplitVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<SplitMode>("leaky");
  const isSafe = mode === "safe";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const fwdMarkerId = `${uid}-leak-fwd`;
  const leakMarkerId = `${uid}-leak-back`;
  const safeParamMarkerId = `${uid}-safe-param`;

  const captionText = isSafe
    ? "Safe Pipeline: แบ่ง Train/Test ก่อนเสมอ แล้วสร้างกำแพงกั้น (Firewall) เพื่อ fit Scaler/TF-IDF เฉพาะบน Train เท่านั้น ส่วน Test ใช้แค่ .transform() → ได้คะแนนจริง 0.86 ที่เชื่อถือได้บน Production"
    : "Data Leakage!: การสั่ง fit_transform() ทั้งชุดก่อน Split ทำให้ค่าเฉลี่ย (μ, σ) และคลังคำศัพท์ของ Test รั่วไหลย้อนกลับเข้าไปช่วย Train → โมเดลเหมือนแอบเห็นข้อสอบ ได้คะแนนหลอก 0.98 แต่พังเมื่อเจอข้อมูลจริง";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับดูแบบ Data Leakage กับแบบ Split ก่อน Fit" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!isSafe}
          className={!isSafe ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isSafe ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("leaky")}
        >
          Leaky (Fit Scaler/TF-IDF ก่อน Split!)
        </button>
        <button
          type="button"
          aria-pressed={isSafe}
          className={isSafe ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isSafe ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("safe")}
        >
          Safe (Split ก่อน → Fit เฉพาะ Train)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 270"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพเปรียบเทียบ Data Leakage เมื่อ Fit ก่อน Split กับวิธีปลอดภัยที่ Split ก่อน Fit"
        >
          <defs>
            <marker id={fwdMarkerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isSafe ? "var(--brand)" : "var(--warning)"} />
            </marker>
            <marker id={leakMarkerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id={safeParamMarkerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Left: Raw Dataset Box */}
          <rect x="14" y="18" width="112" height="164" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
          <text x="70" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            Dataset 100%
          </text>
          <text x="70" y="54" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
            ข้อมูลดิบทั้งหมด
          </text>
          {/* Mini Train + Test blocks inside raw dataset */}
          <rect x="26" y="66" width="88" height="68" rx="8" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.25" />
          <text x="70" y="96" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            80%
          </text>
          <text x="70" y="114" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
            Train rows
          </text>
          <rect x="26" y="140" width="88" height="32" rx="8" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeWidth="1.25" />
          <text x="70" y="160" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
            20% Test
          </text>

          {!isSafe ? (
            /* ==================== LEAKY FLOW ==================== */
            <g>
              {/* Arrow: Dataset -> Scaler/TF-IDF */}
              <line
                x1="126"
                y1="94"
                x2="152"
                y2="94"
                stroke="var(--warning)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 5"}
                className={flowClass}
                markerEnd={`url(#${fwdMarkerId})`}
              />

              {/* Step 2: Leaky Fit ALL */}
              <rect
                x="156"
                y="18"
                width="162"
                height="130"
                rx="12"
                fill="var(--danger-soft)"
                stroke="var(--danger)"
                strokeWidth="2"
                className={txClass}
              />
              <rect x="166" y="28" width="142" height="24" rx="6" fill="var(--surface)" stroke="var(--danger)" strokeWidth="1" />
              <text x="237" y="44" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                fit_transform(ALL)
              </text>
              <text x="237" y="72" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
                Scaler / TF-IDF
              </text>
              <text x="237" y="92" textAnchor="middle" fontSize="11" fill="var(--danger)" fontFamily="var(--font-mono)">
                μ, σ = Train + Test!
              </text>
              <text x="237" y="110" textAnchor="middle" fontSize="11" fill="var(--danger)" fontFamily="var(--font-mono)">
                vocab = Train + Test!
              </text>
              <text x="237" y="132" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                แอบอ่านสถิติ Test หมดแล้ว
              </text>

              {/* Arrows: Scaler -> Train & Test */}
              <path
                d="M 318 68 C 334 68, 334 52, 350 52"
                fill="none"
                stroke="var(--warning)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 5"}
                className={flowClass}
                markerEnd={`url(#${fwdMarkerId})`}
              />
              <path
                d="M 318 108 C 334 108, 334 128, 350 128"
                fill="none"
                stroke="var(--danger)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 5"}
                className={flowClass}
                markerEnd={`url(#${leakMarkerId})`}
              />

              {/* Step 3: Split AFTER Fit */}
              <rect x="354" y="18" width="138" height="66" rx="10" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1.5" />
              <text x="423" y="41" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--warning)" fontFamily="var(--font-mono)">
                Train (80%)
              </text>
              <text x="423" y="60" textAnchor="middle" fontSize="11" fill="var(--fg)" fontFamily="var(--font-sans)">
                ปนเปื้อนสถิติ Test
              </text>
              <text x="423" y="75" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                เหมือนเห็นข้อสอบก่อน
              </text>

              <rect x="354" y="96" width="138" height="58" rx="10" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.5" />
              <text x="423" y="118" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                Test (20%)
              </text>
              <text x="423" y="138" textAnchor="middle" fontSize="11" fill="var(--danger)" fontFamily="var(--font-sans)">
                สถิติรั่วกลับไป Train!
              </text>

              {/* Animated Backward Leakage Path from Test back to Scaler */}
              <path
                d="M 423 154 C 423 188, 237 188, 237 152"
                fill="none"
                stroke="var(--danger)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? "4 4" : "6 5"}
                className={flowClass}
                markerEnd={`url(#${leakMarkerId})`}
              />
              <rect x="262" y="168" width="142" height="22" rx="11" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1" />
              <text x="333" y="183" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                Test stats รั่วไหลย้อนกลับ!
              </text>

              {/* Arrows into Fake Score */}
              <line
                x1="492"
                y1="84"
                x2="518"
                y2="84"
                stroke="var(--danger)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 5"}
                className={flowClass}
                markerEnd={`url(#${leakMarkerId})`}
              />

              {/* Step 4: Fake Score Card */}
              <rect
                x="522"
                y="18"
                width="144"
                height="164"
                rx="12"
                fill="var(--danger-soft)"
                stroke="var(--danger)"
                strokeWidth="2"
                className={txClass}
              />
              <text x="594" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                Test Accuracy / F1
              </text>
              <text x="594" y="90" textAnchor="middle" fontSize="34" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                0.98
              </text>
              <rect x="536" y="106" width="116" height="24" rx="12" fill="var(--surface)" stroke="var(--danger)" strokeWidth="1" />
              <text x="594" y="122" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                คะแนนหลอก (Fake!)
              </text>
              <text x="594" y="150" textAnchor="middle" fontSize="11" fill="var(--fg)" fontFamily="var(--font-sans)">
                ขึ้นจริงอาจร่วงเหลือ 0.72
              </text>
              <text x="594" y="168" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                Over-optimistic
              </text>
            </g>
          ) : (
            /* ==================== SAFE FLOW ==================== */
            <g>
              {/* Split arrows from Dataset into Train (top) and Test (bottom) */}
              <path
                d="M 126 78 C 140 78, 140 54, 154 54"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 5"}
                className={flowClass}
                markerEnd={`url(#${fwdMarkerId})`}
              />
              <path
                d="M 126 146 C 140 146, 140 156, 154 156"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 5"}
                className={flowClass}
                markerEnd={`url(#${fwdMarkerId})`}
              />

              {/* Step 2: Train & Test split FIRST */}
              <rect x="158" y="18" width="122" height="68" rx="10" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.75" />
              <text x="219" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                Train (80%)
              </text>
              <text x="219" y="61" textAnchor="middle" fontSize="11" fill="var(--fg)" fontFamily="var(--font-sans)">
                ใช้ fit พารามิเตอร์
              </text>
              <text x="219" y="76" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                split ก่อนเสมอ
              </text>

              <rect x="158" y="122" width="122" height="60" rx="10" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeWidth="1.75" />
              <text x="219" y="146" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
                Test (20%)
              </text>
              <text x="219" y="166" textAnchor="middle" fontSize="11" fill="var(--fg)" fontFamily="var(--font-sans)">
                เก็บล็อกแยกไว้ 100%
              </text>

              {/* SOLID FIREWALL BARRIER between Train lane and Test lane */}
              <line x1="154" y1="104" x2="432" y2="104" stroke="var(--success)" strokeWidth="3.5" />
              <rect x="172" y="93" width="224" height="22" rx="11" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.5" />
              <text x="284" y="108" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-sans)">
                FIREWALL: Test ห้ามไหลกลับไป Fit
              </text>

              {/* Arrows into Step 3 */}
              <line
                x1="280"
                y1="52"
                x2="314"
                y2="52"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 5"}
                className={flowClass}
                markerEnd={`url(#${fwdMarkerId})`}
              />
              <line
                x1="280"
                y1="152"
                x2="314"
                y2="152"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 5"}
                className={flowClass}
                markerEnd={`url(#${fwdMarkerId})`}
              />

              {/* Step 3a: fit_transform(Train) */}
              <rect x="318" y="18" width="174" height="68" rx="10" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.75" />
              <text x="405" y="40" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                fit_transform(X_train)
              </text>
              <text x="405" y="59" textAnchor="middle" fontSize="11" fill="var(--fg)" fontFamily="var(--font-sans)">
                เรียนรู้ μ, σ จาก Train เท่านั้น
              </text>
              <text x="405" y="75" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                save μ_train, σ_train
              </text>

              {/* One-way parameter transfer arrow DOWN (Train params -> Test transform) */}
              <line
                x1="454"
                y1="86"
                x2="454"
                y2="118"
                stroke="var(--success)"
                strokeWidth="2"
                markerEnd={`url(#${safeParamMarkerId})`}
              />
              <text x="462" y="107" fontSize="10" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                μ, σ
              </text>

              {/* Step 3b: transform(Test) ONLY */}
              <rect x="318" y="122" width="174" height="60" rx="10" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="1.75" />
              <text x="405" y="144" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
                transform(X_test)
              </text>
              <text x="405" y="164" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                ห้าม fit! ใช้ค่า μ, σ ของ Train
              </text>

              {/* Arrows into Honest Score */}
              <path
                d="M 492 52 C 506 52, 506 86, 518 86"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 5"}
                className={flowClass}
                markerEnd={`url(#${safeParamMarkerId})`}
              />
              <path
                d="M 492 152 C 506 152, 506 116, 518 116"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 5"}
                className={flowClass}
                markerEnd={`url(#${safeParamMarkerId})`}
              />

              {/* Step 4: Honest Score Card */}
              <rect
                x="522"
                y="18"
                width="144"
                height="164"
                rx="12"
                fill="var(--success-soft)"
                stroke="var(--success)"
                strokeWidth="2"
                className={txClass}
              />
              <text x="594" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-sans)">
                Test Accuracy / F1
              </text>
              <text x="594" y="90" textAnchor="middle" fontSize="34" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                0.86
              </text>
              <rect x="536" y="106" width="116" height="24" rx="12" fill="var(--surface)" stroke="var(--success)" strokeWidth="1" />
              <text x="594" y="122" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-sans)">
                คะแนนจริง (Honest)
              </text>
              <text x="594" y="150" textAnchor="middle" fontSize="11" fill="var(--fg)" fontFamily="var(--font-sans)">
                Test บริสุทธิ์ไม่เคยถูกเห็น
              </text>
              <text x="594" y="168" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                Production-ready
              </text>
            </g>
          )}

          {/* Bottom Summary Strip */}
          <rect x="14" y="200" width="652" height="56" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="222" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            ลำดับคำสั่งที่เกิดขึ้นจริง:
          </text>
          <text
            x="30"
            y="243"
            fontSize="11"
            fontWeight="600"
            fill={isSafe ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {isSafe
              ? "split(X, y)  →  fit_transform(X_train)  →  transform(X_test)"
              : "fit_transform(X_all)  →  split(X_scaled, y)   # Test stats leaked!"}
          </text>
          <rect
            x="556"
            y="214"
            width="98"
            height="28"
            rx="14"
            fill={isSafe ? "var(--success-soft)" : "var(--danger-soft)"}
            stroke={isSafe ? "var(--success)" : "var(--danger)"}
          />
          <text
            x="605"
            y="232"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={isSafe ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {isSafe ? "SAFE ✓" : "LEAKY ✕"}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 2. SklearnPipelineVisual (sklearn-pipeline)                                */
/* ========================================================================== */

type PipelineStepId = 0 | 1 | 2 | 3;

interface PipelineStepInfo {
  id: PipelineStepId;
  label: string;
  code: string;
  detail: string;
}

const PIPELINE_STEPS: PipelineStepInfo[] = [
  {
    id: 0,
    label: "1. ColumnTransformer Split",
    code: 'ct = ColumnTransformer([("num", num_pipe, num_cols), ("cat", cat_pipe, cat_cols)])',
    detail:
      "ขั้นที่ 1 (ColumnTransformer Split): แยกคอลัมน์ตัวเลข (age, amount) กับคอลัมน์หมวดหมู่ (province, tier) ออกจากตารางเดียวเพื่อส่งเข้าสายประมวลผลเฉพาะทางพร้อมกัน",
  },
  {
    id: 1,
    label: "2. Numeric Branch",
    code: 'num_pipe = Pipeline([("imp", SimpleImputer("median")), ("sc", StandardScaler())])',
    detail:
      "ขั้นที่ 2 (Numeric Branch): สายตัวเลขเติมค่าว่างด้วยค่ามัธยฐาน (median) แล้วปรับสเกลด้วย StandardScaler โดย fit เฉพาะใน fold/train ป้องกัน Leakage อัตโนมัติ",
  },
  {
    id: 2,
    label: "3. Categorical Branch",
    code: 'cat_pipe = Pipeline([("imp", SimpleImputer("most_freq")), ("ohe", OneHotEncoder())])',
    detail:
      'ขั้นที่ 3 (Categorical Branch): สายหมวดหมู่เติมค่าว่างด้วยฐานนิยม แล้วแปลงเป็นคอลัมน์ 0/1 ด้วย OneHotEncoder(handle_unknown="ignore") เพื่อไม่ให้พังเมื่อเจอหมวดหมู่ใหม่',
  },
  {
    id: 3,
    label: "4. Classifier & Predict",
    code: 'pipe = Pipeline([("prep", ct), ("clf", model)]); joblib.dump(pipe, "model.joblib")',
    detail:
      "ขั้นที่ 4 (Classifier & Predict): รวมฟีเจอร์จากทั้ง 2 สายกลับมาเป็นเมทริกซ์เดียว ส่งต่อเข้าโมเดล และบันทึกเป็นไฟล์เดียว (.joblib) เรียก pipe.predict(df_new) ได้ทันทีโดยไม่ลืมขั้นตอนเตรียมข้อมูล",
  },
];

export function SklearnPipelineVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [activeStep, setActiveStep] = useState<PipelineStepId>(0);
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const cyanArrowId = `${uid}-pipe-cyan`;
  const brandArrowId = `${uid}-pipe-brand`;
  const successArrowId = `${uid}-pipe-success`;

  const currentInfo = PIPELINE_STEPS[activeStep];

  const isSplit = activeStep === 0;
  const isNum = activeStep === 1;
  const isCat = activeStep === 2;
  const isClf = activeStep === 3;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกขั้นตอนใน scikit-learn Pipeline" className="flex flex-wrap gap-2">
        {PIPELINE_STEPS.map((step) => {
          const active = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setActiveStep(step.id)}
            >
              {step.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพ scikit-learn Pipeline ที่แยกและรวมสายข้อมูล Numeric และ Categorical ภายในออบเจกต์เดียว"
        >
          <defs>
            <marker id={cyanArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id={brandArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={successArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Outer Serializable Pipeline Container */}
          <rect
            x="14"
            y="14"
            width="652"
            height="204"
            rx="14"
            fill="var(--surface)"
            stroke="var(--brand)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <rect x="28" y="4" width="234" height="22" rx="11" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1" />
          <text x="145" y="19" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            sklearn.pipeline.Pipeline (1 Object)
          </text>
          <rect x="498" y="4" width="154" height="22" rx="11" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1" />
          <text x="575" y="19" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
            save → model.joblib
          </text>

          {/* Parallel Flow Paths: Stage 1 -> Stage 2 (Top) & Stage 3 (Bottom) */}
          <path
            d="M 164 96 C 186 96, 184 74, 206 74"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={isSplit || isNum ? "3" : "2"}
            opacity={isSplit || isNum ? 1 : 0.45}
            strokeDasharray={reduced ? undefined : "6 5"}
            className={flowClass}
            markerEnd={`url(#${cyanArrowId})`}
          />
          <path
            d="M 164 148 C 186 148, 184 166, 206 166"
            fill="none"
            stroke="var(--brand)"
            strokeWidth={isSplit || isCat ? "3" : "2"}
            opacity={isSplit || isCat ? 1 : 0.45}
            strokeDasharray={reduced ? undefined : "6 5"}
            className={flowClass}
            markerEnd={`url(#${brandArrowId})`}
          />

          {/* Merge Paths: Stage 2 & Stage 3 -> Merge Node -> Stage 4 */}
          <path
            d="M 436 74 C 456 74, 456 112, 472 118"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={isNum || isClf ? "3" : "2"}
            opacity={isNum || isClf ? 1 : 0.45}
            strokeDasharray={reduced ? undefined : "6 5"}
            className={flowClass}
          />
          <path
            d="M 436 166 C 456 166, 456 128, 472 122"
            fill="none"
            stroke="var(--brand)"
            strokeWidth={isCat || isClf ? "3" : "2"}
            opacity={isCat || isClf ? 1 : 0.45}
            strokeDasharray={reduced ? undefined : "6 5"}
            className={flowClass}
          />
          <line
            x1="472"
            y1="120"
            x2="500"
            y2="120"
            stroke="var(--success)"
            strokeWidth={isClf ? "3" : "2.25"}
            opacity={isClf ? 1 : 0.6}
            strokeDasharray={reduced ? undefined : "6 5"}
            className={flowClass}
            markerEnd={`url(#${successArrowId})`}
          />

          {/* Merge Circle Badge */}
          <circle
            cx="472"
            cy="120"
            r="13"
            fill={isClf ? "var(--success-soft)" : "var(--surface-2)"}
            stroke={isClf ? "var(--success)" : "var(--line)"}
            strokeWidth="1.5"
            className={txClass}
          />
          <text x="472" y="124" textAnchor="middle" fontSize="13" fontWeight="700" fill={isClf ? "var(--success)" : "var(--muted)"} fontFamily="var(--font-mono)">
            +
          </text>
          <text x="472" y="148" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
            concat
          </text>

          {/* STAGE 1: ColumnTransformer Split */}
          <g onClick={() => setActiveStep(0)} style={{ cursor: "pointer" }}>
            <rect
              x="28"
              y="46"
              width="136"
              height="152"
              rx="12"
              fill={isSplit ? "var(--brand-soft)" : "var(--surface-2)"}
              stroke={isSplit ? "var(--brand)" : "var(--line)"}
              strokeWidth={isSplit ? "2.25" : "1.25"}
              opacity={isSplit ? 1 : 0.78}
              className={txClass}
            />
            <text x="96" y="68" textAnchor="middle" fontSize="10" fontWeight="700" fill={isSplit ? "var(--brand-ink)" : "var(--fg)"} fontFamily="var(--font-mono)">
              1. ColumnTransformer
            </text>
            <text x="96" y="84" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              แยกคอลัมน์ตามชนิด
            </text>

            {/* Numeric columns chip */}
            <rect x="40" y="96" width="112" height="38" rx="8" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeWidth="1.25" />
            <text x="96" y="112" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
              num_cols
            </text>
            <text x="96" y="126" textAnchor="middle" fontSize="10" fill="var(--fg)" fontFamily="var(--font-mono)">
              age, amount
            </text>

            {/* Categorical columns chip */}
            <rect x="40" y="144" width="112" height="38" rx="8" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.25" />
            <text x="96" y="160" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              cat_cols
            </text>
            <text x="96" y="174" textAnchor="middle" fontSize="10" fill="var(--fg)" fontFamily="var(--font-mono)">
              province, tier
            </text>
          </g>

          {/* STAGE 2: Numeric Branch (Top Track) */}
          <g onClick={() => setActiveStep(1)} style={{ cursor: "pointer" }}>
            <rect
              x="210"
              y="38"
              width="226"
              height="74"
              rx="12"
              fill={isNum ? "var(--cyan-soft)" : "var(--surface-2)"}
              stroke={isNum ? "var(--cyan)" : "var(--line)"}
              strokeWidth={isNum ? "2.25" : "1.25"}
              opacity={isNum ? 1 : 0.72}
              className={txClass}
            />
            <text x="224" y="57" fontSize="11" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
              2. Numeric Branch
            </text>
            <rect x="222" y="66" width="94" height="24" rx="6" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="1" />
            <text x="269" y="82" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
              Imputer(med)
            </text>
            <text x="323" y="82" textAnchor="middle" fontSize="11" fill="var(--cyan)" fontFamily="var(--font-mono)">
              →
            </text>
            <rect x="330" y="66" width="94" height="24" rx="6" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="1" />
            <text x="377" y="82" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
              StdScaler
            </text>
            <text x="323" y="105" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-sans)">
              เติมค่าว่าง + ปรับสเกลให้อยู่หน่วยเดียวกัน
            </text>
          </g>

          {/* STAGE 3: Categorical Branch (Bottom Track) */}
          <g onClick={() => setActiveStep(2)} style={{ cursor: "pointer" }}>
            <rect
              x="210"
              y="128"
              width="226"
              height="74"
              rx="12"
              fill={isCat ? "var(--brand-soft)" : "var(--surface-2)"}
              stroke={isCat ? "var(--brand)" : "var(--line)"}
              strokeWidth={isCat ? "2.25" : "1.25"}
              opacity={isCat ? 1 : 0.72}
              className={txClass}
            />
            <text x="224" y="147" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              3. Categorical Branch
            </text>
            <rect x="222" y="156" width="94" height="24" rx="6" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1" />
            <text x="269" y="172" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
              Imputer(mode)
            </text>
            <text x="323" y="172" textAnchor="middle" fontSize="11" fill="var(--brand)" fontFamily="var(--font-mono)">
              →
            </text>
            <rect x="330" y="156" width="94" height="24" rx="6" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1" />
            <text x="377" y="172" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
              OneHotEnc
            </text>
            <text x="323" y="195" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-sans)">
              แปลงข้อความเป็น 0/1 + กันค่าใหม่แปลกปลอม
            </text>
          </g>

          {/* STAGE 4: Classifier & Predict */}
          <g onClick={() => setActiveStep(3)} style={{ cursor: "pointer" }}>
            <rect
              x="504"
              y="46"
              width="148"
              height="152"
              rx="12"
              fill={isClf ? "var(--success-soft)" : "var(--surface-2)"}
              stroke={isClf ? "var(--success)" : "var(--line)"}
              strokeWidth={isClf ? "2.25" : "1.25"}
              opacity={isClf ? 1 : 0.78}
              className={txClass}
            />
            <text x="578" y="68" textAnchor="middle" fontSize="11" fontWeight="700" fill={isClf ? "var(--success)" : "var(--fg)"} fontFamily="var(--font-mono)">
              4. Classifier
            </text>
            <text x="578" y="84" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              รวมฟีเจอร์แล้วทำนาย
            </text>
            <rect x="516" y="96" width="124" height="32" rx="8" fill="var(--surface)" stroke="var(--success)" strokeWidth="1.25" />
            <text x="578" y="116" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              Logistic / XGB
            </text>
            <rect x="516" y="138" width="124" height="26" rx="13" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1" />
            <text x="578" y="155" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
              pipe.predict(X)
            </text>
            <text x="578" y="184" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-sans)">
              กัน Skew ตอน Deploy
            </text>
          </g>

          {/* Bottom Active Code Bar */}
          <rect x="14" y="228" width="652" height="40" rx="10" fill="var(--surface)" stroke="var(--line)" />
          <text x="28" y="252" fontSize="11" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            {currentInfo.code}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {currentInfo.detail}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 3. PrecisionRecallThreshVisual (precision-recall-thresh)                   */
/* ========================================================================== */

// 30 actual positive cases (e.g., Fraud / Churn) & 70 actual negative cases
const POSITIVE_PROBS: number[] = [
  0.18, 0.24, 0.28, 0.31, 0.35, 0.39, 0.43, 0.47, 0.51, 0.54,
  0.57, 0.60, 0.63, 0.66, 0.68, 0.71, 0.73, 0.75, 0.77, 0.79,
  0.81, 0.83, 0.85, 0.87, 0.89, 0.91, 0.92, 0.94, 0.95, 0.97,
];

const NEGATIVE_PROBS: number[] = [
  0.02, 0.03, 0.03, 0.04, 0.04, 0.05, 0.05, 0.05, 0.06, 0.06,
  0.06, 0.07, 0.07, 0.07, 0.08, 0.08, 0.08, 0.09, 0.09, 0.09,
  0.10, 0.10, 0.10, 0.11, 0.11, 0.11, 0.12, 0.12, 0.12, 0.12,
  0.13, 0.13, 0.13, 0.13, 0.14, 0.14, 0.14, 0.14, 0.14, 0.14,
  0.16, 0.17, 0.18, 0.19, 0.20, 0.21, 0.22, 0.24, 0.26, 0.27,
  0.29, 0.30, 0.32, 0.33, 0.35, 0.36, 0.38, 0.40, 0.41, 0.43,
  0.45, 0.46, 0.48, 0.52, 0.55, 0.58, 0.62, 0.67, 0.72, 0.79,
];

const FN_COST_THB = 100;
const FP_COST_THB = 15;

interface ThresholdPreset {
  label: string;
  value: number;
}

const THRESH_PRESETS: ThresholdPreset[] = [
  { label: "เน้นจับให้ครบ (0.25)", value: 0.25 },
  { label: "สมดุล (0.50)", value: 0.5 },
  { label: "เน้นทายแม่น (0.75)", value: 0.75 },
];

export function PrecisionRecallThreshVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [threshold, setThreshold] = useState<number>(0.5);

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const arrowId = `${uid}-thresh-arrow`;

  const tp = POSITIVE_PROBS.filter((p) => p >= threshold).length;
  const fn = POSITIVE_PROBS.length - tp;
  const fp = NEGATIVE_PROBS.filter((p) => p >= threshold).length;
  const tn = NEGATIVE_PROBS.length - fp;

  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  const totalCost = fn * FN_COST_THB + fp * FP_COST_THB;

  const costColor =
    totalCost <= 650 ? "var(--success)" : totalCost <= 1150 ? "var(--warning)" : "var(--danger)";
  const costSoft =
    totalCost <= 650 ? "var(--success-soft)" : totalCost <= 1150 ? "var(--warning-soft)" : "var(--danger-soft)";

  // Probability strip coordinates (x: 42 to 638 for p in [0, 1])
  const stripX0 = 42;
  const stripW = 596;
  const threshX = stripX0 + threshold * stripW;

  const barMaxW = 138;
  const precW = Math.max(4, Math.round(precision * barMaxW));
  const recW = Math.max(4, Math.round(recall * barMaxW));
  const f1W = Math.max(4, Math.round(f1 * barMaxW));
  const costBarW = Math.min(196, Math.max(8, Math.round((totalCost / 2200) * 196)));

  const captionText = `Threshold = ${threshold.toFixed(2)} → จับถูก TP=${tp}, หลุด FN=${fn} (เสียหาย ${fn * FN_COST_THB}฿), ทายเกิน FP=${fp} (ต้นทุน ${fp * FP_COST_THB}฿) | Precision=${(precision * 100).toFixed(1)}%, Recall=${(recall * 100).toFixed(1)}%, F1=${(f1 * 100).toFixed(1)}% → ต้นทุนธุรกิจรวม ${totalCost.toLocaleString("en-US")}฿`;

  return (
    <div className="space-y-3">
      {/* Quick Presets */}
      <div role="group" aria-label="เลือกค่า Threshold ตัวอย่าง" className="flex flex-wrap gap-2">
        {THRESH_PRESETS.map((preset) => {
          const isActive = Math.abs(threshold - preset.value) < 0.005;
          return (
            <button
              key={preset.value}
              type="button"
              aria-pressed={isActive}
              className={isActive ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={isActive ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setThreshold(preset.value)}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Probability Threshold Slider */}
      <label className="flex flex-col gap-1 text-sm">
        <span className="flex items-center justify-between font-medium">
          <span>เกณฑ์ตัดสินใจ (Probability Threshold θ)</span>
          <span className="mono-label text-brand-ink tabular-nums">{threshold.toFixed(2)}</span>
        </span>
        <input
          type="range"
          min={0.15}
          max={0.85}
          step={0.01}
          value={threshold}
          aria-label="เกณฑ์ตัดสินใจความน่าจะเป็นตั้งแต่ 0.15 ถึง 0.85"
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="h-6 w-full cursor-pointer accent-[color:var(--brand)]"
        />
      </label>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพปรับ Probability Threshold แสดง Confusion Matrix ค่า Precision Recall F1 และต้นทุนธุรกิจ"
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
          </defs>

          {/* Top: Probability Cutoff Strip */}
          <rect x="14" y="10" width="652" height="60" rx="12" fill="var(--surface)" stroke="var(--line)" />

          {/* Predicted Positive shaded zone (p >= threshold) */}
          <rect
            x={threshX}
            y="14"
            width={Math.max(0, stripX0 + stripW - threshX)}
            height="52"
            rx="8"
            fill="var(--brand-soft)"
            opacity="0.7"
            className={txClass}
          />

          {/* Baseline scale axis */}
          <line x1={stripX0} y1="54" x2={stripX0 + stripW} y2="54" stroke="var(--hair)" strokeWidth="1.5" />
          <text x={stripX0} y="66" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
            0.00
          </text>
          <text x={stripX0 + stripW * 0.5} y="66" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
            0.50
          </text>
          <text x={stripX0 + stripW} y="66" textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
            1.00
          </text>

          {/* Actual Positive Dots (upper lane y=27) */}
          {POSITIVE_PROBS.map((p, idx) => (
            <circle
              key={`pos-${idx}`}
              cx={stripX0 + p * stripW}
              cy="27"
              r="3.2"
              fill={p >= threshold ? "var(--success)" : "var(--danger)"}
              className={txClass}
            />
          ))}
          {/* Actual Negative Dots (lower lane y=43, sample every 2nd for clarity) */}
          {NEGATIVE_PROBS.filter((_, idx) => idx % 2 === 0).map((p, idx) => (
            <circle
              key={`neg-${idx}`}
              cx={stripX0 + p * stripW}
              cy="43"
              r="2.8"
              fill={p >= threshold ? "var(--warning)" : "var(--muted)"}
              opacity={p >= threshold ? 0.95 : 0.45}
              className={txClass}
            />
          ))}

          {/* Legend on left edge of strip */}
          <text x="20" y="30" fontSize="10" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
            +
          </text>
          <text x="20" y="46" fontSize="10" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            −
          </text>

          {/* Moving Threshold Vertical Line */}
          <line
            x1={threshX}
            y1="12"
            x2={threshX}
            y2="72"
            stroke="var(--brand)"
            strokeWidth="2.5"
            strokeDasharray={reduced ? undefined : "5 4"}
            className={flowClass}
          />
          <rect
            x={Math.min(570, Math.max(46, threshX - 38))}
            y="14"
            width="76"
            height="18"
            rx="9"
            fill="var(--brand)"
            className={txClass}
          />
          <text
            x={Math.min(608, Math.max(84, threshX))}
            y="27"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="var(--surface)"
            fontFamily="var(--font-mono)"
          >
            θ = {threshold.toFixed(2)}
          </text>

          {/* Bottom-Left: 2x2 Confusion Matrix */}
          <g transform="translate(14, 80)">
            <rect x="0" y="0" width="296" height="190" rx="12" fill="var(--surface)" stroke="var(--line)" />
            <text x="14" y="21" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
              Confusion Matrix (100 เคส)
            </text>

            {/* Column Headers */}
            <text x="128" y="40" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-sans)">
              ทาย + (≥ θ)
            </text>
            <text x="236" y="40" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-sans)">
              ทาย − (&lt; θ)
            </text>

            {/* Row Headers */}
            <text x="40" y="76" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
              จริง +
            </text>
            <text x="40" y="90" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
              (30)
            </text>
            <text x="40" y="144" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
              จริง −
            </text>
            <text x="40" y="158" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
              (70)
            </text>

            {/* Cell TP */}
            <rect x="76" y="48" width="102" height="62" rx="9" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.5" />
            <text x="86" y="65" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
              TP
            </text>
            <text x="168" y="88" textAnchor="end" fontSize="22" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
              {tp}
            </text>
            <text x="86" y="102" fontSize="10" fill="var(--fg)" fontFamily="var(--font-sans)">
              จับได้ถูก
            </text>

            {/* Cell FN */}
            <rect x="184" y="48" width="102" height="62" rx="9" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.5" />
            <text x="194" y="65" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
              FN
            </text>
            <text x="276" y="88" textAnchor="end" fontSize="22" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
              {fn}
            </text>
            <text x="194" y="102" fontSize="10" fill="var(--danger)" fontFamily="var(--font-mono)">
              หลุด (100฿)
            </text>

            {/* Cell FP */}
            <rect x="76" y="116" width="102" height="62" rx="9" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1.5" />
            <text x="86" y="133" fontSize="11" fontWeight="700" fill="var(--warning)" fontFamily="var(--font-mono)">
              FP
            </text>
            <text x="168" y="156" textAnchor="end" fontSize="22" fontWeight="700" fill="var(--warning)" fontFamily="var(--font-mono)">
              {fp}
            </text>
            <text x="86" y="170" fontSize="10" fill="var(--warning)" fontFamily="var(--font-mono)">
              ทายเกิน (15฿)
            </text>

            {/* Cell TN */}
            <rect x="184" y="116" width="102" height="62" rx="9" fill="var(--surface-2)" stroke="var(--hair)" strokeWidth="1.25" />
            <text x="194" y="133" fontSize="11" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
              TN
            </text>
            <text x="276" y="156" textAnchor="end" fontSize="22" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              {tn}
            </text>
            <text x="194" y="170" fontSize="10" fill="var(--muted)" fontFamily="var(--font-sans)">
              ปล่อยผ่านถูก
            </text>
          </g>

          {/* Animated connecting line between Matrix and Metrics */}
          <line
            x1="310"
            y1="175"
            x2="322"
            y2="175"
            stroke="var(--brand)"
            strokeWidth="2"
            markerEnd={`url(#${arrowId})`}
          />

          {/* Bottom-Right: Precision / Recall / F1 + Total Business Cost */}
          <g transform="translate(324, 80)">
            <rect x="0" y="0" width="342" height="190" rx="12" fill="var(--surface)" stroke="var(--line)" />

            {/* Precision Row */}
            <text x="14" y="25" fontSize="11" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
              Precision (ทายแม่น)
            </text>
            <rect x="134" y="16" width={barMaxW} height="10" rx="5" fill="var(--surface-2)" />
            <rect x="134" y="16" width={precW} height="10" rx="5" fill="var(--cyan)" className={txClass} />
            <text x="328" y="25" textAnchor="end" fontSize="12" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
              {(precision * 100).toFixed(1)}%
            </text>

            {/* Recall Row */}
            <text x="14" y="53" fontSize="11" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
              Recall (จับได้ครบ)
            </text>
            <rect x="134" y="44" width={barMaxW} height="10" rx="5" fill="var(--surface-2)" />
            <rect x="134" y="44" width={recW} height="10" rx="5" fill="var(--success)" className={txClass} />
            <text x="328" y="53" textAnchor="end" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
              {(recall * 100).toFixed(1)}%
            </text>

            {/* F1 Row */}
            <text x="14" y="81" fontSize="11" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
              F1-Score (สมดุล)
            </text>
            <rect x="134" y="72" width={barMaxW} height="10" rx="5" fill="var(--surface-2)" />
            <rect x="134" y="72" width={f1W} height="10" rx="5" fill="var(--brand)" className={txClass} />
            <text x="328" y="81" textAnchor="end" fontSize="12" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              {(f1 * 100).toFixed(1)}%
            </text>

            {/* Divider */}
            <line x1="14" y1="98" x2="328" y2="98" stroke="var(--hair)" strokeWidth="1" />

            {/* Total Business Cost Card */}
            <rect
              x="14"
              y="108"
              width="314"
              height="70"
              rx="10"
              fill={costSoft}
              stroke={costColor}
              strokeWidth="1.5"
              className={txClass}
            />
            <text x="24" y="128" fontSize="11" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
              ต้นทุนธุรกิจรวม (FN×100฿ + FP×15฿)
            </text>
            <text x="318" y="130" textAnchor="end" fontSize="17" fontWeight="700" fill={costColor} fontFamily="var(--font-mono)">
              {totalCost.toLocaleString("en-US")}฿
            </text>
            <rect x="24" y="140" width="196" height="10" rx="5" fill="var(--surface)" stroke="var(--hair)" />
            <rect x="24" y="140" width={costBarW} height="10" rx="5" fill={costColor} className={txClass} />
            <text x="318" y="149" textAnchor="end" fontSize="11" fontWeight="600" fill={costColor} fontFamily="var(--font-mono)">
              {fn * FN_COST_THB} + {fp * FP_COST_THB}
            </text>
            <text x="24" y="168" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-sans)">
              {totalCost <= 650
                ? "คุ้มค่าที่สุด! ยอมทายเกินเล็กน้อยเพื่อลดเคสหลุดราคาแพง"
                : totalCost <= 1150
                  ? "สมดุลปานกลาง แต่เคส FN ยังดึงต้นทุนรวมให้สูงขึ้น"
                  : "ต้นทุนพุ่งสูง! เพราะเกณฑ์สูงเกินไปจนปล่อยเคสหลุด (FN) เยอะ"}
            </text>
          </g>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 4. RegressionResidualsVisual (regression-residuals)                        */
/* ========================================================================== */

interface DeliveryPoint {
  id: string;
  km: number;
  hours: number;
  isOutlier?: boolean;
}

// Regression line: y_hat = 0.8 + 0.1 * km
const predictHours = (km: number): number => 0.8 + 0.1 * km;

const NORMAL_POINTS: DeliveryPoint[] = [
  { id: "p1", km: 3, hours: 0.7 },   // y_hat = 1.1, e = -0.4
  { id: "p2", km: 5, hours: 1.7 },   // y_hat = 1.3, e = +0.4
  { id: "p3", km: 7, hours: 1.2 },   // y_hat = 1.5, e = -0.3
  { id: "p4", km: 9, hours: 2.1 },   // y_hat = 1.7, e = +0.4
  { id: "p5", km: 11, hours: 1.4 },  // y_hat = 1.9, e = -0.5
  { id: "p6", km: 13, hours: 2.5 },  // y_hat = 2.1, e = +0.4
  { id: "p7", km: 15, hours: 1.9 },  // y_hat = 2.3, e = -0.4
  { id: "p8", km: 17, hours: 3.0 },  // y_hat = 2.5, e = +0.5
  { id: "p9", km: 19, hours: 2.3 },  // y_hat = 2.7, e = -0.4
  { id: "p10", km: 21, hours: 3.2 }, // y_hat = 2.9, e = +0.3
  { id: "p11", km: 23, hours: 2.7 }, // y_hat = 3.1, e = -0.4
];

const OUTLIER_POINT: DeliveryPoint = {
  id: "outlier",
  km: 18,
  hours: 14.6, // y_hat = 2.6, residual = +12.0 hours!
  isOutlier: true,
};

export function RegressionResidualsVisual({ reduced = false }: VisualProps) {
  const [hasOutlier, setHasOutlier] = useState<boolean>(false);

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const activePoints = hasOutlier ? [...NORMAL_POINTS, OUTLIER_POINT] : NORMAL_POINTS;

  const baseResiduals = NORMAL_POINTS.map((pt) => pt.hours - predictHours(pt.km));
  const baseRmse = Math.sqrt(baseResiduals.reduce((acc, e) => acc + e * e, 0) / NORMAL_POINTS.length);
  const residuals = activePoints.map((pt) => pt.hours - predictHours(pt.km));
  const mae = residuals.reduce((acc, e) => acc + Math.abs(e), 0) / activePoints.length;
  const rmse = Math.sqrt(residuals.reduce((acc, e) => acc + e * e, 0) / activePoints.length);
  const ratio = mae > 0 ? rmse / mae : 1;
  const rmseJump = baseRmse > 0 ? rmse / baseRmse : 1;

  // Plot geometry (left panel: x=14..404, y=14..256)
  const plotLeft = 62;
  const plotRight = 386;
  const plotTop = 30;
  const plotBottom = 218;
  const maxKm = 25;
  const maxHours = 16;

  const mapX = (km: number) => plotLeft + (km / maxKm) * (plotRight - plotLeft);
  const mapY = (hr: number) => plotBottom - (hr / maxHours) * (plotBottom - plotTop);

  const lineX1 = mapX(1);
  const lineY1 = mapY(predictHours(1));
  const lineX2 = mapX(24);
  const lineY2 = mapY(predictHours(24));

  // Metric bars (scale up to 4.0 hours)
  const metricBarMaxW = 212;
  const maeBarW = Math.min(metricBarMaxW, Math.max(8, Math.round((mae / 4.0) * metricBarMaxW)));
  const rmseBarW = Math.min(metricBarMaxW, Math.max(8, Math.round((rmse / 4.0) * metricBarMaxW)));

  const captionText = hasOutlier
    ? `มี Outlier 1 จุด (ส่งช้าผิดปกติ +12 ชม.): ค่า MAE ขยับขึ้นเล็กน้อยจาก 0.40 → ${mae.toFixed(2)} ชม. แต่ RMSE พุ่งพรวดจาก 0.41 → ${rmse.toFixed(2)} ชม. (${ratio.toFixed(2)}× ของ MAE) เพราะความคลาดเคลื่อนถูกยกกำลังสอง (12² = 144) ก่อนถอดรูท`
    : `เคสปกติ (ไม่มี Outlier): ความคลาดเคลื่อนแต่ละจุดอยู่ราว ±0.4 ชม. ทำให้ MAE = ${mae.toFixed(2)} ชม. และ RMSE = ${rmse.toFixed(2)} ชม. มีค่าใกล้เคียงกันมาก (อัตราส่วน ${ratio.toFixed(2)}×)`;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับเคสปกติกับเคสที่มี Outlier 1 จุด" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!hasOutlier}
          className={!hasOutlier ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!hasOutlier ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setHasOutlier(false)}
        >
          เคสปกติ (ไม่มี Outlier)
        </button>
        <button
          type="button"
          aria-pressed={hasOutlier}
          className={hasOutlier ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={hasOutlier ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setHasOutlier(true)}
        >
          มี Outlier 1 จุด (ช้าผิดปกติ 12 ชม.)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 270"
          className="w-full h-auto block"
          role="img"
          aria-label="กราฟ Scatter Plot เส้น Regression แท่งความคลาดเคลื่อน Residual และการเปรียบเทียบ MAE กับ RMSE"
        >
          {/* Left Panel: Scatter Plot with Regression Line & Residuals */}
          <rect x="14" y="14" width="390" height="242" rx="12" fill="var(--surface)" stroke="var(--line)" />

          {/* Horizontal Gridlines & Y ticks */}
          {[0, 4, 8, 12, 16].map((tick) => {
            const y = mapY(tick);
            return (
              <g key={tick}>
                <line x1={plotLeft} y1={y} x2={plotRight} y2={y} stroke="var(--hair)" strokeWidth="1" />
                <text x={plotLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} stroke="var(--line)" strokeWidth="1.5" />
          <line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="var(--line)" strokeWidth="1.5" />

          {/* X ticks */}
          {[5, 10, 15, 20, 25].map((km) => (
            <text key={km} x={mapX(km)} y={plotBottom + 15} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
              {km}
            </text>
          ))}

          {/* Axis Labels */}
          <text x="24" y="26" fontSize="11" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            เวลา (ชม.)
          </text>
          <text x="224" y="248" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
            ระยะทางจัดส่ง (กม.)
          </text>

          {/* Regression Line */}
          <line
            x1={lineX1}
            y1={lineY1}
            x2={lineX2}
            y2={lineY2}
            stroke="var(--brand)"
            strokeWidth="2.5"
          />
          <text x={plotRight - 4} y={lineY2 - 8} textAnchor="end" fontSize="10" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            ŷ (เส้นทำนาย)
          </text>

          {/* Animated Vertical Residual Error Bars + Data Points */}
          {activePoints.map((pt) => {
            const cx = mapX(pt.km);
            const cyActual = mapY(pt.hours);
            const cyPred = mapY(predictHours(pt.km));
            const outlier = Boolean(pt.isOutlier);

            return (
              <g key={pt.id}>
                <line
                  x1={cx}
                  y1={cyPred}
                  x2={cx}
                  y2={cyActual}
                  stroke={outlier ? "var(--danger)" : "var(--cyan)"}
                  strokeWidth={outlier ? "2.75" : "1.75"}
                  strokeDasharray={reduced ? "4 3" : "5 4"}
                  className={flowClass}
                />
                <circle
                  cx={cx}
                  cy={cyActual}
                  r={outlier ? "6" : "4.2"}
                  fill={outlier ? "var(--danger)" : "var(--cyan)"}
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                  className={txClass}
                />
              </g>
            );
          })}

          {/* Outlier Callout Annotation */}
          {hasOutlier && (
            <g>
              <rect
                x="88"
                y="34"
                width="176"
                height="40"
                rx="8"
                fill="var(--danger-soft)"
                stroke="var(--danger)"
                strokeWidth="1.25"
              />
              <text x="176" y="51" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                Outlier: ช้าเกินคาด +12.0 ชม.
              </text>
              <text x="176" y="67" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                |e| = 12  →  e² = 144!
              </text>
              <line
                x1="264"
                y1="48"
                x2={mapX(OUTLIER_POINT.km) - 7}
                y2={mapY(OUTLIER_POINT.hours)}
                stroke="var(--danger)"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Right Panel: Live MAE vs RMSE Bars */}
          <g transform="translate(416, 14)">
            <rect x="0" y="0" width="250" height="242" rx="12" fill="var(--surface)" stroke="var(--line)" />

            {/* MAE Card */}
            <rect
              x="12"
              y="12"
              width="226"
              height="86"
              rx="10"
              fill="var(--cyan-soft)"
              stroke="var(--cyan)"
              strokeWidth="1.5"
              className={txClass}
            />
            <text x="22" y="33" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
              MAE (เฉลี่ยตรงๆ)
            </text>
            <text x="228" y="34" textAnchor="end" fontSize="15" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
              {mae.toFixed(2)} ชม.
            </text>
            <rect x="22" y="45" width={metricBarMaxW} height="12" rx="6" fill="var(--surface)" stroke="var(--hair)" />
            <rect x="22" y="45" width={maeBarW} height="12" rx="6" fill="var(--cyan)" className={txClass} />
            <text x="22" y="75" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
              mean(|y − ŷ|)
            </text>
            <text x="228" y="75" textAnchor="end" fontSize="11" fontWeight="600" fill="var(--cyan)" fontFamily="var(--font-sans)">
              {hasOutlier ? "ขยับขึ้นเล็กน้อย" : "นิ่งและอ่านง่าย"}
            </text>

            {/* RMSE Card */}
            <rect
              x="12"
              y="108"
              width="226"
              height="86"
              rx="10"
              fill={hasOutlier ? "var(--danger-soft)" : "var(--brand-soft)"}
              stroke={hasOutlier ? "var(--danger)" : "var(--brand)"}
              strokeWidth="1.5"
              className={txClass}
            />
            <text x="22" y="129" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
              RMSE (ลงโทษจุดหลุด)
            </text>
            <text
              x="228"
              y="130"
              textAnchor="end"
              fontSize="15"
              fontWeight="700"
              fill={hasOutlier ? "var(--danger)" : "var(--brand-ink)"}
              fontFamily="var(--font-mono)"
            >
              {rmse.toFixed(2)} ชม.
            </text>
            <rect x="22" y="141" width={metricBarMaxW} height="12" rx="6" fill="var(--surface)" stroke="var(--hair)" />
            <rect
              x="22"
              y="141"
              width={rmseBarW}
              height="12"
              rx="6"
              fill={hasOutlier ? "var(--danger)" : "var(--brand)"}
              className={txClass}
            />
            <text x="22" y="171" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
              √mean((y − ŷ)²)
            </text>
            <text
              x="228"
              y="171"
              textAnchor="end"
              fontSize="11"
              fontWeight="700"
              fill={hasOutlier ? "var(--danger)" : "var(--brand-ink)"}
              fontFamily="var(--font-sans)"
            >
              {hasOutlier ? `พุ่งแรง ${rmseJump.toFixed(1)}×!` : "ใกล้เคียง MAE"}
            </text>

            {/* Bottom Ratio Summary Pill */}
            <rect
              x="12"
              y="204"
              width="226"
              height="26"
              rx="13"
              fill={hasOutlier ? "var(--warning-soft)" : "var(--success-soft)"}
              stroke={hasOutlier ? "var(--warning)" : "var(--success)"}
              strokeWidth="1"
              className={txClass}
            />
            <text
              x="125"
              y="221"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill={hasOutlier ? "var(--warning)" : "var(--success)"}
              fontFamily="var(--font-mono)"
            >
              RMSE / MAE = {ratio.toFixed(2)}× {hasOutlier ? "(Outlier ดึงพุ่ง!)" : "(สมดุลปกติ)"}
            </text>
          </g>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}
