import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D124 — Phase 4 / Block B31 (Checkpoint Day)
 * Phase 4 Checkpoint: Demo Thai Knowledge RAG + Controlled Agent & Architecture Audit
 */
export const d124: Lesson = defineLesson({
  day: 124,
  titleTh: "Checkpoint Phase 4: สาธิตระบบ Thai Knowledge RAG + Controlled Agent และตรวจสถาปัตยกรรม",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ปิด Milestone v0.4.0 ด้วยการตรวจรับ 5 มิติ: Recall@5 >= 0.85, Citation Faithfulness = 1.0, Zero Leak, Loop Safety และ P95 Latency",
  icon: "award",
  visual: {
    id: "phase4-rag-agent-arch",
    title: "Phase 4 Checkpoint & Readiness Gate ก่อนก้าวสู่ Phase 5 (Evals & Deploy)",
    caption: "สรุปเกณฑ์ตรวจรับระบบทั้ง 5 มิติ: Recall@5 >= 0.85, Citation Faithfulness = 1.0, Zero Cross-Tenant Leak, Bounded Steps และ P95 Latency",
    alt: "แผนภาพ Phase 4 Checkpoint Readiness Gate",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — สร้าง Phase 4 Readiness Auditor & Architecture Report ทดสอบด้วย pytest",
  tools: ["Python 3.12", "Pydantic v2", "pytest", "Git Tag v0.4.0"],

  bigPicture: [
    {
      node: 0,
      heading: "ยินดีด้วย! คุณเดินทางมาถึงวัน Checkpoint ปิดท้าย Phase 4 (ครบ 124 วัน / 2 ใน 3 ของหลักสูตร)",
      body: "ตลอด 32 วันของ Phase 4 (Day 93–124) คุณได้สร้างระบบ **Thai Hybrid Knowledge {{rag}} + {{mcp}} Server + Guarded {{langgraph}} Agent** ตั้งแต่ศูนย์ — วันนี้เราจะนำผลงานมาตรวจรับผ่าน **5 Quality Gates** เพื่อติดแท็กพอร์ตโฟลิโอชิ้นที่ 4 (`v0.4.0`)",
      lessonNote: "เหมือนกับที่เราปิด `v0.3.0` ใน Day 92 วันนี้เราจะสร้าง `phase4_checkpoint.py` เพื่อพิสูจน์ความพร้อมด้วยตัวเลขที่ตรวจสอบซ้ำได้",
    },
    {
      node: 1,
      heading: "มิติที่ 1 & 2 (Retrieval & Grounding): Recall@5 >= 0.85 และ Citation Faithfulness = 1.0",
      body: "ระบบค้นคืนแบบ Hybrid ({{bm25}} + {{hnsw}} + {{rrf}} + {{reranker}}) ต้องดึงเอกสารที่เกี่ยวข้องติดใน 5 อันดับแรกเฉลี่ยอย่างน้อย **0.85 (`Recall@5 >= 0.85`)** และทุกคำตอบที่ส่งให้ผู้ใช้ต้องผ่านด่านตรวจป้ายอ้างอิง `[doc_id#chunk]` และตัวเลขตรงตามหลักฐาน **100% (`Faithfulness == 1.0`)**",
      lessonNote: "คำนวณ Recall@5 ต่อคำถามจาก $|\\text{relevant} \\cap \\text{top5}| / |\\text{relevant}|$ แล้วหาค่าเฉลี่ยทุกคำถาม",
    },
    {
      node: 4,
      heading: "มิติที่ 3 & 4 (Security & Control): Zero Cross-Tenant Leak และ 100% Bounded Steps",
      body: "จากชุดทดสอบรวมทุกเส้นทาง (ผลค้นคืน, คำตอบสุดท้าย และผลลัพธ์จาก {{mcp}} Tool) ต้องไม่มีข้อมูลของผู้เช่ารายอื่นรั่วไหลเลยแม้แต่รายการเดียว (**`cross_tenant_leaks == 0`**) และทุกเคสในกราฟต้องหยุดทำงานภายใน `steps_taken <= max_steps` พร้อมรองรับด่าน {{hitl}}",
      lessonNote: "หากมีแม้แต่ 1 เคสที่ข้อมูลรั่วหรือเดินเกิน `max_steps` ด่านตรวจรับจะตีตกทันที (Fail-Closed)",
    },
    {
      node: 5,
      heading: "มิติที่ 5 (Performance) & สะพานเชื่อมสู่ Phase 5 (AI Evals, Observability, FastAPI & Security)",
      body: "เราตรวจ **P95 Latency** เทียบกับเพดานงบเวลา (`latency_budget_ms`) เพื่อให้มั่นใจว่าระบบตอบสนองทันใจผู้ใช้ และตั้งแต่วันพรุ่งนี้ (Day 125 — Phase 5) เราจะนำระบบนี้ไปขึ้นระบบวัดผลอัตโนมัติใน CI (`Promptfoo` / `RAGAS`), ติดตั้ง OpenTelemetry Tracing (`Langfuse`) และห่อเป็น Production {{fastapi}} Container!",
      lessonNote: "ปฏิเสธชุดข้อมูลวัดผลที่ว่างเปล่า (`raise ValueError`) เสมอเพื่อป้องกัน Vacuous Pass",
    },
  ],

  objectives: [
    "**คำนวณและตรวจสอบเกณฑ์ทั้ง 5 มิติของ Phase 4 Milestone (`v0.4.0`)** ได้แก่ `Recall@5 >= 0.85`, `Citation Faithfulness == 1.0`, `Zero Cross-Tenant Leakage`, `100% Termination within max_steps` และ `P95 Latency <= budget_ms`",
    "**สร้าง `Phase4ReadinessAuditor`** ที่ปฏิเสธข้อมูลวัดผลที่ว่างเปล่า (`raise ValueError`), รายงานผลแยกรายมิติ (`failed_gates`) และอนุมัติผ่านเฉพาะเมื่อทุกมิติผ่านครบ 100%",
    "**ทบทวนความรู้รวมทั้ง Phase 4 (Cumulative Quiz B24–B31)** และสร้างรายงาน Markdown สำหรับใส่ใน `README.md` ของพอร์ตโฟลิโอชิ้นที่ 4",
  ],

  prerequisites: [
    "ผ่าน Day 93–123 (ครบทั้ง 8 บล็อกของ Phase 4: B24–B31)",
    "มีผลลัพธ์จาก `thai_rag_agent.py` (D121), `citation_fallback.py` (D122) และ `eval_phase4_queries.py` (D123)",
    "ไม่ต้องใช้ API key — รันสคริปต์ตรวจรับ Checkpoint และชุดทดสอบบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "เปิดโปรเจกต์ Phase 4 ของคุณ (หรือสร้างโฟลเดอร์ `ai-day124` สำหรับแบบฝึกหัดตรวจรับวันนี้) แล้วรัน Quality Gate ครบชุด",
    commands: `uv init ai-day124 && cd ai-day124
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "เตรียมโปรเจกต์ `ai-day124` และติดตั้ง `pydantic`, `pytest`, `ruff`"],
      ["audit", "เขียน `phase4_checkpoint.py` และ `test_phase4_checkpoint.py`"],
      ["gate", "รัน `uv run pytest -v` และ `uv run ruff check .` ให้ผ่าน 100% ก่อนติดแท็ก `v0.4.0`"],
    ],
    note: "จังหวะเวลา 30 นาทีของวัน Checkpoint: ทำ Cumulative Quiz (10 นาที) → เขียนสคริปต์ Readiness Auditor 5 มิติ (15 นาที) → สรุป Error Log & เตรียมขึ้น Phase 5 (5 นาที)",
  },

  concepts: [
    {
      id: "five-pillars-of-phase4-readiness",
      title: "1 · 5 Quality Gates ของ Portfolio Milestone ชิ้นที่ 4 (v0.4.0)",
      paragraphs: [
        "ก่อนที่เราจะติดแท็ก `git tag -a v0.4.0 -m \"Phase 4: Thai Hybrid RAG & Controlled Agent\"` ระบบของเราต้องผ่านเกณฑ์วิศวกรรมทั้ง 5 มิติอย่างเป็นรูปธรรม:",
        "1. **`recall_at_5_gate` ($\\text{Mean Recall@5} \\ge 0.85$)**: สำหรับแต่ละคำถามในชุดทดสอบ คำนวณสัดส่วนของเอกสารเฉลย (`relevant_ids`) ที่ปรากฏอยู่ใน 5 อันดับแรกของผลค้นคืน (`retrieved_ids[:5]`) แล้วหาค่าเฉลี่ยทุกคำถาม ต้องได้ตั้งแต่ `0.85` ขึ้นไป\n2. **`faithfulness_gate` ($\\text{Citation Faithfulness} == 1.0$)**: ทุกคำตอบที่ระบบตอบกลับ (`answered` / `repaired`) ต้องมีป้าย `[doc_id#chunk]` ที่อยู่ในหลักฐานของ tenant ตัวเองและข้อมูลตัวเลขตรงตามต้นฉบับ 100% (ตรวจโดยชุดป้ายกำกับที่มนุษย์ตรวจสอบแล้ว)\n3. **`zero_leak_gate` ($\\text{Cross-Tenant Leaks} == 0$)**: ตรวจทั้งใน `retrieved_tenants`, `cited_tenants` และ `tool_output_tenants` เทียบกับ `request_tenant` ต้องไม่มีข้อมูลข้ามบริษัทแม้แต่รายการเดียว\n4. **`loop_safety_gate` ($\\text{All Terminated within } \\text{max\\_steps}$)**: ทุกเคสการรันของกราฟต้องมี `steps_taken <= max_steps` (100% bounded termination)\n5. **`latency_p95_gate` ($\\text{P95 Latency} \\le \\text{budget\\_ms}$)**: เวลาตอบสนองที่เปอร์เซ็นไทล์ที่ 95 ต้องไม่เกินงบเวลาที่กำหนด (เช่น `2500 ms`)",
      ],
      analogy:
        "เหมือนการตรวจรับอาคารอัจฉริยะ 5 ระบบก่อนเปิดใช้งาน: (1) ระบบค้นหาเอกสารแม่นยำ, (2) ทุกคำตอบมีหลักฐานอ้างอิงจริง, (3) ประตูนิรภัยกั้นห้องแต่ละบริษัทไม่รั่วไหล, (4) ระบบตัดไฟอัตโนมัติทำงานไม่ปล่อยให้เครื่องค้าง และ (5) ลิฟต์วิ่งเร็วทันเวลา",
      bullets: [
        "**Fail-Closed Gate**: `passed_all = (len(failed_gates) == 0)` เท่านั้น ถ้าตกแม้แต่มิติเดียวห้ามปล่อยผ่าน",
        "**No Empty Metrics**: หากลิสต์คำถามหรือลิสต์การรันว่างเปล่า (`[]`) ต้องโยน `ValueError` ทันที",
        "**Reproducible Report**: รายงานตัวเลขทั้ง 5 มิติเป็นโครงสร้าง Pydantic และตาราง Markdown สำหรับแปะใน README",
      ],
      whyTitle: "Why this matters — ตัวเลข 5 มิตินี้คือคำตอบที่ทรงพลังที่สุดในการสัมภาษณ์งาน AI Engineer",
      whyParagraphs: [
        "แทนที่จะบอกผู้สัมภาษณ์ว่า `'ผมเคยทำโปรเจกต์แชตบอท RAG ครับ'` คุณสามารถพูดพร้อมโชว์ตารางได้ว่า `'ผมสร้างระบบ Thai Hybrid RAG + FastMCP + Guarded LangGraph ที่ได้ Recall@5 0.92, Citation Faithfulness 1.0, Zero Cross-Tenant Leakage บนชุดทดสอบ 15 สถานการณ์ และ P95 Latency 840 ms ครับ'`",
      ],
    },
    {
      id: "exact-metric-formulas",
      title: "2 · สูตรคำนวณ Recall@5, Cross-Tenant Leak Detection และ P95 Latency",
      paragraphs: [
        "มาทบทวนวิธีเขียนโค้ดคำนวณแต่ละตัวชี้วัดให้แม่นยำและไม่มีบั๊กกรณีขอบ (Edge Cases):",
        "**การคำนวณ Mean Recall@5**: สำหรับแต่ละคำถามที่มีเซตเฉลย $R = \\text{set}(\\text{relevant\\_ids})$ (โดย $|R| > 0$) และรายการค้นคืน 5 อันดับแรก $T_5 = \\text{set}(\\text{retrieved\\_ids}[:5])$ ค่า Recall@5 ของคำถามนั้นคือ $|R \\cap T_5| / |R|$ จากนั้นนำมาหาค่าเฉลี่ยเลขคณิตของทุกคำถาม (หากรายการคำถามว่าง หรือพบคำถามที่ $R$ ว่างเปล่า ให้โยน `ValueError` ทันที)",
        "**การตรวจ Cross-Tenant Leaks**: สำหรับแต่ละเทิร์นการรันที่มี `request_tenant` ให้รวมรหัส tenant ทั้งหมดที่ปรากฏในผลค้นคืน (`retrieved_tenants`), ในคำตอบ (`answer_tenants`) และในผลลัพธ์ของเครื่องมือ (`tool_tenants`) หากมีรหัสใดที่ `t != turn.request_tenant` ให้นับว่าเทิร์นนั้นเกิดการรั่วไหลทันที",
        "**การคำนวณ P95 Latency**: เรียงลำดับเวลา `latencies_ms` จากน้อยไปมาก แล้วดึงค่าที่ตำแหน่งดัชนี `idx = max(0, math.ceil(0.95 * len(sorted_vals)) - 1)` มาเทียบกับ `latency_budget_ms`",
      ],
      analogy:
        "การเขียนสูตรวัดผลที่โยน `ValueError` เมื่อข้อมูลว่าง เหมือนเครื่องชั่งดิจิทัลที่ขึ้นข้อความเตือน `ERR: EMPTY` เมื่อยังไม่ได้วางของบนตาชั่ง แทนที่จะพิมพ์ใบรับรองว่า 'น้ำหนักผ่านเกณฑ์ 0.00 กิโลกรัม'",
      code: {
        language: "python",
        filename: "checkpoint_metrics.py",
        code: `import math


def compute_mean_recall_at_5(
    queries: list[tuple[list[str], list[str]]],
) -> float:
    """รับรายการคู่ (relevant_ids, retrieved_ids) แล้วคำนวณค่าเฉลี่ย Recall@5"""
    if not queries:
        raise ValueError("queries must not be empty")
    scores: list[float] = []
    for relevant_ids, retrieved_ids in queries:
        rel_set = set(relevant_ids)
        if not rel_set:
            raise ValueError("relevant_ids must not be empty for any query")
        top5_set = set(retrieved_ids[:5])
        scores.append(len(rel_set & top5_set) / len(rel_set))
    return round(sum(scores) / len(scores), 4)


def compute_p95_latency(latencies_ms: list[float]) -> float:
    if not latencies_ms or any(x <= 0 for x in latencies_ms):
        raise ValueError("latencies_ms must be non-empty positive numbers")
    ordered = sorted(latencies_ms)
    idx = max(0, math.ceil(0.95 * len(ordered)) - 1)
    return round(float(ordered[idx]), 2)`,
        caption: "ฟังก์ชันคำนวณ Recall@5 และ P95 Latency ที่ดักอินพุตว่างและคำนวณแบบ deterministic 100%",
      },
      whyTitle: "Why this matters — ทำไมต้องตัด `retrieved_ids[:5]` ก่อนแปลงเป็น `set` เสมอ?",
      whyParagraphs: [
        "ถ้าเราเผลอแปลง `set(retrieved_ids)` ก่อนตัด `[:5]` นอกจากลำดับอันดับจะหายไปเพราะ `set` ไม่มีลำดับแล้ว เรายังเผลอนับเอกสารที่อยู่อันดับ 6–20 เข้ามาเป็นคะแนน Recall@5 อย่างผิดพลาดด้วย!",
      ],
    },
    {
      id: "bridge-to-phase5-evals-and-deploy",
      title: "3 · สะพานเชื่อมสู่ Phase 5 (Days 125–152): AI Evals, Observability, FastAPI & Security",
      paragraphs: [
        "ลองมองย้อนกลับไปดูสิ่งที่คุณสร้างเสร็จแล้วตลอด 4 Phases (124 วัน):",
        "- **Phase 1 (D1–D32)**: Modern Python, `uv`, Strict Pydantic v2, Async `httpx`, SQLite, Polars & DuckDB\n- **Phase 2 (D33–D60)**: Math, NumPy, leakage-free scikit-learn/LightGBM, PyThaiNLP & ONNX Runtime\n- **Phase 3 (D61–D92)**: PyTorch Autograd, Transformers, Dense Embeddings, Prompt Caching, Local Ollama & LoRA\n- **Phase 4 (D93–D124)**: Thai Hybrid RAG (BM25 + HNSW + RRF + Reranker), Multi-Tenant ACL, Grounded Citations, Safe Tools, FastMCP & Guarded LangGraph + HITL",
        "ตั้งแต่วันพรุ่งนี้ (**Day 125 — เปิดบท Phase 5**) เราจะนำระบบ RAG + Agent ที่ทำงานถูกต้องบนเครื่องคุณนี้ ไปยกระดับสู่ระบบ **Production Operations** เต็มรูปแบบ: ตั้งเกณฑ์ประเมินอัตโนมัติด้วย {{ragas}} และ {{promptfoo}} ใน CI/CD, ติดตั้งระบบส่องกล้อง {{otel}} & {{langfuse}} Tracing, ห่อเป็น Async {{fastapi}} + Docker Container, เสิร์ฟโมเดลด้วย {{vllm}} และตั้งเกราะ {{guardrails}} + {{pdpa}} Compliance!",
      ],
      analogy:
        "Phase 4 คือการสร้างเครื่องยนต์ไฮบริดพร้อมระบบควบคุมอัตโนมัติจนวิ่งในสนามทดสอบของโรงงานผ่านครบทุกด่าน ส่วน Phase 5 คือการติดกล่องดำบันทึกข้อมูลการขับขี่ (Observability), ผ่านด่านตรวจมาตรฐานความปลอดภัยบนถนนหลวง (CI Evals & PDPA) และนำออกให้บริการลูกค้าจริง (FastAPI & Docker)",
      bullets: [
        "**Block B32–B34 (D125–D136)**: Systematic Evals, LLM-as-a-Judge Calibration, RAGAS & Promptfoo CI Gates",
        "**Block B35 (D137–D140)**: OpenTelemetry GenAI Spans, Langfuse Tracing, Cost & Token Dashboards",
        "**Block B36–B38 (D141–D152)**: Async FastAPI, Docker, vLLM Serving, OWASP Red-Teaming & PDPA Guardrails",
      ],
      whyTitle: "Why this matters — `phase4_checkpoint.py` ของวันนี้คือจุดเริ่มต้นโดยตรงของ Eval Harness ใน Day 125",
      whyParagraphs: [
        "ฟังก์ชันคำนวณ Recall@5, Faithfulness, Leakage และ P95 Latency ที่คุณเขียนในวันนี้ จะถูกนำไปขยายต่อเป็นระบบ Regression Eval อัตโนมัติในบล็อกแรกของ Phase 5 ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Phase 4 Readiness Gate กับ Production Release Checklist (Go/No-Go)",
      body: [
        "5 Quality Gates ของ Phase 4 Checkpoint เทียบได้กับ Go/No-Go Release Gate ก่อนปล่อยระบบสำคัญขึ้น Production:",
      ],
      table: [
        ["`recall_at_5 >= 0.85`", "Search Relevance SLA บน Golden Test Set"],
        ["`citation_faithfulness == 1.0`", "100% Data Integrity & Provenance Verification"],
        ["`cross_tenant_leaks == 0`", "Zero-Tolerance Multi-Tenant Isolation Audit"],
        ["`all_terminated_within_max_steps`", "100% Bounded Execution / Zero Hung Worker Threads"],
        ["`p95_latency_ms <= budget_ms`", "API P95 Latency SLO Gate"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมเราถึงวัด Latency ที่ P95 (เปอร์เซ็นไทล์ที่ 95) แทนค่าเฉลี่ย (Mean)",
      body: [
        "ทบทวนจาก Phase 1 & Phase 3: ถ้ามีคำขอ 100 รายการ โดย 95 รายการแรกเร็วมาก (200 ms) แต่อีก 5 รายการที่เข้าสาย RAG + Repair ช้าถึง 2,200 ms ค่าเฉลี่ย (Mean) จะดูต่ำเพียง 300 ms ซึ่งหลอกตาว่าทุกอย่างเร็วมาก",
        "การวัดที่ **P95** บอกเราว่า 'ประสบการณ์ของผู้ใช้ในกลุ่ม 5% ที่ช้าที่สุด' ยังอยู่ในงบเวลา (`<= 2500 ms`) หรือไม่ ซึ่งเป็นตัวชี้วัดที่สะท้อนความรู้สึกของผู้ใช้จริงได้ดีกว่าค่าเฉลี่ยมากครับ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะสร้าง `phase4_checkpoint.py` ที่คำนวณตัวชี้วัดทั้ง 5 มิติจากผลการรันชุดทดสอบ Phase 4 และตัดสินว่าผ่านเกณฑ์พร้อมก้าวสู่ Phase 5 (`ready_for_phase5=True`) หรือไม่",
    steps: [
      {
        title: "1 · นิยามโมเดลข้อมูลการวัดผลรายเคส (`QueryEvalRecord`, `TurnAuditRecord`) และรายงาน `Phase4CheckpointReport`",
        explain:
          "แยกข้อมูลการค้นคืน (`QueryEvalRecord`) และข้อมูลการทำงานของแต่ละเทิร์น (`TurnAuditRecord`) อย่างชัดเจน",
        code: {
          language: "python",
          filename: "worked_phase4_checkpoint.py",
          code: `import math
from pydantic import BaseModel, Field


class QueryEvalRecord(BaseModel):
    query_id: str
    relevant_ids: list[str]
    retrieved_ids: list[str]


class TurnAuditRecord(BaseModel):
    case_id: str
    request_tenant: str
    retrieved_tenants: list[str] = Field(default_factory=list)
    answer_tenants: list[str] = Field(default_factory=list)
    tool_tenants: list[str] = Field(default_factory=list)
    is_citation_faithful: bool
    steps_taken: int
    max_steps: int
    latency_ms: float


class Phase4CheckpointReport(BaseModel):
    mean_recall_at_5: float
    citation_faithfulness: float
    cross_tenant_leaks: int
    all_within_max_steps: bool
    p95_latency_ms: float
    passed_gates: list[str]
    failed_gates: list[str]
    ready_for_phase5: bool`,
        },
      },
      {
        title: "2 · เขียนฟังก์ชันคำนวณแต่ละมิติและ `evaluate_phase4_checkpoint`",
        explain:
          "ปฏิเสธข้อมูลวัดที่ว่างเปล่าด้วย `ValueError` คำนวณทั้ง 5 มิติ และผ่าน Gate เฉพาะเมื่อ `failed_gates` เป็นลิสต์ว่างเท่านั้น",
        code: {
          language: "python",
          filename: "worked_phase4_checkpoint.py",
          code: `def evaluate_phase4_checkpoint(
    retrieval_records: list[QueryEvalRecord],
    turn_records: list[TurnAuditRecord],
    min_recall_at_5: float = 0.85,
    latency_budget_ms: float = 2500.0,
) -> Phase4CheckpointReport:
    if not retrieval_records or not turn_records:
        raise ValueError("retrieval_records and turn_records must not be empty")

    # 1. Mean Recall@5
    recalls: list[float] = []
    for rec in retrieval_records:
        rel = set(rec.relevant_ids)
        if not rel:
            raise ValueError(f"Empty relevant_ids in {rec.query_id}")
        top5 = set(rec.retrieved_ids[:5])
        recalls.append(len(rel & top5) / len(rel))
    mean_r5 = round(sum(recalls) / len(recalls), 4)

    # 2. Citation Faithfulness
    faithful_count = sum(1 for t in turn_records if t.is_citation_faithful)
    faithfulness = round(faithful_count / len(turn_records), 4)

    # 3. Cross-Tenant Leaks across retrieval, answer, and tool outputs
    leak_count = 0
    for t in turn_records:
        observed_tenants = set(t.retrieved_tenants) | set(t.answer_tenants) | set(t.tool_tenants)
        if any(obs != t.request_tenant for obs in observed_tenants):
            leak_count += 1

    # 4. Bounded Steps Termination
    within_steps = all(0 < t.steps_taken <= t.max_steps for t in turn_records)

    # 5. P95 Latency
    if any(t.latency_ms <= 0 for t in turn_records):
        raise ValueError("latency_ms must be positive")
    ordered_lat = sorted(t.latency_ms for t in turn_records)
    p95_idx = max(0, math.ceil(0.95 * len(ordered_lat)) - 1)
    p95_ms = round(float(ordered_lat[p95_idx]), 2)

    checks = [
        ("recall_at_5_gate", mean_r5 >= min_recall_at_5),
        ("citation_faithfulness_gate", faithfulness == 1.0),
        ("zero_cross_tenant_leak_gate", leak_count == 0),
        ("bounded_steps_gate", within_steps),
        ("p95_latency_gate", p95_ms <= latency_budget_ms),
    ]
    passed = [name for name, ok in checks if ok]
    failed = [name for name, ok in checks if not ok]

    return Phase4CheckpointReport(
        mean_recall_at_5=mean_r5,
        citation_faithfulness=faithfulness,
        cross_tenant_leaks=leak_count,
        all_within_max_steps=within_steps,
        p95_latency_ms=p95_ms,
        passed_gates=passed,
        failed_gates=failed,
        ready_for_phase5=(len(failed) == 0),
    )`,
        },
      },
      {
        title: "3 · ทดสอบการตรวจรับทั้งกรณีผ่านครบ 5 มิติ และกรณีมีข้อมูลรั่วข้าม Tenant",
        explain:
          "รันเปรียบเทียบรายงานเมื่อระบบผ่านทุกเกณฑ์ กับเมื่อมีผลจาก Tool หลุดข้อมูลของ `beta_th` ออกมา 1 รายการ",
        code: {
          language: "python",
          filename: "worked_phase4_checkpoint.py",
          code: `q_records = [
    QueryEvalRecord(query_id="q1", relevant_ids=["c1", "c2"], retrieved_ids=["c1", "c3", "c2", "c4", "c5"]),
    QueryEvalRecord(query_id="q2", relevant_ids=["c9"], retrieved_ids=["c8", "c9", "c7"]),
]
t_records_ok = [
    TurnAuditRecord(
        case_id="t1",
        request_tenant="acme_th",
        retrieved_tenants=["acme_th"],
        answer_tenants=["acme_th"],
        tool_tenants=["acme_th"],
        is_citation_faithful=True,
        steps_taken=2,
        max_steps=4,
        latency_ms=620.0,
    ),
    TurnAuditRecord(
        case_id="t2",
        request_tenant="acme_th",
        retrieved_tenants=["acme_th"],
        answer_tenants=["acme_th"],
        tool_tenants=[],
        is_citation_faithful=True,
        steps_taken=3,
        max_steps=4,
        latency_ms=940.0,
    ),
]

rep_ok = evaluate_phase4_checkpoint(q_records, t_records_ok)
print("Ready for Phase 5:", rep_ok.ready_for_phase5, "| Recall@5:", rep_ok.mean_recall_at_5, "| P95:", rep_ok.p95_latency_ms)

t_records_leak = [
    t_records_ok[0].model_copy(update={"tool_tenants": ["beta_th"]}),
    t_records_ok[1],
]
rep_leak = evaluate_phase4_checkpoint(q_records, t_records_leak)
print("Leaky report ready:", rep_leak.ready_for_phase5, "| failed_gates:", rep_leak.failed_gates)`,
        },
        output: `Ready for Phase 5: True | Recall@5: 1.0 | P95: 940.0
Leaky report ready: False | failed_gates: ['zero_cross_tenant_leak_gate']`,
      },
    ],
    gotcha:
      "สังเกตว่าใน `QueryEvalRecord` ถ้า `relevant_ids = [\"c1\"]` แต่เอกสาร `\"c1\"` อยู่ใน `retrieved_ids` ที่ตำแหน่งดัชนี `5` (คืออันดับที่ 6) เพราะเราตัด `rec.retrieved_ids[:5]` คะแนน Recall@5 ของข้อนั้นจะเป็น `0.0` ทันทีตามนิยามของ `@5`!",
  },

  practice: {
    intro:
      "ภารกิจ Checkpoint 15 นาที: สร้างโมดูล `phase4_checkpoint.py` ที่ตรวจรับระบบครบทั้ง 5 มิติ (`evaluate_phase4_checkpoint`) พร้อมเขียนชุดทดสอบ `test_phase4_checkpoint.py` ครอบคลุมทุกเกณฑ์",
    requirements: [
      "คำนวณ `mean_recall_at_5` จากสัดส่วนเอกสารใน `relevant_ids` ที่ถูกค้นพบใน 5 อันดับแรก (`retrieved_ids[:5]`) ต่อคำถาม แล้วเฉลี่ยทุกคำถาม โดยต้องได้ `>= 0.85`",
      "ตรวจ `citation_faithfulness == 1.0` จากสัดส่วนเทิร์นที่ `is_citation_faithful == True`",
      "ตรวจไม่ให้มี `cross_tenant_leaks` (`== 0`) จากทั้ง `retrieved_tenants`, `answer_tenants` และ `tool_tenants` เทียบกับ `request_tenant`",
      "ตรวจว่าทุกกรณีหยุดภายใน `0 < steps_taken <= max_steps` และวัด `p95_latency_ms <= latency_budget_ms`",
      "รายงานผลรายมิติ (`passed_gates`, `failed_gates`) และให้ `ready_for_phase5 = True` เฉพาะเมื่อทุกมิติผ่านครบ รวมทั้งโยน `ValueError` เมื่อข้อมูลวัดผลว่างเปล่า พร้อมเขียน `test_phase4_checkpoint.py` ทดสอบครบทุกมิติ",
    ],
    starter: {
      language: "python",
      filename: "phase4_checkpoint.py",
      code: `import math
from pydantic import BaseModel, Field


class QueryEvalRecord(BaseModel):
    query_id: str
    relevant_ids: list[str]
    retrieved_ids: list[str]


class TurnAuditRecord(BaseModel):
    case_id: str
    request_tenant: str
    retrieved_tenants: list[str] = Field(default_factory=list)
    answer_tenants: list[str] = Field(default_factory=list)
    tool_tenants: list[str] = Field(default_factory=list)
    is_citation_faithful: bool
    steps_taken: int
    max_steps: int
    latency_ms: float


class Phase4CheckpointReport(BaseModel):
    mean_recall_at_5: float
    citation_faithfulness: float
    cross_tenant_leaks: int
    all_within_max_steps: bool
    p95_latency_ms: float
    passed_gates: list[str]
    failed_gates: list[str]
    ready_for_phase5: bool


def evaluate_phase4_checkpoint(
    retrieval_records: list[QueryEvalRecord],
    turn_records: list[TurnAuditRecord],
    min_recall_at_5: float = 0.85,
    latency_budget_ms: float = 2500.0,
) -> Phase4CheckpointReport:
    """ตรวจรับทั้ง 5 มิติของ Phase 4 Checkpoint และปฏิเสธข้อมูลวัดที่ว่างเปล่า"""
    # TODO: implement 5-dimension readiness audit
    raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "ในการคำนวณ `Recall@5` ได้ตัดสไลซ์ `rec.retrieved_ids[:5]` ก่อนนำไปหา intersection กับ `set(rec.relevant_ids)` ใช่หรือไม่?",
      "การตรวจ `cross_tenant_leaks` ครอบคลุมครบทั้ง 3 แหล่ง (`retrieved_tenants`, `answer_tenants`, `tool_tenants`) ใช่หรือไม่?",
      "ถ้าส่ง `retrieval_records=[]` หรือ `turn_records=[]` หรือ `relevant_ids=[]` ฟังก์ชันโยน `ValueError` ทันทีใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทุกกรณี (all 5 gates pass, recall@5 slice boundary, faithfulness failure, cross-tenant leak in retrieval/answer/tool, step limit & latency failure, empty input rejection) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ใช้ชื่อ gate ทั้ง 5 ตามลำดับ: `recall_at_5_gate`, `citation_faithfulness_gate`, `zero_cross_tenant_leak_gate`, `bounded_steps_gate`, `p95_latency_gate`",
      },
      {
        body: "ในการตรวจ `within_steps` เช็ก `all(0 < t.steps_taken <= t.max_steps for t in turn_records)` เพื่อกันทั้งค่า 0/ติดลบ และค่าที่เกิน `max_steps`",
      },
      {
        body: "เฉลยชุดทดสอบ `test_phase4_checkpoint.py`:",
        code: {
          language: "python",
          filename: "test_phase4_checkpoint.py",
          code: `import pytest
from phase4_checkpoint import (
    QueryEvalRecord,
    TurnAuditRecord,
    evaluate_phase4_checkpoint,
)

BASE_QUERIES = [
    QueryEvalRecord(
        query_id="q1",
        relevant_ids=["c1", "c2"],
        retrieved_ids=["c1", "c9", "c2", "c8", "c7", "c6"],
    ),
    QueryEvalRecord(
        query_id="q2",
        relevant_ids=["c5"],
        retrieved_ids=["c4", "c3", "c2", "c1", "c5"],
    ),
]
BASE_TURNS = [
    TurnAuditRecord(
        case_id="t1",
        request_tenant="acme_th",
        retrieved_tenants=["acme_th"],
        answer_tenants=["acme_th"],
        tool_tenants=["acme_th"],
        is_citation_faithful=True,
        steps_taken=2,
        max_steps=4,
        latency_ms=750.0,
    ),
    TurnAuditRecord(
        case_id="t2",
        request_tenant="beta_th",
        retrieved_tenants=["beta_th"],
        answer_tenants=["beta_th"],
        tool_tenants=[],
        is_citation_faithful=True,
        steps_taken=3,
        max_steps=4,
        latency_ms=1100.0,
    ),
]


def test_all_five_gates_pass_when_criteria_met() -> None:
    rep = evaluate_phase4_checkpoint(BASE_QUERIES, BASE_TURNS)
    assert rep.ready_for_phase5 is True
    assert rep.mean_recall_at_5 == 1.0
    assert rep.citation_faithfulness == 1.0
    assert rep.cross_tenant_leaks == 0
    assert rep.all_within_max_steps is True
    assert rep.failed_gates == []


def test_recall_at_5_ignores_rank_6_and_fails_below_085() -> None:
    # c2 is at index 5 (rank 6), so recall@5 for q1 is 0.5
    low_queries = [
        QueryEvalRecord(
            query_id="q1",
            relevant_ids=["c1", "c2"],
            retrieved_ids=["c1", "x1", "x2", "x3", "x4", "c2"],
        )
    ]
    rep = evaluate_phase4_checkpoint(low_queries, BASE_TURNS)
    assert rep.mean_recall_at_5 == 0.5
    assert rep.ready_for_phase5 is False
    assert "recall_at_5_gate" in rep.failed_gates


def test_detects_cross_tenant_leak_and_unfaithful_citations() -> None:
    bad_turns = [
        BASE_TURNS[0].model_copy(
            update={"tool_tenants": ["other_tenant"], "is_citation_faithful": False}
        ),
        BASE_TURNS[1],
    ]
    rep = evaluate_phase4_checkpoint(BASE_QUERIES, bad_turns)
    assert rep.ready_for_phase5 is False
    assert rep.cross_tenant_leaks == 1
    assert "zero_cross_tenant_leak_gate" in rep.failed_gates
    assert "citation_faithfulness_gate" in rep.failed_gates


def test_detects_step_overflow_latency_exceeded_and_rejects_empty() -> None:
    slow_turns = [
        BASE_TURNS[0].model_copy(update={"steps_taken": 5, "max_steps": 4, "latency_ms": 3100.0})
    ]
    rep = evaluate_phase4_checkpoint(BASE_QUERIES, slow_turns, latency_budget_ms=2500.0)
    assert rep.ready_for_phase5 is False
    assert "bounded_steps_gate" in rep.failed_gates
    assert "p95_latency_gate" in rep.failed_gates

    with pytest.raises(ValueError):
        evaluate_phase4_checkpoint([], BASE_TURNS)
    with pytest.raises(ValueError):
        evaluate_phase4_checkpoint(BASE_QUERIES, [])`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v`,
    },
  },

  mistakes: [
    {
      title: "คำนวณ Recall โดยไม่ตัด `retrieved_ids[:5]` ก่อน",
      symptom:
        "เอกสารที่อยู่อันดับ 6–20 ถูกรวมเข้ามาเป็นคะแนน Recall@5 ทำให้ตัวเลขสูงเกินจริงทั้งที่ในหน้างานจริงเราส่งเข้า Context เพียง 5 อันดับแรก",
      fix: "ตัดสไลซ์ `set(rec.retrieved_ids[:5])` ก่อนหา intersection กับ `set(rec.relevant_ids)` เสมอ",
    },
    {
      title: "ตรวจ Cross-Tenant Leak เฉพาะในผลค้น RAG (`retrieved_tenants`) แต่ลืมตรวจในผลของ MCP Tool (`tool_tenants`)",
      symptom:
        "RAG ปลอดภัย แต่ฟังก์ชันค้นหาออเดอร์ใน MCP เผลอคืนข้อมูลของบริษัทอื่นออกมาโดยที่รายงาน Checkpoint บอกว่าไม่พบการรั่วไหล",
      fix: "รวมเซต `set(t.retrieved_tenants) | set(t.answer_tenants) | set(t.tool_tenants)` มาเทียบกับ `t.request_tenant` ทุกเทิร์น",
    },
    {
      title: "ให้ผ่าน Checkpoint เมื่อผ่าน 4 จาก 5 มิติ (เช่น `Recall@5` ผ่านแต่มี `cross_tenant_leaks == 1`)",
      symptom:
        "ระบบที่มีช่องโหว่ข้อมูลรั่วข้ามบริษัทถูกปล่อยขึ้น Production เพราะคะแนนเฉลี่ยรวมดูสูง",
      fix: "ใช้ตรรกะ Conjunction (`ready_for_phase5 = (len(failed_gates) == 0)`): ต้องผ่านครบทุกมิติ 100% เท่านั้น",
    },
    {
      title: "ไม่โยน `ValueError` เมื่อส่งลิสต์ว่าง `[]` เข้ามาในฟังก์ชันตรวจรับ",
      symptom:
        "เกิดหารด้วยศูนย์ (`ZeroDivisionError`) หรือเผลอรายงานว่า `cross_tenant_leaks == 0` บนข้อมูลที่ไม่ได้รันจริง",
      fix: "ตรวจ `if not retrieval_records or not turn_records: raise ValueError(...)` ตั้งแต่บรรทัดแรกของฟังก์ชันเสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d124-q1",
        "ในการคำนวณ `Recall@5` สำหรับคำถามหนึ่งข้อที่มีเอกสารเฉลย `relevant_ids = [\"c1\", \"c2\"]` หากระบบค้นคืนได้ `retrieved_ids = [\"c1\", \"x1\", \"x2\", \"x3\", \"x4\", \"c2\"]` (โดย `\"c2\"` อยู่อันดับที่ 6) ค่า Recall@5 ของคำถามข้อนี้เป็นเท่าใด?",
        [
          ["1.00 — เพราะค้นเจอทั้ง `c1` และ `c2` ในลิสต์ผลลัพธ์ทั้งหมด", "ผิด — `c2` อยู่อันดับที่ 6 (index 5) ซึ่งอยู่นอก 5 อันดับแรก"],
          ["0.50 — เพราะใน 5 อันดับแรก (`retrieved_ids[:5]`) มีเอกสารเฉลยเพียง 1 ชิ้น (`c1`) จากเอกสารเฉลยทั้งหมด 2 ชิ้น ($1 / 2 = 0.50$)", "ถูกต้อง — นิยามของ Recall@K ต้องตัดพิจารณาเฉพาะ K อันดับแรก (`[:5]`) เท่านั้น"],
          ["0.20 — เพราะเจอ 1 ชิ้นจาก 5 ชิ้นที่ดึงมา", "นั่นคือสูตรของ Precision@5 ($1/5 = 0.20$) ไม่ใช่ Recall@5!"],
          ["0.00 — เพราะต้องเจอครบทุกชิ้นถึงจะได้คะแนน", "Recall คิดตามสัดส่วนที่ค้นพบจริงใน Top-K"],
        ],
        "B",
        "ระวังสับสนระหว่าง Recall@5 ($|\\text{rel} \\cap \\text{top5}| / |\\text{rel}| = 1/2 = 0.50$) กับ Precision@5 ($|\\text{rel} \\cap \\text{top5}| / 5 = 1/5 = 0.20$)",
        "เมื่อเอกสารเฉลยมี 2 ชิ้น แต่ติดอยู่ใน 5 อันดับแรกเพียง 1 ชิ้น (อีกชิ้นอยู่อันดับ 6) ค่า Recall@5 คือเท่าใด?",
        "0.50 (1 ชิ้นที่พบใน Top-5 หารด้วยจำนวนเอกสารเฉลยทั้งหมด 2 ชิ้น)",
      ),
      mc(
        "d124-q2",
        "ทำไมการตรวจ `zero_cross_tenant_leak_gate` ในวัน Checkpoint จึงต้องตรวจรวมทั้ง `retrieved_tenants`, `answer_tenants` และ `tool_tenants`?",
        [
          ["เพราะในระบบ RAG + Agent ข้อมูลสามารถรั่วไหลได้จากทั้งชั้นค้นคืนเอกสาร (RAG), ชั้นคำตอบของโมเดล และชั้นการเรียกเครื่องมือฐานข้อมูล (MCP Tools) จึงต้องยืนยันว่าทุกช่องทางมี `tenant_id == request_tenant` ตรงกันทั้งหมด", "ถูกต้อง — Security Audit ระดับสถาปัตยกรรมต้องตรวจครบทุกจุดที่ข้อมูลเดินทางผ่าน"],
          ["เพื่อให้ตัวเลข `cross_tenant_leaks` มีค่าเป็นบวกเสมอ", "เราต้องการให้ `cross_tenant_leaks == 0`"],
          ["เพราะ MCP Tool ไม่สามารถรับค่า `tenant_id` ได้", "MCP Tool ต้องรับค่า `tenant_id` จาก `AuthContext` ที่เชื่อถือได้"],
          ["เพื่อยกเลิกการใช้ Pre-Retrieval ACL", "ยังต้องใช้ Pre-Retrieval ACL เป็นด่านแรกเสมอ"],
        ],
        "A",
        "ระบบบูรณาการมีหลายแหล่งข้อมูล (Vector/BM25 Index + SQLite/MCP Tools) การตรวจรั่วไหลจึงต้องครอบคลุมทุกแหล่งข้อมูลและคำตอบสุดท้าย",
        "ทำไมต้องตรวจ Cross-Tenant Leakage ครบทั้ง Retrieval, Answer และ Tool Outputs?",
        "เพราะข้อมูลของผู้เช่าอื่นอาจรั่วมาจากดัชนีค้นหา จากการเรียก MCP Tool หรือจากคำตอบสุดท้ายก็ได้ จึงต้องตรวจครบทุกช่องทาง",
      ),
      mc(
        "d124-q3",
        "หากระบบของคุณได้ `Mean Recall@5 = 0.94`, `Citation Faithfulness = 1.0`, `All within max_steps = True` และ `P95 Latency = 720 ms` แต่พบ `cross_tenant_leaks = 1` ผลการตัดสิน `ready_for_phase5` ต้องเป็นอย่างไร?",
        [
          ["`True` — เพราะผ่านถึง 4 จาก 5 มิติ (คิดเป็น 80%)", "ผิด — ข้อมูลรั่วข้ามบริษัทแม้แต่ 1 เคสเป็นความเสี่ยงวิกฤตที่ยอมรับไม่ได้"],
          ["`False` — เพราะ Readiness Gate ต้องผ่านครบทุกมิติ 100% (`len(failed_gates) == 0`) เท่านั้น โดยเฉพาะเกณฑ์ความปลอดภัยและ Faithfulness ที่ต้องเป็น Zero-Tolerance", "ถูกต้อง — ทุกมิติคือเงื่อนไขบังคับ (Hard Requirement) ไม่ใช่คะแนนช่วย"],
          ["`True` — ถ้าลบเคสที่รั่วออกจากรายงาน", "ห้ามลบเคสที่ตกออกจากชุดทดสอบเพื่อแต่งตัวเลขเด็ดขาด"],
          ["ขึ้นอยู่กับเวลาที่รันสคริปต์", "ผลลัพธ์ต้อง deterministic เสมอ"],
        ],
        "B",
        "Quality Gate ในระดับ Production ทำงานแบบ `AND` (ทุกข้อต้องผ่านทั้งหมด) ไม่ใช่การหาค่าเฉลี่ยข้ามมิติ",
        "เมื่อไหร่ที่ `ready_for_phase5` จะมีค่าเป็น `True`?",
        "เมื่อผ่านเกณฑ์ครบทั้ง 5 มิติโดยไม่มี `failed_gates` เลยแม้แต่ข้อเดียว",
      ),
      mc(
        "d124-q4",
        "เมื่อผ่าน Phase 4 Checkpoint (`v0.4.0`) แล้ว ก้าวต่อไปใน Phase 5 (Days 125–152) จะนำระบบ Thai Hybrid RAG + Controlled Agent นี้ไปต่อยอดในด้านใด?",
        [
          ["ลบโค้ด Python ทั้งหมดทิ้งแล้วเปลี่ยนไปเขียน Assembly", "ไม่เป็นความจริง"],
          ["ยกระดับสู่ Production AI Engineering: สร้างระบบ Automated Evals ใน CI (RAGAS / Promptfoo), ติดตั้ง OpenTelemetry & Langfuse Tracing, ห่อเป็น Async FastAPI + Docker Container และเสริมเกราะ Security & PDPA Compliance", "ถูกต้อง — Phase 5 คือการนำระบบจากเครื่องพัฒนาไปสู่ระบบ Production ที่วัดผล ส่องกล้อง และป้องกันภัยได้ครบวงจร"],
          ["เลิกใช้การทดสอบด้วย pytest ทั้งหมด", "ใน Phase 5 เราจะยิ่งขยายชุดทดสอบให้เชื่อมกับ CI Gates"],
          ["เปลี่ยนกลับไปใช้ Fixed-Size Chunking แบบตัดกลางคำภาษาไทย", "เราใช้ Structure-Aware & Thai-Safe Chunking ที่สร้างไว้แล้วต่อไป"],
        ],
        "B",
        "ยินดีด้วยครับ! คุณพร้อมก้าวเข้าสู่ Phase 5: AI Evaluations, Observability, FastAPI Deployment & Security แล้ว!",
        "ภารกิจหลักของ Phase 5 ที่ต่อยอดจากระบบใน Phase 4 คืออะไร?",
        "การสร้างระบบ Automated Evals (RAGAS/Promptfoo), LLM Observability (OpenTelemetry/Langfuse), FastAPI/Docker Deployment และ Security/PDPA Guardrails",
      ),
    ],
  },

  takeaways: [
    "**ยินดีด้วย! คุณจบ Phase 4 (Days 93–124) และปิด Portfolio Milestone ชิ้นที่ 4 (`v0.4.0`) สำเร็จแล้ว!**",
    "**5 Quality Gates ของระบบ Thai Hybrid RAG + Controlled Agent**: `Recall@5 >= 0.85`, `Citation Faithfulness == 1.0`, `Zero Cross-Tenant Leakage`, `100% Termination <= max_steps` และ `P95 Latency <= budget`",
    "**Fail-Closed Readiness Auditor**: ปฏิเสธข้อมูลวัดที่ว่างเปล่า (`raise ValueError`) และอนุมัติผ่านเฉพาะเมื่อ `failed_gates == []`",
    "พบกันใน **Phase 5 (Day 125)** เพื่อนำระบบนี้ไปติดเครื่องมือ **AI Evaluations, OpenTelemetry/Langfuse Observability, Async FastAPI/Docker และ OWASP/PDPA Security**!",
  ],

  reviewCards: [
    rc(
      "d124-rc1",
      "ไล่ชื่อเกณฑ์ทั้ง 5 มิติของ Phase 4 Checkpoint (`v0.4.0`) พร้อมค่าเป้าหมาย",
      "1) `Mean Recall@5 >= 0.85`, 2) `Citation Faithfulness == 1.0`, 3) `Cross-Tenant Leaks == 0`, 4) `100% Termination within max_steps`, 5) `P95 Latency <= latency_budget_ms`",
    ),
    rc(
      "d124-rc2",
      "Recall@5 กับ Precision@5 ต่างกันที่ตัวหารอย่างไร?",
      "Recall@5 หารด้วยจำนวนเอกสารเฉลยทั้งหมดของคำถามนั้น ($|R \\cap T_5| / |R|$) ส่วน Precision@5 หารด้วย 5 ($|R \\cap T_5| / 5$)",
    ),
    rc(
      "d124-rc3",
      "ในการตรวจ Cross-Tenant Leakage ของแต่ละเทิร์น ต้องเอา `request_tenant` ไปเทียบกับรหัส tenant จากแหล่งใดบ้าง?",
      "เทียบกับทั้ง 3 แหล่ง: `retrieved_tenants` (ผลค้น RAG), `answer_tenants` (คำตอบและ citations) และ `tool_tenants` (ผลลัพธ์จาก MCP Tools)",
    ),
    rc(
      "d124-rc4",
      "4 ชิ้นงานในพอร์ตโฟลิโอที่คุณสร้างสำเร็จมาแล้วตั้งแต่ Phase 1 ถึง Phase 4 มีอะไรบ้าง?",
      "v0.1.0: Resilient Async Data CLI (Phase 1), v0.2.0: Thai Ticket Triage ML Pipeline (Phase 2), v0.3.0: Typed Thai Document Classifier & Extractor (Phase 3), และ v0.4.0: Thai Hybrid Knowledge RAG + Controlled MCP/LangGraph Agent (Phase 4)",
    ),
  ],

  sources: [
    {
      label: "Anthropic Research — Building Effective Agents (Production Evaluation & Readiness)",
      href: "https://www.anthropic.com/research/building-effective-agents",
    },
    {
      label: "LangGraph Documentation — Production Deployment & Checkpointing Checklist",
      href: "https://docs.langchain.com/oss/python/langgraph/overview",
    },
    {
      label: "OWASP Top 10 for LLM Applications — Comprehensive Security Verification",
      href: "https://genai.owasp.org/llm-top-10/",
    },
  ],

  glossary: ["rag", "rrf", "mcp", "langgraph", "groundedness", "acl", "hitl"],
});
