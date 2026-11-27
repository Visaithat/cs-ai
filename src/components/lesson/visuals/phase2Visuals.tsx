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
/* 1. PolarsLazyVisual (D033 — polars-lazy)                                   */
/* ========================================================================== */

type PolarsMode = "eager" | "lazy";

export function PolarsLazyVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<PolarsMode>("lazy");
  const isLazy = mode === "lazy";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerId = `${uid}-polars-arrow`;

  const steps = isLazy
    ? [
        {
          title: "1. scan_parquet",
          sub: "ยังไม่โหลดข้อมูล",
          meta: "สร้าง Logical Plan",
          rows: 6,
          cols: 5,
          activeRows: 6,
          activeCols: 5,
          tint: "var(--brand-soft)",
          stroke: "var(--brand)",
          textColor: "var(--brand-ink)",
        },
        {
          title: "2. Pushdown",
          sub: "ยุบแผนล่วงหน้า",
          meta: "filter + select",
          rows: 6,
          cols: 5,
          activeRows: 2,
          activeCols: 2,
          tint: "var(--cyan-soft)",
          stroke: "var(--cyan)",
          textColor: "var(--cyan)",
        },
        {
          title: "3. Stream Read",
          sub: "อ่านเฉพาะที่ใช้",
          meta: "120k rows × 2 cols",
          rows: 6,
          cols: 5,
          activeRows: 2,
          activeCols: 2,
          tint: "var(--success-soft)",
          stroke: "var(--success)",
          textColor: "var(--success)",
        },
        {
          title: "4. .collect()",
          sub: "ผลลัพธ์พร้อมใช้",
          meta: "RAM Peak ~18 MB",
          rows: 6,
          cols: 5,
          activeRows: 2,
          activeCols: 2,
          tint: "var(--success-soft)",
          stroke: "var(--success)",
          textColor: "var(--success)",
        },
      ]
    : [
        {
          title: "1. read_parquet",
          sub: "อ่านทั้งหมดทันที",
          meta: "1M rows × 20 cols",
          rows: 6,
          cols: 5,
          activeRows: 6,
          activeCols: 5,
          tint: "var(--warning-soft)",
          stroke: "var(--warning)",
          textColor: "var(--warning)",
        },
        {
          title: "2. .filter()",
          sub: "คัดแถวทีหลัง",
          meta: "120k rows × 20 cols",
          rows: 6,
          cols: 5,
          activeRows: 2,
          activeCols: 5,
          tint: "var(--warning-soft)",
          stroke: "var(--warning)",
          textColor: "var(--warning)",
        },
        {
          title: "3. .select()",
          sub: "ตัดคอลัมน์ทีหลัง",
          meta: "120k rows × 2 cols",
          rows: 6,
          cols: 5,
          activeRows: 2,
          activeCols: 2,
          tint: "var(--surface)",
          stroke: "var(--line)",
          textColor: "var(--fg)",
        },
        {
          title: "4. DataFrame",
          sub: "กินแรมสูงตอนอ่าน",
          meta: "RAM Peak ~420 MB",
          rows: 6,
          cols: 5,
          activeRows: 2,
          activeCols: 2,
          tint: "var(--danger-soft)",
          stroke: "var(--danger)",
          textColor: "var(--danger)",
        },
      ];

  const captionText = isLazy
    ? "Lazy Mode: Polars นำเงื่อนไข filter (Predicate Pushdown) และ select (Projection Pushdown) ดันลงไปทำตั้งแต่ตอนอ่านไฟล์ จึงโหลดเข้า RAM เฉพาะ 2 คอลัมน์และแถวที่ตรงเงื่อนไขก่อน .collect()"
    : "Eager Mode: โหลดทั้ง 1,000,000 แถว × 20 คอลัมน์เข้าหน่วยความจำทันที (~420 MB) แล้วค่อยมาทิ้งคอลัมน์และแถวที่ไม่ใช้ทีหลัง";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับโหมด Polars Eager กับ Lazy" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!isLazy}
          className={!isLazy ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isLazy ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("eager")}
        >
          Eager Mode (อ่านทั้งหมดก่อน)
        </button>
        <button
          type="button"
          aria-pressed={isLazy}
          className={isLazy ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isLazy ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("lazy")}
        >
          Lazy Mode (Optimized Plan)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 270" className="block h-auto w-full" role="img" aria-label="แผนภาพเปรียบเทียบ Polars Eager Mode และ Lazy Mode">
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isLazy ? "var(--brand)" : "var(--warning)"} />
            </marker>
          </defs>

          {/* Connecting arrows */}
          {[0, 1, 2].map((idx) => {
            const x1 = 16 + idx * 168 + 144;
            const x2 = 16 + (idx + 1) * 168 - 4;
            return (
              <line
                key={idx}
                x1={x1}
                y1="96"
                x2={x2}
                y2="96"
                stroke={isLazy ? "var(--brand)" : "var(--warning)"}
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerId})`}
              />
            );
          })}

          {/* 4 Step Cards with Data Matrix Miniatures */}
          {steps.map((st, idx) => {
            const x = 16 + idx * 168;
            return (
              <g key={st.title}>
                <rect x={x} y="18" width="144" height="168" rx="12" fill="var(--surface)" stroke={st.stroke} strokeWidth="1.5" className={txClass} />
                <rect x={x + 8} y="26" width="128" height="24" rx="6" fill={st.tint} className={txClass} />
                <text x={x + 72} y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill={st.textColor} fontFamily="var(--font-mono)">
                  {st.title}
                </text>
                <text x={x + 72} y="66" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                  {st.sub}
                </text>

                {/* Miniature Data Grid (6 rows x 5 cols) */}
                <g transform={`translate(${x + 22}, 78)`}>
                  {Array.from({ length: st.rows }).map((_, r) =>
                    Array.from({ length: st.cols }).map((__, c) => {
                      const activeCell = r < st.activeRows && c < st.activeCols;
                      const isPlanOnly = isLazy && idx === 0;
                      return (
                        <rect
                          key={`${r}-${c}`}
                          x={c * 20}
                          y={r * 12}
                          width="16"
                          height="8"
                          rx="2"
                          fill={
                            isPlanOnly
                              ? "var(--brand-soft)"
                              : activeCell
                                ? isLazy
                                  ? "var(--success)"
                                  : "var(--warning)"
                                : "var(--surface-2)"
                          }
                          stroke={isPlanOnly ? "var(--brand)" : activeCell ? "none" : "var(--hair)"}
                          strokeDasharray={isPlanOnly ? "2 2" : undefined}
                          className={txClass}
                        />
                      );
                    }),
                  )}
                </g>

                <text x={x + 72} y="172" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {st.meta}
                </text>
              </g>
            );
          })}

          {/* Bottom RAM & Optimization Comparison Strip */}
          <rect x="16" y="200" width="648" height="56" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="32" y="223" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            การใช้หน่วยความจำสูงสุด (Peak RAM)
          </text>
          <text
            x="32"
            y="243"
            fontSize="12"
            fill={isLazy ? "var(--success)" : "var(--danger)"}
            fontWeight="600"
            fontFamily="var(--font-mono)"
          >
            {isLazy ? "Predicate + Projection Pushdown → ~18 MB (ประหยัด 23×)" : "Full Table Scan → ~420 MB (อ่านข้อมูลส่วนเกิน 98%)"}
          </text>

          {/* Animated RAM Bar */}
          <rect x="438" y="218" width="210" height="18" rx="9" fill="var(--surface-2)" stroke="var(--hair)" />
          <rect
            x="438"
            y="218"
            width={isLazy ? 18 : 196}
            height="18"
            rx="9"
            fill={isLazy ? "var(--success)" : "var(--danger)"}
            className={txClass}
          />
          <text x="543" y="249" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
            {isLazy ? "4% of Eager RAM" : "100% Baseline RAM"}
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
/* 2. CosineVectorsVisual (D038 — cosine-vectors)                             */
/* ========================================================================== */

export function CosineVectorsVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [angleDeg, setAngleDeg] = useState(25);
  const [lengthB, setLengthB] = useState(1.5);

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const rad = (angleDeg * Math.PI) / 180;
  const cosine = Math.cos(rad);
  const bxUnit = Math.cos(rad) * lengthB;
  const byUnit = Math.sin(rad) * lengthB;
  const euclidean = Math.hypot(1 - bxUnit, 0 - byUnit);

  // SVG Plane geometry
  const ox = 186;
  const oy = 210;
  const scale = 82;

  const ax = ox + scale;
  const ay = oy;
  const bx = ox + bxUnit * scale;
  const by = oy - byUnit * scale;

  // Angle arc path (radius 34)
  const arcR = 34;
  const arcEndX = ox + Math.cos(rad) * arcR;
  const arcEndY = oy - Math.sin(rad) * arcR;
  const arcPath =
    angleDeg <= 0
      ? ""
      : `M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 0 0 ${arcEndX.toFixed(1)} ${arcEndY.toFixed(1)}`;
  const arcFillPath =
    angleDeg <= 0
      ? ""
      : `M ${ox} ${oy} L ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 0 0 ${arcEndX.toFixed(1)} ${arcEndY.toFixed(1)} Z`;

  const cosineColor =
    cosine >= 0.7 ? "var(--success)" : cosine >= 0.2 ? "var(--cyan)" : cosine >= -0.2 ? "var(--warning)" : "var(--danger)";
  const cosineSoft =
    cosine >= 0.7 ? "var(--success-soft)" : cosine >= 0.2 ? "var(--cyan-soft)" : cosine >= -0.2 ? "var(--warning-soft)" : "var(--danger-soft)";

  const cosineBarW = Math.max(4, Math.round(((cosine + 1) / 2) * 236));
  const eucBarW = Math.min(236, Math.max(4, Math.round((euclidean / 2.8) * 236)));

  const markerA = `${uid}-vec-a`;
  const markerB = `${uid}-vec-b`;

  const insightText =
    angleDeg <= 25 && Math.abs(lengthB - 1) >= 0.35
      ? "ทิศทางใกล้กันมาก! Cosine ยังสูง แม้ความยาวต่างกันจน Euclidean พุ่ง"
      : angleDeg >= 80 && angleDeg <= 100
        ? "ตั้งฉาก (≈90°): Cosine ใกล้ 0 (ไม่เกี่ยวข้องกัน)"
        : angleDeg >= 150
          ? "ทิศตรงข้าม: Cosine ติดลบเข้าใกล้ -1.00"
          : "ลองปรับ Length โดยคงมุมเดิม — สังเกตว่า Cosine ไม่เปลี่ยนเลย!";

  const captionText = `มุม θ = ${angleDeg}° และความยาว Vector B = ${lengthB.toFixed(2)}× → Cosine Similarity = ${cosine.toFixed(2)} (วัดแค่มุม ไม่สนความยาว) ส่วน Euclidean Distance = ${euclidean.toFixed(2)} (ขยายตามความยาวที่ต่างกัน)`;

  return (
    <div className="space-y-3">
      {/* Controls: Presets + 2 Sliders */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="ค่าตัวอย่างของเวกเตอร์">
        <button
          type="button"
          className="btn btn-sm btn-quiet"
          onClick={() => {
            setAngleDeg(12);
            setLengthB(1.7);
          }}
        >
          ทิศเดียวกัน ยาวต่างกัน
        </button>
        <button
          type="button"
          className="btn btn-sm btn-quiet"
          onClick={() => {
            setAngleDeg(90);
            setLengthB(1.0);
          }}
        >
          ตั้งฉาก (90°)
        </button>
        <button
          type="button"
          className="btn btn-sm btn-quiet"
          onClick={() => {
            setAngleDeg(165);
            setLengthB(1.0);
          }}
        >
          ตรงข้าม (165°)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="flex items-center justify-between font-medium">
            <span>มุมของ Vector B (Angle)</span>
            <span className="mono-label text-brand-ink tabular-nums">{angleDeg}°</span>
          </span>
          <input
            type="range"
            min={0}
            max={180}
            step={1}
            value={angleDeg}
            aria-label="มุมของ Vector B ตั้งแต่ 0 ถึง 180 องศา"
            onChange={(e) => setAngleDeg(Number(e.target.value))}
            className="h-6 w-full cursor-pointer accent-[color:var(--brand)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="flex items-center justify-between font-medium">
            <span>ความยาว Vector B (Length)</span>
            <span className="mono-label text-cyan-ink tabular-nums">{lengthB.toFixed(2)}×</span>
          </span>
          <input
            type="range"
            min={0.4}
            max={1.8}
            step={0.05}
            value={lengthB}
            aria-label="ความยาวของ Vector B ตั้งแต่ 0.4 ถึง 1.8 เท่า"
            onChange={(e) => setLengthB(Number(e.target.value))}
            className="h-6 w-full cursor-pointer accent-[color:var(--cyan)]"
          />
        </label>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 270" className="block h-auto w-full" role="img" aria-label="ระนาบ 2 มิติแสดง Cosine Similarity และ Euclidean Distance">
          <defs>
            <marker id={markerA} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={markerB} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
          </defs>

          {/* Left: 2D Vector Plane */}
          <rect x="14" y="16" width="346" height="238" rx="12" fill="var(--surface)" stroke="var(--line)" />

          {/* Axes */}
          <line x1="28" y1={oy} x2="346" y2={oy} stroke="var(--hair)" strokeWidth="1.5" />
          <line x1={ox} y1="32" x2={ox} y2="240" stroke="var(--hair)" strokeWidth="1.5" />

          {/* Unit Circle Semicircle (r=1.0) */}
          <path
            d={`M ${ox - scale} ${oy} A ${scale} ${scale} 0 0 1 ${ox + scale} ${oy}`}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />
          <text x={ox - scale + 4} y={oy + 16} fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
            -1
          </text>
          <text x={ox + scale - 6} y={oy + 16} fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
            1.0
          </text>
          <text x={ox + 6} y="44" fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
            y
          </text>

          {/* Angle wedge */}
          {angleDeg > 0 && (
            <>
              <path d={arcFillPath} fill="var(--brand-soft)" opacity="0.7" />
              <path d={arcPath} fill="none" stroke="var(--brand)" strokeWidth="1.75" />
            </>
          )}

          {/* Euclidean distance dashed segment */}
          <line
            x1={ax}
            y1={ay}
            x2={bx}
            y2={by}
            stroke="var(--warning)"
            strokeWidth="2"
            strokeDasharray={reduced ? "4 4" : "6 6"}
            className={flowClass}
          />

          {/* Vector A (fixed 1.0, 0 deg) */}
          <line x1={ox} y1={oy} x2={ax - 3} y2={ay} stroke="var(--brand)" strokeWidth="3" markerEnd={`url(#${markerA})`} />
          <text x={ax + 8} y={ay + 4} fontSize="13" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            A (1.0)
          </text>

          {/* Vector B (interactive) */}
          <line x1={ox} y1={oy} x2={bx} y2={by} stroke="var(--cyan)" strokeWidth="3" markerEnd={`url(#${markerB})`} />
          <circle cx={ox} cy={oy} r="4" fill="var(--fg)" />
          <text
            x={Math.min(316, Math.max(26, bx + (angleDeg > 90 ? -18 : 10)))}
            y={Math.max(36, by - 10)}
            fontSize="13"
            fontWeight="700"
            fill="var(--cyan)"
            fontFamily="var(--font-mono)"
          >
            B ({lengthB.toFixed(1)}×)
          </text>

          {/* Angle pill */}
          <text x="26" y="38" fontSize="12" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            θ = {angleDeg}°
          </text>

          {/* Right: Live Metrics Panel */}
          <g transform="translate(376, 16)">
            <rect x="0" y="0" width="290" height="238" rx="12" fill="var(--surface)" stroke="var(--line)" />

            {/* Cosine Card */}
            <rect x="14" y="14" width="262" height="82" rx="10" fill={cosineSoft} stroke={cosineColor} strokeWidth="1.25" className={txClass} />
            <text x="26" y="36" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
              Cosine Similarity (cos θ)
            </text>
            <text x="264" y="38" textAnchor="end" fontSize="14" fontWeight="700" fill={cosineColor} fontFamily="var(--font-mono)">
              {cosine >= 0 ? `+${cosine.toFixed(2)}` : cosine.toFixed(2)}
            </text>
            <rect x="26" y="50" width="236" height="10" rx="5" fill="var(--surface)" stroke="var(--hair)" />
            <rect x="26" y="50" width={cosineBarW} height="10" rx="5" fill={cosineColor} className={txClass} />
            <text x="26" y="80" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
              คงที่เมื่อเปลี่ยนความยาว B (สนแค่มุม θ)
            </text>

            {/* Euclidean Card */}
            <rect x="14" y="106" width="262" height="82" rx="10" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1.25" />
            <text x="26" y="128" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
              Euclidean Distance (เส้นประ)
            </text>
            <text x="264" y="130" textAnchor="end" fontSize="14" fontWeight="700" fill="var(--warning)" fontFamily="var(--font-mono)">
              {euclidean.toFixed(2)}
            </text>
            <rect x="26" y="142" width="236" height="10" rx="5" fill="var(--surface)" stroke="var(--hair)" />
            <rect x="26" y="142" width={eucBarW} height="10" rx="5" fill="var(--warning)" className={txClass} />
            <text x="26" y="172" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
              เพิ่มขึ้นทันทีเมื่อขนาดเวกเตอร์ต่างกัน
            </text>

            {/* Dynamic takeaway */}
            <text x="145" y="216" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-sans)">
              {insightText.length > 42 ? `${insightText.slice(0, 41)}…` : insightText}
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
/* 3. ThaiTokenizeVisual (D049 — thai-tokenize)                               */
/* ========================================================================== */

type TokenizeMode = "whitespace" | "newmm";

interface ThaiTokenTile {
  text: string;
  x: number;
  w: number;
  tfidf: number;
  highlight: boolean;
  role: string;
}

const NEWMM_TOKENS: ThaiTokenTile[] = [
  { text: "ลูกค้า", x: 24, w: 122, tfidf: 0.18, highlight: false, role: "คำทั่วไป" },
  { text: "ขอ", x: 162, w: 94, tfidf: 0.11, highlight: false, role: "กริยาทั่วไป" },
  { text: "ใบกำกับภาษี", x: 272, w: 204, tfidf: 0.56, highlight: true, role: "คำสำคัญหลัก" },
  { text: "ซ้ำซ้อน", x: 492, w: 164, tfidf: 0.49, highlight: true, role: "เจตนาปัญหา" },
];

export function ThaiTokenizeVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<TokenizeMode>("newmm");
  const isNewmm = mode === "newmm";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerId = `${uid}-tok-arrow`;

  const captionText = isNewmm
    ? 'PyThaiNLP (newmm): ตัดประโยคไทยที่ไม่มีเว้นวรรคออกเป็น 4 คำที่มีความหมาย ทำให้คำเฉพาะอย่าง "ใบกำกับภาษี" (0.56) และ "ซ้ำซ้อน" (0.49) ได้คะแนน TF-IDF สูงและค้นหาเจอแม่นยำ'
    : 'Whitespace Split: ภาษาไทยไม่เว้นวรรคระหว่างคำ การใช้ .split(" ") จึงได้ก้อนเดียวทั้งประโยค ทำให้คำค้นหา "ใบกำกับภาษี" ไม่ตรงกับคำใดในดัชนี (TF-IDF match = 0.00)';

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับวิธีตัดคำภาษาไทย" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!isNewmm}
          className={!isNewmm ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isNewmm ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("whitespace")}
        >
          Whitespace Split (พัง)
        </button>
        <button
          type="button"
          aria-pressed={isNewmm}
          className={isNewmm ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isNewmm ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("newmm")}
        >
          PyThaiNLP newmm (ถูกต้อง)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 270" className="block h-auto w-full" role="img" aria-label="แผนภาพการตัดคำภาษาไทยและน้ำหนัก TF-IDF">
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isNewmm ? "var(--brand)" : "var(--danger)"} />
            </marker>
          </defs>

          {/* Top Input Sentence Box */}
          <rect x="24" y="14" width="632" height="44" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="40" y="41" fontSize="12" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
            INPUT:
          </text>
          <text x="100" y="41" fontSize="14" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            &quot;ลูกค้าขอใบกำกับภาษีซ้ำซ้อน&quot;
          </text>
          <text x="640" y="41" textAnchor="end" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
            (ไม่มีช่องว่าง)
          </text>

          {/* Animated flow arrow down */}
          <line
            x1="340"
            y1="58"
            x2="340"
            y2="86"
            stroke={isNewmm ? "var(--brand)" : "var(--danger)"}
            strokeWidth="2.5"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${markerId})`}
          />
          <rect
            x="356"
            y="62"
            width="234"
            height="22"
            rx="6"
            fill={isNewmm ? "var(--brand-soft)" : "var(--danger-soft)"}
          />
          <text
            x="473"
            y="77"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill={isNewmm ? "var(--brand-ink)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {isNewmm ? 'word_tokenize(text, "newmm")' : 'text.split(" ")  # 0 spaces!'}
          </text>

          {/* Token Tiles + TF-IDF Weight Bars */}
          {isNewmm ? (
            <>
              {NEWMM_TOKENS.map((tok) => {
                const barMaxW = tok.w - 24;
                const barFillW = Math.round(barMaxW * (tok.tfidf / 0.6));
                return (
                  <g key={tok.text}>
                    {/* Token tile */}
                    <rect
                      x={tok.x}
                      y="92"
                      width={tok.w}
                      height="46"
                      rx="10"
                      fill={tok.highlight ? "var(--brand-soft)" : "var(--surface)"}
                      stroke={tok.highlight ? "var(--brand)" : "var(--line)"}
                      strokeWidth={tok.highlight ? "2" : "1.5"}
                      className={txClass}
                    />
                    <text
                      x={tok.x + tok.w / 2}
                      y="120"
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="700"
                      fill={tok.highlight ? "var(--brand-ink)" : "var(--fg)"}
                      fontFamily="var(--font-sans)"
                    >
                      {tok.text}
                    </text>

                    {/* TF-IDF card underneath */}
                    <rect
                      x={tok.x}
                      y="152"
                      width={tok.w}
                      height="98"
                      rx="10"
                      fill="var(--surface)"
                      stroke={tok.highlight ? "var(--success)" : "var(--hair)"}
                      strokeWidth="1.25"
                    />
                    <text
                      x={tok.x + tok.w / 2}
                      y="174"
                      textAnchor="middle"
                      fontSize="12"
                      fill="var(--muted)"
                      fontFamily="var(--font-mono)"
                    >
                      TF-IDF
                    </text>
                    <text
                      x={tok.x + tok.w / 2}
                      y="196"
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="700"
                      fill={tok.highlight ? "var(--success)" : "var(--fg)"}
                      fontFamily="var(--font-mono)"
                    >
                      {tok.tfidf.toFixed(2)}
                    </text>
                    <rect x={tok.x + 12} y="208" width={barMaxW} height="10" rx="5" fill="var(--surface-2)" />
                    <rect
                      x={tok.x + 12}
                      y="208"
                      width={barFillW}
                      height="10"
                      rx="5"
                      fill={tok.highlight ? "var(--success)" : "var(--cyan)"}
                      className={txClass}
                    />
                    <text
                      x={tok.x + tok.w / 2}
                      y="238"
                      textAnchor="middle"
                      fontSize="12"
                      fill={tok.highlight ? "var(--success)" : "var(--muted)"}
                      fontFamily="var(--font-sans)"
                    >
                      {tok.role}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            <g>
              {/* Single broken token tile */}
              <rect
                x="54"
                y="92"
                width="572"
                height="46"
                rx="10"
                fill="var(--danger-soft)"
                stroke="var(--danger)"
                strokeWidth="2"
                className={txClass}
              />
              <text x="340" y="120" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                &quot;ลูกค้าขอใบกำกับภาษีซ้ำซ้อน&quot;  (1 ก้อนติดกันทั้งหมด)
              </text>

              {/* Broken TF-IDF panel */}
              <rect x="54" y="152" width="572" height="98" rx="10" fill="var(--surface)" stroke="var(--danger)" strokeWidth="1.25" />
              <text x="74" y="178" fontSize="13" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                Query Match &quot;ใบกำกับภาษี&quot; → TF-IDF = 0.00 (ไม่พบคำนี้ในดัชนี!)
              </text>
              <rect x="74" y="192" width="532" height="12" rx="6" fill="var(--surface-2)" />
              <rect x="74" y="192" width="8" height="12" rx="6" fill="var(--danger)" className={txClass} />
              <text x="74" y="230" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                เพราะระบบมองทั้งประโยคเป็นคำเดียวที่ยาวผิดปกติ (Out-of-Vocabulary) จึงจับคู่กับคำค้นหาไม่ได้เลย
              </text>
            </g>
          )}
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}
