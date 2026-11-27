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
/* 1. MultimodalBatchFlowVisual (multimodal-batch-flow)                       */
/* ========================================================================== */

type PipelineMode = "vision" | "batch";

interface FlowStage {
  id: number;
  title: string;
  sub: string;
  note: string;
  payloadHeader: string;
  line1: string;
  line2: string;
  line3: string;
  metricTitle: string;
  metricValue: string;
  metricSub: string;
}

const VISION_STAGES: readonly FlowStage[] = [
  {
    id: 0,
    title: "1. PDF / Photo",
    sub: "รับใบเสร็จไทย",
    note: "รับภาพถ่ายหรือ PDF ใบเสร็จภาษาไทยที่มีตาราง ตัวเลข และรอยยับ",
    payloadHeader: "INPUT · RAW THAI RECEIPT IMAGE / PDF",
    line1: "file: receipt_cafe_2026.pdf (page 1)",
    line2: "detect: Thai font + VAT table + total",
    line3: "ภาพความละเอียดสูงเกินไปจะกิน Vision Token โดยไม่จำเป็น",
    metricTitle: "Input Source",
    metricValue: "PDF / JPG",
    metricSub: "รองรับใบเสร็จและตารางไทย",
  },
  {
    id: 1,
    title: "2. Preprocess",
    sub: "DPI 150 · Crop",
    note: "แปลง PDF เป็น PNG ที่ 150 DPI ตัดขอบว่าง และหมุนภาพให้ตรงเพื่อประหยัด Token",
    payloadHeader: "PREPROCESS · NORMALIZE RESOLUTION",
    line1: "render_pdf(dpi=150) → 1024×1440 px",
    line2: "crop_margins() → ~650 vision tokens",
    line3: "ลดขนาดภาพพอดีอ่านตัวเลขชัด ประหยัดค่า Vision 40%",
    metricTitle: "Image Budget",
    metricValue: "~650 tok",
    metricSub: "150 DPI คมชัดพอสำหรับตัวเลข",
  },
  {
    id: 2,
    title: "3. Vision LLM",
    sub: "ภาพ + Schema",
    note: "ส่งภาพคู่กับ Pydantic JSON Schema เพื่อให้โมเดลอ่านทั้งข้อความและตำแหน่งตาราง",
    payloadHeader: "VISION CALL · IMAGE + STRICT SCHEMA",
    line1: 'content: [image_b64, "สกัดยอดและ VAT 7%"]',
    line2: "response_format: ReceiptSchema (strict)",
    line3: "โมเดลอ่านโครงสร้างบิลได้แม่นกว่า OCR แบบดั้งเดิม",
    metricTitle: "Realtime Latency",
    metricValue: "~1.8s / บิล",
    metricSub: "เหมาะกับงานผู้ใช้รอผลทันที",
  },
  {
    id: 3,
    title: "4. Typed JSON",
    sub: "ตรวจยอด + VAT",
    note: "ได้ JSON ที่มี Type ครบ พร้อมตรวจสมการ subtotal + vat_7 == total อัตโนมัติ",
    payloadHeader: "OUTPUT · VALIDATED RECEIPT JSON",
    line1: '{"vendor":"กาแฟดอยช้าง","date":"2026-11-24",',
    line2: ' "sub":280.37,"vat7":19.63,"total":300.00}',
    line3: "ตรวจยอดรวมตรง 100% ก่อนบันทึกลงระบบบัญชี",
    metricTitle: "Validation Pass",
    metricValue: "sub+vat=300",
    metricSub: "เช็กเลขผิดด้วย Pydantic ทันที",
  },
];

const BATCH_STAGES: readonly FlowStage[] = [
  {
    id: 0,
    title: "1. Build JSONL",
    sub: "แนบ custom_id",
    note: "แพ็กคำขอจำนวนมากลงไฟล์ .jsonl โดยผูก custom_id ไม่ซ้ำกันทุกบรรทัด",
    payloadHeader: "BATCH INPUT · requests.jsonl (1 line = 1 doc)",
    line1: '{"custom_id":"rcpt_042","method":"POST",',
    line2: ' "body":{"model":"gpt-mini","input":...}}',
    line3: "ห้ามใช้ลำดับบรรทัดอ้างอิง ต้องติด custom_id เสมอ",
    metricTitle: "Batch Capacity",
    metricValue: "50,000 / ไฟล์",
    metricSub: "ส่งงานออฟไลน์จำนวนมากทีเดียว",
  },
  {
    id: 1,
    title: "2. Async Queue",
    sub: "อัปโหลดเข้าคิว",
    note: "อัปโหลดไฟล์ JSONL และสร้าง Batch Job แบบ Async ไม่ติด Rate Limit รายนาที",
    payloadHeader: "QUEUE SUBMIT · NON-BLOCKING JOB",
    line1: 'batch = client.batches.create(file_id="f_9")',
    line2: 'status: "in_progress" (window="24h")',
    line3: "แยกโควตา Rate Limit ออกจาก Traffic หลักของลูกค้า",
    metricTitle: "Completion SLA",
    metricValue: "≤ 24 ชม.",
    metricSub: "ไม่ชน Rate Limit งาน Realtime",
  },
  {
    id: 2,
    title: "3. Off-Peak Run",
    sub: "ประมวลผลลด 50%",
    note: "ผู้ให้บริการจัดตารางรันช่วงเครื่องว่าง แลกกับส่วนลดราคา API 50% เต็ม",
    payloadHeader: "COST SAVINGS · REALTIME VS BATCH API",
    line1: "Realtime 10,000 บิล: ฿1,200 (100% price)",
    line2: "Batch API 10,000 บิล:  ฿600 (-50% cost!)",
    line3: "คุณภาพโมเดลและ Schema เหมือน Realtime ทุกประการ",
    metricTitle: "Batch Discount",
    metricValue: "-50% Cost",
    metricSub: "ประหยัดงบครึ่งหนึ่งทันที",
  },
  {
    id: 3,
    title: "4. Map Results",
    sub: "จับคู่ custom_id",
    note: "ดาวน์โหลดไฟล์ผลลัพธ์ JSONL แล้วจับคู่กลับเข้า Database ด้วย custom_id",
    payloadHeader: "OUTPUT MATCHING · JOIN BY custom_id",
    line1: 'out["rcpt_042"] → {"total":300.0,"ok":true}',
    line2: 'failed["rcpt_099"] → retry_queue.push()',
    line3: "ผลลัพธ์อาจเรียงสลับลำดับ — Map ผ่าน custom_id แม่น 100%",
    metricTitle: "Idempotent Join",
    metricValue: "custom_id",
    metricSub: "แยกเคสพังเข้าคิวซ่อมได้ง่าย",
  },
];

export function MultimodalBatchFlowVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<PipelineMode>("vision");
  const [step, setStep] = useState(2);

  const isVision = mode === "vision";
  const stages = isVision ? VISION_STAGES : BATCH_STAGES;
  const activeStage = stages[step] ?? stages[0];
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerId = `${uid}-mb-arrow`;

  const centers = [88, 256, 424, 592];
  const activeCenterX = centers[step] ?? centers[0];
  const accentColor = isVision ? "var(--brand)" : "var(--success)";
  const accentSoft = isVision ? "var(--brand-soft)" : "var(--success-soft)";
  const accentInk = isVision ? "var(--brand-ink)" : "var(--success)";

  const captionText = isVision
    ? `Vision Receipt Pipeline — ${activeStage.title}: ${activeStage.note}`
    : `Batch API Queue (-50%) — ${activeStage.title}: ${activeStage.note}`;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับโหมด Vision Receipt Pipeline กับ Batch API Queue" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={isVision}
          className={isVision ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isVision ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("vision")}
        >
          Vision Receipt Pipeline (PDF→Img→JSON)
        </button>
        <button
          type="button"
          aria-pressed={!isVision}
          className={!isVision ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isVision ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("batch")}
        >
          Batch API Queue (JSONL · ลดงบ 50%)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 276"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพเปรียบเทียบ Vision Receipt Pipeline และ Batch API Queue"
        >
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={accentColor} />
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
                y1="61"
                x2={x2}
                y2="61"
                stroke={accentColor}
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerId})`}
              />
            );
          })}

          {/* 4 Clickable Stage Cards */}
          {stages.map((st, idx) => {
            const x = 16 + idx * 168;
            const isActive = idx === step;
            const isLast = idx === 3;
            const fill = isActive ? accentSoft : isLast ? "var(--cyan-soft)" : "var(--surface)";
            const stroke = isActive ? accentColor : isLast ? "var(--cyan)" : "var(--line)";
            const titleColor = isActive ? accentInk : isLast ? "var(--cyan)" : "var(--fg)";

            return (
              <g
                key={`${mode}-${st.id}`}
                role="button"
                tabIndex={0}
                aria-label={`ดูขั้นตอน ${st.title}`}
                aria-pressed={isActive}
                onClick={() => setStep(st.id)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(st.id))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x}
                  y="24"
                  width="144"
                  height="74"
                  rx="12"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isActive ? "2" : "1.5"}
                  className={txClass}
                />
                <text
                  x={x + 72}
                  y="54"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill={titleColor}
                  fontFamily="var(--font-mono)"
                >
                  {st.title}
                </text>
                <text
                  x={x + 72}
                  y="77"
                  textAnchor="middle"
                  fontSize="12"
                  fill="var(--muted)"
                  fontFamily="var(--font-sans)"
                >
                  {st.sub}
                </text>
              </g>
            );
          })}

          {/* Drop connector to Inspector */}
          <line
            x1={activeCenterX}
            y1="98"
            x2={activeCenterX}
            y2="128"
            stroke={accentColor}
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
          />
          <circle cx={activeCenterX} cy="130" r="4" fill={accentColor} className={txClass} />

          {/* Bottom Inspector Container */}
          <rect
            x="16"
            y="132"
            width="648"
            height="130"
            rx="12"
            fill="var(--surface)"
            stroke={accentColor}
            strokeWidth="1.5"
            className={txClass}
          />

          {/* Left Payload / Flow Detail Box */}
          <text x="32" y="156" fontSize="11.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            {activeStage.payloadHeader}
          </text>
          <rect
            x="32"
            y="166"
            width="386"
            height="82"
            rx="8"
            fill={accentSoft}
            stroke={accentColor}
            strokeOpacity="0.45"
            className={txClass}
          />
          <text x="44" y="188" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
            {activeStage.line1}
          </text>
          <text x="44" y="210" fontSize="11.5" fontWeight="700" fill={accentInk} fontFamily="var(--font-mono)">
            {activeStage.line2}
          </text>
          <text x="44" y="234" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
            {activeStage.line3}
          </text>

          {/* Right Metric Card */}
          <rect x="434" y="148" width="214" height="100" rx="10" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="450" y="172" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            {activeStage.metricTitle}
          </text>
          <text
            x="450"
            y="200"
            fontSize="16"
            fontWeight="700"
            fill={accentInk}
            fontFamily="var(--font-mono)"
          >
            {activeStage.metricValue}
          </text>

          {/* Compact cost ratio mini-bar in Batch mode or step progress bar in Vision mode */}
          <rect x="450" y="212" width="182" height="8" rx="4" fill="var(--surface)" stroke="var(--hair)" />
          <rect
            x="450"
            y="212"
            width={isVision ? Math.round(((step + 1) / 4) * 182) : 91}
            height="8"
            rx="4"
            fill={accentColor}
            className={txClass}
          />
          <text x="450" y="237" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
            {activeStage.metricSub}
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
/* 2. OllamaQuantizationVisual (ollama-quantization)                          */
/* ========================================================================== */

type QuantTierId = "fp16" | "q8" | "q4";

interface QuantTier {
  id: QuantTierId;
  btnLabel: string;
  cardTitle: string;
  cardSub: string;
  tag: string;
  vramGb: number;
  tokPerSec: number;
  speedMult: string;
  qualityPct: number;
  fitBadge: string;
  tone: {
    fill: string;
    stroke: string;
    text: string;
  };
  summary: string;
  caption: string;
}

const QUANT_TIERS: readonly QuantTier[] = [
  {
    id: "fp16",
    btnLabel: "FP16 · 16GB VRAM",
    cardTitle: "FP16 (16-bit)",
    cardSub: "16.0 GB · Server GPU",
    tag: "llama3.1:8b-fp16",
    vramGb: 16.0,
    tokPerSec: 18,
    speedMult: "1.0×",
    qualityPct: 100.0,
    fitBadge: "✗ เกินงบ Laptop 8GB",
    tone: {
      fill: "var(--danger-soft)",
      stroke: "var(--danger)",
      text: "var(--danger)",
    },
    summary: "แม่นยำต้นฉบับ 100% แต่กิน VRAM เต็ม 16GB และช้าสุด",
    caption:
      "FP16 (16GB VRAM): เก็บน้ำหนักเต็ม 16-bit ให้คุณภาพต้นฉบับ 100% แต่กินหน่วยความจำสูงและส่งข้อมูลผ่าน Memory Bandwidth ช้า (~18 tok/s) จึงไม่เหมาะกับ Laptop ทั่วไป",
  },
  {
    id: "q8",
    btnLabel: "Q8_0 · 8.5GB",
    cardTitle: "Q8_0 (8-bit)",
    cardSub: "8.5 GB · 12GB+ GPU",
    tag: "llama3.1:8b-q8_0",
    vramGb: 8.5,
    tokPerSec: 34,
    speedMult: "1.9×",
    qualityPct: 99.6,
    fitBadge: "⚠ ต้องใช้ GPU 12GB+",
    tone: {
      fill: "var(--warning-soft)",
      stroke: "var(--warning)",
      text: "var(--warning)",
    },
    summary: "คุณภาพแทบไม่ต่างจาก FP16 (99.6%) และเร็วขึ้นเกือบ 2 เท่า",
    caption:
      "Q8_0 (8.5GB VRAM): บีบน้ำหนักเหลือ 8-bit ลดหน่วยความจำเกือบครึ่งและเพิ่มความเร็วเป็น ~34 tok/s โดยแทบไม่เสียคุณภาพ (99.6%) เหมาะกับเครื่อง Workstation ที่มี GPU 12GB+",
  },
  {
    id: "q4",
    btnLabel: "Q4_K_M · 4.8GB Laptop",
    cardTitle: "Q4_K_M (4-bit)",
    cardSub: "4.8 GB · Laptop 8GB",
    tag: "llama3.1:8b-q4_K_M",
    vramGb: 4.8,
    tokPerSec: 58,
    speedMult: "3.2×",
    qualityPct: 97.8,
    fitBadge: "✓ รันบน Laptop ได้ลื่น",
    tone: {
      fill: "var(--success-soft)",
      stroke: "var(--success)",
      text: "var(--success)",
    },
    summary: "สมดุลยอดนิยม: ลด VRAM 70% · เร็ว 3.2× · คุณภาพ 97.8%",
    caption:
      "Q4_K_M (4.8GB Laptop): ค่ามาตรฐานของ Ollama ที่บีบน้ำหนักแบบ K-Quant 4-bit ลด VRAM ลงถึง 70% เร่งความเร็วได้ ~58 tok/s (3.2×) และรันข้อมูลลับแบบ Local Offline บนโน้ตบุ๊กได้ทันที",
  },
];

export function OllamaQuantizationVisual({ reduced = false }: VisualProps) {
  const [tierId, setTierId] = useState<QuantTierId>("q4");
  const activeIndex = Math.max(
    0,
    QUANT_TIERS.findIndex((t) => t.id === tierId)
  );
  const tier = QUANT_TIERS[activeIndex] ?? QUANT_TIERS[2];

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const barMaxW = 368;
  const vramBarW = Math.round((tier.vramGb / 16.0) * barMaxW);
  const speedBarW = Math.round((tier.tokPerSec / 64) * barMaxW);
  const qualityBarW = Math.round((tier.qualityPct / 100) * barMaxW);
  const laptopLineX = 276 + Math.round((8.0 / 16.0) * barMaxW); // 8GB threshold
  const activeCardCenterY = 44 + activeIndex * 62 + 26;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกระดับ Quantization สำหรับโมเดล Local Ollama" className="flex flex-wrap gap-2">
        {QUANT_TIERS.map((item) => {
          const active = item.id === tierId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setTierId(item.id)}
            >
              {item.btnLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 272"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพเปรียบเทียบ VRAM ความเร็ว tok/s และคุณภาพของระดับ Quantization ใน Ollama"
        >
          {/* Top Header */}
          <text x="18" y="26" fontSize="12" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-sans)">
            Ollama 8B Local Model · เลือกระดับ GGUF Quantization
          </text>
          <text x="662" y="26" textAnchor="end" fontSize="12" fontWeight="700" fill={tier.tone.text} fontFamily="var(--font-mono)">
            ollama run {tier.tag}
          </text>

          {/* Left 3 Clickable Tier Cards */}
          {QUANT_TIERS.map((item, idx) => {
            const y = 44 + idx * 62;
            const isActive = item.id === tierId;
            return (
              <g
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`เลือกระดับ ${item.btnLabel}`}
                aria-pressed={isActive}
                onClick={() => setTierId(item.id)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setTierId(item.id))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x="16"
                  y={y}
                  width="206"
                  height="52"
                  rx="10"
                  fill={isActive ? item.tone.fill : "var(--surface)"}
                  stroke={isActive ? item.tone.stroke : "var(--line)"}
                  strokeWidth={isActive ? "2" : "1.5"}
                  className={txClass}
                />
                <text
                  x="30"
                  y={y + 22}
                  fontSize="12.5"
                  fontWeight="700"
                  fill={isActive ? item.tone.text : "var(--fg)"}
                  fontFamily="var(--font-mono)"
                >
                  {item.cardTitle}
                </text>
                <text x="30" y={y + 41} fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                  {item.cardSub}
                </text>
              </g>
            );
          })}

          {/* Privacy / Local Pill under Left Cards */}
          <rect x="16" y="232" width="206" height="28" rx="8" fill="var(--surface)" stroke="var(--hair)" />
          <text x="119" y="250" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--cyan)" fontFamily="var(--font-mono)">
            100% Local · Zero API Cost
          </text>

          {/* Animated Horizontal Flow Connector from Active Card to Dashboard */}
          <line
            x1="222"
            y1={activeCardCenterY}
            x2="256"
            y2={activeCardCenterY}
            stroke={tier.tone.stroke}
            strokeWidth="2.5"
            strokeDasharray={reduced ? undefined : "5 5"}
            className={flowClass}
          />
          <circle cx="258" cy={activeCardCenterY} r="4" fill={tier.tone.stroke} className={txClass} />

          {/* Right Telemetry Dashboard */}
          <rect
            x="258"
            y="44"
            width="406"
            height="216"
            rx="12"
            fill="var(--surface)"
            stroke={tier.tone.stroke}
            strokeWidth="1.5"
            className={txClass}
          />

          {/* Dashboard Header + Fit Pill */}
          <text x="276" y="68" fontSize="11.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            HARDWARE TELEMETRY (8B GGUF)
          </text>
          <rect x="492" y="53" width="156" height="22" rx="11" fill={tier.tone.fill} stroke={tier.tone.stroke} />
          <text
            x="570"
            y="68"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={tier.tone.text}
            fontFamily="var(--font-sans)"
          >
            {tier.fitBadge}
          </text>

          {/* Meter 1: VRAM Gauge */}
          <text x="276" y="95" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            VRAM Usage
          </text>
          <text x="644" y="95" textAnchor="end" fontSize="12" fontWeight="700" fill={tier.tone.text} fontFamily="var(--font-mono)">
            {tier.vramGb.toFixed(1)} / 16.0 GB
          </text>
          <rect x="276" y="103" width={barMaxW} height="14" rx="7" fill="var(--surface-2)" stroke="var(--hair)" />
          <rect x="276" y="103" width={vramBarW} height="14" rx="7" fill={tier.tone.stroke} className={txClass} />
          {/* 8GB Laptop Threshold Marker */}
          <line
            x1={laptopLineX}
            y1="100"
            x2={laptopLineX}
            y2="122"
            stroke="var(--fg)"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <text x={laptopLineX + 6} y="128" fontSize="10.5" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
            8GB Laptop Limit
          </text>

          {/* Meter 2: Generation Speed */}
          <text x="276" y="148" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            Speed (tok/s)
          </text>
          <text x="644" y="148" textAnchor="end" fontSize="12" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
            ~{tier.tokPerSec} tok/s ({tier.speedMult})
          </text>
          <rect x="276" y="156" width={barMaxW} height="14" rx="7" fill="var(--surface-2)" stroke="var(--hair)" />
          <rect x="276" y="156" width={speedBarW} height="14" rx="7" fill="var(--cyan)" className={txClass} />

          {/* Meter 3: Quality Retention */}
          <text x="276" y="194" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            Quality Retention
          </text>
          <text x="644" y="194" textAnchor="end" fontSize="12" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            {tier.qualityPct.toFixed(1)}% vs FP16
          </text>
          <rect x="276" y="202" width={barMaxW} height="14" rx="7" fill="var(--surface-2)" stroke="var(--hair)" />
          <rect x="276" y="202" width={qualityBarW} height="14" rx="7" fill="var(--brand)" className={txClass} />

          {/* Bottom Insight Strip */}
          <text x="276" y="244" fontSize="11.5" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-sans)">
            {tier.summary}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {tier.caption}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 3. FinetuneVsRagLoraVisual (finetune-vs-rag-lora)                          */
/* ========================================================================== */

type AdaptationMode = "ladder" | "lora";

interface LadderRung {
  id: number;
  stepTitle: string;
  shortTag: string;
  costLabel: string;
  x: number;
  y: number;
  tone: {
    fill: string;
    stroke: string;
    text: string;
  };
  heading: string;
  updateSpeed: string;
  gpuNeed: string;
  bestFor1: string;
  bestFor2: string;
  avoidWhen: string;
  caption: string;
}

const LADDER_RUNGS: readonly LadderRung[] = [
  {
    id: 0,
    stepTitle: "1. Prompt",
    shortTag: "เริ่มที่นี่เสมอ",
    costLabel: "฿ ต่ำ · นาที",
    x: 16,
    y: 162,
    tone: {
      fill: "var(--success-soft)",
      stroke: "var(--success)",
      text: "var(--success)",
    },
    heading: "Prompt + Few-Shot",
    updateSpeed: "แก้ได้ทันที (วินาที)",
    gpuNeed: "ไม่ต้องเทรน GPU",
    bestFor1: "• ทดสอบไอเดียและกฎธุรกิจใหม่",
    bestFor2: "• จัดโครงสร้าง JSON / โทนคำตอบ",
    avoidWhen: "เลี่ยงเมื่อเอกสารมีหลายพันหน้า",
    caption:
      "ขั้นที่ 1 Prompt Engineering: เริ่มจากตรงนี้เสมอเพราะต้นทุนต่ำและปรับแก้ได้ในไม่กี่นาที — งานกว่า 70% จบได้ด้วย System Prompt + Few-Shot + Strict Schema",
  },
  {
    id: 1,
    stepTitle: "2. RAG",
    shortTag: "เติมความรู้สด",
    costLabel: "฿฿ กลาง · ชม.",
    x: 158,
    y: 94,
    tone: {
      fill: "var(--cyan-soft)",
      stroke: "var(--cyan)",
      text: "var(--cyan)",
    },
    heading: "RAG · ดึงความรู้ภายนอก",
    updateSpeed: "อัปเดตสด (เรียลไทม์)",
    gpuNeed: "ใช้แค่ Embedding",
    bestFor1: "• เอกสาร/ราคาที่เปลี่ยนบ่อย",
    bestFor2: "• งานที่ต้องอ้างอิงที่มาได้",
    avoidWhen: "เลี่ยงถ้าแค่ format ไม่นิ่ง",
    caption:
      "ขั้นที่ 2 RAG (Retrieval-Augmented Generation): ใช้เมื่อโมเดลขาด 'ความรู้เฉพาะโดเมนที่เปลี่ยนบ่อย' เพราะอัปเดตฐานข้อมูลได้ทันทีโดยไม่ต้องเทรนโมเดลใหม่และอ้างอิงที่มาได้",
  },
  {
    id: 2,
    stepTitle: "3. Fine-Tune",
    shortTag: "ปรับพฤติกรรม",
    costLabel: "฿฿฿ สูง · วัน",
    x: 300,
    y: 26,
    tone: {
      fill: "var(--warning-soft)",
      stroke: "var(--warning)",
      text: "var(--warning)",
    },
    heading: "Fine-Tuning (LoRA)",
    updateSpeed: "ต้องเทรนใหม่ทุกครั้ง",
    gpuNeed: "GPU + ข้อมูล 1k+ คู่",
    bestFor1: "• คุมสไตล์/ภาษาเฉพาะทาง",
    bestFor2: "• ลด Prompt บนโมเดลเล็ก",
    avoidWhen: "ห้ามใช้จำข้อมูลเปลี่ยนรายวัน!",
    caption:
      "ขั้นที่ 3 Fine-Tuning: ใช้เป็นทางเลือกสุดท้ายเมื่อต้องปรับ 'พฤติกรรม โทนภาษา หรือความแม่นยำของโมเดลขนาดเล็ก' โดยมีข้อมูลคุณภาพสูง (500–5,000 ตัวอย่าง) — ไม่ใช้เพื่อจำข้อเท็จจริงสดใหม่",
  },
];

interface LoraRankSpec {
  rank: 4 | 8 | 16;
  trainableLabel: string;
  pct: string;
  barW: number;
  note: string;
}

const LORA_RANKS: readonly LoraRankSpec[] = [
  {
    rank: 4,
    trainableLabel: "32.8K params",
    pct: "0.20%",
    barW: 6,
    note: "r = 4: เบามาก เทรนเพียง 0.20% ของน้ำหนัก (32.8K จาก 16.78M) เหมาะกับงานจัดรูปแบบและจำแนกง่าย",
  },
  {
    rank: 8,
    trainableLabel: "65.5K params",
    pct: "0.39%",
    barW: 10,
    note: "r = 8 (ค่าแนะนำ): เทรนเพียง 0.39% ของน้ำหนัก (65.5K จาก 16.78M) สมดุลระหว่างความจุและกัน Overfit",
  },
  {
    rank: 16,
    trainableLabel: "131.1K params",
    pct: "0.78%",
    barW: 16,
    note: "r = 16: เทรน 0.78% ของน้ำหนัก (131.1K จาก 16.78M) รับมือภาษาเฉพาะทางซับซ้อนได้มากขึ้นแต่ยัง <1%",
  },
];

export function FinetuneVsRagLoraVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<AdaptationMode>("ladder");
  const [rungIdx, setRungIdx] = useState(1); // Default to RAG
  const [rankIdx, setRankIdx] = useState(1); // Default to r=8

  const isLadder = mode === "ladder";
  const rung = LADDER_RUNGS[rungIdx] ?? LADDER_RUNGS[1];
  const loraSpec = LORA_RANKS[rankIdx] ?? LORA_RANKS[1];

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const arrowId = `${uid}-adapt-arrow`;

  const captionText = isLadder
    ? rung.caption
    : `LoRA Adapter (W frozen + A×B) — ${loraSpec.note} โดยแช่แข็งเมทริกซ์หลัก W ไว้ทั้งหมดเพื่อประหยัด VRAM 3–4×`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="สลับมุมมอง Decision Ladder กับ LoRA Adapter" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={isLadder}
            className={isLadder ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={isLadder ? ACTIVE_BTN_STYLE : undefined}
            onClick={() => setMode("ladder")}
          >
            Decision Ladder (Prompt→RAG→FT)
          </button>
          <button
            type="button"
            aria-pressed={!isLadder}
            className={!isLadder ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={!isLadder ? ACTIVE_BTN_STYLE : undefined}
            onClick={() => setMode("lora")}
          >
            LoRA Adapter (W frozen + A×B)
          </button>
        </div>

        {!isLadder ? (
          <div role="group" aria-label="เลือกค่า Rank r ของ LoRA" className="flex flex-wrap gap-1.5">
            {LORA_RANKS.map((spec, idx) => {
              const active = idx === rankIdx;
              return (
                <button
                  key={spec.rank}
                  type="button"
                  aria-pressed={active}
                  className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
                  style={active ? ACTIVE_BTN_STYLE : undefined}
                  onClick={() => setRankIdx(idx)}
                >
                  r = {spec.rank}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 276"
          className="w-full h-auto block"
          role="img"
          aria-label={
            isLadder
              ? "แผนภาพขั้นบันไดการตัดสินใจ Prompt สู่ RAG และ Fine-Tuning"
              : "แผนภาพสถาปัตยกรรม LoRA Adapter ที่แช่แข็งเมทริกซ์ W และเทรนเฉพาะ A คูณ B"
          }
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
          </defs>

          {isLadder ? (
            <>
              {/* Staircase climbing animated paths */}
              <path
                d="M 138 206 L 148 206 L 148 138 L 154 138"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "5 5"}
                className={flowClass}
                markerEnd={`url(#${arrowId})`}
              />
              <path
                d="M 280 138 L 290 138 L 290 70 L 296 70"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "5 5"}
                className={flowClass}
                markerEnd={`url(#${arrowId})`}
              />

              {/* Subtle axis hint */}
              <text x="16" y="28" fontSize="11.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-sans)">
                คลิกแต่ละขั้นเพื่อเทียบเกณฑ์ตัดสินใจ
              </text>
              <line x1="16" y1="262" x2="422" y2="262" stroke="var(--line)" strokeWidth="1.5" />
              <text x="219" y="256" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                ความซับซ้อนและต้นทุนเพิ่มขึ้น →
              </text>

              {/* 3 Clickable Staircase Rungs */}
              {LADDER_RUNGS.map((item, idx) => {
                const isActive = idx === rungIdx;
                return (
                  <g
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`เลือกขั้น ${item.stepTitle}`}
                    aria-pressed={isActive}
                    onClick={() => setRungIdx(idx)}
                    onKeyDown={(e) => handleSvgKeyDown(e, () => setRungIdx(idx))}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={item.x}
                      y={item.y}
                      width="122"
                      height="82"
                      rx="12"
                      fill={isActive ? item.tone.fill : "var(--surface)"}
                      stroke={isActive ? item.tone.stroke : "var(--line)"}
                      strokeWidth={isActive ? "2.25" : "1.5"}
                      className={txClass}
                    />
                    <text
                      x={item.x + 61}
                      y={item.y + 27}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="700"
                      fill={isActive ? item.tone.text : "var(--fg)"}
                      fontFamily="var(--font-mono)"
                    >
                      {item.stepTitle}
                    </text>
                    <text
                      x={item.x + 61}
                      y={item.y + 49}
                      textAnchor="middle"
                      fontSize="11.5"
                      fill="var(--muted)"
                      fontFamily="var(--font-sans)"
                    >
                      {item.shortTag}
                    </text>
                    <rect
                      x={item.x + 14}
                      y={item.y + 58}
                      width="94"
                      height="17"
                      rx="8.5"
                      fill="var(--surface-2)"
                      stroke="var(--hair)"
                    />
                    <text
                      x={item.x + 61}
                      y={item.y + 70}
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight="600"
                      fill={item.tone.text}
                      fontFamily="var(--font-sans)"
                    >
                      {item.costLabel}
                    </text>
                  </g>
                );
              })}

              {/* Right Decision Inspector Card */}
              <rect
                x="440"
                y="24"
                width="224"
                height="232"
                rx="12"
                fill="var(--surface)"
                stroke={rung.tone.stroke}
                strokeWidth="1.75"
                className={txClass}
              />
              <rect x="454" y="38" width="196" height="28" rx="8" fill={rung.tone.fill} stroke={rung.tone.stroke} />
              <text
                x="552"
                y="56"
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill={rung.tone.text}
                fontFamily="var(--font-sans)"
              >
                {rung.heading}
              </text>

              <text x="454" y="88" fontSize="11" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
                DATA UPDATE
              </text>
              <text x="454" y="105" fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
                {rung.updateSpeed}
              </text>

              <text x="454" y="128" fontSize="11" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
                COMPUTE / DATA
              </text>
              <text x="454" y="145" fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
                {rung.gpuNeed}
              </text>

              <line x1="454" y1="158" x2="650" y2="158" stroke="var(--hair)" />

              <text x="454" y="177" fontSize="11.5" fontWeight="700" fill={rung.tone.text} fontFamily="var(--font-sans)">
                เหมาะกับงานแบบไหน:
              </text>
              <text x="454" y="196" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                {rung.bestFor1}
              </text>
              <text x="454" y="214" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                {rung.bestFor2}
              </text>

              <rect x="454" y="224" width="196" height="22" rx="6" fill="var(--danger-soft)" />
              <text
                x="552"
                y="239"
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="var(--danger)"
                fontFamily="var(--font-sans)"
              >
                {rung.avoidWhen}
              </text>
            </>
          ) : (
            <>
              {/* Input x Node */}
              <rect x="16" y="84" width="78" height="58" rx="10" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
              <text x="55" y="109" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
                Input x
              </text>
              <text x="55" y="128" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                d = 4096
              </text>

              {/* Branch lines: Input -> Frozen W (muted) */}
              <path d="M 94 102 C 118 102, 118 60, 146 60" fill="none" stroke="var(--muted)" strokeWidth="1.75" strokeDasharray="4 4" />
              <path d="M 446 60 C 470 60, 470 96, 484 102" fill="none" stroke="var(--muted)" strokeWidth="1.75" strokeDasharray="4 4" />

              {/* Branch lines: Input -> A -> B -> Sum (animated brand flow) */}
              <path
                d="M 94 124 C 118 124, 118 166, 144 166"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowId})`}
              />
              <line
                x1="276"
                y1="166"
                x2="314"
                y2="166"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowId})`}
              />
              <path
                d="M 446 166 C 470 166, 470 132, 484 126"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
              />
              <line
                x1="510"
                y1="114"
                x2="534"
                y2="114"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowId})`}
              />

              {/* Upper Box: Frozen Pretrained Weights W */}
              <rect
                x="148"
                y="24"
                width="298"
                height="72"
                rx="12"
                fill="var(--surface)"
                stroke="var(--line)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text x="297" y="51" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
                Frozen Weights W (4096 × 4096)
              </text>
              <text x="297" y="74" textAnchor="middle" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                16.78M params · แช่แข็ง 100% ไม่คำนวณ Gradient
              </text>

              {/* Lower Box A (Down-project) */}
              <rect
                x="148"
                y="132"
                width="128"
                height="68"
                rx="10"
                fill="var(--brand-soft)"
                stroke="var(--brand)"
                strokeWidth="2"
                className={txClass}
              />
              <text x="212" y="156" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                Matrix A
              </text>
              <text x="212" y="174" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                4096 × {loraSpec.rank}
              </text>
              <text x="212" y="191" textAnchor="middle" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                บีบลง Rank r
              </text>

              {/* Rank pill between A and B */}
              <rect x="281" y="136" width="34" height="20" rx="10" fill="var(--surface)" stroke="var(--brand)" />
              <text x="298" y="150" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                r={loraSpec.rank}
              </text>

              {/* Lower Box B (Up-project) */}
              <rect
                x="318"
                y="132"
                width="128"
                height="68"
                rx="10"
                fill="var(--cyan-soft)"
                stroke="var(--cyan)"
                strokeWidth="2"
                className={txClass}
              />
              <text x="382" y="156" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
                Matrix B
              </text>
              <text x="382" y="174" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                {loraSpec.rank} × 4096
              </text>
              <text x="382" y="191" textAnchor="middle" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                ขยายกลับ (init 0)
              </text>

              {/* Sum Circle + */}
              <circle cx="492" cy="114" r="18" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="2" />
              <text x="492" y="120" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                +
              </text>

              {/* Output & Trainable % Card */}
              <rect x="538" y="24" width="126" height="176" rx="12" fill="var(--surface)" stroke="var(--success)" strokeWidth="1.5" />
              <text x="601" y="48" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
                Output h
              </text>
              <text x="601" y="67" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                Wx + B(Ax)
              </text>
              <line x1="552" y1="80" x2="650" y2="80" stroke="var(--hair)" />
              <text x="601" y="100" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-sans)">
                เทรนจริงเพียง
              </text>
              <text x="601" y="126" textAnchor="middle" fontSize="19" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                {loraSpec.pct}
              </text>
              <text x="601" y="145" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                {loraSpec.trainableLabel}
              </text>
              {/* Tiny visual bar showing <1% trainable */}
              <rect x="554" y="160" width="94" height="10" rx="5" fill="var(--surface-2)" stroke="var(--hair)" />
              <rect x="554" y="160" width={loraSpec.barW} height="10" rx="5" fill="var(--success)" className={txClass} />
              <text x="601" y="186" textAnchor="middle" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                &lt; 1% ของทั้งหมด
              </text>

              {/* Bottom Formula Summary Bar */}
              <rect x="16" y="216" width="648" height="44" rx="10" fill="var(--surface)" stroke="var(--line)" />
              <text x="32" y="242" fontSize="12" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                h = W·x + (α/r)·B·(A·x)
              </text>
              <text x="650" y="242" textAnchor="end" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                สลับ Adapter ตามงานได้ · รวมกลับเข้า W ไม่เพิ่ม Latency
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
/* 4. Phase3ExtractorArchVisual (phase3-extractor-arch)                       */
/* ========================================================================== */

type BlockId = "B16" | "B17" | "B18" | "B19" | "B20" | "B21" | "B22" | "B23";

interface BlockMeta {
  id: BlockId;
  tag: string;
  stageIdx: number;
}

const PHASE3_BLOCKS: readonly BlockMeta[] = [
  { id: "B16", tag: "PyTorch", stageIdx: 2 },
  { id: "B17", tag: "BPE/Attn", stageIdx: 1 },
  { id: "B18", tag: "Embed", stageIdx: 1 },
  { id: "B19", tag: "SDK/Ctx", stageIdx: 0 },
  { id: "B20", tag: "Pydantic", stageIdx: 3 },
  { id: "B21", tag: "Vis/Local", stageIdx: 2 },
  { id: "B22", tag: "LoRA/Arch", stageIdx: 3 },
  { id: "B23", tag: "Eval/v1", stageIdx: 4 },
];

interface ArchNode {
  id: number;
  btnLabel: string;
  line1: string;
  line2: string;
  blockBadge: string;
  blocks: readonly BlockId[];
  fileSpec: string;
  desc1: string;
  desc2: string;
  ioLine: string;
  kpiLabel: string;
  kpiValue: string;
  kpiSub: string;
  tone: {
    fill: string;
    stroke: string;
    text: string;
  };
  caption: string;
}

const ARCH_NODES: readonly ArchNode[] = [
  {
    id: 0,
    btnLabel: "1. Versioned Prompt",
    line1: "1. Versioned",
    line2: "Prompt",
    blockBadge: "B19 · B23",
    blocks: ["B19", "B23"],
    fileSpec: "prompts/extract_v1.4.yaml",
    desc1: "แยก System Role, Few-Shot และ XML Tag เป็นไฟล์มีเวอร์ชัน",
    desc2: "วาง Prefix คงที่ไว้ต้นสุดเพื่อเปิด Prompt Cache และย้อนรุ่นได้",
    ioLine: "out: system_prefix (cached) + <doc> slot",
    kpiLabel: "Template Control",
    kpiValue: "v1.4 Git",
    kpiSub: "เทส Diff ก่อนปล่อยทุกครั้ง",
    tone: {
      fill: "var(--brand-soft)",
      stroke: "var(--brand)",
      text: "var(--brand-ink)",
    },
    caption:
      "1. Versioned Prompt (B19, B23): จัดเก็บ Prompt, ตัวอย่าง Few-Shot และแท็ก <doc> เป็นไฟล์ที่มีเวอร์ชันใน Git ช่วยให้ควบคุมคุณภาพ แชร์ Prompt Cache และย้อนกลับได้เมื่อผลลัพธ์ดรอป",
  },
  {
    id: 1,
    btnLabel: "2. Thai Normalizer",
    line1: "2. Thai",
    line2: "Normalizer",
    blockBadge: "B17 · B18 · B21",
    blocks: ["B17", "B18", "B21"],
    fileSpec: "pipeline/normalize_thai.py",
    desc1: "แปลง PDF/บิลเป็น 150 DPI และทำความสะอาดสแลง-คำสะกดผิด",
    desc2: "เช็กงบ BPE Token ภาษาไทยและจัดกลุ่มเอกสารด้วย Embedding",
    ioLine: "in: raw PDF/chat → out: clean text + token_est",
    kpiLabel: "Thai Edge-Cases",
    kpiValue: "150 DPI",
    kpiSub: "กัน BPE บวมและคำสแลงเพี้ยน",
    tone: {
      fill: "var(--cyan-soft)",
      stroke: "var(--cyan)",
      text: "var(--cyan)",
    },
    caption:
      "2. Thai Normalizer (B17, B18, B21): จัดการจุดอ่อนของเอกสารไทยโดยเฉพาะ ทั้งการปรับขนาดภาพใบเสร็จ ทำความสะอาดสแลง/คำสะกดผิด และประเมินงบ BPE Token ก่อนเรียกโมเดล",
  },
  {
    id: 2,
    btnLabel: "3. Router + Cache",
    line1: "3. Router",
    line2: "+ Cache",
    blockBadge: "B16 · B20 · B21",
    blocks: ["B16", "B20", "B21"],
    fileSpec: "pipeline/router_cache.py",
    desc1: "ส่งงานง่ายไปโมเดลเล็ก/Ollama 4-bit สงวน Frontier ให้เคสยาก",
    desc2: "เปิด Prompt Cache + Batch ลดงบ 50% และคุม Temperature 0",
    ioLine: "easy→Ollama/Small (80%) | hard→Frontier (20%)",
    kpiLabel: "Cost Reduction",
    kpiValue: "-62% API",
    kpiSub: "Routing + Cache + Batch",
    tone: {
      fill: "var(--warning-soft)",
      stroke: "var(--warning)",
      text: "var(--warning)",
    },
    caption:
      "3. Router + Cache (B16, B20, B21): หัวใจการคุมงบใน Production — แยกเส้นทางงานง่ายไปโมเดลเล็ก/Ollama งานยากไปโมเดลใหญ่ คุม Temperature ต่ำ และลดต้นทุนซ้ำด้วย Prompt Caching",
  },
  {
    id: 3,
    btnLabel: "4. Pydantic Repair",
    line1: "4. Pydantic",
    line2: "Repair",
    blockBadge: "B20 · B22",
    blocks: ["B20", "B22"],
    fileSpec: "pipeline/schema_repair.py",
    desc1: "บังคับ Strict JSON Schema และตรวจกฎยอดรวม + VAT ด้วย Pydantic",
    desc2: "หาก Parse หรือเลขผิด ส่ง Error ซ่อมอัตโนมัติ (≤ 2 รอบ) หรือ Fallback",
    ioLine: "validate() → fail? repair(err) → typed DocObj",
    kpiLabel: "Schema Validity",
    kpiValue: "99.4% OK",
    kpiSub: "Zero silent JSON crashes",
    tone: {
      fill: "var(--success-soft)",
      stroke: "var(--success)",
      text: "var(--success)",
    },
    caption:
      "4. Pydantic Repair (B20, B22): รับประกันข้อมูลออกที่เชื่อถือได้ 99%+ ด้วย Strict JSON Schema, การตรวจกฎธุรกิจใน Pydantic v2 และ Validation-Repair Loop ที่ไม่ปล่อยให้ระบบปลายทางล่ม",
  },
  {
    id: 4,
    btnLabel: "5. Eval & Cost/1k",
    line1: "5. Eval &",
    line2: "Cost/1k",
    blockBadge: "B22 · B23",
    blocks: ["B22", "B23"],
    fileSpec: "eval/benchmark_1k.py",
    desc1: "วัด Accuracy/F1, Latency p95 และต้นทุนต่อ 1,000 เอกสารจริง",
    desc2: "เทียบกับ ML Baseline จาก Phase 2 เพื่อตัดสินใจก่อน Deploy",
    ioLine: "report: F1=0.95 · p95=1.1s · ฿48 / 1k docs",
    kpiLabel: "Milestone Gate",
    kpiValue: "฿48 / 1k",
    kpiSub: "เทียบ F1 กับ ML Baseline",
    tone: {
      fill: "var(--brand-soft)",
      stroke: "var(--brand)",
      text: "var(--brand-ink)",
    },
    caption:
      "5. Eval & Cost/1k (B22, B23): ปิดวงจรวิศวกรรมด้วยการวัด Accuracy, Latency p95 และต้นทุนต่อ 1,000 เอกสารเทียบกับ ML Baseline เพื่อตัดสินใจเชิงตัวเลขว่าพร้อม Demo และ Deploy หรือยัง",
  },
];

export function Phase3ExtractorArchVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [selected, setSelected] = useState(2); // Default to Router + Cache

  const node = ARCH_NODES[selected] ?? ARCH_NODES[0];
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const arrowId = `${uid}-p3-arrow`;

  const centers = [72, 206, 340, 474, 608];
  const activeCenterX = centers[selected] ?? centers[0];

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกโหนดสถาปัตยกรรม Phase 3 Thai Document Extractor" className="flex flex-wrap gap-2">
        {ARCH_NODES.map((item) => {
          const active = item.id === selected;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setSelected(item.id)}
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
          aria-label="แผนภาพสถาปัตยกรรม 5 ขั้นตอนของ Phase 3 Milestone Thai Document Extractor พร้อมป้ายบทเรียน B16 ถึง B23"
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
          </defs>

          {/* Connecting Arrows between 5 Nodes */}
          {[0, 1, 2, 3].map((idx) => {
            const x1 = 14 + idx * 134 + 116;
            const x2 = 14 + (idx + 1) * 134 - 3;
            return (
              <line
                key={idx}
                x1={x1}
                y1="56"
                x2={x2}
                y2="56"
                stroke="var(--brand)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "5 5"}
                className={flowClass}
                markerEnd={`url(#${arrowId})`}
              />
            );
          })}

          {/* 5 Clickable Architecture Nodes */}
          {ARCH_NODES.map((item, idx) => {
            const x = 14 + idx * 134;
            const isActive = idx === selected;
            return (
              <g
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`ดูสถาปัตยกรรมขั้นตอน ${item.btnLabel}`}
                aria-pressed={isActive}
                onClick={() => setSelected(item.id)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setSelected(item.id))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x}
                  y="18"
                  width="116"
                  height="76"
                  rx="11"
                  fill={isActive ? item.tone.fill : "var(--surface)"}
                  stroke={isActive ? item.tone.stroke : "var(--line)"}
                  strokeWidth={isActive ? "2" : "1.5"}
                  className={txClass}
                />
                <text
                  x={x + 58}
                  y="42"
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fill={isActive ? item.tone.text : "var(--fg)"}
                  fontFamily="var(--font-mono)"
                >
                  {item.line1}
                </text>
                <text
                  x={x + 58}
                  y="59"
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fill={isActive ? item.tone.text : "var(--fg)"}
                  fontFamily="var(--font-mono)"
                >
                  {item.line2}
                </text>
                <text
                  x={x + 58}
                  y="81"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--muted)"
                  fontFamily="var(--font-mono)"
                >
                  {item.blockBadge}
                </text>
              </g>
            );
          })}

          {/* Drop connector to Inspector */}
          <line
            x1={activeCenterX}
            y1="94"
            x2={activeCenterX}
            y2="116"
            stroke={node.tone.stroke}
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "5 5"}
            className={flowClass}
          />
          <circle cx={activeCenterX} cy="118" r="3.5" fill={node.tone.stroke} className={txClass} />

          {/* Middle Detail Inspector Panel */}
          <rect
            x="14"
            y="120"
            width="652"
            height="100"
            rx="12"
            fill="var(--surface)"
            stroke={node.tone.stroke}
            strokeWidth="1.5"
            className={txClass}
          />

          {/* Left Description & I/O */}
          <text x="30" y="143" fontSize="12.5" fontWeight="700" fill={node.tone.text} fontFamily="var(--font-sans)">
            {node.btnLabel}
          </text>
          <text x="436" y="143" textAnchor="end" fontSize="11" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
            {node.fileSpec}
          </text>
          <text x="30" y="165" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
            {node.desc1}
          </text>
          <text x="30" y="184" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
            {node.desc2}
          </text>
          <text x="30" y="206" fontSize="11" fontWeight="600" fill={node.tone.text} fontFamily="var(--font-mono)">
            {node.ioLine}
          </text>

          {/* Right KPI Card */}
          <rect x="452" y="132" width="200" height="76" rx="10" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="466" y="152" fontSize="11" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            {node.kpiLabel}
          </text>
          <text x="466" y="177" fontSize="17" fontWeight="700" fill={node.tone.text} fontFamily="var(--font-mono)">
            {node.kpiValue}
          </text>
          <text x="466" y="197" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
            {node.kpiSub}
          </text>

          {/* Bottom Live B16–B23 Block Pills Strip */}
          {PHASE3_BLOCKS.map((blk, idx) => {
            const px = 16 + idx * 82;
            const isLinked = node.blocks.includes(blk.id);
            return (
              <g
                key={blk.id}
                role="button"
                tabIndex={0}
                aria-label={`เปิดขั้นตอนที่เชื่อมกับบทเรียน ${blk.id} (${blk.tag})`}
                aria-pressed={isLinked}
                onClick={() => setSelected(blk.stageIdx)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setSelected(blk.stageIdx))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={px}
                  y="232"
                  width="74"
                  height="34"
                  rx="8"
                  fill={isLinked ? node.tone.fill : "var(--surface)"}
                  stroke={isLinked ? node.tone.stroke : "var(--hair)"}
                  strokeWidth={isLinked ? "1.75" : "1"}
                  className={txClass}
                />
                <text
                  x={px + 37}
                  y="247"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={isLinked ? node.tone.text : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {blk.id}
                </text>
                <text
                  x={px + 37}
                  y="260"
                  textAnchor="middle"
                  fontSize="9.5"
                  fill={isLinked ? "var(--fg)" : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {blk.tag}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {node.caption}
      </p>
    </div>
  );
}
