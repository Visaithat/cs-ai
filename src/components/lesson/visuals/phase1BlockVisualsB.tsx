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
/* 1. MockParametrizeVisual (mock-parametrize)                                */
/* ========================================================================== */

type TestStrategyMode = "parametrize" | "monkeypatch";

interface ThaiTestCase {
  id: number;
  label: string;
  raw: string;
  expected: string;
  isError?: boolean;
  note: string;
}

const THAI_TEST_CASES: ThaiTestCase[] = [
  {
    id: 0,
    label: "Case 1 · ช่องว่างหัวท้าย",
    raw: '" ขอใบเสร็จ "',
    expected: '"ขอใบเสร็จ"',
    note: "ตัดช่องว่างเกินหน้า-หลังข้อความไทยให้สะอาด",
  },
  {
    id: 1,
    label: "Case 2 · ขึ้นบรรทัดใหม่",
    raw: '"ส่ง\\nด่วน"',
    expected: '"ส่ง ด่วน"',
    note: "ยุบอักขระ \\n ให้เป็นช่องว่างเดียวก่อนส่งต่อ",
  },
  {
    id: 2,
    label: "Case 3 · เว้นวรรคซ้อน",
    raw: '"คืน  เงิน"',
    expected: '"คืน เงิน"',
    note: "รวมช่องว่างหลายตัวที่ติดกันให้เหลือช่องเดียว",
  },
  {
    id: 3,
    label: "Case 4 · ช่องว่างล้วน",
    raw: '"   "',
    expected: "ValueError",
    isError: true,
    note: "สกัดข้อความว่างเปล่าด้วย pytest.raises(ValueError)",
  },
];

export function MockParametrizeVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<TestStrategyMode>("parametrize");
  const [selectedCase, setSelectedCase] = useState<number>(0);

  const isParam = mode === "parametrize";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const activeCase = THAI_TEST_CASES[selectedCase];

  const arrowBrand = `${uid}-mp-brand`;
  const arrowCyan = `${uid}-mp-cyan`;
  const arrowSuccess = `${uid}-mp-success`;

  const captionText = isParam
    ? `@pytest.mark.parametrize: เขียนฟังก์ชัน test_clean() แค่ครั้งเดียว แต่ป้อน 4 เคสภาษาไทยเข้าไปทดสอบอัตโนมัติ (กำลังดู ${activeCase.label}: ${activeCase.note})`
    : "monkeypatch Mock API: สกัดการเรียก LLM/HTTP ออกนอกเครื่องและสลับเป็นฟังก์ชันจำลองในหน่วยความจำ ทำให้เทสต์จบใน 0ms เสียค่า API $0.00 และได้ผลคงที่ทุกครั้งใน CI";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับโหมด pytest parametrize กับ monkeypatch mock" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={isParam}
          className={isParam ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isParam ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("parametrize")}
        >
          @pytest.mark.parametrize (4 Thai cases)
        </button>
        <button
          type="button"
          aria-pressed={!isParam}
          className={!isParam ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isParam ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("monkeypatch")}
        >
          monkeypatch Mock API (0ms, $0)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 270"
          className="w-full h-auto block"
          role="img"
          aria-label={
            isParam
              ? "แผนภาพ pytest.mark.parametrize ป้อน 4 เคสภาษาไทยเข้าฟังก์ชันทดสอบเดียว"
              : "แผนภาพ monkeypatch สกัดการเรียก API จริงและส่งคำตอบจำลองภายใน 0ms"
          }
        >
          <defs>
            <marker id={arrowBrand} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={arrowCyan} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id={arrowSuccess} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {isParam ? (
            <>
              {/* Left: 4 clickable Thai test case rows */}
              {THAI_TEST_CASES.map((tc, idx) => {
                const y = 20 + idx * 56;
                const cy = y + 23;
                const active = idx === selectedCase;
                const cardFill = active
                  ? tc.isError
                    ? "var(--warning-soft)"
                    : "var(--brand-soft)"
                  : "var(--surface)";
                const cardStroke = active
                  ? tc.isError
                    ? "var(--warning)"
                    : "var(--brand)"
                  : "var(--line)";

                return (
                  <g key={tc.id}>
                    {/* Animated feed curve into single test function */}
                    <path
                      d={`M 226 ${cy} C 254 ${cy}, 256 132, 282 132`}
                      fill="none"
                      stroke={active ? "var(--brand)" : "var(--cyan)"}
                      strokeWidth={active ? "2.4" : "1.4"}
                      strokeOpacity={active ? 1 : 0.65}
                      strokeDasharray={reduced ? undefined : "6 6"}
                      className={flowClass}
                      markerEnd={active ? `url(#${arrowBrand})` : undefined}
                    />

                    {/* Clickable test case card */}
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`เลือกดู ${tc.label}`}
                      aria-pressed={active}
                      onClick={() => setSelectedCase(tc.id)}
                      onKeyDown={(e) => handleSvgKeyDown(e, () => setSelectedCase(tc.id))}
                      style={{ cursor: "pointer" }}
                    >
                      <rect
                        x="14"
                        y={y}
                        width="212"
                        height="46"
                        rx="10"
                        fill={cardFill}
                        stroke={cardStroke}
                        strokeWidth={active ? "1.8" : "1.2"}
                        className={txClass}
                      />
                      <text
                        x="25"
                        y={y + 18}
                        fontSize="11"
                        fontWeight="700"
                        fill={active ? (tc.isError ? "var(--warning)" : "var(--brand-ink)") : "var(--muted)"}
                        fontFamily="var(--font-sans)"
                      >
                        {tc.label}
                      </text>
                      <text
                        x="25"
                        y={y + 36}
                        fontSize="11"
                        fontWeight="600"
                        fill="var(--fg)"
                        fontFamily="var(--font-mono)"
                      >
                        {tc.raw} → {tc.expected}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Center: Single Test Function */}
              <g>
                {!reduced ? (
                  <rect
                    x="283"
                    y="33"
                    width="206"
                    height="198"
                    rx="14"
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="1.5"
                    className="svg-pulse"
                  />
                ) : null}
                <rect
                  x="286"
                  y="36"
                  width="200"
                  height="192"
                  rx="12"
                  fill="var(--surface)"
                  stroke="var(--brand)"
                  strokeWidth="1.8"
                  className={txClass}
                />
                <rect x="298" y="48" width="176" height="24" rx="7" fill="var(--brand-soft)" stroke="var(--brand)" strokeOpacity="0.4" />
                <text x="386" y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                  @pytest.mark.parametrize
                </text>

                <text x="386" y="92" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
                  def test_clean(raw, exp):
                </text>

                {/* Active case inspector box inside test function */}
                <rect
                  x="298"
                  y="104"
                  width="176"
                  height="80"
                  rx="8"
                  fill="var(--surface-2)"
                  stroke="var(--hair)"
                />
                <text x="308" y="124" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  raw = {activeCase.raw}
                </text>
                <text
                  x="308"
                  y="144"
                  fontSize="11"
                  fontWeight="600"
                  fill={activeCase.isError ? "var(--warning)" : "var(--cyan)"}
                  fontFamily="var(--font-mono)"
                >
                  exp = {activeCase.expected}
                </text>
                <line x1="308" y1="154" x2="464" y2="154" stroke="var(--hair)" />
                <text x="308" y="172" fontSize="11" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                  {activeCase.isError ? "pytest.raises(ValueError)" : "assert clean(raw) == exp"}
                </text>

                <text x="386" y="210" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                  1 ฟังก์ชัน · รันครบ 4 เคสอัตโนมัติ
                </text>
              </g>

              {/* Flow line to summary */}
              <line
                x1="488"
                y1="132"
                x2="516"
                y2="132"
                stroke="var(--success)"
                strokeWidth="2.4"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowSuccess})`}
              />

              {/* Right: pytest summary card */}
              <g>
                <rect
                  x="520"
                  y="36"
                  width="146"
                  height="192"
                  rx="12"
                  fill="var(--success-soft)"
                  stroke="var(--success)"
                  strokeWidth="1.6"
                  className={txClass}
                />
                <text x="593" y="60" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                  pytest Report
                </text>
                <line x1="534" y1="70" x2="652" y2="70" stroke="var(--success)" strokeOpacity="0.3" />

                {THAI_TEST_CASES.map((tc, idx) => {
                  const ry = 82 + idx * 25;
                  const active = idx === selectedCase;
                  return (
                    <g key={tc.id}>
                      <rect
                        x="532"
                        y={ry}
                        width="122"
                        height="20"
                        rx="5"
                        fill={active ? "var(--surface)" : "transparent"}
                        stroke={active ? "var(--success)" : "none"}
                        className={txClass}
                      />
                      <text
                        x="540"
                        y={ry + 14}
                        fontSize="11"
                        fontWeight={active ? "700" : "500"}
                        fill="var(--fg)"
                        fontFamily="var(--font-mono)"
                      >
                        case[{idx + 1}]
                      </text>
                      <text
                        x="646"
                        y={ry + 14}
                        textAnchor="end"
                        fontSize="11"
                        fontWeight="700"
                        fill="var(--success)"
                        fontFamily="var(--font-mono)"
                      >
                        PASS ✓
                      </text>
                    </g>
                  );
                })}

                <rect x="532" y="188" width="122" height="28" rx="8" fill="var(--surface)" stroke="var(--success)" />
                <text x="593" y="206" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                  4 passed · 0.02s
                </text>
              </g>

              {/* Bottom interactive hint */}
              <text x="14" y="258" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                คลิกที่เคสด้านซ้าย (Case 1–4) เพื่อสลับดูค่า raw และ expected ที่ถูกป้อนเข้าฟังก์ชัน
              </text>
            </>
          ) : (
            <>
              {/* Left: Pytest Test Function */}
              <g>
                <rect x="14" y="42" width="188" height="182" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.6" />
                <rect x="26" y="54" width="164" height="24" rx="7" fill="var(--brand-soft)" />
                <text x="108" y="70" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                  test_classify_ticket
                </text>

                <text x="26" y="102" fontSize="11" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                  monkeypatch.setattr(
                </text>
                <text x="34" y="120" fontSize="11" fill="var(--fg)" fontFamily="var(--font-mono)">
                  api, &quot;call_llm&quot;,
                </text>
                <text x="34" y="138" fontSize="11" fontWeight="600" fill="var(--cyan)" fontFamily="var(--font-mono)">
                  fake_llm_reply
                </text>
                <text x="26" y="156" fontSize="11" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                  )
                </text>

                <line x1="26" y1="168" x2="190" y2="168" stroke="var(--hair)" />
                <text x="26" y="188" fontSize="11" fill="var(--fg)" fontFamily="var(--font-mono)">
                  out = classify(&quot;คืนเงิน&quot;)
                </text>
                <text x="26" y="208" fontSize="11" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                  assert out == &quot;refund&quot;
                </text>
              </g>

              {/* Animated flow line: Test -> Monkeypatch Intercept */}
              <line
                x1="204"
                y1="133"
                x2="246"
                y2="133"
                stroke="var(--cyan)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowCyan})`}
              />

              {/* Center: Monkeypatch Intercept Shield */}
              <g>
                {!reduced ? (
                  <rect
                    x="249"
                    y="33"
                    width="196"
                    height="200"
                    rx="14"
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth="1.5"
                    className="svg-pulse"
                  />
                ) : null}
                <rect
                  x="252"
                  y="36"
                  width="190"
                  height="194"
                  rx="12"
                  fill="var(--cyan-soft)"
                  stroke="var(--cyan)"
                  strokeWidth="1.8"
                  className={txClass}
                />
                <text x="347" y="60" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
                  monkeypatch
                </text>
                <text x="347" y="77" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                  ดักจับและจำลองในเครื่อง
                </text>

                <rect x="264" y="88" width="166" height="66" rx="8" fill="var(--surface)" stroke="var(--cyan)" strokeOpacity="0.5" />
                <text x="274" y="108" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                  def fake_llm_reply(_):
                </text>
                <text x="282" y="126" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                  return &quot;refund&quot;
                </text>
                <text x="274" y="144" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                  คืนคำตอบทันที ไม่แตะเครือข่าย
                </text>

                {/* Metrics badges */}
                <rect x="264" y="164" width="78" height="28" rx="8" fill="var(--success-soft)" stroke="var(--success)" />
                <text x="303" y="182" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                  0 ms
                </text>
                <rect x="352" y="164" width="78" height="28" rx="8" fill="var(--success-soft)" stroke="var(--success)" />
                <text x="391" y="182" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                  $0.00
                </text>

                <text x="347" y="214" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                  คืนค่าฟังก์ชันเดิมหลังจบเทสต์
                </text>
              </g>

              {/* Blocked path to Real External API (top right) */}
              <path
                d="M 444 96 C 462 96, 468 74, 488 74"
                fill="none"
                stroke="var(--danger)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx="466" cy="85" r="10" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.5" />
              <text x="466" y="89" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                ✕
              </text>

              {/* Top Right: Real External API (Bypassed) */}
              <g>
                <rect
                  x="492"
                  y="28"
                  width="174"
                  height="92"
                  rx="12"
                  fill="var(--surface)"
                  stroke="var(--danger)"
                  strokeWidth="1.4"
                  strokeDasharray="5 4"
                />
                <text x="579" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                  Real LLM API
                </text>
                <text x="579" y="68" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  ~1,200ms · $0.002/call
                </text>
                <rect x="508" y="80" width="142" height="26" rx="7" fill="var(--danger-soft)" stroke="var(--danger)" strokeOpacity="0.5" />
                <text x="579" y="97" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                  0 calls · ถูกสกัดไม่ให้ยิง
                </text>
              </g>

              {/* Active flow path to Local Result (bottom right) */}
              <path
                d="M 444 170 C 462 170, 468 188, 488 188"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${arrowSuccess})`}
              />

              {/* Bottom Right: Deterministic Local Pass */}
              <g>
                <rect
                  x="492"
                  y="138"
                  width="174"
                  height="98"
                  rx="12"
                  fill="var(--success-soft)"
                  stroke="var(--success)"
                  strokeWidth="1.6"
                />
                <text x="579" y="162" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                  Local PASS ✓
                </text>
                <text x="579" y="182" textAnchor="middle" fontSize="11" fill="var(--fg)" fontFamily="var(--font-sans)">
                  ผลลัพธ์คงที่ 100% ทุกครั้ง
                </text>
                <text x="579" y="200" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                  รันใน CI ได้แม้ออฟไลน์
                </text>
                <text x="579" y="220" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                  No flaky network tests
                </text>
              </g>

              <text x="14" y="258" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
                แยก Unit Test ออกจากเครือข่ายจริงด้วย monkeypatch เพื่อความเร็ว 0ms และไม่เสียค่าโทเคน
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
/* 2. HttpxTimeoutVisual (httpx-timeout)                                      */
/* ========================================================================== */

type HttpOutcomeId = "200" | "400" | "429" | "timeout";

interface HttpOutcomeSpec {
  id: HttpOutcomeId;
  buttonLabel: string;
  pillText: string;
  tone: "success" | "danger" | "warning";
  connectFillW: number;
  readFillW: number;
  isTimeout: boolean;
  clientStatus: string;
  responseTitle: string;
  responseSub: string;
  responseDetail: string;
  actionBadge: string;
  actionLine1: string;
  actionLine2: string;
  caption: string;
}

const HTTP_OUTCOMES: HttpOutcomeSpec[] = [
  {
    id: "200",
    buttonLabel: "200 OK",
    pillText: "200 OK · 1.4s",
    tone: "success",
    connectFillW: 48,
    readFillW: 92,
    isTimeout: false,
    clientStatus: "เชื่อมสำเร็จ · รับ JSON ครบ",
    responseTitle: "200 OK",
    responseSub: "2xx Success",
    responseDetail: "ใช้เวลาอ่าน 1.2s (< 15s)",
    actionBadge: "ACCEPT · รับผลลัพธ์",
    actionLine1: "Parse JSON เข้า Pydantic",
    actionLine2: "ส่งผลต่อให้ขั้นตอนถัดไป",
    caption:
      "200 OK: เชื่อมต่อสำเร็จภายใน connect 3s และได้คำตอบภายใน read 15s — ให้ ACCEPT รับผลลัพธ์แล้วตรวจสอบ Schema ต่อได้ทันที",
  },
  {
    id: "400",
    buttonLabel: "400 Bad Request",
    pillText: "400 Error · 0.3s",
    tone: "danger",
    connectFillW: 40,
    readFillW: 36,
    isTimeout: false,
    clientStatus: "ส่ง payload ผิดรูปแบบ",
    responseTitle: "400 Bad Request",
    responseSub: "4xx Client Error",
    responseDetail: "ยิงซ้ำกี่ครั้งก็ผิดเหมือนเดิม",
    actionBadge: "FAIL FAST · หยุดทันที",
    actionLine1: "ห้าม Retry (เปลืองโควตา)",
    actionLine2: "Log error แล้วแก้ payload",
    caption:
      "400 Bad Request: เป็นความผิดพลาดฝั่งคำขอ (4xx) ต่อให้ลองยิงซ้ำอีกกี่ครั้งก็จะได้ 400 เดิม ต้อง FAIL FAST หยุดทันทีและรายงานบั๊ก",
  },
  {
    id: "429",
    buttonLabel: "429 Rate Limit",
    pillText: "429 Limit · 0.4s",
    tone: "warning",
    connectFillW: 44,
    readFillW: 48,
    isTimeout: false,
    clientStatus: "ยิงถี่เกินโควตา API",
    responseTitle: "429 Rate Limit",
    responseSub: "Transient Overload",
    responseDetail: "Header: Retry-After: 2s",
    actionBadge: "RETRY · หน่วงเวลาแล้วลองใหม่",
    actionLine1: "รอตาม Retry-After / Backoff",
    actionLine2: "จำกัดจำนวนครั้งไม่ให้วนลูป",
    caption:
      "429 Rate Limit: ปลายทางตอบกลับเร็วแต่แจ้งว่าเกินอัตราที่อนุญาต (Transient) ให้ RETRY แบบหน่วงเวลาตาม Retry-After หรือ Exponential Backoff",
  },
  {
    id: "timeout",
    buttonLabel: "ReadTimeout",
    pillText: "ReadTimeout · >15.0s",
    tone: "warning",
    connectFillW: 56,
    readFillW: 406,
    isTimeout: true,
    clientStatus: "เชื่อมได้ แต่ปลายทางเงียบ",
    responseTitle: "ReadTimeout",
    responseSub: "httpx.ReadTimeout",
    responseDetail: "ตัดสายที่ 15.0s กันแอปค้าง",
    actionBadge: "RETRY · จำกัดครั้ง + Log",
    actionLine1: "ตัดการเชื่อมต่อไม่ให้ค้าง ∞",
    actionLine2: "ลองใหม่พร้อม Idempotency-Key",
    caption:
      "ReadTimeout: ช่วง connect 3s ผ่าน แต่เซิร์ฟเวอร์ตอบช้าเกินเพดาน read 15s — httpx จะตัดการเชื่อมต่อทันทีไม่ให้เธรดค้างตลอดกาล แล้วค่อย RETRY อย่างปลอดภัย",
  },
];

function getToneVars(tone: "success" | "danger" | "warning") {
  if (tone === "success") {
    return { fg: "var(--success)", soft: "var(--success-soft)" };
  }
  if (tone === "danger") {
    return { fg: "var(--danger)", soft: "var(--danger-soft)" };
  }
  return { fg: "var(--warning)", soft: "var(--warning-soft)" };
}

export function HttpxTimeoutVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [selected, setSelected] = useState<HttpOutcomeId>("200");

  const current = HTTP_OUTCOMES.find((o) => o.id === selected) ?? HTTP_OUTCOMES[0];
  const tone = getToneVars(current.tone);
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowId = `${uid}-http-arrow`;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกสถานะ HTTP เพื่อดูการทำงานของ httpx Timeout" className="flex flex-wrap gap-2">
        {HTTP_OUTCOMES.map((item) => {
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
              {item.buttonLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพแถบเวลา httpx Timeout แบบแยก connect 3s และ read 15s พร้อมการตัดสินใจรับ หยุด หรือ Retry"
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={tone.fg} />
            </marker>
          </defs>

          {/* Header */}
          <text x="18" y="26" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            httpx.Timeout(connect=3.0, read=15.0)
          </text>
          <rect
            x="484"
            y="10"
            width="178"
            height="24"
            rx="12"
            fill={tone.soft}
            stroke={tone.fg}
            className={txClass}
          />
          <text x="573" y="26" textAnchor="middle" fontSize="11" fontWeight="700" fill={tone.fg} fontFamily="var(--font-mono)">
            {current.pillText}
          </text>

          {/* Granular Timeout Bar */}
          <g>
            {/* Segment 1: connect 3s (x=18..154, w=136) */}
            <rect
              x="18"
              y="44"
              width="136"
              height="44"
              rx="8"
              fill="var(--surface)"
              stroke="var(--cyan)"
              strokeWidth="1.4"
            />
            <rect
              x="22"
              y="48"
              width={current.connectFillW}
              height="36"
              rx="5"
              fill="var(--cyan-soft)"
              className={txClass}
            />
            <text x="86" y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
              connect 3s
            </text>
            <text x="86" y="80" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              จับมือ TCP/TLS
            </text>

            {/* Segment 2: read 15s (x=160..572, w=412) */}
            <rect
              x="160"
              y="44"
              width="412"
              height="44"
              rx="8"
              fill="var(--surface)"
              stroke={current.isTimeout ? "var(--danger)" : "var(--brand)"}
              strokeWidth={current.isTimeout ? "1.8" : "1.4"}
              className={txClass}
            />
            <rect
              x="163"
              y="48"
              width={current.readFillW}
              height="36"
              rx="5"
              fill={tone.soft}
              className={txClass}
            />
            <line
              x1="168"
              y1="66"
              x2={163 + current.readFillW - 4}
              y2="66"
              stroke={tone.fg}
              strokeWidth="2.2"
              strokeDasharray={reduced ? undefined : "6 6"}
              className={flowClass}
            />
            <text
              x="366"
              y="63"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="var(--fg)"
              fontFamily="var(--font-mono)"
              style={{ paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 4 }}
            >
              read 15s (รอรับไบต์แรกและ body จากเซิร์ฟเวอร์)
            </text>
            <text
              x="366"
              y="80"
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill={tone.fg}
              fontFamily="var(--font-mono)"
              style={{ paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 4 }}
            >
              {current.isTimeout ? "เกิน 15.0s → ยกเลิกทันที!" : `ตอบกลับในขีดจำกัด (${current.pillText})`}
            </text>

            {/* Segment 3: Cutoff Wall (>15s) */}
            <rect
              x="578"
              y="44"
              width="84"
              height="44"
              rx="8"
              fill={current.isTimeout ? "var(--danger-soft)" : "var(--surface)"}
              stroke={current.isTimeout ? "var(--danger)" : "var(--line)"}
              strokeWidth={current.isTimeout ? "1.8" : "1.2"}
              strokeDasharray="4 3"
              className={txClass}
            />
            <text
              x="620"
              y="64"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill={current.isTimeout ? "var(--danger)" : "var(--muted)"}
              fontFamily="var(--font-mono)"
            >
              &gt;15s Cut
            </text>
            <text
              x="620"
              y="80"
              textAnchor="middle"
              fontSize="11"
              fill={current.isTimeout ? "var(--danger)" : "var(--muted)"}
              fontFamily="var(--font-sans)"
            >
              ห้ามค้าง ∞
            </text>

            {/* Time scale tick labels */}
            <text x="18" y="104" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
              0s
            </text>
            <text x="157" y="104" textAnchor="middle" fontSize="11" fill="var(--cyan)" fontFamily="var(--font-mono)">
              3s
            </text>
            <text x="572" y="104" textAnchor="middle" fontSize="11" fill={current.isTimeout ? "var(--danger)" : "var(--muted)"} fontFamily="var(--font-mono)">
              15s limit
            </text>
          </g>

          {/* Divider */}
          <line x1="18" y1="118" x2="662" y2="118" stroke="var(--hair)" />

          {/* Bottom 3-Card Flow: Client -> Response -> Policy */}
          {/* Card 1: httpx Client */}
          <g>
            <rect x="18" y="132" width="178" height="128" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
            <rect x="30" y="144" width="106" height="22" rx="6" fill="var(--brand-soft)" />
            <text x="83" y="159" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              httpx.Client
            </text>
            <text x="30" y="186" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
              POST /v1/classify
            </text>
            <text x="30" y="206" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
              connect=3s · read=15s
            </text>
            <rect x="30" y="220" width="154" height="26" rx="6" fill="var(--surface-2)" stroke="var(--hair)" />
            <text x="107" y="237" textAnchor="middle" fontSize="11" fill="var(--fg)" fontFamily="var(--font-sans)">
              {current.clientStatus}
            </text>
          </g>

          {/* Connector 1 */}
          <line
            x1="198"
            y1="196"
            x2="234"
            y2="196"
            stroke={tone.fg}
            strokeWidth="2.4"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowId})`}
          />

          {/* Card 2: HTTP Status / Exception */}
          <g>
            <rect
              x="240"
              y="132"
              width="180"
              height="128"
              rx="12"
              fill={tone.soft}
              stroke={tone.fg}
              strokeWidth="1.8"
              className={txClass}
            />
            <text x="330" y="164" textAnchor="middle" fontSize="14" fontWeight="700" fill={tone.fg} fontFamily="var(--font-mono)">
              {current.responseTitle}
            </text>
            <text x="330" y="184" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
              {current.responseSub}
            </text>
            <line x1="256" y1="198" x2="404" y2="198" stroke={tone.fg} strokeOpacity="0.3" />
            <text x="330" y="220" textAnchor="middle" fontSize="11" fill="var(--fg)" fontFamily="var(--font-sans)">
              {current.responseDetail}
            </text>
            <text x="330" y="242" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              {selected === "400" ? "Permanent (แก้โค้ด/ข้อมูล)" : selected === "200" ? "Complete (สำเร็จ)" : "Transient (ชั่วคราว)"}
            </text>
          </g>

          {/* Connector 2 */}
          <line
            x1="422"
            y1="196"
            x2="458"
            y2="196"
            stroke={tone.fg}
            strokeWidth="2.4"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowId})`}
          />

          {/* Card 3: Decision Policy */}
          <g>
            <rect
              x="464"
              y="132"
              width="198"
              height="128"
              rx="12"
              fill="var(--surface)"
              stroke={tone.fg}
              strokeWidth="1.8"
              className={txClass}
            />
            <rect x="476" y="144" width="174" height="28" rx="8" fill={tone.soft} stroke={tone.fg} strokeOpacity="0.5" />
            <text x="563" y="162" textAnchor="middle" fontSize="11" fontWeight="700" fill={tone.fg} fontFamily="var(--font-sans)">
              {current.actionBadge}
            </text>
            <text x="478" y="196" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
              • {current.actionLine1}
            </text>
            <text x="478" y="218" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              • {current.actionLine2}
            </text>
            <text x="478" y="244" fontSize="11" fontWeight="600" fill={tone.fg} fontFamily="var(--font-mono)">
              {selected === "200" ? "retry = False (done)" : selected === "400" ? "retry = False (raise)" : "retry = True (bounded)"}
            </text>
          </g>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {current.caption}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 3. RetryBackoffVisual (retry-backoff)                                      */
/* ========================================================================== */

type RetryMode = "fixed" | "backoff";

interface ClientTimeline {
  id: string;
  label: string;
  y: number;
  fixedTimes: number[];
  backoffTimes: number[];
  waitLabels: [string, string, string];
}

const CLIENT_TIMELINES: ClientTimeline[] = [
  {
    id: "A",
    label: "Client A",
    y: 50,
    fixedTimes: [2.0, 4.0, 6.0],
    backoffTimes: [1.1, 3.3, 7.5],
    waitLabels: ["+1.1s", "+2.2s", "+4.2s"],
  },
  {
    id: "B",
    label: "Client B",
    y: 92,
    fixedTimes: [2.0, 4.0, 6.0],
    backoffTimes: [1.5, 3.9, 8.3],
    waitLabels: ["+1.5s", "+2.4s", "+4.4s"],
  },
  {
    id: "C",
    label: "Client C",
    y: 134,
    fixedTimes: [2.0, 4.0, 6.0],
    backoffTimes: [0.9, 2.8, 6.9],
    waitLabels: ["+0.9s", "+1.9s", "+4.1s"],
  },
];

export function RetryBackoffVisual({ reduced = false }: VisualProps) {
  const [mode, setMode] = useState<RetryMode>("backoff");

  const isBackoff = mode === "backoff";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  // Timeline scale: 0s = 96, 1s = 62px -> 9s = 654
  const x0 = 96;
  const pxPerSec = 62;
  const toX = (sec: number) => Math.round(x0 + sec * pxPerSec);

  const captionText = isBackoff
    ? "Exponential Backoff + Jitter (tenacity): ระยะรอเพิ่มทวีคูณ (1s → 2s → 4s) พร้อมบวกค่าสุ่ม (jitter) ทำให้ Client A, B, C กระจายจังหวะยิงซ้ำออกจากกัน เซิร์ฟเวอร์ฟื้นตัวได้โดยไม่ถูกกระหน่ำพร้อมกัน"
    : "Fixed Retry (Thundering Herd!): ทั้ง 3 Client รอเท่ากันเป๊ะทุก 2 วินาที ทำให้คำขอพุ่งชนเซิร์ฟเวอร์พร้อมกันเป็นคลื่น (Spike x3) ที่วินาทีที่ 2s, 4s และ 6s จนเซิร์ฟเวอร์ล่มซ้ำ!";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับกลยุทธ์ Fixed Retry กับ Exponential Backoff + Jitter" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!isBackoff}
          className={!isBackoff ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isBackoff ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("fixed")}
        >
          Fixed Retry (Thundering Herd!)
        </button>
        <button
          type="button"
          aria-pressed={isBackoff}
          className={isBackoff ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isBackoff ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("backoff")}
        >
          Exponential Backoff + Jitter (tenacity)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพเปรียบเทียบไทม์ไลน์ Fixed Retry ที่ชนกันพร้อมกัน กับ Exponential Backoff + Jitter ที่กระจายเวลา"
        >
          {/* Header & Status Pill */}
          <text x="16" y="26" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            ไทม์ไลน์ Retry ของ 3 Clients หลัง API ตอบ 503 ที่ 0s
          </text>
          <rect
            x="458"
            y="10"
            width="206"
            height="24"
            rx="12"
            fill={isBackoff ? "var(--success-soft)" : "var(--danger-soft)"}
            stroke={isBackoff ? "var(--success)" : "var(--danger)"}
            className={txClass}
          />
          <text
            x="561"
            y="26"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={isBackoff ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {isBackoff ? "1s → 2s → 4s + jitter" : "Collision x3 @2s, 4s, 6s"}
          </text>

          {/* Vertical time gridlines (0s..9s) */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((sec) => {
            const gx = toX(sec);
            return (
              <g key={sec}>
                <line x1={gx} y1="42" x2={gx} y2="232" stroke="var(--hair)" strokeWidth="1" />
                <text x={gx} y="246" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  {sec}s
                </text>
              </g>
            );
          })}

          {/* Fixed mode: Vertical Thundering Herd collision bands */}
          {!isBackoff &&
            [2, 4, 6].map((sec) => {
              const cx = toX(sec);
              return (
                <g key={sec}>
                  <rect
                    x={cx - 11}
                    y="44"
                    width="22"
                    height="186"
                    rx="6"
                    fill="var(--danger-soft)"
                    stroke="var(--danger)"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                </g>
              );
            })}

          {/* 3 Client Lanes */}
          {CLIENT_TIMELINES.map((client) => {
            const times = isBackoff ? client.backoffTimes : client.fixedTimes;
            const cy = client.y + 15;
            const pts = [0, ...times];

            return (
              <g key={client.id}>
                <text x="16" y={cy + 4} fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
                  {client.label}
                </text>
                <rect x={x0} y={client.y} width="568" height="30" rx="8" fill="var(--surface)" stroke="var(--hair)" />

                {/* Wait segments between retries */}
                {[0, 1, 2].map((segIdx) => {
                  const sx = toX(pts[segIdx]) + 7;
                  const ex = toX(pts[segIdx + 1]) - 7;
                  const midX = (sx + ex) / 2;
                  const segLabel = isBackoff ? client.waitLabels[segIdx] : "2.0s";
                  return (
                    <g key={segIdx}>
                      <line
                        x1={sx}
                        y1={cy}
                        x2={ex}
                        y2={cy}
                        stroke={isBackoff ? "var(--cyan)" : "var(--warning)"}
                        strokeWidth="2.2"
                        strokeDasharray={reduced ? undefined : "6 6"}
                        className={flowClass}
                      />
                      <text
                        x={midX}
                        y={cy - 4}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill={isBackoff ? "var(--brand-ink)" : "var(--warning)"}
                        fontFamily="var(--font-mono)"
                      >
                        {segLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Initial 503 failure dot at t=0 */}
                <circle cx={toX(0)} cy={cy} r="6" fill="var(--danger)" />

                {/* 3 Retry dots */}
                {times.map((t, retryIdx) => {
                  const rx = toX(t);
                  const isFinalSuccess = isBackoff && retryIdx === 2;
                  const dotFill = isFinalSuccess
                    ? "var(--success)"
                    : isBackoff
                      ? "var(--brand)"
                      : "var(--danger)";

                  return (
                    <g key={retryIdx} className={txClass}>
                      <circle cx={rx} cy={cy} r="7" fill={dotFill} stroke="var(--surface)" strokeWidth="2" className={txClass} />
                      <text
                        x={rx}
                        y={cy + 3.5}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="var(--surface)"
                        fontFamily="var(--font-mono)"
                      >
                        {isFinalSuccess ? "✓" : retryIdx + 1}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Bottom Lane: Server Load Histogram */}
          <g>
            <text x="16" y="200" fontSize="12" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              API Load
            </text>
            <text x="16" y="216" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              ภาระปลายทาง
            </text>
            <rect x={x0} y="182" width="568" height="46" rx="8" fill="var(--surface)" stroke="var(--line)" />

            {!isBackoff ? (
              <>
                {[2, 4, 6].map((sec) => {
                  const sx = toX(sec);
                  return (
                    <g key={sec}>
                      <rect x={sx - 9} y="188" width="18" height="36" rx="4" fill="var(--danger)" className={txClass} />
                      <text x={sx} y="209" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--surface)" fontFamily="var(--font-mono)">
                        3x
                      </text>
                    </g>
                  );
                })}
                <text x="562" y="209" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                  คำขอชนพร้อมกัน → ล่มซ้ำ!
                </text>
              </>
            ) : (
              <>
                {CLIENT_TIMELINES.flatMap((c) =>
                  c.backoffTimes.map((t, idx) => ({
                    key: `${c.id}-${idx}`,
                    x: toX(t),
                    isSuccess: idx === 2,
                  }))
                ).map((bar) => (
                  <rect
                    key={bar.key}
                    x={bar.x - 5}
                    y="206"
                    width="10"
                    height="18"
                    rx="3"
                    fill={bar.isSuccess ? "var(--success)" : "var(--cyan)"}
                    className={txClass}
                  />
                ))}
                <text x="378" y="198" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--success)" fontFamily="var(--font-sans)">
                  โหลดกระจายสม่ำเสมอ (สูงสุด 1 req/จุด) → ฟื้นตัวและตอบ 200 OK ได้!
                </text>
              </>
            )}
          </g>

          {/* Compact Legend */}
          <g transform="translate(16, 260)">
            <circle cx="6" cy="6" r="5" fill="var(--danger)" />
            <text x="17" y="10" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              {isBackoff ? "Fail แรก (503)" : "Fail / ชนพร้อมกัน (Thundering Herd)"}
            </text>

            <rect x="220" y="1" width="14" height="10" rx="3" fill={isBackoff ? "var(--brand)" : "var(--warning)"} />
            <text x="240" y="10" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              {isBackoff ? "Retry แบบกระจายเวลา" : "รอเวลาตายตัว 2.0s เท่ากัน"}
            </text>

            <circle cx="424" cy="6" r="5" fill="var(--success)" />
            <text x="435" y="10" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              ลองใหม่สำเร็จ (200 OK)
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
/* 4. CircuitBreakerVisual (circuit-breaker)                                  */
/* ========================================================================== */

type BreakerState = "closed" | "open" | "half-open";

interface BreakerSpec {
  id: BreakerState;
  label: string;
  badge: string;
  tone: "success" | "danger" | "warning";
  trafficLabel: string;
  behaviorTitle: string;
  behaviorLine1: string;
  behaviorLine2: string;
  idemStatus: string;
  idemDetail: string;
  caption: string;
}

const BREAKER_SPECS: BreakerSpec[] = [
  {
    id: "closed",
    label: "Closed (Normal)",
    badge: "CLOSED · ปกติ",
    tone: "success",
    trafficLabel: "100% traffic → API",
    behaviorTitle: "ส่งคำขอผ่านตามปกติ + นับ error",
    behaviorLine1: "ทุกคำขอวิ่งตรงไปที่ Upstream API",
    behaviorLine2: "หากพังติดกัน ≥ 5 ครั้ง จะดีดไป Open",
    idemStatus: "บันทึกผลครั้งที่ 1 ด้วย key=req-9f2a",
    idemDetail: "ผูกผลลัพธ์กับคีย์ไว้กันการทำงานซ้ำ",
    caption:
      "Closed (Normal): วงจรปิดทำงานปกติ คำขอทั้งหมดส่งถึง API พร้อมแนบ Idempotency-Key และนับจำนวน error สะสม — ถ้าล้มติดกันถึงเกณฑ์ (เช่น 5 ครั้ง) จะตัดวงจรทันที",
  },
  {
    id: "open",
    label: "Open (Fast Fallback)",
    badge: "OPEN · ตัดวงจร",
    tone: "danger",
    trafficLabel: "0% API · 1ms Fallback",
    behaviorTitle: "ไม่ยิง API ที่ล่ม · คืน Fallback ทันที",
    behaviorLine1: "ป้องกันไม่ให้คำขอค้างสะสมจนระบบเราล่มตาม",
    behaviorLine2: "รอครบเวลา cooldown (30s) แล้วเข้า Half-Open",
    idemStatus: "เก็บ key=req-9f2a เดิมไว้รอส่งใหม่",
    idemDetail: "ไม่สร้างคีย์ใหม่ ป้องกันรายการซ้อนตอนลองซ้ำ",
    caption:
      "Open (Fast Fallback): วงจรถูกเปิดออก คำขอใหม่จะถูกดีดกลับหรือส่ง Fallback ทันทีใน ~1ms โดยไม่ซ้ำเติม API ที่กำลังล่ม และรอจนครบ cooldown 30s จึงค่อยทดลองใหม่",
  },
  {
    id: "half-open",
    label: "Half-Open (Probe)",
    badge: "HALF-OPEN · ทดสอบ",
    tone: "warning",
    trafficLabel: "1 probe → API",
    behaviorTitle: "ปล่อยคำขอทดสอบ (Probe) เพียง 1 รายการ",
    behaviorLine1: "ถ้า Probe ตอบ 200 OK → กลับสู่ Closed",
    behaviorLine2: "ถ้า Probe ยังพัง → กลับไป Open นับ 30s ใหม่",
    idemStatus: "ยิง Probe ซ้ำด้วย key=req-9f2a เดิม",
    idemDetail: "หากรอบก่อนสำเร็จแล้ว จะคืนผลเดิมไม่ทำซ้ำ",
    caption:
      "Half-Open (Probe): ปล่อยคำขอทดสอบ 1 รายการพร้อม Idempotency-Key เดิม (req-9f2a) เพื่อเช็กว่า API ฟื้นหรือยัง และรับประกันว่าจะไม่เกิดผลข้างเคียงซ้ำซ้อน เช่น ตัดเงินหรือสร้าง Ticket ซ้ำ",
  },
];

export function CircuitBreakerVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [state, setState] = useState<BreakerState>("closed");

  const current = BREAKER_SPECS.find((s) => s.id === state) ?? BREAKER_SPECS[0];
  const tone = getToneVars(current.tone);
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowDanger = `${uid}-cb-danger`;
  const arrowWarn = `${uid}-cb-warn`;
  const arrowSuccess = `${uid}-cb-success`;
  const arrowMuted = `${uid}-cb-muted`;
  const arrowBrand = `${uid}-cb-brand`;

  const closedActive = state === "closed";
  const openActive = state === "open";
  const halfActive = state === "half-open";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกสถานะของ Circuit Breaker" className="flex flex-wrap gap-2">
        {BREAKER_SPECS.map((item) => {
          const active = item.id === state;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setState(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพ State Machine สามเหลี่ยมของ Circuit Breaker และการทำงานของ Idempotency-Key"
        >
          <defs>
            <marker id={arrowDanger} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id={arrowWarn} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--warning)" />
            </marker>
            <marker id={arrowSuccess} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
            <marker id={arrowMuted} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--muted)" />
            </marker>
            <marker id={arrowBrand} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
          </defs>

          {/* Left Panel Backdrop: State Machine Triangle */}
          <rect x="12" y="12" width="372" height="256" rx="12" fill="var(--surface)" stroke="var(--hair)" />

          {/* Edge 1: Closed -> Open (right side) */}
          <path
            d="M 264 56 Q 326 96 312 170"
            fill="none"
            stroke={closedActive ? "var(--danger)" : "var(--line)"}
            strokeWidth={closedActive ? "2.4" : "1.6"}
            strokeDasharray={closedActive && !reduced ? "6 6" : undefined}
            className={closedActive ? flowClass : txClass}
            markerEnd={`url(#${closedActive ? arrowDanger : arrowMuted})`}
          />
          <rect
            x="270"
            y="102"
            width="78"
            height="20"
            rx="6"
            fill={closedActive ? "var(--danger-soft)" : "var(--surface-2)"}
            stroke={closedActive ? "var(--danger)" : "var(--hair)"}
          />
          <text
            x="309"
            y="116"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={closedActive ? "var(--danger)" : "var(--muted)"}
            fontFamily="var(--font-mono)"
          >
            error ≥ 5
          </text>

          {/* Edge 2: Open -> Half-Open (bottom) */}
          <path
            d="M 244 218 Q 198 242 154 218"
            fill="none"
            stroke={openActive ? "var(--warning)" : "var(--line)"}
            strokeWidth={openActive ? "2.4" : "1.6"}
            strokeDasharray={openActive && !reduced ? "6 6" : undefined}
            className={openActive ? flowClass : txClass}
            markerEnd={`url(#${openActive ? arrowWarn : arrowMuted})`}
          />
          <rect
            x="148"
            y="238"
            width="100"
            height="20"
            rx="6"
            fill={openActive ? "var(--warning-soft)" : "var(--surface-2)"}
            stroke={openActive ? "var(--warning)" : "var(--hair)"}
          />
          <text
            x="198"
            y="252"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={openActive ? "var(--warning)" : "var(--muted)"}
            fontFamily="var(--font-mono)"
          >
            cooldown 30s
          </text>

          {/* Edge 3: Half-Open -> Closed (left side) */}
          <path
            d="M 84 172 Q 70 96 130 56"
            fill="none"
            stroke={halfActive ? "var(--success)" : "var(--line)"}
            strokeWidth={halfActive ? "2.4" : "1.6"}
            strokeDasharray={halfActive && !reduced ? "6 6" : undefined}
            className={halfActive ? flowClass : txClass}
            markerEnd={`url(#${halfActive ? arrowSuccess : arrowMuted})`}
          />
          <rect
            x="40"
            y="102"
            width="92"
            height="20"
            rx="6"
            fill={halfActive ? "var(--success-soft)" : "var(--surface-2)"}
            stroke={halfActive ? "var(--success)" : "var(--hair)"}
          />
          <text
            x="86"
            y="116"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={halfActive ? "var(--success)" : "var(--muted)"}
            fontFamily="var(--font-mono)"
          >
            probe 200 OK
          </text>

          {/* Edge 4 (subtle return): Half-Open -> Open when probe fails */}
          <line
            x1="154"
            y1="196"
            x2="238"
            y2="196"
            stroke={halfActive ? "var(--danger)" : "var(--hair)"}
            strokeWidth={halfActive ? "1.8" : "1.2"}
            strokeDasharray="4 4"
            markerEnd={halfActive ? `url(#${arrowDanger})` : undefined}
          />
          <text
            x="196"
            y="190"
            textAnchor="middle"
            fontSize="10"
            fontWeight={halfActive ? "700" : "500"}
            fill={halfActive ? "var(--danger)" : "var(--muted)"}
            fontFamily="var(--font-mono)"
          >
            probe fail →
          </text>

          {/* Center live traffic badge inside triangle */}
          <rect x="136" y="132" width="124" height="24" rx="12" fill={tone.soft} stroke={tone.fg} className={txClass} />
          <text x="198" y="148" textAnchor="middle" fontSize="10" fontWeight="700" fill={tone.fg} fontFamily="var(--font-mono)">
            {current.trafficLabel}
          </text>

          {/* Node 1: Closed (Top) */}
          <g
            role="button"
            tabIndex={0}
            aria-label="เลือกสถานะ Closed (Normal)"
            aria-pressed={closedActive}
            onClick={() => setState("closed")}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setState("closed"))}
            style={{ cursor: "pointer" }}
          >
            {closedActive && !reduced ? (
              <rect
                x="130"
                y="21"
                width="136"
                height="58"
                rx="14"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2"
                className="svg-pulse"
              />
            ) : null}
            <rect
              x="133"
              y="24"
              width="130"
              height="52"
              rx="11"
              fill={closedActive ? "var(--success-soft)" : "var(--surface-2)"}
              stroke={closedActive ? "var(--success)" : "var(--line)"}
              strokeWidth={closedActive ? "2" : "1.3"}
              className={txClass}
            />
            <text
              x="198"
              y="46"
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill={closedActive ? "var(--success)" : "var(--fg)"}
              fontFamily="var(--font-mono)"
            >
              Closed
            </text>
            <text x="198" y="64" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              ปกติ · ส่งผ่าน API
            </text>
          </g>

          {/* Node 2: Half-Open (Bottom-Left) */}
          <g
            role="button"
            tabIndex={0}
            aria-label="เลือกสถานะ Half-Open (Probe)"
            aria-pressed={halfActive}
            onClick={() => setState("half-open")}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setState("half-open"))}
            style={{ cursor: "pointer" }}
          >
            {halfActive && !reduced ? (
              <rect
                x="19"
                y="173"
                width="134"
                height="58"
                rx="14"
                fill="none"
                stroke="var(--warning)"
                strokeWidth="2"
                className="svg-pulse"
              />
            ) : null}
            <rect
              x="22"
              y="176"
              width="128"
              height="52"
              rx="11"
              fill={halfActive ? "var(--warning-soft)" : "var(--surface-2)"}
              stroke={halfActive ? "var(--warning)" : "var(--line)"}
              strokeWidth={halfActive ? "2" : "1.3"}
              className={txClass}
            />
            <text
              x="86"
              y="198"
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill={halfActive ? "var(--warning)" : "var(--fg)"}
              fontFamily="var(--font-mono)"
            >
              Half-Open
            </text>
            <text x="86" y="216" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              ส่ง 1 Probe ทดสอบ
            </text>
          </g>

          {/* Node 3: Open (Bottom-Right) */}
          <g
            role="button"
            tabIndex={0}
            aria-label="เลือกสถานะ Open (Fast Fallback)"
            aria-pressed={openActive}
            onClick={() => setState("open")}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setState("open"))}
            style={{ cursor: "pointer" }}
          >
            {openActive && !reduced ? (
              <rect
                x="243"
                y="173"
                width="134"
                height="58"
                rx="14"
                fill="none"
                stroke="var(--danger)"
                strokeWidth="2"
                className="svg-pulse"
              />
            ) : null}
            <rect
              x="246"
              y="176"
              width="128"
              height="52"
              rx="11"
              fill={openActive ? "var(--danger-soft)" : "var(--surface-2)"}
              stroke={openActive ? "var(--danger)" : "var(--line)"}
              strokeWidth={openActive ? "2" : "1.3"}
              className={txClass}
            />
            <text
              x="310"
              y="198"
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill={openActive ? "var(--danger)" : "var(--fg)"}
              fontFamily="var(--font-mono)"
            >
              Open
            </text>
            <text x="310" y="216" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              ตัดวงจร · Fallback
            </text>
          </g>

          {/* Right Top Card: Active Breaker Behavior */}
          <g>
            <rect
              x="396"
              y="12"
              width="272"
              height="118"
              rx="12"
              fill="var(--surface)"
              stroke={tone.fg}
              strokeWidth="1.6"
              className={txClass}
            />
            <rect x="408" y="22" width="128" height="22" rx="7" fill={tone.soft} stroke={tone.fg} strokeOpacity="0.45" />
            <text x="472" y="37" textAnchor="middle" fontSize="11" fontWeight="700" fill={tone.fg} fontFamily="var(--font-mono)">
              {current.badge}
            </text>

            <text x="408" y="64" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
              {current.behaviorTitle}
            </text>
            <text x="408" y="84" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              • {current.behaviorLine1}
            </text>
            <text x="408" y="102" fontSize="11" fill="var(--muted)" fontFamily="var(--font-sans)">
              • {current.behaviorLine2}
            </text>

            {/* Mini animated route indicator */}
            <line
              x1="548"
              y1="33"
              x2="652"
              y2="33"
              stroke={tone.fg}
              strokeWidth="2.2"
              strokeDasharray={reduced ? undefined : "6 6"}
              className={flowClass}
              markerEnd={`url(#${current.tone === "success" ? arrowSuccess : current.tone === "danger" ? arrowDanger : arrowWarn})`}
            />
          </g>

          {/* Right Bottom Card: Idempotency-Key Protection */}
          <g>
            <rect
              x="396"
              y="142"
              width="272"
              height="126"
              rx="12"
              fill="var(--surface)"
              stroke="var(--brand)"
              strokeWidth="1.6"
            />
            <text x="408" y="164" fontSize="12" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              Idempotency-Key
            </text>
            <rect x="556" y="150" width="100" height="20" rx="6" fill="var(--brand-soft)" />
            <text x="606" y="164" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              key=req-9f2a
            </text>
            <line x1="408" y1="175" x2="656" y2="175" stroke="var(--hair)" />

            {/* Dedupe flow line */}
            <line
              x1="414"
              y1="194"
              x2="452"
              y2="194"
              stroke="var(--brand)"
              strokeWidth="2"
              strokeDasharray={reduced ? undefined : "6 6"}
              className={flowClass}
              markerEnd={`url(#${arrowBrand})`}
            />
            <text x="460" y="198" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
              1) รอบแรก: บันทึกผลผูกกับคีย์
            </text>
            <text x="460" y="216" fontSize="11" fontWeight="600" fill="var(--cyan)" fontFamily="var(--font-sans)">
              2) ยิงซ้ำ: พบคีย์เดิม → คืนผลเดิม
            </text>

            <rect x="408" y="226" width="248" height="32" rx="8" fill={tone.soft} stroke={tone.fg} strokeOpacity="0.45" className={txClass} />
            <text x="532" y="240" textAnchor="middle" fontSize="10" fontWeight="700" fill={tone.fg} fontFamily="var(--font-sans)">
              {current.idemStatus}
            </text>
            <text x="532" y="253" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-sans)">
              {current.idemDetail}
            </text>
          </g>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {current.caption}
      </p>
    </div>
  );
}
