"use client";

import { useState } from "react";

interface VisualProps {
  reduced?: boolean;
}

/* ============================================================================
 * 1. HybridRrfVisual (D101 — Hybrid Search + Reciprocal Rank Fusion)
 * ========================================================================== */

type HybridQueryId = "invoice" | "refund";

interface RankedDoc {
  rank: number;
  code: string;
  label: string;
  highlight?: boolean;
}

interface MergedDoc {
  rank: number;
  code: string;
  label: string;
  score: string;
  ranksLabel: string;
  winner?: boolean;
}

interface HybridScenario {
  id: HybridQueryId;
  query: string;
  bm25: RankedDoc[];
  dense: RankedDoc[];
  merged: MergedDoc[];
  bm25Note: string;
  denseNote: string;
  caption: string;
}

const HYBRID_SCENARIOS: Record<HybridQueryId, HybridScenario> = {
  invoice: {
    id: "invoice",
    query: "ขอเช็ก #INV-2026-009",
    bm25: [
      { rank: 1, code: "D-09", label: "#INV-2026-009", highlight: true },
      { rank: 2, code: "D-08", label: "#INV-2026-008" },
      { rank: 3, code: "G-01", label: "คู่มือเช็กใบแจ้งหนี้" },
    ],
    dense: [
      { rank: 1, code: "G-01", label: "คู่มือเช็กใบแจ้งหนี้" },
      { rank: 2, code: "D-09", label: "#INV-2026-009", highlight: true },
      { rank: 3, code: "P-04", label: "นโยบายการชำระเงิน" },
    ],
    merged: [
      {
        rank: 1,
        code: "D-09",
        label: "#INV-2026-009",
        score: "0.0325",
        ranksLabel: "BM25 #1 + Dense #2",
        winner: true,
      },
      {
        rank: 2,
        code: "G-01",
        label: "คู่มือเช็กใบแจ้งหนี้",
        score: "0.0323",
        ranksLabel: "BM25 #3 + Dense #1",
      },
      {
        rank: 3,
        code: "D-08",
        label: "#INV-2026-008",
        score: "0.0315",
        ranksLabel: "BM25 #2 + Dense #5",
      },
    ],
    bm25Note: "ตรงรหัสเป๊ะ",
    denseNote: "เน้นความหมายทั่วไป",
    caption:
      "เมื่อคำถามมีรหัสเฉพาะ #INV-2026-009 ฝั่ง BM25 ดันเอกสารรหัสตรงตัวขึ้นอันดับ 1 ทันที และ RRF (1/(60+rank)) รวมคะแนนกับ Dense อันดับ 2 จนได้คะแนนสูงสุด 0.0325 ไม่หลุดไปตอบแค่คู่มือทั่วไป",
  },
  refund: {
    id: "refund",
    query: "นโยบายคืนเงินล่าช้า",
    bm25: [
      { rank: 1, code: "S-11", label: "แจ้งพัสดุจัดส่งล่าช้า" },
      { rank: 2, code: "P-07", label: "คืนยอดบัตร 7-14 วัน", highlight: true },
      { rank: 3, code: "F-02", label: "แบบฟอร์มขอคืนเงิน" },
    ],
    dense: [
      { rank: 1, code: "P-07", label: "คืนยอดบัตร 7-14 วัน", highlight: true },
      { rank: 2, code: "P-09", label: "ข้อยกเว้นคืนเงินล่าช้า" },
      { rank: 3, code: "F-02", label: "แบบฟอร์มขอคืนเงิน" },
    ],
    merged: [
      {
        rank: 1,
        code: "P-07",
        label: "คืนยอดบัตร 7-14 วัน",
        score: "0.0325",
        ranksLabel: "BM25 #2 + Dense #1",
        winner: true,
      },
      {
        rank: 2,
        code: "F-02",
        label: "แบบฟอร์มขอคืนเงิน",
        score: "0.0317",
        ranksLabel: "BM25 #3 + Dense #3",
      },
      {
        rank: 3,
        code: "P-09",
        label: "ข้อยกเว้นคืนเงินล่าช้า",
        score: "0.0315",
        ranksLabel: "BM25 #5 + Dense #2",
      },
    ],
    bm25Note: "ติดคำ “ล่าช้า”",
    denseNote: "เข้าใจบริบทคืนเงิน",
    caption:
      "เมื่อคำถามใช้ภาษาเชิงความหมาย BM25 อาจติดคำว่า “ล่าช้า” จากเอกสารพัสดุ แต่ Dense Vector ดึงเอกสารคืนยอด 7-14 วันขึ้นมาอันดับ 1 และ RRF รวมอันดับทั้งสองฝั่งจนเอกสารนโยบายที่ถูกต้องชนะที่ 0.0325",
  },
};

export function HybridRrfVisual({ reduced = false }: VisualProps) {
  const [queryId, setQueryId] = useState<HybridQueryId>("invoice");
  const active = HYBRID_SCENARIOS[queryId];
  const flowClass = reduced ? "transition-all duration-300" : "svg-flow-line transition-all duration-300";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="เลือกตัวอย่างคำค้นหา Hybrid Search">
        {(["invoice", "refund"] as const).map((id) => {
          const item = HYBRID_SCENARIOS[id];
          const isSelected = queryId === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setQueryId(id)}
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
              {item.query}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="block h-auto w-full"
          role="img"
          aria-label={`แผนภาพ Hybrid Search และ RRF สำหรับคำค้นหา ${active.query}`}
        >
          <defs>
            <marker id="rrf-arrow-brand" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id="rrf-arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id="rrf-arrow-success" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Top query bar */}
          <rect
            x="140"
            y="10"
            width="400"
            height="32"
            rx="16"
            fill="var(--surface)"
            stroke="var(--brand)"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          <text
            x="162"
            y="30"
            fontSize="12"
            fontWeight="600"
            fontFamily="var(--font-mono)"
            fill="var(--brand-ink)"
          >
            Query:
          </text>
          <text
            x="216"
            y="30"
            fontSize="13"
            fontWeight="600"
            fontFamily="var(--font-sans)"
            fill="var(--fg)"
          >
            {active.query}
          </text>

          {/* BM25 Panel (Top-Left) */}
          <rect
            x="16"
            y="54"
            width="224"
            height="102"
            rx="12"
            fill="var(--surface)"
            stroke={queryId === "invoice" ? "var(--brand)" : "var(--line)"}
            strokeWidth={queryId === "invoice" ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text x="28" y="74" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            BM25
          </text>
          <text x="68" y="74" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            {active.bm25Note}
          </text>
          {active.bm25.map((doc, idx) => {
            const rowY = 82 + idx * 23;
            return (
              <g key={doc.code} className="transition-all duration-300">
                <rect
                  x="24"
                  y={rowY}
                  width="208"
                  height="20"
                  rx="6"
                  fill={doc.highlight ? "var(--brand-soft)" : "var(--surface-2)"}
                />
                <text
                  x="32"
                  y={rowY + 14}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  fill={doc.highlight ? "var(--brand-ink)" : "var(--muted)"}
                >
                  #{doc.rank}
                </text>
                <text
                  x="56"
                  y={rowY + 14}
                  fontSize="12"
                  fontWeight={doc.highlight ? "600" : "400"}
                  fontFamily="var(--font-sans)"
                  fill="var(--fg)"
                >
                  {doc.label}
                </text>
              </g>
            );
          })}

          {/* Dense Vector Panel (Bottom-Left) */}
          <rect
            x="16"
            y="166"
            width="224"
            height="102"
            rx="12"
            fill="var(--surface)"
            stroke={queryId === "refund" ? "var(--cyan)" : "var(--line)"}
            strokeWidth={queryId === "refund" ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text x="28" y="186" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--cyan)">
            Dense
          </text>
          <text x="72" y="186" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            {active.denseNote}
          </text>
          {active.dense.map((doc, idx) => {
            const rowY = 194 + idx * 23;
            return (
              <g key={doc.code} className="transition-all duration-300">
                <rect
                  x="24"
                  y={rowY}
                  width="208"
                  height="20"
                  rx="6"
                  fill={doc.highlight ? "var(--cyan-soft)" : "var(--surface-2)"}
                />
                <text
                  x="32"
                  y={rowY + 14}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  fill={doc.highlight ? "var(--cyan)" : "var(--muted)"}
                >
                  #{doc.rank}
                </text>
                <text
                  x="56"
                  y={rowY + 14}
                  fontSize="12"
                  fontWeight={doc.highlight ? "600" : "400"}
                  fontFamily="var(--font-sans)"
                  fill="var(--fg)"
                >
                  {doc.label}
                </text>
              </g>
            );
          })}

          {/* Animated flow paths: BM25 -> RRF, Dense -> RRF, RRF -> Top-3 */}
          <path
            d="M 240 105 C 258 105, 256 146, 272 146"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray="6 6"
            markerEnd="url(#rrf-arrow-brand)"
            className={flowClass}
          />
          <path
            d="M 240 217 C 258 217, 256 176, 272 176"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="2"
            strokeDasharray="6 6"
            markerEnd="url(#rrf-arrow-cyan)"
            className={flowClass}
          />
          <path
            d="M 384 161 L 414 161"
            fill="none"
            stroke="var(--success)"
            strokeWidth="2.25"
            strokeDasharray="6 6"
            markerEnd="url(#rrf-arrow-success)"
            className={flowClass}
          />

          {/* Center RRF Formula Box */}
          <rect
            x="276"
            y="122"
            width="108"
            height="78"
            rx="12"
            fill="var(--brand-soft)"
            stroke="var(--brand)"
            strokeWidth="1.5"
          />
          <text
            x="330"
            y="146"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill="var(--brand-ink)"
          >
            RRF Merge
          </text>
          <text
            x="330"
            y="168"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fontFamily="var(--font-mono)"
            fill="var(--fg)"
          >
            1/(k + rank)
          </text>
          <text
            x="330"
            y="188"
            textAnchor="middle"
            fontSize="12"
            fontFamily="var(--font-mono)"
            fill="var(--muted)"
          >
            k = 60
          </text>

          {/* Merged RRF Top-3 Box (Right) */}
          <rect
            x="420"
            y="54"
            width="244"
            height="214"
            rx="12"
            fill="var(--surface)"
            stroke="var(--success)"
            strokeWidth="1.75"
          />
          <text x="434" y="76" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
            ผลลัพธ์รวม RRF (Top-3)
          </text>
          {active.merged.map((item, idx) => {
            const cardY = 88 + idx * 58;
            return (
              <g key={item.code} className="transition-all duration-300">
                <rect
                  x="432"
                  y={cardY}
                  width="220"
                  height="50"
                  rx="10"
                  fill={item.winner ? "var(--success-soft)" : "var(--surface-2)"}
                  stroke={item.winner ? "var(--success)" : "var(--hair)"}
                  strokeWidth={item.winner ? "1.5" : "1"}
                />
                <text
                  x="444"
                  y={cardY + 20}
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={item.winner ? "var(--success)" : "var(--muted)"}
                >
                  #{item.rank}
                </text>
                <text
                  x="468"
                  y={cardY + 20}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="var(--font-sans)"
                  fill="var(--fg)"
                >
                  {item.label}
                </text>
                <text
                  x="444"
                  y={cardY + 39}
                  fontSize="12"
                  fontFamily="var(--font-mono)"
                  fill="var(--muted)"
                >
                  {item.ranksLabel}
                </text>
                <text
                  x="642"
                  y={cardY + 39}
                  textAnchor="end"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={item.winner ? "var(--success)" : "var(--brand-ink)"}
                >
                  {item.score}
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
        {active.caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. McpArchitectureVisual (D113 — Model Context Protocol 4-Step Sequence)
 * ========================================================================== */

interface McpStep {
  index: number;
  buttonLabel: string;
  methodTag: string;
  caption: string;
}

const MCP_STEPS: McpStep[] = [
  {
    index: 0,
    buttonLabel: "1. Discover tools/list",
    methodTag: "tools/list",
    caption:
      "ขั้นที่ 1: MCP Client ขอรายการเครื่องมือและทรัพยากรจาก MCP Server ผ่าน JSON-RPC method `tools/list` เพื่อรู้ schema และพารามิเตอร์ที่เรียกใช้ได้อย่างปลอดภัย",
  },
  {
    index: 1,
    buttonLabel: "2. User asks question",
    methodTag: "intent -> tool",
    caption:
      "ขั้นที่ 2: ผู้ใช้ถามผ่าน Host (LLM App) เช่น “สถานะออเดอร์ #8841” โมเดลจับคู่คำถามกับ tool schema ที่ค้นพบไว้แล้วและส่งคำขอให้ MCP Client ดำเนินการ",
  },
  {
    index: 2,
    buttonLabel: "3. Client calls tools/call",
    methodTag: "tools/call",
    caption:
      "ขั้นที่ 3: MCP Client ส่ง JSON-RPC `tools/call` พร้อมอาร์กิวเมนต์ที่ตรวจสอบชนิดข้อมูลแล้วไปยัง MCP Server โดย Host ไม่ต้องถือรหัสผ่านฐานข้อมูลโดยตรง",
  },
  {
    index: 3,
    buttonLabel: "4. Server returns safe result",
    methodTag: "safe result",
    caption:
      "ขั้นที่ 4: MCP Server ค้นข้อมูลจาก Tools/Resources ตามสิทธิ์แบบ Read-only และส่งผลลัพธ์ที่กรองข้อมูลลับแล้วกลับผ่าน Client ให้ Host สรุปคำตอบอย่างแม่นยำ",
  },
];

export function McpArchitectureVisual({ reduced = false }: VisualProps) {
  const [step, setStep] = useState<number>(0);
  const current = MCP_STEPS[step];
  const flowClass = reduced ? "transition-all duration-300" : "svg-flow-line transition-all duration-300";

  const laneOpacity = (idx: number) => (idx === step ? 1 : idx < step ? 0.65 : 0.24);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="เลือกขั้นตอนการทำงานของ MCP">
        {MCP_STEPS.map((item) => {
          const isSelected = step === item.index;
          return (
            <button
              key={item.index}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setStep(item.index)}
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
              {item.buttonLabel}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 272"
          className="block h-auto w-full"
          role="img"
          aria-label={`แผนภาพลำดับ JSON-RPC ของ MCP ขั้นตอนที่ ${step + 1}: ${current.buttonLabel}`}
        >
          <defs>
            <marker id="mcp-arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id="mcp-arrow-brand" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id="mcp-arrow-warning" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--warning)" />
            </marker>
            <marker id="mcp-arrow-success" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Lifelines */}
          <line x1="100" y1="68" x2="100" y2="256" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="340" y1="68" x2="340" y2="256" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="576" y1="68" x2="576" y2="256" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Actor 1: Host */}
          <rect
            x="22"
            y="14"
            width="156"
            height="54"
            rx="12"
            fill={step === 1 || step === 3 ? "var(--brand-soft)" : "var(--surface)"}
            stroke={step === 1 || step === 3 ? "var(--brand)" : "var(--line)"}
            strokeWidth={step === 1 || step === 3 ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text x="100" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            Host (LLM App)
          </text>
          <text x="100" y="55" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            ผู้ใช้ + แชตบอต
          </text>

          {/* Actor 2: MCP Client */}
          <rect
            x="258"
            y="14"
            width="164"
            height="54"
            rx="12"
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="1.75"
            className="transition-all duration-300"
          />
          <text x="340" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            MCP Client
          </text>
          <text x="340" y="55" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--cyan)">
            JSON-RPC 2.0
          </text>

          {/* Actor 3: MCP Server */}
          <rect
            x="490"
            y="14"
            width="172"
            height="54"
            rx="12"
            fill={step === 0 || step === 2 || step === 3 ? "var(--success-soft)" : "var(--surface)"}
            stroke={step === 0 || step === 2 || step === 3 ? "var(--success)" : "var(--line)"}
            strokeWidth={step === 0 || step === 2 || step === 3 ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text x="576" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            MCP Server
          </text>
          <text x="576" y="55" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--success)">
            Tools &amp; Resources
          </text>

          {/* Step 1 Lane: Discover tools/list */}
          <g style={{ opacity: laneOpacity(0) }} className="transition-all duration-300">
            <rect
              x="362"
              y="78"
              width="192"
              height="24"
              rx="8"
              fill={step === 0 ? "var(--cyan-soft)" : "var(--surface)"}
              stroke={step === 0 ? "var(--cyan)" : "var(--hair)"}
            />
            <text
              x="458"
              y="94"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={step === 0 ? "var(--cyan)" : "var(--muted)"}
            >
              1. tools/list → schemas
            </text>
            <line
              x1="346"
              y1="110"
              x2="568"
              y2="110"
              stroke="var(--cyan)"
              strokeWidth={step === 0 ? "2.5" : "1.5"}
              strokeDasharray="6 6"
              markerEnd="url(#mcp-arrow-cyan)"
              className={step === 0 ? flowClass : "transition-all duration-300"}
            />
          </g>

          {/* Step 2 Lane: User asks question */}
          <g style={{ opacity: laneOpacity(1) }} className="transition-all duration-300">
            <rect
              x="116"
              y="124"
              width="208"
              height="24"
              rx="8"
              fill={step === 1 ? "var(--brand-soft)" : "var(--surface)"}
              stroke={step === 1 ? "var(--brand)" : "var(--hair)"}
            />
            <text
              x="220"
              y="140"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-sans)"
              fill={step === 1 ? "var(--brand-ink)" : "var(--muted)"}
            >
              2. &ldquo;เช็กออเดอร์ #8841&rdquo;
            </text>
            <line
              x1="106"
              y1="156"
              x2="332"
              y2="156"
              stroke="var(--brand)"
              strokeWidth={step === 1 ? "2.5" : "1.5"}
              strokeDasharray="6 6"
              markerEnd="url(#mcp-arrow-brand)"
              className={step === 1 ? flowClass : "transition-all duration-300"}
            />
          </g>

          {/* Step 3 Lane: Client calls tools/call */}
          <g style={{ opacity: laneOpacity(2) }} className="transition-all duration-300">
            <rect
              x="356"
              y="170"
              width="204"
              height="24"
              rx="8"
              fill={step === 2 ? "var(--warning-soft)" : "var(--surface)"}
              stroke={step === 2 ? "var(--warning)" : "var(--hair)"}
            />
            <text
              x="458"
              y="186"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={step === 2 ? "var(--warning)" : "var(--muted)"}
            >
              3. tools/call(get_order)
            </text>
            <line
              x1="346"
              y1="202"
              x2="568"
              y2="202"
              stroke="var(--warning)"
              strokeWidth={step === 2 ? "2.5" : "1.5"}
              strokeDasharray="6 6"
              markerEnd="url(#mcp-arrow-warning)"
              className={step === 2 ? flowClass : "transition-all duration-300"}
            />
          </g>

          {/* Step 4 Lane: Server returns safe result */}
          <g style={{ opacity: laneOpacity(3) }} className="transition-all duration-300">
            <rect
              x="166"
              y="214"
              width="344"
              height="24"
              rx="8"
              fill={step === 3 ? "var(--success-soft)" : "var(--surface)"}
              stroke={step === 3 ? "var(--success)" : "var(--hair)"}
            />
            <text
              x="338"
              y="230"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={step === 3 ? "var(--success)" : "var(--muted)"}
            >
              4. result: &#123;status:&quot;shipped&quot;, safe:true&#125;
            </text>
            <line
              x1="570"
              y1="246"
              x2="108"
              y2="246"
              stroke="var(--success)"
              strokeWidth={step === 3 ? "2.5" : "1.5"}
              strokeDasharray="6 6"
              markerEnd="url(#mcp-arrow-success)"
              className={step === 3 ? flowClass : "transition-all duration-300"}
            />
          </g>
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {current.caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. LangGraphLoopVisual (D117 — Stateful Graph, Router, HITL & Loop Guard)
 * ========================================================================== */

type LangGraphScenarioId = "rag" | "hitl" | "guard";

interface LangGraphScenario {
  id: LangGraphScenarioId;
  label: string;
  routeName: string;
  stepsUsed: number;
  maxSteps: number;
  stateSummary: string;
  badgeText: string;
  caption: string;
}

const LANGGRAPH_SCENARIOS: Record<LangGraphScenarioId, LangGraphScenario> = {
  rag: {
    id: "rag",
    label: "FAQ → RAG Path",
    routeName: "rag_node",
    stepsUsed: 1,
    maxSteps: 3,
    stateSummary: 'route="rag" · hits=3',
    badgeText: "ผ่านเส้นทางความรู้ (1/3)",
    caption:
      "เส้นทาง FAQ: Router อ่าน State แล้วเลือก Edge ไปยังโหนด RAG Retrieve เพื่อดึงเอกสารนโยบายและตอบจบใน 1 ก้าว (Step Budget เหลือเฟือ)",
  },
  hitl: {
    id: "hitl",
    label: "Order Lookup → Tool + HITL",
    routeName: "tool_hitl",
    stepsUsed: 2,
    maxSteps: 3,
    stateSummary: 'route="tool" · hitl=ok',
    badgeText: "รอคนอนุมัติก่อนแก้ข้อมูล (2/3)",
    caption:
      "เส้นทาง Order Lookup: Router ส่งต่อโหนด Tool + HITL เพื่อเรียก API ตรวจสอบและพักรอการยืนยันจากเจ้าหน้าที่ (Human-in-the-Loop) ก่อนคืนคำตอบอย่างปลอดภัย",
  },
  guard: {
    id: "guard",
    label: "Loop Guard (max_steps=3)",
    routeName: "fallback",
    stepsUsed: 3,
    maxSteps: 3,
    stateSummary: "steps=3 >= max (STOP)",
    badgeText: "หยุดลูปอัตโนมัติ (3/3)",
    caption:
      "เส้นทาง Loop Guard: เมื่อเครื่องมือล้มเหลวและวนกลับ Router จนตัวนับ Step Budget ครบ 3/3 เงื่อนไขป้องกันลูปจะบังคับออกทาง Fallback Guard เพื่อส่งต่อเจ้าหน้าที่ แทนที่จะวนไม่รู้จบและผลาญค่า Token",
  },
};

export function LangGraphLoopVisual({ reduced = false }: VisualProps) {
  const [scenarioId, setScenarioId] = useState<LangGraphScenarioId>("rag");
  const active = LANGGRAPH_SCENARIOS[scenarioId];
  const flowClass = reduced ? "transition-all duration-300" : "svg-flow-line transition-all duration-300";

  const isRag = scenarioId === "rag";
  const isHitl = scenarioId === "hitl";
  const isGuard = scenarioId === "guard";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="เลือกสถานการณ์การทำงานของ LangGraph">
        {(["rag", "hitl", "guard"] as const).map((id) => {
          const item = LANGGRAPH_SCENARIOS[id];
          const isSelected = scenarioId === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setScenarioId(id)}
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
          viewBox="0 0 680 280"
          className="block h-auto w-full"
          role="img"
          aria-label={`แผนภาพ LangGraph แสดงสถานะและตัวนับก้าว สำหรับสถานการณ์ ${active.label}`}
        >
          <defs>
            <marker id="lg-arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id="lg-arrow-brand" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id="lg-arrow-danger" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id="lg-arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--line)" />
            </marker>
          </defs>

          {/* Top-Left: GraphState pill */}
          <rect x="16" y="12" width="292" height="44" rx="10" fill="var(--surface)" stroke="var(--line)" />
          <text x="28" y="30" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            State
          </text>
          <text x="74" y="30" fontSize="12" fontFamily="var(--font-mono)" fill="var(--fg)">
            {active.stateSummary}
          </text>
          <text x="28" y="48" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            {active.badgeText}
          </text>

          {/* Top-Right: Step Budget Counter */}
          <rect
            x="434"
            y="12"
            width="230"
            height="44"
            rx="10"
            fill={isGuard ? "var(--danger-soft)" : "var(--surface)"}
            stroke={isGuard ? "var(--danger)" : "var(--line)"}
            strokeWidth={isGuard ? "1.5" : "1"}
            className="transition-all duration-300"
          />
          <text
            x="448"
            y="30"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isGuard ? "var(--danger)" : "var(--fg)"}
          >
            Step Budget: {active.stepsUsed}/{active.maxSteps}
          </text>
          {[1, 2, 3].map((slot) => {
            const filled = slot <= active.stepsUsed;
            const slotFill = !filled
              ? "var(--surface-2)"
              : isGuard
                ? "var(--danger)"
                : isHitl
                  ? "var(--warning)"
                  : "var(--success)";
            return (
              <rect
                key={slot}
                x={448 + (slot - 1) * 64}
                y="38"
                width="56"
                height="9"
                rx="4.5"
                fill={slotFill}
                stroke="var(--hair)"
                className="transition-all duration-300"
              />
            );
          })}

          {/* Retry Loop arc above Router (active in guard mode) */}
          <path
            d="M 224 138 C 246 86, 152 86, 174 138"
            fill="none"
            stroke={isGuard ? "var(--danger)" : "var(--line)"}
            strokeWidth={isGuard ? "2.25" : "1.25"}
            strokeDasharray="6 6"
            markerEnd={isGuard ? "url(#lg-arrow-danger)" : "url(#lg-arrow-muted)"}
            className={isGuard ? flowClass : "transition-all duration-300"}
            style={{ opacity: isGuard ? 1 : 0.35 }}
          />
          <text
            x="199"
            y="84"
            textAnchor="middle"
            fontSize="12"
            fontWeight={isGuard ? "700" : "400"}
            fontFamily="var(--font-mono)"
            fill={isGuard ? "var(--danger)" : "var(--muted)"}
          >
            retry (+1 step)
          </text>

          {/* Edge: Query -> Router */}
          <line
            x1="104"
            y1="170"
            x2="134"
            y2="170"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray="6 6"
            markerEnd="url(#lg-arrow-brand)"
            className={flowClass}
          />

          {/* Edge: Router -> RAG */}
          <path
            d="M 256 154 C 282 154, 282 104, 304 104"
            fill="none"
            stroke={isRag ? "var(--cyan)" : "var(--line)"}
            strokeWidth={isRag ? "2.5" : "1.25"}
            strokeDasharray="6 6"
            markerEnd={isRag ? "url(#lg-arrow-cyan)" : "url(#lg-arrow-muted)"}
            className={isRag ? flowClass : "transition-all duration-300"}
          />
          {/* Edge: RAG -> Final */}
          <path
            d="M 468 104 C 494 104, 496 158, 520 158"
            fill="none"
            stroke={isRag ? "var(--cyan)" : "var(--line)"}
            strokeWidth={isRag ? "2.5" : "1.25"}
            strokeDasharray="6 6"
            markerEnd={isRag ? "url(#lg-arrow-cyan)" : "url(#lg-arrow-muted)"}
            className={isRag ? flowClass : "transition-all duration-300"}
          />

          {/* Edge: Router -> Tool+HITL */}
          <line
            x1="256"
            y1="170"
            x2="304"
            y2="170"
            stroke={isHitl ? "var(--brand)" : "var(--line)"}
            strokeWidth={isHitl ? "2.5" : "1.25"}
            strokeDasharray="6 6"
            markerEnd={isHitl ? "url(#lg-arrow-brand)" : "url(#lg-arrow-muted)"}
            className={isHitl ? flowClass : "transition-all duration-300"}
          />
          {/* Edge: Tool+HITL -> Final */}
          <line
            x1="468"
            y1="170"
            x2="520"
            y2="170"
            stroke={isHitl ? "var(--brand)" : "var(--line)"}
            strokeWidth={isHitl ? "2.5" : "1.25"}
            strokeDasharray="6 6"
            markerEnd={isHitl ? "url(#lg-arrow-brand)" : "url(#lg-arrow-muted)"}
            className={isHitl ? flowClass : "transition-all duration-300"}
          />

          {/* Edge: Router -> Fallback Guard */}
          <path
            d="M 256 186 C 282 186, 282 236, 304 236"
            fill="none"
            stroke={isGuard ? "var(--danger)" : "var(--line)"}
            strokeWidth={isGuard ? "2.5" : "1.25"}
            strokeDasharray="6 6"
            markerEnd={isGuard ? "url(#lg-arrow-danger)" : "url(#lg-arrow-muted)"}
            className={isGuard ? flowClass : "transition-all duration-300"}
          />
          {/* Edge: Fallback Guard -> Final */}
          <path
            d="M 468 236 C 494 236, 496 182, 520 182"
            fill="none"
            stroke={isGuard ? "var(--danger)" : "var(--line)"}
            strokeWidth={isGuard ? "2.5" : "1.25"}
            strokeDasharray="6 6"
            markerEnd={isGuard ? "url(#lg-arrow-danger)" : "url(#lg-arrow-muted)"}
            className={isGuard ? flowClass : "transition-all duration-300"}
          />

          {/* Node: Query Input */}
          <rect x="16" y="144" width="88" height="52" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="60" y="167" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            Input
          </text>
          <text x="60" y="185" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            คำถาม
          </text>

          {/* Node: Router */}
          <rect
            x="140"
            y="140"
            width="116"
            height="60"
            rx="14"
            fill="var(--brand-soft)"
            stroke="var(--brand)"
            strokeWidth="1.75"
          />
          <text x="198" y="166" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
            Router
          </text>
          <text x="198" y="186" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            ตรวจ State
          </text>

          {/* Branch 1: RAG Retrieve */}
          <rect
            x="310"
            y="78"
            width="158"
            height="52"
            rx="12"
            fill={isRag ? "var(--cyan-soft)" : "var(--surface)"}
            stroke={isRag ? "var(--cyan)" : "var(--line)"}
            strokeWidth={isRag ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text
            x="389"
            y="101"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={isRag ? "var(--cyan)" : "var(--fg)"}
          >
            RAG Retrieve
          </text>
          <text x="389" y="120" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            ค้นคลังความรู้ FAQ
          </text>

          {/* Branch 2: Tool + HITL */}
          <rect
            x="310"
            y="144"
            width="158"
            height="52"
            rx="12"
            fill={isHitl ? "var(--warning-soft)" : "var(--surface)"}
            stroke={isHitl ? "var(--warning)" : "var(--line)"}
            strokeWidth={isHitl ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text
            x="389"
            y="167"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={isHitl ? "var(--warning)" : "var(--fg)"}
          >
            Tool + HITL
          </text>
          <text x="389" y="186" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            เรียก API + คนอนุมัติ
          </text>

          {/* Branch 3: Fallback Guard */}
          <rect
            x="310"
            y="210"
            width="158"
            height="52"
            rx="12"
            fill={isGuard ? "var(--danger-soft)" : "var(--surface)"}
            stroke={isGuard ? "var(--danger)" : "var(--line)"}
            strokeWidth={isGuard ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text
            x="389"
            y="233"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={isGuard ? "var(--danger)" : "var(--fg)"}
          >
            Fallback Guard
          </text>
          <text x="389" y="252" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            หยุดลูป + ส่งเจ้าหน้าที่
          </text>

          {/* Node: Final Response / END */}
          <rect
            x="526"
            y="144"
            width="138"
            height="52"
            rx="12"
            fill="var(--success-soft)"
            stroke="var(--success)"
            strokeWidth="1.5"
          />
          <text x="595" y="167" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
            END / Answer
          </text>
          <text x="595" y="186" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {isGuard ? "ส่งต่อทีมซัพพอร์ต" : "ตอบพร้อมอ้างอิง"}
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
