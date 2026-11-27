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

/* ============================================================================
 * 1. NaiveRagFailuresVisual (naive-rag-failures)
 *    4-failure selector contrasting Naive RAG vs Production Thai RAG fix
 * ========================================================================== */

type NaiveFailureId = "pdf-table" | "exact-code" | "broken-context" | "hallucination";

interface NaiveFailureScenario {
  id: NaiveFailureId;
  buttonLabel: string;
  headerTag: string;
  naiveStep1Title: string;
  naiveStep1Sub: string;
  naiveStep2Title: string;
  naiveStep2Sub: string;
  naiveResultTitle: string;
  naiveResultSub: string;
  prodStep1Title: string;
  prodStep1Sub: string;
  prodStep2Title: string;
  prodStep2Sub: string;
  prodResultTitle: string;
  prodResultSub: string;
  caption: string;
}

const NAIVE_FAILURE_SCENARIOS: readonly NaiveFailureScenario[] = [
  {
    id: "pdf-table",
    buttonLabel: "1. ตาราง PDF แตก",
    headerTag: "Failure 1/4 · PDF Table Split",
    naiveStep1Title: "PyPDF อ่านข้อความดิบ",
    naiveStep1Sub: "ไม่รู้ขอบเขตคอลัมน์",
    naiveStep2Title: "ตัด 500 ตัวอักษรทื่อๆ",
    naiveStep2Sub: "แถวราคาหลุดจากหัวตาราง",
    naiveResultTitle: "ตอบราคาผิดแพ็กเกจ",
    naiveResultSub: "จับคู่เลขกับรุ่นมั่ว",
    prodStep1Title: "Layout-Aware Parser",
    prodStep1Sub: "Docling / PDF Table",
    prodStep2Title: "คงรูป Markdown Table",
    prodStep2Sub: "เก็บหัวตาราง + แถวครบ",
    prodResultTitle: "ตอบราคาแม่น 100%",
    prodResultSub: "อ้างตารางหน้า 4 [S1]",
    caption:
      "ปัญหาตาราง PDF แตก: Naive RAG ดึงข้อความดิบแล้วตัดแบ่งกลางตาราง ทำให้ตัวเลขราคาหลุดออกจากชื่อแพ็กเกจ ฝั่ง Production แก้ด้วย Layout-Aware Parser แปลงเป็น Markdown Table ที่คงหัวตารางและแถวไว้ใน Chunk เดียวกัน",
  },
  {
    id: "exact-code",
    buttonLabel: "2. รหัสเฉพาะหลุด",
    headerTag: "Failure 2/4 · Exact ID Miss",
    naiveStep1Title: "คำค้น #INV-2026-009",
    naiveStep1Sub: "ใช้ Dense Vector เดี่ยว",
    naiveStep2Title: "Cosine จับแค่ความหมาย",
    naiveStep2Sub: "แยก #009 กับ #008 ไม่ออก",
    naiveResultTitle: "ดึงคู่มือใบแจ้งหนี้แทน",
    naiveResultSub: "หาใบเสร็จ #009 ไม่เจอ",
    prodStep1Title: "PyThaiNLP newmm",
    prodStep1Sub: "ตัดคำไทย + คงรหัสเป๊ะ",
    prodStep2Title: "Hybrid BM25 + Dense",
    prodStep2Sub: "ผสานอันดับด้วย RRF",
    prodResultTitle: "ดัน #INV-2026-009 #1",
    prodResultSub: "ตรงรหัสและเข้าใจบริบท",
    caption:
      "ปัญหารหัสเฉพาะหลุด: Embedding เชิงความหมายมักให้คะแนนเอกสาร #INV-2026-008 กับ #INV-2026-009 ใกล้เคียงกันจนหลุดอันดับ ฝั่ง Production จึงใช้ PyThaiNLP newmm + BM25 ควบคู่ Dense Vector แล้วรวมคะแนนด้วย RRF",
  },
  {
    id: "broken-context",
    buttonLabel: "3. ตัดบริบทขาด",
    headerTag: "Failure 3/4 · Lost Context",
    naiveStep1Title: "นโยบายคืนเงินยาว",
    naiveStep1Sub: "แบ่งคงที่ไร้ Overlap",
    naiveStep2Title: "ข้อยกเว้นหลุดอีก Chunk",
    naiveStep2Sub: "เงื่อนไข 14 วันขาดครึ่ง",
    naiveResultTitle: "อนุมัติคืนเงินผิดเงื่อนไข",
    naiveResultSub: "ตกข้อยกเว้นสำคัญ",
    prodStep1Title: "Structural Chunking",
    prodStep1Sub: "แบ่งตามหัวข้อ H2/H3",
    prodStep2Title: "Token-Aware + Overlap",
    prodStep2Sub: "ซ้อนทับ 15% เชื่อมรอยต่อ",
    prodResultTitle: "เงื่อนไขครบทุกข้อยกเว้น",
    prodResultSub: "บริบทไม่ขาดระหว่างก้อน",
    caption:
      "ปัญหาตัดบริบทขาด: การสับเอกสารตามจำนวนตัวอักษรแบบไม่มี Overlap ทำให้ประโยคข้อยกเว้นหลุดไปอยู่อีกก้อน ฝั่ง Production แบ่งตามโครงสร้างหัวข้อพร้อม Token-Aware Overlap 15% เพื่อให้เงื่อนไขสำคัญติดไปด้วยเสมอ",
  },
  {
    id: "hallucination",
    buttonLabel: "4. ตอบมั่วไร้แหล่งอ้าง",
    headerTag: "Failure 4/4 · Uncited Hallucination",
    naiveStep1Title: "Context ไม่มีคำตอบ",
    naiveStep1Sub: "คะแนนค้นหาต่ำแต่ส่งต่อ",
    naiveStep2Title: "Prompt ไม่สั่งให้ปฏิเสธ",
    naiveStep2Sub: "LLM เดาจากความจำเดิม",
    naiveResultTitle: "สร้างตัวเลขนโยบายเอง",
    naiveResultSub: "ไม่มีแหล่งอ้างอิงตรวจได้",
    prodStep1Title: "Rerank Confidence Gate",
    prodStep1Sub: "score < 0.35 → หยุดตอบ",
    prodStep2Title: "Strict Citation Prompt",
    prodStep2Sub: "บังคับแนบ [doc_id] ทุกข้อ",
    prodResultTitle: "ตอบมีหลักฐาน / กล้าปฏิเสธ",
    prodResultSub: "ลด Hallucination เชิงระบบ",
    caption:
      "ปัญหาตอบมั่วไร้แหล่งอ้าง: เมื่อคลังข้อมูลไม่มีคำตอบแต่ Naive RAG ยังส่งก้อนคะแนนต่ำให้ LLM โมเดลจะเดาเติมเอง ฝั่ง Production วาง Confidence Gate หลัง Reranker พร้อมบังคับอ้างอิง [doc_id] หรือปฏิเสธอย่างสุภาพเมื่อไม่พบหลักฐาน",
  },
];

export function NaiveRagFailuresVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [selectedId, setSelectedId] = useState<NaiveFailureId>("pdf-table");
  const current =
    NAIVE_FAILURE_SCENARIOS.find((item) => item.id === selectedId) ?? NAIVE_FAILURE_SCENARIOS[0];

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const dangerArrowId = `${uid}-naive-danger`;
  const successArrowId = `${uid}-naive-success`;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="เลือกจุดพังของ Naive RAG เพื่อเปรียบเทียบกับ Production Thai RAG"
        className="flex flex-wrap items-center gap-2"
      >
        {NAIVE_FAILURE_SCENARIOS.map((item) => {
          const active = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedId(item.id)}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
            >
              {item.buttonLabel}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={`แผนภาพเปรียบเทียบ Naive RAG ที่ล้มเหลวกับ Production Thai RAG กรณี ${current.buttonLabel}`}
        >
          <defs>
            <marker id={dangerArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id={successArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Header Strip */}
          <text x="18" y="23" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--fg)">
            {current.headerTag}
          </text>
          <rect
            x="484"
            y="8"
            width="180"
            height="22"
            rx="11"
            fill="var(--brand-soft)"
            stroke="var(--brand)"
            strokeWidth="1"
          />
          <text
            x="574"
            y="23"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill="var(--brand-ink)"
          >
            NAIVE ✕ vs PROD FIX ✓
          </text>

          {/* Top Lane: Broken Naive RAG */}
          <rect
            x="16"
            y="38"
            width="648"
            height="104"
            rx="12"
            fill="var(--surface)"
            stroke="var(--danger)"
            strokeWidth="1.5"
            className={txClass}
          />
          <rect x="28" y="48" width="132" height="20" rx="6" fill="var(--danger-soft)" />
          <text x="94" y="62" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--danger)">
            ✕ Naive RAG (พัง)
          </text>

          {/* Naive Step 1 */}
          <rect x="28" y="76" width="166" height="54" rx="10" fill="var(--surface-2)" stroke="var(--line)" />
          <text x="111" y="99" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            {current.naiveStep1Title}
          </text>
          <text x="111" y="118" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--muted)">
            {current.naiveStep1Sub}
          </text>

          {/* Arrow Naive 1 -> 2 */}
          <line
            x1="194"
            y1="103"
            x2="232"
            y2="103"
            stroke="var(--danger)"
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={`url(#${dangerArrowId})`}
            className={flowClass}
          />

          {/* Naive Step 2 (Failure Point) */}
          <rect
            x="238"
            y="76"
            width="186"
            height="54"
            rx="10"
            fill="var(--danger-soft)"
            stroke="var(--danger)"
            strokeWidth="1.5"
            className={txClass}
          />
          <text x="331" y="99" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--danger)">
            {current.naiveStep2Title}
          </text>
          <text x="331" y="118" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
            {current.naiveStep2Sub}
          </text>

          {/* Arrow Naive 2 -> 3 */}
          <line
            x1="424"
            y1="103"
            x2="462"
            y2="103"
            stroke="var(--danger)"
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={`url(#${dangerArrowId})`}
            className={flowClass}
          />

          {/* Naive Result */}
          <rect
            x="468"
            y="76"
            width="184"
            height="54"
            rx="10"
            fill="var(--danger-soft)"
            stroke="var(--danger)"
            strokeWidth="1.5"
            className={txClass}
          />
          <text x="560" y="99" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--danger)">
            ✕ {current.naiveResultTitle}
          </text>
          <text x="560" y="118" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
            {current.naiveResultSub}
          </text>

          {/* Center Divider Pill */}
          <line x1="28" y1="154" x2="652" y2="154" stroke="var(--hair)" strokeWidth="1" strokeDasharray="4 4" />
          <rect x="234" y="143" width="212" height="22" rx="11" fill="var(--surface)" stroke="var(--line)" />
          <text x="340" y="158" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
            ↓ ยกระดับเป็น Production Thai RAG ↓
          </text>

          {/* Bottom Lane: Production Thai RAG Fix */}
          <rect
            x="16"
            y="168"
            width="648"
            height="104"
            rx="12"
            fill="var(--surface)"
            stroke="var(--success)"
            strokeWidth="1.5"
            className={txClass}
          />
          <rect x="28" y="178" width="166" height="20" rx="6" fill="var(--success-soft)" />
          <text x="111" y="192" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
            ✓ Production Thai RAG (แก้จบ)
          </text>

          {/* Prod Step 1 */}
          <rect
            x="28"
            y="206"
            width="166"
            height="54"
            rx="10"
            fill="var(--brand-soft)"
            stroke="var(--brand)"
            strokeWidth="1.25"
            className={txClass}
          />
          <text x="111" y="229" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
            {current.prodStep1Title}
          </text>
          <text x="111" y="248" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--fg)">
            {current.prodStep1Sub}
          </text>

          {/* Arrow Prod 1 -> 2 */}
          <line
            x1="194"
            y1="233"
            x2="232"
            y2="233"
            stroke="var(--success)"
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={`url(#${successArrowId})`}
            className={flowClass}
          />

          {/* Prod Step 2 */}
          <rect
            x="238"
            y="206"
            width="186"
            height="54"
            rx="10"
            fill="var(--cyan-soft)"
            stroke="var(--cyan)"
            strokeWidth="1.25"
            className={txClass}
          />
          <text x="331" y="229" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--cyan)">
            {current.prodStep2Title}
          </text>
          <text x="331" y="248" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
            {current.prodStep2Sub}
          </text>

          {/* Arrow Prod 2 -> 3 */}
          <line
            x1="424"
            y1="233"
            x2="462"
            y2="233"
            stroke="var(--success)"
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={`url(#${successArrowId})`}
            className={flowClass}
          />

          {/* Prod Result */}
          <rect
            x="468"
            y="206"
            width="184"
            height="54"
            rx="10"
            fill="var(--success-soft)"
            stroke="var(--success)"
            strokeWidth="1.5"
            className={txClass}
          />
          <text x="560" y="229" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
            ✓ {current.prodResultTitle}
          </text>
          <text x="560" y="248" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
            {current.prodResultSub}
          </text>
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
 * 2. ChunkingOverlapVisual (chunking-overlap)
 *    Fixed-Char Split (shattered table) vs Structural + Token-Aware + Overlap
 * ========================================================================== */

type ChunkMode = "fixed" | "structural";

const CHUNK_CAPTIONS: Record<ChunkMode, string> = {
  fixed:
    "Fixed-Char Split (ตัดทุก 500 ตัวอักษร): กรรไกรสับลงกลางตารางราคาพอดี ทำให้ Chunk #2 เหลือแต่ตัวเลข Pro 1,490 ฿ โดยไม่มีหัวตารางและไม่รู้เงื่อนไขคืนเงินหรือ VAT 7% ที่อยู่คนละก้อน",
  structural:
    "Structural + Token-Aware + Overlap: แบ่งตามขอบเขตหัวข้อและรักษาตารางราคาไว้ครบทั้งบล็อกใน Chunk #2 พร้อมแถบ Overlap สีฟ้า (15%) ที่พ่วงหัวข้อและหมายเหตุ VAT 7% เชื่อมรอยต่อระหว่างก้อนอย่างสมบูรณ์",
};

export function ChunkingOverlapVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<ChunkMode>("fixed");
  const isFixed = mode === "fixed";

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowDangerId = `${uid}-chunk-danger`;
  const arrowBrandId = `${uid}-chunk-brand`;
  const arrowSuccessId = `${uid}-chunk-success`;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="เลือกกลยุทธ์การแบ่ง Chunk เอกสารนโยบายไทย"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          aria-pressed={isFixed}
          onClick={() => setMode("fixed")}
          className={isFixed ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isFixed ? ACTIVE_BTN_STYLE : undefined}
        >
          Fixed-Char Split (ตัดกลางตารางพัง!)
        </button>
        <button
          type="button"
          aria-pressed={!isFixed}
          onClick={() => setMode("structural")}
          className={!isFixed ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isFixed ? ACTIVE_BTN_STYLE : undefined}
        >
          Structural + Token-Aware + Overlap
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={
            isFixed
              ? "แผนภาพ Fixed-Char Split ที่ตัดกลางตารางราคาจนข้อมูลขาด"
              : "แผนภาพ Structural และ Token-Aware Chunking ที่มีแถบ Overlap เชื่อมรอยต่อ"
          }
        >
          <defs>
            <marker id={arrowDangerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id={arrowBrandId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={arrowSuccessId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Left Panel: Source Thai Policy Document */}
          <rect x="16" y="12" width="260" height="256" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
          <rect x="16" y="12" width="260" height="30" rx="12" fill="var(--surface-2)" />
          <line x1="16" y1="42" x2="276" y2="42" stroke="var(--hair)" />
          <text x="28" y="31" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            policy_pricing_2026.md
          </text>
          <text x="264" y="31" textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
            Thai Doc
          </text>

          {/* Document Section 1: Heading + Intro */}
          <rect x="26" y="50" width="240" height="52" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="34" y="67" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            ## นโยบายแพ็กเกจ &amp; ราคา 2026
          </text>
          <text x="34" y="83" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
            คืนเงินเต็มจำนวนภายใน 14 วัน
          </text>
          <text x="34" y="97" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
            หากใช้งานไม่เกิน 20% ของโควตา
          </text>

          {/* Document Section 2: Pricing Table */}
          <rect
            x="26"
            y="112"
            width="240"
            height="92"
            rx="8"
            fill="var(--surface)"
            stroke={isFixed ? "var(--danger)" : "var(--success)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <rect x="27" y="113" width="238" height="22" rx="7" fill="var(--surface-2)" />
          <text x="36" y="128" fontSize="10.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            แพ็กเกจ
          </text>
          <text x="114" y="128" fontSize="10.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            ราคา/เดือน
          </text>
          <text x="196" y="128" fontSize="10.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            โควตา
          </text>
          <line x1="27" y1="135" x2="265" y2="135" stroke="var(--hair)" />

          {/* Table Row 1 */}
          <text x="36" y="151" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
            Starter
          </text>
          <text x="114" y="151" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
            490 ฿
          </text>
          <text x="196" y="151" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
            50k tok
          </text>
          <line x1="27" y1="158" x2="265" y2="158" stroke="var(--hair)" />

          {/* Table Row 2 */}
          <text x="36" y="174" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
            Pro
          </text>
          <text x="114" y="174" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
            1,490 ฿
          </text>
          <text x="196" y="174" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
            300k tok
          </text>
          <line x1="27" y1="181" x2="265" y2="181" stroke="var(--hair)" />

          {/* Table Row 3 */}
          <text x="36" y="197" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
            Scale
          </text>
          <text x="114" y="197" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
            4,900 ฿
          </text>
          <text x="196" y="197" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
            2M tok
          </text>

          {/* Document Section 3: Footnote */}
          <rect x="26" y="214" width="240" height="44" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="34" y="232" fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
            หมายเหตุ: ราคายังไม่รวม VAT 7%
          </text>
          <text x="34" y="248" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
            อัปเกรดกลางเดือนคิดเฉลี่ยรายวัน
          </text>

          {/* Overlay on Document: Cut Lines vs Shaded Overlap Bands */}
          {isFixed ? (
            <g className={txClass}>
              {/* Destructive cut right through middle of the pricing table */}
              <line x1="20" y1="158" x2="272" y2="158" stroke="var(--danger)" strokeWidth="2.25" strokeDasharray="5 4" />
              <rect x="150" y="147" width="116" height="20" rx="10" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.25" />
              <text x="208" y="161" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--danger)">
                ✂ 500 chars!
              </text>

              {/* Second cut through footnote */}
              <line x1="20" y1="237" x2="272" y2="237" stroke="var(--danger)" strokeWidth="2" strokeDasharray="5 4" />
              <rect x="166" y="226" width="100" height="20" rx="10" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.25" />
              <text x="216" y="240" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--danger)">
                ✂ 1000 chars
              </text>
            </g>
          ) : (
            <g className={txClass}>
              {/* Shaded Overlap Band 1 (between Intro and Table) */}
              <rect
                x="24"
                y="95"
                width="244"
                height="20"
                rx="5"
                fill="var(--cyan-soft)"
                stroke="var(--cyan)"
                strokeWidth="1.25"
                strokeDasharray="4 3"
                opacity="0.92"
              />
              <text x="146" y="109" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--cyan)">
                Overlap 15% · พ่วงหัวข้อ H2
              </text>

              {/* Shaded Overlap Band 2 (between Table and Footnote) */}
              <rect
                x="24"
                y="200"
                width="244"
                height="18"
                rx="5"
                fill="var(--cyan-soft)"
                stroke="var(--cyan)"
                strokeWidth="1.25"
                strokeDasharray="4 3"
                opacity="0.92"
              />
              <text x="146" y="213" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--cyan)">
                Overlap 15% · เชื่อมตาราง ↔ VAT
              </text>
            </g>
          )}

          {/* Animated Flow Curves (Doc -> Chunks) */}
          <path
            d={isFixed ? "M 276 96 C 304 96, 304 76, 326 76" : "M 276 76 C 304 76, 304 74, 326 74"}
            fill="none"
            stroke={isFixed ? "var(--danger)" : "var(--brand)"}
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={isFixed ? `url(#${arrowDangerId})` : `url(#${arrowBrandId})`}
            className={flowClass}
          />
          <path
            d={isFixed ? "M 276 184 C 304 184, 304 156, 326 156" : "M 276 156 C 304 156, 304 156, 326 156"}
            fill="none"
            stroke={isFixed ? "var(--danger)" : "var(--success)"}
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={isFixed ? `url(#${arrowDangerId})` : `url(#${arrowSuccessId})`}
            className={flowClass}
          />
          <path
            d={isFixed ? "M 276 248 C 304 248, 304 234, 326 234" : "M 276 236 C 304 236, 304 234, 326 234"}
            fill="none"
            stroke={isFixed ? "var(--danger)" : "var(--brand)"}
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={isFixed ? `url(#${arrowDangerId})` : `url(#${arrowBrandId})`}
            className={flowClass}
          />

          {/* Right Panel: Resulting Chunks */}
          <text x="334" y="27" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            Chunks ที่ส่งเข้า Vector / BM25
          </text>
          <rect
            x="534"
            y="12"
            width="130"
            height="22"
            rx="11"
            fill={isFixed ? "var(--danger-soft)" : "var(--success-soft)"}
            stroke={isFixed ? "var(--danger)" : "var(--success)"}
            strokeWidth="1"
            className={txClass}
          />
          <text
            x="599"
            y="27"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={isFixed ? "var(--danger)" : "var(--success)"}
          >
            {isFixed ? "✕ ตารางขาด 2 ท่อน" : "✓ ตารางครบ + Overlap"}
          </text>

          {isFixed ? (
            <g className={txClass}>
              {/* Fixed Chunk #1 */}
              <rect x="334" y="42" width="330" height="66" rx="10" fill="var(--surface)" stroke="var(--warning)" strokeWidth="1.5" />
              <text x="346" y="60" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--warning)">
                Chunk #1 · 500 chars
              </text>
              <text x="652" y="60" textAnchor="end" fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--warning)">
                ตารางขาดครึ่ง
              </text>
              <text x="346" y="79" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
                ## นโยบายแพ็กเกจ · คืนเงิน 14 วัน
              </text>
              <text x="346" y="97" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
                แพ็กเกจ | ราคา | Starter 490 ฿ ✂ ขาด!
              </text>

              {/* Fixed Chunk #2 (Broken Table!) */}
              <rect x="334" y="118" width="330" height="74" rx="10" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.75" />
              <text x="346" y="137" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--danger)">
                Chunk #2 · 500 chars
              </text>
              <text x="652" y="137" textAnchor="end" fontSize="10.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--danger)">
                ✕ ไร้หัวตาราง!
              </text>
              <text x="346" y="157" fontSize="11" fontFamily="var(--font-mono)" fill="var(--fg)">
                Pro | 1,490 ฿ | 300k · Scale | 4,900 ฿
              </text>
              <text x="346" y="177" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--danger)">
                ✕ ไม่รู้ว่า 1,490 คือราคาต่อเดือนหรือปี
              </text>

              {/* Fixed Chunk #3 */}
              <rect x="334" y="202" width="330" height="66" rx="10" fill="var(--surface)" stroke="var(--danger)" strokeWidth="1.25" />
              <text x="346" y="220" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--danger)">
                Chunk #3 · 180 chars
              </text>
              <text x="652" y="220" textAnchor="end" fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--danger)">
                หลุดบริบทราคา
              </text>
              <text x="346" y="239" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
                อัปเกรดกลางเดือนคิดเฉลี่ยรายวัน
              </text>
              <text x="346" y="256" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
                ✕ เงื่อนไข VAT 7% ถูกตัดแยกไปอยู่ก้อนก่อน
              </text>
            </g>
          ) : (
            <g className={txClass}>
              {/* Structural Chunk #1 */}
              <rect x="334" y="42" width="330" height="64" rx="10" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" />
              <text x="346" y="59" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
                Chunk #1 · 185 tok
              </text>
              <text x="652" y="59" textAnchor="end" fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
                H2 Section
              </text>
              <text x="346" y="76" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
                ## นโยบายแพ็กเกจ · คืนเงิน 14 วัน (&lt;20%)
              </text>
              <rect x="342" y="84" width="314" height="17" rx="5" fill="var(--cyan-soft)" />
              <text x="350" y="96" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--cyan)">
                Overlap tail: นโยบายแพ็กเกจ &amp; ราคา 2026
              </text>

              {/* Structural Chunk #2 (Complete Table + Overlap Bands) */}
              <rect x="334" y="114" width="330" height="82" rx="10" fill="var(--surface)" stroke="var(--success)" strokeWidth="1.75" />
              <rect x="342" y="120" width="314" height="17" rx="5" fill="var(--cyan-soft)" />
              <text x="350" y="132" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--cyan)">
                Overlap head: ## นโยบายแพ็กเกจ &amp; ราคา 2026
              </text>
              <text x="346" y="151" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
                Chunk #2 · 310 tok · ตารางครบ 100% ✓
              </text>
              <text x="346" y="168" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
                Starter 490 · Pro 1,490 · Scale 4,900 ฿/ด.
              </text>
              <rect x="342" y="174" width="314" height="17" rx="5" fill="var(--cyan-soft)" />
              <text x="350" y="186" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--cyan)">
                Overlap tail: ราคายังไม่รวม VAT 7%
              </text>

              {/* Structural Chunk #3 */}
              <rect x="334" y="204" width="330" height="64" rx="10" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" />
              <rect x="342" y="210" width="314" height="17" rx="5" fill="var(--cyan-soft)" />
              <text x="350" y="222" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--cyan)">
                Overlap head: ตารางแพ็กเกจ Starter/Pro/Scale
              </text>
              <text x="346" y="242" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
                Chunk #3 · 140 tok · เงื่อนไขครบ ✓
              </text>
              <text x="346" y="259" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
                หมายเหตุ VAT 7% · อัปเกรดกลางเดือนเฉลี่ยรายวัน
              </text>
            </g>
          )}
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {CHUNK_CAPTIONS[mode]}
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. VectorIndexHnswVisual (vector-index-hnsw)
 *    pgvector HNSW + SQL Filter vs Qdrant Hybrid + Payload Index
 *    Multi-layer HNSW graph hops (Layer 2 -> Layer 1 -> Layer 0)
 * ========================================================================== */

type HnswEngineId = "pgvector" | "qdrant";
type HnswFocusLayer = "all" | 2 | 1 | 0;

interface HnswEngineSpec {
  id: HnswEngineId;
  buttonLabel: string;
  title: string;
  accentColor: string;
  accentSoft: string;
  filterLabel: string;
  filterValue: string;
  hybridValue: string;
  paramsValue: string;
  latencyLabel: string;
  scannedLabel: string;
  barWidth: number;
  nodeNote: string;
  caption: string;
}

const HNSW_ENGINE_SPECS: Record<HnswEngineId, HnswEngineSpec> = {
  pgvector: {
    id: "pgvector",
    buttonLabel: "pgvector HNSW + SQL Filter",
    title: "pgvector (PostgreSQL)",
    accentColor: "var(--brand)",
    accentSoft: "var(--brand-soft)",
    filterLabel: "SQL Filter",
    filterValue: "WHERE + iterative_scan",
    hybridValue: "SQL JOIN + BM25/tsvec",
    paramsValue: "m=16 · ef_search=64",
    latencyLabel: "~6 ms",
    scannedLabel: "640 / 1M rows (0.06%)",
    barWidth: 16,
    nodeNote: "✕ 1 โหนดถูกกรองออกด้วย SQL WHERE",
    caption:
      "pgvector HNSW + SQL Filter: กระโดดลง Layer 2 → Layer 1 → Layer 0 เพื่อตรงไปยังเพื่อนบ้านใกล้สุดโดยสแกนแค่ ~0.06% ของแถวทั้งหมด เหมาะกับทีมที่ใช้ PostgreSQL อยู่แล้ว และเปิด hnsw.iterative_scan กันปัญหา WHERE filter กรองผลลัพธ์หาย",
  },
  qdrant: {
    id: "qdrant",
    buttonLabel: "Qdrant Hybrid + Payload Index",
    title: "Qdrant Vector Engine",
    accentColor: "var(--cyan)",
    accentSoft: "var(--cyan-soft)",
    filterLabel: "Payload Index",
    filterValue: "Filter-Aware HNSW",
    hybridValue: "Native Dense + Sparse",
    paramsValue: "m=16 · ef=128 · INT8",
    latencyLabel: "~3 ms",
    scannedLabel: "420 / 1M vecs (0.04%)",
    barWidth: 12,
    nodeNote: "✓ Payload Index กรอง tenant ก่อนเดินกราฟ",
    caption:
      "Qdrant Hybrid + Payload Index: ผูก Payload Index (เช่น tenant_id) เข้าไปในกราฟ HNSW โดยตรง ทำให้ระหว่างกระโดด Layer 2 → 1 → 0 ไม่เสียเวลาแวะโหนดของลูกค้าอื่น พร้อมรวม Dense + Sparse Vector (RRF) จบในเอนจินเดียว",
  },
};

export function VectorIndexHnswVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [engine, setEngine] = useState<HnswEngineId>("pgvector");
  const [focusLayer, setFocusLayer] = useState<HnswFocusLayer>("all");

  const spec = HNSW_ENGINE_SPECS[engine];
  const isPg = engine === "pgvector";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const hopArrowId = `${uid}-hnsw-hop`;
  const dropArrowId = `${uid}-hnsw-drop`;

  const layerOpacity = (layerNum: 2 | 1 | 0) => (focusLayer === "all" || focusLayer === layerNum ? 1 : 0.34);
  const toggleLayer = (layerNum: 2 | 1 | 0) =>
    setFocusLayer((prev) => (prev === layerNum ? "all" : layerNum));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="เลือกเอนจิน Vector Index" className="flex flex-wrap items-center gap-2">
          {(["pgvector", "qdrant"] as const).map((id) => {
            const active = engine === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setEngine(id)}
                className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
                style={active ? ACTIVE_BTN_STYLE : undefined}
              >
                {HNSW_ENGINE_SPECS[id].buttonLabel}
              </button>
            );
          })}
        </div>
        {focusLayer !== "all" ? (
          <button
            type="button"
            onClick={() => setFocusLayer("all")}
            className="btn btn-sm btn-quiet"
          >
            แสดงครบทุก Layer
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={`แผนภาพ HNSW Multi-Layer Graph สำหรับ ${spec.buttonLabel}`}
        >
          <defs>
            <marker id={hopArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={spec.accentColor} />
            </marker>
            <marker id={dropArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Left Container: 3-Layer HNSW Graph */}
          <rect x="14" y="10" width="438" height="260" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />

          {/* LAYER 2 (Top Express Layer) */}
          <g
            role="button"
            tabIndex={0}
            aria-label="โฟกัส Layer 2 ทางด่วนกระโดดไกล"
            onClick={() => toggleLayer(2)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => toggleLayer(2))}
            style={{ opacity: layerOpacity(2), cursor: "pointer" }}
            className={txClass}
          >
            <rect
              x="24"
              y="20"
              width="418"
              height="62"
              rx="10"
              fill={focusLayer === 2 ? spec.accentSoft : "var(--surface-2)"}
              stroke={focusLayer === 2 ? spec.accentColor : "var(--hair)"}
              strokeWidth={focusLayer === 2 ? "1.5" : "1"}
            />
            <text x="36" y="42" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill={spec.accentColor}>
              Layer 2
            </text>
            <text x="36" y="59" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
              ทางด่วน (กระโดดไกล)
            </text>

            {/* Sparse background edges */}
            <line x1="168" y1="52" x2="254" y2="42" stroke="var(--line)" strokeWidth="1.25" />
            <line x1="254" y1="42" x2="346" y2="54" stroke="var(--line)" strokeWidth="1.25" />
            <line x1="346" y1="54" x2="414" y2="44" stroke="var(--line)" strokeWidth="1.25" />

            {/* Animated Express Hop */}
            <path
              d="M 174 52 Q 260 22 338 50"
              fill="none"
              stroke={spec.accentColor}
              strokeWidth="2.25"
              strokeDasharray={reduced ? undefined : "6 5"}
              markerEnd={`url(#${hopArrowId})`}
              className={flowClass}
            />
            <text x="256" y="31" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill={spec.accentColor}>
              long-range hop
            </text>

            {/* Layer 2 Nodes */}
            <circle cx="168" cy="52" r="8" fill={spec.accentSoft} stroke={spec.accentColor} strokeWidth="2" />
            <text x="168" y="73" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill={spec.accentColor}>
              Entry
            </text>
            <circle cx="254" cy="42" r="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
            <circle cx="346" cy="54" r="8" fill={spec.accentSoft} stroke={spec.accentColor} strokeWidth="2" />
            <circle cx="414" cy="44" r="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
          </g>

          {/* Vertical Drop L2 -> L1 */}
          <line
            x1="346"
            y1="62"
            x2="346"
            y2="114"
            stroke="var(--success)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "4 4"}
            markerEnd={`url(#${dropArrowId})`}
            className={flowClass}
          />

          {/* LAYER 1 (Regional Layer) */}
          <g
            role="button"
            tabIndex={0}
            aria-label="โฟกัส Layer 1 กระโดดข้ามกลุ่ม"
            onClick={() => toggleLayer(1)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => toggleLayer(1))}
            style={{ opacity: layerOpacity(1), cursor: "pointer" }}
            className={txClass}
          >
            <rect
              x="24"
              y="96"
              width="418"
              height="66"
              rx="10"
              fill={focusLayer === 1 ? spec.accentSoft : "var(--surface-2)"}
              stroke={focusLayer === 1 ? spec.accentColor : "var(--hair)"}
              strokeWidth={focusLayer === 1 ? "1.5" : "1"}
            />
            <text x="36" y="118" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill={spec.accentColor}>
              Layer 1
            </text>
            <text x="36" y="135" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
              บีบวงเข้ากลุ่มใกล้เคียง
            </text>

            {/* Background regional edges */}
            <line x1="158" y1="126" x2="206" y2="144" stroke="var(--line)" strokeWidth="1" />
            <line x1="206" y1="144" x2="262" y2="122" stroke="var(--line)" strokeWidth="1" />
            <line x1="262" y1="122" x2="306" y2="144" stroke="var(--line)" strokeWidth="1" />
            <line x1="306" y1="144" x2="346" y2="124" stroke="var(--line)" strokeWidth="1" />
            <line x1="346" y1="124" x2="380" y2="142" stroke="var(--line)" strokeWidth="1" />
            <line x1="380" y1="142" x2="418" y2="122" stroke="var(--line)" strokeWidth="1" />

            {/* Animated Regional Hop */}
            <path
              d="M 346 124 L 373 139"
              fill="none"
              stroke={spec.accentColor}
              strokeWidth="2.25"
              strokeDasharray={reduced ? undefined : "5 4"}
              markerEnd={`url(#${hopArrowId})`}
              className={flowClass}
            />

            {/* Layer 1 Nodes */}
            {[
              { cx: 158, cy: 126, active: false },
              { cx: 206, cy: 144, active: false },
              { cx: 262, cy: 122, active: false },
              { cx: 306, cy: 144, active: false },
              { cx: 346, cy: 124, active: true },
              { cx: 380, cy: 142, active: true },
              { cx: 418, cy: 122, active: false },
            ].map((node, idx) => (
              <circle
                key={idx}
                cx={node.cx}
                cy={node.cy}
                r={node.active ? 7 : 4.5}
                fill={node.active ? spec.accentSoft : "var(--surface)"}
                stroke={node.active ? spec.accentColor : "var(--line)"}
                strokeWidth={node.active ? 2 : 1.25}
              />
            ))}
          </g>

          {/* Vertical Drop L1 -> L0 */}
          <line
            x1="380"
            y1="149"
            x2="380"
            y2="196"
            stroke="var(--success)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "4 4"}
            markerEnd={`url(#${dropArrowId})`}
            className={flowClass}
          />

          {/* LAYER 0 (Base Fine-Grained Top-K Layer) */}
          <g
            role="button"
            tabIndex={0}
            aria-label="โฟกัส Layer 0 ค้นหาเพื่อนบ้าน Top-K"
            onClick={() => toggleLayer(0)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => toggleLayer(0))}
            style={{ opacity: layerOpacity(0), cursor: "pointer" }}
            className={txClass}
          >
            <rect
              x="24"
              y="176"
              width="418"
              height="84"
              rx="10"
              fill={focusLayer === 0 ? "var(--success-soft)" : "var(--surface-2)"}
              stroke={focusLayer === 0 ? "var(--success)" : "var(--hair)"}
              strokeWidth={focusLayer === 0 ? "1.5" : "1"}
            />
            <text x="36" y="197" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
              Layer 0
            </text>
            <text x="36" y="214" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
              เก็บทุกเวกเตอร์
            </text>

            {/* Skipped rows zone on left */}
            <rect x="140" y="188" width="160" height="44" rx="8" fill="var(--surface)" stroke="var(--hair)" strokeDasharray="3 3" />
            {[
              { cx: 156, cy: 204 },
              { cx: 178, cy: 218 },
              { cx: 200, cy: 201 },
              { cx: 224, cy: 219 },
              { cx: 248, cy: 203 },
              { cx: 274, cy: 216 },
              { cx: 288, cy: 199 },
            ].map((pt, idx) => (
              <circle key={idx} cx={pt.cx} cy={pt.cy} r="3.5" fill="var(--line)" />
            ))}
            <text x="220" y="246" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--muted)">
              ข้าม ~99.9% แถวโดยไม่สแกน
            </text>

            {/* Target Neighborhood Halo */}
            <circle
              cx="388"
              cy="214"
              r="34"
              fill="var(--success-soft)"
              stroke="var(--success)"
              strokeWidth="1.25"
              strokeDasharray="4 3"
            />

            {/* Active local hops to Top-K */}
            <line
              x1="380"
              y1="204"
              x2="394"
              y2="215"
              stroke={spec.accentColor}
              strokeWidth="2"
              strokeDasharray={reduced ? undefined : "4 3"}
              className={flowClass}
            />

            {/* Top-K Neighbor Nodes */}
            <circle cx="368" cy="224" r="6" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="2" />
            <circle cx="380" cy="204" r="6" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="2" />
            <circle cx="408" cy="202" r="6" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="2" />

            {/* Filtered node behavior differs by engine */}
            {isPg ? (
              <g>
                <circle cx="412" cy="230" r="6" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.75" />
                <text x="412" y="233.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--danger)">
                  ✕
                </text>
              </g>
            ) : (
              <g>
                <circle cx="412" cy="230" r="5" fill="var(--surface)" stroke="var(--line)" strokeDasharray="2 2" />
              </g>
            )}

            {/* Query Target Node */}
            <circle cx="394" cy="216" r="7.5" fill={spec.accentColor} stroke="var(--surface)" strokeWidth="2" />
            <text x="394" y="219.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--surface)">
              Q
            </text>
            <text x="388" y="255" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
              Top-K Hit!
            </text>
          </g>

          {/* Right Panel: Engine Spec & Scan Efficiency */}
          <rect
            x="462"
            y="10"
            width="204"
            height="260"
            rx="12"
            fill="var(--surface)"
            stroke={spec.accentColor}
            strokeWidth="1.5"
            className={txClass}
          />
          <rect x="472" y="20" width="184" height="26" rx="8" fill={spec.accentSoft} className={txClass} />
          <text
            x="564"
            y="37"
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isPg ? "var(--brand-ink)" : "var(--cyan)"}
          >
            {spec.title}
          </text>

          {/* Spec Row 1: Filter */}
          <text x="474" y="64" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--muted)">
            {spec.filterLabel}
          </text>
          <text x="474" y="80" fontSize="11.5" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--fg)">
            {spec.filterValue}
          </text>
          <line x1="474" y1="90" x2="654" y2="90" stroke="var(--hair)" />

          {/* Spec Row 2: Hybrid */}
          <text x="474" y="106" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--muted)">
            Hybrid Support
          </text>
          <text x="474" y="122" fontSize="11.5" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--fg)">
            {spec.hybridValue}
          </text>
          <line x1="474" y1="132" x2="654" y2="132" stroke="var(--hair)" />

          {/* Spec Row 3: Params */}
          <text x="474" y="148" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--muted)">
            HNSW Params
          </text>
          <text x="474" y="164" fontSize="11.5" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--fg)">
            {spec.paramsValue}
          </text>

          {/* Filter note pill */}
          <rect
            x="472"
            y="174"
            width="184"
            height="24"
            rx="6"
            fill={isPg ? "var(--warning-soft)" : "var(--success-soft)"}
            className={txClass}
          />
          <text
            x="564"
            y="189"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="600"
            fontFamily="var(--font-sans)"
            fill={isPg ? "var(--warning)" : "var(--success)"}
          >
            {spec.nodeNote}
          </text>

          {/* Scan Efficiency Meter */}
          <rect x="472" y="206" width="184" height="54" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="480" y="221" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--muted)">
            Scan Cost (1M rows)
          </text>
          <text x="648" y="221" textAnchor="end" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
            {spec.latencyLabel}
          </text>
          {/* Full Scan Ghost Bar */}
          <rect x="480" y="228" width="168" height="8" rx="4" fill="var(--line)" />
          {/* HNSW Actual Bar */}
          <rect
            x="480"
            y="228"
            width={spec.barWidth}
            height="8"
            rx="4"
            fill="var(--success)"
            className={txClass}
          />
          <text x="480" y="251" fontSize="10" fontFamily="var(--font-mono)" fill="var(--fg)">
            {spec.scannedLabel}
          </text>
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {spec.caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. ThaiBm25IndexVisual (thai-bm25-index)
 *    PyThaiNLP newmm + BM25 score bars vs Dense Vector score bars
 * ========================================================================== */

type ThaiQueryId = "exact-id" | "synonym";

interface ScoreBarRow {
  code: string;
  label: string;
  score: number;
  isTarget?: boolean;
}

interface ThaiBm25Scenario {
  id: ThaiQueryId;
  buttonLabel: string;
  rawQuery: string;
  tokens: readonly string[];
  bm25Badge: string;
  bm25Strong: boolean;
  denseBadge: string;
  denseStrong: boolean;
  bm25Rows: readonly ScoreBarRow[];
  denseRows: readonly ScoreBarRow[];
  verdict: string;
  caption: string;
}

const THAI_BM25_SCENARIOS: Record<ThaiQueryId, ThaiBm25Scenario> = {
  "exact-id": {
    id: "exact-id",
    buttonLabel: "#INV-2026-009 (รหัสเป๊ะ)",
    rawQuery: "เช็กสถานะ #INV-2026-009",
    tokens: ["เช็ก", "สถานะ", "#INV-2026-009"],
    bm25Badge: "ชนะขาด · ตรงรหัสเป๊ะ",
    bm25Strong: true,
    denseBadge: "แยกเลขรหัสใกล้กันไม่ออก",
    denseStrong: false,
    bm25Rows: [
      { code: "D1", label: "ใบแจ้งหนี้ #INV-2026-009", score: 0.96, isTarget: true },
      { code: "D2", label: "ใบแจ้งหนี้ #INV-2026-008", score: 0.34 },
      { code: "D3", label: "คู่มือเช็กสถานะชำระเงิน", score: 0.22 },
    ],
    denseRows: [
      { code: "D3", label: "คู่มือเช็กสถานะชำระเงิน", score: 0.84 },
      { code: "D2", label: "ใบแจ้งหนี้ #INV-2026-008", score: 0.81 },
      { code: "D1", label: "ใบแจ้งหนี้ #INV-2026-009", score: 0.8, isTarget: true },
    ],
    verdict: "Hybrid Verdict: BM25 (PyThaiNLP newmm) ดึงรหัส #INV-2026-009 ขึ้น #1 ปิดจุดอ่อน Dense Vector",
    caption:
      "กรณีรหัสเฉพาะ (#INV-2026-009): PyThaiNLP newmm ตัดคำไทยพร้อมรักษารหัสตัวเลขครบถ้วน ทำให้ BM25 ให้คะแนนใบแจ้งหนี้ #009 สูงถึง 0.96 ในขณะที่ Dense Vector มองว่า #008, #009 และคู่มือทั่วไปมีความหมายใกล้กันหมด (~0.80–0.84)",
  },
  synonym: {
    id: "synonym",
    buttonLabel: "ขอใบเสร็จย้อนหลัง (คำพ้อง)",
    rawQuery: "ขอใบเสร็จย้อนหลัง",
    tokens: ["ขอ", "ใบเสร็จ", "ย้อนหลัง"],
    bm25Badge: "หลุดคำพ้อง · หาคำไม่ตรง",
    bm25Strong: false,
    denseBadge: "ชนะขาด · เข้าใจความหมาย",
    denseStrong: true,
    bm25Rows: [
      { code: "D2", label: "ประวัติคำสั่งซื้อย้อนหลัง", score: 0.48 },
      { code: "D1", label: "แบบฟอร์มขอเปลี่ยนที่อยู่", score: 0.41 },
      { code: "D3", label: "ขั้นตอนออกใบกำกับภาษี", score: 0.14, isTarget: true },
    ],
    denseRows: [
      { code: "D3", label: "ขั้นตอนออกใบกำกับภาษี", score: 0.93, isTarget: true },
      { code: "D2", label: "ประวัติคำสั่งซื้อย้อนหลัง", score: 0.68 },
      { code: "D1", label: "แบบฟอร์มขอเปลี่ยนที่อยู่", score: 0.31 },
    ],
    verdict: "Hybrid Verdict: Dense Vector เชื่อมคำพ้อง “ใบเสร็จ ↔ ใบกำกับภาษี” ปิดจุดอ่อน BM25 ที่จับแค่คำตรงตัว",
    caption:
      "กรณีคำพ้องความหมาย (ขอใบเสร็จย้อนหลัง): เอกสารจริงใช้คำว่า “ใบกำกับภาษี” ไม่ได้เขียนว่า “ใบเสร็จ” ทำให้ BM25 ให้คะแนนเอกสารเป้าหมายต่ำเพียง 0.14 แต่ Dense Vector เข้าใจความหมายเดียวกันและดันขึ้นอันดับ 1 ที่ 0.93 นี่คือเหตุผลที่ระบบไทยต้องใช้ทั้งคู่ร่วมกัน",
  },
};

export function ThaiBm25IndexVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [queryId, setQueryId] = useState<ThaiQueryId>("exact-id");
  const active = THAI_BM25_SCENARIOS[queryId];

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const bm25ArrowId = `${uid}-bm25-arrow`;
  const denseArrowId = `${uid}-dense-arrow`;

  const maxBarW = 292;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="เลือกตัวอย่างคำค้นภาษาไทยเพื่อเทียบคะแนน BM25 และ Dense Vector"
        className="flex flex-wrap items-center gap-2"
      >
        {(["exact-id", "synonym"] as const).map((id) => {
          const item = THAI_BM25_SCENARIOS[id];
          const selected = queryId === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => setQueryId(id)}
              className={selected ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={selected ? ACTIVE_BTN_STYLE : undefined}
            >
              {item.buttonLabel}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={`แผนภาพเปรียบเทียบคะแนน PyThaiNLP newmm BM25 กับ Dense Vector สำหรับคำค้น ${active.rawQuery}`}
        >
          <defs>
            <marker id={bm25ArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={denseArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
          </defs>

          {/* Top Bar: Query + PyThaiNLP newmm Tokenizer */}
          <rect x="16" y="10" width="648" height="48" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
          <text x="28" y="30" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            Query:
          </text>
          <text x="28" y="48" fontSize="12.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            {active.rawQuery}
          </text>

          <line x1="252" y1="18" x2="252" y2="50" stroke="var(--hair)" />
          <text x="266" y="29" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--muted)">
            PyThaiNLP newmm tokens:
          </text>
          {active.tokens.map((tok, idx) => {
            const chipW = Math.max(54, tok.length * 8 + 20);
            const prevOffset = active.tokens
              .slice(0, idx)
              .reduce((acc, prev) => acc + Math.max(54, prev.length * 8 + 20) + 8, 0);
            const chipX = 266 + prevOffset;
            const isCodeToken = tok.startsWith("#");
            return (
              <g key={tok} className={txClass}>
                <rect
                  x={chipX}
                  y="34"
                  width={chipW}
                  height="19"
                  rx="6"
                  fill={isCodeToken ? "var(--brand-soft)" : "var(--surface-2)"}
                  stroke={isCodeToken ? "var(--brand)" : "var(--line)"}
                />
                <text
                  x={chipX + chipW / 2}
                  y="47"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight={isCodeToken ? "700" : "600"}
                  fontFamily={isCodeToken ? "var(--font-mono)" : "var(--font-sans)"}
                  fill={isCodeToken ? "var(--brand-ink)" : "var(--fg)"}
                >
                  {tok}
                </text>
              </g>
            );
          })}

          {/* Animated Flow Connectors */}
          <path
            d="M 240 58 C 240 70, 174 68, 174 80"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "5 5"}
            markerEnd={`url(#${bm25ArrowId})`}
            className={flowClass}
          />
          <path
            d="M 440 58 C 440 70, 506 68, 506 80"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "5 5"}
            markerEnd={`url(#${denseArrowId})`}
            className={flowClass}
          />

          {/* Left Panel: BM25 Lexical Index */}
          <rect
            x="16"
            y="84"
            width="316"
            height="148"
            rx="12"
            fill="var(--surface)"
            stroke={active.bm25Strong ? "var(--success)" : "var(--warning)"}
            strokeWidth={active.bm25Strong ? "1.75" : "1.25"}
            className={txClass}
          />
          <text x="28" y="104" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            BM25 (newmm)
          </text>
          <rect
            x="174"
            y="90"
            width="148"
            height="20"
            rx="10"
            fill={active.bm25Strong ? "var(--success-soft)" : "var(--warning-soft)"}
            className={txClass}
          />
          <text
            x="248"
            y="104"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={active.bm25Strong ? "var(--success)" : "var(--warning)"}
          >
            {active.bm25Badge}
          </text>

          {active.bm25Rows.map((row, idx) => {
            const rowY = 118 + idx * 36;
            const barW = Math.max(12, Math.round(row.score * maxBarW));
            const barFill = row.isTarget
              ? active.bm25Strong
                ? "var(--success)"
                : "var(--danger)"
              : "var(--brand)";
            return (
              <g key={`bm25-${row.code}`} className={txClass}>
                <text
                  x="28"
                  y={rowY + 12}
                  fontSize="11"
                  fontWeight={row.isTarget ? "700" : "500"}
                  fontFamily="var(--font-sans)"
                  fill={row.isTarget ? "var(--fg)" : "var(--muted)"}
                >
                  {row.isTarget ? `★ ${row.label}` : row.label}
                </text>
                <text
                  x="320"
                  y={rowY + 12}
                  textAnchor="end"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={row.isTarget ? barFill : "var(--muted)"}
                >
                  {row.score.toFixed(2)}
                </text>
                <rect x="28" y={rowY + 18} width={maxBarW} height="9" rx="4.5" fill="var(--surface-2)" />
                <rect
                  x="28"
                  y={rowY + 18}
                  width={barW}
                  height="9"
                  rx="4.5"
                  fill={barFill}
                  opacity={row.isTarget ? 1 : 0.5}
                  className={txClass}
                />
              </g>
            );
          })}

          {/* Right Panel: Dense Vector Embedding */}
          <rect
            x="348"
            y="84"
            width="316"
            height="148"
            rx="12"
            fill="var(--surface)"
            stroke={active.denseStrong ? "var(--success)" : "var(--warning)"}
            strokeWidth={active.denseStrong ? "1.75" : "1.25"}
            className={txClass}
          />
          <text x="360" y="104" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--cyan)">
            Dense Vector
          </text>
          <rect
            x="498"
            y="90"
            width="156"
            height="20"
            rx="10"
            fill={active.denseStrong ? "var(--success-soft)" : "var(--warning-soft)"}
            className={txClass}
          />
          <text
            x="576"
            y="104"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={active.denseStrong ? "var(--success)" : "var(--warning)"}
          >
            {active.denseBadge}
          </text>

          {active.denseRows.map((row, idx) => {
            const rowY = 118 + idx * 36;
            const barW = Math.max(12, Math.round(row.score * maxBarW));
            const barFill = row.isTarget
              ? active.denseStrong
                ? "var(--success)"
                : "var(--warning)"
              : "var(--cyan)";
            return (
              <g key={`dense-${row.code}`} className={txClass}>
                <text
                  x="360"
                  y={rowY + 12}
                  fontSize="11"
                  fontWeight={row.isTarget ? "700" : "500"}
                  fontFamily="var(--font-sans)"
                  fill={row.isTarget ? "var(--fg)" : "var(--muted)"}
                >
                  {row.isTarget ? `★ ${row.label}` : row.label}
                </text>
                <text
                  x="652"
                  y={rowY + 12}
                  textAnchor="end"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={row.isTarget ? barFill : "var(--muted)"}
                >
                  {row.score.toFixed(2)}
                </text>
                <rect x="360" y={rowY + 18} width={maxBarW} height="9" rx="4.5" fill="var(--surface-2)" />
                <rect
                  x="360"
                  y={rowY + 18}
                  width={barW}
                  height="9"
                  rx="4.5"
                  fill={barFill}
                  opacity={row.isTarget ? 1 : 0.5}
                  className={txClass}
                />
              </g>
            );
          })}

          {/* Bottom Hybrid Verdict Strip */}
          <rect x="16" y="240" width="648" height="30" rx="10" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1" />
          <text x="340" y="259" textAnchor="middle" fontSize="11.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
            {active.verdict}
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
 * 5. RerankerQueryTransformVisual (reranker-query-transform)
 *    2-tab diagram: Cross-Encoder Rerank (Top-20 -> Top-5)
 *    vs Query Rewrite / HyDE + Latency Guard
 *    Animated candidate funnel & Recall@5 lifting 0.66 -> 0.80 -> 0.90
 * ========================================================================== */

type RerankTabId = "rerank" | "transform";

const RERANK_CAPTIONS: Record<RerankTabId, string> = {
  rerank:
    "Cross-Encoder Rerank (Top-20 → Top-5): ดึงผู้สมัคร 20 ก้อนอย่างรวดเร็วด้วย Hybrid Search แล้วให้ Cross-Encoder อ่านคู่ [Query + Doc] พร้อมกันเพื่อจัดอันดับใหม่ ดันเอกสารที่เคยจมอยู่อันดับ #9 และ #14 ขึ้นมา Top-5 จน Recall@5 พุ่งจาก 0.66 → 0.80 → 0.90",
  transform:
    "Query Rewrite / HyDE + Latency Guard: คำถามสั้นหรือคำถามต่อเนื่องที่คลุมเครือจะถูก Rewrite ให้เต็มบริบทหรือร่างคำตอบสมมติ (HyDE) ก่อนค้นหา โดยมี Latency Guard คอยคุม p95 หากเกินงบ 400ms จะข้าม HyDE อัตโนมัติเพื่อไม่ให้แชตค้าง",
};

export function RerankerQueryTransformVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [tab, setTab] = useState<RerankTabId>("rerank");
  const isRerank = tab === "rerank";

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowBrandId = `${uid}-rk-brand`;
  const arrowCyanId = `${uid}-rk-cyan`;
  const arrowSuccessId = `${uid}-rk-success`;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="เลือกเทคนิคเพิ่ม Recall@5 หลังและก่อนการค้นหา"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          aria-pressed={isRerank}
          onClick={() => setTab("rerank")}
          className={isRerank ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isRerank ? ACTIVE_BTN_STYLE : undefined}
        >
          Cross-Encoder Rerank (Top-20 → Top-5)
        </button>
        <button
          type="button"
          aria-pressed={!isRerank}
          onClick={() => setTab("transform")}
          className={!isRerank ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isRerank ? ACTIVE_BTN_STYLE : undefined}
        >
          Query Rewrite / HyDE + Latency Guard
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={
            isRerank
              ? "แผนภาพ Cross-Encoder Rerank คัดกรอง Top-20 เหลือ Top-5 และยกระดับ Recall@5 จาก 0.66 เป็น 0.90"
              : "แผนภาพ Query Rewrite และ HyDE พร้อม Latency Guard และยกระดับ Recall@5 จาก 0.66 เป็น 0.90"
          }
        >
          <defs>
            <marker id={arrowBrandId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={arrowCyanId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id={arrowSuccessId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {isRerank ? (
            <g className={txClass}>
              {/* Stage 1: Hybrid Top-20 */}
              <rect x="16" y="14" width="166" height="156" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
              <text x="28" y="34" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--fg)">
                1. Hybrid Top-20
              </text>
              <text x="28" y="49" fontSize="10" fontFamily="var(--font-sans)" fill="var(--muted)">
                ดึงเร็ว ~15ms (เอกสารตรงยังจม)
              </text>

              {[
                { rank: "#1", text: "บทความทั่วไป", hit: false },
                { rank: "#4", text: "เงื่อนไขย่อย", hit: true },
                { rank: "#9", text: "นโยบายหลัก ★", hit: true },
                { rank: "#14", text: "ตารางราคา ★", hit: true },
                { rank: "#20", text: "ประกาศเก่า", hit: false },
              ].map((doc, idx) => {
                const y = 58 + idx * 21;
                return (
                  <g key={doc.rank}>
                    <rect
                      x="26"
                      y={y}
                      width="146"
                      height="18"
                      rx="5"
                      fill={doc.hit ? "var(--brand-soft)" : "var(--surface-2)"}
                      stroke={doc.hit ? "var(--brand)" : "var(--hair)"}
                      strokeWidth={doc.hit ? "1" : "0.75"}
                    />
                    <text x="33" y={y + 12.5} fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill={doc.hit ? "var(--brand-ink)" : "var(--muted)"}>
                      {doc.rank}
                    </text>
                    <text x="64" y={y + 12.5} fontSize="10" fontFamily="var(--font-sans)" fill={doc.hit ? "var(--fg)" : "var(--muted)"}>
                      {doc.text}
                    </text>
                  </g>
                );
              })}

              {/* Animated Converging Funnel Lines (Top-20 -> Reranker) */}
              <path
                d="M 182 68 C 204 68, 202 88, 224 88"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="1.75"
                strokeDasharray={reduced ? undefined : "5 5"}
                markerEnd={`url(#${arrowBrandId})`}
                className={flowClass}
              />
              <path
                d="M 182 108 L 224 108"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "5 5"}
                markerEnd={`url(#${arrowBrandId})`}
                className={flowClass}
              />
              <path
                d="M 182 146 C 204 146, 202 126, 224 126"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="1.75"
                strokeDasharray={reduced ? undefined : "5 5"}
                markerEnd={`url(#${arrowBrandId})`}
                className={flowClass}
              />

              {/* Stage 2: Cross-Encoder Reranker */}
              <rect x="230" y="14" width="204" height="156" rx="12" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.75" />
              <text x="332" y="36" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
                2. Cross-Encoder
              </text>
              <text x="332" y="52" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
                bge-reranker-v2-m3
              </text>

              <rect x="244" y="62" width="176" height="44" rx="8" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1" />
              <text x="332" y="80" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
                [Query ⊕ Doc_i]
              </text>
              <text x="332" y="96" textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--muted)">
                Full Attention ให้คะแนนทีละคู่
              </text>

              <rect x="244" y="114" width="176" height="22" rx="6" fill="var(--surface)" stroke="var(--hair)" />
              <text x="332" y="129" textAnchor="middle" fontSize="10.5" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--fg)">
                Top-20 → ตัดเหลือ Top-5
              </text>

              <rect x="266" y="142" width="132" height="20" rx="10" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1" />
              <text x="332" y="156" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--warning)">
                ⏱ ~95ms / 20 pairs
              </text>

              {/* Animated Funnel Output Arrow */}
              <path
                d="M 434 96 L 474 96"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 5"}
                markerEnd={`url(#${arrowSuccessId})`}
                className={flowClass}
              />

              {/* Stage 3: Top-5 to LLM */}
              <rect x="480" y="14" width="184" height="156" rx="12" fill="var(--surface)" stroke="var(--success)" strokeWidth="1.75" />
              <text x="492" y="34" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
                3. Top-5 เข้า LLM ✓
              </text>
              <text x="492" y="49" fontSize="10" fontFamily="var(--font-sans)" fill="var(--muted)">
                บริบทสะอาด คัดทิ้ง 15 ก้อน
              </text>

              {[
                { rank: "#1", label: "นโยบายหลัก", lift: "↑#9", score: "0.94" },
                { rank: "#2", label: "ตารางราคา", lift: "↑#14", score: "0.89" },
                { rank: "#3", label: "เงื่อนไขย่อย", lift: "↑#4", score: "0.84" },
              ].map((doc, idx) => {
                const y = 60 + idx * 33;
                return (
                  <g key={doc.rank}>
                    <rect
                      x="490"
                      y={y}
                      width="164"
                      height="27"
                      rx="7"
                      fill={idx < 2 ? "var(--success-soft)" : "var(--brand-soft)"}
                      stroke={idx < 2 ? "var(--success)" : "var(--brand)"}
                      strokeWidth="1"
                    />
                    <text x="498" y={y + 17} fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill={idx < 2 ? "var(--success)" : "var(--brand-ink)"}>
                      {doc.rank}
                    </text>
                    <text x="520" y={y + 17} fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
                      {doc.label}
                    </text>
                    <text x="646" y={y + 17} textAnchor="end" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill={idx < 2 ? "var(--success)" : "var(--brand-ink)"}>
                      {doc.lift} · {doc.score}
                    </text>
                  </g>
                );
              })}
            </g>
          ) : (
            <g className={txClass}>
              {/* Stage 1: Ambiguous Follow-up Query */}
              <rect x="16" y="14" width="166" height="156" rx="12" fill="var(--surface)" stroke="var(--warning)" strokeWidth="1.5" />
              <text x="28" y="34" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--warning)">
                1. Raw Query
              </text>
              <rect x="26" y="46" width="146" height="44" rx="8" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1" />
              <text x="99" y="65" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
                &ldquo;แล้วอันนั้น
              </text>
              <text x="99" y="81" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
                คืนเงินได้ไหม?&rdquo;
              </text>
              <text x="28" y="110" fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--warning)">
                ปัญหา:
              </text>
              <text x="28" y="126" fontSize="10" fontFamily="var(--font-sans)" fill="var(--muted)">
                • คำสรรพนามลอย (“อันนั้น”)
              </text>
              <text x="28" y="142" fontSize="10" fontFamily="var(--font-sans)" fill="var(--muted)">
                • ไม่มีชื่อแพ็กเกจในคำค้น
              </text>
              <text x="28" y="158" fontSize="10" fontFamily="var(--font-sans)" fill="var(--muted)">
                • ค้นตรงๆ ได้ Recall ต่ำ
              </text>

              {/* Animated Arrow 1 -> 2 */}
              <path
                d="M 182 92 L 216 92"
                fill="none"
                stroke="var(--cyan)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 5"}
                markerEnd={`url(#${arrowCyanId})`}
                className={flowClass}
              />

              {/* Stage 2: Query Rewrite / HyDE + Latency Guard */}
              <rect x="222" y="14" width="224" height="156" rx="12" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeWidth="1.75" />
              <text x="334" y="34" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--cyan)">
                2. Rewrite / HyDE + Guard
              </text>

              {/* Rewrite Box */}
              <rect x="234" y="44" width="200" height="36" rx="8" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="1" />
              <text x="244" y="59" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--cyan)">
                Query Rewrite (เติมบริบทแชต)
              </text>
              <text x="244" y="73" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
                &ldquo;นโยบายคืนเงินแพ็กเกจ Pro 14 วัน&rdquo;
              </text>

              {/* HyDE Box */}
              <rect x="234" y="86" width="200" height="36" rx="8" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1" />
              <text x="244" y="101" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
                HyDE (ร่างคำตอบสมมติ → Embed)
              </text>
              <text x="244" y="115" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
                เพิ่มโอกาสตรงภาษาเอกสารทางการ
              </text>

              {/* Latency Guard Pill */}
              <rect x="234" y="130" width="200" height="30" rx="8" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1.25" />
              <text x="334" y="149" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--warning)">
                ⏱ Guard: p95 &gt; 400ms → ข้าม HyDE
              </text>

              {/* Animated Arrow 2 -> 3 */}
              <path
                d="M 446 92 L 478 92"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 5"}
                markerEnd={`url(#${arrowSuccessId})`}
                className={flowClass}
              />

              {/* Stage 3: Expanded Retrieve + Rerank */}
              <rect x="484" y="14" width="180" height="156" rx="12" fill="var(--surface)" stroke="var(--success)" strokeWidth="1.75" />
              <text x="496" y="34" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
                3. High-Recall Output
              </text>
              <rect x="494" y="46" width="160" height="38" rx="8" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1" />
              <text x="574" y="63" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
                Hybrid Top-20 → Rerank 5
              </text>
              <text x="574" y="78" textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--fg)">
                เจอนโยบาย Pro + ข้อยกเว้นครบ
              </text>

              <rect x="494" y="94" width="160" height="30" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
              <text x="574" y="113" textAnchor="middle" fontSize="10.5" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--fg)">
                p95 Latency: ~340 ms ✓
              </text>

              <rect x="494" y="132" width="160" height="28" rx="8" fill="var(--brand-soft)" />
              <text x="574" y="150" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
                ไม่หลุดคำถามต่อเนื่องในแชต
              </text>
            </g>
          )}

          {/* Bottom Strip: Recall@5 Progression (0.66 -> 0.80 -> 0.90) */}
          <rect x="16" y="182" width="648" height="86" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
          <text x="28" y="206" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--fg)">
            Recall@5 Lift
          </text>
          <text x="28" y="224" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
            ชุดทดสอบไทย 200 ข้อ
          </text>
          <rect x="28" y="234" width="144" height="22" rx="6" fill="var(--success-soft)" />
          <text x="100" y="249" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
            0.66 → 0.80 → 0.90
          </text>

          {/* Recall Stage 1: Dense Only (0.66) */}
          <rect x="192" y="194" width="136" height="62" rx="10" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="202" y="211" fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--muted)">
            Dense Only
          </text>
          <text x="318" y="211" textAnchor="end" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--warning)">
            0.66
          </text>
          <rect x="202" y="220" width="116" height="8" rx="4" fill="var(--surface)" stroke="var(--hair)" />
          <rect x="202" y="220" width="76" height="8" rx="4" fill="var(--warning)" />
          <text x="202" y="246" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
            Baseline (Naive)
          </text>

          {/* Arrow 1 -> 2 */}
          <line
            x1="330"
            y1="225"
            x2="352"
            y2="225"
            stroke="var(--cyan)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "4 4"}
            markerEnd={`url(#${arrowCyanId})`}
            className={flowClass}
          />

          {/* Recall Stage 2: Hybrid RRF (0.80) */}
          <rect x="358" y="194" width="136" height="62" rx="10" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeWidth="1.25" />
          <text x="368" y="211" fontSize="10.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--cyan)">
            Hybrid RRF
          </text>
          <text x="484" y="211" textAnchor="end" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--cyan)">
            0.80
          </text>
          <rect x="368" y="220" width="116" height="8" rx="4" fill="var(--surface)" />
          <rect x="368" y="220" width="93" height="8" rx="4" fill="var(--cyan)" />
          <text x="368" y="246" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--fg)">
            +0.14 vs Dense
          </text>

          {/* Arrow 2 -> 3 */}
          <line
            x1="496"
            y1="225"
            x2="518"
            y2="225"
            stroke="var(--success)"
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "4 4"}
            markerEnd={`url(#${arrowSuccessId})`}
            className={flowClass}
          />

          {/* Recall Stage 3: + Rerank / Transform (0.90) */}
          <rect
            x="524"
            y="194"
            width="130"
            height="62"
            rx="10"
            fill="var(--success-soft)"
            stroke="var(--success)"
            strokeWidth="1.75"
            className={txClass}
          />
          <text x="534" y="211" fontSize="10.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
            {isRerank ? "+ Rerank" : "+ Rewrite"}
          </text>
          <text x="644" y="211" textAnchor="end" fontSize="12.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
            0.90
          </text>
          <rect x="534" y="220" width="110" height="8" rx="4" fill="var(--surface)" />
          <rect x="534" y="220" width="99" height="8" rx="4" fill="var(--success)" className={txClass} />
          <text x="534" y="246" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
            +0.24 (+36% rel)
          </text>
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {RERANK_CAPTIONS[tab]}
      </div>
    </div>
  );
}
