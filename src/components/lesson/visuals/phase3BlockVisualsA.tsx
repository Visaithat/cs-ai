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
/* 1. PytorchAutogradVisual (pytorch-autograd)                                */
/* ========================================================================== */

interface AutogradStep {
  id: number;
  label: string;
  shortCode: string;
  weightText: string;
  weightDelta: string;
  gradText: string;
  gradSub: string;
  predText: string;
  lossVal: number;
  lossText: string;
  lossSub: string;
  badge: string;
  caption: string;
}

const AUTOGRAD_STEPS: readonly AutogradStep[] = [
  {
    id: 0,
    label: "1. zero_grad()",
    shortCode: "optimizer.zero_grad()",
    weightText: "w = 0.80",
    weightDelta: "b = 0.20 · lr = 0.05",
    gradText: "w.grad = 0.00",
    gradSub: "ล้างค่าเก่า (กัน grad สะสม)",
    predText: "ŷ = —",
    lossVal: 1.44,
    lossText: "รอคำนวณ",
    lossSub: "เป้าหมาย y = 3.00",
    badge: "RESET GRADIENTS",
    caption:
      "ขั้นที่ 1 optimizer.zero_grad(): ล้างค่า gradient เก่าของรอบก่อนให้เป็น 0.00 เสมอ เพราะ PyTorch จะบวกสะสม (accumulate) ค่า grad ทับของเดิมหากไม่สั่งล้างก่อน",
  },
  {
    id: 1,
    label: "2. Forward Pass",
    shortCode: "y_hat = model(x); loss = mse(y_hat, y)",
    weightText: "w = 0.80",
    weightDelta: "z = 0.80×2 + 0.20 = 1.80",
    gradText: "w.grad = 0.00",
    gradSub: "สร้าง Computation Graph",
    predText: "ŷ = 1.80",
    lossVal: 1.44,
    lossText: "L = 1.44",
    lossSub: "(1.80 − 3.00)² = 1.44",
    badge: "FORWARD FLOW →",
    caption:
      "ขั้นที่ 2 Forward Pass: ส่ง x = 2.00 ผ่าน Linear + ReLU ได้คำทำนาย ŷ = 1.80 เทียบกับเป้าหมาย y = 3.00 ได้ค่า MSE Loss = 1.44 พร้อมบันทึกกราฟการคำนวณไว้สำหรับย้อนกลับ",
  },
  {
    id: 2,
    label: "3. loss.backward()",
    shortCode: "loss.backward()",
    weightText: "w = 0.80",
    weightDelta: "ยังไม่ขยับน้ำหนัก",
    gradText: "w.grad = -4.80",
    gradSub: "dL/dŷ = -2.40 → × x(2.0)",
    predText: "ŷ = 1.80",
    lossVal: 1.44,
    lossText: "L = 1.44",
    lossSub: "Autograd ไล่ Chain Rule กลับ",
    badge: "← BACKWARD GRADIENT",
    caption:
      "ขั้นที่ 3 loss.backward(): Autograd ไล่อนุพันธ์ย้อนกลับด้วย Chain Rule จาก Loss → ŷ (dL/dŷ = -2.40) ไปยังน้ำหนักได้ w.grad = -4.80 บอกทิศทางว่าต้องเพิ่ม w เพื่อให้ Loss ลดลง",
  },
  {
    id: 3,
    label: "4. optimizer.step()",
    shortCode: "optimizer.step()",
    weightText: "w = 1.04",
    weightDelta: "0.80 − 0.05×(-4.80) ↑",
    gradText: "w.grad = -4.80",
    gradSub: "อัปเดต w และ b เรียบร้อย",
    predText: "ŷ → 2.40",
    lossVal: 0.36,
    lossText: "L: 1.44 → 0.36",
    lossSub: "Loss ลดลงทันที 75%!",
    badge: "WEIGHTS UPDATED ✓",
    caption:
      "ขั้นที่ 4 optimizer.step(): ปรับค่าน้ำหนักสวนทาง gradient (w = 0.80 → 1.04, b = 0.20 → 0.32) ทำให้รอบถัดไป ŷ ขยับใกล้ 3.00 เป็น 2.40 และ MSE Loss ลดฮวบจาก 1.44 เหลือ 0.36",
  },
];

export function PytorchAutogradVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [step, setStep] = useState(1);
  const current = AUTOGRAD_STEPS[step];
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const fwdArrowId = `${uid}-fwd-arrow`;
  const bwdArrowId = `${uid}-bwd-arrow`;

  const isZero = step === 0;
  const isFwd = step === 1;
  const isBwd = step === 2;
  const isOpt = step === 3;

  const lossBarW = Math.max(12, Math.round((current.lossVal / 1.44) * 164));

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกขั้นตอนในวงจร PyTorch Autograd" className="flex flex-wrap gap-2">
        {AUTOGRAD_STEPS.map((st) => {
          const active = st.id === step;
          return (
            <button
              key={st.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setStep(st.id)}
            >
              {st.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพวงจร PyTorch Autograd แสดง Forward Pass, Backward Gradient และ Optimizer Step"
        >
          <defs>
            <marker id={fwdArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isFwd ? "var(--brand)" : isOpt ? "var(--success)" : "var(--line)"} />
            </marker>
            <marker id={bwdArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isBwd ? "var(--cyan)" : "var(--line)"} />
            </marker>
          </defs>

          {/* Header Strip */}
          <text x="20" y="26" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            {current.shortCode}
          </text>
          <rect
            x="498"
            y="10"
            width="162"
            height="24"
            rx="12"
            fill={isBwd ? "var(--cyan-soft)" : isOpt ? "var(--success-soft)" : isZero ? "var(--warning-soft)" : "var(--brand-soft)"}
            stroke={isBwd ? "var(--cyan)" : isOpt ? "var(--success)" : isZero ? "var(--warning)" : "var(--brand)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <text
            x="579"
            y="26"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={isBwd ? "var(--cyan)" : isOpt ? "var(--success)" : isZero ? "var(--warning)" : "var(--brand-ink)"}
            fontFamily="var(--font-mono)"
          >
            {current.badge}
          </text>

          {/* Forward Arrows (Brand) */}
          {[
            { x1: 136, x2: 170 },
            { x1: 342, x2: 376 },
            { x1: 504, x2: 538 },
          ].map((arr, idx) => (
            <line
              key={idx}
              x1={arr.x1}
              y1="82"
              x2={arr.x2}
              y2="82"
              stroke={isFwd ? "var(--brand)" : isOpt ? "var(--success)" : "var(--line)"}
              strokeWidth={isFwd || isOpt ? "2.5" : "1.75"}
              strokeDasharray={isFwd && !reduced ? "6 6" : undefined}
              className={isFwd ? flowClass : txClass}
              markerEnd={`url(#${fwdArrowId})`}
            />
          ))}

          {/* Backward Gradient Paths (Cyan) */}
          <path
            d="M 602 116 Q 522 154 442 122"
            fill="none"
            stroke={isBwd ? "var(--cyan)" : "var(--line)"}
            strokeWidth={isBwd ? "2.5" : "1.25"}
            opacity={isBwd ? 1 : 0.38}
            strokeDasharray={isBwd && !reduced ? "6 6" : undefined}
            className={isBwd ? flowClass : txClass}
            markerEnd={`url(#${bwdArrowId})`}
          />
          <path
            d="M 442 116 Q 350 156 260 122"
            fill="none"
            stroke={isBwd ? "var(--cyan)" : "var(--line)"}
            strokeWidth={isBwd ? "2.5" : "1.25"}
            opacity={isBwd ? 1 : 0.38}
            strokeDasharray={isBwd && !reduced ? "6 6" : undefined}
            className={isBwd ? flowClass : txClass}
            markerEnd={`url(#${bwdArrowId})`}
          />

          {/* Backward Gradient Pill Callouts */}
          <g opacity={isBwd ? 1 : 0.45} className={txClass}>
            <rect
              x="472"
              y="138"
              width="104"
              height="22"
              rx="11"
              fill={isBwd ? "var(--cyan-soft)" : "var(--surface)"}
              stroke={isBwd ? "var(--cyan)" : "var(--hair)"}
            />
            <text
              x="524"
              y="153"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill={isBwd ? "var(--cyan)" : "var(--muted)"}
              fontFamily="var(--font-mono)"
            >
              dL/dŷ = -2.40
            </text>

            <rect
              x="294"
              y="138"
              width="112"
              height="22"
              rx="11"
              fill={isBwd ? "var(--cyan-soft)" : "var(--surface)"}
              stroke={isBwd ? "var(--cyan)" : "var(--hair)"}
            />
            <text
              x="350"
              y="153"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill={isBwd ? "var(--cyan)" : "var(--muted)"}
              fontFamily="var(--font-mono)"
            >
              w.grad = -4.80
            </text>
          </g>

          {/* Pipeline Node 0: Input x */}
          <g
            role="button"
            tabIndex={0}
            aria-label="ไปที่ขั้นที่ 2 Forward Pass"
            onClick={() => setStep(1)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(1))}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="20"
              y="48"
              width="116"
              height="68"
              rx="12"
              fill={isFwd ? "var(--brand-soft)" : "var(--surface)"}
              stroke={isFwd ? "var(--brand)" : "var(--line)"}
              strokeWidth={isFwd ? "2" : "1.5"}
              className={txClass}
            />
            <text x="78" y="74" textAnchor="middle" fontSize="13" fontWeight="700" fill={isFwd ? "var(--brand-ink)" : "var(--fg)"} fontFamily="var(--font-mono)">
              Input x
            </text>
            <text x="78" y="98" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
              x = 2.00
            </text>
          </g>

          {/* Pipeline Node 1: Linear + ReLU */}
          <g
            role="button"
            tabIndex={0}
            aria-label="ไปที่ขั้นที่ 4 optimizer.step()"
            onClick={() => setStep(3)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(3))}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="176"
              y="48"
              width="166"
              height="68"
              rx="12"
              fill={isOpt ? "var(--success-soft)" : isZero ? "var(--warning-soft)" : isBwd ? "var(--cyan-soft)" : isFwd ? "var(--brand-soft)" : "var(--surface)"}
              stroke={isOpt ? "var(--success)" : isZero ? "var(--warning)" : isBwd ? "var(--cyan)" : isFwd ? "var(--brand)" : "var(--line)"}
              strokeWidth="2"
              className={txClass}
            />
            <text
              x="259"
              y="74"
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill={isOpt ? "var(--success)" : isZero ? "var(--warning)" : isBwd ? "var(--cyan)" : "var(--brand-ink)"}
              fontFamily="var(--font-mono)"
            >
              Linear + ReLU
            </text>
            <text x="259" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
              {isOpt ? "w: 0.80 → 1.04" : isZero ? "grad → 0.00" : "w=0.80 · b=0.20"}
            </text>
          </g>

          {/* Pipeline Node 2: Output y_hat */}
          <g
            role="button"
            tabIndex={0}
            aria-label="ไปที่ขั้นที่ 2 Forward Pass"
            onClick={() => setStep(1)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(1))}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="382"
              y="48"
              width="122"
              height="68"
              rx="12"
              fill={isFwd ? "var(--brand-soft)" : isOpt ? "var(--success-soft)" : "var(--surface)"}
              stroke={isFwd ? "var(--brand)" : isOpt ? "var(--success)" : "var(--line)"}
              strokeWidth={isFwd || isOpt ? "2" : "1.5"}
              className={txClass}
            />
            <text
              x="443"
              y="74"
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill={isOpt ? "var(--success)" : isFwd ? "var(--brand-ink)" : "var(--fg)"}
              fontFamily="var(--font-mono)"
            >
              Pred ŷ
            </text>
            <text x="443" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
              {current.predText}
            </text>
          </g>

          {/* Pipeline Node 3: MSE Loss */}
          <g
            role="button"
            tabIndex={0}
            aria-label="ไปที่ขั้นที่ 3 loss.backward()"
            onClick={() => setStep(2)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(2))}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="544"
              y="48"
              width="116"
              height="68"
              rx="12"
              fill={isBwd ? "var(--cyan-soft)" : isOpt ? "var(--success-soft)" : isFwd ? "var(--warning-soft)" : "var(--surface)"}
              stroke={isBwd ? "var(--cyan)" : isOpt ? "var(--success)" : isFwd ? "var(--warning)" : "var(--line)"}
              strokeWidth={isBwd || isFwd || isOpt ? "2" : "1.5"}
              className={txClass}
            />
            <text
              x="602"
              y="74"
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill={isBwd ? "var(--cyan)" : isOpt ? "var(--success)" : isFwd ? "var(--warning)" : "var(--fg)"}
              fontFamily="var(--font-mono)"
            >
              Loss L
            </text>
            <text x="602" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
              {isZero ? "y = 3.00" : isOpt ? "0.36 ↓" : "1.44"}
            </text>
          </g>

          {/* Bottom Live Telemetry Panel */}
          <rect x="20" y="176" width="640" height="90" rx="12" fill="var(--surface)" stroke="var(--line)" />

          {/* Metric 1: Weight */}
          <rect
            x="32"
            y="188"
            width="196"
            height="66"
            rx="8"
            fill={isOpt ? "var(--success-soft)" : "var(--surface-2)"}
            stroke={isOpt ? "var(--success)" : "var(--hair)"}
            className={txClass}
          />
          <text x="44" y="206" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-sans)">
            น้ำหนักโมเดล (Parameter)
          </text>
          <text x="44" y="228" fontSize="15" fontWeight="700" fill={isOpt ? "var(--success)" : "var(--fg)"} fontFamily="var(--font-mono)">
            {current.weightText}
          </text>
          <text x="44" y="246" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
            {current.weightDelta}
          </text>

          {/* Metric 2: Gradient */}
          <rect
            x="242"
            y="188"
            width="196"
            height="66"
            rx="8"
            fill={isBwd ? "var(--cyan-soft)" : isZero ? "var(--warning-soft)" : "var(--surface-2)"}
            stroke={isBwd ? "var(--cyan)" : isZero ? "var(--warning)" : "var(--hair)"}
            className={txClass}
          />
          <text x="254" y="206" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-sans)">
            ความชันสะสม (Gradient)
          </text>
          <text
            x="254"
            y="228"
            fontSize="15"
            fontWeight="700"
            fill={isBwd ? "var(--cyan)" : isZero ? "var(--warning)" : "var(--fg)"}
            fontFamily="var(--font-mono)"
          >
            {current.gradText}
          </text>
          <text x="254" y="246" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
            {current.gradSub}
          </text>

          {/* Metric 3: Loss Bar */}
          <rect
            x="452"
            y="188"
            width="196"
            height="66"
            rx="8"
            fill={isOpt ? "var(--success-soft)" : "var(--surface-2)"}
            stroke={isOpt ? "var(--success)" : "var(--hair)"}
            className={txClass}
          />
          <text x="464" y="206" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-sans)">
            ค่าความผิดพลาด (MSE Loss)
          </text>
          <text x="464" y="226" fontSize="14" fontWeight="700" fill={isOpt ? "var(--success)" : "var(--warning)"} fontFamily="var(--font-mono)">
            {current.lossText}
          </text>
          <rect x="464" y="236" width="164" height="8" rx="4" fill="var(--surface)" stroke="var(--hair)" />
          <rect
            x="464"
            y="236"
            width={isZero ? 0 : lossBarW}
            height="8"
            rx="4"
            fill={isOpt ? "var(--success)" : "var(--warning)"}
            className={txClass}
          />
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {current.caption}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 2. SoftmaxTemperatureVisual (softmax-temperature)                          */
/* ========================================================================== */

interface TokenLogit {
  token: string;
  logit: number;
}

const SOFTMAX_TOKENS: readonly TokenLogit[] = [
  { token: "อนุมัติ", logit: 2.4 },
  { token: "ตรวจสอบ", logit: 1.5 },
  { token: "รอเอกสาร", logit: 0.4 },
  { token: "ยกเลิก", logit: -0.3 },
];

const TEMP_PRESETS = [
  { label: "0.2 คมชัด", value: 0.2 },
  { label: "1.0 ปกติ", value: 1.0 },
  { label: "1.8 กระจาย", value: 1.8 },
] as const;

export function SoftmaxTemperatureVisual({ reduced = false }: VisualProps) {
  const sliderId = useId();
  const [temperature, setTemperature] = useState(1.0);
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const scaled = SOFTMAX_TOKENS.map((t) => t.logit / temperature);
  const maxScaled = Math.max(...scaled);
  const exps = scaled.map((v) => Math.exp(v - maxScaled));
  const sumExp = exps.reduce((acc, v) => acc + v, 0);
  const probs = exps.map((v) => v / sumExp);

  const entropy = probs.reduce((acc, p) => (p > 1e-9 ? acc - p * Math.log2(p) : acc), 0);

  const regime =
    temperature <= 0.45
      ? { tag: "Deterministic · คมชัด", tone: "var(--brand-ink)", soft: "var(--brand-soft)", border: "var(--brand)" }
      : temperature <= 1.25
        ? { tag: "Balanced · สมดุล", tone: "var(--cyan)", soft: "var(--cyan-soft)", border: "var(--cyan)" }
        : { tag: "Creative · กระจายตัว", tone: "var(--warning)", soft: "var(--warning-soft)", border: "var(--warning)" };

  const captionText =
    temperature <= 0.45
      ? `T = ${temperature.toFixed(2)} (คมชัด): การหาร Logit ด้วยค่าน้อยทำให้ช่องว่างคะแนนขยายกว้าง คำอันดับ 1 ("${SOFTMAX_TOKENS[0].token}") กินความน่าจะเป็นถึง ${(probs[0] * 100).toFixed(1)}% เหมาะกับงานดึงข้อมูลและ JSON`
      : temperature <= 1.25
        ? `T = ${temperature.toFixed(2)} (ปกติ): คงสัดส่วนความน่าจะเป็นตามที่โมเดลเรียนรู้ ("${SOFTMAX_TOKENS[0].token}" ${(probs[0] * 100).toFixed(1)}%, "${SOFTMAX_TOKENS[1].token}" ${(probs[1] * 100).toFixed(1)}%) มี Entropy ${entropy.toFixed(2)} bits`
        : `T = ${temperature.toFixed(2)} (กระจายตัว): การหาร Logit ด้วยค่ามากทำให้แท่งความน่าจะเป็นแบนราบลง คำอันดับรองมีโอกาสถูกสุ่มมากขึ้น (Entropy ${entropy.toFixed(2)} bits) — ระวังคำตอบหลุดประเด็น`;

  const rowCenters = [100, 142, 184, 226];
  const barFills = ["var(--brand)", "var(--cyan)", "var(--warning)", "var(--muted)"] as const;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="เลือกค่า Temperature สำเร็จรูป" className="flex flex-wrap gap-2">
          {TEMP_PRESETS.map((preset) => {
            const active = Math.abs(temperature - preset.value) < 0.03;
            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={active}
                className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
                style={active ? ACTIVE_BTN_STYLE : undefined}
                onClick={() => setTemperature(preset.value)}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <label htmlFor={sliderId} className="flex min-w-[210px] flex-1 flex-col gap-1 text-sm sm:max-w-[280px]">
          <span className="flex items-center justify-between font-medium">
            <span>Temperature (T)</span>
            <span className="mono-label text-brand-ink tabular-nums">T = {temperature.toFixed(2)}</span>
          </span>
          <input
            id={sliderId}
            type="range"
            min={0.2}
            max={2.0}
            step={0.05}
            value={temperature}
            aria-label="ปรับค่า Temperature ตั้งแต่ 0.2 ถึง 2.0"
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="h-6 w-full cursor-pointer accent-[color:var(--brand)]"
          />
        </label>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพการปรับค่า Temperature ที่มีผลต่อการกระจายความน่าจะเป็นของ Softmax"
        >
          {/* Top Formula & Regime Bar */}
          <text x="18" y="28" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            P(i) = exp(zᵢ / T) / Σ exp(zⱼ / T)
          </text>
          <rect
            x="484"
            y="11"
            width="180"
            height="24"
            rx="12"
            fill={regime.soft}
            stroke={regime.border}
            strokeWidth="1.25"
            className={txClass}
          />
          <text x="574" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill={regime.tone} fontFamily="var(--font-sans)">
            {regime.tag}
          </text>

          {/* Left Card: Logits & Scaled z/T */}
          <rect x="16" y="46" width="204" height="218" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="28" y="68" fontSize="11" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            LOGIT (z)
          </text>
          <text x="208" y="68" textAnchor="end" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            SCALED (z / {temperature.toFixed(1)})
          </text>
          <line x1="28" y1="76" x2="208" y2="76" stroke="var(--hair)" />

          {/* Right Card: Softmax Probability Bars */}
          <rect x="260" y="46" width="404" height="218" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="274" y="68" fontSize="11" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-sans)">
            ความน่าจะเป็นหลัง Softmax
          </text>
          <text x="650" y="68" textAnchor="end" fontSize="11" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
            Entropy H = {entropy.toFixed(2)} bits
          </text>
          <line x1="274" y1="76" x2="650" y2="76" stroke="var(--hair)" />

          {/* Rows + Animated Flow Connectors */}
          {SOFTMAX_TOKENS.map((item, idx) => {
            const cy = rowCenters[idx];
            const p = probs[idx];
            const barW = Math.max(4, Math.round(p * 234));
            const isTop = idx === 0;
            const zScaled = scaled[idx];

            return (
              <g key={item.token}>
                {/* Left row box */}
                <rect
                  x="26"
                  y={cy - 15}
                  width="184"
                  height="30"
                  rx="8"
                  fill={isTop ? "var(--brand-soft)" : "var(--surface-2)"}
                  stroke={isTop ? "var(--brand)" : "var(--hair)"}
                  strokeWidth={isTop ? "1.25" : "1"}
                  className={txClass}
                />
                <text x="36" y={cy + 4} fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {item.logit >= 0 ? `+${item.logit.toFixed(1)}` : item.logit.toFixed(1)}
                </text>
                <text x="106" y={cy + 4} textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  →
                </text>
                <text
                  x="200"
                  y={cy + 4}
                  textAnchor="end"
                  fontSize="12"
                  fontWeight="700"
                  fill={isTop ? "var(--brand-ink)" : "var(--fg)"}
                  fontFamily="var(--font-mono)"
                >
                  {zScaled >= 0 ? `+${zScaled.toFixed(2)}` : zScaled.toFixed(2)}
                </text>

                {/* Animated connector line */}
                <line
                  x1="220"
                  y1={cy}
                  x2="260"
                  y2={cy}
                  stroke={barFills[idx]}
                  strokeWidth={1.25 + p * 3.5}
                  opacity={0.3 + p * 0.7}
                  strokeDasharray={reduced ? undefined : "6 6"}
                  className={flowClass}
                />

                {/* Right token label */}
                <text x="274" y={cy + 4} fontSize="13" fontWeight={isTop ? "700" : "600"} fill="var(--fg)" fontFamily="var(--font-sans)">
                  {item.token}
                </text>

                {/* Probability track & animated bar */}
                <rect x="348" y={cy - 9} width="234" height="18" rx="9" fill="var(--surface-2)" stroke="var(--hair)" />
                <rect x="348" y={cy - 9} width={barW} height="18" rx="9" fill={barFills[idx]} className={txClass} />

                {/* Percentage value */}
                <text
                  x="650"
                  y={cy + 4}
                  textAnchor="end"
                  fontSize="12"
                  fontWeight={isTop ? "700" : "600"}
                  fill={isTop ? "var(--brand-ink)" : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {(p * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 3. PostTrainingStagesVisual (post-training-stages)                         */
/* ========================================================================== */

interface PostTrainStage {
  id: number;
  btnLabel: string;
  boxTitle: string;
  boxSub: string;
  signal: string;
  outputHeader: string;
  line1: string;
  line2: string;
  line3: string;
  isMonoOutput: boolean;
  tone: "danger" | "warning" | "success";
  scores: { instruction: number; grounded: number; concise: number };
  caption: string;
}

const POST_TRAIN_STAGES: readonly PostTrainStage[] = [
  {
    id: 0,
    btnLabel: "1. Pre-training (Base)",
    boxTitle: "1. Pre-training",
    boxSub: "ทำนายคำถัดไป (Base)",
    signal: "Next-Token Prediction",
    outputHeader: "BASE COMPLETION (เขียนต่อคำไปเรื่อย ไม่ทำตามคำสั่ง)",
    line1: "และต้องเก็บใบเสร็จไว้ภายใน 7 วัน... คำถามถัดไป:",
    line2: "วิธีเปลี่ยนที่อยู่จัดส่งในแอปทำอย่างไร? 1. เข้าเมนู...",
    line3: "ไม่เข้าใจรูปแบบ JSON — แค่เดาข้อความต่อเหมือนหน้าเว็บบอร์ด",
    isMonoOutput: false,
    tone: "danger",
    scores: { instruction: 15, grounded: 22, concise: 12 },
    caption:
      'ขั้น Pre-training (Base Model): โมเดลเรียนเพียงการทำนายคำถัดไปจากข้อความมหาศาล เมื่อเจอคำสั่ง "สรุปนโยบายคืนเงินเป็น JSON" มันจึงเขียนต่อประโยคไปเรื่อยๆ แทนที่จะตอบเป็น JSON',
  },
  {
    id: 1,
    btnLabel: "2. SFT (Instruction)",
    boxTitle: "2. SFT",
    boxSub: "ฝึกคู่คำสั่ง-คำตอบ",
    signal: "Supervised Q&A Pairs",
    outputHeader: "SFT OUTPUT (ตอบเป็น JSON ได้ แต่ยังมีคำเกริ่นและเดาเพิ่ม)",
    line1: "ได้เลยครับ! นี่คือสรุปนโยบายคืนเงินในรูปแบบ JSON:",
    line2: '{"refund_days": 30, "all_items": true}',
    line3: "มีข้อความเกริ่นนำปนมา + เดาตัวเลข 30 วันเองโดยไม่อิงเอกสารจริง",
    isMonoOutput: false,
    tone: "warning",
    scores: { instruction: 76, grounded: 52, concise: 58 },
    caption:
      "ขั้น SFT (Supervised Fine-Tuning): สอนด้วยตัวอย่างคู่คำสั่ง-คำตอบ ทำให้เริ่มตอบเป็น JSON ได้ แต่ยังมีนิสัยพูดเกริ่นนำและอาจเดาข้อมูลนอกเอกสาร (Hallucination) เมื่อไม่แน่ใจ",
  },
  {
    id: 2,
    btnLabel: "3. RLHF / DPO (Aligned)",
    boxTitle: "3. RLHF / DPO",
    boxSub: "จัดแนวด้วย Preference",
    signal: "Chosen vs Rejected",
    outputHeader: "ALIGNED OUTPUT (JSON ล้วน กระชับ ตรงนโยบาย ปลอดภัย)",
    line1: '{"window_days": 7, "receipt_required": true,',
    line2: ' "excluded": ["สินค้าเปิดผนึก"], "grounded": true}',
    line3: "ไร้คำเกริ่น Parse ได้ทันที อ้างอิงเฉพาะข้อมูลที่มีและปฏิเสธเมื่อไม่รู้",
    isMonoOutput: true,
    tone: "success",
    scores: { instruction: 96, grounded: 94, concise: 95 },
    caption:
      "ขั้น RLHF / DPO (Alignment): สอนโมเดลเปรียบเทียบคำตอบที่ดี (Chosen) กับคำตอบที่แย่ (Rejected) จนได้ JSON ที่สะอาด กระชับ ยึดตามข้อเท็จจริง และปลอดภัยพร้อมใช้ในระบบจริง",
  },
];

export function PostTrainingStagesVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [stageIdx, setStageIdx] = useState(2);
  const stage = POST_TRAIN_STAGES[stageIdx];
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const arrowId = `${uid}-pt-arrow`;

  const centers = [114, 340, 566];
  const activeCenterX = centers[stageIdx];

  const toneVars =
    stage.tone === "success"
      ? { color: "var(--success)", soft: "var(--success-soft)" }
      : stage.tone === "warning"
        ? { color: "var(--warning)", soft: "var(--warning-soft)" }
        : { color: "var(--danger)", soft: "var(--danger-soft)" };

  const metricRows = [
    { label: "ทำตามคำสั่ง", val: stage.scores.instruction, y: 176 },
    { label: "ตรงข้อมูล", val: stage.scores.grounded, y: 204 },
    { label: "กระชับ/ปลอดภัย", val: stage.scores.concise, y: 232 },
  ];

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกขั้นตอนการเทรน LLM หลัง Pre-training" className="flex flex-wrap gap-2">
        {POST_TRAIN_STAGES.map((st) => {
          const active = st.id === stageIdx;
          return (
            <button
              key={st.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setStageIdx(st.id)}
            >
              {st.btnLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพเปรียบเทียบผลลัพธ์ของ Prompt เดียวกันในขั้น Pre-training, SFT และ RLHF/DPO"
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
          </defs>

          {/* Connecting stage arrows */}
          {[
            { x1: 214, x2: 238, active: stageIdx >= 1 },
            { x1: 440, x2: 464, active: stageIdx >= 2 },
          ].map((arr, idx) => (
            <line
              key={idx}
              x1={arr.x1}
              y1="46"
              x2={arr.x2}
              y2="46"
              stroke={arr.active ? "var(--brand)" : "var(--line)"}
              strokeWidth={arr.active ? "2.5" : "1.75"}
              strokeDasharray={arr.active && !reduced ? "6 6" : undefined}
              className={arr.active ? flowClass : txClass}
              markerEnd={`url(#${arrowId})`}
            />
          ))}

          {/* 3 Clickable Stage Nodes */}
          {POST_TRAIN_STAGES.map((st, idx) => {
            const x = 16 + idx * 226;
            const isActive = idx === stageIdx;
            const isReached = idx <= stageIdx;
            const fill = isActive ? "var(--brand-soft)" : isReached ? "var(--surface)" : "var(--surface)";
            const stroke = isActive ? "var(--brand)" : isReached ? "var(--cyan)" : "var(--line)";

            return (
              <g
                key={st.id}
                role="button"
                tabIndex={0}
                aria-label={`ดูผลลัพธ์ขั้น ${st.btnLabel}`}
                aria-pressed={isActive}
                onClick={() => setStageIdx(st.id)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setStageIdx(st.id))}
                style={{ cursor: "pointer" }}
              >
                <rect x={x} y="14" width="196" height="64" rx="12" fill={fill} stroke={stroke} strokeWidth={isActive ? "2" : "1.5"} className={txClass} />
                <text
                  x={x + 98}
                  y="40"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill={isActive ? "var(--brand-ink)" : "var(--fg)"}
                  fontFamily="var(--font-mono)"
                >
                  {st.boxTitle}
                </text>
                <text x={x + 98} y="62" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                  {st.boxSub}
                </text>
              </g>
            );
          })}

          {/* Drop connector to output inspector */}
          <line
            x1={activeCenterX}
            y1="78"
            x2={activeCenterX}
            y2="102"
            stroke={toneVars.color}
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
          />
          <circle cx={activeCenterX} cy="104" r="4" fill={toneVars.color} className={txClass} />

          {/* Main Inspector Card */}
          <rect x="16" y="104" width="648" height="162" rx="12" fill="var(--surface)" stroke={toneVars.color} strokeWidth="1.5" className={txClass} />

          {/* Same Thai Prompt Strip */}
          <rect x="28" y="114" width="624" height="30" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="40" y="133" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            Prompt:{" "}
            <tspan fill="var(--brand-ink)">&quot;สรุปนโยบายคืนเงินเป็น JSON&quot;</tspan>
          </text>
          <text x="640" y="133" textAnchor="end" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
            Signal: {stage.signal}
          </text>

          {/* Left: Model Response Preview */}
          <rect
            x="28"
            y="152"
            width="412"
            height="102"
            rx="10"
            fill={toneVars.soft}
            stroke={toneVars.color}
            strokeOpacity="0.5"
            className={txClass}
          />
          <text x="40" y="172" fontSize="11" fontWeight="700" fill={toneVars.color} fontFamily="var(--font-mono)">
            {stage.outputHeader}
          </text>
          <text
            x="40"
            y="196"
            fontSize="12"
            fontWeight="600"
            fill="var(--fg)"
            fontFamily={stage.isMonoOutput ? "var(--font-mono)" : "var(--font-sans)"}
          >
            {stage.line1}
          </text>
          <text
            x="40"
            y="218"
            fontSize="12"
            fontWeight="600"
            fill={stage.tone === "success" ? "var(--success)" : "var(--fg)"}
            fontFamily={stage.id >= 1 ? "var(--font-mono)" : "var(--font-sans)"}
          >
            {stage.line2}
          </text>
          <text x="40" y="242" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
            {stage.line3}
          </text>

          {/* Right: Alignment Scorecard */}
          <rect x="452" y="152" width="200" height="102" rx="10" fill="var(--surface-2)" stroke="var(--hair)" />
          {metricRows.map((row) => (
            <g key={row.label}>
              <text x="462" y={row.y} fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
                {row.label}
              </text>
              <rect x="550" y={row.y - 9} width="90" height="10" rx="5" fill="var(--surface)" stroke="var(--hair)" />
              <rect
                x="550"
                y={row.y - 9}
                width={Math.max(6, Math.round((row.val / 100) * 90))}
                height="10"
                rx="5"
                fill={toneVars.color}
                className={txClass}
              />
            </g>
          ))}
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {stage.caption}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 4. DenseEmbeddingsMapVisual (dense-embeddings-map)                         */
/* ========================================================================== */

type QueryId = "tax" | "crash" | "blindspot";

interface DocNode {
  id: string;
  shortLabel: string;
  lang: "TH" | "EN" | "ID";
  x: number;
  y: number;
  labelYOffset: number;
}

interface QueryScenario {
  id: QueryId;
  btnLabel: string;
  qx: number;
  qy: number;
  radius: number;
  isBlindspot: boolean;
  matches: readonly { docId: string; cosine: number }[];
  verdict: string;
  caption: string;
}

const EMBED_DOCS: readonly DocNode[] = [
  { id: "d1", shortLabel: "VAT Tax Invoice", lang: "EN", x: 108, y: 74, labelYOffset: -14 },
  { id: "d2", shortLabel: "ใบเสร็จ/ใบกำกับภาษี", lang: "TH", x: 158, y: 132, labelYOffset: 20 },
  { id: "d5", shortLabel: "#INV-2026-009", lang: "ID", x: 362, y: 68, labelYOffset: -14 },
  { id: "d3", shortLabel: "Checkout Freeze", lang: "EN", x: 344, y: 168, labelYOffset: -14 },
  { id: "d4", shortLabel: "จ่ายเงินพัง แอปเด้ง", lang: "TH", x: 304, y: 224, labelYOffset: 20 },
  { id: "d6", shortLabel: "Refund Policy", lang: "EN", x: 102, y: 214, labelYOffset: 20 },
];

const EMBED_QUERIES: readonly QueryScenario[] = [
  {
    id: "tax",
    btnLabel: '"ขอใบกำกับภาษี"',
    qx: 128,
    qy: 100,
    radius: 68,
    isBlindspot: false,
    matches: [
      { docId: "d2", cosine: 0.93 },
      { docId: "d1", cosine: 0.89 },
      { docId: "d6", cosine: 0.44 },
    ],
    verdict: "ข้ามภาษา TH↔EN แม่นยำ",
    caption:
      'คำค้น "ขอใบกำกับภาษี" ตกลงกลางกลุ่มเอกสารภาษีและดึงได้ทั้งเอกสารไทย ("ใบเสร็จ/ใบกำกับภาษี" 0.93) และภาษาอังกฤษ ("VAT Tax Invoice" 0.89) แม้ไม่มีคำซ้ำตรงกันเลย',
  },
  {
    id: "crash",
    btnLabel: '"แอปค้างตอนจ่ายเงิน"',
    qx: 322,
    qy: 196,
    radius: 66,
    isBlindspot: false,
    matches: [
      { docId: "d4", cosine: 0.91 },
      { docId: "d3", cosine: 0.87 },
      { docId: "d6", cosine: 0.31 },
    ],
    verdict: "จับความหมายเชิงบริบทได้",
    caption:
      'คำค้น "แอปค้างตอนจ่ายเงิน" เชื่อมโยงความหมายไปยัง "จ่ายเงินพัง แอปเด้ง" (0.91) และคู่มืออังกฤษ "Checkout Freeze" (0.87) ได้แม่นยำเพราะ Dense Vector เก็บเจตนาของปัญหา',
  },
  {
    id: "blindspot",
    btnLabel: '"#INV-2026-009 (จุดบอด)"',
    qx: 234,
    qy: 132,
    radius: 68,
    isBlindspot: true,
    matches: [
      { docId: "d2", cosine: 0.56 },
      { docId: "d1", cosine: 0.52 },
      { docId: "d5", cosine: 0.49 },
    ],
    verdict: "จุดบอดรหัส → ใช้ Hybrid BM25",
    caption:
      'จุดบอดของ Dense Embedding: รหัสเฉพาะ "#INV-2026-009" ไม่มีความหมายเชิงภาษา ทำให้คะแนนกระจายต่ำและพลาดเอกสารตัวจริง (#INV-2026-009 ตกไปอันดับ 3 ที่ 0.49) ต้องผสาน BM25 (Hybrid Search) ช่วยจับรหัสเป๊ะๆ',
  },
];

export function DenseEmbeddingsMapVisual({ reduced = false }: VisualProps) {
  const [queryId, setQueryId] = useState<QueryId>("tax");
  const scenario = EMBED_QUERIES.find((q) => q.id === queryId) ?? EMBED_QUERIES[0];
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const matchMap = new Map(scenario.matches.map((m, i) => [m.docId, { ...m, rank: i + 1 }]));
  const accentColor = scenario.isBlindspot ? "var(--danger)" : "var(--brand)";
  const accentSoft = scenario.isBlindspot ? "var(--danger-soft)" : "var(--brand-soft)";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกคำค้น (Query) เพื่อดูระยะห่างใน 2D Semantic Space" className="flex flex-wrap gap-2">
        {EMBED_QUERIES.map((q) => {
          const active = q.id === queryId;
          return (
            <button
              key={q.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setQueryId(q.id)}
            >
              {q.btnLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพ 2D Semantic Neighborhood แสดงการจับคู่ Cosine Similarity และจุดบอดของ Dense Embedding"
        >
          {/* Left 2D Semantic Plot Container */}
          <rect x="16" y="14" width="428" height="252" rx="12" fill="var(--surface)" stroke="var(--line)" />

          {/* Subtle Coordinate Grid */}
          {[122, 230, 338].map((gx) => (
            <line key={gx} x1={gx} y1="36" x2={gx} y2="254" stroke="var(--hair)" strokeWidth="1" />
          ))}
          {[82, 146, 210].map((gy) => (
            <line key={gy} x1="28" y1={gy} x2="432" y2={gy} stroke="var(--hair)" strokeWidth="1" />
          ))}

          <text x="28" y="32" fontSize="11" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            2D SEMANTIC SPACE (TH + EN)
          </text>
          <text x="432" y="32" textAnchor="end" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
            cosine radius
          </text>

          {/* Animated Neighborhood Radius Circle */}
          <circle
            cx={scenario.qx}
            cy={scenario.qy}
            r={scenario.radius}
            fill={accentSoft}
            fillOpacity="0.45"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
          />

          {/* Animated Cosine Links from Query to Top-3 Matches */}
          {scenario.matches.map((m, idx) => {
            const doc = EMBED_DOCS.find((d) => d.id === m.docId);
            if (!doc) return null;
            const isStrong = m.cosine >= 0.8;
            const strokeColor = scenario.isBlindspot ? "var(--warning)" : isStrong ? "var(--brand)" : "var(--cyan)";
            const midX = (scenario.qx + doc.x) / 2;
            const midY = (scenario.qy + doc.y) / 2;

            return (
              <g key={`${scenario.id}-${m.docId}`}>
                <line
                  x1={scenario.qx}
                  y1={scenario.qy}
                  x2={doc.x}
                  y2={doc.y}
                  stroke={strokeColor}
                  strokeWidth={idx === 0 ? "2.5" : idx === 1 ? "2" : "1.25"}
                  opacity={idx === 2 ? 0.55 : 0.95}
                  strokeDasharray={reduced ? undefined : "6 6"}
                  className={flowClass}
                />
                {idx < 2 ? (
                  <g>
                    <rect x={midX - 18} y={midY - 9} width="36" height="17" rx="8" fill="var(--surface)" stroke={strokeColor} strokeWidth="1" />
                    <text
                      x={midX}
                      y={midY + 3}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill={strokeColor}
                      fontFamily="var(--font-mono)"
                    >
                      {m.cosine.toFixed(2)}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* Document Dots & Compact Labels */}
          {EMBED_DOCS.map((doc) => {
            const match = matchMap.get(doc.id);
            const isMatched = Boolean(match);
            const isTop = match && match.rank <= 2;
            const isMissedId = scenario.isBlindspot && doc.id === "d5";
            const dotFill = isMissedId
              ? "var(--danger)"
              : isTop && !scenario.isBlindspot
                ? "var(--cyan)"
                : isMatched
                  ? "var(--warning)"
                  : "var(--muted)";

            return (
              <g key={doc.id}>
                <circle
                  cx={doc.x}
                  cy={doc.y}
                  r={isTop || isMissedId ? 7 : 5}
                  fill={dotFill}
                  stroke="var(--surface)"
                  strokeWidth="2"
                  className={txClass}
                />
                <text
                  x={doc.x}
                  y={doc.y + doc.labelYOffset}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isTop || isMissedId ? "700" : "500"}
                  fill={isMissedId ? "var(--danger)" : isTop ? "var(--fg)" : "var(--muted)"}
                  fontFamily={doc.lang === "TH" ? "var(--font-sans)" : "var(--font-mono)"}
                >
                  {doc.shortLabel}
                </text>
              </g>
            );
          })}

          {/* Active Query Pin */}
          <g className={txClass}>
            <circle cx={scenario.qx} cy={scenario.qy} r="10" fill={accentColor} stroke="var(--surface)" strokeWidth="2.5" />
            <text x={scenario.qx} y={scenario.qy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--surface)" fontFamily="var(--font-mono)">
              Q
            </text>
          </g>

          {/* Right Panel: Ranked Cosine Inspector */}
          <rect x="456" y="14" width="208" height="252" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="470" y="36" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            Top-3 Cosine Matches
          </text>
          <line x1="470" y1="45" x2="650" y2="45" stroke="var(--hair)" />

          {scenario.matches.map((m, idx) => {
            const doc = EMBED_DOCS.find((d) => d.id === m.docId);
            if (!doc) return null;
            const cardY = 54 + idx * 56;
            const barW = Math.max(8, Math.round(m.cosine * 164));
            const isGood = m.cosine >= 0.8;
            const isTargetBlindspot = scenario.isBlindspot && doc.id === "d5";

            return (
              <g key={`rank-${m.docId}`}>
                <rect
                  x="468"
                  y={cardY}
                  width="184"
                  height="48"
                  rx="8"
                  fill={isTargetBlindspot ? "var(--danger-soft)" : isGood ? "var(--brand-soft)" : "var(--surface-2)"}
                  stroke={isTargetBlindspot ? "var(--danger)" : isGood ? "var(--brand)" : "var(--hair)"}
                  className={txClass}
                />
                <text
                  x="478"
                  y={cardY + 18}
                  fontSize="11"
                  fontWeight="700"
                  fill={isTargetBlindspot ? "var(--danger)" : "var(--fg)"}
                  fontFamily={doc.lang === "TH" ? "var(--font-sans)" : "var(--font-mono)"}
                >
                  #{idx + 1} {doc.shortLabel}
                </text>
                <text
                  x="644"
                  y={cardY + 18}
                  textAnchor="end"
                  fontSize="11"
                  fontWeight="700"
                  fill={isGood ? "var(--brand-ink)" : "var(--warning)"}
                  fontFamily="var(--font-mono)"
                >
                  {m.cosine.toFixed(2)}
                </text>
                <rect x="478" y={cardY + 28} width="164" height="8" rx="4" fill="var(--surface)" stroke="var(--hair)" />
                <rect
                  x="478"
                  y={cardY + 28}
                  width={barW}
                  height="8"
                  rx="4"
                  fill={isTargetBlindspot ? "var(--danger)" : isGood ? "var(--brand)" : "var(--warning)"}
                  className={txClass}
                />
              </g>
            );
          })}

          {/* Bottom Verdict Pill */}
          <rect
            x="468"
            y="226"
            width="184"
            height="28"
            rx="8"
            fill={scenario.isBlindspot ? "var(--danger-soft)" : "var(--success-soft)"}
            stroke={scenario.isBlindspot ? "var(--danger)" : "var(--success)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <text
            x="560"
            y="244"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={scenario.isBlindspot ? "var(--danger)" : "var(--success)"}
            fontFamily="var(--font-sans)"
          >
            {scenario.verdict}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {scenario.caption}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 5. EmbeddingModelTradeoffVisual (embedding-model-tradeoff)                 */
/* ========================================================================== */

type EmbedModelId = "e5-small" | "bge-m3" | "hosted-api";

interface EmbedModelSpec {
  id: EmbedModelId;
  btnLabel: string;
  cardTitle: string;
  dimBadge: string;
  deployTag: string;
  thaiQualityPct: number;
  thaiQualityText: string;
  ramPct: number;
  ramText: string;
  contextPct: number;
  contextText: string;
  costPct: number;
  costText: string;
  verdict: string;
  caption: string;
}

const EMBED_MODELS: readonly EmbedModelSpec[] = [
  {
    id: "e5-small",
    btnLabel: "Local 384-d (e5-small)",
    cardTitle: "e5-small (Local)",
    dimBadge: "384-d",
    deployTag: "CPU / Edge · เล็กสุด",
    thaiQualityPct: 74,
    thaiQualityText: "74 / 100 (พอใช้)",
    ramPct: 25,
    ramText: "~1.5 GB (เบาที่สุด)",
    contextPct: 14,
    contextText: "512 tokens (สั้น)",
    costPct: 12,
    costText: "฿0 API (รันบน CPU ได้)",
    verdict: "เหมาะกับ: เครื่อง RAM จำกัด · งบประหยัด · ข้อมูลลับในเครื่อง",
    caption:
      "Local 384-d (e5-small): ใช้ RAM เพียง ~1.5 GB ต่อ 1 ล้านชิ้น (chunks) และไม่มีค่า API แต่ Context สั้นแค่ 512 tokens และคุณภาพไทยปนอังกฤษยังเป็นรองรุ่นใหญ่",
  },
  {
    id: "bge-m3",
    btnLabel: "Multilingual 1024-d (BGE-M3)",
    cardTitle: "BGE-M3 (Multilingual)",
    dimBadge: "1024-d",
    deployTag: "Self-Host GPU · Hybrid",
    thaiQualityPct: 93,
    thaiQualityText: "93 / 100 (ดีเยี่ยม TH+EN)",
    ramPct: 67,
    ramText: "~4.1 GB (ปานกลาง)",
    contextPct: 100,
    contextText: "8,192 tokens (ยาวมาก)",
    costPct: 36,
    costText: "฿0 API (ค่า GPU คงที่)",
    verdict: "เหมาะกับ: Sweet Spot งาน RAG ภาษาไทย + Hybrid Dense/Sparse",
    caption:
      "Multilingual 1024-d (BGE-M3): จุดสมดุลยอดนิยมสำหรับงานไทยปนอังกฤษ (Code-Switch 93/100) รองรับ Context ยาว 8,192 tokens และสร้างทั้ง Dense + Sparse เวกเตอร์ได้ในตัวเดียว",
  },
  {
    id: "hosted-api",
    btnLabel: "Hosted 1536-d API",
    cardTitle: "Hosted 1536-d API",
    dimBadge: "1536-d",
    deployTag: "Cloud API · Zero Ops",
    thaiQualityPct: 88,
    thaiQualityText: "88 / 100 (ดีมาก)",
    ramPct: 100,
    ramText: "~6.1 GB (หนัก Vector DB)",
    contextPct: 99,
    contextText: "8,191 tokens (ยาวมาก)",
    costPct: 82,
    costText: "Pay-per-token (คิดตามไทย×2)",
    verdict: "เหมาะกับ: ขึ้น Production ไว · ไม่ต้องดูแล GPU · ปริมาณกลาง",
    caption:
      "Hosted 1536-d API: เริ่มใช้งานได้ทันทีโดยไม่ต้องดูแลเซิร์ฟเวอร์ GPU แต่เวกเตอร์ขนาด 1536 มิติกิน RAM ใน Vector DB สูงสุด (~6.1 GB/1M chunks) และค่า API จะเพิ่มตามอัตราขยาย BPE ภาษาไทย",
  },
];

export function EmbeddingModelTradeoffVisual({ reduced = false }: VisualProps) {
  const [modelId, setModelId] = useState<EmbedModelId>("bge-m3");
  const activeIndex = EMBED_MODELS.findIndex((m) => m.id === modelId);
  const model = EMBED_MODELS[activeIndex >= 0 ? activeIndex : 1];
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const cardCentersY = [52, 140, 228];
  const activeY = cardCentersY[activeIndex >= 0 ? activeIndex : 1];

  const metricBars = [
    {
      label: "Thai Code-Switch Quality",
      valueText: model.thaiQualityText,
      pct: model.thaiQualityPct,
      fill: model.thaiQualityPct >= 90 ? "var(--success)" : model.thaiQualityPct >= 85 ? "var(--brand)" : "var(--warning)",
      y: 66,
    },
    {
      label: "RAM / 1M Chunks (FP32)",
      valueText: model.ramText,
      pct: model.ramPct,
      fill: model.ramPct <= 35 ? "var(--success)" : model.ramPct <= 70 ? "var(--cyan)" : "var(--warning)",
      y: 106,
    },
    {
      label: "Context Window",
      valueText: model.contextText,
      pct: model.contextPct,
      fill: model.contextPct >= 80 ? "var(--brand)" : "var(--warning)",
      y: 146,
    },
    {
      label: "Cost (API / Infra)",
      valueText: model.costText,
      pct: model.costPct,
      fill: model.costPct <= 25 ? "var(--success)" : model.costPct <= 50 ? "var(--cyan)" : "var(--danger)",
      y: 186,
    },
  ];

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกโมเดล Embedding เพื่อเปรียบเทียบ Trade-off" className="flex flex-wrap gap-2">
        {EMBED_MODELS.map((m) => {
          const active = m.id === modelId;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setModelId(m.id)}
            >
              {m.btnLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพเปรียบเทียบ Trade-off ระหว่าง Local 384-d, Multilingual 1024-d BGE-M3 และ Hosted 1536-d API"
        >
          {/* Left Column: 3 Clickable Model Selector Cards */}
          {EMBED_MODELS.map((m, idx) => {
            const y = 14 + idx * 88;
            const isActive = m.id === modelId;
            return (
              <g
                key={m.id}
                role="button"
                tabIndex={0}
                aria-label={`เลือกโมเดล ${m.btnLabel}`}
                aria-pressed={isActive}
                onClick={() => setModelId(m.id)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setModelId(m.id))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x="16"
                  y={y}
                  width="210"
                  height="76"
                  rx="12"
                  fill={isActive ? "var(--brand-soft)" : "var(--surface)"}
                  stroke={isActive ? "var(--brand)" : "var(--line)"}
                  strokeWidth={isActive ? "2" : "1.25"}
                  className={txClass}
                />
                <text
                  x="28"
                  y={y + 28}
                  fontSize="13"
                  fontWeight="700"
                  fill={isActive ? "var(--brand-ink)" : "var(--fg)"}
                  fontFamily="var(--font-mono)"
                >
                  {m.cardTitle}
                </text>
                <rect
                  x="28"
                  y={y + 40}
                  width="54"
                  height="22"
                  rx="6"
                  fill={isActive ? "var(--surface)" : "var(--surface-2)"}
                  stroke={isActive ? "var(--brand)" : "var(--hair)"}
                />
                <text
                  x="55"
                  y={y + 55}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={isActive ? "var(--brand-ink)" : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {m.dimBadge}
                </text>
                <text x="90" y={y + 55} fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                  {m.deployTag}
                </text>
              </g>
            );
          })}

          {/* Animated Flow Connector from Selected Model Card to Dashboard */}
          <path
            d={`M 226 ${activeY} C 246 ${activeY}, 244 140, 264 140`}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.5"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
          />
          <circle cx="264" cy="140" r="4" fill="var(--brand)" className={txClass} />

          {/* Right Column: Animated Trade-off Metrics Card */}
          <rect x="266" y="14" width="398" height="252" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" className={txClass} />

          <text x="282" y="38" fontSize="13" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            {model.btnLabel}
          </text>
          <text x="648" y="38" textAnchor="end" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
            {model.dimBadge} vector
          </text>
          <line x1="282" y1="48" x2="648" y2="48" stroke="var(--hair)" />

          {/* 4 Animated Trade-off Bars */}
          {metricBars.map((bar) => {
            const fillW = Math.max(10, Math.round((bar.pct / 100) * 366));
            return (
              <g key={bar.label}>
                <text x="282" y={bar.y} fontSize="11" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
                  {bar.label}
                </text>
                <text x="648" y={bar.y} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
                  {bar.valueText}
                </text>
                <rect x="282" y={bar.y + 7} width="366" height="12" rx="6" fill="var(--surface-2)" stroke="var(--hair)" />
                <rect x="282" y={bar.y + 7} width={fillW} height="12" rx="6" fill={bar.fill} className={txClass} />
              </g>
            );
          })}

          {/* Bottom Verdict Strip */}
          <rect x="282" y="220" width="366" height="32" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="465" y="240" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
            {model.verdict}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {model.caption}
      </p>
    </div>
  );
}
