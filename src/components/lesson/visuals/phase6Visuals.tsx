"use client";

import { useState, type KeyboardEvent } from "react";

interface VisualProps {
  reduced?: boolean;
}

/* ============================================================================
 * 7. CapstoneAdrVisual (D157 — 5-Layer Capstone Architecture + ADR Rationale)
 * ========================================================================== */

interface AdrLayer {
  id: string;
  code: string;
  adrId: string;
  name: string;
  techTag: string;
  decision1: string;
  decision2: string;
  tradeoff1: string;
  tradeoff2: string;
  metric: string;
  caption: string;
}

const ADR_LAYERS: AdrLayer[] = [
  {
    id: "client",
    code: "L1",
    adrId: "ADR-001",
    name: "Client / SSE",
    techTag: "SSE Stream",
    decision1: "ใช้ Server-Sent Events (SSE)",
    decision2: "สตรีมคำตอบทีละโทเคนแทนรอจบ",
    tradeoff1: "สื่อสารทางเดียว แต่ตั้งค่าง่าย",
    tradeoff2: "ผ่าน Proxy/HTTP2 ได้ดีกว่า WS",
    metric: "TTFT < 300 ms",
    caption:
      "ADR-001 (Client / SSE): เลือก SSE แทน WebSocket เพื่อความเรียบง่ายในการเชื่อมต่อผ่านไฟร์วอลล์องค์กร และลดเวลาที่ผู้ใช้ต้องรอคำแรก (TTFT)",
  },
  {
    id: "gateway",
    code: "L2",
    adrId: "ADR-002",
    name: "FastAPI + PDPA",
    techTag: "Gateway + PII",
    decision1: "รวม Lifespan Pool + Pydantic",
    decision2: "และ PDPA Middleware ด่านหน้า",
    tradeoff1: "เพิ่ม latency สแกน ~10 ms",
    tradeoff2: "แลกกับการกัน PII รั่ว 100%",
    metric: "PII Leak = 0%",
    caption:
      "ADR-002 (FastAPI + PDPA): บังคับตรวจสอบ Schema และปิดบังข้อมูลส่วนบุคคลที่ Gateway ชั้นเดียว เพื่อรับประกันว่าไม่มี PII หลุดออกนอกระบบ",
  },
  {
    id: "router",
    code: "L3",
    adrId: "ADR-003",
    name: "LangGraph Router",
    techTag: "State + Guard",
    decision1: "แยกเส้นทาง FAQ / Tool / HITL",
    decision2: "พร้อมตัวนับ max_steps = 3",
    tradeoff1: "ออกแบบกราฟละเอียดกว่าแชตตรง",
    tradeoff2: "แต่คุมต้นทุนและหยุดลูปได้ชัวร์",
    metric: "max_steps <= 3",
    caption:
      "ADR-003 (LangGraph Router): ใช้กราฟมีสถานะชัดเจนเพื่อกำหนดเงื่อนไขหยุดลูปและจุดอนุมัติโดยมนุษย์ (HITL) ก่อนดำเนินการที่เสี่ยง",
  },
  {
    id: "retrieval",
    code: "L4",
    adrId: "ADR-004",
    name: "Hybrid RAG + MCP",
    techTag: "RRF + JSON-RPC",
    decision1: "ผสาน BM25+Dense+Rerank",
    decision2: "และเรียกเครื่องมือผ่าน MCP",
    tradeoff1: "ดูแล Index 2 แบบ + Server แยก",
    tradeoff2: "ได้ทั้งความแม่นยำและความปลอดภัย",
    metric: "Recall@5 >= 0.85",
    caption:
      "ADR-004 (Hybrid RAG + MCP): ใช้ Hybrid Search + Reranker แก้ปัญหาคำศัพท์ไทย/รหัสเอกสาร และแยกสิทธิ์ฐานข้อมูลผ่านมาตรฐาน MCP",
  },
  {
    id: "obs",
    code: "L5",
    adrId: "ADR-005",
    name: "Langfuse + Eval CI",
    techTag: "Traces + Gate",
    decision1: "เก็บ Trace ทุกคำขอ + วัดต้นทุน",
    decision2: "และรัน Golden Eval บน CI ก่อนปล่อย",
    tradeoff1: "เพิ่มเวลา build บน CI 2-3 นาที",
    tradeoff2: "แต่กัน Regression ก่อนถึงลูกค้า",
    metric: "Eval Gate >= 85%",
    caption:
      "ADR-005 (Langfuse + Eval CI): ผูก Observability และชุดทดสอบอัตโนมัติใน CI เพื่อให้ทุกการแก้ Prompt หรือ Model ตรวจสอบคุณภาพและต้นทุนต่อ 1,000 คำขอได้จริง",
  },
];

export function CapstoneAdrVisual({ reduced = false }: VisualProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const active = ADR_LAYERS[activeIndex];
  const flowClass = reduced ? "transition-all duration-300" : "svg-flow-line transition-all duration-300";

  function onLayerKeyDown(idx: number, event: KeyboardEvent<SVGGElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveIndex(idx);
    }
  }

  const activeLayerCenterY = 38 + activeIndex * 50;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="เลือกชั้นสถาปัตยกรรมเพื่ออ่าน ADR">
        {ADR_LAYERS.map((layer, idx) => {
          const isSelected = activeIndex === idx;
          return (
            <button
              key={layer.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setActiveIndex(idx)}
              className={isSelected ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={
                isSelected
                  ? {
                      borderColor: "var(--brand)",
                      background: "var(--brand-soft)",
                      color: "var(--brand-ink)",
                    }
                  : undefined
              }
            >
              {layer.code} · {layer.name}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 276"
          className="block h-auto w-full"
          role="img"
          aria-label={`พิมพ์เขียวสถาปัตยกรรม 5 ชั้น กำลังแสดง ${active.adrId}: ${active.name}`}
        >
          <defs>
            <marker id="adr-arrow-brand" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
          </defs>

          {/* Vertical connectors between stacked layers */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="186"
              y1={58 + i * 50}
              x2="186"
              y2={68 + i * 50}
              stroke="var(--line)"
              strokeWidth="2"
            />
          ))}

          {/* 5 Clickable Architecture Layers (Left) */}
          {ADR_LAYERS.map((layer, idx) => {
            const y = 18 + idx * 50;
            const isSelected = idx === activeIndex;
            return (
              <g
                key={layer.id}
                role="button"
                tabIndex={0}
                aria-label={`เลือกดูเหตุผลสถาปัตยกรรม ${layer.name}`}
                onClick={() => setActiveIndex(idx)}
                onKeyDown={(e) => onLayerKeyDown(idx, e)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x="16"
                  y={y}
                  width="340"
                  height="40"
                  rx="10"
                  fill={isSelected ? "var(--brand-soft)" : "var(--surface)"}
                  stroke={isSelected ? "var(--brand)" : "var(--line)"}
                  strokeWidth={isSelected ? "1.75" : "1"}
                  className="transition-all duration-300"
                />
                <rect
                  x="26"
                  y={y + 8}
                  width="34"
                  height="24"
                  rx="6"
                  fill={isSelected ? "var(--surface)" : "var(--surface-2)"}
                />
                <text
                  x="43"
                  y={y + 24}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={isSelected ? "var(--brand-ink)" : "var(--muted)"}
                >
                  {layer.code}
                </text>
                <text
                  x="72"
                  y={y + 25}
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                  fill={isSelected ? "var(--brand-ink)" : "var(--fg)"}
                >
                  {layer.name}
                </text>
                <text
                  x="344"
                  y={y + 24}
                  textAnchor="end"
                  fontSize="12"
                  fontFamily="var(--font-mono)"
                  fill="var(--muted)"
                >
                  {layer.techTag}
                </text>
              </g>
            );
          })}

          {/* Animated connector from active layer to ADR Card */}
          <path
            d={`M 356 ${activeLayerCenterY} C 378 ${activeLayerCenterY}, 376 138, 396 138`}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.25"
            strokeDasharray="6 6"
            markerEnd="url(#adr-arrow-brand)"
            className={flowClass}
          />

          {/* Right Panel: ADR Rationale Card */}
          <rect
            x="402"
            y="18"
            width="262"
            height="240"
            rx="14"
            fill="var(--surface)"
            stroke="var(--brand)"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          <rect x="418" y="32" width="76" height="24" rx="8" fill="var(--brand-soft)" />
          <text
            x="456"
            y="48"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill="var(--brand-ink)"
          >
            {active.adrId}
          </text>
          <text x="504" y="48" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.name}
          </text>

          <text x="418" y="80" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
            การตัดสินใจ (Decision)
          </text>
          <text x="418" y="100" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.decision1}
          </text>
          <text x="418" y="118" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.decision2}
          </text>

          <line x1="418" y1="132" x2="648" y2="132" stroke="var(--hair)" />

          <text x="418" y="152" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--muted)">
            ข้อแลกเปลี่ยน (Trade-off)
          </text>
          <text x="418" y="172" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.tradeoff1}
          </text>
          <text x="418" y="190" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.tradeoff2}
          </text>

          <rect x="418" y="210" width="230" height="32" rx="8" fill="var(--success-soft)" stroke="var(--success)" />
          <text
            x="533"
            y="230"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill="var(--success)"
          >
            Target: {active.metric}
          </text>
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {active.caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 8. RetrievalBenchmarkVisual (D164 — Dense vs Hybrid vs Cross-Encoder Rerank)
 * ========================================================================== */

type BenchmarkMetricId = "recall5" | "mrr";

interface BenchmarkBar {
  id: string;
  line1: string;
  line2: string;
  recall5: number;
  mrr: number;
  fill: string;
  stroke: string;
  textColor: string;
}

const BENCHMARK_BARS: BenchmarkBar[] = [
  {
    id: "dense",
    line1: "Dense Only",
    line2: "(Vector เดี่ยว)",
    recall5: 0.68,
    mrr: 0.59,
    fill: "var(--warning-soft)",
    stroke: "var(--warning)",
    textColor: "var(--warning)",
  },
  {
    id: "hybrid",
    line1: "Hybrid BM25+Dense",
    line2: "(RRF Merge)",
    recall5: 0.81,
    mrr: 0.74,
    fill: "var(--cyan-soft)",
    stroke: "var(--cyan)",
    textColor: "var(--cyan)",
  },
  {
    id: "rerank",
    line1: "Hybrid + Rerank",
    line2: "(Cross-Encoder)",
    recall5: 0.89,
    mrr: 0.86,
    fill: "var(--success-soft)",
    stroke: "var(--success)",
    textColor: "var(--success)",
  },
];

const TARGET_SCORE = 0.85;
const CHART_BASE_Y = 212;
const CHART_HEIGHT = 176;

export function RetrievalBenchmarkVisual({ reduced = false }: VisualProps) {
  const [metric, setMetric] = useState<BenchmarkMetricId>("recall5");
  const flowClass = reduced ? "transition-all duration-300" : "svg-flow-line transition-all duration-300";

  const targetY = CHART_BASE_Y - TARGET_SCORE * CHART_HEIGHT;
  const caption =
    metric === "recall5"
      ? "ผลวัด Recall@5: การใช้ Dense เดี่ยวได้เพียง 0.68 เมื่อเติม Hybrid BM25+Dense ขยับเป็น 0.81 และเมื่อเพิ่ม Cross-Encoder Rerank จึงทะลุเกณฑ์ Milestone Target (0.85) ขึ้นไปที่ 0.89 (+0.21)"
      : "ผลวัด MRR (Mean Reciprocal Rank): วัดความสามารถในการดันคำตอบที่ถูกต้องขึ้นอันดับ 1 — Dense เดี่ยวได้ 0.59, Hybrid ได้ 0.74 และ Hybrid + Cross-Encoder Rerank แตะ 0.86 ผ่านเกณฑ์ 0.85";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="สลับตัวชี้วัดผลทดสอบ Retrieval">
        {(
          [
            { id: "recall5", label: "Recall@5" },
            { id: "mrr", label: "MRR" },
          ] as const
        ).map((item) => {
          const isSelected = metric === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setMetric(item.id)}
              className={isSelected ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={
                isSelected
                  ? {
                      borderColor: "var(--brand)",
                      background: "var(--brand-soft)",
                      color: "var(--brand-ink)",
                    }
                  : undefined
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 268"
          className="block h-auto w-full"
          role="img"
          aria-label={`กราฟแท่งเปรียบเทียบผลทดสอบ Retrieval ด้วยตัวชี้วัด ${metric === "recall5" ? "Recall@5" : "MRR"} เทียบกับเกณฑ์ 0.85`}
        >
          {/* Chart background plate */}
          <rect x="58" y="20" width="604" height="192" rx="10" fill="var(--surface)" stroke="var(--hair)" />

          {/* Y-axis gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = CHART_BASE_Y - tick * CHART_HEIGHT;
            return (
              <g key={tick}>
                <line x1="58" y1={y} x2="662" y2={y} stroke="var(--hair)" strokeWidth="1" />
                <text
                  x="48"
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fontFamily="var(--font-mono)"
                  fill="var(--muted)"
                >
                  {tick.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Milestone Target 0.85 Dashed Line */}
          <line
            x1="58"
            y1={targetY}
            x2="662"
            y2={targetY}
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray="6 6"
            className={flowClass}
          />
          <rect x="68" y={targetY - 26} width="166" height="22" rx="6" fill="var(--brand-soft)" stroke="var(--brand)" />
          <text
            x="151"
            y={targetY - 11}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill="var(--brand-ink)"
          >
            Milestone Target: 0.85
          </text>

          {/* Animated Bars */}
          {BENCHMARK_BARS.map((bar, idx) => {
            const val = metric === "recall5" ? bar.recall5 : bar.mrr;
            const barH = val * CHART_HEIGHT;
            const barY = CHART_BASE_Y - barH;
            const barX = 104 + idx * 192;
            const barW = 132;
            const passed = val >= TARGET_SCORE;

            return (
              <g key={bar.id}>
                <rect
                  x={barX}
                  y={barY}
                  width={barW}
                  height={barH}
                  rx="8"
                  fill={bar.fill}
                  stroke={bar.stroke}
                  strokeWidth="1.75"
                  className="transition-all duration-300"
                />
                {/* Score value above bar */}
                <text
                  x={barX + barW / 2}
                  y={barY - 8}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={bar.textColor}
                  className="transition-all duration-300"
                >
                  {val.toFixed(2)}
                </text>
                {/* Pass/Below badge inside bar */}
                <text
                  x={barX + barW / 2}
                  y={barY + 24}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="var(--font-sans)"
                  fill={passed ? "var(--success)" : "var(--muted)"}
                  className="transition-all duration-300"
                >
                  {passed ? "✓ ผ่านเกณฑ์" : "ต่ำกว่า 0.85"}
                </text>

                {/* X-axis 2-line labels */}
                <text
                  x={barX + barW / 2}
                  y="234"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                  fill="var(--fg)"
                >
                  {bar.line1}
                </text>
                <text
                  x={barX + barW / 2}
                  y="252"
                  textAnchor="middle"
                  fontSize="12"
                  fontFamily="var(--font-sans)"
                  fill="var(--muted)"
                >
                  {bar.line2}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 9. CapstoneRubricVisual (D180 — 4-Pillar Production Readiness Checklist)
 * ========================================================================== */

interface RubricPillar {
  id: string;
  num: string;
  shortTitle: string;
  metricBadge: string;
  subLabel: string;
  criterionTitle: string;
  check1: string;
  check2: string;
  artifactName: string;
  gateLabel: string;
  caption: string;
}

const RUBRIC_PILLARS: RubricPillar[] = [
  {
    id: "retrieval",
    num: "01",
    shortTitle: "Retrieval ≥ 0.85",
    metricBadge: "≥ 0.85",
    subLabel: "Recall@5 & MRR",
    criterionTitle: "เสาที่ 1: ความแม่นยำการค้นหา (Retrieval Quality)",
    check1: "• Recall@5 ≥ 0.85 และ Faithfulness ≥ 0.85 บน Golden Set",
    check2: "• เทียบ Baseline (Dense) กับ Hybrid + Rerank ชัดเจน",
    artifactName: "eval_report.json",
    gateLabel: "QUALITY GATE",
    caption:
      "เกณฑ์จบเสาที่ 1 (Retrieval ≥ 0.85): ระบบต้องพิสูจน์ด้วยชุดทดสอบ Golden Set ว่าการค้นหาและอ้างอิงผ่านเกณฑ์ 0.85 และลดอาการแต่งเรื่องได้จริง",
  },
  {
    id: "schema",
    num: "02",
    shortTitle: "Schema ≥ 99% & Safe Tools",
    metricBadge: "≥ 99%",
    subLabel: "Pydantic + MCP",
    criterionTitle: "เสาที่ 2: โครงสร้างข้อมูลและเครื่องมือปลอดภัย",
    check1: "• Structured Output ผ่าน Pydantic Schema ≥ 99% พร้อม Fallback",
    check2: "• MCP แยกสิทธิ์ Read/Write มี HITL และ max_steps กันลูป",
    artifactName: "pytest + schema CI",
    gateLabel: "RELIABILITY GATE",
    caption:
      "เกณฑ์จบเสาที่ 2 (Schema ≥ 99% & Safe Tools): ผลลัพธ์ JSON ต้องเสถียรระดับ Production และทุกการเรียกเครื่องมือผ่านกรอบสิทธิ์ของ MCP และ Loop Guard",
  },
  {
    id: "traces",
    num: "03",
    shortTitle: "Traces + Cost/1k",
    metricBadge: "Cost/1k",
    subLabel: "Langfuse + SLO",
    criterionTitle: "เสาที่ 3: การเฝ้าระวังและคุมต้นทุน (Observability)",
    check1: "• บันทึก Trace ครบทุก Span (Retrieval, LLM, Tool) บน Langfuse",
    check2: "• รายงานค่า Latency (TTFT/P95) และต้นทุนต่อ 1,000 คำขอได้จริง",
    artifactName: "langfuse_traces",
    gateLabel: "OPS GATE",
    caption:
      "เกณฑ์จบเสาที่ 3 (Traces + Cost/1k): ต้องมองเห็นทุกขั้นตอนใน Trace เมื่อเกิดปัญหา และคำนวณต้นทุนต่อ 1,000 คำขอเพื่อวางแผนงบประมาณจริงได้",
  },
  {
    id: "security",
    num: "04",
    shortTitle: "OWASP & PDPA ≥ 90%",
    metricBadge: "≥ 90%",
    subLabel: "Red-Team + PII",
    criterionTitle: "เสาที่ 4: ความปลอดภัย OWASP LLM & พ.ร.บ. PDPA",
    check1: "• ป้องกัน Prompt Injection / OWASP LLM Top 10 ผ่านเกณฑ์ ≥ 90%",
    check2: "• PDPA ปิดบังบัตรประชาชน เบอร์โทร อีเมลก่อนส่ง LLM & Log",
    artifactName: "security_audit.md",
    gateLabel: "SECURITY GATE",
    caption:
      "เกณฑ์จบเสาที่ 4 (OWASP & PDPA ≥ 90%): ผ่านการทดสอบเจาะระบบ Red-Team เบื้องต้น และยืนยันได้ว่าไม่มีข้อมูลส่วนบุคคลรั่วไหลออกสู่ภายนอกหรือ Audit Log",
  },
];

export function CapstoneRubricVisual({ reduced = false }: VisualProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const active = RUBRIC_PILLARS[selectedIdx];
  const flowClass = reduced ? "transition-all duration-300" : "svg-flow-line transition-all duration-300";

  function onPillarKeyDown(idx: number, event: KeyboardEvent<SVGGElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedIdx(idx);
    }
  }

  const activeCenterX = 93 + selectedIdx * 164;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="เลือกเสาหลักเกณฑ์ผ่าน Capstone">
        {RUBRIC_PILLARS.map((pillar, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={pillar.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedIdx(idx)}
              className={isSelected ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={
                isSelected
                  ? {
                      borderColor: "var(--success)",
                      background: "var(--success-soft)",
                      color: "var(--success)",
                    }
                  : undefined
              }
            >
              {pillar.num}. {pillar.shortTitle}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="block h-auto w-full"
          role="img"
          aria-label={`เกณฑ์ประเมินความพร้อม Production 4 เสาหลัก กำลังขยายรายละเอียดของ ${active.shortTitle}`}
        >
          <defs>
            <marker id="rubric-arrow-success" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* 4 Interactive Pillar Cards */}
          {RUBRIC_PILLARS.map((pillar, idx) => {
            const x = 16 + idx * 164;
            const isSelected = idx === selectedIdx;
            return (
              <g
                key={pillar.id}
                role="button"
                tabIndex={0}
                aria-label={`ดูเกณฑ์ผ่าน ${pillar.shortTitle}`}
                onClick={() => setSelectedIdx(idx)}
                onKeyDown={(e) => onPillarKeyDown(idx, e)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x}
                  y="14"
                  width="154"
                  height="112"
                  rx="12"
                  fill={isSelected ? "var(--success-soft)" : "var(--surface)"}
                  stroke={isSelected ? "var(--success)" : "var(--line)"}
                  strokeWidth={isSelected ? "2" : "1"}
                  className="transition-all duration-300"
                />
                {/* Pillar Badge */}
                <rect
                  x={x + 12}
                  y="26"
                  width="44"
                  height="24"
                  rx="12"
                  fill={isSelected ? "var(--surface)" : "var(--surface-2)"}
                  stroke={isSelected ? "var(--success)" : "var(--hair)"}
                />
                <text
                  x={x + 34}
                  y="42"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={isSelected ? "var(--success)" : "var(--muted)"}
                >
                  {isSelected ? "✓ " : ""}
                  {pillar.num}
                </text>

                {/* Key metric */}
                <text
                  x={x + 142}
                  y="43"
                  textAnchor="end"
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={isSelected ? "var(--success)" : "var(--brand-ink)"}
                >
                  {pillar.metricBadge}
                </text>

                {/* Pillar label */}
                <text
                  x={x + 12}
                  y="78"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                  fill="var(--fg)"
                >
                  {idx === 0
                    ? "Retrieval"
                    : idx === 1
                      ? "Schema & Tools"
                      : idx === 2
                        ? "Traces & Cost"
                        : "OWASP & PDPA"}
                </text>
                <text
                  x={x + 12}
                  y="102"
                  fontSize="12"
                  fontFamily="var(--font-mono)"
                  fill="var(--muted)"
                >
                  {pillar.subLabel}
                </text>
              </g>
            );
          })}

          {/* Animated connector from active pillar to criterion panel */}
          <line
            x1={activeCenterX}
            y1="126"
            x2={activeCenterX}
            y2="148"
            stroke="var(--success)"
            strokeWidth="2.25"
            strokeDasharray="6 6"
            markerEnd="url(#rubric-arrow-success)"
            className={flowClass}
          />

          {/* Expanded Graduation Acceptance Criterion Panel */}
          <rect
            x="16"
            y="154"
            width="648"
            height="112"
            rx="14"
            fill="var(--surface)"
            stroke="var(--success)"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />

          <text x="32" y="182" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
            {active.criterionTitle}
          </text>
          <text x="32" y="212" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.check1}
          </text>
          <text x="32" y="238" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.check2}
          </text>

          {/* Right Verification Artifact Badge */}
          <rect
            x="484"
            y="170"
            width="164"
            height="80"
            rx="10"
            fill="var(--success-soft)"
            stroke="var(--success)"
          />
          <text
            x="566"
            y="194"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill="var(--success)"
          >
            {active.gateLabel}
          </text>
          <text
            x="566"
            y="218"
            textAnchor="middle"
            fontSize="12"
            fontFamily="var(--font-mono)"
            fill="var(--fg)"
          >
            {active.artifactName}
          </text>
          <text
            x="566"
            y="238"
            textAnchor="middle"
            fontSize="12"
            fontFamily="var(--font-sans)"
            fill="var(--muted)"
          >
            หลักฐานตรวจรับจบ
          </text>
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {active.caption}
      </div>
    </div>
  );
}
