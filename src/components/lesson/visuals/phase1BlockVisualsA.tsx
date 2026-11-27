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
/* 1. CollectionsPipelineVisual (collections-pipeline)                        */
/* ========================================================================== */

interface CollectionStepInfo {
  id: number;
  btnLabel: string;
  label: string;
  subLabel: string;
  badge: string;
  caption: string;
}

const COLLECTION_STEPS: CollectionStepInfo[] = [
  {
    id: 0,
    btnLabel: "1. Raw List (6)",
    label: "1. Raw List (6)",
    subLabel: "ข้อความดิบจากแชต",
    badge: "list · len=6",
    caption:
      "ขั้นที่ 1 (Raw List): ข้อมูลดิบจากคิวแชต 6 รายการ มักปนทั้งช่องว่างเกิน หัวท้ายว่างเปล่า และข้อความซ้ำซ้อน",
  },
  {
    id: 1,
    btnLabel: "2. Filter & Strip",
    label: "2. Filter & Strip",
    subLabel: "ตัดช่องว่าง · คัดแถวว่าง",
    badge: "list comp · len=4",
    caption:
      'ขั้นที่ 2 (Filter & Strip): ใช้ list comprehension เรียก .strip() และกรองแถวว่าง ("", "   ") ทิ้ง เหลือ 4 รายการที่สะอาดพร้อมนับ',
  },
  {
    id: 2,
    btnLabel: "3. Dedupe (set) & Lookup (dict)",
    label: "3. set & dict",
    subLabel: "ลบซ้ำ + นับความถี่ O(1)",
    badge: "set(3) + dict(O(1))",
    caption:
      "ขั้นที่ 3 (Dedupe & Lookup): แปลงเป็น set เพื่อตัดข้อความซ้ำเหลือ 3 หัวข้อไม่ซ้ำ และสรุปความถี่ใน dict ให้ค้นหาได้เร็วระดับ O(1)",
  },
];

const RAW_TICKET_ITEMS: { text: string; tag: string; tone: "warn" | "danger" | "neutral" }[] = [
  { text: '" ขอใบเสร็จ "', tag: "ช่องว่าง", tone: "warn" },
  { text: '""', tag: "ว่าง!", tone: "danger" },
  { text: '"คืนเงิน"', tag: "ปกติ", tone: "neutral" },
  { text: '"   "', tag: "ว่าง!", tone: "danger" },
  { text: '"ขอใบเสร็จ"', tag: "ซ้ำ", tone: "warn" },
  { text: '"ลืมรหัสผ่าน"', tag: "ปกติ", tone: "neutral" },
];

export function CollectionsPipelineVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [step, setStep] = useState(0);
  const current = COLLECTION_STEPS[step];
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const stageCenters = [115, 340, 565];
  const activeCenterX = stageCenters[step];
  const arrowId = `${uid}-col-arrow`;
  const arrowSuccessId = `${uid}-col-success`;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกขั้นตอนของ Collections Pipeline" className="flex flex-wrap gap-2">
        {COLLECTION_STEPS.map((item) => {
          const active = item.id === step;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setStep(item.id)}
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
          aria-label="แผนภาพการแปลงข้อมูลด้วย list, set และ dict 3 ขั้นตอน"
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={arrowSuccessId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Horizontal connectors between the 3 stages */}
          {[0, 1].map((idx) => {
            const x1 = 18 + idx * 225 + 194;
            const x2 = 18 + (idx + 1) * 225 - 4;
            const reached = idx < step;
            return (
              <line
                key={idx}
                x1={x1}
                y1="54"
                x2={x2}
                y2="54"
                stroke={reached ? "var(--brand)" : "var(--line)"}
                strokeWidth={reached ? "2.5" : "2"}
                strokeDasharray={reached && !reduced ? "6 6" : undefined}
                className={reached ? flowClass : undefined}
                markerEnd={reached ? `url(#${arrowId})` : undefined}
              />
            );
          })}

          {/* 3 Clickable Stage Cards */}
          {COLLECTION_STEPS.map((stage, idx) => {
            const x = 18 + idx * 225;
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
                aria-label={`ดูขั้นตอน ${stage.label}`}
                aria-pressed={isActive}
                onClick={() => setStep(stage.id)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(stage.id))}
                style={{ cursor: "pointer" }}
              >
                {isActive && !reduced ? (
                  <rect
                    x={x - 3}
                    y="19"
                    width="200"
                    height="70"
                    rx="14"
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="2"
                    className="svg-pulse"
                  />
                ) : null}
                <rect
                  x={x}
                  y="22"
                  width="194"
                  height="64"
                  rx="12"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isActive ? "2" : "1.5"}
                  className={txClass}
                />
                <text
                  x={x + 97}
                  y="48"
                  textAnchor="middle"
                  fontSize="12.5"
                  fontWeight="700"
                  fill={titleColor}
                  fontFamily="var(--font-mono)"
                >
                  {stage.label}
                </text>
                <text
                  x={x + 97}
                  y="70"
                  textAnchor="middle"
                  fontSize="12"
                  fill="var(--muted)"
                  fontFamily="var(--font-sans)"
                >
                  {stage.subLabel}
                </text>
              </g>
            );
          })}

          {/* Drop connector from active stage */}
          <line
            x1={activeCenterX}
            y1="86"
            x2={activeCenterX}
            y2="114"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
          />
          <circle cx={activeCenterX} cy="116" r="4" fill="var(--brand)" className={txClass} />

          {/* Live Data Inspector Panel */}
          <rect x="18" y="118" width="644" height="148" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" />

          <text x="34" y="142" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            ข้อมูลที่ขั้น {current.label}
          </text>
          <rect x="478" y="127" width="168" height="24" rx="8" fill="var(--brand-soft)" stroke="var(--brand)" strokeOpacity="0.4" />
          <text
            x="562"
            y="143"
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="600"
            fill="var(--brand-ink)"
            fontFamily="var(--font-mono)"
          >
            {current.badge}
          </text>
          <line x1="34" y1="156" x2="646" y2="156" stroke="var(--hair)" />

          {/* Step 0: Raw List (6) */}
          {step === 0 && (
            <g>
              {RAW_TICKET_ITEMS.map((item, idx) => {
                const col = idx % 3;
                const row = Math.floor(idx / 3);
                const bx = 34 + col * 208;
                const by = 168 + row * 44;
                const fill =
                  item.tone === "danger"
                    ? "var(--danger-soft)"
                    : item.tone === "warn"
                      ? "var(--warning-soft)"
                      : "var(--surface-2)";
                const stroke =
                  item.tone === "danger"
                    ? "var(--danger)"
                    : item.tone === "warn"
                      ? "var(--warning)"
                      : "var(--line)";
                const tagColor =
                  item.tone === "danger"
                    ? "var(--danger)"
                    : item.tone === "warn"
                      ? "var(--warning)"
                      : "var(--muted)";

                return (
                  <g key={`${item.text}-${idx}`}>
                    <rect x={bx} y={by} width="196" height="34" rx="8" fill={fill} stroke={stroke} strokeWidth="1.25" />
                    <text x={bx + 12} y={by + 21} fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                      {item.text}
                    </text>
                    <text
                      x={bx + 186}
                      y={by + 21}
                      textAnchor="end"
                      fontSize="11"
                      fontWeight="600"
                      fill={tagColor}
                      fontFamily="var(--font-sans)"
                    >
                      {item.tag}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Step 1: Filter & Strip */}
          {step === 1 && (
            <g>
              <rect x="34" y="166" width="420" height="88" rx="10" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeWidth="1.25" />
              <text x="48" y="185" fontSize="11.5" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
                cleaned = [q.strip() for q in raw if q.strip()]
              </text>

              {[
                { label: '"ขอใบเสร็จ"', x: 48, y: 196, dup: false },
                { label: '"คืนเงิน"', x: 252, y: 196, dup: false },
                { label: '"ขอใบเสร็จ" (ซ้ำ)', x: 48, y: 224, dup: true },
                { label: '"ลืมรหัสผ่าน"', x: 252, y: 224, dup: false },
              ].map((pill, i) => (
                <g key={i}>
                  <rect
                    x={pill.x}
                    y={pill.y}
                    width="190"
                    height="22"
                    rx="6"
                    fill={pill.dup ? "var(--warning-soft)" : "var(--surface)"}
                    stroke={pill.dup ? "var(--warning)" : "var(--cyan)"}
                    strokeWidth="1"
                  />
                  <text
                    x={pill.x + 10}
                    y={pill.y + 15}
                    fontSize="11.5"
                    fontWeight="600"
                    fill={pill.dup ? "var(--warning)" : "var(--fg)"}
                    fontFamily="var(--font-mono)"
                  >
                    {pill.label}
                  </text>
                </g>
              ))}

              <rect x="468" y="166" width="178" height="88" rx="10" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.25" />
              <text x="482" y="186" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                คัดทิ้ง (2 แถวว่าง)
              </text>
              <text x="482" y="212" fontSize="11" fill="var(--danger)" fontFamily="var(--font-mono)" textDecoration="line-through">
                {`""  (ความยาว 0)`}
              </text>
              <text x="482" y="236" fontSize="11" fill="var(--danger)" fontFamily="var(--font-mono)" textDecoration="line-through">
                {`"   " (ช่องว่างล้วน)`}
              </text>
            </g>
          )}

          {/* Step 2: Dedupe (set) & Lookup (dict) */}
          {step === 2 && (
            <g>
              {/* Left: set */}
              <rect x="34" y="166" width="268" height="88" rx="10" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.25" />
              <text x="48" y="185" fontSize="11.5" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                unique = set(cleaned) · ลบซ้ำ
              </text>
              {[
                { text: '"ขอใบเสร็จ"', x: 48, y: 196, w: 118 },
                { text: '"คืนเงิน"', x: 174, y: 196, w: 114 },
                { text: '"ลืมรหัสผ่าน"', x: 48, y: 224, w: 132 },
              ].map((s) => (
                <g key={s.text}>
                  <rect x={s.x} y={s.y} width={s.w} height="22" rx="6" fill="var(--surface)" stroke="var(--brand)" strokeOpacity="0.5" />
                  <text x={s.x + s.w / 2} y={s.y + 15} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                    {s.text}
                  </text>
                </g>
              ))}
              <text x="192" y="239" fontSize="11" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                len=3
              </text>

              {/* Flow arrow from set to dict */}
              <line
                x1="304"
                y1="210"
                x2="342"
                y2="210"
                stroke="var(--success)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowSuccessId})`}
              />

              {/* Right: dict */}
              <rect x="348" y="166" width="298" height="88" rx="10" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.25" />
              <text x="362" y="185" fontSize="11.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                counts: dict[str, int] · ค้นหา O(1)
              </text>
              <text x="362" y="206" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
                {'"ขอใบเสร็จ"   → 2  (พบบ่อยสุด)'}
              </text>
              <text x="362" y="226" fontSize="12" fill="var(--fg)" fontFamily="var(--font-mono)">
                {'"คืนเงิน"     → 1'}
              </text>
              <text x="362" y="245" fontSize="12" fill="var(--fg)" fontFamily="var(--font-mono)">
                {'"ลืมรหัสผ่าน" → 1'}
              </text>
            </g>
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
/* 2. NestedSchemaVisual (nested-schema)                                      */
/* ========================================================================== */

type NestedMode = "valid" | "error";

export function NestedSchemaVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<NestedMode>("valid");
  const isValid = mode === "valid";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowBrand = `${uid}-ns-brand`;
  const arrowOut = `${uid}-ns-out`;
  const outStroke = isValid ? "var(--success)" : "var(--danger)";
  const outFill = isValid ? "var(--success-soft)" : "var(--danger-soft)";

  const captionText = isValid
    ? "Valid Nested JSON: Pydantic ตรวจโมเดลลูก (Customer และ items: list[Item]) ทีละชั้น จากนั้น @model_validator ตรวจข้ามฟิลด์ว่า total (1200) ตรงกับผลรวมราคาสินค้า ก่อนส่งออกเป็น JSON"
    : "Cross-Field Error: ถึงแม้ฟิลด์ย่อย Customer และ items จะมีชนิดข้อมูลถูกต้องครบทุกตัว แต่ @model_validator ตรวจพบว่า total (999) ไม่เท่ากับผลรวม items (1200) จึงโยน ValidationError ทันที";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกโหมดตรวจสอบ Nested Schema" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={isValid}
          className={isValid ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isValid ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("valid")}
        >
          Valid Nested JSON
        </button>
        <button
          type="button"
          aria-pressed={!isValid}
          className={!isValid ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isValid ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("error")}
        >
          Cross-Field Error (@model_validator)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพโครงสร้าง Nested BaseModel และการตรวจข้ามฟิลด์ด้วย model_validator"
        >
          <defs>
            <marker id={arrowBrand} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={arrowOut} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={outStroke} />
            </marker>
          </defs>

          {/* Root Node: SupportOrder */}
          <g>
            <rect
              x="16"
              y="26"
              width="174"
              height="102"
              rx="12"
              fill="var(--surface)"
              stroke={isValid ? "var(--brand)" : "var(--danger)"}
              strokeWidth="1.75"
              className={txClass}
            />
            <rect x="26" y="36" width="112" height="22" rx="6" fill="var(--brand-soft)" />
            <text x="82" y="51" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              SupportOrder
            </text>
            <text x="28" y="77" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
              {'order_id: "ORD-88"'}
            </text>
            <rect
              x="24"
              y="88"
              width="158"
              height="26"
              rx="6"
              fill={isValid ? "var(--success-soft)" : "var(--danger-soft)"}
              stroke={outStroke}
              strokeWidth="1"
              className={txClass}
            />
            <text x="32" y="105" fontSize="11.5" fontWeight="700" fill={outStroke} fontFamily="var(--font-mono)">
              {isValid ? "total: 1200  ✓" : "total: 999   ✗"}
            </text>
          </g>

          {/* Branch paths from SupportOrder to Customer & items */}
          <path
            d="M 190 56 C 210 56, 210 56, 228 56"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowBrand})`}
          />
          <path
            d="M 190 96 C 210 96, 208 152, 228 152"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowBrand})`}
          />

          {/* Child 1: Customer */}
          <g>
            <rect x="234" y="18" width="204" height="78" rx="12" fill="var(--surface)" stroke="var(--success)" strokeWidth="1.5" />
            <text x="246" y="38" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              customer: Customer
            </text>
            <rect x="388" y="25" width="40" height="18" rx="5" fill="var(--success-soft)" />
            <text x="408" y="38" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
              PASS
            </text>
            <text x="246" y="60" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
              {'name: "นิภา" · tier: "pro"'}
            </text>
            <text x="246" y="80" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-mono)">
              {'email: "nipa@shop.th"'}
            </text>
          </g>

          {/* Child 2: items: list[Item] */}
          <g>
            <rect x="234" y="108" width="204" height="92" rx="12" fill="var(--surface)" stroke="var(--success)" strokeWidth="1.5" />
            <text x="246" y="128" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              items: list[Item]
            </text>
            <rect x="388" y="115" width="40" height="18" rx="5" fill="var(--success-soft)" />
            <text x="408" y="128" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
              PASS
            </text>
            <text x="246" y="149" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
              {'[0] sku="A1", price=700'}
            </text>
            <text x="246" y="168" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
              {'[1] sku="B2", price=500'}
            </text>
            <rect x="246" y="175" width="142" height="18" rx="5" fill="var(--cyan-soft)" />
            <text x="254" y="188" fontSize="11" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
              sum(price) = 1200
            </text>
          </g>

          {/* Cross-field feeds into @model_validator */}
          <path
            d="M 103 128 L 103 216"
            fill="none"
            stroke={outStroke}
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowOut})`}
          />
          <path
            d="M 336 200 L 336 216"
            fill="none"
            stroke={outStroke}
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowOut})`}
          />

          {/* Bottom Gate: @model_validator */}
          <g>
            <rect
              x="16"
              y="220"
              width="422"
              height="44"
              rx="10"
              fill={outFill}
              stroke={outStroke}
              strokeWidth="1.75"
              className={txClass}
            />
            <text x="30" y="239" fontSize="11.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              @model_validator(mode=&quot;after&quot;)
            </text>
            <text x="30" y="256" fontSize="11.5" fontWeight="700" fill={outStroke} fontFamily="var(--font-mono)">
              {isValid ? "total (1200) == sum(items) (1200) → ผ่าน" : "total (999) != sum(items) (1200) → ValueError"}
            </text>
          </g>

          {/* Flow arrow into Right Output Panel */}
          <path
            d="M 438 242 C 458 242, 452 142, 472 142"
            fill="none"
            stroke={outStroke}
            strokeWidth="2.5"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowOut})`}
          />

          {/* Right Output Card */}
          <g>
            <rect
              x="478"
              y="18"
              width="188"
              height="246"
              rx="12"
              fill={outFill}
              stroke={outStroke}
              strokeWidth="1.75"
              className={txClass}
            />
            <text x="492" y="42" fontSize="12.5" fontWeight="700" fill={outStroke} fontFamily="var(--font-mono)">
              {isValid ? "model_dump_json()" : "ValidationError"}
            </text>
            <line x1="492" y1="52" x2="652" y2="52" stroke={outStroke} strokeOpacity="0.35" />

            {isValid ? (
              <>
                <text x="492" y="72" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-mono)">
                  {"{"}
                </text>
                <text x="500" y="90" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"order_id": "ORD-88",'}
                </text>
                <text x="500" y="108" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"customer": {'}
                </text>
                <text x="510" y="125" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"name": "นิภา",'}
                </text>
                <text x="510" y="142" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"tier": "pro"'}
                </text>
                <text x="500" y="159" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {"},"}
                </text>
                <text x="500" y="176" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"items": [2 items],'}
                </text>
                <text x="500" y="193" fontSize="11.5" fill="var(--success)" fontWeight="700" fontFamily="var(--font-mono)">
                  {'"total": 1200'}
                </text>
                <text x="492" y="209" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-mono)">
                  {"}"}
                </text>
                <rect x="492" y="220" width="160" height="30" rx="8" fill="var(--surface)" stroke="var(--success)" />
                <text x="572" y="239" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--success)" fontFamily="var(--font-sans)">
                  JSON ถูกต้องพร้อมส่ง
                </text>
              </>
            ) : (
              <>
                <text x="492" y="76" fontSize="11.5" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                  ✓ Customer (type ok)
                </text>
                <text x="492" y="98" fontSize="11.5" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                  ✓ items[0..1] (ok)
                </text>
                <rect x="490" y="114" width="164" height="88" rx="8" fill="var(--surface)" stroke="var(--danger)" strokeWidth="1.25" />
                <text x="500" y="135" fontSize="11.5" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  ✗ model_validator
                </text>
                <text x="500" y="156" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                  ยอดรวม 999 ไม่ตรงกับ
                </text>
                <text x="500" y="175" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                  ผลรวมสินค้า 1200 บาท
                </text>
                <text x="500" y="193" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  type: value_error
                </text>
                <rect x="492" y="220" width="160" height="30" rx="8" fill="var(--surface)" stroke="var(--danger)" />
                <text x="572" y="239" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-sans)">
                  บล็อกก่อนเขียนลง DB
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
/* 3. JsonlStreamVisual (jsonl-stream)                                        */
/* ========================================================================== */

type StreamMode = "stream" | "array";

export function JsonlStreamVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<StreamMode>("stream");
  const isStream = mode === "stream";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowId = `${uid}-stream-arrow`;
  const accent = isStream ? "var(--success)" : "var(--danger)";
  const accentSoft = isStream ? "var(--success-soft)" : "var(--danger-soft)";

  const captionText = isStream
    ? "Streaming JSONL: ใช้ pathlib เปิดไฟล์และอ่านทีละบรรทัด (generator) จึงใช้ RAM คงที่เพียงไม่กี่ MB ไม่ว่าไฟล์จะมี 5 แสนหรือ 50 ล้านแถว"
    : "JSON Array (json.load): ต้องโหลดอาร์เรย์ทั้งไฟล์ขนาด 1.2 GB เข้าหน่วยความจำพร้อมสร้าง dict ทั้งหมดในครั้งเดียว ทำให้ RAM พุ่งชนเพดานจนเกิด MemoryError (OOM)";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เปรียบเทียบ JSON Array กับ Streaming JSONL" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!isStream}
          className={!isStream ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isStream ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("array")}
        >
          JSON Array (Load 100% into RAM)
        </button>
        <button
          type="button"
          aria-pressed={isStream}
          className={isStream ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isStream ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("stream")}
        >
          Streaming JSONL (1 line at a time)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 260"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพเปรียบเทียบการใช้ RAM ระหว่าง JSON Array กับ Streaming JSONL ผ่าน pathlib"
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={accent} />
            </marker>
          </defs>

          {/* Left: Disk File */}
          <g>
            <rect x="16" y="22" width="184" height="216" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
            <rect x="28" y="34" width="102" height="22" rx="6" fill="var(--brand-soft)" />
            <text x="79" y="49" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              pathlib.Path
            </text>
            <text x="28" y="74" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              {isStream ? "tickets.jsonl" : "tickets.json"}
            </text>
            <text x="28" y="92" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
              500,000 แถว (~1.2 GB)
            </text>

            {isStream ? (
              <g>
                {[
                  { y: 104, text: '{"id": 1, "q": "..."}', active: false },
                  { y: 130, text: '{"id": 2, "q": "..."}', active: true },
                  { y: 156, text: '{"id": 3, "q": "..."}', active: false },
                  { y: 182, text: '{"id": 4, "q": "..."}', active: false },
                ].map((row) => (
                  <g key={row.y}>
                    <rect
                      x="28"
                      y={row.y}
                      width="160"
                      height="21"
                      rx="5"
                      fill={row.active ? "var(--cyan-soft)" : "var(--surface-2)"}
                      stroke={row.active ? "var(--cyan)" : "var(--hair)"}
                      className={txClass}
                    />
                    <text
                      x="36"
                      y={row.y + 14}
                      fontSize="11"
                      fontWeight={row.active ? "700" : "500"}
                      fill={row.active ? "var(--cyan)" : "var(--muted)"}
                      fontFamily="var(--font-mono)"
                    >
                      {row.text}
                    </text>
                  </g>
                ))}
                <text x="108" y="224" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  ... 1 JSON ต่อ 1 บรรทัด
                </text>
              </g>
            ) : (
              <g>
                <rect
                  x="28"
                  y="106"
                  width="160"
                  height="116"
                  rx="8"
                  fill="var(--danger-soft)"
                  stroke="var(--danger)"
                  strokeWidth="1.5"
                  className={txClass}
                />
                <text x="40" y="128" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  {"["}
                </text>
                <text x="48" y="148" fontSize="11" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'{"id": 1}, {"id": 2},'}
                </text>
                <text x="48" y="166" fontSize="11" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {"... 500,000 items ..."}
                </text>
                <text x="40" y="186" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  {"]"}
                </text>
                <text x="108" y="210" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-sans)">
                  ต้องอ่านครบทั้งก้อน
                </text>
              </g>
            )}
          </g>

          {/* Center: Transfer Channel */}
          <g>
            <rect
              x="220"
              y="46"
              width="174"
              height="26"
              rx="8"
              fill={isStream ? "var(--cyan-soft)" : "var(--danger-soft)"}
              stroke={isStream ? "var(--cyan)" : "var(--danger)"}
              strokeOpacity="0.6"
              className={txClass}
            />
            <text
              x="307"
              y="63"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fill={isStream ? "var(--cyan)" : "var(--danger)"}
              fontFamily="var(--font-mono)"
            >
              {isStream ? "for line in p.open()" : "json.load(p.open())"}
            </text>

            {/* Animated stream lines */}
            {isStream ? (
              <g>
                <line
                  x1="204"
                  y1="130"
                  x2="404"
                  y2="130"
                  stroke="var(--success)"
                  strokeWidth="2.5"
                  strokeDasharray={reduced ? undefined : "6 6"}
                  className={flowClass}
                  markerEnd={`url(#${arrowId})`}
                />
                {/* Line packets */}
                {[
                  { x: 222, label: "L1" },
                  { x: 282, label: "L2" },
                  { x: 342, label: "L3" },
                ].map((pkt) => (
                  <g key={pkt.label}>
                    <rect
                      x={pkt.x}
                      y="114"
                      width="42"
                      height="32"
                      rx="7"
                      fill="var(--surface)"
                      stroke="var(--success)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={pkt.x + 21}
                      y="134"
                      textAnchor="middle"
                      fontSize="11.5"
                      fontWeight="700"
                      fill="var(--success)"
                      fontFamily="var(--font-mono)"
                    >
                      {pkt.label}
                    </text>
                  </g>
                ))}
                <text x="307" y="174" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--success)" fontFamily="var(--font-sans)">
                  ทยอยส่งทีละ 1 บรรทัด
                </text>
                <text x="307" y="194" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  yield json.loads(line)
                </text>
              </g>
            ) : (
              <g>
                <rect x="218" y="102" width="166" height="56" rx="10" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.5" />
                <line
                  x1="204"
                  y1="130"
                  x2="404"
                  y2="130"
                  stroke="var(--danger)"
                  strokeWidth="3.5"
                  strokeDasharray={reduced ? undefined : "6 6"}
                  className={flowClass}
                  markerEnd={`url(#${arrowId})`}
                />
                <rect x="244" y="114" width="116" height="32" rx="7" fill="var(--surface)" stroke="var(--danger)" strokeWidth="1.5" />
                <text x="302" y="134" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  1.2 GB ALL!
                </text>
                <text x="307" y="182" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-sans)">
                  โหลดทั้งหมดเข้า RAM ทีเดียว
                </text>
              </g>
            )}
          </g>

          {/* Right: RAM Usage Gauge */}
          <g>
            <rect
              x="412"
              y="22"
              width="252"
              height="216"
              rx="12"
              fill="var(--surface)"
              stroke={accent}
              strokeWidth="1.75"
              className={txClass}
            />
            <text x="428" y="45" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              RAM Monitor
            </text>
            <rect x="556" y="30" width="94" height="22" rx="6" fill={accentSoft} stroke={accent} strokeOpacity="0.6" className={txClass} />
            <text x="603" y="45" textAnchor="middle" fontSize="11" fontWeight="700" fill={accent} fontFamily="var(--font-mono)">
              {isStream ? "~2 MB (OK)" : "96% OOM!"}
            </text>

            {/* Chart frame */}
            <rect x="428" y="62" width="176" height="120" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
            {/* OOM Limit Line */}
            <line x1="428" y1="78" x2="604" y2="78" stroke="var(--danger)" strokeWidth="1.25" strokeDasharray="4 4" />
            <text x="434" y="74" fontSize="10" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
              RAM Limit (100%)
            </text>

            {/* Chart curve: red spike vs tiny steady green */}
            {isStream ? (
              <g>
                <path
                  d="M 432 180 L 432 170 L 470 169 L 510 171 L 550 169 L 600 170 L 600 180 Z"
                  fill="var(--success-soft)"
                  className={txClass}
                />
                <path
                  d="M 432 170 L 470 169 L 510 171 L 550 169 L 600 170"
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="2.5"
                  className={txClass}
                />
                <text x="516" y="132" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-sans)">
                  แรมนิ่งเรียบคงที่
                </text>
                <text x="516" y="150" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  O(1) memory
                </text>
              </g>
            ) : (
              <g>
                <path
                  d="M 432 180 L 460 168 L 495 142 L 535 104 L 575 74 L 600 68 L 600 180 Z"
                  fill="var(--danger-soft)"
                  className={txClass}
                />
                <path
                  d="M 432 180 L 460 168 L 495 142 L 535 104 L 575 74 L 600 68"
                  fill="none"
                  stroke="var(--danger)"
                  strokeWidth="2.75"
                  className={txClass}
                />
                <circle
                  cx="594"
                  cy="70"
                  r="5"
                  fill="var(--danger)"
                  className={reduced ? undefined : "svg-pulse"}
                />
                <text x="502" y="154" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                  RAM พุ่งทะลุเพดาน!
                </text>
              </g>
            )}

            {/* Vertical RAM Meter Bar */}
            <rect x="614" y="62" width="34" height="120" rx="8" fill="var(--surface-2)" stroke="var(--line)" />
            <rect
              x="618"
              y={isStream ? 166 : 68}
              width="26"
              height={isStream ? 12 : 110}
              rx="5"
              fill={accent}
              className={txClass}
            />

            {/* Bottom status pill */}
            <rect x="428" y="194" width="220" height="32" rx="8" fill={accentSoft} stroke={accent} className={txClass} />
            <text x="538" y="214" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={accent} fontFamily="var(--font-sans)">
              {isStream ? "ปลอดภัย · ประมวลผลไฟล์ใหญ่ได้ไม่จำกัด" : "MemoryError · โปรเซสถูก OS สั่งปิด"}
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
/* 4. StructlogFlowVisual (structlog-flow)                                    */
/* ========================================================================== */

type LoggingMode = "structlog" | "messy";

export function StructlogFlowVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<LoggingMode>("structlog");
  const isClean = mode === "structlog";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowSuccess = `${uid}-sl-ok`;
  const arrowWarn = `${uid}-sl-warn`;
  const arrowDanger = `${uid}-sl-err`;

  const captionText = isClean
    ? "structlog + Custom Exceptions: ทุกเหตุการณ์ถูกบันทึกเป็น JSON ที่มี request_id และ latency_ms พร้อมคัดแยก RetryableError (ลองใหม่แบบ backoff) ออกจาก FatalError (หยุดและแจ้งเตือนทันที)"
    : "Messy print() + bare except: ข้อความ print() ขาดบริบทสำหรับค้นหา และ except: pass จะกลืนข้อผิดพลาดทุกชนิดเงียบๆ ทำให้แยกไม่ออกว่าควรลองใหม่หรือรีบแจ้งเตือนทีม";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เปรียบเทียบ print กับ structlog และ Custom Exceptions" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!isClean}
          className={!isClean ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isClean ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("messy")}
        >
          Messy print() + bare except
        </button>
        <button
          type="button"
          aria-pressed={isClean}
          className={isClean ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isClean ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("structlog")}
        >
          structlog JSON + Custom Exceptions
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพการบันทึก Log แบบ structlog JSON และการแยกเส้นทาง RetryableError กับ FatalError"
        >
          <defs>
            <marker id={arrowSuccess} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
            <marker id={arrowWarn} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--warning)" />
            </marker>
            <marker id={arrowDanger} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
          </defs>

          {/* Left: Runtime Events */}
          <g>
            <rect x="14" y="24" width="154" height="232" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
            <text x="26" y="48" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              AI Worker
            </text>
            <text x="26" y="66" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
              req_id=&quot;req-9a2&quot;
            </text>

            {/* Event 1: Success */}
            <rect x="24" y="80" width="134" height="46" rx="8" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.25" />
            <text x="34" y="100" fontSize="11.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
              200 OK · 142ms
            </text>
            <text x="34" y="117" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              เรียกโมเดลสำเร็จ
            </text>

            {/* Event 2: 429 */}
            <rect x="24" y="138" width="134" height="46" rx="8" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1.25" />
            <text x="34" y="158" fontSize="11.5" fontWeight="700" fill="var(--warning)" fontFamily="var(--font-mono)">
              429 Rate Limit
            </text>
            <text x="34" y="175" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              โควตาเต็มชั่วคราว
            </text>

            {/* Event 3: 401 */}
            <rect x="24" y="196" width="134" height="46" rx="8" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.25" />
            <text x="34" y="216" fontSize="11.5" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
              401 Bad Key
            </text>
            <text x="34" y="233" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              คีย์ผิดพลาดถาวร
            </text>
          </g>

          {/* Left -> Center animated connectors */}
          <line
            x1="170"
            y1="103"
            x2="204"
            y2={isClean ? 84 : 103}
            stroke={isClean ? "var(--success)" : "var(--danger)"}
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${isClean ? arrowSuccess : arrowDanger})`}
          />
          <line
            x1="170"
            y1="161"
            x2="204"
            y2={isClean ? 186 : 161}
            stroke={isClean ? "var(--warning)" : "var(--danger)"}
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${isClean ? arrowWarn : arrowDanger})`}
          />
          <line
            x1="170"
            y1="219"
            x2="204"
            y2={isClean ? 228 : 219}
            stroke="var(--danger)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowDanger})`}
          />

          {isClean ? (
            <>
              {/* Center Top: structlog JSON */}
              <g>
                <rect x="210" y="20" width="228" height="114" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.75" className={txClass} />
                <rect x="222" y="30" width="136" height="20" rx="5" fill="var(--brand-soft)" />
                <text x="290" y="44" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                  structlog · JSON
                </text>
                <text x="222" y="68" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {'"event": "llm_call_ok",'}
                </text>
                <rect x="219" y="75" width="208" height="20" rx="4" fill="var(--cyan-soft)" />
                <text x="224" y="89" fontSize="11.5" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
                  {'"request_id": "req-9a2",'}
                </text>
                <rect x="219" y="99" width="208" height="20" rx="4" fill="var(--brand-soft)" />
                <text x="224" y="113" fontSize="11.5" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                  {'"latency_ms": 142'}
                </text>
              </g>

              {/* Center Bottom: Custom Exceptions */}
              <g>
                <rect x="210" y="146" width="228" height="112" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" className={txClass} />
                <text x="224" y="167" fontSize="11.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
                  Custom Exception Router
                </text>
                <rect x="222" y="176" width="204" height="32" rx="8" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1.25" />
                <text x="232" y="196" fontSize="11.5" fontWeight="700" fill="var(--warning)" fontFamily="var(--font-mono)">
                  RetryableError (429/503)
                </text>
                <rect x="222" y="216" width="204" height="32" rx="8" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.25" />
                <text x="232" y="236" fontSize="11.5" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  FatalError (401/Schema)
                </text>
              </g>

              {/* Center -> Right Connectors */}
              <line
                x1="440"
                y1="62"
                x2="474"
                y2="62"
                stroke="var(--success)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowSuccess})`}
              />
              <path
                d="M 440 192 C 458 192, 456 144, 474 144"
                fill="none"
                stroke="var(--warning)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowWarn})`}
              />
              <line
                x1="440"
                y1="232"
                x2="474"
                y2="232"
                stroke="var(--danger)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowDanger})`}
              />

              {/* Right: 3 Clean Targets */}
              <g>
                <rect x="480" y="20" width="186" height="72" rx="12" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.5" />
                <text x="494" y="44" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                  Searchable Logs
                </text>
                <text x="494" y="64" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                  ค้นตาม request_id ทันที
                </text>
                <text x="494" y="81" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  p95 latency · dashboard
                </text>

                <rect x="480" y="106" width="186" height="72" rx="12" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1.5" />
                <text x="494" y="130" fontSize="12" fontWeight="700" fill="var(--warning)" fontFamily="var(--font-mono)">
                  Retry + Backoff
                </text>
                <text x="494" y="150" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                  รอ 1s → 2s → 4s แล้วลองใหม่
                </text>
                <text x="494" y="167" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  max_attempts=3
                </text>

                <rect x="480" y="192" width="186" height="68" rx="12" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.5" />
                <text x="494" y="216" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  Fail-Fast + Alert
                </text>
                <text x="494" y="236" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                  ไม่ retry เสียเวลา · แจ้งทีมทันที
                </text>
              </g>
            </>
          ) : (
            <>
              {/* Messy Center */}
              <g>
                <rect x="210" y="24" width="228" height="232" rx="12" fill="var(--surface)" stroke="var(--danger)" strokeWidth="1.75" className={txClass} />
                <rect x="224" y="38" width="200" height="86" rx="10" fill="var(--surface-2)" stroke="var(--line)" />
                <text x="236" y="58" fontSize="11.5" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  print(&quot;error happened!&quot;)
                </text>
                <text x="236" y="79" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  calling api...
                </text>
                <text x="236" y="96" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  error!! (งานไหน? กี่ ms?)
                </text>
                <text x="236" y="114" fontSize="11" fill="var(--danger)" fontFamily="var(--font-sans)">
                  ข้อความลอยๆ ค้นหาย้อนหลังไม่ได้
                </text>

                <rect x="224" y="138" width="200" height="104" rx="10" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.5" />
                <text x="236" y="160" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  except Exception:
                </text>
                <text x="252" y="180" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  pass
                </text>
                <text x="236" y="206" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                  กลืนทั้ง 429 และ 401 เงียบๆ
                </text>
                <text x="236" y="226" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                  ไม่ retry และไม่แจ้งเตือนใคร
                </text>
              </g>

              {/* Messy connector */}
              <line
                x1="440"
                y1="140"
                x2="474"
                y2="140"
                stroke="var(--danger)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowDanger})`}
              />

              {/* Messy Right Outcome */}
              <g>
                <rect x="480" y="24" width="186" height="232" rx="12" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.75" />
                <text x="494" y="50" fontSize="12.5" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  Silent Failure
                </text>
                <line x1="494" y1="60" x2="652" y2="60" stroke="var(--danger)" strokeOpacity="0.35" />

                {[
                  { y: 74, title: "1. หาต้นเหตุไม่เจอ", desc: "ไม่มี request_id ผูกงาน" },
                  { y: 126, title: "2. งานหายเงียบๆ", desc: "ลูกค้าไม่ได้คำตอบ" },
                  { y: 178, title: "3. ดีบักตี 3 ไม่ออก", desc: "ไม่รู้ว่าเป็น 429 หรือ 401" },
                ].map((card) => (
                  <g key={card.title}>
                    <rect x="492" y={card.y} width="162" height="42" rx="8" fill="var(--surface)" stroke="var(--danger)" strokeOpacity="0.5" />
                    <text x="502" y={card.y + 18} fontSize="11.5" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                      {card.title}
                    </text>
                    <text x="502" y={card.y + 34} fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                      {card.desc}
                    </text>
                  </g>
                ))}
              </g>
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
/* 5. EnvSettingsVisual (env-settings)                                        */
/* ========================================================================== */

type EnvMode = "valid" | "missing";

export function EnvSettingsVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<EnvMode>("valid");
  const isValid = mode === "valid";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowIn = `${uid}-env-in`;
  const arrowOut = `${uid}-env-out`;
  const outStroke = isValid ? "var(--success)" : "var(--danger)";
  const outFill = isValid ? "var(--success-soft)" : "var(--danger-soft)";

  const captionText = isValid
    ? "Valid .env + SecretStr: pydantic-settings รวมค่าจาก .env และ OS Env (โดย OS Env ชนะเสมอ) พร้อมห่อ API Key ด้วย SecretStr เพื่อปิดบังเป็น ********** ใน Log อัตโนมัติ"
    : "Missing API Key (Fail-Fast): เมื่อขาด OPENAI_API_KEY แอปจะโยน ValidationError และหยุดทันทีตั้งแต่ตอนเริ่มทำงาน (Startup) ดีกว่าปล่อยให้ไปพังกลางทางตอนลูกค้าใช้งาน";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกโหมดการโหลดค่าคอนฟิก BaseSettings" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={isValid}
          className={isValid ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isValid ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("valid")}
        >
          Valid .env + SecretStr
        </button>
        <button
          type="button"
          aria-pressed={!isValid}
          className={!isValid ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isValid ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("missing")}
        >
          Missing API Key (Fail-Fast)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 260"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพการโหลด .env และ OS Environment เข้า pydantic-settings BaseSettings พร้อม SecretStr"
        >
          <defs>
            <marker id={arrowIn} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={arrowOut} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={outStroke} />
            </marker>
          </defs>

          {/* Left Top: .env File */}
          <g>
            <rect
              x="16"
              y="20"
              width="192"
              height="104"
              rx="12"
              fill="var(--surface)"
              stroke={isValid ? "var(--line)" : "var(--danger)"}
              strokeWidth="1.5"
              className={txClass}
            />
            <rect x="28" y="30" width="94" height="20" rx="5" fill="var(--brand-soft)" />
            <text x="75" y="44" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              .env (Local)
            </text>
            <text x="28" y="68" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
              APP_ENV=prod
            </text>
            <text x="28" y="86" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
              MAX_RETRIES=3
            </text>
            <rect
              x="24"
              y="94"
              width="176"
              height="22"
              rx="5"
              fill={isValid ? "var(--cyan-soft)" : "var(--danger-soft)"}
              className={txClass}
            />
            <text
              x="29"
              y="109"
              fontSize="11"
              fontWeight="700"
              fill={isValid ? "var(--cyan)" : "var(--danger)"}
              fontFamily="var(--font-mono)"
            >
              {isValid ? "OPENAI_API_KEY=sk-9x..." : "# OPENAI_API_KEY=(หาย!)"}
            </text>
          </g>

          {/* Left Bottom: OS Env */}
          <g>
            <rect x="16" y="138" width="192" height="102" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
            <rect x="28" y="148" width="124" height="20" rx="5" fill="var(--surface-2)" stroke="var(--hair)" />
            <text x="90" y="162" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
              OS Env (Override)
            </text>
            <text x="28" y="186" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
              LOG_LEVEL=INFO
            </text>
            <text x="28" y="205" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
              TIMEOUT_SEC=30
            </text>
            <text x="28" y="226" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              ค่าจาก OS สำคัญกว่า .env
            </text>
          </g>

          {/* Converging Flow Lines into BaseSettings */}
          <path
            d="M 210 72 C 230 72, 228 110, 246 110"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowIn})`}
          />
          <path
            d="M 210 189 C 230 189, 228 152, 246 152"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowIn})`}
          />

          {/* Center: pydantic-settings BaseSettings */}
          <g>
            <rect
              x="252"
              y="26"
              width="184"
              height="208"
              rx="12"
              fill="var(--surface)"
              stroke={isValid ? "var(--brand)" : "var(--danger)"}
              strokeWidth="2"
              className={txClass}
            />
            <text x="344" y="49" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              BaseSettings
            </text>
            <text x="344" y="66" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
              pydantic-settings
            </text>
            <line x1="266" y1="75" x2="422" y2="75" stroke="var(--hair)" />

            {/* Field 1 */}
            <rect x="264" y="84" width="160" height="28" rx="6" fill="var(--success-soft)" />
            <text x="272" y="102" fontSize="11" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
              ✓ app_env: str
            </text>

            {/* Field 2 */}
            <rect x="264" y="118" width="160" height="28" rx="6" fill="var(--success-soft)" />
            <text x="272" y="136" fontSize="11" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
              ✓ max_retries: int
            </text>

            {/* Field 3: SecretStr */}
            <rect
              x="264"
              y="152"
              width="160"
              height="34"
              rx="6"
              fill={isValid ? "var(--cyan-soft)" : "var(--danger-soft)"}
              stroke={isValid ? "var(--cyan)" : "var(--danger)"}
              strokeWidth="1.25"
              className={txClass}
            />
            <text
              x="272"
              y="167"
              fontSize="11"
              fontWeight="700"
              fill={isValid ? "var(--cyan)" : "var(--danger)"}
              fontFamily="var(--font-mono)"
            >
              {isValid ? "✓ api_key: SecretStr" : "✗ api_key: SecretStr"}
            </text>
            <text
              x="272"
              y="181"
              fontSize="10.5"
              fill={isValid ? "var(--muted)" : "var(--danger)"}
              fontFamily="var(--font-mono)"
            >
              {isValid ? "ห่อรหัสลับปลอดภัย" : "Field required!"}
            </text>

            {/* Bottom status inside BaseSettings */}
            <rect x="264" y="196" width="160" height="26" rx="7" fill={outFill} stroke={outStroke} className={txClass} />
            <text x="344" y="213" textAnchor="middle" fontSize="11" fontWeight="700" fill={outStroke} fontFamily="var(--font-sans)">
              {isValid ? "Boot สำเร็จ · ครบทุกค่า" : "หยุดทันที (Fail-Fast)"}
            </text>
          </g>

          {/* Center -> Right Connector */}
          <line
            x1="438"
            y1="130"
            x2="472"
            y2="130"
            stroke={outStroke}
            strokeWidth="2.5"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowOut})`}
          />

          {/* Right: Masked Log vs Fail-Fast Crash */}
          <g>
            <rect
              x="478"
              y="26"
              width="186"
              height="208"
              rx="12"
              fill={outFill}
              stroke={outStroke}
              strokeWidth="1.75"
              className={txClass}
            />
            <text x="492" y="49" fontSize="12.5" fontWeight="700" fill={outStroke} fontFamily="var(--font-mono)">
              {isValid ? "Safe Logs & App" : "Startup Error"}
            </text>
            <line x1="492" y1="59" x2="650" y2="59" stroke={outStroke} strokeOpacity="0.35" />

            {isValid ? (
              <>
                <rect x="490" y="70" width="162" height="84" rx="8" fill="var(--surface)" stroke="var(--line)" />
                <text x="499" y="88" fontSize="10.5" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
                  # print(settings)
                </text>
                <text x="499" y="106" fontSize="11" fill="var(--fg)" fontFamily="var(--font-mono)">
                  app_env=&apos;prod&apos;
                </text>
                <text x="499" y="122" fontSize="11" fill="var(--fg)" fontFamily="var(--font-mono)">
                  api_key=
                </text>
                <rect x="494" y="128" width="154" height="20" rx="5" fill="var(--cyan-soft)" stroke="var(--cyan)" />
                <text x="571" y="142" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
                  SecretStr(&apos;**********&apos;)
                </text>

                <rect x="490" y="164" width="162" height="58" rx="8" fill="var(--surface)" stroke="var(--success)" />
                <text x="500" y="184" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                  .get_secret_value()
                </text>
                <text x="500" y="203" fontSize="11" fill="var(--fg)" fontFamily="var(--font-sans)">
                  เปิดอ่านคีย์จริงเฉพาะตอนส่ง
                </text>
                <text x="500" y="216" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                  HTTP Header เท่านั้น
                </text>
              </>
            ) : (
              <>
                <rect x="490" y="70" width="162" height="88" rx="8" fill="var(--surface)" stroke="var(--danger)" strokeWidth="1.25" />
                <text x="500" y="90" fontSize="11.5" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  ValidationError
                </text>
                <text x="500" y="110" fontSize="11" fill="var(--fg)" fontFamily="var(--font-mono)">
                  openai_api_key
                </text>
                <text x="500" y="128" fontSize="11" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                  Field required
                </text>
                <text x="500" y="146" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-mono)">
                  exit_code = 1
                </text>

                <rect x="490" y="168" width="162" height="54" rx="8" fill="var(--surface)" stroke="var(--danger)" />
                <text x="571" y="190" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                  Fail-Fast ตั้งแต่ตอน Boot
                </text>
                <text x="571" y="209" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                  กันพังเงียบตอนลูกค้าใช้งาน
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
/* 6. PytestFixturesVisual (pytest-fixtures)                                  */
/* ========================================================================== */

interface PytestStage {
  id: number;
  btnLabel: string;
  shortTitle: string;
  subLabel: string;
  badge: string;
  code1: string;
  code2: string;
  note: string;
  covPercent: number;
  caption: string;
}

const PYTEST_STAGES: PytestStage[] = [
  {
    id: 0,
    btnLabel: "1. Fixture Setup",
    shortTitle: "1. Fixture Setup",
    subLabel: "สร้าง tmp_path",
    badge: "@pytest.fixture",
    code1: '@pytest.fixture def sample_file(tmp_path):',
    code2: '    p = tmp_path / "tickets.jsonl"; p.write_text(...); yield p',
    note: "สร้างไฟล์จำลองแยกอิสระในโฟลเดอร์ชั่วคราว — ไม่แตะข้อมูลจริงของโปรเจกต์",
    covPercent: 22,
    caption:
      "ขั้นที่ 1 (Fixture Setup): Pytest เตรียมสภาพแวดล้อมทดสอบด้วย @pytest.fixture และ tmp_path ก่อนส่งค่าผ่าน yield เข้าสู่ฟังก์ชันทดสอบ",
  },
  {
    id: 1,
    btnLabel: "2. Arrange / Act",
    shortTitle: "2. Arrange / Act",
    subLabel: "รันฟังก์ชันเป้าหมาย",
    badge: "Dependency Inject",
    code1: "def test_load_clean_tickets(sample_file):",
    code2: "    rows = load_and_clean(sample_file)   # Act บนข้อมูลจำลอง",
    note: "Pytest ฉีด sample_file เข้าพารามิเตอร์อัตโนมัติ แล้วรันโค้ดจริงที่ต้องการทดสอบ",
    covPercent: 58,
    caption:
      "ขั้นที่ 2 (Arrange / Act): ฟังก์ชันทดสอบรับ fixture ผ่านชื่อพารามิเตอร์แล้วเรียกใช้โค้ดจริง (Act) เพื่อเก็บผลลัพธ์มาตรวจสอบ",
  },
  {
    id: 2,
    btnLabel: "3. Assert",
    shortTitle: "3. Assert",
    subLabel: "ยืนยันผลลัพธ์",
    badge: "3/3 PASSED",
    code1: 'assert len(rows) == 3 and rows[0].id == "TK-01"',
    code2: "assert all(r.msg.strip() for r in rows)  # PASSED (0.04s)",
    note: "ตรวจทั้งกรณีปกติและกรณีขอบ หากผิดพลาด Pytest จะพิมพ์ diff ค่าจริงกับค่าที่คาดทันที",
    covPercent: 86,
    caption:
      "ขั้นที่ 3 (Assert): ตรวจสอบผลลัพธ์ด้วย assert ธรรมดาของ Python พร้อมรายงาน diff ที่อ่านง่ายเมื่อเทสต์ไม่ผ่าน",
  },
  {
    id: 3,
    btnLabel: "4. Teardown + 92% Cov",
    shortTitle: "4. Teardown",
    subLabel: "เก็บกวาด + 92% Cov",
    badge: "pytest --cov=src",
    code1: "# โค้ดหลัง yield ทำงานอัตโนมัติ → ลบ tmp_path สะอาด 100%",
    code2: "12 passed in 0.19s  ·  Total Coverage: 92% (Target ≥ 80% ✓)",
    note: "คืนทรัพยากรครบทุกเทสต์แม้เคสจะล้มเหลว และวัด Coverage เพื่อให้มั่นใจว่าโค้ดสำคัญถูกทดสอบแล้ว",
    covPercent: 92,
    caption:
      "ขั้นที่ 4 (Teardown + 92% Cov): โค้ดหลัง yield เก็บกวาดไฟล์ชั่วคราวอัตโนมัติ และ --cov สรุปความครอบคลุมที่ 92% เกินเกณฑ์มาตรฐาน 80%",
  },
];

export function PytestFixturesVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [step, setStep] = useState(0);
  const current = PYTEST_STAGES[step];
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const stageCenters = [88, 256, 424, 592];
  const activeCenterX = stageCenters[step];
  const arrowId = `${uid}-pytest-arrow`;

  const barMaxWidth = 612;
  const barWidth = Math.round((barMaxWidth * current.covPercent) / 100);
  const thresholdX = 34 + Math.round(barMaxWidth * 0.8);
  const barFill = current.covPercent >= 80 ? "var(--success)" : current.covPercent >= 50 ? "var(--cyan)" : "var(--brand)";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกขั้นตอนวงจรชีวิต Pytest Fixture" className="flex flex-wrap gap-2">
        {PYTEST_STAGES.map((stage) => {
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
              {stage.btnLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพวงจรชีวิต Pytest Fixtures 4 ขั้นตอนพร้อมแถบ Test Coverage"
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
          </defs>

          {/* Horizontal connectors between the 4 stages */}
          {[0, 1, 2].map((idx) => {
            const x1 = 18 + idx * 168 + 140;
            const x2 = 18 + (idx + 1) * 168 - 4;
            const reached = idx < step;
            return (
              <line
                key={idx}
                x1={x1}
                y1="48"
                x2={x2}
                y2="48"
                stroke={reached ? "var(--brand)" : "var(--line)"}
                strokeWidth={reached ? "2.5" : "2"}
                strokeDasharray={reached && !reduced ? "6 6" : undefined}
                className={reached ? flowClass : undefined}
                markerEnd={reached ? `url(#${arrowId})` : undefined}
              />
            );
          })}

          {/* 4 Clickable Stage Nodes */}
          {PYTEST_STAGES.map((stage, idx) => {
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
                    y="13"
                    width="146"
                    height="70"
                    rx="14"
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="2"
                    className="svg-pulse"
                  />
                ) : null}
                <rect
                  x={x}
                  y="16"
                  width="140"
                  height="64"
                  rx="12"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isActive ? "2" : "1.5"}
                  className={txClass}
                />
                <text
                  x={x + 70}
                  y="42"
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fill={titleColor}
                  fontFamily="var(--font-mono)"
                >
                  {stage.shortTitle}
                </text>
                <text
                  x={x + 70}
                  y="64"
                  textAnchor="middle"
                  fontSize="11.5"
                  fill="var(--muted)"
                  fontFamily="var(--font-sans)"
                >
                  {stage.subLabel}
                </text>
              </g>
            );
          })}

          {/* Drop connector from active stage */}
          <line
            x1={activeCenterX}
            y1="80"
            x2={activeCenterX}
            y2="104"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
          />
          <circle cx={activeCenterX} cy="106" r="4" fill="var(--brand)" className={txClass} />

          {/* Middle Inspector Card */}
          <rect x="18" y="108" width="644" height="98" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" />
          <text x="34" y="131" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            การทำงานในขั้น {current.shortTitle}
          </text>
          <rect x="496" y="116" width="150" height="22" rx="7" fill="var(--brand-soft)" stroke="var(--brand)" strokeOpacity="0.4" />
          <text x="571" y="131" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            {current.badge}
          </text>
          <line x1="34" y1="143" x2="646" y2="143" stroke="var(--hair)" />

          <text x="34" y="162" fontSize="11.5" fontWeight="500" fill="var(--fg)" fontFamily="var(--font-mono)">
            {current.code1}
          </text>
          <text
            x="34"
            y="180"
            fontSize="11.5"
            fontWeight="700"
            fill={step >= 2 ? "var(--success)" : "var(--brand-ink)"}
            fontFamily="var(--font-mono)"
          >
            {current.code2}
          </text>
          <text x="34" y="198" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
            {current.note}
          </text>

          {/* Bottom Animated Coverage Bar */}
          <rect x="18" y="216" width="644" height="52" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
          <text x="34" y="236" fontSize="11.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            Test Coverage (pytest --cov)
          </text>
          <text
            x="646"
            y="236"
            textAnchor="end"
            fontSize="12"
            fontWeight="700"
            fill={barFill}
            fontFamily="var(--font-mono)"
          >
            {current.covPercent >= 80 ? `${current.covPercent}% · ผ่านเกณฑ์ ≥80%` : `${current.covPercent}% (กำลังสะสม)`}
          </text>

          {/* Track */}
          <rect x="34" y="246" width={barMaxWidth} height="12" rx="6" fill="var(--surface-2)" stroke="var(--hair)" />
          {/* Animated Fill */}
          <rect x="34" y="246" width={barWidth} height="12" rx="6" fill={barFill} className={txClass} />
          {/* Subtle animated shimmer flow inside active bar */}
          {!reduced && barWidth > 24 ? (
            <line
              x1="40"
              y1="252"
              x2={34 + barWidth - 6}
              y2="252"
              stroke="var(--surface)"
              strokeOpacity="0.45"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="svg-flow-line"
            />
          ) : null}
          {/* 80% target threshold tick */}
          <line x1={thresholdX} y1="242" x2={thresholdX} y2="262" stroke="var(--fg)" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="2 2" />
          <text x={thresholdX - 4} y="240" textAnchor="end" fontSize="9.5" fill="var(--muted)" fontFamily="var(--font-mono)">
            80%
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {current.caption}
      </p>
    </div>
  );
}
