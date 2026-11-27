"use client";

import { useState, type KeyboardEvent } from "react";

interface VisualProps {
  reduced?: boolean;
}

/* ============================================================================
 * 4. RagTriadVisual (D129 — RAG Evaluation Triad)
 * ========================================================================== */

type TriadMetricId = "faithfulness" | "precision" | "recall";

interface TriadMetric {
  id: TriadMetricId;
  label: string;
  thaiName: string;
  scoreSample: string;
  diagnosisLine1: string;
  diagnosisLine2: string;
  fixCategory: string;
  fixDetail1: string;
  fixDetail2: string;
  accentColor: string;
  softColor: string;
  caption: string;
}

const TRIAD_METRICS: Record<TriadMetricId, TriadMetric> = {
  faithfulness: {
    id: "faithfulness",
    label: "Faithfulness",
    thaiName: "ความซื่อสัตย์ต่อบริบท",
    scoreSample: "0.64 (เสี่ยงแต่งเรื่อง)",
    diagnosisLine1: "LLM ตอบเกินข้อมูลใน",
    diagnosisLine2: "Retrieved Context",
    fixCategory: "แก้ที่ Prompt & Grounding",
    fixDetail1: "• บังคับอ้างอิงแหล่งที่มา",
    fixDetail2: "• สั่งตอบ “ไม่พบข้อมูล” เมื่อไม่ชัด",
    accentColor: "var(--warning)",
    softColor: "var(--warning-soft)",
    caption:
      "Faithfulness (บริบท ↔ คำตอบ): วัดว่าคำตอบยึดตามเอกสารที่ค้นมาจริงหรือไม่ หากคะแนนต่ำให้แก้ที่ฝั่ง Generation เช่น System Prompt, กฎการอ้างอิง และลด Temperature",
  },
  precision: {
    id: "precision",
    label: "Context Precision",
    thaiName: "ความแม่นยำของบริบท",
    scoreSample: "0.58 (มีสัญญาณรบกวน)",
    diagnosisLine1: "Chunk อันดับต้นมีเนื้อหา",
    diagnosisLine2: "ไม่ตรงคำถามปนอยู่เยอะ",
    fixCategory: "แก้ที่ Chunking & Rerank",
    fixDetail1: "• ปรับขนาด Chunk ให้กระชับ",
    fixDetail2: "• เพิ่ม Cross-Encoder Reranker",
    accentColor: "var(--cyan)",
    softColor: "var(--cyan-soft)",
    caption:
      "Context Precision (คำถาม ↔ บริบท): วัดว่าชิ้นเอกสารอันดับบนๆ ตรงประเด็นจริงหรือไม่ หากต่ำให้แก้ฝั่ง Retrieval โดยปรับการแบ่ง Chunk และเติม Reranker คัดสัญญาณรบกวนออก",
  },
  recall: {
    id: "recall",
    label: "Context Recall",
    thaiName: "ความครบถ้วนของบริบท",
    scoreSample: "0.61 (เก็บข้อมูลไม่ครบ)",
    diagnosisLine1: "เอกสารสำคัญที่ต้องใช้ตอบ",
    diagnosisLine2: "ไม่ถูกดึงเข้ามาใน Top-K",
    fixCategory: "แก้ที่ Retrieval & Top-K",
    fixDetail1: "• ใช้ Hybrid (BM25 + Dense)",
    fixDetail2: "• ขยาย Top-K และ Chunk Overlap",
    accentColor: "var(--brand)",
    softColor: "var(--brand-soft)",
    caption:
      "Context Recall (ความครอบคลุมเพื่อตอบคำถาม): วัดว่าดึงข้อเท็จจริงสำคัญมาได้ครบทุกชิ้นหรือไม่ หากต่ำให้แก้ฝั่ง Retrieval ด้วย Hybrid Search, เพิ่ม Top-K หรือปรับ Chunk Overlap",
  },
};

export function RagTriadVisual({ reduced = false }: VisualProps) {
  const [selected, setSelected] = useState<TriadMetricId>("faithfulness");
  const active = TRIAD_METRICS[selected];
  const flowClass = reduced ? "transition-all duration-300" : "svg-flow-line transition-all duration-300";

  function onEdgeKeyDown(id: TriadMetricId, event: KeyboardEvent<SVGGElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelected(id);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="เลือกแกนประเมินของ RAG Triad">
        {(["faithfulness", "precision", "recall"] as const).map((id) => {
          const item = TRIAD_METRICS[id];
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(id)}
              className={isSelected ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={
                isSelected
                  ? {
                      borderColor: item.accentColor,
                      background: item.softColor,
                      color: id === "recall" ? "var(--brand-ink)" : item.accentColor,
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
          viewBox="0 0 680 272"
          className="block h-auto w-full"
          role="img"
          aria-label={`แผนภาพสามเหลี่ยม RAG Triad กำลังแสดงรายละเอียดของ ${active.label}`}
        >
          {/* Triangle Edges */}
          {/* Left Edge: Context Precision (Query <-> Retrieved Context) */}
          <line
            x1="184"
            y1="62"
            x2="98"
            y2="196"
            stroke={selected === "precision" ? "var(--cyan)" : "var(--line)"}
            strokeWidth={selected === "precision" ? "3.25" : "1.75"}
            strokeDasharray={selected === "precision" ? "6 6" : undefined}
            className={selected === "precision" ? flowClass : "transition-all duration-300"}
          />

          {/* Right Edge: Context Recall (Query <-> LLM Answer / completeness) */}
          <line
            x1="248"
            y1="62"
            x2="334"
            y2="196"
            stroke={selected === "recall" ? "var(--brand)" : "var(--line)"}
            strokeWidth={selected === "recall" ? "3.25" : "1.75"}
            strokeDasharray={selected === "recall" ? "6 6" : undefined}
            className={selected === "recall" ? flowClass : "transition-all duration-300"}
          />

          {/* Bottom Edge: Faithfulness (Retrieved Context <-> LLM Answer) */}
          <line
            x1="160"
            y1="218"
            x2="272"
            y2="218"
            stroke={selected === "faithfulness" ? "var(--warning)" : "var(--line)"}
            strokeWidth={selected === "faithfulness" ? "3.25" : "1.75"}
            strokeDasharray={selected === "faithfulness" ? "6 6" : undefined}
            className={selected === "faithfulness" ? flowClass : "transition-all duration-300"}
          />

          {/* Vertex 1: Query */}
          <rect
            x="150"
            y="14"
            width="132"
            height="48"
            rx="12"
            fill="var(--surface)"
            stroke={selected === "precision" ? "var(--cyan)" : selected === "recall" ? "var(--brand)" : "var(--line)"}
            strokeWidth={selected === "precision" || selected === "recall" ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text x="216" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            Query
          </text>
          <text x="216" y="53" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            คำถามผู้ใช้
          </text>

          {/* Vertex 2: Retrieved Context */}
          <rect
            x="14"
            y="194"
            width="146"
            height="48"
            rx="12"
            fill="var(--surface)"
            stroke={selected === "faithfulness" ? "var(--warning)" : selected === "precision" ? "var(--cyan)" : "var(--line)"}
            strokeWidth={selected === "faithfulness" || selected === "precision" ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text x="87" y="215" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            Retrieved Context
          </text>
          <text x="87" y="233" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            บริบทที่ค้นได้
          </text>

          {/* Vertex 3: LLM Answer */}
          <rect
            x="272"
            y="194"
            width="138"
            height="48"
            rx="12"
            fill="var(--surface)"
            stroke={selected === "faithfulness" ? "var(--warning)" : selected === "recall" ? "var(--brand)" : "var(--line)"}
            strokeWidth={selected === "faithfulness" || selected === "recall" ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text x="341" y="215" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            LLM Answer
          </text>
          <text x="341" y="233" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            คำตอบโมเดล
          </text>

          {/* Interactive Clickable Edge Pills */}
          <g
            role="button"
            tabIndex={0}
            aria-label="เลือกดู Context Precision"
            onClick={() => setSelected("precision")}
            onKeyDown={(e) => onEdgeKeyDown("precision", e)}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="66"
              y="112"
              width="136"
              height="30"
              rx="15"
              fill={selected === "precision" ? "var(--cyan-soft)" : "var(--surface)"}
              stroke={selected === "precision" ? "var(--cyan)" : "var(--line)"}
              strokeWidth={selected === "precision" ? "1.75" : "1"}
              className="transition-all duration-300"
            />
            <text
              x="134"
              y="131"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-sans)"
              fill={selected === "precision" ? "var(--cyan)" : "var(--fg)"}
            >
              Context Precision
            </text>
          </g>

          <g
            role="button"
            tabIndex={0}
            aria-label="เลือกดู Context Recall"
            onClick={() => setSelected("recall")}
            onKeyDown={(e) => onEdgeKeyDown("recall", e)}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="230"
              y="112"
              width="124"
              height="30"
              rx="15"
              fill={selected === "recall" ? "var(--brand-soft)" : "var(--surface)"}
              stroke={selected === "recall" ? "var(--brand)" : "var(--line)"}
              strokeWidth={selected === "recall" ? "1.75" : "1"}
              className="transition-all duration-300"
            />
            <text
              x="292"
              y="131"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-sans)"
              fill={selected === "recall" ? "var(--brand-ink)" : "var(--fg)"}
            >
              Context Recall
            </text>
          </g>

          <g
            role="button"
            tabIndex={0}
            aria-label="เลือกดู Faithfulness"
            onClick={() => setSelected("faithfulness")}
            onKeyDown={(e) => onEdgeKeyDown("faithfulness", e)}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="162"
              y="234"
              width="108"
              height="30"
              rx="15"
              fill={selected === "faithfulness" ? "var(--warning-soft)" : "var(--surface)"}
              stroke={selected === "faithfulness" ? "var(--warning)" : "var(--line)"}
              strokeWidth={selected === "faithfulness" ? "1.75" : "1"}
              className="transition-all duration-300"
            />
            <text
              x="216"
              y="253"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-sans)"
              fill={selected === "faithfulness" ? "var(--warning)" : "var(--fg)"}
            >
              Faithfulness
            </text>
          </g>

          {/* Right Diagnosis & Fix Panel */}
          <rect
            x="426"
            y="14"
            width="238"
            height="244"
            rx="14"
            fill="var(--surface)"
            stroke={active.accentColor}
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          <text
            x="442"
            y="38"
            fontSize="14"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={selected === "recall" ? "var(--brand-ink)" : active.accentColor}
          >
            {active.label}
          </text>
          <text x="442" y="57" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            {active.thaiName}
          </text>

          <rect x="442" y="68" width="206" height="26" rx="8" fill={active.softColor} />
          <text x="452" y="85" fontSize="12" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.scoreSample}
          </text>

          <text x="442" y="114" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--muted)">
            อาการเมื่อคะแนนต่ำ
          </text>
          <text x="442" y="134" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.diagnosisLine1}
          </text>
          <text x="442" y="152" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.diagnosisLine2}
          </text>

          <line x1="442" y1="166" x2="648" y2="166" stroke="var(--hair)" />

          <rect x="442" y="178" width="206" height="26" rx="8" fill={active.softColor} stroke={active.accentColor} />
          <text
            x="545"
            y="195"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={selected === "recall" ? "var(--brand-ink)" : active.accentColor}
          >
            {active.fixCategory}
          </text>
          <text x="442" y="224" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.fixDetail1}
          </text>
          <text x="442" y="244" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.fixDetail2}
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
 * 5. FastApiSseVisual (D137 — Lifespan Warm Pool vs Concurrent SSE Stream)
 * ========================================================================== */

type FastApiMode = "lifespan" | "sse";

const FASTAPI_CLIENTS = [
  { id: "A", y: 26, label: "Client A", tokens: 'data: "สวัสดี" · "ครับ"', color: "var(--brand)", soft: "var(--brand-soft)" },
  { id: "B", y: 102, label: "Client B", tokens: 'data: "สถานะ" · "จัดส่ง"', color: "var(--cyan)", soft: "var(--cyan-soft)" },
  { id: "C", y: 178, label: "Client C", tokens: 'data: "นโยบาย" · "7 วัน"', color: "var(--success)", soft: "var(--success-soft)" },
];

export function FastApiSseVisual({ reduced = false }: VisualProps) {
  const [mode, setMode] = useState<FastApiMode>("lifespan");
  const isLifespan = mode === "lifespan";
  const flowClass = reduced ? "transition-all duration-300" : "svg-flow-line transition-all duration-300";

  const caption = isLifespan
    ? "Cold Startup (Lifespan): โหลดโมเดล Embedding/Reranker และเปิด Async Connection Pool เพียงครั้งเดียวตอนสตาร์ตเซิร์ฟเวอร์ เก็บไว้ใน app.state เพื่อไม่ให้ทุก Request เสียเวลาโหลดซ้ำ"
    : "Concurrent SSE Stream: ใช้ Pool และโมเดลที่พร้อมอยู่แล้ว สตรีมโทเคนแบบ text/event-stream ไปยังผู้ใช้ 3 รายพร้อมกันผ่าน Async Event Loop ทำให้ได้ TTFT ต่ำ (~180 ms)";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="สลับมุมมอง FastAPI Lifespan และ SSE">
        {(
          [
            { id: "lifespan", label: "Cold Startup (Lifespan)" },
            { id: "sse", label: "Concurrent SSE Stream" },
          ] as const
        ).map((item) => {
          const isSelected = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setMode(item.id)}
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
          viewBox="0 0 680 264"
          className="block h-auto w-full"
          role="img"
          aria-label={isLifespan ? "แผนภาพการโหลดทรัพยากรครั้งเดียวใน FastAPI Lifespan" : "แผนภาพการสตรีม SSE ไปยังไคลเอนต์ 3 รายพร้อมกัน"}
        >
          <defs>
            <marker id="sse-arrow-brand" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id="sse-arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id="sse-arrow-success" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Left Box: FastAPI Lifespan Shared Resources */}
          <rect
            x="16"
            y="18"
            width="216"
            height="228"
            rx="14"
            fill="var(--surface)"
            stroke={isLifespan ? "var(--brand)" : "var(--success)"}
            strokeWidth="1.75"
            className="transition-all duration-300"
          />
          <text
            x="30"
            y="42"
            fontSize="13"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isLifespan ? "var(--brand-ink)" : "var(--success)"}
          >
            @lifespan (1x Boot)
          </text>

          {/* Shared Model Box */}
          <rect
            x="28"
            y="58"
            width="192"
            height="64"
            rx="10"
            fill={isLifespan ? "var(--brand-soft)" : "var(--success-soft)"}
            stroke={isLifespan ? "var(--brand)" : "var(--success)"}
            className="transition-all duration-300"
          />
          <text x="40" y="80" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            Embed / Rerank Model
          </text>
          <text x="40" y="100" fontSize="12" fontFamily="var(--font-mono)" fill="var(--muted)">
            {isLifespan ? "Loading once → RAM" : "Warm in RAM ✓"}
          </text>

          {/* Shared Connection Pool Box */}
          <rect
            x="28"
            y="134"
            width="192"
            height="64"
            rx="10"
            fill={isLifespan ? "var(--brand-soft)" : "var(--success-soft)"}
            stroke={isLifespan ? "var(--brand)" : "var(--success)"}
            className="transition-all duration-300"
          />
          <text x="40" y="156" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            Async HTTP &amp; DB Pool
          </text>
          <text x="40" y="176" fontSize="12" fontFamily="var(--font-mono)" fill="var(--muted)">
            {isLifespan ? "Init pool (1x)..." : "Reusable pool ✓"}
          </text>

          <text x="124" y="226" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            ไม่โหลดซ้ำทุก Request
          </text>

          {/* Connector Lifespan -> FastAPI Endpoint */}
          <line
            x1="232"
            y1="132"
            x2="266"
            y2="132"
            stroke={isLifespan ? "var(--brand)" : "var(--success)"}
            strokeWidth="2.25"
            strokeDasharray="6 6"
            markerEnd={isLifespan ? "url(#sse-arrow-brand)" : "url(#sse-arrow-success)"}
            className={flowClass}
          />

          {/* Center Box: FastAPI Async Event Loop + SSE */}
          <rect
            x="272"
            y="48"
            width="136"
            height="168"
            rx="14"
            fill="var(--surface)"
            stroke={!isLifespan ? "var(--cyan)" : "var(--line)"}
            strokeWidth={!isLifespan ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text x="340" y="76" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            FastAPI Async
          </text>
          <text x="340" y="96" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--cyan)">
            /chat/stream
          </text>

          <rect x="284" y="112" width="112" height="32" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="340" y="132" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--muted)">
            Event Loop
          </text>

          <rect
            x="284"
            y="158"
            width="112"
            height="42"
            rx="8"
            fill={!isLifespan ? "var(--success-soft)" : "var(--warning-soft)"}
            stroke={!isLifespan ? "var(--success)" : "var(--warning)"}
            className="transition-all duration-300"
          />
          <text
            x="340"
            y="176"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={!isLifespan ? "var(--success)" : "var(--warning)"}
          >
            {!isLifespan ? "TTFT ~180ms" : "Boot 1.8s"}
          </text>
          <text x="340" y="193" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            {!isLifespan ? "ตอบเร็วทันที" : "ทำครั้งเดียว"}
          </text>

          {/* 3 Concurrent Clients + Animated SSE Paths */}
          {FASTAPI_CLIENTS.map((client) => {
            const targetY = client.y + 30;
            const markerId =
              client.id === "A"
                ? "url(#sse-arrow-brand)"
                : client.id === "B"
                  ? "url(#sse-arrow-cyan)"
                  : "url(#sse-arrow-success)";
            return (
              <g key={client.id} className="transition-all duration-300" style={{ opacity: isLifespan ? 0.42 : 1 }}>
                <path
                  d={`M 408 132 C 432 132, 434 ${targetY}, 456 ${targetY}`}
                  fill="none"
                  stroke={isLifespan ? "var(--line)" : client.color}
                  strokeWidth={isLifespan ? "1.25" : "2.25"}
                  strokeDasharray="6 6"
                  markerEnd={isLifespan ? undefined : markerId}
                  className={!isLifespan ? flowClass : "transition-all duration-300"}
                />
                <rect
                  x="462"
                  y={client.y}
                  width="202"
                  height="60"
                  rx="12"
                  fill={isLifespan ? "var(--surface)" : client.soft}
                  stroke={isLifespan ? "var(--line)" : client.color}
                  strokeWidth={isLifespan ? "1" : "1.5"}
                />
                <text
                  x="476"
                  y={client.y + 23}
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                  fill="var(--fg)"
                >
                  {client.label}
                </text>
                <text
                  x="652"
                  y={client.y + 23}
                  textAnchor="end"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  fill={isLifespan ? "var(--muted)" : client.color}
                >
                  {isLifespan ? "Standby" : "SSE Open"}
                </text>
                <text
                  x="476"
                  y={client.y + 45}
                  fontSize="12"
                  fontFamily={isLifespan ? "var(--font-sans)" : "var(--font-mono)"}
                  fill="var(--muted)"
                >
                  {isLifespan ? "รอ Lifespan พร้อม..." : client.tokens}
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
 * 6. PdpaRedactionVisual (D151 — PDPA Middleware PII Redaction)
 * ========================================================================== */

type PdpaMode = "raw" | "redacted";

export function PdpaRedactionVisual({ reduced = false }: VisualProps) {
  const [mode, setMode] = useState<PdpaMode>("raw");
  const isRedacted = mode === "redacted";
  const flowClass = reduced ? "transition-all duration-300" : "svg-flow-line transition-all duration-300";
  const pulseClass = reduced ? "transition-all duration-300" : "svg-pulse transition-all duration-300";

  const caption = isRedacted
    ? "After PDPA Middleware: ชั้นสแกน Regex + NER ตรวจจับและแทนที่เลขบัตรประชาชน 13 หลัก เบอร์โทร และอีเมลด้วย [THAI_ID], [PHONE], [EMAIL] ก่อนส่งต่อ External LLM และบันทึกลง Audit Log อย่างปลอดภัย"
    : "Raw Customer Message: ข้อความดิบจากลูกค้ามีข้อมูลส่วนบุคคล (PII) ครบทั้งเลขบัตรประชาชน เบอร์โทร และอีเมล หากส่งตรงไปยัง LLM ภายนอกหรือเก็บลง Log โดยไม่ปิดบังจะเสี่ยงผิด พ.ร.บ. PDPA";

  const pillFill = isRedacted ? "var(--success-soft)" : "var(--danger-soft)";
  const pillStroke = isRedacted ? "var(--success)" : "var(--danger)";
  const pillText = isRedacted ? "var(--success)" : "var(--danger)";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="สลับสถานะก่อนและหลัง PDPA Middleware">
        {(
          [
            { id: "raw", label: "Raw Customer Message" },
            { id: "redacted", label: "After PDPA Middleware" },
          ] as const
        ).map((item) => {
          const isSelected = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setMode(item.id)}
              className={isSelected ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={
                isSelected
                  ? {
                      borderColor: isRedacted ? "var(--success)" : "var(--danger)",
                      background: isRedacted ? "var(--success-soft)" : "var(--danger-soft)",
                      color: isRedacted ? "var(--success)" : "var(--danger)",
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
          aria-label={isRedacted ? "แผนภาพข้อความหลังผ่าน PDPA Middleware ที่ปิดบัง PII แล้ว" : "แผนภาพข้อความดิบของลูกค้าที่มีข้อมูลส่วนบุคคล"}
        >
          <defs>
            <marker id="pdpa-arrow-success" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
            <marker id="pdpa-arrow-danger" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id="pdpa-arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
          </defs>

          {/* Left Card: Customer Support Message */}
          <rect
            x="16"
            y="20"
            width="256"
            height="228"
            rx="14"
            fill="var(--surface)"
            stroke={pillStroke}
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          <text x="30" y="44" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            ข้อความลูกค้า
          </text>
          <rect x="164" y="28" width="96" height="22" rx="11" fill={pillFill} />
          <text x="212" y="43" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="var(--font-sans)" fill={pillText}>
            {isRedacted ? "ปิดบังแล้ว" : "มี PII ดิบ"}
          </text>

          <text x="30" y="76" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            &ldquo;ขอตรวจสอบการคืนเงินครับ&rdquo;
          </text>

          {/* Row 1: Thai ID */}
          <text x="30" y="111" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            บัตร:
          </text>
          <rect x="74" y="94" width="184" height="26" rx="8" fill={pillFill} stroke={pillStroke} className="transition-all duration-300" />
          <text x="166" y="111" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="var(--font-mono)" fill={pillText}>
            {isRedacted ? "[THAI_ID]" : "1-1007-02345-67-8"}
          </text>

          {/* Row 2: Phone */}
          <text x="30" y="151" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            โทร:
          </text>
          <rect x="74" y="134" width="184" height="26" rx="8" fill={pillFill} stroke={pillStroke} className="transition-all duration-300" />
          <text x="166" y="151" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="var(--font-mono)" fill={pillText}>
            {isRedacted ? "[PHONE]" : "089-412-8890"}
          </text>

          {/* Row 3: Email */}
          <text x="30" y="191" fontSize="12" fontFamily="var(--font-sans)" fill="var(--fg)">
            อีเมล:
          </text>
          <rect x="74" y="174" width="184" height="26" rx="8" fill={pillFill} stroke={pillStroke} className="transition-all duration-300" />
          <text x="166" y="191" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="var(--font-mono)" fill={pillText}>
            {isRedacted ? "[EMAIL]" : "somchai@mail.th"}
          </text>

          {/* Subtle Scanner Beam over PII area when Redacted */}
          {isRedacted ? (
            <rect
              x="70"
              y="88"
              width="192"
              height="118"
              rx="10"
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="2"
              strokeDasharray="6 6"
              className={pulseClass}
            />
          ) : null}

          <text x="30" y="232" fontSize="12" fontFamily="var(--font-mono)" fill="var(--muted)">
            {isRedacted ? "PII detected: 3 → masked" : "PII exposed: 3 fields"}
          </text>

          {/* Flow: Message -> PDPA Middleware */}
          <line
            x1="272"
            y1="134"
            x2="300"
            y2="134"
            stroke={isRedacted ? "var(--cyan)" : "var(--danger)"}
            strokeWidth="2.25"
            strokeDasharray="6 6"
            markerEnd={isRedacted ? "url(#pdpa-arrow-cyan)" : "url(#pdpa-arrow-danger)"}
            className={flowClass}
          />

          {/* Center Box: PDPA Middleware Scanner */}
          <rect
            x="306"
            y="64"
            width="134"
            height="140"
            rx="14"
            fill={isRedacted ? "var(--cyan-soft)" : "var(--surface)"}
            stroke={isRedacted ? "var(--cyan)" : "var(--line)"}
            strokeWidth={isRedacted ? "1.75" : "1"}
            className="transition-all duration-300"
          />
          <text
            x="373"
            y="90"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={isRedacted ? "var(--cyan)" : "var(--fg)"}
          >
            PDPA Scanner
          </text>
          <text x="373" y="109" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--muted)">
            {isRedacted ? "ACTIVE" : "BYPASSED"}
          </text>

          {/* Scanner beam line inside middleware */}
          <line
            x1="322"
            y1="124"
            x2="424"
            y2="124"
            stroke={isRedacted ? "var(--cyan)" : "var(--hair)"}
            strokeWidth="2"
            className={isRedacted ? pulseClass : "transition-all duration-300"}
          />
          <text x="373" y="146" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--fg)">
            [THAI_ID]
          </text>
          <text x="373" y="166" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--fg)">
            [PHONE]
          </text>
          <text x="373" y="186" textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--fg)">
            [EMAIL]
          </text>

          {/* Branching paths to External LLM & Audit Log */}
          <path
            d="M 440 112 C 464 112, 464 74, 484 74"
            fill="none"
            stroke={isRedacted ? "var(--success)" : "var(--danger)"}
            strokeWidth="2.25"
            strokeDasharray="6 6"
            markerEnd={isRedacted ? "url(#pdpa-arrow-success)" : "url(#pdpa-arrow-danger)"}
            className={flowClass}
          />
          <path
            d="M 440 156 C 464 156, 464 194, 484 194"
            fill="none"
            stroke={isRedacted ? "var(--success)" : "var(--danger)"}
            strokeWidth="2.25"
            strokeDasharray="6 6"
            markerEnd={isRedacted ? "url(#pdpa-arrow-success)" : "url(#pdpa-arrow-danger)"}
            className={flowClass}
          />

          {/* Top Destination: External LLM */}
          <rect
            x="490"
            y="24"
            width="174"
            height="100"
            rx="12"
            fill={isRedacted ? "var(--success-soft)" : "var(--danger-soft)"}
            stroke={isRedacted ? "var(--success)" : "var(--danger)"}
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          <text x="504" y="48" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            External LLM API
          </text>
          <text
            x="504"
            y="72"
            fontSize="12"
            fontWeight="600"
            fontFamily="var(--font-sans)"
            fill={isRedacted ? "var(--success)" : "var(--danger)"}
          >
            {isRedacted ? "✓ ปลอดภัย ไร้ PII" : "✕ เสี่ยงข้อมูลรั่ว!"}
          </text>
          <text x="504" y="96" fontSize="12" fontFamily="var(--font-sans)" fill="var(--muted)">
            {isRedacted ? "รับเฉพาะ Token แทนที่" : "เห็นบัตร+เบอร์ตรงๆ"}
          </text>

          {/* Bottom Destination: Audit Log */}
          <rect
            x="490"
            y="144"
            width="174"
            height="100"
            rx="12"
            fill={isRedacted ? "var(--success-soft)" : "var(--danger-soft)"}
            stroke={isRedacted ? "var(--success)" : "var(--danger)"}
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          <text x="504" y="168" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            Audit Log
          </text>
          <text
            x="504"
            y="192"
            fontSize="12"
            fontWeight="600"
            fontFamily="var(--font-sans)"
            fill={isRedacted ? "var(--success)" : "var(--danger)"}
          >
            {isRedacted ? "✓ เก็บ Log ถูก PDPA" : "✕ Log เก็บ PII ดิบ!"}
          </text>
          <text x="504" y="216" fontSize="12" fontFamily="var(--font-mono)" fill="var(--muted)">
            {isRedacted ? "masked_count = 3" : "compliance: FAIL"}
          </text>
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
