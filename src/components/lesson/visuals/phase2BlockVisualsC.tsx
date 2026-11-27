"use client";

import { useId, useState, type CSSProperties, type KeyboardEvent } from "react";

interface VisualProps {
  reduced?: boolean;
}

const ACTIVE_BTN_STYLE: CSSProperties = {
  borderColor: "var(--brand)",
  background: "var(--brand-soft)",
  color: "var(--brand-ink)",
};

function handleSvgKeyDown(event: KeyboardEvent<SVGGElement>, onActivate: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate();
  }
}

/* ========================================================================== */
/* 1. LightgbmBoostingVisual (lightgbm-boosting)                              */
/* ========================================================================== */

type BoostStep = 1 | 2 | 3;

interface BoostSample {
  id: string;
  truth: number;
  preds: [number, number, number];
}

const BOOST_SAMPLES: BoostSample[] = [
  { id: "#1", truth: 8.8, preds: [4.4, 7.2, 8.4] },
  { id: "#2", truth: 1.6, preds: [5.6, 3.2, 2.0] },
  { id: "#3", truth: 9.4, preds: [5.0, 7.6, 9.0] },
  { id: "#4", truth: 2.4, preds: [6.4, 3.8, 2.8] },
];

interface BoostStepMeta {
  step: BoostStep;
  btnLabel: string;
  treeTitle: string;
  treeSub: string;
  formula: string;
  mae: number;
  reductionLabel: string;
  accent: string;
  soft: string;
  caption: string;
}

const BOOST_STEPS: BoostStepMeta[] = [
  {
    step: 1,
    btnLabel: "Tree 1: ค่าตั้งต้น",
    treeTitle: "Tree 1",
    treeSub: "ค่าตั้งต้น (Base F₁)",
    formula: "ŷ = F₁(x)",
    mae: 4.2,
    reductionLabel: "Error เริ่มต้น (ห่างมาก)",
    accent: "var(--danger)",
    soft: "var(--danger-soft)",
    caption:
      "ขั้นที่ 1 (Tree 1): ต้นไม้แรกทำนายค่าหยาบๆ ใกล้ค่าเฉลี่ยก่อน ทำให้ยังมีส่วนต่าง (Residuals) เฉลี่ยสูงถึง MAE = 4.2 หน่วย",
  },
  {
    step: 2,
    btnLabel: "+ Tree 2: แก้ส่วนต่าง (Residuals)",
    treeTitle: "+ Tree 2",
    treeSub: "แก้ส่วนต่าง (η·h₂)",
    formula: "ŷ = F₁ + η·h₂(x)",
    mae: 1.6,
    reductionLabel: "ลดลง 62% จากรอบแรก",
    accent: "var(--warning)",
    soft: "var(--warning-soft)",
    caption:
      "ขั้นที่ 2 (+ Tree 2): ต้นไม้ที่สองไม่ได้ทำนายค่าจริงตรงๆ แต่เรียนรู้เฉพาะส่วนต่าง r₁ = y − F₁ เพื่อดึงแท่งทำนายเข้าใกล้เส้นค่าจริง ลด MAE จาก 4.2 เหลือ 1.6",
  },
  {
    step: 3,
    btnLabel: "+ Tree 3: เก็บรายละเอียด",
    treeTitle: "+ Tree 3",
    treeSub: "เก็บรายละเอียด (η·h₃)",
    formula: "ŷ = F₁ + η·h₂ + η·h₃",
    mae: 0.4,
    reductionLabel: "ลดลง 90% · ลู่เข้าค่าจริง",
    accent: "var(--success)",
    soft: "var(--success-soft)",
    caption:
      "ขั้นที่ 3 (+ Tree 3): ต้นไม้ที่สามเก็บรายละเอียดของเศษความคลาดเคลื่อน r₂ ที่เหลืออยู่ ทำให้ค่าทำนายลู่เข้าใกล้ค่าจริงทุกตัวอย่าง และ Residual หดเหลือเพียง MAE = 0.4",
  },
];

export function LightgbmBoostingVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [step, setStep] = useState<BoostStep>(1);

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerActive = `${uid}-lgb-active`;
  const markerIdle = `${uid}-lgb-idle`;

  const current = BOOST_STEPS[step - 1];
  const stepIdx = step - 1;
  const barTrackX = 64;
  const barTrackW = 248;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกขั้นตอนการเรียนรู้แบบ Boosting" className="flex flex-wrap gap-2">
        {BOOST_STEPS.map((item) => {
          const active = step === item.step;
          return (
            <button
              key={item.step}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setStep(item.step)}
            >
              {item.btnLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพการบวกต้นไม้ทีละขั้นของ LightGBM Gradient Boosting และการลดลงของ Residual Error"
        >
          <defs>
            <marker id={markerActive} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={markerIdle} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--line)" />
            </marker>
          </defs>

          {/* Top Sequential Boosting Pipeline */}
          {[0, 1].map((edgeIdx) => {
            const isFlowing = step >= edgeIdx + 2;
            const x1 = 16 + edgeIdx * 232 + 186;
            const x2 = 16 + (edgeIdx + 1) * 232 - 4;
            return (
              <g key={edgeIdx}>
                <line
                  x1={x1}
                  y1="43"
                  x2={x2}
                  y2="43"
                  stroke={isFlowing ? "var(--brand)" : "var(--line)"}
                  strokeWidth={isFlowing ? "2.5" : "1.5"}
                  strokeDasharray={isFlowing ? (reduced ? undefined : "6 6") : "4 4"}
                  className={isFlowing ? flowClass : undefined}
                  markerEnd={`url(#${isFlowing ? markerActive : markerIdle})`}
                />
                <text
                  x={(x1 + x2) / 2}
                  y="34"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={isFlowing ? "var(--brand-ink)" : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {edgeIdx === 0 ? "r₁" : "r₂"}
                </text>
              </g>
            );
          })}

          {BOOST_STEPS.map((item, idx) => {
            const x = 16 + idx * 232;
            const isSelected = step === item.step;
            const isIncluded = step >= item.step;
            return (
              <g
                key={item.step}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={item.btnLabel}
                className="cursor-pointer outline-none"
                onClick={() => setStep(item.step)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(item.step))}
              >
                <rect
                  x={x}
                  y="14"
                  width="186"
                  height="58"
                  rx="11"
                  fill={isSelected ? "var(--brand-soft)" : "var(--surface)"}
                  stroke={isSelected ? "var(--brand)" : isIncluded ? "var(--cyan)" : "var(--line)"}
                  strokeWidth={isSelected ? "2" : "1.25"}
                  opacity={isIncluded ? 1 : 0.6}
                  className={txClass}
                />
                <text
                  x={x + 14}
                  y="36"
                  fontSize="13"
                  fontWeight="700"
                  fill={isSelected ? "var(--brand-ink)" : isIncluded ? "var(--fg)" : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {item.treeTitle}
                </text>
                <rect
                  x={x + 120}
                  y="21"
                  width="54"
                  height="18"
                  rx="9"
                  fill={isIncluded ? item.soft : "var(--surface-2)"}
                />
                <text
                  x={x + 147}
                  y="33"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill={isIncluded ? item.accent : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {item.mae.toFixed(1)}
                </text>
                <text
                  x={x + 14}
                  y="58"
                  fontSize="11.5"
                  fill={isIncluded ? "var(--muted)" : "var(--muted)"}
                  fontFamily="var(--font-sans)"
                >
                  {item.treeSub}
                </text>
              </g>
            );
          })}

          {/* Bottom Left Panel: Prediction Bars Converging Toward Ground Truth */}
          <rect x="16" y="86" width="406" height="180" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="109" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            ค่าทำนาย (ŷ) ลู่เข้าหาค่าจริง (y)
          </text>
          <text x="408" y="109" textAnchor="end" fontSize="11" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            {current.formula}
          </text>

          {/* Scale Gridlines (0, 5, 10) */}
          {[0, 5, 10].map((tick) => {
            const gx = barTrackX + (tick / 10) * barTrackW;
            return (
              <g key={tick}>
                <line x1={gx} y1="120" x2={gx} y2="244" stroke="var(--hair)" strokeWidth="1" strokeDasharray="3 3" />
                <text x={gx} y="258" textAnchor="middle" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-mono)">
                  {tick.toFixed(0)}
                </text>
              </g>
            );
          })}

          {BOOST_SAMPLES.map((sample, rowIdx) => {
            const y = 128 + rowIdx * 29;
            const pred = sample.preds[stepIdx];
            const predW = Math.round((pred / 10) * barTrackW);
            const truthX = barTrackX + Math.round((sample.truth / 10) * barTrackW);
            const residual = sample.truth - pred;
            const gapX = Math.min(barTrackX + predW, truthX);
            const gapW = Math.max(0, Math.abs(truthX - (barTrackX + predW)));
            const barFill = step === 1 ? "var(--brand)" : step === 2 ? "var(--cyan)" : "var(--success)";

            return (
              <g key={sample.id}>
                <text x="30" y={y + 13} fontSize="11.5" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
                  {sample.id}
                </text>

                {/* Track */}
                <rect x={barTrackX} y={y + 2} width={barTrackW} height="14" rx="5" fill="var(--surface-2)" stroke="var(--hair)" />

                {/* Residual gap band */}
                <rect
                  x={gapX}
                  y={y + 2}
                  width={gapW}
                  height="14"
                  rx="3"
                  fill={current.soft}
                  stroke={current.accent}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  className={txClass}
                />

                {/* Animated prediction bar */}
                <rect
                  x={barTrackX}
                  y={y + 2}
                  width={predW}
                  height="14"
                  rx="5"
                  fill={barFill}
                  className={txClass}
                />

                {/* Ground Truth target pin */}
                <line x1={truthX} y1={y - 2} x2={truthX} y2={y + 20} stroke="var(--fg)" strokeWidth="2" />
                <circle cx={truthX} cy={y - 2} r="3" fill="var(--fg)" />

                {/* Residual readout */}
                <text
                  x="408"
                  y={y + 13}
                  textAnchor="end"
                  fontSize="11"
                  fontWeight="600"
                  fill={current.accent}
                  fontFamily="var(--font-mono)"
                >
                  {residual >= 0 ? `+${residual.toFixed(1)}` : residual.toFixed(1)}
                </text>
              </g>
            );
          })}

          <text x="408" y="258" textAnchor="end" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-sans)">
            เส้นตั้ง = ค่าจริง y · เลขขวา = Residual
          </text>

          {/* Bottom Right Panel: Residual Error Shrinkage */}
          <rect x="434" y="86" width="230" height="180" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="448" y="109" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            Residual Error (MAE)
          </text>

          {/* Current MAE Hero Pill */}
          <rect
            x="448"
            y="118"
            width="202"
            height="46"
            rx="9"
            fill={current.soft}
            stroke={current.accent}
            strokeWidth="1.25"
            className={txClass}
          />
          <text x="460" y="139" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
            STEP {step} MAE
          </text>
          <text
            x="638"
            y="141"
            textAnchor="end"
            fontSize="17"
            fontWeight="700"
            fill={current.accent}
            fontFamily="var(--font-mono)"
          >
            {current.mae.toFixed(1)}
          </text>
          <text x="460" y="156" fontSize="11" fontWeight="600" fill={current.accent} fontFamily="var(--font-sans)">
            {current.reductionLabel}
          </text>

          {/* 3 Shrinking Residual Columns */}
          {BOOST_STEPS.map((item, idx) => {
            const cx = 468 + idx * 66;
            const maxH = 60;
            const barH = Math.max(8, Math.round((item.mae / 4.5) * maxH));
            const barY = 238 - barH;
            const isReached = step >= item.step;
            const isCurrent = step === item.step;
            return (
              <g key={item.step}>
                <text
                  x={cx + 16}
                  y={barY - 5}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fill={isReached ? item.accent : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {item.mae.toFixed(1)}
                </text>
                <rect
                  x={cx}
                  y={barY}
                  width="32"
                  height={barH}
                  rx="6"
                  fill={isReached ? item.accent : "var(--surface-2)"}
                  stroke={isCurrent ? "var(--fg)" : isReached ? item.accent : "var(--hair)"}
                  strokeWidth={isCurrent ? "1.5" : "1"}
                  opacity={isReached ? 1 : 0.45}
                  className={txClass}
                />
                <text
                  x={cx + 16}
                  y="254"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isCurrent ? "700" : "500"}
                  fill={isCurrent ? "var(--fg)" : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {idx === 0 ? "T1" : idx === 1 ? "+T2" : "+T3"}
                </text>
              </g>
            );
          })}
          <line x1="454" y1="238" x2="646" y2="238" stroke="var(--hair)" strokeWidth="1.25" />
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {current.caption}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 2. ThaiCvTuningVisual (thai-cv-tuning)                                     */
/* ========================================================================== */

type CvViewMode = "cv" | "f1";

const FOLD_SCORES = [0.85, 0.87, 0.86, 0.84, 0.88];

interface F1ClassBar {
  label: string;
  whitespace: number;
  newmm: number;
}

const THAI_CLASS_F1: F1ClassBar[] = [
  { label: "Billing", whitespace: 0.58, newmm: 0.85 },
  { label: "Delivery", whitespace: 0.64, newmm: 0.88 },
  { label: "Refund", whitespace: 0.61, newmm: 0.85 },
];

export function ThaiCvTuningVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<CvViewMode>("cv");
  const [activeFold, setActiveFold] = useState<number>(2);

  const isCv = mode === "cv";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerBrand = `${uid}-cv-brand`;
  const markerDanger = `${uid}-cv-danger`;
  const markerSuccess = `${uid}-cv-success`;

  const captionText = isCv
    ? `5-Fold Stratified CV (รอบที่ ${activeFold + 1}/5 · Fold Macro-F1 = ${FOLD_SCORES[activeFold].toFixed(2)}): แบ่งข้อมูล Train 80% ออกเป็น 5 ส่วนโดยคงสัดส่วนคลาสเท่ากันทุกรอบ เฉลี่ยได้ Macro-F1 = 0.86 ± 0.02 ขณะที่ชุด Test 20% ถูกล็อกไว้ห้ามแตะจนกว่าจะจูนเสร็จ`
    : "เปรียบเทียบการตัดคำภาษาไทยบนชุดทดสอบเดียวกัน: Whitespace Split ได้ Macro-F1 เพียง 0.61 เพราะประโยคไทยไม่มีเว้นวรรค ส่วน PyThaiNLP newmm + Logistic Regression ทำคะแนนพุ่งเป็น 0.86 (+0.25 Macro-F1)";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับมุมมอง 5-Fold CV และการเปรียบเทียบ Thai Macro-F1" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={isCv}
          className={isCv ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isCv ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("cv")}
        >
          5-Fold Stratified CV
        </button>
        <button
          type="button"
          aria-pressed={!isCv}
          className={!isCv ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isCv ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("f1")}
        >
          Thai newmm vs Whitespace F1
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={
            isCv
              ? "แผนภาพ 5-Fold Stratified Cross-Validation พร้อมชุด Test ที่ล็อกแยกไว้"
              : "แผนภาพเปรียบเทียบ Macro-F1 ระหว่าง Whitespace Split 0.61 กับ PyThaiNLP newmm และ LogReg 0.86"
          }
        >
          <defs>
            <marker id={markerBrand} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={markerDanger} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id={markerSuccess} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {isCv ? (
            <>
              {/* Left Main Card: 5-Fold Rotating Strips */}
              <rect x="16" y="14" width="474" height="252" rx="12" fill="var(--surface)" stroke="var(--line)" />
              <text x="30" y="36" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
                5-Fold Stratified CV (คลิกแต่ละรอบเพื่อดู Fold ที่หมุน)
              </text>
              <text x="476" y="36" textAnchor="end" fontSize="11.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                Mean F1: 0.86
              </text>

              {FOLD_SCORES.map((score, rowIdx) => {
                const y = 50 + rowIdx * 38;
                const isSelected = activeFold === rowIdx;
                return (
                  <g
                    key={rowIdx}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`Fold ${rowIdx + 1} Macro-F1 ${score.toFixed(2)}`}
                    className="cursor-pointer outline-none"
                    onClick={() => setActiveFold(rowIdx)}
                    onKeyDown={(e) => handleSvgKeyDown(e, () => setActiveFold(rowIdx))}
                  >
                    <rect
                      x="24"
                      y={y}
                      width="458"
                      height="32"
                      rx="8"
                      fill={isSelected ? "var(--brand-soft)" : "var(--surface-2)"}
                      stroke={isSelected ? "var(--brand)" : "var(--hair)"}
                      strokeWidth={isSelected ? "1.75" : "1"}
                      className={txClass}
                    />
                    <text
                      x="34"
                      y={y + 20}
                      fontSize="11.5"
                      fontWeight="700"
                      fill={isSelected ? "var(--brand-ink)" : "var(--muted)"}
                      fontFamily="var(--font-mono)"
                    >
                      Fold {rowIdx + 1}
                    </text>

                    {[0, 1, 2, 3, 4].map((colIdx) => {
                      const isVal = colIdx === rowIdx;
                      const segX = 92 + colIdx * 65;
                      return (
                        <g key={colIdx}>
                          <rect
                            x={segX}
                            y={y + 5}
                            width="59"
                            height="22"
                            rx="5"
                            fill={
                              isVal
                                ? isSelected
                                  ? "var(--warning)"
                                  : "var(--warning-soft)"
                                : isSelected
                                  ? "var(--surface)"
                                  : "var(--brand-soft)"
                            }
                            stroke={isVal ? "var(--warning)" : isSelected ? "var(--brand)" : "var(--line)"}
                            strokeWidth={isVal ? "1.25" : "1"}
                            className={txClass}
                          />
                          <text
                            x={segX + 29.5}
                            y={y + 19.5}
                            textAnchor="middle"
                            fontSize="10.5"
                            fontWeight="700"
                            fill={
                              isVal
                                ? isSelected
                                  ? "var(--surface)"
                                  : "var(--warning)"
                                : "var(--brand-ink)"
                            }
                            fontFamily="var(--font-mono)"
                          >
                            {isVal ? "VAL" : "TR"}
                          </text>
                        </g>
                      );
                    })}

                    <text
                      x="472"
                      y={y + 20}
                      textAnchor="end"
                      fontSize="11.5"
                      fontWeight="700"
                      fill={isSelected ? "var(--brand-ink)" : "var(--fg)"}
                      fontFamily="var(--font-mono)"
                    >
                      {score.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Legend row */}
              <rect x="30" y="246" width="12" height="10" rx="3" fill="var(--brand-soft)" stroke="var(--brand)" />
              <text x="48" y="255" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                Train (4 folds)
              </text>
              <rect x="140" y="246" width="12" height="10" rx="3" fill="var(--warning-soft)" stroke="var(--warning)" />
              <text x="158" y="255" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                Validation (1 fold หมุนครบ 5 รอบ)
              </text>
              <text x="476" y="255" textAnchor="end" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                Stratified 70:30
              </text>

              {/* Animated Final Eval Arrow to Locked Test */}
              <line
                x1="490"
                y1="140"
                x2="514"
                y2="140"
                stroke="var(--brand)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? "4 4" : "5 5"}
                className={flowClass}
                markerEnd={`url(#${markerBrand})`}
              />

              {/* Right Sealed Vault: Locked Test Set */}
              <rect
                x="518"
                y="14"
                width="146"
                height="252"
                rx="12"
                fill="var(--surface)"
                stroke="var(--danger)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <rect x="536" y="26" width="110" height="22" rx="11" fill="var(--danger-soft)" />
              <text x="591" y="41" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                LOCKED TEST
              </text>

              {/* Crisp Geometric Padlock Icon */}
              <g transform="translate(573, 62)">
                <path
                  d="M 8 18 V 11 A 10 10 0 0 1 28 11 V 18"
                  fill="none"
                  stroke="var(--danger)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <rect x="4" y="18" width="28" height="22" rx="5" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="2" />
                <circle cx="18" cy="28" r="2.5" fill="var(--danger)" />
                <line x1="18" y1="30" x2="18" y2="35" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" />
              </g>

              <text x="591" y="122" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
                Hold-out Test
              </text>
              <text x="591" y="140" textAnchor="middle" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-mono)">
                20% Untouched
              </text>

              {/* Locked sample strips */}
              {[0, 1, 2].map((r) => (
                <rect
                  key={r}
                  x="536"
                  y={156 + r * 16}
                  width="110"
                  height="10"
                  rx="4"
                  fill="var(--surface-2)"
                  stroke="var(--hair)"
                />
              ))}

              <text x="591" y="224" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-sans)">
                ห้ามเปิดดูตอนจูน
              </text>
              <text x="591" y="242" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                ใช้วัดผลครั้งสุดท้ายเท่านั้น
              </text>
            </>
          ) : (
            <>
              {/* Top Shared Input Banner */}
              <rect x="16" y="14" width="648" height="44" rx="11" fill="var(--surface)" stroke="var(--line)" />
              <text x="32" y="40" fontSize="11.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
                THAI TICKET:
              </text>
              <text x="128" y="40" fontSize="13.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
                &quot;สินค้าส่งช้าขอคืนเงินด่วน&quot;
              </text>
              <rect x="498" y="24" width="154" height="24" rx="12" fill="var(--success-soft)" />
              <text x="575" y="40" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                Gain: +0.25 Macro-F1
              </text>

              {/* Animated Flow Branches */}
              <path
                d="M 240 58 L 240 68 L 174 68 L 174 82"
                fill="none"
                stroke="var(--danger)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerDanger})`}
              />
              <path
                d="M 440 58 L 440 68 L 506 68 L 506 82"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerSuccess})`}
              />

              {/* Left Comparison Card: Whitespace Split (0.61) */}
              <rect x="16" y="86" width="316" height="180" rx="12" fill="var(--surface)" stroke="var(--danger)" strokeWidth="1.5" />
              <rect x="28" y="98" width="150" height="22" rx="6" fill="var(--danger-soft)" />
              <text x="103" y="113" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                Whitespace Split
              </text>
              <text x="318" y="116" textAnchor="end" fontSize="19" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                0.61
              </text>

              <text x="28" y="138" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                Token: [&quot;สินค้าส่งช้าขอคืนเงินด่วน&quot;] (ติดเป็นก้อนเดียว)
              </text>

              {/* Overall Macro-F1 bar */}
              <rect x="28" y="149" width="290" height="14" rx="7" fill="var(--surface-2)" stroke="var(--hair)" />
              <rect x="28" y="149" width={Math.round(290 * 0.61)} height="14" rx="7" fill="var(--danger)" className={txClass} />

              {/* Per-class mini bars */}
              {THAI_CLASS_F1.map((cls, idx) => {
                const rowY = 176 + idx * 23;
                return (
                  <g key={cls.label}>
                    <text x="28" y={rowY + 11} fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                      {cls.label}
                    </text>
                    <rect x="96" y={rowY + 3} width="180" height="9" rx="4.5" fill="var(--surface-2)" />
                    <rect
                      x="96"
                      y={rowY + 3}
                      width={Math.round(180 * cls.whitespace)}
                      height="9"
                      rx="4.5"
                      fill="var(--danger)"
                      opacity="0.75"
                      className={txClass}
                    />
                    <text x="318" y={rowY + 11} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                      {cls.whitespace.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              <text x="28" y="255" fontSize="11" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-sans)">
                คำศัพท์แตกกระจาย (OOV สูง) ทำให้จำแนกคลาสพลาดบ่อย
              </text>

              {/* Right Comparison Card: PyThaiNLP newmm + LogReg (0.86) */}
              <rect x="348" y="86" width="316" height="180" rx="12" fill="var(--surface)" stroke="var(--success)" strokeWidth="1.75" />
              <rect x="360" y="98" width="198" height="22" rx="6" fill="var(--success-soft)" />
              <text x="459" y="113" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                PyThaiNLP newmm + LogReg
              </text>
              <text x="650" y="116" textAnchor="end" fontSize="19" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                0.86
              </text>

              <text x="360" y="138" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                Tokens: สินค้า · ส่งช้า · ขอ · คืนเงิน · ด่วน
              </text>

              {/* Overall Macro-F1 bar */}
              <rect x="360" y="149" width="290" height="14" rx="7" fill="var(--surface-2)" stroke="var(--hair)" />
              <rect x="360" y="149" width={Math.round(290 * 0.86)} height="14" rx="7" fill="var(--success)" className={txClass} />

              {/* Per-class mini bars */}
              {THAI_CLASS_F1.map((cls, idx) => {
                const rowY = 176 + idx * 23;
                return (
                  <g key={cls.label}>
                    <text x="360" y={rowY + 11} fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                      {cls.label}
                    </text>
                    <rect x="428" y={rowY + 3} width="180" height="9" rx="4.5" fill="var(--surface-2)" />
                    <rect
                      x="428"
                      y={rowY + 3}
                      width={Math.round(180 * cls.newmm)}
                      height="9"
                      rx="4.5"
                      fill="var(--success)"
                      className={txClass}
                    />
                    <text x="650" y={rowY + 11} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                      {cls.newmm.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              <text x="360" y="255" fontSize="11" fontWeight="600" fill="var(--success)" fontFamily="var(--font-sans)">
                TF-IDF จับคำสำคัญ &quot;ส่งช้า / คืนเงิน&quot; แม่นยำทั้ง 3 คลาส
              </text>
            </>
          )}
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 3. DriftOnnxMonitorVisual (drift-onnx-monitor)                             */
/* ========================================================================== */

type MonitorMode = "drift" | "latency";
type DriftScenario = "normal" | "promo";

function buildGaussianPaths(
  meanNorm: number,
  sigmaNorm: number,
  xStart: number,
  width: number,
  baselineY: number,
  peakH: number,
): { line: string; area: string; peakX: number; peakY: number } {
  const steps = 40;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const z = (t - meanNorm) / sigmaNorm;
    const yVal = Math.exp(-0.5 * z * z);
    const px = xStart + t * width;
    const py = baselineY - yVal * peakH;
    pts.push(`${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${(xStart + width).toFixed(1)} ${baselineY} L ${xStart.toFixed(1)} ${baselineY} Z`;
  const peakX = xStart + meanNorm * width;
  const peakY = baselineY - peakH;
  return { line, area, peakX, peakY };
}

interface LatencyRow {
  label: string;
  sub: string;
  ms: number;
  barW: number;
  status: string;
  color: string;
  soft: string;
  animateFlow: boolean;
}

const LATENCY_ROWS: LatencyRow[] = [
  {
    label: "ONNX Runtime",
    sub: "Compiled C++ graph",
    ms: 2.4,
    barW: 84,
    status: "2.4 ms · ผ่าน SLA (4×)",
    color: "var(--success)",
    soft: "var(--success-soft)",
    animateFlow: true,
  },
  {
    label: "joblib (sklearn)",
    sub: "Python runtime overhead",
    ms: 7.8,
    barW: 174,
    status: "7.8 ms · เฉียดเพดาน",
    color: "var(--warning)",
    soft: "var(--warning-soft)",
    animateFlow: false,
  },
  {
    label: "LLM API (Cloud)",
    sub: "Network + token generation",
    ms: 820,
    barW: 326,
    status: "820 ms · ช้ากว่า 341×",
    color: "var(--danger)",
    soft: "var(--danger-soft)",
    animateFlow: false,
  },
];

export function DriftOnnxMonitorVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<MonitorMode>("drift");
  const [scenario, setScenario] = useState<DriftScenario>("promo");

  const isDriftMode = mode === "drift";
  const isPromo = scenario === "promo";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerShift = `${uid}-drift-shift`;
  const markerFast = `${uid}-onnx-fast`;

  const chartX = 36;
  const chartW = 382;
  const baseY = 224;
  const peakH = 114;

  const trainCurve = buildGaussianPaths(0.34, 0.125, chartX, chartW, baseY, peakH);
  const prodCurve = buildGaussianPaths(isPromo ? 0.68 : 0.37, isPromo ? 0.14 : 0.13, chartX, chartW, baseY, peakH * (isPromo ? 0.92 : 0.98));

  const psiValue = isPromo ? 0.29 : 0.04;
  const psiColor = isPromo ? "var(--danger)" : "var(--success)";
  const psiSoft = isPromo ? "var(--danger-soft)" : "var(--success-soft)";
  const psiMarkerX = 468 + Math.round((psiValue / 0.35) * 182);

  const captionText = isDriftMode
    ? isPromo
      ? "Feature Drift Alert (PSI = 0.29 > 0.20): สัปดาห์โปรโมชันทำให้การกระจายตัวของยอดคำสั่งซื้อเลื่อนไปทางขวาจากช่วง Training ชัดเจน ต้องแจ้งเตือนเพื่อตรวจความแม่นยำและเตรียม Retrain โมเดล"
      : "Normal Traffic (PSI = 0.04 < 0.10): ข้อมูล Production สัปดาห์ปกติซ้อนทับกับชุด Training Baseline ใกล้เคียงมาก โมเดลยังทำงานเสถียรและไม่จำเป็นต้อง Retrain"
    : "Inference Latency P95: การแปลงโมเดลเป็น ONNX Runtime ทำนายได้ใน 2.4 ms (ต่ำกว่า SLA 10 ms ถึง 4 เท่า) เร็วกว่า joblib (7.8 ms) และเร็วกว่าเรียก LLM API ภายนอก (820 ms) กว่า 340 เท่า";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="สลับมุมมอง Feature Drift กับ ONNX Latency" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={isDriftMode}
            className={isDriftMode ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={isDriftMode ? ACTIVE_BTN_STYLE : undefined}
            onClick={() => setMode("drift")}
          >
            Feature Drift Monitor (PSI)
          </button>
          <button
            type="button"
            aria-pressed={!isDriftMode}
            className={!isDriftMode ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={!isDriftMode ? ACTIVE_BTN_STYLE : undefined}
            onClick={() => setMode("latency")}
          >
            Inference Latency (&lt;10ms ONNX)
          </button>
        </div>

        {isDriftMode && (
          <div role="group" aria-label="เลือกช่วงเวลาของข้อมูล Production" className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={!isPromo}
              className={!isPromo ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={
                !isPromo
                  ? { borderColor: "var(--success)", background: "var(--success-soft)", color: "var(--success)" }
                  : undefined
              }
              onClick={() => setScenario("normal")}
            >
              สัปดาห์ปกติ (PSI 0.04)
            </button>
            <button
              type="button"
              aria-pressed={isPromo}
              className={isPromo ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={
                isPromo
                  ? { borderColor: "var(--danger)", background: "var(--danger-soft)", color: "var(--danger)" }
                  : undefined
              }
              onClick={() => setScenario("promo")}
            >
              โปร 11.11 (PSI 0.29)
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={
            isDriftMode
              ? "กราฟตรวจจับ Feature Drift ด้วยค่า PSI ระหว่าง Training และ Production"
              : "กราฟเปรียบเทียบ P95 Inference Latency ระหว่าง ONNX Runtime joblib และ LLM API"
          }
        >
          <defs>
            <marker id={markerShift} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id={markerFast} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {isDriftMode ? (
            <>
              {/* Left Distribution Plot */}
              <rect x="16" y="14" width="424" height="252" rx="12" fill="var(--surface)" stroke="var(--line)" />
              <text x="32" y="37" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
                การกระจายตัวของ Feature: ยอดคำสั่งซื้อ (Order Value)
              </text>

              {/* Legend */}
              <line x1="32" y1="54" x2="52" y2="54" stroke="var(--brand)" strokeWidth="2.5" />
              <text x="58" y="58" fontSize="11" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                Training Baseline
              </text>
              <line x1="194" y1="54" x2="214" y2="54" stroke={psiColor} strokeWidth="2.5" strokeDasharray="5 3" />
              <text x="220" y="58" fontSize="11" fill={psiColor} fontFamily="var(--font-mono)">
                {isPromo ? "Promo Week Traffic" : "Normal Week Traffic"}
              </text>

              {/* Baseline & subtle grid */}
              {[130, 177].map((gy) => (
                <line key={gy} x1={chartX} y1={gy} x2={chartX + chartW} y2={gy} stroke="var(--hair)" strokeWidth="1" strokeDasharray="3 3" />
              ))}
              <line x1={chartX} y1={baseY} x2={chartX + chartW} y2={baseY} stroke="var(--line)" strokeWidth="1.5" />

              {/* Training curve */}
              <path d={trainCurve.area} fill="var(--brand-soft)" opacity="0.65" />
              <path d={trainCurve.line} fill="none" stroke="var(--brand)" strokeWidth="2.5" />

              {/* Production curve */}
              <path d={prodCurve.area} fill={psiSoft} opacity="0.72" className={txClass} />
              <path
                d={prodCurve.line}
                fill="none"
                stroke={psiColor}
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className={txClass}
              />

              {/* Mean shift indicator */}
              <line x1={trainCurve.peakX} y1={trainCurve.peakY} x2={trainCurve.peakX} y2={baseY} stroke="var(--brand)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={prodCurve.peakX} y1={prodCurve.peakY} x2={prodCurve.peakX} y2={baseY} stroke={psiColor} strokeWidth="1" strokeDasharray="3 3" />

              {isPromo && (
                <g>
                  <line
                    x1={trainCurve.peakX + 6}
                    y1="92"
                    x2={prodCurve.peakX - 8}
                    y2="92"
                    stroke="var(--danger)"
                    strokeWidth="2.25"
                    strokeDasharray={reduced ? undefined : "6 6"}
                    className={flowClass}
                    markerEnd={`url(#${markerShift})`}
                  />
                  <rect x={(trainCurve.peakX + prodCurve.peakX) / 2 - 44} y="70" width="88" height="18" rx="9" fill="var(--danger-soft)" />
                  <text
                    x={(trainCurve.peakX + prodCurve.peakX) / 2}
                    y="82.5"
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="700"
                    fill="var(--danger)"
                    fontFamily="var(--font-mono)"
                  >
                    Shift +฿1,600
                  </text>
                </g>
              )}

              {/* X-Axis Labels */}
              {[
                { label: "฿200", t: 0.06 },
                { label: "฿850", t: 0.34 },
                { label: "฿1,600", t: 0.54 },
                { label: "฿2,450", t: 0.72 },
                { label: "฿3,500", t: 0.94 },
              ].map((tick) => (
                <text
                  key={tick.label}
                  x={chartX + tick.t * chartW}
                  y="243"
                  textAnchor="middle"
                  fontSize="10.5"
                  fill="var(--muted)"
                  fontFamily="var(--font-mono)"
                >
                  {tick.label}
                </text>
              ))}

              {/* Right PSI Monitor Card */}
              <rect x="454" y="14" width="210" height="252" rx="12" fill="var(--surface)" stroke={psiColor} strokeWidth="1.5" className={txClass} />
              <text x="468" y="37" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
                PSI DRIFT GAUGE
              </text>

              {/* Big PSI Score Card */}
              <rect x="468" y="48" width="182" height="72" rx="10" fill={psiSoft} stroke={psiColor} strokeWidth="1.25" className={txClass} />
              <text x="480" y="70" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
                CURRENT PSI
              </text>
              <text x="638" y="78" textAnchor="end" fontSize="22" fontWeight="700" fill={psiColor} fontFamily="var(--font-mono)">
                {psiValue.toFixed(2)}
              </text>
              <text x="480" y="106" fontSize="12" fontWeight="700" fill={psiColor} fontFamily="var(--font-sans)">
                {isPromo ? "Drift Alert! (> 0.20)" : "Normal (< 0.10)"}
              </text>

              {/* 3-Zone Threshold Meter */}
              <text x="468" y="140" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                เกณฑ์เฝ้าระวัง (0.04 → 0.29)
              </text>
              <rect x="468" y="148" width="52" height="12" rx="3" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1" />
              <rect x="522" y="148" width="52" height="12" rx="3" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1" />
              <rect x="576" y="148" width="74" height="12" rx="3" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1" />

              {/* Animated Indicator Needle */}
              <line x1={psiMarkerX} y1="143" x2={psiMarkerX} y2="165" stroke="var(--fg)" strokeWidth="2.5" className={txClass} />
              <circle cx={psiMarkerX} cy="143" r="3.5" fill={psiColor} stroke="var(--surface)" strokeWidth="1.5" className={txClass} />

              <text x="468" y="177" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
                0.00
              </text>
              <text x="522" y="177" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
                0.10
              </text>
              <text x="576" y="177" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
                0.20
              </text>
              <text x="650" y="177" textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
                0.35
              </text>

              {/* Action Box */}
              <rect x="468" y="192" width="182" height="60" rx="9" fill="var(--surface-2)" stroke="var(--hair)" />
              <text x="480" y="212" fontSize="11" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
                {isPromo ? "การรับมือ (Action)" : "สถานะระบบ (Status)"}
              </text>
              <text x="480" y="229" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                {isPromo ? "1. แจ้งเตือนทีม & ตรวจ F1 จริง" : "ติดตาม Batch รายวันตามปกติ"}
              </text>
              <text x="480" y="244" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                {isPromo ? "2. เก็บ Label ใหม่แล้ว Retrain" : "ไม่ต้อง Retrain ประหยัด Compute"}
              </text>
            </>
          ) : (
            <>
              {/* Latency Comparison Panel */}
              <rect x="16" y="14" width="648" height="252" rx="12" fill="var(--surface)" stroke="var(--line)" />
              <text x="32" y="38" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
                เปรียบเทียบเวลาทำนาย P95 Inference Latency (สเกลเปรียบเทียบ)
              </text>
              <rect x="506" y="23" width="142" height="22" rx="11" fill="var(--success-soft)" />
              <text x="577" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                SLA Budget &lt; 10 ms
              </text>

              {/* Vertical SLA Threshold Line */}
              <line x1="386" y1="58" x2="386" y2="216" stroke="var(--success)" strokeWidth="1.75" strokeDasharray="5 4" />
              <text x="386" y="54" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                10 ms SLA
              </text>

              {LATENCY_ROWS.map((row, idx) => {
                const y = 70 + idx * 48;
                const trackX = 186;
                const trackW = 330;
                return (
                  <g key={row.label}>
                    <text x="32" y={y + 15} fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
                      {row.label}
                    </text>
                    <text x="32" y={y + 31} fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                      {row.sub}
                    </text>

                    {/* Track */}
                    <rect x={trackX} y={y + 8} width={trackW} height="20" rx="7" fill="var(--surface-2)" stroke="var(--hair)" />

                    {/* Filled Latency Bar */}
                    <rect
                      x={trackX}
                      y={y + 8}
                      width={row.barW}
                      height="20"
                      rx="7"
                      fill={row.color}
                      className={txClass}
                    />

                    {/* Fast flow indicator for ONNX */}
                    {row.animateFlow && (
                      <line
                        x1={trackX + row.barW + 8}
                        y1={y + 18}
                        x2="378"
                        y2={y + 18}
                        stroke="var(--success)"
                        strokeWidth="2"
                        strokeDasharray={reduced ? undefined : "5 5"}
                        className={flowClass}
                        markerEnd={`url(#${markerFast})`}
                      />
                    )}

                    {/* Status pill on right */}
                    <rect x="526" y={y + 6} width="124" height="24" rx="7" fill={row.soft} />
                    <text
                      x="588"
                      y={y + 22}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill={row.color}
                      fontFamily="var(--font-mono)"
                    >
                      {row.status.split(" · ")[0]}
                    </text>
                  </g>
                );
              })}

              {/* Bottom Engineering Summary Strip */}
              <rect x="30" y="222" width="620" height="32" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
              <text x="44" y="242" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
                ONNX Runtime ตัดภาระ Python Interpreter → ตอบใน 2.4 ms ผ่าน SLA สบาย และประหยัดกว่าเรียก LLM API หลายร้อยเท่า
              </text>
            </>
          )}
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 4. Phase2MlPipelineVisual (phase2-ml-pipeline)                             */
/* ========================================================================== */

interface PipelineStage {
  id: string;
  blocks: string[];
  tagLabel: string;
  titleLine1: string;
  titleLine2: string;
  microLabel: string;
  fullName: string;
  ioFlow: string;
  summary: string;
  artifact: string;
  accent: string;
  soft: string;
}

const ALL_PHASE2_BLOCKS = ["B09", "B10", "B11", "B12", "B13", "B14", "B15"] as const;

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "data",
    blocks: ["B09", "B10"],
    tagLabel: "B09 · B10",
    titleLine1: "Polars +",
    titleLine2: "DuckDB",
    microLabel: "Data & SQL",
    fullName: "1. โหลดและเตรียมข้อมูลความเร็วสูง (Polars + DuckDB)",
    ioFlow: "Parquet 1M → Lazy Pushdown + SQL → Clean Features",
    summary:
      "B09 ใช้ Polars LazyFrame ลด RAM Peak และ B10 ใช้ DuckDB เขียน SQL Window Functions ป้องกันข้อมูลรั่วจากอนาคต (No Future Leakage)",
    artifact: "Output: train_features.parquet (Zero leakage verified)",
    accent: "var(--brand)",
    soft: "var(--brand-soft)",
  },
  {
    id: "features",
    blocks: ["B11", "B12"],
    tagLabel: "B11 · B12",
    titleLine1: "PyThaiNLP +",
    titleLine2: "Tabular",
    microLabel: "Features",
    fullName: "2. แปลงข้อความไทยและฟีเจอร์ตาราง (PyThaiNLP + Tabular)",
    ioFlow: "Thai Text + Tabular → newmm TF-IDF + Scaler → Matrix",
    summary:
      "B11 จัดการเมตริกซ์และเวกเตอร์พื้นฐาน และ B12 ตัดคำภาษาไทยด้วย PyThaiNLP newmm ผสานกับ Tabular Pipeline ภายใน ColumnTransformer",
    artifact: "Output: sklearn Pipeline (fit เฉพาะ Train fold)",
    accent: "var(--cyan)",
    soft: "var(--cyan-soft)",
  },
  {
    id: "model",
    blocks: ["B13"],
    tagLabel: "B13",
    titleLine1: "LightGBM /",
    titleLine2: "LogReg",
    microLabel: "Model & CV",
    fullName: "3. ฝึกและจูนโมเดลด้วย 5-Fold Stratified CV (LightGBM / LogReg)",
    ioFlow: "Features → 5-Fold CV + Boosting → Calibrated Model",
    summary:
      "B13 เปรียบเทียบ Baseline Logistic Regression กับ LightGBM Gradient Boosting ด้วย Stratified CV โดยล็อก Hold-out Test แยกไว้มิดชิด",
    artifact: "Output: Best CV Macro-F1 = 0.86 (Test untouched)",
    accent: "var(--brand)",
    soft: "var(--brand-soft)",
  },
  {
    id: "eval",
    blocks: ["B14"],
    tagLabel: "B14",
    titleLine1: "Threshold &",
    titleLine2: "Error Slice",
    microLabel: "Eval & Slice",
    fullName: "4. จูน Threshold และผ่า Error Analysis รายกลุ่ม (Error Slice)",
    ioFlow: "Proba → Cost Threshold + Slice Audit → Approved",
    summary:
      "B14 ไม่หยุดแค่คะแนนรวม แต่จูนจุดตัดความน่าจะเป็นตามต้นทุนธุรกิจ และผ่าดู Error Slice แยกตามประเภทลูกค้า/ช่วงเวลาเพื่ออุดจุดอ่อน",
    artifact: "Output: Tuned τ = 0.38 · Worst-slice F1 > 0.80",
    accent: "var(--warning)",
    soft: "var(--warning-soft)",
  },
  {
    id: "serve",
    blocks: ["B15"],
    tagLabel: "B15",
    titleLine1: "ONNX <10ms",
    titleLine2: "+ pytest",
    microLabel: "Serve & Drift",
    fullName: "5. ส่งขึ้น Production ด้วย ONNX Runtime, pytest และ Drift Monitor",
    ioFlow: "Model → ONNX (2.4ms) + pytest + PSI Drift Alert",
    summary:
      "B15 แปลงโมเดลเป็น ONNX เพื่อทำนายต่ำกว่า 10 ms ผูกชุดทดสอบ pytest ตรวจ Contract/Latency และเฝ้าระวัง Feature Drift ด้วย PSI",
    artifact: "Output: model.onnx (P95 2.4ms) · CI Green · PSI Monitor",
    accent: "var(--success)",
    soft: "var(--success-soft)",
  },
];

export function Phase2MlPipelineVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerActive = `${uid}-p2-active`;
  const markerIdle = `${uid}-p2-idle`;

  const stage = PIPELINE_STAGES[selectedIdx];
  const activeCenterX = 14 + selectedIdx * 134 + 58;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกขั้นตอนในสถาปัตยกรรม Phase 2 Milestone" className="flex flex-wrap gap-2">
        {PIPELINE_STAGES.map((st, idx) => {
          const active = selectedIdx === idx;
          return (
            <button
              key={st.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setSelectedIdx(idx)}
            >
              {st.tagLabel}: {st.microLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนผังสถาปัตยกรรม 5 ขั้นตอนของ Phase 2 Classical ML Pipeline เชื่อมโยง Block B09 ถึง B15"
        >
          <defs>
            <marker id={markerActive} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={markerIdle} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--line)" />
            </marker>
          </defs>

          {/* Animated Pipeline Edges Between 5 Nodes */}
          {[0, 1, 2, 3].map((edgeIdx) => {
            const x1 = 14 + edgeIdx * 134 + 116;
            const x2 = 14 + (edgeIdx + 1) * 134 - 2;
            const isHighlighted = edgeIdx === selectedIdx || edgeIdx === selectedIdx - 1;
            return (
              <line
                key={edgeIdx}
                x1={x1}
                y1="74"
                x2={x2}
                y2="74"
                stroke={isHighlighted ? "var(--brand)" : "var(--line)"}
                strokeWidth={isHighlighted ? "2.5" : "1.75"}
                strokeDasharray={reduced ? undefined : "5 5"}
                className={flowClass}
                markerEnd={`url(#${isHighlighted ? markerActive : markerIdle})`}
              />
            );
          })}

          {/* 5 Clickable Architecture Nodes */}
          {PIPELINE_STAGES.map((st, idx) => {
            const x = 14 + idx * 134;
            const isSelected = idx === selectedIdx;
            return (
              <g
                key={st.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${st.tagLabel} ${st.titleLine1} ${st.titleLine2}`}
                className="cursor-pointer outline-none"
                onClick={() => setSelectedIdx(idx)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setSelectedIdx(idx))}
              >
                <rect
                  x={x}
                  y="16"
                  width="116"
                  height="116"
                  rx="12"
                  fill={isSelected ? st.soft : "var(--surface)"}
                  stroke={isSelected ? st.accent : "var(--line)"}
                  strokeWidth={isSelected ? "2" : "1.25"}
                  className={txClass}
                />

                {/* Top Block Tag Badge */}
                <rect
                  x={x + 14}
                  y="24"
                  width="88"
                  height="20"
                  rx="10"
                  fill={isSelected ? "var(--surface)" : st.soft}
                  stroke={isSelected ? st.accent : "none"}
                  strokeWidth="1"
                  className={txClass}
                />
                <text
                  x={x + 58}
                  y="37.5"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill={st.accent}
                  fontFamily="var(--font-mono)"
                >
                  {st.tagLabel}
                </text>

                {/* Node Title (2 clean lines) */}
                <text
                  x={x + 58}
                  y="68"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="var(--fg)"
                  fontFamily="var(--font-mono)"
                >
                  {st.titleLine1}
                </text>
                <text
                  x={x + 58}
                  y="86"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="var(--fg)"
                  fontFamily="var(--font-mono)"
                >
                  {st.titleLine2}
                </text>

                {/* Subtle divider + micro role */}
                <line x1={x + 18} y1="100" x2={x + 98} y2="100" stroke="var(--hair)" strokeWidth="1" />
                <text
                  x={x + 58}
                  y="119"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="600"
                  fill={isSelected ? st.accent : "var(--muted)"}
                  fontFamily="var(--font-sans)"
                >
                  {st.microLabel}
                </text>
              </g>
            );
          })}

          {/* Pointer stem from selected node to inspector card */}
          <line
            x1={activeCenterX}
            y1="132"
            x2={activeCenterX}
            y2="152"
            stroke={stage.accent}
            strokeWidth="2.5"
            strokeDasharray={reduced ? undefined : "4 4"}
            className={flowClass}
          />
          <circle cx={activeCenterX} cy="152" r="3.5" fill={stage.accent} className={txClass} />

          {/* Bottom Live Inspector & 7-Block Map */}
          <rect
            x="14"
            y="152"
            width="652"
            height="114"
            rx="12"
            fill="var(--surface)"
            stroke={stage.accent}
            strokeWidth="1.5"
            className={txClass}
          />

          {/* Left Inspector Details */}
          <text x="30" y="177" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            {stage.fullName}
          </text>
          <text x="30" y="200" fontSize="11.5" fontWeight="600" fill={stage.accent} fontFamily="var(--font-mono)">
            {stage.ioFlow}
          </text>
          <text x="30" y="224" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
            {stage.summary.length > 74 ? `${stage.summary.slice(0, 73)}…` : stage.summary}
          </text>
          <rect x="30" y="234" width="424" height="22" rx="6" fill="var(--surface-2)" />
          <text x="40" y="249" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
            {stage.artifact}
          </text>

          {/* Right Live Block Map (B09–B15) */}
          <rect x="468" y="164" width="184" height="90" rx="10" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="480" y="182" fontSize="10.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            PHASE 2 BLOCKS (B09–B15)
          </text>

          {ALL_PHASE2_BLOCKS.map((blk, bIdx) => {
            const col = bIdx % 4;
            const row = Math.floor(bIdx / 4);
            const bx = 480 + col * 41;
            const by = 192 + row * 28;
            const isActiveBlock = stage.blocks.includes(blk);
            return (
              <g key={blk}>
                <rect
                  x={bx}
                  y={by}
                  width="36"
                  height="22"
                  rx="6"
                  fill={isActiveBlock ? stage.soft : "var(--surface)"}
                  stroke={isActiveBlock ? stage.accent : "var(--line)"}
                  strokeWidth={isActiveBlock ? "1.5" : "1"}
                  className={txClass}
                />
                <text
                  x={bx + 18}
                  y={by + 14.5}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill={isActiveBlock ? stage.accent : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {blk}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {stage.fullName} ({stage.blocks.join(", ")}): {stage.summary}
      </p>
    </div>
  );
}
