import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D123 — Phase 4 / Block B31
 * Integration Tests across 15 Realistic Thai Customer Queries
 */
export const d123: Lesson = defineLesson({
  day: 123,
  titleTh: "Integration Tests บน 15 คำถามลูกค้าภาษาไทยเสมือนจริง",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · สร้างชุดทดสอบ Golden Dataset 15 สถานการณ์ภาษาไทย ตรวจครบทั้ง Route, Citation, ACL, BM25 Exact ID และ HITL ด้วย pytest parametrize",
  icon: "test-tubes",
  visual: {
    id: "phase4-rag-agent-arch",
    title: "ชุดทดสอบบูรณาการ 15 สถานการณ์ภาษาไทย (RAG + MCP + ACL + HITL)",
    caption: "ตรวจสอบครบทุกเส้นทางตั้งแต่รหัสใบแจ้งหนี้เฉพาะแบบ BM25, การกั้นข้อมูลข้ามบริษัท ไปจนถึงการหยุดรอคนอนุมัติคืนเงิน",
    alt: "แผนภาพ Integration Testing สำหรับระบบ Phase 4",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — สร้าง Golden Dataset 15 คำถามภาษาไทยและรัน Integration Suite ด้วย pytest parametrize",
  tools: ["Python 3.12", "pytest (@pytest.mark.parametrize)", "Pydantic v2"],

  bigPicture: [
    {
      node: 0,
      heading: "ทำไมต้องทดสอบบน '15 คำถามลูกค้าภาษาไทยเสมือนจริง' ก่อนเข้าวัน Checkpoint?",
      body: "การทดสอบฟังก์ชันย่อยทีละชิ้น (Unit Test) บอกเราว่าฟันเฟืองแต่ละตัวหมุนได้ แต่ **Integration Test บน {{golden-dataset}}** บอกเราว่าเมื่อลูกค้าพิมพ์ภาษาไทยจริง ๆ เข้ามาทั้ง 15 รูปแบบ ระบบที่ประกอบร่างใน Day 121–122 จะเลี้ยวถูกสาย อ้างอิงถูกไฟล์ และไม่ทำข้อมูลรั่วแม้แต่ข้อเดียว",
      lessonNote: "ชุดคำถาม 15 ข้อนี้คือเกณฑ์มาตรฐานของ Phase 4 Portfolio Milestone และเป็นสะพานเชื่อมตรงเข้าสู่ Phase 5 (AI Evaluations)",
    },
    {
      node: 1,
      heading: "ครอบคลุมครบ 5 หมวดหมู่ความเสี่ยงของระบบ Thai RAG + Agent",
      body: "ชุดข้อมูล 15 ข้อของเราไม่ได้สุ่มตั้งขึ้นมาลอย ๆ แต่แบ่งสัดส่วนครอบคลุม 5 หมวดสำคัญ: **(1) นโยบายทั่วไป (Semantic/Hybrid RAG)**, **(2) รหัสเฉพาะ/เลขมาตรา/รหัสแพ็กเกจ ({{bm25}} Exact Match)**, **(3) การเรียก {{mcp}} Order Lookup**, **(4) ความพยายามขอดูข้อมูลข้าม Tenant ({{acl}})** และ **(5) คำขอคืนเงินที่ต้องหยุดรอ {{hitl}} + คำถามนอกขอบเขต**",
      lessonNote: "ถ้าชุดทดสอบมีแต่คำถามง่าย ๆ หมวดที่ 1 อย่างเดียว เราจะไม่มีทางรู้เลยว่าด่าน ACL หรือ HITL พังหรือเปล่า",
    },
    {
      node: 4,
      heading: "ใช้ `@pytest.mark.parametrize` เพื่อให้เห็นผลผ่าน/ตกแยกรายข้ออย่างชัดเจน",
      body: "แทนที่จะเขียนลูป `for case in cases:` ยาว ๆ ในเทสต์เดียวซึ่งพอข้อที่ 3 ตกแล้วข้อที่ 4–15 ไม่ถูกรัน การใช้ {{parametrize}} ของ {{pytest}} พร้อมระบุ `ids=lambda c: c.case_id` จะรันแยกเป็น 15 เทสต์อิสระและรายงานชื่อเคสที่ตกทันที",
      lessonNote: "นอกจากนี้เรายังสร้างฟังก์ชัน `run_benchmark_suite` ที่สรุปรายงานรวมและรายชื่อ `failed_case_ids` สำหรับนำไปใช้ต่อใน Day 124 Checkpoint",
    },
    {
      node: 5,
      heading: "Deterministic Fixtures & Zero-Leak Assertions",
      body: "ทุกเคสใน 15 ข้อระบุ `forbidden_substrings` (เช่น ข้อความลับหรือยอดเงินของบริษัทอื่น) เพื่อตรวจยืนยันแบบ 100% ว่าไม่มีข้อมูลของ Tenant อื่นหลุดออกมาในคำตอบ",
      lessonNote: "นี่คือวิธีพิสูจน์เกณฑ์ Zero Cross-Tenant Leakage ด้วยโค้ดอัตโนมัติที่รันซ้ำได้ทุกครั้งใน CI",
    },
  ],

  objectives: [
    "**ออกแบบ {{golden-dataset}} ภาษาไทย 15 สถานการณ์ (`PHASE4_BENCHMARK_CASES`)** ที่ครอบคลุมครบทั้ง Hybrid Policy RAG, BM25 Exact Code Match, MCP Order Lookup, Cross-Tenant ACL Isolation, HITL Refund Pause และ Out-of-Scope Abstention",
    "**เขียนตัวประเมิน `evaluate_single_case` และ `run_benchmark_suite`** ที่ตรวจความถูกต้องครบ 4 แกนต่อข้อ: `route`, `status`, `expected_citation` และการไม่มี `forbidden_substrings` รั่วไหล",
    "**ใช้ `@pytest.mark.parametrize`** รันทดสอบทั้ง 15 คำถามแบบแยกข้อ พร้อมทดสอบว่าตัวประเมินสามารถจับและรายงาน `failed_case_ids` ได้อย่างแม่นยำเมื่อเกิดข้อผิดพลาด",
  ],

  prerequisites: [
    "ผ่าน Day 121 (Phase 4 Mini-Project Agent) และ Day 122 (Citation Verification & Fallback Gate)",
    "ทบทวนการใช้ `@pytest.mark.parametrize` จาก Phase 1 (Day 11)",
    "ไม่ต้องใช้ API key — รันชุดทดสอบบูรณาการ 15 คำถามภาษาไทยบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day123` ด้วย `uv` เพื่อสร้างชุดข้อมูลและตัวรันทดสอบ `eval_phase4_queries.py` คู่กับ `test_eval_phase4_queries.py`",
    commands: `uv init ai-day123 && cd ai-day123
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day123` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff`"],
      ["verify", "เขียน `eval_phase4_queries.py` และรัน `uv run pytest -v` เพื่อดูผลทั้ง 15 เคส"],
    ],
    note: "เวลาใช้ `uv run pytest -v` กับ `@pytest.mark.parametrize` คุณจะเห็นรายชื่อเคส `q01_refund_policy` ถึง `q15_out_of_scope_weather` เรียงกันครบทั้ง 15 บรรทัดสีเขียว!",
  },

  concepts: [
    {
      id: "designing-15-thai-benchmark-queries",
      title: "1 · โครงสร้างของ Golden Dataset 15 คำถามลูกค้าภาษาไทย (5 หมวดความเสี่ยง)",
      paragraphs: [
        "ชุดทดสอบ {{golden-dataset}} ที่ดีสำหรับระบบ {{rag}} + {{mcp}} + {{langgraph}} ต้องไม่วัดแค่ 'ตอบถูกไหม' แต่วัดว่า **'ระบบเลือกเส้นทางถูกไหม อ้างอิงถูกชิ้นไหม และกั้นข้อมูลต้องห้ามได้จริงไหม'** โดยเราแบ่ง 15 คำถามออกเป็น 5 หมวดหมู่ หมวดละ 3 ข้อ:",
        "- **หมวด A (ข้อ 1–3: Policy Semantic & Hybrid RAG)** — คำถามนโยบายภาษาไทยทั่วไปของ `acme_th` และ `beta_th` (การคืนเงิน, ค่าจัดส่งคืน, เวลาตอบกลับ SLA)\n- **หมวด B (ข้อ 4–6: BM25 Exact Code / Identifier RAG)** — คำถามที่ระบุรหัสโปรโมชัน รหัสข้อบังคับ หรือชื่อแพ็กเกจเฉพาะเจาะจง เช่น `PROMO-TH-88`, `SLA-GOLD-99`, `ERR-PAY-402` ซึ่งต้องอาศัยขา Lexical/BM25 ช่วยดึง chunk ที่ตรงรหัสเป๊ะ\n- **หมวด C (ข้อ 7–9: MCP Order Lookup)** — คำถามเช็กสถานะออเดอร์ `INV-YYYY-NNN` ของผู้เช่าตัวเอง และเคสออเดอร์ที่ไม่มีอยู่ในระบบ\n- **หมวด D (ข้อ 10–12: Cross-Tenant Isolation Attempts)** — ผู้ใช้ `acme_th` พยายามถามถึงออเดอร์ของ `beta_th`, ขอคืนเงินออเดอร์ของ `beta_th`, หรือถามรหัสโปรโมชันลับเฉพาะของ `beta_th`\n- **หมวด E (ข้อ 13–15: HITL Refund Pause & Out-of-Scope Abstention)** — คำขอคืนเงินออเดอร์ตัวเองที่ต้องหยุดรอที่ `awaiting_approval` และคำถามนอกเรื่อง (พยากรณ์อากาศ, หุ้น) ที่ต้องตัดเข้า `abstain_out_of_scope`",
      ],
      analogy:
        "เหมือนสนามสอบใบขับขี่ที่มีครบทั้ง 5 ด่าน: ขับทางตรง, ถอยเข้าซองแคบ (BM25 Exact ID), จอดเทียบป้าย (MCP Lookup), หยุดเมื่อเจอป้ายห้ามเข้า (Cross-Tenant ACL) และเบรกฉุกเฉินเมื่อมีคนข้ามถนน (HITL & Abstention)",
      bullets: [
        "**Explicit Contract per Case**: ทุกข้อระบุ `case_id`, `tenant_id`, `query`, `expected_route`, `expected_status`, `expected_citation` และ `forbidden_substrings`",
        "**Multi-Tenant Coverage**: ทดสอบสลับทั้งมุมมองของผู้ใช้ `acme_th` และ `beta_th`",
        "**Negative Leakage Check**: ตรวจว่าข้อมูลลับของอีกบริษัทไม่ปรากฏใน `answer` (`all(sub not in answer for sub in case.forbidden_substrings)`)",
      ],
      whyTitle: "Why this matters — `forbidden_substrings` คือวิธีตรวจ Cross-Tenant Leak ที่รัดกุมที่สุด",
      whyParagraphs: [
        "นอกจากการตรวจว่า `citations` ไม่มีรหัสของบริษัทอื่นแล้ว การตรวจว่าตัวเลขหรือคำสำคัญของบริษัทอื่น (เช่น `'60 วัน'`, `'3200'`) ไม่ปรากฏในข้อความ `answer` เลย ช่วยยืนยันว่าไม่มีข้อมูลรั่วแม้ในกรณีที่โมเดลลืมใส่ป้ายอ้างอิง",
      ],
    },
    {
      id: "deterministic-case-evaluator",
      title: "2 · การแยก `evaluate_single_case` และ `run_benchmark_suite`",
      paragraphs: [
        "เพื่อให้ชุดทดสอบของเราใช้งานได้ทั้งใน `pytest` (รันแยกทีละข้อด้วย {{parametrize}}) และในสคริปต์สรุปผลระดับโปรเจกต์ (รันรวดเดียว 15 ข้อแล้วสรุปอัตราผ่าน) เราควรแยกฟังก์ชันประเมินออกเป็น 2 ระดับ:",
        "**ระดับที่ 1: `evaluate_single_case(case: BenchmarkCase) -> CaseEvaluationResult`** — รันระบบผู้ช่วยกับ `case.query` ภายใต้ `AuthContext(tenant_id=case.tenant_id)` แล้วตรวจเงื่อนไขทั้ง 4 ข้อ: (1) `actual.route == case.expected_route`, (2) `actual.status == case.expected_status`, (3) หาก `case.expected_citation` ไม่เป็น `None` ต้องพบป้ายนั้นใน `actual.citations` และใน `actual.answer`, และ (4) ไม่มีคำใน `case.forbidden_substrings` ปรากฏใน `actual.answer` หรือ `actual.citations`",
        "**ระดับที่ 2: `run_benchmark_suite(cases: list[BenchmarkCase]) -> SuiteSummary`** — รันครบทุกข้อในรายการ แล้วคืนสรุป `total_cases`, `passed_cases`, `pass_rate`, `cross_tenant_leaks` และรายชื่อ `failed_case_ids` แยกตามข้อ",
      ],
      analogy:
        "`evaluate_single_case` เหมือนใบตรวจข้อสอบรายข้อที่บอกชัดเจนว่าข้อนี้ผิดตรงไหน ส่วน `run_benchmark_suite` เหมือนใบปะหน้าคะแนนรวมที่สรุปว่าสอบผ่านเกณฑ์ทั้งฉบับหรือไม่",
      code: {
        language: "python",
        filename: "case_evaluator.py",
        code: `from pydantic import BaseModel, Field


class CaseEvaluationResult(BaseModel):
    case_id: str
    passed: bool
    route_ok: bool
    status_ok: bool
    citation_ok: bool
    leak_free: bool
    failure_reasons: list[str] = Field(default_factory=list)


class SuiteSummary(BaseModel):
    total_cases: int
    passed_cases: int
    pass_rate: float
    cross_tenant_leaks: int
    failed_case_ids: list[str]`,
        caption: "แยกบูลีนทั้ง 4 แกน (`route_ok`, `status_ok`, `citation_ok`, `leak_free`) เพื่อให้ดีบักได้ทันทีว่าเคสที่ตกนั้นตกเพราะอะไร",
      },
      whyTitle: "Why this matters — รายงาน `failed_case_ids` แยกข้อช่วยประหยัดเวลาดีบักจากหลายชั่วโมงเหลือ 1 นาที",
      whyParagraphs: [
        "ถ้าเทสต์บอกแค่ว่า `'Pass rate 13/15 (86.7%)'` โดยไม่บอกว่า 2 ข้อที่ตกคือ `q05_bm25_promo_code` และ `q11_cross_tenant_refund` วิศวกรจะต้องเสียเวลาไล่รันดูทีละข้อใหม่ทั้งหมด",
      ],
    },
    {
      id: "pytest-parametrize-with-case-ids",
      title: "3 · การใช้ `@pytest.mark.parametrize` พร้อม `ids` ที่อ่านเข้าใจทันที",
      paragraphs: [
        "เมื่อเรานำ `PHASE4_BENCHMARK_CASES` ทั้ง 15 ข้อไปผูกกับ `@pytest.mark.parametrize(\"case\", PHASE4_BENCHMARK_CASES, ids=lambda c: c.case_id)` ตัว `pytest` จะสร้างเคสทดสอบย่อย 15 รายการที่มีชื่อตาม `case_id` เช่น `test_phase4_benchmark_case[q01_acme_refund_policy]`",
        "ข้อดีของการออกแบบนี้คือ: (1) ถ้าระบบมีบั๊กในหมวด BM25 แต่หมวดอื่นยังทำงานดีอยู่ เราจะเห็นทันทีว่าเฉพาะข้อ `q04`–`q06` เท่านั้นที่ขึ้นสีแดง ส่วนอีก 12 ข้อยังขึ้นสีเขียว, (2) เราสามารถสั่งรันเฉพาะข้อที่สนใจได้ด้วย `pytest -k q11` และ (3) ทุกข้อใช้ Fixture ข้อมูลจำลองชุดเดียวกันที่กำหนดผลซ้ำได้ 100% (Deterministic)",
      ],
      analogy:
        "เหมือนแผงเบรกเกอร์ไฟในบ้านที่มีป้ายชื่อติดแยกทุกห้อง (`ห้องครัว`, `ห้องนอน`, `แอร์`) เวลาไฟช็อตที่จุดไหน เราดูที่แผงก็รู้ทันทีว่าเบรกเกอร์ตัวไหนทริป ไม่ต้องเดาสุ่มทั้งบ้าน",
      bullets: [
        "**`ids=lambda c: c.case_id`**: แสดงชื่อเคสที่สื่อความหมายในรายงาน `pytest -v`",
        "**Per-Case Failure Reason**: ใช้ `assert result.passed, f\"{case.case_id} failed: {result.failure_reasons}\"`",
        "**Negative Suite Test**: เขียนเทสต์อีก 1 ข้อที่แกล้งส่งคำตอบผิดเข้าตัวประเมิน เพื่อยืนยันว่าตัวประเมินจับข้อผิดพลาดและใส่ชื่อลง `failed_case_ids` ได้จริง",
      ],
      whyTitle: "Why this matters — ต้องทดสอบ 'ตัวตรวจข้อสอบ' ด้วยว่าจับคำตอบที่ผิดได้จริง!",
      whyParagraphs: [
        "กฎสำคัญของการเขียนระบบ Evaluation คือ อย่าทดสอบแค่ว่าชุดทดสอบเป็นสีเขียวเมื่อระบบทำงานถูก แต่ต้องมีเทสต์ที่จำลองเคสข้อมูลรั่วหรือผิด route เพื่อยืนยันว่า `run_benchmark_suite` รายงาน `failed_case_ids` และนับ `cross_tenant_leaks` ได้จริง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ 15-Query Golden Dataset Suite กับ E2E API Contract Test Matrix",
      body: [
        "การรัน 15 สถานการณ์ด้วย `pytest.mark.parametrize` เทียบได้กับการทำ Table-Driven E2E Contract Testing ในระบบ Backend:",
      ],
      table: [
        ["`PHASE4_BENCHMARK_CASES` (15 rows)", "Table-driven test matrix ครอบคลุม Happy Path + Security Edge Cases"],
        ["`expected_route` & `expected_status`", "Expected HTTP Handler & Status Code (`200`, `202`, `403`, `422`)"],
        ["`expected_citation`", "Required Provenance / Resource ID ใน Response Body"],
        ["`forbidden_substrings`", "Data Leakage / PII Redaction Assertions"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม BM25 Exact Match ถึงจำเป็นสำหรับคำถามที่มีรหัส `PROMO-TH-88` หรือ `ERR-PAY-402`",
      body: [
        "ทบทวนจาก Block B25: โมเดล Dense Embedding มักมองรหัสตัวอักษรปนตัวเลข เช่น `PROMO-TH-88` กับ `PROMO-TH-99` ว่ามีความหมายใกล้เคียงกันมากจนสลับอันดับกันได้",
        "แต่พอเรามีคะแนน Lexical / BM25 ที่ตรวจว่าคำรหัสใน `query` ปรากฏตรงตัวใน `chunk.text` แล้วนำมารวมอันดับด้วย RRF เอกสารที่มีรหัส `PROMO-TH-88` ตรงตัวจะได้อันดับ 1 เสมอ!",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะดูโครงสร้างของ `eval_phase4_queries.py` ที่มีคลังความรู้ 2 บริษัท (`acme_th`, `beta_th`), ฐานข้อมูลออเดอร์จำลอง, ชุดคำถามภาษาไทย 15 ข้อครบทั้ง 5 หมวดหมู่ และตัวรัน `run_benchmark_suite`",
    steps: [
      {
        title: "1 · นิยามโมเดล `BenchmarkCase`, `CaseEvaluationResult` และ `SuiteSummary`",
        explain:
          "กำหนดโครงสร้างของแต่ละเคสใน Golden Dataset 15 ข้อให้ระบุทั้งอินพุตและผลลัพธ์ที่คาดหวังครบทุกมิติ",
        code: {
          language: "python",
          filename: "worked_eval15.py",
          code: `from typing import Literal
from pydantic import BaseModel, Field

RouteType = Literal["policy_rag", "order_lookup", "refund_hitl", "out_of_scope"]
AgentStatus = Literal[
    "answered",
    "awaiting_approval",
    "abstain_no_evidence",
    "abstain_out_of_scope",
]


class BenchmarkCase(BaseModel):
    case_id: str
    tenant_id: str
    query: str
    expected_route: RouteType
    expected_status: AgentStatus
    expected_citation: str | None = None
    forbidden_substrings: list[str] = Field(default_factory=list)


class CaseEvaluationResult(BaseModel):
    case_id: str
    passed: bool
    route_ok: bool
    status_ok: bool
    citation_ok: bool
    leak_free: bool
    failure_reasons: list[str] = Field(default_factory=list)


class SuiteSummary(BaseModel):
    total_cases: int
    passed_cases: int
    pass_rate: float
    cross_tenant_leaks: int
    failed_case_ids: list[str]`,
        },
      },
      {
        title: "2 · สร้างตัวจำลองระบบ Hybrid RAG + MCP + HITL ที่รองรับ BM25 Exact Token Boost",
        explain:
          "ระบบจะกรอง `tenant_id` ก่อนเสมอ จากนั้นให้คะแนน BM25 สูงเป็นพิเศษเมื่อพบรหัสหรือคำสำคัญใน `query` ตรงกับ `chunk.text` เพื่อให้ค้นทั้งนโยบายทั่วไปและรหัสเฉพาะได้อย่างแม่นยำ",
        code: {
          language: "python",
          filename: "worked_eval15.py",
          code: `import re

ORDER_ID_RE = re.compile(r"INV-\\d{4}-\\d{3}")

KB_CHUNKS = [
    {"chunk_id": "acme-refund#c01", "tenant_id": "acme_th", "keywords": ["คืนเงิน", "14 วัน"], "text": "นโยบาย Acme คืนเงินได้ภายใน 14 วันทำการ"},
    {"chunk_id": "acme-ship#c01", "tenant_id": "acme_th", "keywords": ["จัดส่ง", "ค่าส่ง", "50 บาท"], "text": "Acme ช่วยค่าจัดส่งคืนสินค้า 50 บาทเมื่อสินค้าชำรุด"},
    {"chunk_id": "acme-sla#c01", "tenant_id": "acme_th", "keywords": ["SLA", "ตอบกลับ", "2 ชั่วโมง"], "text": "ตั๋วด่วนของ Acme ตอบกลับภายใน 2 ชั่วโมงทำการ"},
    {"chunk_id": "acme-promo#c01", "tenant_id": "acme_th", "keywords": ["PROMO-TH-88", "ส่วนลด"], "text": "รหัส PROMO-TH-88 ลดราคา 15% สำหรับลูกค้า Acme"},
    {"chunk_id": "acme-err#c01", "tenant_id": "acme_th", "keywords": ["ERR-PAY-402", "ชำระเงิน"], "text": "รหัสข้อผิดพลาด ERR-PAY-402 เกิดจากวงเงินบัตรไม่พอ"},
    {"chunk_id": "acme-tax#c01", "tenant_id": "acme_th", "keywords": ["FORM-TAX-09", "ใบกำกับภาษี"], "text": "การขอใบกำกับภาษีย้อนหลังใช้แบบฟอร์ม FORM-TAX-09"},
    {"chunk_id": "beta-refund#c01", "tenant_id": "beta_th", "keywords": ["คืนเงิน", "60 วัน"], "text": "นโยบาย Beta คืนเงินได้ภายใน 60 วันทำการ"},
    {"chunk_id": "beta-vip#c01", "tenant_id": "beta_th", "keywords": ["BETA-VIP-999", "สิทธิพิเศษ"], "text": "รหัสลับ BETA-VIP-999 ลด 50% เฉพาะลูกค้า Beta"},
]

ORDERS_DB = {
    "INV-2026-001": {"tenant_id": "acme_th", "status": "shipped", "amount_thb": 1490},
    "INV-2026-002": {"tenant_id": "acme_th", "status": "processing", "amount_thb": 2500},
    "INV-2026-099": {"tenant_id": "beta_th", "status": "delivered", "amount_thb": 8900},
}


def simulate_phase4_system(query: str, tenant_id: str) -> tuple[RouteType, AgentStatus, str, list[str]]:
    order_match = ORDER_ID_RE.search(query)
    if order_match and ("ขอคืนเงิน" in query or "อนุมัติคืนเงิน" in query):
        oid = order_match.group(0)
        rec = ORDERS_DB.get(oid)
        if rec is None or rec["tenant_id"] != tenant_id:
            return "refund_hitl", "abstain_no_evidence", f"ไม่พบคำสั่งซื้อ {oid} ในบัญชีของท่าน", []
        return "refund_hitl", "awaiting_approval", f"คำขอคืนเงิน {oid} ยอด {rec['amount_thb']} บาท รอผู้ดูแลอนุมัติ", []

    if order_match:
        oid = order_match.group(0)
        rec = ORDERS_DB.get(oid)
        if rec is None or rec["tenant_id"] != tenant_id:
            return "order_lookup", "abstain_no_evidence", f"ไม่พบคำสั่งซื้อ {oid} ในบัญชีของท่าน", []
        return "order_lookup", "answered", f"คำสั่งซื้อ {oid} สถานะ {rec['status']} ยอด {rec['amount_thb']} บาท", []

    # Check if query is policy/code related
    policy_triggers = ("คืนเงิน", "จัดส่ง", "ค่าส่ง", "SLA", "ตอบกลับ", "PROMO-", "ERR-", "FORM-", "BETA-VIP")
    if not any(t in query for t in policy_triggers):
        return "out_of_scope", "abstain_out_of_scope", "ขออภัย คำถามนี้อยู่นอกขอบเขตบริการ", []

    allowed_chunks = [c for c in KB_CHUNKS if c["tenant_id"] == tenant_id]
    scored = []
    for c in allowed_chunks:
        hits = sum(1 for kw in c["keywords"] if kw in query)
        if hits > 0:
            scored.append((hits, c))
    if not scored:
        return "policy_rag", "abstain_no_evidence", "ไม่พบเอกสารนโยบายที่ตรงกับคำถามในบัญชีของท่าน", []

    scored.sort(key=lambda x: x[0], reverse=True)
    best = scored[0][1]
    cid = str(best["chunk_id"])
    return "policy_rag", "answered", f"{best['text']} [{cid}]", [cid]`,
        },
      },
      {
        title: "3 · รันชุดทดสอบตัวอย่างและพิมพ์สรุป `SuiteSummary`",
        explain:
          "ตรวจความถูกต้องครบทั้ง 4 แกนต่อเคส (`route_ok`, `status_ok`, `citation_ok`, `leak_free`) และสรุปอัตราการผ่าน",
        code: {
          language: "python",
          filename: "worked_eval15.py",
          code: `sample_cases = [
    BenchmarkCase(
        case_id="q01_acme_refund",
        tenant_id="acme_th",
        query="สอบถามนโยบายคืนเงินของบริษัทครับ",
        expected_route="policy_rag",
        expected_status="answered",
        expected_citation="acme-refund#c01",
        forbidden_substrings=["60 วัน", "beta-refund#c01"],
    ),
    BenchmarkCase(
        case_id="q10_cross_tenant_order",
        tenant_id="acme_th",
        query="เช็กสถานะออเดอร์ INV-2026-099 ให้หน่อย",
        expected_route="order_lookup",
        expected_status="abstain_no_evidence",
        forbidden_substrings=["delivered", "8900"],
    ),
]

for c in sample_cases:
    route, status, ans, cites = simulate_phase4_system(c.query, c.tenant_id)
    print(c.case_id, "->", route, status, cites, "| leak_free:", all(f not in ans for f in c.forbidden_substrings))`,
        },
        output: `q01_acme_refund -> policy_rag answered ['acme-refund#c01'] | leak_free: True
q10_cross_tenant_order -> order_lookup abstain_no_evidence [] | leak_free: True`,
      },
    ],
    gotcha:
      "สังเกตในหมวด Cross-Tenant (`q10_cross_tenant_order`): เมื่อผู้ใช้ `acme_th` ถามถึงรหัสลับ `BETA-VIP-999` หรือออเดอร์ `INV-2026-099` ของ `beta_th` เพราะเรากรอง `allowed_chunks` ตาม `tenant_id` ตั้งแต่ต้น ระบบจะไม่เจอ `BETA-VIP-999` ในคลังของ `acme_th` และคืน `abstain_no_evidence` โดยไม่มีคำว่า `'ลด 50%'` หรือ `'8900'` หลุดออกมาเลย!",
  },

  practice: {
    intro:
      "ภารกิจ 15 นาที: สร้างโมดูล `eval_phase4_queries.py` ที่มีชุดคำถามลูกค้าภาษาไทย `PHASE4_BENCHMARK_CASES` ครบ 15 ข้อ, ฟังก์ชัน `evaluate_single_case` และ `run_benchmark_suite` พร้อมเขียนชุดทดสอบ `test_eval_phase4_queries.py` ด้วย `@pytest.mark.parametrize`",
    requirements: [
      "สร้างชุดข้อมูล `PHASE4_BENCHMARK_CASES: list[BenchmarkCase]` จำนวน 15 ข้อ ครอบคลุมครบทั้ง 5 หมวด: (1) นโยบายทั่วไป, (2) รหัสเฉพาะแบบ BM25 (`PROMO-TH-88`, `ERR-PAY-402`, `FORM-TAX-09`), (3) MCP Order Lookup, (4) กรณีข้าม Tenant (ทั้งออเดอร์ ขอคืนเงิน และรหัสลับ `BETA-VIP-999`) และ (5) การขอคืนเงินที่ต้องหยุดรออนุมัติ (`awaiting_approval`) + คำถามนอกขอบเขต",
      "เขียน `simulate_phase4_system(query: str, tenant_id: str)` ที่จำลองการทำงานของระบบบูรณาการ Phase 4 แบบ deterministic โดยใช้ข้อมูลจำลองในเครื่อง",
      "เขียน `evaluate_single_case(case: BenchmarkCase, runner_fn=simulate_phase4_system) -> CaseEvaluationResult` ที่ตรวจทั้ง `route_ok`, `status_ok`, `citation_ok` และ `leak_free` (ไม่มี `forbidden_substrings` ในคำตอบหรือ citations)",
      "เขียน `run_benchmark_suite(cases: list[BenchmarkCase], runner_fn=simulate_phase4_system) -> SuiteSummary` ที่รายงาน `pass_rate`, `cross_tenant_leaks` และรายชื่อ `failed_case_ids` แยกข้อ (ถ้า `cases` ว่างให้โยน `ValueError`)",
      "เขียน `test_eval_phase4_queries.py` ที่ใช้ `@pytest.mark.parametrize` ทดสอบครบทั้ง 15 ข้อ และทดสอบกรณีที่ `runner_fn` จำลองทำข้อมูลรั่วเพื่อยืนยันว่า `run_benchmark_suite` รายงาน `failed_case_ids` และ `cross_tenant_leaks` ได้ถูกต้อง",
    ],
    starter: {
      language: "python",
      filename: "eval_phase4_queries.py",
      code: `import re
from collections.abc import Callable
from typing import Literal
from pydantic import BaseModel, Field

ORDER_ID_RE = re.compile(r"INV-\\d{4}-\\d{3}")

RouteType = Literal["policy_rag", "order_lookup", "refund_hitl", "out_of_scope"]
AgentStatus = Literal[
    "answered",
    "awaiting_approval",
    "abstain_no_evidence",
    "abstain_out_of_scope",
]


class BenchmarkCase(BaseModel):
    case_id: str
    tenant_id: str
    query: str
    expected_route: RouteType
    expected_status: AgentStatus
    expected_citation: str | None = None
    forbidden_substrings: list[str] = Field(default_factory=list)


class CaseEvaluationResult(BaseModel):
    case_id: str
    passed: bool
    route_ok: bool
    status_ok: bool
    citation_ok: bool
    leak_free: bool
    failure_reasons: list[str] = Field(default_factory=list)


class SuiteSummary(BaseModel):
    total_cases: int
    passed_cases: int
    pass_rate: float
    cross_tenant_leaks: int
    failed_case_ids: list[str]


KB_CHUNKS = [
    {"chunk_id": "acme-refund#c01", "tenant_id": "acme_th", "keywords": ["คืนเงิน", "14 วัน"], "text": "นโยบาย Acme คืนเงินได้ภายใน 14 วันทำการ"},
    {"chunk_id": "acme-ship#c01", "tenant_id": "acme_th", "keywords": ["จัดส่ง", "ค่าส่ง", "50 บาท"], "text": "Acme ช่วยค่าจัดส่งคืนสินค้า 50 บาทเมื่อสินค้าชำรุด"},
    {"chunk_id": "acme-sla#c01", "tenant_id": "acme_th", "keywords": ["SLA", "ตอบกลับ", "2 ชั่วโมง"], "text": "ตั๋วด่วนของ Acme ตอบกลับภายใน 2 ชั่วโมงทำการ"},
    {"chunk_id": "acme-promo#c01", "tenant_id": "acme_th", "keywords": ["PROMO-TH-88", "ส่วนลด"], "text": "รหัส PROMO-TH-88 ลดราคา 15% สำหรับลูกค้า Acme"},
    {"chunk_id": "acme-err#c01", "tenant_id": "acme_th", "keywords": ["ERR-PAY-402", "ชำระเงิน"], "text": "รหัสข้อผิดพลาด ERR-PAY-402 เกิดจากวงเงินบัตรไม่พอ"},
    {"chunk_id": "acme-tax#c01", "tenant_id": "acme_th", "keywords": ["FORM-TAX-09", "ใบกำกับภาษี"], "text": "การขอใบกำกับภาษีย้อนหลังใช้แบบฟอร์ม FORM-TAX-09"},
    {"chunk_id": "beta-refund#c01", "tenant_id": "beta_th", "keywords": ["คืนเงิน", "60 วัน"], "text": "นโยบาย Beta คืนเงินได้ภายใน 60 วันทำการ"},
    {"chunk_id": "beta-vip#c01", "tenant_id": "beta_th", "keywords": ["BETA-VIP-999", "สิทธิพิเศษ"], "text": "รหัสลับ BETA-VIP-999 ลด 50% เฉพาะลูกค้า Beta"},
]

ORDERS_DB = {
    "INV-2026-001": {"tenant_id": "acme_th", "status": "shipped", "amount_thb": 1490},
    "INV-2026-002": {"tenant_id": "acme_th", "status": "processing", "amount_thb": 2500},
    "INV-2026-099": {"tenant_id": "beta_th", "status": "delivered", "amount_thb": 8900},
}

PHASE4_BENCHMARK_CASES: list[BenchmarkCase] = [
    BenchmarkCase(case_id="q01_acme_refund_policy", tenant_id="acme_th", query="ขอทราบนโยบายคืนเงินครับ", expected_route="policy_rag", expected_status="answered", expected_citation="acme-refund#c01", forbidden_substrings=["60 วัน", "beta-refund#c01"]),
    BenchmarkCase(case_id="q02_acme_shipping_policy", tenant_id="acme_th", query="สินค้าชำรุดมีนโยบายค่าส่งคืนอย่างไร", expected_route="policy_rag", expected_status="answered", expected_citation="acme-ship#c01", forbidden_substrings=["BETA-VIP-999"]),
    BenchmarkCase(case_id="q03_acme_sla_policy", tenant_id="acme_th", query="SLA การตอบกลับตั๋วด่วนใช้เวลากี่ชั่วโมง", expected_route="policy_rag", expected_status="answered", expected_citation="acme-sla#c01", forbidden_substrings=["60 วัน"]),
    BenchmarkCase(case_id="q04_bm25_promo_code", tenant_id="acme_th", query="รหัสส่วนลด PROMO-TH-88 ได้ลดกี่เปอร์เซ็นต์", expected_route="policy_rag", expected_status="answered", expected_citation="acme-promo#c01", forbidden_substrings=["ลด 50%"]),
    BenchmarkCase(case_id="q05_bm25_error_code", tenant_id="acme_th", query="ชำระเงินขึ้นรหัส ERR-PAY-402 ต้องแก้อย่างไร", expected_route="policy_rag", expected_status="answered", expected_citation="acme-err#c01", forbidden_substrings=["BETA-VIP-999"]),
    BenchmarkCase(case_id="q06_bm25_tax_form", tenant_id="acme_th", query="ขอใบกำกับภาษีด้วยแบบฟอร์ม FORM-TAX-09", expected_route="policy_rag", expected_status="answered", expected_citation="acme-tax#c01", forbidden_substrings=["60 วัน"]),
    BenchmarkCase(case_id="q07_mcp_order_shipped", tenant_id="acme_th", query="เช็กสถานะออเดอร์ INV-2026-001 ให้หน่อย", expected_route="order_lookup", expected_status="answered", forbidden_substrings=["8900", "delivered"]),
    BenchmarkCase(case_id="q08_mcp_order_processing", tenant_id="acme_th", query="ตามออเดอร์ INV-2026-002 ถึงไหนแล้ว", expected_route="order_lookup", expected_status="answered", forbidden_substrings=["8900"]),
    BenchmarkCase(case_id="q09_mcp_order_not_found", tenant_id="acme_th", query="เช็กออเดอร์ INV-2026-404 ครับ", expected_route="order_lookup", expected_status="abstain_no_evidence", forbidden_substrings=["shipped", "delivered"]),
    BenchmarkCase(case_id="q10_cross_tenant_order_leak", tenant_id="acme_th", query="ขอดูออเดอร์ INV-2026-099 ของบริษัทอื่น", expected_route="order_lookup", expected_status="abstain_no_evidence", forbidden_substrings=["8900", "delivered"]),
    BenchmarkCase(case_id="q11_cross_tenant_refund_attempt", tenant_id="acme_th", query="ขอคืนเงินออเดอร์ INV-2026-099 เดี๋ยวนี้", expected_route="refund_hitl", expected_status="abstain_no_evidence", forbidden_substrings=["8900", "รอผู้ดูแลอนุมัติ"]),
    BenchmarkCase(case_id="q12_cross_tenant_secret_code", tenant_id="acme_th", query="ขอใช้รหัสลับ BETA-VIP-999 ครับ", expected_route="policy_rag", expected_status="abstain_no_evidence", forbidden_substrings=["ลด 50%", "beta-vip#c01"]),
    BenchmarkCase(case_id="q13_hitl_refund_pause_1", tenant_id="acme_th", query="ขอคืนเงินออเดอร์ INV-2026-001 ครับ", expected_route="refund_hitl", expected_status="awaiting_approval", forbidden_substrings=["8900"]),
    BenchmarkCase(case_id="q14_hitl_refund_pause_2", tenant_id="acme_th", query="ช่วยอนุมัติคืนเงินสำหรับ INV-2026-002 ด้วยครับ", expected_route="refund_hitl", expected_status="awaiting_approval", forbidden_substrings=["8900"]),
    BenchmarkCase(case_id="q15_out_of_scope_weather", tenant_id="acme_th", query="พรุ่งนี้ฝนจะตกที่กรุงเทพไหมครับ", expected_route="out_of_scope", expected_status="abstain_out_of_scope", forbidden_substrings=["acme-refund#c01"]),
]

RunnerFn = Callable[[str, str], tuple[RouteType, AgentStatus, str, list[str]]]


def simulate_phase4_system(
    query: str,
    tenant_id: str,
) -> tuple[RouteType, AgentStatus, str, list[str]]:
    """จำลองการทำงานของระบบ Phase 4 (RAG + BM25 + MCP + ACL + HITL)"""
    # TODO: implement deterministic system simulator for the 15 cases
    raise NotImplementedError


def evaluate_single_case(
    case: BenchmarkCase,
    runner_fn: RunnerFn = simulate_phase4_system,
) -> CaseEvaluationResult:
    """ตรวจ route, status, citation และ forbidden_substrings ของ 1 คำถาม"""
    # TODO: implement single case evaluator
    raise NotImplementedError


def run_benchmark_suite(
    cases: list[BenchmarkCase],
    runner_fn: RunnerFn = simulate_phase4_system,
) -> SuiteSummary:
    """รันทุกคำถามในชุดทดสอบและสรุป pass_rate, cross_tenant_leaks และ failed_case_ids"""
    # TODO: ถ้า cases ว่างให้ raise ValueError
    raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "`len(PHASE4_BENCHMARK_CASES)` มีจำนวน 15 ข้อครบทั้ง 5 หมวดใช่หรือไม่?",
      "เมื่อ `case.expected_citation` ไม่เป็น `None` ตัวประเมินตรวจทั้งว่า `expected_citation in actual_citations` และ `f\"[{case.expected_citation}]\" in actual_answer` ใช่หรือไม่?",
      "เมื่อพบคำใน `case.forbidden_substrings` ปรากฏใน `actual_answer` ค่า `leak_free` เป็น `False` และถูกนับรวมใน `SuiteSummary.cross_tenant_leaks` ใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` รันผ่านครบทั้ง 15 parametrized cases + suite failure reporting test และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ใน `evaluate_single_case` ตั้ง `citation_ok = True` เมื่อ `case.expected_citation is None` (แต่ต้องเช็กด้วยว่าเมื่อสถานะเป็น `abstain_*` ลิสต์ `actual_citations` ต้องว่างเปล่า `[]`)",
      },
      {
        body: "ใน `run_benchmark_suite` นับ `leaks = sum(1 for r in results if not r.leak_free)` และ `failed_ids = [r.case_id for r in results if not r.passed]`",
      },
      {
        body: "เฉลยชุดทดสอบ `test_eval_phase4_queries.py`:",
        code: {
          language: "python",
          filename: "test_eval_phase4_queries.py",
          code: `import pytest
from eval_phase4_queries import (
    PHASE4_BENCHMARK_CASES,
    BenchmarkCase,
    evaluate_single_case,
    run_benchmark_suite,
)


def test_benchmark_has_fifteen_realistic_thai_cases() -> None:
    assert len(PHASE4_BENCHMARK_CASES) == 15


@pytest.mark.parametrize("case", PHASE4_BENCHMARK_CASES, ids=lambda c: c.case_id)
def test_phase4_integration_case(case: BenchmarkCase) -> None:
    res = evaluate_single_case(case)
    assert res.passed is True, f"{case.case_id} failed: {res.failure_reasons}"
    assert res.route_ok is True
    assert res.status_ok is True
    assert res.citation_ok is True
    assert res.leak_free is True


def test_suite_summary_and_failure_detection() -> None:
    summary = run_benchmark_suite(PHASE4_BENCHMARK_CASES)
    assert summary.total_cases == 15
    assert summary.passed_cases == 15
    assert summary.pass_rate == 1.0
    assert summary.cross_tenant_leaks == 0
    assert summary.failed_case_ids == []

    # Leaky mock runner must be caught and reported per case
    def leaky_runner(q: str, t: str):
        return ("policy_rag", "answered", "ข้อมูลรั่ว 60 วัน ลด 50% 8900", ["beta-refund#c01"])

    bad_summary = run_benchmark_suite(PHASE4_BENCHMARK_CASES[:3], runner_fn=leaky_runner)
    assert bad_summary.passed_cases < 3
    assert bad_summary.cross_tenant_leaks > 0
    assert "q01_acme_refund_policy" in bad_summary.failed_case_ids

    with pytest.raises(ValueError):
        run_benchmark_suite([])`,
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
      title: "สร้างชุดทดสอบ 15 ข้อที่มีแต่คำถามนโยบายปกติ (Happy Path) โดยไม่มีเคสข้าม Tenant หรือเคส HITL เลย",
      symptom:
        "ชุดทดสอบผ่าน 100% แต่พอใช้งานจริงข้อมูลรั่วข้ามบริษัทและโอนเงินโดยไม่รอคนอนุมัติ",
      fix: "ออกแบบ Golden Dataset ให้ครอบคลุมครบทั้ง 5 หมวดความเสี่ยง (Policy RAG, BM25 Exact Code, MCP Lookup, Cross-Tenant ACL, HITL + Out-of-Scope)",
    },
    {
      title: "รันทั้ง 15 ข้อในลูป `for` เดียวโดยไม่ใช้ `@pytest.mark.parametrize` และไม่เก็บ `failed_case_ids`",
      symptom:
        "เมื่อข้อที่ 2 ตก เทสต์หยุดรันทันทีจนไม่เห็นสถานะของข้อ 3–15",
      fix: "ใช้ `@pytest.mark.parametrize(\"case\", PHASE4_BENCHMARK_CASES, ids=lambda c: c.case_id)` คู่กับ `run_benchmark_suite` ที่รวบรวม `failed_case_ids` ทุกข้อ",
    },
    {
      title: "ตรวจแค่ว่า `expected_citation` อยู่ในลิสต์ แต่ไม่ตรวจว่าไม่มี `forbidden_substrings` ของบริษัทอื่นปนอยู่ในข้อความคำตอบ",
      symptom:
        "คำตอบแปะป้าย `[acme-refund#c01]` ถูก แต่ในเนื้อความดันเอาตัวเลข `'60 วัน'` ของบริษัท Beta มาปน",
      fix: "ตรวจ `leak_free = all(sub not in answer for sub in case.forbidden_substrings)` ควบคู่กับการตรวจ Citation เสมอ",
    },
    {
      title: "ไม่เขียน Negative Test เพื่อตรวจว่าตัวประเมิน (`run_benchmark_suite`) สามารถจับคำตอบที่ผิดได้จริง",
      symptom:
        "ตัวประเมินมีบั๊กที่คืน `passed=True` เสมอ (Vacuous Pass) โดยไม่มีใครรู้ตัว",
      fix: "เพิ่มเทสต์ที่ส่ง `leaky_runner` จำลองเข้าไปเพื่อยืนยันว่า `failed_case_ids` และ `cross_tenant_leaks` ถูกนับอย่างถูกต้อง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d123-q1",
        "ทำไมชุดทดสอบบูรณาการ 15 คำถามภาษาไทยจึงต้องมีหมวดคำถามที่ระบุรหัสเฉพาะเจาะจง เช่น `PROMO-TH-88`, `ERR-PAY-402` และ `FORM-TAX-09` รวมอยู่ด้วย?",
        [
          ["เพื่อทดสอบว่าขา Lexical / BM25 ในระบบ Hybrid RAG ทำงานได้จริง เพราะหากใช้เฉพาะ Dense Vector เพียงอย่างเดียว โมเดลมักสับสนระหว่างรหัสตัวอักษรปนตัวเลขที่หน้าตาคล้ายกัน", "ถูกต้อง — คำถามรหัสเฉพาะคือบทพิสูจน์ว่า Hybrid Search (BM25 + Vector) ของเราไม่ตกม้าตายเวลาเจอรหัสใบแจ้งหนี้หรือรหัสข้อผิดพลาด"],
          ["เพราะภาษาไทยไม่มีพยัญชนะ", "ไม่เป็นความจริง"],
          ["เพื่อทดสอบความเร็วของการ์ดจอ", "ไม่เกี่ยวกับการ์ดจอ"],
          ["เพื่อให้โมเดลไม่ต้องตรวจ ACL", "ทุกหมวดยังต้องตรวจ ACL เสมอ"],
        ],
        "A",
        "คำถามที่มีรหัสเฉพาะ (Exact Identifiers) คือเหตุผลหลักที่เราสร้าง Thai BM25 คู่กับ Dense Vector ใน Block B25",
        "ทำไมใน Golden Dataset 15 ข้อต้องมีคำถามรหัสเฉพาะ (`PROMO-TH-88`, `ERR-PAY-402`)?",
        "เพื่อยืนยันว่าขา BM25 / Lexical Search ในระบบ Hybrid RAG สามารถดึงรหัสเฉพาะที่ Vector Search มักสับสนได้อย่างแม่นยำ",
      ),
      mc(
        "d123-q2",
        "การใช้ `@pytest.mark.parametrize(\"case\", PHASE4_BENCHMARK_CASES, ids=lambda c: c.case_id)` มีข้อดีกว่าการเขียนลูป `for case in PHASE4_BENCHMARK_CASES: assert ...` ในฟังก์ชันเทสต์เดียวอย่างไร?",
        [
          ["ทำให้ pytest ข้ามเคสที่ล้มเหลวไปเลยโดยไม่รายงาน", "ผิด — pytest รายงานทุกเคสที่ล้มเหลว"],
          ["ทำให้ทั้ง 15 คำถามถูกรันและรายงานผลแยกอิสระต่อกัน หากข้อที่ 4 ตก ข้อที่ 5–15 ก็ยังคงถูกรันครบ และเห็นชื่อ `case_id` ที่ตกได้ทันทีจากรายงาน", "ถูกต้อง — ช่วยให้เห็นภาพรวมความเสียหายครบทุกหมวดในรวดเดียว"],
          ["ทำให้ไม่ต้องติดตั้ง pytest", "ยังต้องใช้ pytest รัน"],
          ["ทำให้รันได้เฉพาะบนระบบปฏิบัติการ Linux เท่านั้น", "รันได้ทุก OS"],
        ],
        "B",
        "Parametrized tests แยกการรันแต่ละแถวในชุดข้อมูลเป็นเทสต์อิสระ ทำให้เมื่อมีบั๊ก เราเห็นทันทีว่ากระทบหมวดไหนบ้าง",
        "ข้อดีหลักของ `@pytest.mark.parametrize` พร้อม `ids=lambda c: c.case_id` คืออะไร?",
        "รันครบทั้ง 15 ข้อโดยไม่หยุดกลางคันเมื่อข้อใดข้อหนึ่งตก และรายงานชื่อ `case_id` ที่ตกแยกตามข้ออย่างชัดเจน",
      ),
      mc(
        "d123-q3",
        "ในเคส `q11_cross_tenant_refund_attempt` ที่ผู้ใช้ `acme_th` พิมพ์ว่า `'ขอคืนเงินออเดอร์ INV-2026-099 เดี๋ยวนี้'` (ซึ่งเป็นออเดอร์ของ `beta_th` ยอด 8,900 บาท) ผลลัพธ์ที่คาดหวัง (`expected_status` และ `forbidden_substrings`) คือข้อใด?",
        [
          ["`expected_status=\"awaiting_approval\"` และแสดงยอด 8,900 บาทให้ผู้ใช้ยืนยัน", "อันตราย — ทั้งรั่วไหลยอดเงินข้ามบริษัทและสร้างตั๋วคืนเงินข้ามบริษัท"],
          ["`expected_status=\"abstain_no_evidence\"` และในคำตอบต้องไม่มีทั้งคำว่า `'8900'` และ `'รอผู้ดูแลอนุมัติ'` (`forbidden_substrings`)", "ถูกต้อง — ต้องปฏิเสธเสมือนไม่พบออเดอร์ในบัญชีของผู้ใช้ และห้ามเข้าคิวรออนุมัติคืนเงินเด็ดขาด"],
          ["`expected_status=\"answered\"` และโอนเงิน 8,900 บาททันที", "ละเมิดทั้ง ACL และ HITL ร้ายแรง"],
          ["`expected_status=\"abstain_out_of_scope\"` เพราะระบบไม่รับเรื่องคืนเงิน", "Route คือ `refund_hitl` แต่ตกด่านความเป็นเจ้าของออเดอร์ จึงเป็น `abstain_no_evidence`"],
        ],
        "B",
        "การตรวจทั้ง `expected_status == \"abstain_no_evidence\"` และการไม่มี `\"8900\"` หรือ `\"รอผู้ดูแลอนุมัติ\"` ในคำตอบ ยืนยันว่าด่าน ACL ทำงานก่อนด่าน HITL จริง",
        "เมื่อผู้ใช้บริษัท A สั่งขอคืนเงินรหัสออเดอร์ของบริษัท B ระบบต้องคืนสถานะใดและห้ามมีข้อความใด?",
        "คืน `abstain_no_evidence` และห้ามมียอดเงินของบริษัท B หรือข้อความว่าส่งเข้าคิวรออนุมัติแล้ว",
      ),
      mc(
        "d123-q4",
        "เหตุใดเราจึงควรเขียนเทสต์ที่ส่ง `leaky_runner` (ฟังก์ชันจำลองที่แกล้งทำข้อมูลรั่ว) เข้าไปทดสอบ `run_benchmark_suite` ด้วย?",
        [
          ["เพื่อยืนยันว่าตัวประเมิน (`evaluate_single_case` และ `run_benchmark_suite`) ไม่ได้เขียนบั๊กที่คืน `passed=True` ตลอดเวลา แต่สามารถตรวจจับข้อมูลรั่ว นับ `cross_tenant_leaks` และระบุ `failed_case_ids` ได้จริง", "ถูกต้อง — การทดสอบตัวตรวจข้อสอบ (Testing the Evaluator) ป้องกันปัญหา Vacuous Pass"],
          ["เพื่อให้ระบบจริงทำข้อมูลรั่วตามไปด้วย", "เราส่งเข้าเฉพาะในเทสต์จำลองเพื่อตรวจตัวประเมินเท่านั้น"],
          ["เพื่อลบชุดข้อมูล 15 ข้อทิ้ง", "ไม่ได้ลบชุดข้อมูล"],
          ["เพื่อให้ `pytest` รันช้าลง", "รันเสร็จในระดับมิลลิวินาที"],
        ],
        "A",
        "ในวิศวกรรมระบบประเมินผล (Evaluation Engineering) เราต้องมีทั้งเทสต์ที่ยืนยันว่าคำตอบถูกได้คะแนนเต็ม และเทสต์ที่ยืนยันว่าคำตอบผิดถูกหักคะแนนจริง",
        "ทำไมต้องทดสอบ `run_benchmark_suite` ด้วย `leaky_runner` ที่แกล้งตอบผิด?",
        "เพื่อพิสูจน์ว่าตัวประเมินสามารถจับ Cross-Tenant Leak และรายงานชื่อเคสที่ตกใน `failed_case_ids` ได้จริง",
      ),
    ],
  },

  takeaways: [
    "**15-Query Thai Golden Dataset** ต้องครอบคลุมครบ 5 หมวด: Policy RAG, BM25 Exact Identifiers, MCP Order Lookup, Cross-Tenant ACL Isolation และ HITL Refund + Out-of-Scope",
    "**4-Axis Case Assertion**: ตรวจครบทั้ง `route_ok`, `status_ok`, `citation_ok` และ `leak_free` (`forbidden_substrings`)",
    "**`@pytest.mark.parametrize` + `ids`** ช่วยให้รันและรายงานผลแยกทั้ง 15 ข้ออย่างชัดเจนโดยไม่หยุดค้างที่ข้อแรกที่ตก",
    "พรุ่งนี้ (Day 124) คือวันสุดท้ายของ Phase 4: **Phase 4 Checkpoint (`v0.4.0`)** ที่เราจะคำนวณ Recall@5, Faithfulness, Zero Leakage, Step Termination และ P95 Latency เพื่อตรวจรับระบบก่อนขึ้น Phase 5!",
  ],

  reviewCards: [
    rc(
      "d123-rc1",
      "5 หมวดหมู่ของคำถามในชุดทดสอบ 15 ข้อ (`PHASE4_BENCHMARK_CASES`) มีอะไรบ้าง?",
      "1) Policy RAG ทั่วไป, 2) BM25 Exact Code/Identifier (`PROMO-TH-88`, `ERR-PAY-402`), 3) MCP Order Lookup, 4) Cross-Tenant ACL Attempts, 5) HITL Refund Pause & Out-of-Scope Abstention",
    ),
    rc(
      "d123-rc2",
      "4 แกนที่ `evaluate_single_case` ใช้ตัดสินว่าเคสนั้นผ่าน (`passed=True`) มีอะไรบ้าง?",
      "`route_ok` (เลือกสายถูก), `status_ok` (สถานะสุดท้ายถูก), `citation_ok` (อ้างอิง `[doc_id#chunk]` ถูก), และ `leak_free` (ไม่มีคำใน `forbidden_substrings` รั่วไหล)",
    ),
    rc(
      "d123-rc3",
      "พารามิเตอร์ `ids=lambda c: c.case_id` ใน `@pytest.mark.parametrize` ช่วยอะไรเวลาดีบัก?",
      "ทำให้ชื่อเทสต์ในรายงาน `pytest -v` แสดงเป็นชื่อเคสที่สื่อความหมาย เช่น `[q10_cross_tenant_order_leak]` แทนที่จะเป็น `[case9]`",
    ),
    rc(
      "d123-rc4",
      "ทำไมจึงต้องมีฟิลด์ `forbidden_substrings` ในแต่ละ `BenchmarkCase`?",
      "เพื่อยืนยันแบบ Deterministic ว่าข้อมูลลับหรือตัวเลขของผู้เช่ารายอื่นไม่ปรากฏอยู่ในข้อความคำตอบของบอทแม้แต่คำเดียว",
    ),
  ],

  sources: [
    {
      label: "pytest Documentation — How to parametrize fixtures and test functions",
      href: "https://docs.pytest.org/en/stable/how-to/parametrize.html",
    },
    {
      label: "Anthropic Docs — Developing Golden Datasets & Empirical Evaluations",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/develop-tests",
    },
    {
      label: "LangGraph Documentation — Evaluating Agent Trajectories & Final States",
      href: "https://docs.langchain.com/oss/python/langgraph/overview",
    },
  ],

  glossary: ["golden-dataset", "parametrize", "pytest", "rag", "mcp", "langgraph"],
});
