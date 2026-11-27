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
/* 1. SelfAttentionVisual (D065 — self-attention)                             */
/* ========================================================================== */

const ATTN_TOKENS = ["ลูกค้า", "แจ้งว่า", "ใบเสร็จ", "มัน", "ผิดยอด"] as const;

const ATTN_WEIGHTS: readonly (readonly number[])[] = [
  [0.42, 0.28, 0.16, 0.06, 0.08], // ลูกค้า
  [0.34, 0.24, 0.18, 0.08, 0.16], // แจ้งว่า
  [0.18, 0.1, 0.4, 0.12, 0.2], // ใบเสร็จ
  [0.06, 0.05, 0.68, 0.09, 0.12], // มัน -> strongly attends to ใบเสร็จ!
  [0.08, 0.12, 0.44, 0.18, 0.18], // ผิดยอด
];

const ATTN_NOTES: readonly string[] = [
  'คำว่า "ลูกค้า" ให้น้ำหนักกับตัวเองและกริยา "แจ้งว่า" เพื่อระบุผู้กระทำในประโยค',
  'คำว่า "แจ้งว่า" เชื่อมโยงกลับไปหาประธาน "ลูกค้า" และเนื้อหาหลัก "ใบเสร็จ"',
  'คำว่า "ใบเสร็จ" เป็นคำนามหลักที่เชื่อมโยงกับสถานะ "ผิดยอด" และผู้แจ้ง "ลูกค้า"',
  'สรรพนาม "มัน" ให้น้ำหนักความสนใจสูงสุดถึง 0.68 ไปที่ "ใบเสร็จ" ทำให้โมเดลรู้ทันทีว่า "มัน" หมายถึงใบเสร็จ ไม่ใช่ลูกค้า!',
  'คำว่า "ผิดยอด" ดึงความหมายจาก "ใบเสร็จ" (0.44) เพื่อสรุปว่าอะไรที่ผิดยอด',
];

export function SelfAttentionVisual({ reduced = false }: VisualProps) {
  const [selected, setSelected] = useState(3); // Default to "มัน"
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const weights = ATTN_WEIGHTS[selected];
  const centers = [80, 210, 340, 470, 600];

  // Find strongest non-self target (or overall max)
  let topTarget = 0;
  let topWeight = -1;
  weights.forEach((w, idx) => {
    if (w > topWeight) {
      topWeight = w;
      topTarget = idx;
    }
  });

  const qx = centers[selected];
  const baseY = 166;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกคำ (Query Token) เพื่อดูน้ำหนัก Self-Attention" className="flex flex-wrap gap-2">
        {ATTN_TOKENS.map((tok, idx) => {
          const active = idx === selected;
          return (
            <button
              key={tok}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setSelected(idx)}
            >
              {tok}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 270" className="block h-auto w-full" role="img" aria-label="แผนภาพเส้นโค้งน้ำหนัก Self-Attention ระหว่างคำในประโยค">
          {/* Header hint */}
          <text x="20" y="26" fontSize="12" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-sans)">
            Query Token ที่เลือก:{" "}
            <tspan fill="var(--brand-ink)" fontWeight="700">
              &quot;{ATTN_TOKENS[selected]}&quot;
            </tspan>
          </text>
          <text x="660" y="26" textAnchor="end" fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
            max weight → {ATTN_TOKENS[topTarget]} ({topWeight.toFixed(2)})
          </text>

          {/* Curved attention arcs */}
          {weights.map((w, idx) => {
            const tx = centers[idx];
            const isTop = idx === topTarget;
            const strokeW = 1.2 + w * 8.5;
            const opacity = 0.25 + w * 0.75;

            if (idx === selected) {
              // Subtle self-attention loop
              const loopPath = `M ${qx - 18} ${baseY} C ${qx - 32} ${baseY - 46}, ${qx + 32} ${baseY - 46}, ${qx + 18} ${baseY}`;
              return (
                <path
                  key={idx}
                  d={loopPath}
                  fill="none"
                  stroke={isTop ? "var(--brand)" : "var(--muted)"}
                  strokeWidth={strokeW}
                  opacity={opacity}
                  className={txClass}
                />
              );
            }

            const dist = Math.abs(tx - qx);
            const midX = (qx + tx) / 2;
            const lift = Math.min(126, 46 + dist * 0.22);
            const ctrlY = baseY - lift;
            const arcD = `M ${qx} ${baseY} Q ${midX} ${ctrlY} ${tx} ${baseY}`;
            // Apex of quadratic Bezier at t=0.5
            const apexY = 0.25 * baseY + 0.5 * ctrlY + 0.25 * baseY;

            return (
              <g key={idx}>
                <path
                  d={arcD}
                  fill="none"
                  stroke={isTop ? "var(--brand)" : "var(--cyan)"}
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                  opacity={opacity}
                  strokeDasharray={isTop && !reduced ? "6 6" : undefined}
                  className={isTop ? flowClass : txClass}
                />
                {isTop ? (
                  <g>
                    <rect x={midX - 24} y={apexY - 14} width="48" height="22" rx="11" fill="var(--brand-soft)" stroke="var(--brand)" />
                    <text
                      x={midX}
                      y={apexY + 1}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill="var(--brand-ink)"
                      fontFamily="var(--font-mono)"
                    >
                      {w.toFixed(2)}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* Token Boxes & Weight Bars */}
          {ATTN_TOKENS.map((tok, idx) => {
            const cx = centers[idx];
            const boxX = cx - 54;
            const isQuery = idx === selected;
            const isTop = idx === topTarget && !isQuery;
            const w = weights[idx];

            const fill = isQuery ? "var(--brand-soft)" : isTop ? "var(--cyan-soft)" : "var(--surface)";
            const stroke = isQuery ? "var(--brand)" : isTop ? "var(--cyan)" : "var(--line)";
            const textColor = isQuery ? "var(--brand-ink)" : isTop ? "var(--cyan)" : "var(--fg)";

            return (
              <g
                key={tok}
                role="button"
                tabIndex={0}
                aria-label={`เลือกคำว่า ${tok}`}
                aria-pressed={isQuery}
                onClick={() => setSelected(idx)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setSelected(idx))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={boxX}
                  y={baseY}
                  width="108"
                  height="40"
                  rx="10"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isQuery || isTop ? "2" : "1.5"}
                  className={txClass}
                />
                <text x={cx} y={baseY + 25} textAnchor="middle" fontSize="14" fontWeight="700" fill={textColor} fontFamily="var(--font-sans)">
                  {tok}
                </text>

                {/* Weight bar underneath */}
                <rect x={boxX + 6} y="218" width="96" height="8" rx="4" fill="var(--surface)" stroke="var(--hair)" />
                <rect
                  x={boxX + 6}
                  y="218"
                  width={Math.max(4, Math.round(96 * w))}
                  height="8"
                  rx="4"
                  fill={idx === topTarget ? "var(--brand)" : "var(--cyan)"}
                  className={txClass}
                />
                <text
                  x={cx}
                  y="244"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight={idx === topTarget ? "700" : "500"}
                  fill={idx === topTarget ? "var(--brand-ink)" : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {w.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {ATTN_NOTES[selected]}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 2. BpeTokensVisual (D066 — bpe-tokens)                                     */
/* ========================================================================== */

type PhraseId = "invoice" | "refund" | "policy";

interface BpePhrase {
  id: PhraseId;
  label: string;
  enText: string;
  enTokens: readonly string[];
  thText: string;
  thTokens: readonly string[];
  caption: string;
}

const BPE_PHRASES: readonly BpePhrase[] = [
  {
    id: "invoice",
    label: "1. ขอใบกำกับภาษี",
    enText: "Request a tax invoice",
    enTokens: ["Request", " a", " tax", " invoice"],
    thText: "ขอใบกำกับภาษี",
    thTokens: ["ขอ", "ใบ", "ก", "ำ", "ก", "ับ", "ภา", "ษ", "ี"],
    caption: 'ประโยค "ขอใบกำกับภาษี" ใช้ 9 BPE tokens เทียบกับภาษาอังกฤษที่ใช้เพียง 4 tokens (แพงกว่า 2.25×) เพราะสระและวรรณยุกต์ไทยมักถูกแตกเป็นชิ้นย่อย',
  },
  {
    id: "refund",
    label: "2. ตรวจสอบสถานะคืนเงิน",
    enText: "Check refund status now",
    enTokens: ["Check", " refund", " status", " now"],
    thText: "ตรวจสอบสถานะคืนเงินตอนนี้",
    thTokens: ["ตรวจ", "สอบ", "สถ", "าน", "ะ", "คืน", "เงิน", "ตอน", "น", "ี้"],
    caption: 'ประโยค "ตรวจสอบสถานะคืนเงินตอนนี้" แตกเป็น 10 BPE tokens เทียบกับ 4 tokens ในภาษาอังกฤษ (2.50×) ทำให้กิน Context Window และค่า API มากกว่าเท่าตัว',
  },
  {
    id: "policy",
    label: "3. ค้นหาเอกสารนโยบาย",
    enText: "Search policy documents",
    enTokens: ["Search", " policy", " documents"],
    thText: "ค้นหาเอกสารนโยบาย",
    thTokens: ["ค้น", "หา", "เอก", "สาร", "น", "โยบาย"],
    caption: 'ประโยค "ค้นหาเอกสารนโยบาย" ใช้ 6 BPE tokens เทียบกับ 3 tokens ในภาษาอังกฤษ (2.00×) — การประเมินงบ LLM สำหรับงานภาษาไทยต้องเผื่อตัวคูณ 2× เสมอ',
  },
];

const CHIP_TONES = [
  { fill: "var(--brand-soft)", stroke: "var(--brand)", text: "var(--brand-ink)" },
  { fill: "var(--cyan-soft)", stroke: "var(--cyan)", text: "var(--cyan)" },
  { fill: "var(--success-soft)", stroke: "var(--success)", text: "var(--success)" },
  { fill: "var(--warning-soft)", stroke: "var(--warning)", text: "var(--warning)" },
] as const;

export function BpeTokensVisual({ reduced = false }: VisualProps) {
  const [phraseId, setPhraseId] = useState<PhraseId>("invoice");
  const phrase = BPE_PHRASES.find((p) => p.id === phraseId) ?? BPE_PHRASES[0];
  const txClass = reduced ? undefined : "transition-all duration-300";

  const enCount = phrase.enTokens.length;
  const thCount = phrase.thTokens.length;
  const ratio = thCount / enCount;

  // Compute balanced chip widths inside x=28..652 (624px total)
  const layoutChips = (tokens: readonly string[], maxChipW: number) => {
    const gap = 8;
    const rawWidths = tokens.map((t) => Math.min(maxChipW, Math.max(46, t.length * 11 + 22)));
    const totalRaw = rawWidths.reduce((acc, v) => acc + v, 0) + gap * (tokens.length - 1);
    const scale = totalRaw > 624 ? (624 - gap * (tokens.length - 1)) / rawWidths.reduce((acc, v) => acc + v, 0) : 1;
    let cursor = 28;
    return tokens.map((text, idx) => {
      const w = Math.floor(rawWidths[idx] * scale);
      const item = { text, x: cursor, w };
      cursor += w + gap;
      return item;
    });
  };

  const enChips = layoutChips(phrase.enTokens, 130);
  const thChips = layoutChips(phrase.thTokens, 90);

  const maxBarTokens = 12;
  const enBarW = Math.round((enCount / maxBarTokens) * 320);
  const thBarW = Math.round((thCount / maxBarTokens) * 320);

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกประโยคเปรียบเทียบ BPE Token" className="flex flex-wrap gap-2">
        {BPE_PHRASES.map((item) => {
          const active = item.id === phraseId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setPhraseId(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 276" className="block h-auto w-full" role="img" aria-label="แผนภาพเปรียบเทียบจำนวน BPE Token ระหว่างภาษาอังกฤษและภาษาไทย">
          {/* English Section */}
          <rect x="16" y="14" width="648" height="78" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="28" y="36" fontSize="12" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
            ENGLISH: &quot;{phrase.enText}&quot;
          </text>
          <text x="650" y="36" textAnchor="end" fontSize="12" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
            {enCount} tokens
          </text>
          {enChips.map((chip, idx) => {
            const tone = CHIP_TONES[idx % CHIP_TONES.length];
            return (
              <g key={`${phrase.id}-en-${idx}`}>
                <rect x={chip.x} y="48" width={chip.w} height="32" rx="8" fill={tone.fill} stroke={tone.stroke} strokeWidth="1.25" className={txClass} />
                <text x={chip.x + chip.w / 2} y="68" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {chip.text.trim()}
                </text>
              </g>
            );
          })}

          {/* Thai Section */}
          <rect x="16" y="102" width="648" height="78" rx="12" fill="var(--surface)" stroke="var(--warning)" strokeWidth="1.25" />
          <text x="28" y="124" fontSize="12" fontWeight="700" fill="var(--warning)" fontFamily="var(--font-sans)">
            ภาษาไทย: &quot;{phrase.thText}&quot;
          </text>
          <text x="650" y="124" textAnchor="end" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
            {thCount} tokens ({ratio.toFixed(2)}×)
          </text>
          {thChips.map((chip, idx) => {
            const tone = CHIP_TONES[idx % CHIP_TONES.length];
            return (
              <g key={`${phrase.id}-th-${idx}`}>
                <rect x={chip.x} y="136" width={chip.w} height="32" rx="8" fill={tone.fill} stroke={tone.stroke} strokeWidth="1.25" className={txClass} />
                <text x={chip.x + chip.w / 2} y="156" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
                  {chip.text}
                </text>
              </g>
            );
          })}

          {/* Animated Token Count Comparison Bar */}
          <rect x="16" y="192" width="648" height="72" rx="12" fill="var(--surface)" stroke="var(--line)" />

          <text x="30" y="218" fontSize="12" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
            EN ({enCount})
          </text>
          <rect x="108" y="206" width="320" height="16" rx="8" fill="var(--surface-2)" />
          <rect x="108" y="206" width={enBarW} height="16" rx="8" fill="var(--cyan)" className={txClass} />

          <text x="30" y="246" fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
            TH ({thCount})
          </text>
          <rect x="108" y="234" width="320" height="16" rx="8" fill="var(--surface-2)" />
          <rect x="108" y="234" width={thBarW} height="16" rx="8" fill="var(--warning)" className={txClass} />

          {/* Inflation callout pill */}
          <rect x="454" y="204" width="196" height="48" rx="10" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.25" />
          <text x="552" y="224" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
            {ratio.toFixed(2)}× Thai Inflation
          </text>
          <text x="552" y="242" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
            ใช้ token &amp; ค่าใช้จ่ายสูงกว่า
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {phrase.caption}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 3. StructuredOutputVisual (D077 — structured-output)                       */
/* ========================================================================== */

type OutputMode = "free" | "strict";

export function StructuredOutputVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<OutputMode>("strict");
  const [step, setStep] = useState(1); // Focus on Constrained Decoding by default
  const isStrict = mode === "strict";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerId = `${uid}-struct-arrow`;

  const stages = isStrict
    ? [
        { id: 0, title: "1. Prompt+Schema", sub: "ส่ง JSON Schema", note: "แนบ Pydantic JSON Schema ไปพร้อมคำสั่ง" },
        { id: 1, title: "2. Constrained", sub: "ล็อก token ตามกฎ", note: "Logit Mask อนุญาตเฉพาะ token ที่ถูกหลัก JSON Schema" },
        { id: 2, title: "3. JSON Output", sub: "JSON สมบูรณ์ 100%", note: "ไม่มีคำเกริ่น ไม่มี ```json ปนมา" },
        { id: 3, title: "4. Pydantic Obj", sub: "ใช้งานได้ทันที", note: "Ticket.model_validate_json() ผ่านทุกครั้ง" },
      ]
    : [
        { id: 0, title: "1. Prompt Only", sub: "ขอ JSON ด้วยคำพูด", note: 'สั่งแค่ "กรุณาตอบเป็น JSON นะ" ไม่มี Schema บังคับ' },
        { id: 1, title: "2. Free Decoding", sub: "สุ่มคำอิสระ", note: "โมเดลเลือกคำทักทายหรือเปลี่ยนชื่อ key ได้ตามใจ" },
        { id: 2, title: "3. Free Text", sub: "มีข้อความปน/พัง", note: "มีคำอธิบายเกริ่นนำ + single quotes + key เพี้ยน" },
        { id: 3, title: "4. Parse Crash", sub: "JSONDecodeError!", note: "ระบบปลายทางล่มเมื่อ json.loads() เจอข้อความปน" },
      ];

  const centers = [88, 256, 424, 592];
  const activeCenterX = centers[step];

  const captionText = isStrict
    ? `Strict JSON Schema — ${stages[step].title}: ${stages[step].note} ทำให้เชื่อม LLM เข้ากับโค้ด Backend ได้อย่างเสถียร 100%`
    : `Without Schema — ${stages[step].title}: ${stages[step].note} ซึ่งเป็นสาเหตุหลักที่ระบบ AI พังใน Production`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="สลับโหมด Free Text กับ Strict JSON Schema" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={!isStrict}
            className={!isStrict ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={!isStrict ? ACTIVE_BTN_STYLE : undefined}
            onClick={() => setMode("free")}
          >
            Without Schema (free text drift)
          </button>
          <button
            type="button"
            aria-pressed={isStrict}
            className={isStrict ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={isStrict ? ACTIVE_BTN_STYLE : undefined}
            onClick={() => setMode("strict")}
          >
            Strict JSON Schema (100% typed)
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 276" className="block h-auto w-full" role="img" aria-label="แผนภาพเปรียบเทียบ Free Text Drift กับ Strict JSON Schema">
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isStrict ? "var(--brand)" : "var(--danger)"} />
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
                y1="62"
                x2={x2}
                y2="62"
                stroke={isStrict ? "var(--brand)" : idx === 2 ? "var(--danger)" : "var(--warning)"}
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerId})`}
              />
            );
          })}

          {/* 4 Clickable Stage Nodes */}
          {stages.map((st, idx) => {
            const x = 16 + idx * 168;
            const isActive = idx === step;
            const isFailNode = !isStrict && idx === 3;
            const isPassNode = isStrict && idx === 3;

            const fill = isActive
              ? isStrict
                ? "var(--brand-soft)"
                : "var(--warning-soft)"
              : isFailNode
                ? "var(--danger-soft)"
                : isPassNode
                  ? "var(--success-soft)"
                  : "var(--surface)";

            const stroke = isActive
              ? isStrict
                ? "var(--brand)"
                : "var(--warning)"
              : isFailNode
                ? "var(--danger)"
                : isPassNode
                  ? "var(--success)"
                  : "var(--line)";

            const titleColor = isFailNode
              ? "var(--danger)"
              : isPassNode
                ? "var(--success)"
                : isActive
                  ? isStrict
                    ? "var(--brand-ink)"
                    : "var(--warning)"
                  : "var(--fg)";

            return (
              <g
                key={st.id}
                role="button"
                tabIndex={0}
                aria-label={`ดูขั้นตอน ${st.title}`}
                aria-pressed={isActive}
                onClick={() => setStep(st.id)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(st.id))}
                style={{ cursor: "pointer" }}
              >
                <rect x={x} y="24" width="144" height="76" rx="12" fill={fill} stroke={stroke} strokeWidth={isActive ? "2" : "1.5"} className={txClass} />
                <text x={x + 72} y="54" textAnchor="middle" fontSize="12" fontWeight="700" fill={titleColor} fontFamily="var(--font-mono)">
                  {st.title}
                </text>
                <text x={x + 72} y="78" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                  {st.sub}
                </text>
              </g>
            );
          })}

          {/* Drop connector to Inspector */}
          <line
            x1={activeCenterX}
            y1="100"
            x2={activeCenterX}
            y2="132"
            stroke={isStrict ? "var(--brand)" : "var(--warning)"}
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
          />
          <circle cx={activeCenterX} cy="134" r="4" fill={isStrict ? "var(--brand)" : "var(--warning)"} className={txClass} />

          {/* Bottom Inspector Card */}
          <rect
            x="16"
            y="136"
            width="648"
            height="124"
            rx="12"
            fill="var(--surface)"
            stroke={isStrict ? "var(--success)" : "var(--danger)"}
            strokeWidth="1.5"
            className={txClass}
          />

          {/* Left Output Preview */}
          <text x="32" y="160" fontSize="12" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            {isStrict ? "STRICT OUTPUT STREAM" : "UNCONSTRAINED OUTPUT"}
          </text>
          <rect
            x="32"
            y="170"
            width="370"
            height="76"
            rx="8"
            fill={isStrict ? "var(--success-soft)" : "var(--danger-soft)"}
            stroke={isStrict ? "var(--success)" : "var(--danger)"}
            strokeOpacity="0.45"
          />
          {isStrict ? (
            <>
              <text x="44" y="192" fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                {'{"category": "billing",'}
              </text>
              <text x="44" y="212" fontSize="12" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                {' "priority": 2, "urgent": true}'}
              </text>
              <text x="44" y="234" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                ตรงตาม Type และ Enum 100% ไม่มีข้อความเกริ่นนำ
              </text>
            </>
          ) : (
            <>
              <text x="44" y="192" fontSize="12" fill="var(--danger)" fontFamily="var(--font-sans)">
                แน่นอนครับ! ผลวิเคราะห์คือ:
              </text>
              <text x="44" y="212" fontSize="12" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                {"```json {prio: 'สูง'} ```"}
              </text>
              <text x="44" y="234" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                คำเกริ่น + single quote + ชื่อ key เพี้ยน → Parser พัง!
              </text>
            </>
          )}

          {/* Right Reliability Card */}
          <rect x="418" y="152" width="230" height="94" rx="10" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="434" y="176" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            ความเสถียรใน Production
          </text>
          <text
            x="434"
            y="204"
            fontSize="14"
            fontWeight="700"
            fill={isStrict ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {isStrict ? "100% Valid JSON" : "~72% Fragile Parse"}
          </text>
          <text x="434" y="228" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
            {isStrict ? "รับประกัน Type ด้วย Schema" : "ต้องเขียน regex ซ่อมเองตลอด"}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}
