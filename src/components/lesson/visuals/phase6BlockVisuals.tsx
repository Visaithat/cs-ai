"use client";

import { useState } from "react";

interface VisualProps {
  reduced?: boolean;
}

/* ============================================================================
 * 1. CapstoneScaffoldCorpusVisual (B40: D158-D160 — Repo Scaffold + Thai Corpus)
 * ========================================================================== */

const B40_STAGES = [
  {
    id: "scaffold",
    tag: "D158",
    title: "Repo Scaffold",
    items: ["pyproject.toml + uv.lock", "src/ + tests/ + ruff", "docker-compose.yml"],
    metric: "1-cmd boot",
    caption: "D158 Repo Scaffold: วางโครงสร้าง src/, tests/, uv.lock, Ruff และ Docker Compose ให้รันทั้งระบบได้ด้วยคำสั่งเดียว",
  },
  {
    id: "corpus",
    tag: "D159",
    title: "Thai/EN Corpus",
    items: ["20+ Policy & FAQ Docs", "Thai PDF Tables + Codes", "Metadata + ACL Tags"],
    metric: "20+ docs",
    caption: "D159 Knowledge Corpus: คัดเอกสารนโยบาย ตาราง PDF และ FAQ สองภาษาพร้อม metadata แยกแผนกและสิทธิ์เข้าถึง",
  },
  {
    id: "signoff",
    tag: "D160",
    title: "Milestone 1 Gate",
    items: ["ADR-001 Approved", "UTF-8 & Schema Clean", "pytest + ruff = 0 err"],
    metric: "M1 PASS",
    caption: "D160 Milestone 1 Sign-off: ตรวจความพร้อม ADR, โครงสร้าง Repo และคุณภาพชุดเอกสารก่อนเข้าสู่การสร้าง Hybrid RAG",
  },
] as const;

export function CapstoneScaffoldCorpusVisual({ reduced = false }: VisualProps) {
  const [idx, setIdx] = useState(0);
  const active = B40_STAGES[idx];
  const flowClass = reduced ? "" : "svg-flow-line";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกขั้นตอน Block B40">
        {B40_STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={idx === i}
            onClick={() => setIdx(i)}
            className={idx === i ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={idx === i ? { borderColor: "var(--brand)", background: "var(--brand-soft)", color: "var(--brand-ink)" } : undefined}
          >
            {s.tag} · {s.title}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 210" className="block h-auto w-full" role="img" aria-label={`แผนภาพ Block B40 กำลังแสดง ${active.title}`}>
          {[0, 1].map((i) => (
            <line
              key={i}
              x1={216 + i * 224}
              y1="104"
              x2={240 + i * 224}
              y2="104"
              stroke={idx > i ? "var(--success)" : "var(--brand)"}
              strokeWidth="2.25"
              strokeDasharray="6 6"
              className={flowClass}
            />
          ))}
          {B40_STAGES.map((stage, i) => {
            const x = 16 + i * 224;
            const isSelected = i === idx;
            return (
              <g key={stage.id} onClick={() => setIdx(i)} style={{ cursor: "pointer" }}>
                <rect
                  x={x}
                  y="20"
                  width="200"
                  height="168"
                  rx="14"
                  fill={isSelected ? "var(--brand-soft)" : "var(--surface)"}
                  stroke={isSelected ? "var(--brand)" : "var(--line)"}
                  strokeWidth={isSelected ? "2" : "1"}
                  className="transition-all duration-300"
                />
                <rect x={x + 14} y="34" width="52" height="22" rx="6" fill={isSelected ? "var(--surface)" : "var(--surface-2)"} />
                <text x={x + 40} y="49" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill={isSelected ? "var(--brand-ink)" : "var(--muted)"}>
                  {stage.tag}
                </text>
                <text x={x + 186} y="49" textAnchor="end" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
                  {stage.metric}
                </text>
                <text x={x + 14} y="80" fontSize="14" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
                  {stage.title}
                </text>
                {stage.items.map((line, li) => (
                  <text key={line} x={x + 14} y={108 + li * 22} fontSize="11.5" fontFamily="var(--font-mono)" fill={isSelected ? "var(--fg)" : "var(--muted)"}>
                    • {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div role="status" aria-live="polite" className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--fg)" }}>
        {active.caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. CapstoneHybridIngestVisual (B41: D161-D163 — Ingestion → Hybrid → Rerank+ACL)
 * ========================================================================== */

const B41_STAGES = [
  {
    id: "ingest",
    tag: "D161",
    label: "Token-Aware Chunking",
    detail: "Normalize UTF-8 · 350–500 tok · 15% overlap · SHA-256 id",
    caption: "D161 Ingestion: แบ่งเอกสารไทยตามขอบเขตหัวข้อและโทเคน พร้อมสร้าง content hash กันเอกสารซ้ำเวลา re-ingest",
  },
  {
    id: "hybrid",
    tag: "D162",
    label: "PyThaiNLP BM25 + Vector RRF",
    detail: "newmm BM25 (รหัส/คำเฉพาะ) + Dense Cosine → RRF Merge",
    caption: "D162 Hybrid Search: ผสาน BM25 ที่จับรหัสเอกสารไทยเป๊ะเข้ากับ Dense Vector ที่เข้าใจความหมายด้วยสูตร RRF",
  },
  {
    id: "rerank",
    tag: "D163",
    label: "Cross-Encoder + ACL Filter",
    detail: "Pre-filter tenant_id/role → Rerank Top-20 → Top-5",
    caption: "D163 Reranker & ACL: กรองสิทธิ์แผนกก่อนค้นเสมอ แล้วใช้ Cross-Encoder คัด Top-5 ให้ Recall@5 ทะลุ 0.85",
  },
] as const;

export function CapstoneHybridIngestVisual({ reduced = false }: VisualProps) {
  const [step, setStep] = useState(0);
  const active = B41_STAGES[step];
  const flowClass = reduced ? "" : "svg-flow-line";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกขั้นตอนสายพาน Hybrid Retrieval">
        {B41_STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={step === i}
            onClick={() => setStep(i)}
            className={step === i ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={step === i ? { borderColor: "var(--brand)", background: "var(--brand-soft)", color: "var(--brand-ink)" } : undefined}
          >
            {s.tag} · {s.label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 205" className="block h-auto w-full" role="img" aria-label={`สายพาน Hybrid Retrieval กำลังเน้น ${active.label}`}>
          {B41_STAGES.map((s, i) => {
            const y = 16 + i * 62;
            const isSelected = i === step;
            return (
              <g key={s.id} onClick={() => setStep(i)} style={{ cursor: "pointer" }}>
                {i < 2 ? (
                  <line x1="68" y1={y + 48} x2="68" y2={y + 62} stroke={step >= i + 1 ? "var(--success)" : "var(--brand)"} strokeWidth="2.25" strokeDasharray="5 5" className={flowClass} />
                ) : null}
                <rect
                  x="18"
                  y={y}
                  width="644"
                  height="48"
                  rx="12"
                  fill={isSelected ? "var(--brand-soft)" : "var(--surface)"}
                  stroke={isSelected ? "var(--brand)" : "var(--line)"}
                  strokeWidth={isSelected ? "2" : "1"}
                  className="transition-all duration-300"
                />
                <rect x="30" y={y + 11} width="54" height="26" rx="7" fill={isSelected ? "var(--surface)" : "var(--surface-2)"} />
                <text x="57" y={y + 28} textAnchor="middle" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill={isSelected ? "var(--brand-ink)" : "var(--muted)"}>
                  {s.tag}
                </text>
                <text x="98" y={y + 22} fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
                  {s.label}
                </text>
                <text x="98" y={y + 39} fontSize="11.5" fontFamily="var(--font-mono)" fill="var(--muted)">
                  {s.detail}
                </text>
                <text x="646" y={y + 29} textAnchor="end" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill={isSelected ? "var(--success)" : "var(--muted)"}>
                  {i === 0 ? "Chunks" : i === 1 ? "Top-20" : "Top-5 ✓"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div role="status" aria-live="polite" className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--fg)" }}>
        {active.caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. CapstoneCoreRouterVisual (B42: D165-D168 — Citations + MCP + LangGraph Router)
 * ========================================================================== */

const B42_ROUTES = [
  {
    id: "rag",
    label: "1. FAQ / Policy RAG",
    nodeY: 44,
    badge: "Citations [1][2]",
    color: "var(--brand)",
    caption: "เส้นทาง FAQ RAG (D165): ดึงหลักฐานจาก Hybrid Search แล้วบังคับตอบพร้อมเลข citation [doc_id#chunk] หรือปฏิเสธ (Abstain) เมื่อไม่มีหลักฐาน",
  },
  {
    id: "mcp",
    label: "2. MCP Read Lookup",
    nodeY: 110,
    badge: "Read-Only Tool",
    color: "var(--cyan)",
    caption: "เส้นทาง MCP Lookup (D166): เรียกเครื่องมือ get_order_status / get_ticket ผ่าน MCP Server แบบ read-only พร้อม Pydantic validation",
  },
  {
    id: "hitl",
    label: "3. Write Action / Escalate",
    nodeY: 176,
    badge: "HITL Interrupt",
    color: "var(--warning)",
    caption: "เส้นทาง Write / Escalation (D167–D168): หยุดกราฟ LangGraph ด้วย interrupt() เพื่อขอมนุษย์อนุมัติก่อนเปิดทิกเก็ตหรือส่งต่อเจ้าหน้าที่",
  },
] as const;

export function CapstoneCoreRouterVisual({ reduced = false }: VisualProps) {
  const [routeIdx, setRouteIdx] = useState(0);
  const active = B42_ROUTES[routeIdx];
  const flowClass = reduced ? "" : "svg-flow-line";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกเส้นทาง LangGraph Router">
        {B42_ROUTES.map((r, i) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={routeIdx === i}
            onClick={() => setRouteIdx(i)}
            className={routeIdx === i ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={routeIdx === i ? { borderColor: r.color, background: "var(--brand-soft)", color: "var(--fg)" } : undefined}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 220" className="block h-auto w-full" role="img" aria-label={`LangGraph Router กำลังวิ่งเส้นทาง ${active.label}`}>
          {/* Input Node */}
          <rect x="18" y="84" width="150" height="52" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.75" />
          <text x="93" y="106" textAnchor="middle" fontSize="12.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            LangGraph Router
          </text>
          <text x="93" y="124" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--muted)">
            max_steps &lt;= 3
          </text>

          {/* Branch Paths + Target Nodes */}
          {B42_ROUTES.map((r, i) => {
            const isSelected = i === routeIdx;
            return (
              <g key={r.id} onClick={() => setRouteIdx(i)} style={{ cursor: "pointer" }}>
                <path
                  d={`M 168 110 C 220 110, 220 ${r.nodeY}, 270 ${r.nodeY}`}
                  fill="none"
                  stroke={isSelected ? r.color : "var(--line)"}
                  strokeWidth={isSelected ? "2.5" : "1.25"}
                  strokeDasharray={isSelected ? "6 6" : undefined}
                  className={isSelected ? flowClass : undefined}
                />
                <rect
                  x="270"
                  y={r.nodeY - 22}
                  width="230"
                  height="44"
                  rx="10"
                  fill={isSelected ? "var(--brand-soft)" : "var(--surface)"}
                  stroke={isSelected ? r.color : "var(--line)"}
                  strokeWidth={isSelected ? "2" : "1"}
                />
                <text x="284" y={r.nodeY - 2} fontSize="12.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
                  {r.label}
                </text>
                <text x="284" y={r.nodeY + 14} fontSize="11" fontFamily="var(--font-mono)" fill={isSelected ? r.color : "var(--muted)"}>
                  {r.badge}
                </text>
                <path
                  d={`M 500 ${r.nodeY} C 525 ${r.nodeY}, 525 110, 548 110`}
                  fill="none"
                  stroke={isSelected ? "var(--success)" : "var(--line)"}
                  strokeWidth={isSelected ? "2.25" : "1"}
                  strokeDasharray={isSelected ? "6 6" : undefined}
                  className={isSelected ? flowClass : undefined}
                />
              </g>
            );
          })}

          {/* Typed Response Output */}
          <rect x="548" y="80" width="114" height="60" rx="12" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.75" />
          <text x="605" y="104" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
            Typed Output
          </text>
          <text x="605" y="122" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
            Schema &gt;= 99%
          </text>
        </svg>
      </div>
      <div role="status" aria-live="polite" className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--fg)" }}>
        {active.caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. CapstoneEvalTelemetryVisual (B43: D169-D172 — 40-Case Golden Set + Langfuse)
 * ========================================================================== */

const B43_SLICES = [
  { id: "thai", label: "Thai FAQ (12)", score: 0.92, target: 0.85, caption: "กลุ่มคำถามภาษาไทยมาตรฐาน (12 เคส): วัด Faithfulness และ Citation Accuracy — ผ่านเกณฑ์ 0.92 >= 0.85" },
  { id: "codeswitch", label: "Code-Switch (10)", score: 0.88, target: 0.85, caption: "กลุ่มคำถามไทยปนอังกฤษและรหัสเอกสาร (10 เคส): ตรวจว่า Hybrid BM25+Vector ไม่หลุดรหัสเฉพาะ — ผ่าน 0.88" },
  { id: "abstain", label: "Unanswerable (10)", score: 0.90, target: 0.85, caption: "กลุ่มคำถามนอกเอกสาร (10 เคส): วัดว่าโมเดลปฏิเสธตอบอย่างซื่อสัตย์ (Abstention) ไม่แต่งเรื่อง — ผ่าน 0.90" },
  { id: "attack", label: "Red-Team (8)", score: 0.95, target: 0.90, caption: "กลุ่มโจมตี Prompt Injection & PII (8 เคส): วัดเกราะป้องกัน OWASP & PDPA — ผ่าน 0.95 >= 0.90" },
] as const;

export function CapstoneEvalTelemetryVisual({ reduced = false }: VisualProps) {
  const [sel, setSel] = useState(0);
  const active = B43_SLICES[sel];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกกลุ่มเคสใน 40-Case Golden Eval Dataset">
        {B43_SLICES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={sel === i}
            onClick={() => setSel(i)}
            className={sel === i ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={sel === i ? { borderColor: "var(--success)", background: "var(--success-soft)", color: "var(--success)" } : undefined}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 205" className="block h-auto w-full" role="img" aria-label={`ผลประเมิน 40-Case Golden Set กลุ่ม ${active.label}`}>
          {B43_SLICES.map((s, i) => {
            const y = 20 + i * 44;
            const isSel = i === sel;
            const barW = Math.round(s.score * 330);
            const targetX = 210 + Math.round(s.target * 330);
            return (
              <g key={s.id} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
                <rect x="16" y={y} width="648" height="34" rx="8" fill={isSel ? "var(--surface)" : "transparent"} stroke={isSel ? "var(--success)" : "var(--hair)"} />
                <text x="28" y={y + 21} fontSize="12" fontWeight={isSel ? "700" : "500"} fontFamily="var(--font-sans)" fill="var(--fg)">
                  {s.label}
                </text>
                <rect x="210" y={y + 9} width="330" height="16" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
                <rect x="210" y={y + 9} width={barW} height="16" rx="8" fill={isSel ? "var(--success)" : "var(--brand)"} className={reduced ? "" : "transition-all duration-300"} />
                <line x1={targetX} y1={y + 5} x2={targetX} y2={y + 29} stroke="var(--warning)" strokeWidth="2" />
                <text x="556" y={y + 22} fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
                  {(s.score * 100).toFixed(0)}% PASS
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div role="status" aria-live="polite" className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--fg)" }}>
        {active.caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 5. CapstoneSecureDeployVisual (B44: D173-D176 — PDPA + FastAPI SSE + Staging CI)
 * ========================================================================== */

const B44_GATES = [
  { id: "pdpa", tag: "D173", title: "PDPA + OWASP Gate", metric: "0 PII Leak", caption: "D173 Security Middleware: ปิดบังเลขบัตรประชาชน เบอร์โทร อีเมล และสกัด Prompt Injection ตั้งแต่ชั้น HTTP ก่อนแตะ LLM" },
  { id: "sse", tag: "D174", title: "FastAPI SSE + UI", metric: "TTFT < 300ms", caption: "D174 FastAPI SSE & Web UI: สตรีมคำตอบพร้อม citation และสถานะเครื่องมือแบบเรียลไทม์ ใช้งานผ่าน Swagger และหน้าแชตได้ทันที" },
  { id: "deploy", tag: "D175", title: "Docker + Staging CI", metric: "Auto CD", caption: "D175 Container & CI/CD: บิลด์ Multi-stage Docker แบบ non-root, รัน pytest/ruff/eval บน GitHub Actions และดีพลอยขึ้น Staging" },
  { id: "m5", tag: "D176", title: "Milestone 5 Red-Team", metric: "Live + Safe", caption: "D176 Milestone 5: ตรวจ URL Staging จริง พร้อมยิงชุดโจมตี Red-Team ยืนยันความปลอดภัยครบทั้ง PDPA และ OWASP" },
] as const;

export function CapstoneSecureDeployVisual({ reduced = false }: VisualProps) {
  const [idx, setIdx] = useState(0);
  const active = B44_GATES[idx];
  const flowClass = reduced ? "" : "svg-flow-line";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกด่าน Deploy & Security">
        {B44_GATES.map((g, i) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={idx === i}
            onClick={() => setIdx(i)}
            className={idx === i ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={idx === i ? { borderColor: "var(--brand)", background: "var(--brand-soft)", color: "var(--brand-ink)" } : undefined}
          >
            {g.tag} · {g.title}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 170" className="block h-auto w-full" role="img" aria-label={`สายพาน Security & Deployment กำลังเลือก ${active.title}`}>
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              x1={164 + i * 166}
              y1="84"
              x2={182 + i * 166}
              y2="84"
              stroke={idx > i ? "var(--success)" : "var(--brand)"}
              strokeWidth="2.25"
              strokeDasharray="5 5"
              className={flowClass}
            />
          ))}
          {B44_GATES.map((g, i) => {
            const x = 16 + i * 166;
            const isSel = i === idx;
            return (
              <g key={g.id} onClick={() => setIdx(i)} style={{ cursor: "pointer" }}>
                <rect
                  x={x}
                  y="24"
                  width="148"
                  height="120"
                  rx="12"
                  fill={isSel ? "var(--brand-soft)" : "var(--surface)"}
                  stroke={isSel ? "var(--brand)" : "var(--line)"}
                  strokeWidth={isSel ? "2" : "1"}
                />
                <text x={x + 14} y="48" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill={isSel ? "var(--brand-ink)" : "var(--muted)"}>
                  {g.tag}
                </text>
                <text x={x + 14} y="78" fontSize="12.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
                  {g.title}
                </text>
                <rect x={x + 14} y="100" width="120" height="26" rx="7" fill="var(--success-soft)" />
                <text x={x + 74} y="117" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
                  {g.metric}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div role="status" aria-live="polite" className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--fg)" }}>
        {active.caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 6. CapstoneLoadDefenseVisual (B45: D177-D179 — Load Fallback + README + 3-Min Demo)
 * ========================================================================== */

const B45_MODES = [
  {
    id: "load",
    tag: "D177",
    title: "Load & Timeout Fallback",
    p95: "2.1s (Degraded OK)",
    detail: "Primary LLM Timeout → Circuit Breaker → Cached/Fallback Response (0 HTTP 500)",
    caption: "D177 Load & Chaos Test: จำลองโหลดพร้อมกันและ LLM timeout แล้วยืนยันว่าระบบ fallback ได้อย่างสุภาพ ไม่ล่มเป็น HTTP 500",
  },
  {
    id: "readme",
    tag: "D178",
    title: "README + Metrics Table",
    p95: "Recall@5 0.89 · $0.42/1k",
    detail: "Architecture Diagram · Eval Benchmark Table · Cost/1k · One-Command Quickstart",
    caption: "D178 Portfolio README: สรุปสถาปัตยกรรม ตารางตัวเลข Eval, Latency และต้นทุนต่อ 1,000 คำขอให้คนสัมภาษณ์อ่านจบใน 2 นาที",
  },
  {
    id: "demo",
    tag: "D179",
    title: "3-Min Technical Demo",
    p95: "180s Story Arc",
    detail: "0:00 Problem → 0:45 Live RAG+MCP+HITL → 1:45 Eval & Traces → 2:30 Trade-offs",
    caption: "D179 Technical Demo & Q&A: ซ้อมเล่าเดโม 3 นาทีและตอบคำถามเจาะลึกเรื่อง Trade-offs, Failure Modes และต้นทุนอย่างมั่นใจ",
  },
] as const;

export function CapstoneLoadDefenseVisual({ reduced = false }: VisualProps) {
  const [idx, setIdx] = useState(0);
  const active = B45_MODES[idx];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกขั้นตอนเตรียมขึ้น Final Defense">
        {B45_MODES.map((m, i) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={idx === i}
            onClick={() => setIdx(i)}
            className={idx === i ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={idx === i ? { borderColor: "var(--brand)", background: "var(--brand-soft)", color: "var(--brand-ink)" } : undefined}
          >
            {m.tag} · {m.title}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-hair" style={{ background: "var(--surface-2)" }}>
        <svg viewBox="0 0 680 185" className="block h-auto w-full" role="img" aria-label={`ขั้นตอนเตรียม Final Defense กำลังแสดง ${active.title}`}>
          {B45_MODES.map((m, i) => {
            const x = 16 + i * 222;
            const isSel = i === idx;
            return (
              <g key={m.id} onClick={() => setIdx(i)} style={{ cursor: "pointer" }}>
                <rect
                  x={x}
                  y="16"
                  width="204"
                  height="88"
                  rx="12"
                  fill={isSel ? "var(--brand-soft)" : "var(--surface)"}
                  stroke={isSel ? "var(--brand)" : "var(--line)"}
                  strokeWidth={isSel ? "2" : "1"}
                  className={reduced ? "" : "transition-all duration-300"}
                />
                <text x={x + 14} y="38" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill={isSel ? "var(--brand-ink)" : "var(--muted)"}>
                  {m.tag}
                </text>
                <text x={x + 14} y="62" fontSize="13" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
                  {m.title}
                </text>
                <text x={x + 14} y="86" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--success)">
                  {m.p95}
                </text>
              </g>
            );
          })}
          <rect x="16" y="120" width="648" height="48" rx="10" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.25" />
          <text x="340" y="149" textAnchor="middle" fontSize="12" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--fg)">
            {active.detail}
          </text>
        </svg>
      </div>
      <div role="status" aria-live="polite" className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--fg)" }}>
        {active.caption}
      </div>
    </div>
  );
}
