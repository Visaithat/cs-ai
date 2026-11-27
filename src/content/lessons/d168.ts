import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D168 — Phase 6 / Block B42 (Milestone 3)
 * Milestone 3: End-to-End Core Flow Demo
 */
export const d168: Lesson = defineLesson({
  day: 168,
  titleTh: "Milestone 3: ทดสอบและสาธิต Core Flow ครบวงจร (RAG + MCP + LangGraph + HITL)",
  tagline: "30 นาที · Milestone 3 Lab · เชื่อม D165–D167 เป็นท่อ E2E เดียว รัน 4 Core Journeys และตรวจ Quality Gate ก่อนเข้า B43",
  icon: "workflow",
  visual: {
    id: "capstone-core-router",
    title: "Milestone 3 Integration — ครบทั้ง 3 เส้นทางของ Core Router ตั้งแต่ต้นจนจบ",
    caption: "ทดสอบครบวงจรในจุดเดียว: (1) Policy RAG + Strict Citations, (2) MCP Read Lookup + PDPA Mask, (3) HITL Write Pause/Resume + Abstention",
    alt: "แผนภาพ Milestone 3 แสดงการทำงานครบวงจรของ LangGraph Router ที่เชื่อม RAG, MCP Lookup และ HITL Escalation",
  },
  requiresApiKey: false,
  apiKeyNote: "รัน E2E Core Flow Demo บนเครื่องคุณได้ 100% ด้วย SQLite + Mock Hybrid Retriever + Mock LLM (สลับต่อ API จริงได้ทันที)",
  tools: ["RAG", "MCP", "LangGraph", "SQLite", "pytest"],

  bigPicture: [
    {
      node: 2,
      heading: "รวมชิ้นส่วน Core Intelligence (B41 + D165 + D166 + D167) เป็นท่อเดียว",
      body: "การที่แต่ละโมดูลผ่าน unit test แยกกันไม่ได้การันตีว่าพอเอามาต่อกันแล้วข้อมูลจะไหลผ่านได้โดยไม่ติดขัด — รอยต่อระหว่าง Schema ของ RAG, ToolResponse ของ MCP และ State ของ Router คือจุดที่บั๊กชอบซ่อนอยู่",
      lessonNote: "Milestone 3 ประกอบ `GroundedGenerator` (D165), `MockSupportMCPServer` (D166) และ `CoreRouter` (D167) เข้าเป็น `CoreFlowPipeline` เดียว",
    },
    {
      node: 3,
      heading: "พิสูจน์ 4 Core User Journeys + Gate ความปลอดภัยแบบ End-to-End",
      body: "ก่อนที่จะไปลงทุนสร้างชุดทดสอบ 40 ข้อและติด Langfuse ใน Block B43 เราต้องมั่นใจก่อนว่าเส้นทางหลักทั้ง 4 แบบทำงานครบถ้วนในระดับระบบ",
      lessonNote: "ชุดตรวจสอบ Milestone 3 วัดทั้ง `Schema Pass Rate = 100%`, `Ungrounded Citations = 0`, และ `Unapproved Writes = 0`",
    },
    {
      node: 4,
      heading: "ยืนยันพฤติกรรม Pause & Resume ของ HITL บนฐานข้อมูลจริง",
      body: "จุดขายสำคัญของระบบองค์กรคือการไม่ปล่อยให้ AI แก้ไขข้อมูลโดยพลการ — Demo วันนี้ต้องแสดงให้เห็นกับตาว่าก่อนกด Approve แถวใน {{sqlite}} ยังไม่ถูกเพิ่ม และเพิ่มแค่ 1 แถวหลังอนุมัติ",
      lessonNote: "ผู้เรียนจะได้รัน Demo Script ที่ทดสอบทั้งการอนุมัติ (Commit + Idempotency) และการปฏิเสธ (Cancel) บน `thread_id` แยกกัน",
    },
    {
      node: 5,
      heading: "เก็บ Step-Level Telemetry เตรียมส่งต่อ Block B43 (Evals & Langfuse)",
      body: "เมื่อ Core Flow วิ่งครบทุกเส้นทางแล้ว คำถามถัดไปคือระบบแม่นยำกี่เปอร์เซ็นต์และใช้เวลา P95 เท่าไร",
      lessonNote: "Milestone 3 เก็บ `trace_events` และ `latency_ms` พื้นฐานไว้เป็นจุดเชื่อมสู่ 40-Case {{golden-dataset}}, {{ragas}} และ {{langfuse}} ใน B43",
    },
  ],

  objectives: [
    "**ประกอบ Core Pipeline แบบ End-to-End** โดยเชื่อม Hybrid Retrieval → Grounded Citation Generator (D165) → MCP Server (D166) → Bounded {{langgraph}} Router (D167)",
    "**รันและผ่าน 4 Core Demo Journeys**: (1) FAQ RAG พร้อม verified citations, (2) Out-of-scope Abstention → Escalation, (3) Read-only Order Lookup พร้อม {{pdpa}} masking, และ (4) HITL Write Pause & Resume (ทั้ง Approve และ Reject)",
    "**ตรวจรับ Milestone 3 Sign-Off Gate** ที่ยืนยันว่าไม่มี ungrounded citation, ไม่มี unapproved write, และทุก response ผ่าน {{pydantic}} {{schema}} ก่อนก้าวสู่ Block B43",
  ],

  prerequisites: [
    "ผ่าน Milestone 2 Retrieval Benchmark (D164) และสร้างโมดูล D165, D166, D167 แล้ว",
    "เข้าใจ {{structured-output}}, {{idempotency}}, และ {{hitl}} Checkpointer",
    "ใช้งาน `uv`, `pytest` และ `ruff` ได้คล่อง",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro:
      "เตรียมรัน Milestone 3 End-to-End Demo ในโปรเจกต์ `thai-enterprise-assistant/` โดยใช้ไฟล์ที่สร้างไว้จาก D165–D167 และเพิ่มตัวประสาน `src/milestone3_demo.py`",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
uv run pytest -q tests/test_grounded_generator.py tests/test_mcp_support_server.py tests/test_core_router.py
uv run ruff check .`,
    steps: [
      ["unit", "ตรวจว่า unit tests ของ D165, D166 และ D167 ผ่านทั้งหมดก่อนต่อท่อรวม"],
      ["lint", "ตรวจ `uv run ruff check .` ไม่พบปัญหาสไตล์หรือ import ตกหล่น"],
      ["ready", "พร้อมสร้างและรัน `src/milestone3_demo.py` สำหรับ Milestone 3 Sign-Off"],
    ],
    note: "Milestone 3 ออกแบบให้พึ่งพาเฉพาะโค้ดในเครื่อง (`sqlite3`, `pydantic`, mock retriever/LLM) เพื่อใช้เป็น Regression Smoke Test ใน CI ได้ภายใน < 1 วินาที",
  },

  concepts: [
    {
      id: "e2e-integration-contract",
      title: "1 · เชื่อมรอยต่อ B41–B42 ให้เป็น Core Pipeline เดียวด้วย Dependency Injection",
      paragraphs: [
        "ความท้าทายของการประกอบระบบ AI ไม่ได้อยู่ที่โค้ดภายในแต่ละไฟล์ แต่อยู่ที่ **รอยต่อระหว่างชั้น (Integration Seams)**: เช่น `GroundedResponse` จาก D165 คืน object `CitationItem` แต่ `RouterResult` จาก D167 เก็บ `citations: list[str]` หรือ `MockSupportMCPServer` จาก D166 คืน `ToolResponse` ที่มี `data[\"phone_masked\"]` — ถ้าไม่มี Adapter ที่สะอาด ข้อมูลจะหล่นหายกลางทาง",
        "วิธีออกแบบที่สะอาดคือสร้างคลาส **`CoreFlowPipeline`** ที่รับ dependency หลัก 3 ส่วนผ่าน constructor (Retriever, LLM Generator, MCP Support Server) และจัดการแปลง {{data-contract}} ระหว่างแต่ละชั้นให้อยู่ในที่เดียว",
        "การใช้ Dependency Injection ยังทำให้คุณสลับได้ทันที: ตอนรัน Milestone 3 Smoke Test ใน CI ใช้ Mock Retriever + Mock LLM (`0 บาท`, `< 50 ms`) และตอนสาธิตจริงใน Swagger/UI (B44) ก็เสียบ Qdrant/PyThaiNLP Retriever + LLM API จริงเข้ากับคลาสเดิมโดยไม่ต้องแก้โค้ด Router เลย",
      ],
      analogy:
        "เหมือนการต่อตู้รถไฟ 3 โบกี้ (Retriever, MCP Server, Router) เข้าด้วยกัน — ต่อให้แต่ละโบกี้วิ่งบนรางทดสอบของตัวเองได้ แต่ต้องมีข้อต่อ (Adapter & Data Contract) ที่ล็อกเข้ากันได้พอดีก่อนปล่อยขบวนออกวิ่งจริง",
      code: {
        language: "python",
        filename: "pipeline_wiring.py",
        code: `class CoreWiringExample:
    def __init__(self, retriever_fn, llm_fn, mcp_server) -> None:
        self.retriever_fn = retriever_fn
        self.llm_fn = llm_fn
        self.mcp_server = mcp_server

    def run_rag_adapter(self, query: str) -> dict:
        chunks = self.retriever_fn(query)
        # ส่งผลจาก D165 กลับเข้าสัญญาของ D167 CoreRouter
        return {"chunks_count": len(chunks), "mcp_ready": self.mcp_server is not None}`,
        caption: "Dependency Injection ช่วยให้เปลี่ยนจาก Mock เป็น Hybrid Retriever + LLM จริงได้โดยไม่ต้องแก้โครง Router",
      },
      bullets: [
        "**Single Entrypoint**: `pipeline.handle_message(thread_id, query)` และ `pipeline.confirm_action(thread_id, approved)`",
        "**Zero Transport Coupling**: ทดสอบท่อตรรกะทั้งหมดได้ในหน่วยความจำโดยไม่ต้องเปิด HTTP Server",
        "**Adapter ที่โปร่งใส**: แปลง `ToolResponse` และ `GroundedResponse` เป็น `RouterResult` พร้อมเก็บหลักฐานและร่องรอยครบ",
      ],
      whyTitle: "Why this matters — แก้ปัญหา 'เทสต์ย่อยผ่านหมด แต่เอามาต่อกันแล้วพัง'",
      whyParagraphs: [
        "Integration bug มักเกิดขึ้นเมื่อทีมหนึ่งเปลี่ยนชื่อ key จาก `chunk_id` เป็น `id` หรือเปลี่ยนสถานะจาก `abstained` เป็น `no_answer`",
        "การมี `CoreFlowPipeline` + E2E Smoke Suite ช่วยจับความคลาดเคลื่อนของสัญญาข้อมูลข้ามโมดูลได้ทันที",
      ],
    },
    {
      id: "milestone3-four-journey-verification",
      title: "2 · 4 Core Journeys ที่ต้องผ่านใน Milestone 3 Demo",
      paragraphs: [
        "เพื่อเซ็นผ่าน **Milestone 3: End-to-End Core Flow Demo** ระบบต้องรันครบ 4 สถานการณ์จำลองจริงโดยไม่แก้โค้ดเฉพาะกิจ (no hardcoded answers for specific test strings):",
        "**Journey 1 (Bilingual FAQ RAG)**: ถามนโยบายภาษาไทยปนอังกฤษ → Router ส่งเข้า `faq_rag` → ได้คำตอบพร้อม `[pol-refund#2]` ที่ผ่าน Verifier 100% · **Journey 2 (Unanswerable Abstention)**: ถามเรื่องนอกเอกสาร → `faq_rag` คืน `abstained` → Router ส่งต่อ `escalated` โดยไม่มี {{hallucination}}",
        "**Journey 3 (MCP Read-Only Lookup)**: ถามสถานะ `ORD-2026-104` → Router เข้า `mcp_lookup` → SQLite คืนสถานะ `shipped` และเบอร์โทรแบบ masked (`081-xxx-5678`) · **Journey 4 (HITL Guarded Write)**: สั่งเปิดทิกเก็ตเคลม → หยุดที่ `awaiting_approval` (จำนวนแถวใน `tickets` ยังเท่าเดิม) → กด `confirm_action(approved=True)` จึงเพิ่มทิกเก็ต 1 แถว (และทำซ้ำด้วย `idempotency_key` เดิมไม่เบิ้ล, ส่วน `approved=False` ต้องยกเลิกไม่ลง DB)",
      ],
      analogy:
        "เหมือนการตรวจรับบ้านก่อนเข้าอยู่ (Pre-handover Inspection): ต้องลองเปิดก๊อกน้ำทุกจุด ลองตัดเบรกเกอร์ และลองล็อกประตูนิรภัย ไม่ใช่ดูแค่เอกสารสเปกของช่างแต่ละชุด",
      code: {
        language: "python",
        filename: "milestone3_gate.py",
        code: `from pydantic import BaseModel


class Milestone3Report(BaseModel):
    total_journeys: int
    passed_journeys: int
    schema_pass_rate: float
    ungrounded_citations: int
    unapproved_writes: int
    passed_gate: bool


def evaluate_milestone3_gate(
    journey_results: list[bool],
    *,
    schema_failures: int,
    ungrounded_citations: int,
    unapproved_writes: int,
) -> Milestone3Report:
    total = len(journey_results)
    passed = sum(1 for ok in journey_results if ok)
    schema_rate = 1.0 - (schema_failures / total) if total else 0.0
    gate_ok = (
        total >= 4
        and passed == total
        and schema_rate >= 0.99
        and ungrounded_citations == 0
        and unapproved_writes == 0
    )
    return Milestone3Report(
        total_journeys=total,
        passed_journeys=passed,
        schema_pass_rate=schema_rate,
        ungrounded_citations=ungrounded_citations,
        unapproved_writes=unapproved_writes,
        passed_gate=gate_ok,
    )`,
        caption: "เกณฑ์ตรวจรับ Milestone 3: ต้องผ่านครบทั้ง 4 Journeys, Schema >= 99%, 0 citation ปลอม และ 0 write ที่ไม่ได้รับอนุมัติ",
      },
      whyTitle: "Why this matters — เตรียมDemo ที่นำไปอัดวิดีโอ 3 นาทีใน Day 179 ได้เลย",
      whyParagraphs: [
        "4 Journeys ในวันนี้คือโครงเรื่องเดียวกับ Live Demo ที่คุณจะได้ห่อด้วย FastAPI + UI ใน B44 และอัดวิดีโอสรุปผลงาน 3 นาทีใน Day 179",
        "เมื่อ Core Flow นิ่งและผ่านอัตโนมัติใน `pytest` ตั้งแต่วันที่ 168 สัปดาห์ที่เหลือ (B43–B45) คุณจะโฟกัสกับการวัด Eval, Tracing และ Security ได้เต็มที่",
      ],
    },
    {
      id: "step-level-telemetry-bridge",
      title: "3 · Step-Level Telemetry: สะพานเชื่อมสู่ Golden Evals และ Langfuse (B43)",
      paragraphs: [
        "การรู้แค่ว่า Demo ผ่าน 4/4 ยังไม่พอสำหรับ Production เพราะเราต้องตอบคำถามใน Block B43 ได้ด้วยว่า *\"เส้นทางไหนใช้เวลานานสุด?\"*, *\"{{rag}} ปฏิเสธบ่อยเกินไปไหม?\"* และ *\"ถ้าเปิดโมเดลจริง ค่าใช้จ่ายต่อ 1,000 คำขอจะเป็นเท่าไร?\"*",
        "ตั้งแต่ Milestone 3 เป็นต้นไป ทุกการเรียก `handle_message` และ `confirm_action` ควรบันทึก **Telemetry Envelope** ขนาดเล็ก (`thread_id`, `route`, `status`, `step_count`, `latency_ms`, `trace_events`) เป็นโครงสร้างพร้อมส่งเข้า {{structlog}} และ {{langfuse}}",
        "เมื่อเข้าสู่ Day 169–172 ใน Block B43 เราจะนำชุด {{golden-dataset}} 40 ข้อ (Thai, Code-Switch, Unanswerable, Attack) มารันผ่าน `CoreFlowPipeline` ตัวนี้ตรง ๆ เพื่อคำนวณ {{ragas}} และ {{promptfoo}} Eval Report",
      ],
      analogy:
        "เหมือนการติดกล่องดำ (Telemetry) บนเครื่องบินตั้งแต่เที่ยวบินทดสอบครั้งแรก — พอเริ่มบินจริงใน B43 เราจะได้มีข้อมูลทุกวินาทีมาวิเคราะห์ ไม่ต้องมารื้อเดินสายไฟใหม่",
      bullets: [
        "**`trace_events`**: ลิสต์ลำดับเหตุการณ์ เช่น `['route:faq_rag', 'rag:answered']` เพื่อไล่คอขวด",
        "**`latency_ms`**: จับเวลาจริงด้วย `time.perf_counter()` เพื่อเตรียมรายงาน P50/P95 Latency",
        "**พร้อมเข้า CI**: รัน E2E Smoke Suite นี้ทุกครั้งที่มีการแก้โค้ดใน B43–B45 เพื่อกัน regression",
      ],
      whyTitle: "Why this matters — Milestone 3 คือฐานของ Evaluation และ Deployment",
      whyParagraphs: [
        "ถ้าไม่มีท่อ Core Flow ที่เชื่อมครบทุกเส้นทางในวันนี้ Block B43 (40-Case Evals & Langfuse) จะไม่มีระบบจริงให้ประเมิน",
        "เมื่อ Milestone 3 ผ่านเกณฑ์ คุณจึงมี Core AI Product ที่ทำงานได้จริงทั้งอ่านเอกสาร ค้นฐานข้อมูล และควบคุมการเขียนอย่างปลอดภัย",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Milestone 3 คือ E2E Integration Smoke Test ก่อนติด Monitoring",
      body: [
        "ในทีม Web Engineering ก่อนปล่อยฟีเจอร์ใหญ่เข้า Staging คุณจะรัน End-to-End Integration Test ที่จำลอง user journey หลักทั้งหมดผ่าน controller จริงกับ test DB:",
      ],
      table: [
        ["`CoreFlowPipeline`", "Application Service Layer ที่รวม Repository + External API"],
        ["4 Core Journeys", "E2E Critical Path Smoke Tests (Happy Path + Fallback + Auth Gate)"],
        ["`Milestone3Report` Gate", "CI Merge Gate ก่อนเริ่ม Load / Golden Eval Stage"],
        ["`trace_events` + `latency_ms`", "Structured Request Telemetry ก่อนต่อ OpenTelemetry / Langfuse"],
      ],
    },
    student: {
      title: "First-Year Note — ความแตกต่างระหว่าง Unit Test (D165–D167) กับ E2E Integration Test (D168)",
      body: [
        "ใน D165–D167 เราเขียน **Unit Test** เพื่อตรวจแต่ละชิ้นแยกกัน (เช่น D167 ใช้ฟังก์ชัน mock แทน D165 และ D166) ซึ่งดีมากสำหรับการหาบั๊กเฉพาะจุดอย่างรวดเร็ว",
        "แต่ใน **Milestone 3 (Integration Test)** เราเอาของจริงทั้ง 3 ชิ้น (`grounded_generator` + `mcp_support_server` + `core_router`) มาต่อกันจริงกับ `sqlite3` เพื่อพิสูจน์ว่าทุกไฟล์สื่อสารกันด้วยชื่อ key และรูปแบบข้อมูลที่ตรงกัน 100%",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองต่อท่อ `CoreFlowPipeline` แบบย่อที่ผูกกับ D165, D166 และ D167 แล้วรัน 4 Core Journeys พร้อมออกรายงาน `Milestone3Report` กด **ขั้นต่อไป** เพื่อดูผลลัพธ์ทีละขั้น",
    steps: [
      {
        title: "1 · สร้าง Adapter เชื่อม Grounded Generator และ SQLite MCP Store เข้ากับ Router",
        explain:
          "ใช้ `MockSupportMCPServer` ของ D166 เป็นตัวจริงสำหรับ `lookup_fn` และ `write_fn` โดยผูก `idempotency_key` จาก `thread_id` และ `approval_token` จากฝั่ง Host",
        code: {
          language: "python",
          filename: "worked_milestone3.py",
          code: `import time
from dataclasses import dataclass
from typing import Callable


@dataclass
class DemoJourney:
    name: str
    thread_id: str
    query: str
    expected_status: str


def run_demo_journey(
    journey: DemoJourney,
    handle_fn: Callable[[str, str], dict],
) -> tuple[bool, dict]:
    t0 = time.perf_counter()
    res = handle_fn(journey.thread_id, journey.query)
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    passed = res["status"] == journey.expected_status and res["step_count"] <= 3
    return passed, {**res, "latency_ms": latency_ms, "passed": passed}`,
        },
      },
      {
        title: "2 · รันครบ 4 Core Journeys ในรอบเดียว",
        explain:
          "จำลองการเรียกใช้งานครบทั้ง 4 เส้นทาง: FAQ RAG, Unanswerable Escalation, Order Lookup (PDPA masked), และ HITL Write Pause → Confirm",
        code: {
          language: "python",
          filename: "worked_milestone3.py",
          code: `def mock_pipeline_handle(thread_id: str, query: str) -> dict:
    if "คืนสินค้า" in query:
        return {"status": "completed", "route": "faq_rag", "step_count": 2, "citations": ["pol-refund#2"]}
    if "โปรลับ" in query:
        return {"status": "escalated", "route": "faq_rag", "step_count": 2, "citations": []}
    if "ORD-2026-104" in query and "เปิดทิกเก็ต" not in query:
        return {"status": "completed", "route": "mcp_lookup", "step_count": 2, "phone_masked": "081-xxx-5678"}
    return {"status": "awaiting_approval", "route": "hitl_write", "step_count": 1, "writes": 0}


journeys = [
    DemoJourney("J1_FAQ_RAG", "th-1", "นโยบายคืนสินค้ากี่วัน", "completed"),
    DemoJourney("J2_ABSTAIN_ESCALATE", "th-2", "มีโปรลับเดือนหน้าไหม", "escalated"),
    DemoJourney("J3_MCP_LOOKUP", "th-3", "เช็กสถานะ ORD-2026-104", "completed"),
    DemoJourney("J4_HITL_PAUSE", "th-4", "เปิดทิกเก็ตเคลม ORD-2026-104", "awaiting_approval"),
]

results = []
for j in journeys:
    ok, row = run_demo_journey(j, mock_pipeline_handle)
    results.append(ok)
    print(f"{j.name:20s} | route={row['route']:10s} | status={row['status']:17s} | pass={ok}")`,
        },
        output: `J1_FAQ_RAG           | route=faq_rag    | status=completed         | pass=True
J2_ABSTAIN_ESCALATE  | route=faq_rag    | status=escalated         | pass=True
J3_MCP_LOOKUP        | route=mcp_lookup | status=completed         | pass=True
J4_HITL_PAUSE        | route=hitl_write | status=awaiting_approval | pass=True`,
      },
      {
        title: "3 · สรุปผล Milestone 3 Gate (Ship to B43 or Fix First)",
        explain:
          "รวมผล 4 Journeys คู่กับตัวเลขความปลอดภัย (`ungrounded_citations == 0`, `unapproved_writes == 0`) เพื่อออกคำตัดสิน `SHIP_TO_B43`",
        code: {
          language: "python",
          filename: "worked_milestone3.py",
          code: `ungrounded_citations = 0
unapproved_writes = 0
gate_passed = (
    all(results)
    and len(results) == 4
    and ungrounded_citations == 0
    and unapproved_writes == 0
)
print(f"Milestone 3 Gate: {'SHIP_TO_B43' if gate_passed else 'FIX_FIRST'} ({sum(results)}/{len(results)} journeys)")`,
        },
        output: `Milestone 3 Gate: SHIP_TO_B43 (4/4 journeys)`,
      },
    ],
    gotcha:
      "จุดสังเกต: ใน Journey 4 (HITL Write) ห้ามเช็กแค่ว่า `status == \"awaiting_approval\"` แล้วจบ — ต้องตรวจที่ตัวฐานข้อมูล SQLite จริงด้วยว่าจำนวนแถวในตาราง `tickets` ยังไม่เพิ่มขึ้นตอน pause และเพิ่มขึ้น **เพียง 1 แถว** หลังเรียก `confirm_action(approved=True)`",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/milestone3_demo.py` ที่ประสาน D165 (`grounded_generator`), D166 (`mcp_support_server`), และ D167 (`core_router`) เข้าเป็น `CoreFlowPipeline` เดียว พร้อมฟังก์ชัน `run_milestone3_verification` สำหรับเซ็นผ่าน Milestone 3",
    requirements: [
      "สร้าง `CoreFlowPipeline` ที่รับ `retriever_fn: Callable[[str], list[EvidenceChunk]]`, `llm_fn: Callable[[str], dict]`, และ `mcp_server: MockSupportMCPServer` โดยเชื่อมเข้ากับ `CoreRouter` ภายใน",
      "เมธอด `handle_message(thread_id: str, query: str) -> dict` และ `confirm_action(thread_id: str, approved: bool) -> dict` ที่คืนผลลัพธ์เป็น dict พร้อมฟิลด์จาก `RouterResult` (`thread_id`, `route`, `status`, `answer_th`, `citations`, `step_count`, `trace_events`) และ `latency_ms: float`",
      "ฝั่ง RAG ของ `CoreFlowPipeline`: ดึง chunks ผ่าน `retriever_fn(query)` แล้วเรียก `generate_grounded_answer(query, chunks, llm_fn)` จาก D165 — เพื่อให้ citation ปลอมถูกจับและคำถามไร้หลักฐานถูกส่งต่อ `escalate` อัตโนมัติ",
      "ฝั่ง MCP Lookup & Write ของ `CoreFlowPipeline`: `lookup_fn` เรียก `mcp_server.lookup_order` หรือ `mcp_server.get_ticket` ตาม prefix (`ORD-` vs `TKT-`), ส่วน `write_fn` เมื่อ `approved=True` ต้องส่ง `idempotency_key=f\"hitl-{thread_id}\"` และ `approval_token=mcp_server.valid_approval_token` เข้า `mcp_server.create_support_ticket`",
      "สร้าง `run_milestone3_verification(pipeline: CoreFlowPipeline) -> dict` ที่รันครบทั้ง 4 Core Journeys (FAQ RAG, Abstain Escalation, MCP Lookup พร้อมเช็กไม่ให้มีเบอร์โทรดิบหลุด, และ HITL Pause → Approve Commit → Reject Check) แล้วคืน `{\"passed_gate\": bool, \"journeys\": dict[str, bool], \"ungrounded_citations\": int, \"unapproved_writes\": int, \"ticket_count_after\": int}`",
    ],
    starter: {
      language: "python",
      filename: "src/milestone3_demo.py",
      code: `from __future__ import annotations

import time
from typing import Any, Callable
from src.core_router import CoreRouter
from src.grounded_generator import EvidenceChunk, generate_grounded_answer
from src.mcp_support_server import MockSupportMCPServer


class CoreFlowPipeline:
    def __init__(
        self,
        retriever_fn: Callable[[str], list[EvidenceChunk]],
        llm_fn: Callable[[str], dict[str, Any]],
        mcp_server: MockSupportMCPServer,
        *,
        min_score: float = 0.35,
    ) -> None:
        self.retriever_fn = retriever_fn
        self.llm_fn = llm_fn
        self.mcp_server = mcp_server
        self.min_score = min_score
        # TODO: สร้าง self.router = CoreRouter(...) ที่เชื่อม _rag_node, _lookup_node, _write_node

    def handle_message(self, thread_id: str, query: str) -> dict[str, Any]:
        # TODO: จับเวลา -> เรียก self.router.invoke(thread_id, query) -> คืน model_dump() + latency_ms
        raise NotImplementedError

    def confirm_action(self, thread_id: str, approved: bool) -> dict[str, Any]:
        # TODO: จับเวลา -> เรียก self.router.resume(thread_id, approved) -> คืน model_dump() + latency_ms
        raise NotImplementedError


def run_milestone3_verification(pipeline: CoreFlowPipeline) -> dict[str, Any]:
    # TODO: รัน 4 journeys + ตรวจ SQLite rows & PDPA mask -> คืน milestone 3 report dict
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_milestone3_demo.py",
      code: `from src.grounded_generator import EvidenceChunk
from src.mcp_support_server import MockSupportMCPServer
from src.milestone3_demo import CoreFlowPipeline, run_milestone3_verification


def _build_demo_pipeline(*, fake_citation_bug: bool = False) -> CoreFlowPipeline:
    srv = MockSupportMCPServer()
    srv.seed_sample_data()

    def retriever(query: str) -> list[EvidenceChunk]:
        if "คืนสินค้า" in query or "refund" in query.lower():
            return [
                EvidenceChunk(
                    chunk_id="pol-refund#2",
                    doc_title="นโยบายคืนสินค้า",
                    text="สินค้าอิเล็กทรอนิกส์คืนได้ภายใน 14 วันหากยังไม่แกะซีล",
                    score=0.90,
                )
            ]
        return []

    def llm_fn(_prompt: str) -> dict:
        if fake_citation_bug:
            return {
                "status": "answered",
                "answer_th": "คืนได้ 90 วัน [pol-fake#99]",
                "citations": [{"chunk_id": "pol-fake#99", "quote": "คืนได้ 90 วัน"}],
            }
        return {
            "status": "answered",
            "answer_th": "คืนสินค้าอิเล็กทรอนิกส์ได้ภายใน 14 วันหากยังไม่แกะซีล [pol-refund#2]",
            "citations": [{"chunk_id": "pol-refund#2", "quote": "คืนได้ภายใน 14 วันหากยังไม่แกะซีล"}],
        }

    return CoreFlowPipeline(retriever, llm_fn, srv)


def test_milestone3_full_e2e_verification_passes():
    pipeline = _build_demo_pipeline()
    report = run_milestone3_verification(pipeline)

    assert report["passed_gate"] is True
    assert report["ungrounded_citations"] == 0
    assert report["unapproved_writes"] == 0
    assert report["ticket_count_after"] == 2  # 1 seeded + 1 approved commit
    assert all(report["journeys"].values())


def test_e2e_faq_and_abstain_escalation():
    pipeline = _build_demo_pipeline()
    faq = pipeline.handle_message("demo-faq", "นโยบายคืนสินค้าอิเล็กทรอนิกส์กี่วัน")
    abstain = pipeline.handle_message("demo-abs", "มีโปรลด 90% เดือนหน้าไหม")

    assert faq["route"] == "faq_rag"
    assert faq["status"] == "completed"
    assert faq["citations"] == ["pol-refund#2"]
    assert faq["latency_ms"] >= 0.0

    assert abstain["status"] == "escalated"
    assert abstain["citations"] == []


def test_e2e_mcp_lookup_masks_phone_and_supports_ticket_id():
    pipeline = _build_demo_pipeline()
    ord_res = pipeline.handle_message("demo-ord", "ช่วยเช็กสถานะ ORD-2026-104")
    tkt_res = pipeline.handle_message("demo-tkt", "เช็ก TKT-2026-001 หน่อย")

    assert ord_res["route"] == "mcp_lookup"
    assert ord_res["status"] == "completed"
    assert "0812345678" not in ord_res["answer_th"]
    assert "shipped" in ord_res["answer_th"]

    assert tkt_res["route"] == "mcp_lookup"
    assert tkt_res["status"] == "completed"


def test_e2e_hitl_pause_commit_and_reject():
    pipeline = _build_demo_pipeline()
    paused = pipeline.handle_message("demo-hitl-ok", "เปิดทิกเก็ตเคลม ORD-2026-104 กล่องบุบ")
    assert paused["status"] == "awaiting_approval"
    assert pipeline.mcp_server.conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0] == 1

    committed = pipeline.confirm_action("demo-hitl-ok", approved=True)
    assert committed["status"] == "completed"
    assert pipeline.mcp_server.conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0] == 2

    pipeline.handle_message("demo-hitl-no", "เปิดทิกเก็ตเคลม ORD-2026-104 อีกใบ")
    cancelled = pipeline.confirm_action("demo-hitl-no", approved=False)
    assert cancelled["status"] == "cancelled"
    assert pipeline.mcp_server.conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0] == 2


def test_hallucinated_citation_from_llm_is_blocked_in_e2e_pipeline():
    buggy = _build_demo_pipeline(fake_citation_bug=True)
    res = buggy.handle_message("demo-bug", "นโยบายคืนสินค้ากี่วัน")
    assert res["status"] == "escalated"
    assert res["citations"] == []
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทุกไฟล์ตั้งแต่ D165–D168 (`test_grounded_generator.py`, `test_mcp_support_server.py`, `test_core_router.py`, `test_milestone3_demo.py`)",
      "ตรวจใน `test_e2e_hitl_pause_commit_and_reject` ว่า SQLite มีแถวเพิ่มเฉพาะหลัง `confirm_action(..., approved=True)` เท่านั้น",
      "ตรวจว่าเมื่อ LLM หลอน citation ปลอม (`fake_citation_bug=True`) ท่อ E2E ป้องกันและส่งต่อ `escalated` โดยไม่ปล่อย citation ปลอมหลุดออกมา",
      "รัน `uv run ruff check .` แล้วไม่พบ lint error",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `tests/test_milestone3_demo.py` (และชุดย่อย D165–D167 ทั้งหมด) ด้วย `uv run pytest -q` และ `uv run ruff check .`",
    hints: [
      {
        body: "ใน `CoreFlowPipeline._rag_node(query)` เรียก `chunks = self.retriever_fn(query)` แล้วเรียก `grounded = generate_grounded_answer(query, chunks, self.llm_fn, min_score=self.min_score)` จากนั้นคืน dict รูปแบบ `{\"status\": grounded.status, \"answer_th\": grounded.answer_th, \"citations\": [c.chunk_id for c in grounded.citations]}` ให้ `CoreRouter`",
      },
      {
        body: "ใน `_lookup_node(entity_id)` แยกเรียก `self.mcp_server.lookup_order(entity_id)` ถ้า `entity_id.startswith(\"ORD-\")` และ `self.mcp_server.get_ticket(entity_id)` ถ้าขึ้นต้นด้วย `TKT-` โดยคืน `res.model_dump()`; ใน `_write_node(action, approved)` เมื่อ `approved` เป็น `True` ให้ส่ง `approval_token=self.mcp_server.valid_approval_token` และ `idempotency_key=f\"hitl-{action['order_id']}-{hash(action['issue']) % 10000}\"` (หรือผูก `thread_id`)",
      },
      {
        body: "โครงของ `CoreFlowPipeline` Adapter — เติม `handle_message`, `confirm_action` และ `run_milestone3_verification` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day168.py",
          code: `def _build_router(self) -> CoreRouter:
    def rag_adapter(q: str) -> dict[str, Any]:
        chunks = self.retriever_fn(q)
        g = generate_grounded_answer(q, chunks, self.llm_fn, min_score=self.min_score)
        return {
            "status": g.status,
            "answer_th": g.answer_th,
            "citations": [c.chunk_id for c in g.citations],
        }

    def lookup_adapter(entity_id: str) -> dict[str, Any]:
        res = (
            self.mcp_server.lookup_order(entity_id)
            if entity_id.upper().startswith("ORD-")
            else self.mcp_server.get_ticket(entity_id)
        )
        return res.model_dump()

    def write_adapter(action: dict[str, Any], approved: bool) -> dict[str, Any]:
        token = self.mcp_server.valid_approval_token if approved else None
        order_id = action.get("order_id") or "ORD-2026-104"
        res = self.mcp_server.create_support_ticket(
            order_id,
            action.get("issue", "เปิดทิกเก็ตจาก HITL"),
            f"hitl-{order_id}",
            approval_token=token,
        )
        return {**res.model_dump(), "ticket_id": (res.data or {}).get("ticket_id")}

    return CoreRouter(rag_adapter, lookup_adapter, write_adapter, max_steps=3)`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_grounded_generator.py tests/test_mcp_support_server.py tests/test_core_router.py tests/test_milestone3_demo.py
uv run ruff check .`,
      caption: "รันชุดทดสอบรวมของ Block B42 ทั้งหมดเพื่อตรวจรับ Milestone 3",
    },
  },

  mistakes: [
    {
      title: "ทดสอบเฉพาะ Mock Router ใน D167 โดยไม่ต่อกับ SQLite Store และ Citation Verifier จริง",
      symptom: "Mock ใน unit test ผ่านหมด แต่พอเอาไฟล์ D165 + D166 + D167 มาต่อกันจริงเกิด key mismatch (`chunk_id` vs `citations` หรือ `ticket_id` หาย)",
      fix: "ต้องมี `CoreFlowPipeline` และ E2E Integration Test ใน Milestone 3 ที่ใช้โมดูลจริงทุกตัวร่วมกัน",
    },
    {
      title: "ลืมตรวจสอบฐานข้อมูลจริงหลัง HITL Reject/Interrupt",
      symptom: "API ตอบว่า `awaiting_approval` หรือ `cancelled` ก็จริง แต่โค้ดข้างหลังเผลอ `INSERT` แถวลง SQLite ไปแล้ว",
      fix: "Assert จำนวนแถว (`SELECT COUNT(*) FROM tickets`) ใน E2E test ทั้งช่วงหลัง `awaiting_approval`, หลัง `approved=True`, และหลัง `approved=False`",
    },
    {
      title: "ใส่ข้อมูลทดสอบใน SQLite แล้วเบอร์โทรดิบหลุดเข้าไปในคำตอบของ Router",
      symptom: "MCP Server ส่งทั้ง `phone` และ `phone_masked` ออกมา หรือ Router ฟอร์แมตข้อความจาก field ที่ไม่ควรเปิดเผย",
      fix: "ตรวจใน E2E test ว่าเลขโทรศัพท์ดิบ (`0812345678`) ไม่ปรากฏใน response ของ Router เลย",
    },
    {
      title: "รีบข้ามไปเขียน FastAPI UI โดยที่ Core Flow ยังไม่เสถียร",
      symptom: "เวลาเจอบั๊กไม่รู้ว่าพังที่ SSE streaming, Router, หรือ Citation Verifier ทำให้แก้ยากเป็นทวีคูณ",
      fix: "ใช้ Milestone 3 เป็นประตูล็อกให้ Core Flow เสถียร 100% ก่อนขยับไปทำ Golden Evals (B43) และ FastAPI Deployment (B44)",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d168-q1",
        "เหตุใด Milestone 3 จึงต้องมี **End-to-End Integration Test** ที่เชื่อม D165, D166 และ D167 เข้าด้วยกัน แม้แต่ละไฟล์จะผ่าน Unit Test หมดแล้วก็ตาม?",
        [
          ["เพื่อเพิ่มจำนวนไฟล์ Python ในรีโปให้ดูเยอะขึ้น", "จำนวนไฟล์ไม่ใช่ตัววัดคุณภาพวิศวกรรม"],
          ["เพื่อจับปัญหาที่รอยต่อระหว่างโมดูล (เช่น รูปแบบ dict, ชื่อ field, และพฤติกรรม SQLite จริง) ที่ mock ใน unit test อาจซ่อนไว้", "ถูก — Unit test ที่ใช้ mock 100% มักไม่เห็น bug ของ data contract ข้ามโมดูล"],
          ["เพราะ `pytest` บังคับให้ทุกโปรเจกต์ต้องมีไฟล์ชื่อ `milestone3`", "`pytest` ไม่ได้บังคับชื่อไฟล์นี้ เป็นการออกแบบ test pyramid ของทีม"],
          ["เพื่อแทนที่การทำ 40-Case Golden Eval Dataset ใน B43", "Milestone 3 เป็น E2E functional smoke gate ส่วน B43 วัดคุณภาพเชิงสถิติบน 40 เคส"],
        ],
        "B",
        "E2E Integration Test ยืนยันว่า D165 Grounded Generator, D166 SQLite MCP Server และ D167 LangGraph Router สื่อสารกันด้วยสัญญาข้อมูลที่ตรงกันจริง",
        "Integration Test ใน Milestone 3 จับบั๊กแบบใดที่ Unit Test แยกไฟล์มักมองไม่เห็น?",
        "ปัญหาที่รอยต่อ (Integration Seams) เช่น ชื่อ field/schema ไม่ตรงกันข้ามโมดูล หรือการเขียนลง SQLite ที่หลุดรอดเมื่อเชื่อม adapter เข้าด้วยกัน",
      ),
      mc(
        "d168-q2",
        "ในการตรวจรับ Journey 4 (HITL Guarded Write) ของ Milestone 3 ข้อใดเป็นหลักฐานยืนยันความปลอดภัยที่สมบูรณ์ที่สุด?",
        [
          ["ดูแค่ข้อความที่บอตตอบว่า 'กำลังรอการยืนยัน'", "ข้อความอาจตอบถูกแต่โค้ดอาจเผลอเขียนลง DB ไปแล้ว"],
          ["ตรวจทั้ง `status == \"awaiting_approval\"`, จำนวนแถวใน SQLite คงเดิมก่อนอนุมัติ, เพิ่มขึ้น 1 แถวหลัง `approved=True`, และคงเดิมเมื่อ `approved=False`", "ถูก — พิสูจน์ทั้งระดับ API state และระดับฐานข้อมูลจริงครบทั้ง path อนุมัติและยกเลิก"],
          ["ตรวจว่า LLM ตอบภาษาไทยได้สละสลวย", "ความสละสลวยไม่ได้รับประกันความปลอดภัยของฐานข้อมูล"],
          ["ตรวจว่าปิดการเชื่อมต่ออินเทอร์เน็ตแล้วโค้ดไม่ error", "การรัน offline เป็นคุณสมบัติพื้นฐาน แต่ต้องตรวจ state ใน SQLite ด้วย"],
        ],
        "B",
        "การตรวจสอบผลกระทบต่อฐานข้อมูล (`SELECT COUNT(*)`) ควบคู่กับสถานะ Router เป็นวิธีพิสูจน์ว่า Safe Write Gate ป้องกันการแก้ไขข้อมูลโดยไม่ตั้งใจได้จริง",
        "การทดสอบ HITL Write Gate แบบ E2E ต้องตรวจจุดใดบ้าง?",
        "1) ตอน pause: status=awaiting_approval และ DB ไม่เปลี่ยน, 2) หลัง approve: DB เพิ่ม 1 แถว (และ idempotent), 3) หลัง reject: status=cancelled และ DB ไม่เปลี่ยน",
      ),
      mc(
        "d168-q3",
        "หากระหว่างรัน E2E Pipeline ตัว LLM ส่ง citation ปลอม `[pol-fake#99]` กลับมา พฤติกรรมที่ถูกต้องของระบบตั้งแต่ต้นจนจบคือข้อใด?",
        [
          ["ปล่อย `[pol-fake#99]` ผ่านเข้า Router แล้วแสดงให้ผู้ใช้เห็น", "ผิด — ละเมิดเกณฑ์ Strict Citations และสร้างข้อมูลหลอก"],
          ["D165 Verifier จับแล้วแปลงเป็น `abstained` → D167 Router ส่งต่อเส้นทาง `escalated` โดยคืน `citations == []`", "ถูก — ระบบป้องกันสองชั้นทำงานประสานกันเพื่อไม่ให้ข้อมูลปลอมหลุดถึงผู้ใช้"],
          ["D166 MCP Server ลบทิกเก็ตทั้งหมดทิ้ง", "MCP Server ไม่มีหน้าที่จัดการ citation ของเอกสาร"],
          ["ระบบค้างรอจนหมด timeout 30 วินาที", "Verifier ทำงานแบบ deterministic ทันทีโดยไม่รอ timeout"],
        ],
        "B",
        "ความร่วมมือระหว่าง D165 Verifier (จับ citation ปลอม → abstained) และ D167 Conditional Edge (abstained → escalated) ทำให้ผลลัพธ์ปลายทางปลอดภัยเสมอ",
        "เมื่อ LLM สร้าง citation ปลอม ท่อ E2E ของ D165 + D167 จะประสานงานกันอย่างไร?",
        "D165 Verifier ปฏิเสธ citation ปลอมเป็น `abstained` แล้ว D167 Router เปลี่ยนเส้นทางต่อไปยัง `escalated` พร้อม `citations=[]`",
      ),
      mc(
        "d168-q4",
        "หลังผ่าน **Milestone 3 (Core Flow Demo)** ใน Day 168 แล้ว ก้าวถัดไปใน Block **B43 (Days 169–172)** คืออะไร?",
        [
          ["ลบ unit test ทั้งหมดทิ้งแล้วเริ่มเขียนโค้ดใหม่", "ห้ามลบเทสต์ — ต้องเก็บเป็น regression suite ใน CI"],
          ["สร้าง 40-Case Golden Eval Dataset, รัน Ragas + Promptfoo Evals และติด Langfuse Telemetry เพื่อวัดผลคุณภาพ/ต้นทุน/Latency", "ถูก — เมื่อ Core Flow ทำงานครบวงจรแล้ว ขั้นถัดไปคือการวัดผลเชิงปริมาณและการสังเกตการณ์ระบบ"],
          ["เปลี่ยนจาก FastAPI ไปเขียนแอปมือถือด้วย Swift ทันที", "แผน B43–B44 คือ Evaluation, Telemetry, FastAPI SSE และ Staging Deploy"],
          ["ปิด PDPA Redaction เพื่อให้คำตอบยาวขึ้น", "Security และ PDPA จะถูกเสริมเข้มข้นขึ้นใน B44 ไม่ใช่ปิดทิ้ง"],
        ],
        "B",
        "Roadmap ของ Capstone วาง B42 (สร้าง Core Flow) → B43 (วัดผล Golden Set 40 ข้อ + Langfuse Telemetry) → B44 (PDPA/OWASP + FastAPI SSE + Staging Deploy)",
        "หลังผ่าน Milestone 3 ใน D168 งานหลักของ Block B43 คืออะไร?",
        "สร้าง 40-Case Golden Dataset (Thai, Code-Switch, Unanswerable, Attack), รัน Ragas + Promptfoo Evals แก้ Top 3 Failure Modes และติด Langfuse Telemetry",
      ),
    ],
  },

  takeaways: [
    "Milestone 3 รวม **B41 Retrieval + D165 Grounded Citations + D166 MCP Server + D167 LangGraph Router** เป็น `CoreFlowPipeline` เดียว",
    "ผ่านเกณฑ์ตรวจรับทั้ง **4 Core Journeys** (FAQ RAG, Abstain Escalation, MCP Read Lookup, HITL Pause/Resume) แบบ deterministic 100%",
    "ยืนยันความปลอดภัยเชิงประจักษ์: **`0` ungrounded citations**, **`0` unapproved DB writes**, และ **`0` raw PII leak**",
    "เก็บ `trace_events` และ `latency_ms` ตั้งแต่ Milestone 3 เพื่อพร้อมต่อเข้า **40-Case Golden Evals และ {{langfuse}}** ใน Block B43",
  ],

  reviewCards: [
    rc(
      "d168-rc-1",
      "4 Core Journeys ที่ต้องสาธิตให้ผ่านใน Milestone 3 Demo มีอะไรบ้าง?",
      "1) Bilingual FAQ RAG พร้อม verified citations, 2) Unanswerable Abstention → Escalation, 3) MCP Read-only Order/Ticket Lookup พร้อม PDPA mask, 4) HITL Guarded Write (Pause → Approve Commit / Reject Cancel)",
    ),
    rc(
      "d168-rc-2",
      "เกณฑ์ Milestone 3 Sign-Off Gate มีตัวชี้วัดหลักอะไรบ้าง?",
      "ผ่านครบทั้ง 4 journeys, Schema pass rate >= 99%, ungrounded_citations == 0, และ unapproved_writes == 0 (ตรวจที่ SQLite จริง)",
    ),
    rc(
      "d168-rc-3",
      "เหตุใดการใช้ Dependency Injection ใน `CoreFlowPipeline` จึงสำคัญต่อทั้ง Milestone 3 และ B43–B44?",
      "ทำให้รัน E2E Smoke Test แบบ offline ด้วย mock retriever/LLM ได้ในเสี้ยววินาที และสลับเสียบ Hybrid Retriever + LLM API จริงใน B43–B44 ได้โดยไม่ต้องแก้โค้ด Router",
    ),
  ],

  sources: [
    { label: "LangGraph Documentation — StateGraph & Persistence", href: "https://langchain-ai.github.io/langgraph/" },
    { label: "Model Context Protocol (MCP) Docs", href: "https://modelcontextprotocol.io/" },
    { label: "Pydantic v2 Validation & Serialization", href: "https://docs.pydantic.dev/latest/" },
    { label: "Anthropic — Building Effective Agents", href: "https://www.anthropic.com/research/building-effective-agents" },
  ],

  glossary: ["rag", "mcp", "langgraph", "hitl", "groundedness", "abstention", "idempotency", "pdpa", "pydantic", "data-contract"],
});
