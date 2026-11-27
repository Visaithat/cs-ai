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
/* 1. SchemaGateVisual (D001 — schema-gate)                                   */
/* ========================================================================== */

type SchemaMode = "valid" | "invalid" | "spaces";

const SCHEMA_MODES: { id: SchemaMode; label: string }[] = [
  { id: "valid", label: "Valid (coerce & strip)" },
  { id: "invalid", label: "Invalid (3 errors)" },
  { id: "spaces", label: "6 Spaces Gotcha" },
];

export function SchemaGateVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<SchemaMode>("valid");
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const isValid = mode === "valid";
  const isSpaces = mode === "spaces";

  const fieldStatus = isValid
    ? { fill: "var(--success-soft)", stroke: "var(--success)", text: "PASS · coerce", textColor: "var(--success)" }
    : isSpaces
      ? { fill: "var(--warning-soft)", stroke: "var(--warning)", text: "PASS! len=6 ≥ 3", textColor: "var(--warning)" }
      : { fill: "var(--danger-soft)", stroke: "var(--danger)", text: "FAIL · 3 errors", textColor: "var(--danger)" };

  const validatorStatus = isValid
    ? { fill: "var(--success-soft)", stroke: "var(--success)", text: "PASS · .strip()", textColor: "var(--success)" }
    : isSpaces
      ? { fill: "var(--danger-soft)", stroke: "var(--danger)", text: "BLOCK · ว่างหลัง strip", textColor: "var(--danger)" }
      : { fill: "var(--surface-2)", stroke: "var(--line)", text: "หยุดก่อนถึงขั้นนี้", textColor: "var(--muted)" };

  const outTone = isValid
    ? { fill: "var(--success-soft)", stroke: "var(--success)", color: "var(--success)", arrow: "var(--success)" }
    : { fill: "var(--danger-soft)", stroke: "var(--danger)", color: "var(--danger)", arrow: "var(--danger)" };

  const captionText =
    mode === "valid"
      ? 'โหมด Valid: Pydantic แปลง "2" เป็น int(2) อัตโนมัติ (coerce) และ @field_validator ตัดช่องว่างหัวท้ายของ " ขอใบเสร็จ " ออก ก่อนส่งต่อเป็น Ticket ที่ปลอดภัย'
      : mode === "invalid"
        ? "โหมด Invalid: ด่าน Field(...) ตรวจพบข้อผิดพลาดพร้อมกันทั้ง 3 ฟิลด์ (id ว่าง, priority เกิน 5, title สั้นเกินไป) และดีดกลับเป็น ValidationError ทันที"
        : 'กับดัก 6 Spaces: "      " ยาว 6 ตัวอักษรจึงหลุดผ่าน Field(min_length=3) ไปได้! ต้องมี @field_validator เรียก .strip() เพื่อสกัดข้อความว่างเปล่าก่อนเข้าสู่ระบบ';

  const markerIn = `${uid}-arrow-in`;
  const markerOut = `${uid}-arrow-out`;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกกรณีทดสอบ Pydantic Schema Gate" className="flex flex-wrap gap-2">
        {SCHEMA_MODES.map((item) => {
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 270" className="block h-auto w-full" role="img" aria-label="แผนภาพด่านตรวจ Pydantic BaseModel Gate">
          <defs>
            <marker id={markerIn} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={markerOut} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={outTone.arrow} />
            </marker>
          </defs>

          {/* Left: Raw JSON Input */}
          <g>
            <rect x="14" y="34" width="198" height="202" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
            <rect x="26" y="46" width="96" height="22" rx="6" fill="var(--surface-2)" stroke="var(--hair)" />
            <text x="74" y="61" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
              Raw JSON
            </text>

            <text x="26" y="92" fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
              {"{"}
            </text>

            {mode === "valid" && (
              <>
                <text x="34" y="114" fontSize="12" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"id": "T-104",'}
                </text>
                <rect x="30" y="122" width="170" height="22" rx="4" fill="var(--cyan-soft)" className={txClass} />
                <text x="34" y="137" fontSize="12" fill="var(--cyan)" fontWeight="600" fontFamily="var(--font-mono)">
                  {'"priority": "2",'}
                </text>
                <rect x="30" y="148" width="174" height="22" rx="4" fill="var(--brand-soft)" className={txClass} />
                <text x="34" y="163" fontSize="12" fill="var(--brand-ink)" fontWeight="600" fontFamily="var(--font-mono)">
                  {'"title": " ขอใบเสร็จ ",'}
                </text>
                <text x="34" y="188" fontSize="12" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"email": "a@b.co"'}
                </text>
              </>
            )}

            {mode === "invalid" && (
              <>
                <rect x="30" y="99" width="170" height="22" rx="4" fill="var(--danger-soft)" className={txClass} />
                <text x="34" y="114" fontSize="12" fill="var(--danger)" fontWeight="600" fontFamily="var(--font-mono)">
                  {'"id": "",'}
                </text>
                <rect x="30" y="124" width="170" height="22" rx="4" fill="var(--danger-soft)" className={txClass} />
                <text x="34" y="139" fontSize="12" fill="var(--danger)" fontWeight="600" fontFamily="var(--font-mono)">
                  {'"priority": 9,'}
                </text>
                <rect x="30" y="149" width="170" height="22" rx="4" fill="var(--danger-soft)" className={txClass} />
                <text x="34" y="164" fontSize="12" fill="var(--danger)" fontWeight="600" fontFamily="var(--font-mono)">
                  {'"title": "Hi",'}
                </text>
                <text x="34" y="188" fontSize="12" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"email": "a@b.co"'}
                </text>
              </>
            )}

            {mode === "spaces" && (
              <>
                <text x="34" y="114" fontSize="12" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"id": "T-208",'}
                </text>
                <text x="34" y="138" fontSize="12" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"priority": 1,'}
                </text>
                <rect x="30" y="148" width="174" height="22" rx="4" fill="var(--warning-soft)" className={txClass} />
                <text x="34" y="163" fontSize="12" fill="var(--warning)" fontWeight="600" fontFamily="var(--font-mono)">
                  {'"title": "······",'}
                </text>
                <text x="34" y="188" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                  (ช่องว่างล้วน 6 ตัว)
                </text>
              </>
            )}

            <text x="26" y="214" fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
              {"}"}
            </text>
          </g>

          {/* Animated flow line 1 */}
          <line
            x1="214"
            y1="135"
            x2="250"
            y2="135"
            stroke="var(--brand)"
            strokeWidth="2.5"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${markerIn})`}
          />

          {/* Center: Pydantic BaseModel Archway Gate */}
          <g>
            <path
              d="M 256 76 Q 340 16 424 76 L 424 242 L 256 242 Z"
              fill="var(--surface)"
              stroke="var(--brand)"
              strokeWidth="2"
              className={txClass}
            />
            <text x="340" y="56" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              BaseModel
            </text>
            <text x="340" y="72" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
              ด่านตรวจ Schema
            </text>

            {/* Stage 1: Field(...) */}
            <rect
              x="270"
              y="84"
              width="140"
              height="60"
              rx="10"
              fill={fieldStatus.fill}
              stroke={fieldStatus.stroke}
              strokeWidth="1.5"
              className={txClass}
            />
            <text x="340" y="103" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              1. Field(...)
            </text>
            <text x="340" y="119" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
              type · le=5 · min=3
            </text>
            <text x="340" y="137" textAnchor="middle" fontSize="12" fontWeight="700" fill={fieldStatus.textColor} fontFamily="var(--font-mono)">
              {fieldStatus.text}
            </text>

            {/* Vertical connector inside gate */}
            <line
              x1="340"
              y1="145"
              x2="340"
              y2="168"
              stroke={mode === "invalid" ? "var(--line)" : "var(--brand)"}
              strokeWidth="2"
              strokeDasharray={reduced ? undefined : "6 6"}
              className={mode === "invalid" ? undefined : flowClass}
            />

            {/* Stage 2: @field_validator */}
            <rect
              x="270"
              y="170"
              width="140"
              height="60"
              rx="10"
              fill={validatorStatus.fill}
              stroke={validatorStatus.stroke}
              strokeWidth="1.5"
              className={txClass}
            />
            <text x="340" y="189" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              2. @field_validator
            </text>
            <text x="340" y="205" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
              {'v.strip() != ""'}
            </text>
            <text x="340" y="223" textAnchor="middle" fontSize="12" fontWeight="700" fill={validatorStatus.textColor} fontFamily="var(--font-sans)">
              {validatorStatus.text}
            </text>
          </g>

          {/* Animated flow line 2 */}
          <line
            x1="426"
            y1="135"
            x2="462"
            y2="135"
            stroke={outTone.arrow}
            strokeWidth="2.5"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${markerOut})`}
          />

          {/* Right: Clean Output or ValidationError */}
          <g>
            <rect
              x="468"
              y="34"
              width="198"
              height="202"
              rx="12"
              fill={outTone.fill}
              stroke={outTone.stroke}
              strokeWidth="1.75"
              className={txClass}
            />
            <text x="482" y="59" fontSize="13" fontWeight="700" fill={outTone.color} fontFamily="var(--font-mono)">
              {isValid ? "Ticket (Clean)" : "ValidationError"}
            </text>
            <line x1="482" y1="69" x2="652" y2="69" stroke={outTone.stroke} strokeOpacity="0.35" />

            {mode === "valid" && (
              <>
                <text x="482" y="94" fontSize="12" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'id: "T-104"'}
                </text>
                <text x="482" y="118" fontSize="12" fill="var(--success)" fontWeight="600" fontFamily="var(--font-mono)">
                  {"priority: 2  # int"}
                </text>
                <text x="482" y="142" fontSize="12" fill="var(--success)" fontWeight="600" fontFamily="var(--font-mono)">
                  {'title: "ขอใบเสร็จ"'}
                </text>
                <text x="482" y="166" fontSize="12" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'email: "a@b.co"'}
                </text>
                <rect x="482" y="188" width="170" height="30" rx="8" fill="var(--surface)" stroke="var(--success)" />
                <text x="567" y="207" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--success)" fontFamily="var(--font-sans)">
                  ผ่านด่าน · พร้อมใช้งาน
                </text>
              </>
            )}

            {mode === "invalid" && (
              <>
                <text x="482" y="94" fontSize="12" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                  1. id: min_length=1
                </text>
                <text x="482" y="120" fontSize="12" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                  2. priority: le=5
                </text>
                <text x="482" y="146" fontSize="12" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                  3. title: min_length=3
                </text>
                <rect x="482" y="188" width="170" height="30" rx="8" fill="var(--surface)" stroke="var(--danger)" />
                <text x="567" y="207" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-sans)">
                  ถูกปฏิเสธ · 3 รายการ
                </text>
              </>
            )}

            {mode === "spaces" && (
              <>
                <text x="482" y="94" fontSize="12" fill="var(--warning)" fontWeight="600" fontFamily="var(--font-mono)">
                  Field(min=3): หลุดผ่าน!
                </text>
                <text x="482" y="120" fontSize="12" fill="var(--danger)" fontWeight="600" fontFamily="var(--font-mono)">
                  {'strip() → "" (ว่าง)'}
                </text>
                <text x="482" y="146" fontSize="12" fill="var(--fg)" fontFamily="var(--font-sans)">
                  ดักไว้ได้ด้วย validator
                </text>
                <rect x="482" y="188" width="170" height="30" rx="8" fill="var(--surface)" stroke="var(--danger)" />
                <text x="567" y="207" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-sans)">
                  สกัดขยะช่องว่างสำเร็จ
                </text>
              </>
            )}
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
/* 2. TicketPipelineVisual (D004 — ticket-pipeline)                           */
/* ========================================================================== */

interface PipelineStage {
  id: number;
  shortTitle: string;
  subLabel: string;
  badge: string;
  line1: string;
  line2: string;
  line3: string;
  caption: string;
  tone: "brand" | "cyan" | "success";
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 0,
    shortTitle: "1. Raw Ticket",
    subLabel: "รับข้อมูลดิบ",
    badge: "Ingest · UTF-8",
    line1: '{"id": "TK-09", "prio": "HIGH",',
    line2: ' "msg": "  ใบเสร็จผิดยอด!!\\nขอแก้ไขด่วน  "}',
    line3: "ปัญหา: ช่องว่างเกิน · ขึ้นบรรทัดใหม่ · ตัวพิมพ์ไม่สม่ำเสมอ",
    caption: "ขั้นที่ 1 (Raw Ticket): ข้อมูลจริงจากลูกค้ามักมีช่องว่างส่วนเกิน ตัวพิมพ์ใหญ่-เล็กปนกัน และอักขระขึ้นบรรทัดใหม่ติดมาด้วย",
    tone: "brand",
  },
  {
    id: 1,
    shortTitle: "2. Clean & Norm",
    subLabel: "ทำความสะอาด",
    badge: "strip · lower · NFC",
    line1: '{"id": "TK-09", "prio": "high",',
    line2: ' "msg": "ใบเสร็จผิดยอด!! ขอแก้ไขด่วน"}',
    line3: "ผลลัพธ์: ตัดช่องว่างหัวท้าย · ยุบ \\n · แปลง prio เป็นตัวเล็ก",
    caption: "ขั้นที่ 2 (Clean & Normalize): จัดรูปข้อความไทยแบบ Unicode NFC ยุบช่องว่างซ้ำ และแปลง enum ให้เป็นมาตรฐานเดียวกันก่อนตรวจสอบ",
    tone: "cyan",
  },
  {
    id: 2,
    shortTitle: "3. Validate",
    subLabel: "ตรวจ Schema",
    badge: "Pydantic BaseModel",
    line1: 'Ticket(id="TK-09", prio="high",',
    line2: '       msg="ใบเสร็จผิดยอด!! ขอแก้ไขด่วน")',
    line3: "ตรวจผ่าน: ครบทุกฟิลด์ · type ถูกต้อง · ไม่ใช่ข้อความว่าง",
    caption: "ขั้นที่ 3 (Pydantic Validate): บังคับใช้สัญญาข้อมูล (Data Contract) แยกแถวที่สมบูรณ์ออกจากแถวที่เสียหายอย่างชัดเจน",
    tone: "brand",
  },
  {
    id: 3,
    shortTitle: "4. JSONL / DLQ",
    subLabel: "แยกปลายทาง",
    badge: "Valid + Quarantine",
    line1: 'valid.jsonl      ← +1 แถว (พร้อมเข้า AI Pipeline)',
    line2: 'quarantine.jsonl ← แถวที่พัง (เก็บพร้อมเหตุผล error)',
    line3: "Pipeline ไม่ล่มกลางคัน และย้อนกลับมาซ่อมแถวที่ถูกกักกันได้",
    caption: "ขั้นที่ 4 (Validated JSONL / Quarantine): แถวที่ผ่านถูกเขียนลง valid.jsonl ส่วนแถวที่ผิดพลาดจะถูกแยกไป quarantine.jsonl โดยไม่ทำให้ทั้งงานพัง",
    tone: "success",
  },
];

export function TicketPipelineVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [step, setStep] = useState(0);
  const current = PIPELINE_STAGES[step];
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const stageCenters = [88, 256, 424, 592];
  const activeCenterX = stageCenters[step];
  const markerId = `${uid}-pipe-arrow`;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกขั้นตอนใน Ticket Pipeline" className="flex flex-wrap gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const active = stage.id === step;
          return (
            <button
              key={stage.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setStep(stage.id)}
            >
              {stage.shortTitle}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 270" className="block h-auto w-full" role="img" aria-label="แผนภาพ Ticket Pipeline 4 ขั้นตอน">
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
          </defs>

          {/* Connecting lines between the 4 stages */}
          {[0, 1, 2].map((idx) => {
            const x1 = 18 + idx * 168 + 140;
            const x2 = 18 + (idx + 1) * 168 - 4;
            const reached = idx < step;
            return (
              <line
                key={idx}
                x1={x1}
                y1="62"
                x2={x2}
                y2="62"
                stroke={reached ? "var(--brand)" : "var(--line)"}
                strokeWidth={reached ? "2.5" : "2"}
                strokeDasharray={reached && !reduced ? "6 6" : undefined}
                className={reached ? flowClass : undefined}
                markerEnd={reached ? `url(#${markerId})` : undefined}
              />
            );
          })}

          {/* 4 Clickable Stage Nodes */}
          {PIPELINE_STAGES.map((stage, idx) => {
            const x = 18 + idx * 168;
            const isActive = idx === step;
            const isDone = idx < step;
            const fill = isActive ? "var(--brand-soft)" : isDone ? "var(--success-soft)" : "var(--surface)";
            const stroke = isActive ? "var(--brand)" : isDone ? "var(--success)" : "var(--line)";
            const titleColor = isActive ? "var(--brand-ink)" : isDone ? "var(--success)" : "var(--fg)";

            return (
              <g
                key={stage.id}
                role="button"
                tabIndex={0}
                aria-label={`ดูขั้นตอน ${stage.shortTitle}`}
                aria-pressed={isActive}
                onClick={() => setStep(stage.id)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(stage.id))}
                style={{ cursor: "pointer" }}
              >
                {isActive && !reduced ? (
                  <rect
                    x={x - 3}
                    y="23"
                    width="146"
                    height="78"
                    rx="14"
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="2"
                    className="svg-pulse"
                  />
                ) : null}
                <rect
                  x={x}
                  y="26"
                  width="140"
                  height="72"
                  rx="12"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isActive ? "2" : "1.5"}
                  className={txClass}
                />
                <text x={x + 70} y="55" textAnchor="middle" fontSize="13" fontWeight="700" fill={titleColor} fontFamily="var(--font-mono)">
                  {stage.shortTitle}
                </text>
                <text x={x + 70} y="78" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                  {stage.subLabel}
                </text>
              </g>
            );
          })}

          {/* Drop indicator from active stage to payload inspector */}
          <line
            x1={activeCenterX}
            y1="98"
            x2={activeCenterX}
            y2="132"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
          />
          <circle cx={activeCenterX} cy="134" r="4" fill="var(--brand)" className={txClass} />

          {/* Live Payload Transformation Card */}
          <rect x="18" y="136" width="644" height="118" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" />

          {/* Header inside inspector */}
          <text x="34" y="160" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            สภาพข้อมูลที่ขั้น {current.shortTitle}
          </text>
          <rect x="492" y="145" width="154" height="24" rx="8" fill="var(--brand-soft)" stroke="var(--brand)" strokeOpacity="0.4" />
          <text x="569" y="161" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            {current.badge}
          </text>

          <line x1="34" y1="173" x2="646" y2="173" stroke="var(--hair)" />

          {/* Payload preview lines */}
          {step === 3 ? (
            <>
              <rect x="34" y="182" width="296" height="32" rx="8" fill="var(--success-soft)" stroke="var(--success)" />
              <text x="46" y="202" fontSize="12" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                valid.jsonl (+1 record)
              </text>
              <rect x="346" y="182" width="300" height="32" rx="8" fill="var(--danger-soft)" stroke="var(--danger)" />
              <text x="358" y="202" fontSize="12" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                quarantine.jsonl (bad rows isolated)
              </text>
              <text x="34" y="238" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                {current.line3}
              </text>
            </>
          ) : (
            <>
              <text x="34" y="196" fontSize="12" fontWeight="500" fill="var(--fg)" fontFamily="var(--font-mono)">
                {current.line1}
              </text>
              <text x="34" y="216" fontSize="12" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                {current.line2}
              </text>
              <text x="34" y="241" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                {current.line3}
              </text>
            </>
          )}
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {current.caption}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 3. AsyncioLoopVisual (D017 — asyncio-loop)                                 */
/* ========================================================================== */

type ConcurrencyMode = "sync" | "async";

export function AsyncioLoopVisual({ reduced = false }: VisualProps) {
  const [mode, setMode] = useState<ConcurrencyMode>("async");
  const isAsync = mode === "async";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  // Timeline scale: x=120 is 0.0s, 1.0s = 165px -> 3.0s = 615
  const x0 = 120;
  const pxPerSec = 165;

  const tasks = isAsync
    ? [
        { name: "API Call 1", y: 50, cpu1X: x0, cpu1W: 20, ioX: x0 + 20, ioW: 142, cpu2X: x0 + 162, cpu2W: 16 },
        { name: "API Call 2", y: 94, cpu1X: x0 + 22, cpu1W: 20, ioX: x0 + 42, ioW: 132, cpu2X: x0 + 178, cpu2W: 16 },
        { name: "API Call 3", y: 138, cpu1X: x0 + 44, cpu1W: 20, ioX: x0 + 64, ioW: 126, cpu2X: x0 + 194, cpu2W: 16 },
      ]
    : [
        { name: "API Call 1", y: 50, cpu1X: x0, cpu1W: 20, ioX: x0 + 20, ioW: 130, cpu2X: x0 + 150, cpu2W: 15 },
        { name: "API Call 2", y: 94, cpu1X: x0 + 165, cpu1W: 20, ioX: x0 + 185, ioW: 130, cpu2X: x0 + 315, cpu2W: 15 },
        { name: "API Call 3", y: 138, cpu1X: x0 + 330, cpu1W: 20, ioX: x0 + 350, ioW: 130, cpu2X: x0 + 480, cpu2W: 15 },
      ];

  const finishX = isAsync ? x0 + 210 : x0 + 495;

  const captionText = isAsync
    ? "asyncio (Concurrent ~1.1s): ทันทีที่ Call 1 เจอ await Event Loop จะสลับไปยิง Call 2 และ Call 3 ทันที ทำให้รอ I/O ขนานกัน จบทั้ง 3 งานใน ~1.1 วินาที"
    : "Sync (Sequential ~3.0s): โปรแกรมหยุดรอ (block) จนกว่า Call 1 จะตอบกลับครบ 1 วินาที จึงค่อยเริ่ม Call 2 และ 3 รวมใช้เวลาราว ~3.0 วินาทีโดย CPU ว่างงานเกือบตลอด";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับโหมด Sync กับ asyncio" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!isAsync}
          className={!isAsync ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isAsync ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("sync")}
        >
          Sync (Sequential ~3.0s)
        </button>
        <button
          type="button"
          aria-pressed={isAsync}
          className={isAsync ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isAsync ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("async")}
        >
          asyncio (Concurrent ~1.1s)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 270" className="block h-auto w-full" role="img" aria-label="แผนภาพเปรียบเทียบเวลาทำงานระหว่าง Sync และ asyncio">
          {/* Header & summary pill */}
          <text x="16" y="28" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            ไทม์ไลน์การเรียก 3 API
          </text>
          <rect
            x="456"
            y="10"
            width="208"
            height="26"
            rx="13"
            fill={isAsync ? "var(--success-soft)" : "var(--warning-soft)"}
            stroke={isAsync ? "var(--success)" : "var(--warning)"}
            className={txClass}
          />
          <text
            x="560"
            y="27"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={isAsync ? "var(--success)" : "var(--warning)"}
            fontFamily="var(--font-mono)"
          >
            {isAsync ? "Total ~1.1s (2.7x faster)" : "Total ~3.0s (Blocking)"}
          </text>

          {/* Vertical time gridlines */}
          {[0, 1, 2, 3].map((sec) => {
            const gx = x0 + sec * pxPerSec;
            return (
              <g key={sec}>
                <line x1={gx} y1="42" x2={gx} y2="228" stroke="var(--hair)" strokeWidth="1" />
                <text x={gx} y="242" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-mono)">
                  {sec}.0s
                </text>
              </g>
            );
          })}

          {/* 3 API Task Lanes */}
          {tasks.map((task) => (
            <g key={task.name}>
              <text x="16" y={task.y + 20} fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                {task.name}
              </text>
              {/* Lane track */}
              <rect x={x0} y={task.y} width="540" height="30" rx="8" fill="var(--surface)" stroke="var(--hair)" />

              {/* CPU start slice */}
              <rect x={task.cpu1X} y={task.y + 3} width={task.cpu1W} height="24" rx="5" fill="var(--brand)" className={txClass} />

              {/* I/O wait slice */}
              <rect
                x={task.ioX}
                y={task.y + 3}
                width={task.ioW}
                height="24"
                rx="5"
                fill={isAsync ? "var(--cyan-soft)" : "var(--warning-soft)"}
                stroke={isAsync ? "var(--cyan)" : "var(--warning)"}
                strokeWidth="1.25"
                className={txClass}
              />
              <line
                x1={task.ioX + 6}
                y1={task.y + 15}
                x2={task.ioX + task.ioW - 6}
                y2={task.y + 15}
                stroke={isAsync ? "var(--cyan)" : "var(--warning)"}
                strokeWidth="2"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
              />
              <text
                x={task.ioX + task.ioW / 2}
                y={task.y + 19}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={isAsync ? "var(--cyan)" : "var(--warning)"}
                fontFamily="var(--font-mono)"
                style={{ paintOrder: "stroke", stroke: isAsync ? "var(--cyan-soft)" : "var(--warning-soft)", strokeWidth: 4 }}
              >
                {isAsync ? "await I/O" : "blocked"}
              </text>

              {/* CPU resume/done slice */}
              <rect x={task.cpu2X} y={task.y + 3} width={task.cpu2W} height="24" rx="5" fill="var(--success)" className={txClass} />
            </g>
          ))}

          {/* Event Loop Lane */}
          <g>
            <text x="16" y="206" fontSize="12" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              Event Loop
            </text>
            <rect x={x0} y="186" width="540" height="32" rx="8" fill="var(--surface)" stroke="var(--line)" />

            {isAsync ? (
              <>
                <rect x={x0} y="190" width="20" height="24" rx="4" fill="var(--brand)" className={txClass} />
                <rect x={x0 + 22} y="190" width="20" height="24" rx="4" fill="var(--brand)" className={txClass} />
                <rect x={x0 + 44} y="190" width="20" height="24" rx="4" fill="var(--brand)" className={txClass} />
                <text x={x0 + 114} y="206" textAnchor="middle" fontSize="12" fill="var(--cyan)" fontWeight="600" fontFamily="var(--font-sans)">
                  รอ I/O พร้อมกัน
                </text>
                <rect x={x0 + 162} y="190" width="15" height="24" rx="4" fill="var(--success)" className={txClass} />
                <rect x={x0 + 178} y="190" width="15" height="24" rx="4" fill="var(--success)" className={txClass} />
                <rect x={x0 + 194} y="190" width="16" height="24" rx="4" fill="var(--success)" className={txClass} />
                <text x={x0 + 368} y="206" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--success)" fontFamily="var(--font-sans)">
                  ประหยัดเวลารอ ~1.9s → ทำงานอื่นต่อได้!
                </text>
              </>
            ) : (
              <>
                {[0, 165, 330].map((offset) => (
                  <g key={offset}>
                    <rect x={x0 + offset} y="190" width="20" height="24" rx="4" fill="var(--brand)" className={txClass} />
                    <text x={x0 + offset + 85} y="206" textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
                      รอว่าง...
                    </text>
                    <rect x={x0 + offset + 150} y="190" width="15" height="24" rx="4" fill="var(--success)" className={txClass} />
                  </g>
                ))}
              </>
            )}
          </g>

          {/* Finish Marker Line */}
          <line
            x1={finishX}
            y1="42"
            x2={finishX}
            y2="226"
            stroke={isAsync ? "var(--success)" : "var(--warning)"}
            strokeWidth="2"
            strokeDasharray="4 4"
            className={txClass}
          />

          {/* Compact Legend */}
          <g transform="translate(16, 250)">
            <rect x="0" y="2" width="12" height="12" rx="3" fill="var(--brand)" />
            <text x="18" y="13" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
              ส่งคำขอ (CPU)
            </text>
            <rect x="122" y="2" width="12" height="12" rx="3" fill={isAsync ? "var(--cyan-soft)" : "var(--warning-soft)"} stroke={isAsync ? "var(--cyan)" : "var(--warning)"} />
            <text x="140" y="13" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
              {isAsync ? "await I/O (สลับงานได้)" : "รอ I/O (บล็อกเธรด)"}
            </text>
            <rect x="304" y="2" width="12" height="12" rx="3" fill="var(--success)" />
            <text x="322" y="13" fontSize="12" fill="var(--muted)" fontFamily="var(--font-sans)">
              รับผลลัพธ์เสร็จ
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
